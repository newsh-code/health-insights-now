import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LabMarker {
  name: string;
  value: number;
  unit?: string;
  reference_range?: string;
  status?: 'low' | 'normal' | 'high';
}

console.log('[parse-lab-markers] Function booted');

serve(async (req) => {
  try {
    console.log(`[parse-lab-markers] Handler invoked — method: ${req.method}`);

    if (req.method === 'OPTIONS') {
      console.log('[parse-lab-markers] Returning CORS preflight');
      return new Response(null, { headers: corsHeaders });
    }

    // --- 1. Validate API key ---
    console.log('[parse-lab-markers] Step 1: checking ANTHROPIC_API_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('[parse-lab-markers] ANTHROPIC_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: ANTHROPIC_API_KEY not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('[parse-lab-markers] ANTHROPIC_API_KEY present, length:', anthropicApiKey.length);

    // --- 2. Read body as raw text first so we can log the size before parsing ---
    console.log('[parse-lab-markers] Step 2: reading body');
    console.log('[parse-lab-markers] Content-Type:', req.headers.get('content-type'));
    console.log('[parse-lab-markers] Authorization present:', !!req.headers.get('authorization'));

    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch (textErr) {
      console.error('[parse-lab-markers] Failed to read body as text:', textErr);
      return new Response(JSON.stringify({ error: 'Failed to read request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('[parse-lab-markers] Raw body byte length:', rawBody.length);

    // --- 3. Parse JSON ---
    console.log('[parse-lab-markers] Step 3: parsing JSON');
    let file: string;
    let media_type: string;
    try {
      const body = JSON.parse(rawBody);
      file = body.file;
      media_type = body.media_type;
    } catch (parseErr) {
      console.error('[parse-lab-markers] JSON.parse failed:', parseErr);
      console.error('[parse-lab-markers] Body preview (first 200 chars):', rawBody.slice(0, 200));
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('[parse-lab-markers] media_type:', media_type, '| file base64 length:', file?.length ?? 0);

    // --- 4. Validate fields ---
    if (!file || typeof file !== 'string') {
      console.error('[parse-lab-markers] Missing or invalid `file` field');
      return new Response(JSON.stringify({ error: 'Missing or invalid `file` field (expected base64 string).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!media_type || !supportedTypes.includes(media_type)) {
      console.error('[parse-lab-markers] Unsupported media_type:', media_type);
      return new Response(JSON.stringify({ error: `Unsupported file type: ${media_type}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- 5. Build Claude content block ---
    console.log('[parse-lab-markers] Step 5: building Claude request');
    const fileBlock = media_type === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file } }
      : { type: 'image', source: { type: 'base64', media_type: media_type, data: file } };

    const prompt = `Extract all lab test results from this document.

IMPORTANT — document format:
- This document may have been converted from HTML or a web page. You will likely see HTML tags (<html>, <body>, <table>, <tr>, <td>, <div>, <span>, etc.), CSS styles, JavaScript, navigation menus, headers, footers, and other web markup.
- Completely ignore all HTML tags, CSS, JavaScript, and page-structure markup.
- Focus ONLY on the actual lab test data — typically found in table rows or structured lists within the content.

Return ONLY a valid JSON array — no markdown, no code fences, no explanation, no preamble.

Rules:
- Include only genuine lab test results with numeric values
- Skip patient demographics (name, DOB, address, ordering physician, etc.)
- Skip page elements like navigation, logos, disclaimers, and contact information
- Each entry must have:
  • "name" (string) — the test name
  • "value" (number) — the numeric result
  • "unit" (string, optional) — e.g. "mg/dL", "g/L"
  • "reference_range" (string, optional) — e.g. "3.5–5.2"
  • "status" ("low", "normal", or "high" based on value vs. reference range)

Example output format:
[
  { "name": "Hemoglobin", "value": 132, "unit": "g/L", "reference_range": "130–170", "status": "normal" },
  { "name": "Glucose", "value": 112, "unit": "mg/dL", "reference_range": "70–99", "status": "high" }
]

Your entire response must be ONLY the JSON array — starting with [ and ending with ]. No other text.`;

    // --- 6. Call Claude ---
    console.log('[parse-lab-markers] Step 6: calling Anthropic API');
    let anthropicResponse: Response;
    try {
      anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          system: 'You extract structured lab marker data from medical documents. Return ONLY valid JSON arrays. No explanations, no markdown, no commentary.',
          messages: [{
            role: 'user',
            content: [fileBlock, { type: 'text', text: prompt }],
          }],
        }),
      });
    } catch (fetchErr) {
      console.error('[parse-lab-markers] Network error reaching Anthropic:', fetchErr);
      return new Response(JSON.stringify({ error: 'Failed to reach Anthropic API.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[parse-lab-markers] Step 7: Anthropic status:', anthropicResponse.status);

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error('[parse-lab-markers] Anthropic error:', errorBody);
      return new Response(JSON.stringify({ error: `Anthropic API error ${anthropicResponse.status}: ${errorBody}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- 8. Parse and validate Claude response ---
    console.log('[parse-lab-markers] Step 8: parsing Claude response');
    const anthropicData = await anthropicResponse.json();
    const rawClaudeText: string = anthropicData.content?.[0]?.text ?? '';

    // Log the FULL raw response before any manipulation so we can see exactly
    // what Claude returned when debugging parse failures.
    console.log('[parse-lab-markers] Claude raw response length:', rawClaudeText.length);
    console.log('[parse-lab-markers] Claude raw response FULL:', rawClaudeText);

    // Robustly extract a JSON array from whatever Claude returned.
    // Handles: clean array, markdown code fence, array embedded in prose.
    const extractJsonArray = (text: string): string => {
      const trimmed = text.trim();

      // 1. Already a bare JSON array
      if (trimmed.startsWith('[')) return trimmed;

      // 2. Wrapped in a markdown code fence — ```json ... ``` or ``` ... ```
      const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (fenceMatch) {
        const inner = fenceMatch[1].trim();
        if (inner.startsWith('[')) return inner;
      }

      // 3. JSON array embedded somewhere in surrounding prose
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) return arrayMatch[0];

      // Nothing found — return trimmed text so the JSON.parse below produces
      // a descriptive error
      return trimmed;
    };

    const extracted = extractJsonArray(rawClaudeText);
    console.log('[parse-lab-markers] Extracted candidate (first 500 chars):', extracted.slice(0, 500));

    let labMarkers: LabMarker[] = [];
    try {
      labMarkers = JSON.parse(extracted);
    } catch (jsonErr) {
      console.error('[parse-lab-markers] JSON.parse failed:', jsonErr);
      console.error('[parse-lab-markers] Candidate that failed to parse:', extracted);
      return new Response(JSON.stringify({ error: 'Claude returned invalid JSON.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validMarkers = labMarkers.filter(
      m => m.name && typeof m.name === 'string' && typeof m.value === 'number' && !isNaN(m.value)
    );

    console.log(`[parse-lab-markers] Done — ${validMarkers.length} of ${labMarkers.length} markers valid`);

    if (validMarkers.length === 0) {
      console.warn('[parse-lab-markers] Zero valid markers — returning 422');
      return new Response(
        JSON.stringify({
          error: 'no_lab_markers',
          message: "We couldn't find any lab markers in this file. Please make sure you're uploading a blood test results document (PDF or photo of a lab report).",
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ labMarkers: validMarkers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (topLevelErr) {
    console.error('[parse-lab-markers] Unhandled top-level error:', topLevelErr);
    return new Response(JSON.stringify({ error: String(topLevelErr) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
