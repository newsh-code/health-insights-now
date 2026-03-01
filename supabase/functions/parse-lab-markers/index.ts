import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LabMarker {
  name: string;
  value: number;
  unit?: string;
  reference_range?: string;
  status?: 'low' | 'normal' | 'high';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, media_type } = await req.json();

    if (!file || typeof file !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid `file` field (expected base64 string).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!media_type || !supportedTypes.includes(media_type)) {
      return new Response(JSON.stringify({ error: `Unsupported media type: ${media_type}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build the appropriate Claude content block for PDF or image
    const fileBlock = media_type === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file } }
      : { type: 'image', source: { type: 'base64', media_type, data: file } };

    const prompt = `Extract all lab test results from this document.

Return ONLY a valid JSON array — no markdown, no code fences, no explanation.

Rules:
- Include only genuine lab test results with numeric values
- Skip patient demographics (name, DOB, address, ordering physician, etc.)
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

Return ONLY the JSON array.`;

    console.log(`Calling Claude for lab marker extraction (${media_type})`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey!,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    let content: string = data.content?.[0]?.text ?? '';

    // Strip markdown fences if present
    content = content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let labMarkers: LabMarker[] = [];
    try {
      labMarkers = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      console.error('Raw content:', content.slice(0, 500));
      throw new Error('Invalid JSON response from Claude');
    }

    const validMarkers = labMarkers.filter(
      m => m.name && typeof m.name === 'string' && typeof m.value === 'number' && !isNaN(m.value)
    );

    console.log(`Extracted ${validMarkers.length} valid lab markers`);

    return new Response(JSON.stringify({ labMarkers: validMarkers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-lab-markers:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
