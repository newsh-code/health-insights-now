import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BATCH_SIZE = 20; // markers per Claude call — keeps output well within token limits

interface LabMarker {
  name: string;
  value: number;
  unit?: string;
  reference_range?: string;
  status?: 'low' | 'normal' | 'high';
}

interface UserInfo {
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  goals?: string;
  activity?: 'Sedentary' | 'Active' | 'Athlete';
}

interface MarkerAnalysis {
  name: string;
  status: 'low' | 'normal' | 'high';
  explanation: string;
  conversation_starter: string;
}

interface OverallInsights {
  summary: string;
  lifestyle_recommendations: {
    diet: string[];
    exercise: string[];
    sleep: string[];
    stress: string[];
  };
  urgent_flags: string[];
  disclaimer: string;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Call Anthropic and return the raw response text. Throws on network/API error. */
async function callClaude(
  apiKey: string,
  system: string,
  userPrompt: string,
  maxTokens: number,
  tag: string,
): Promise<string> {
  console.log(`[analyze-blood-work] ${tag}: calling Claude, max_tokens=${maxTokens}`);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  console.log(`[analyze-blood-work] ${tag}: Anthropic status ${res.status}`);

  if (!res.ok) {
    const body = await res.text();
    console.error(`[analyze-blood-work] ${tag}: Anthropic error body:`, body);
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? '';
  console.log(`[analyze-blood-work] ${tag}: raw response length ${text.length}`);
  console.log(`[analyze-blood-work] ${tag}: raw response FULL:`, text);
  return text;
}

/** Extract a JSON array from Claude output regardless of surrounding prose or fences. */
function extractJsonArray(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) return trimmed;
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    if (inner.startsWith('[')) return inner;
  }
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  return trimmed;
}

/** Extract a JSON object from Claude output regardless of surrounding prose or fences. */
function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    if (inner.startsWith('{')) return inner;
  }
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  return trimmed;
}

function formatMarkerLine(m: LabMarker): string {
  return (
    `- ${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''}` +
    `${m.reference_range ? ` (ref: ${m.reference_range})` : ''}` +
    `${m.status ? ` [${m.status}]` : ''}`
  );
}

// ── Clinical direction guidance (shared across prompts) ───────────────────────

const CLINICAL_DIRECTION_GUIDANCE = `
IMPORTANT — clinical direction of markers:
Not all above-range values are negative, and not all below-range values are positive. Evaluate each result by its clinical direction, not just whether it deviates from the reference range.

Markers where ABOVE range is optimal or beneficial:
- HDL Cholesterol: above range is cardioprotective — describe it positively, set status to "normal"
- HDL % of total cholesterol (HDL ratio): above range is protective — treat as "normal"
- eGFR (estimated Glomerular Filtration Rate): above range indicates excellent kidney function — treat as "normal"
- Vitamin D: above range up to approximately 150 ng/mL (375 nmol/L) is optimal — treat as "normal"; only flag as concerning above clearly toxic levels

Markers where ABOVE range warrants attention but is NOT urgent in the same way as liver enzymes:
- Ferritin: mildly elevated ferritin is worth discussing with a doctor (may indicate inflammation, iron overload, or lifestyle factors) but should not be urgently flagged unless very markedly elevated (e.g., >1000 µg/L). Use measured, non-alarming language.

General principle: before labelling any result as "high" or "low", consider whether a deviation in that direction is clinically meaningful or potentially beneficial for this patient. An athlete with slightly elevated RBC or haemoglobin, or a patient with above-range HDL, should receive an explanation that reflects the clinical reality — not generic concern about being outside a population-derived reference range.
`.trim();

// ── Phase 1: per-marker analysis in batches ───────────────────────────────────

async function analyzeMarkerBatch(
  markers: LabMarker[],
  userInfo: UserInfo,
  apiKey: string,
  batchIndex: number,
): Promise<MarkerAnalysis[]> {
  const tag = `batch-${batchIndex}`;
  const userCtx = `Patient: Age ${userInfo.age ?? 'unknown'}, Sex ${userInfo.sex ?? 'unknown'}, Activity ${userInfo.activity ?? 'unknown'}, Goal: ${userInfo.goals ?? 'general health'}`;
  const markersText = markers.map(formatMarkerLine).join('\n');

  const prompt = `${userCtx}

Analyze these ${markers.length} lab markers for this patient.

${markersText}

${CLINICAL_DIRECTION_GUIDANCE}

Return ONLY a JSON array — no markdown, no code fences, no explanation. Each object must have exactly these fields:
- "name": the marker name exactly as written above
- "status": "low", "normal", or "high" — apply clinical direction rules above before assigning; a result that is above range but clinically beneficial (e.g. HDL, eGFR, Vitamin D within safe limits) should be "normal"
- "explanation": 2-3 plain-English sentences about what this result means for this patient, personalised to their profile; if a result is above range but clinically positive, say so clearly
- "conversation_starter": a specific, natural question this patient could ask their doctor about this marker

Your entire response must be ONLY the JSON array, starting with [ and ending with ].`;

  const raw = await callClaude(
    apiKey,
    'You analyze lab results and return structured JSON arrays. Return only valid JSON, no prose, no markdown.',
    prompt,
    4000, // ~180 tokens × 20 markers = 3600, with headroom
    tag,
  );

  const extracted = extractJsonArray(raw);
  console.log(`[analyze-blood-work] ${tag}: extracted candidate (first 300 chars):`, extracted.slice(0, 300));

  const parsed: MarkerAnalysis[] = JSON.parse(extracted);
  console.log(`[analyze-blood-work] ${tag}: parsed ${parsed.length} marker analyses`);
  return parsed;
}

// ── Phase 2: overall summary, lifestyle recs, urgent flags ───────────────────

async function generateOverallInsights(
  allMarkers: LabMarker[],
  userInfo: UserInfo,
  apiKey: string,
): Promise<OverallInsights> {
  const tag = 'summary';
  const userCtx = `Patient: Age ${userInfo.age ?? 'unknown'}, Sex ${userInfo.sex ?? 'unknown'}, Activity ${userInfo.activity ?? 'unknown'}, Goal: ${userInfo.goals ?? 'general health'}`;
  const markersSummary = allMarkers.map(formatMarkerLine).join('\n');

  const prompt = `${userCtx}

Full lab panel (${allMarkers.length} markers):
${markersSummary}

${CLINICAL_DIRECTION_GUIDANCE}

Based on the complete panel, return ONLY a JSON object — no markdown, no code fences — with these fields:

{
  "summary": "<2-3 sentence overall interpretation of the panel, personalised to this patient's profile and goals; acknowledge any positively out-of-range results as strengths>",
  "lifestyle_recommendations": {
    "diet": ["<specific, actionable recommendation>"],
    "exercise": ["<specific recommendation>"],
    "sleep": ["<specific recommendation>"],
    "stress": ["<specific recommendation>"]
  },
  "urgent_flags": ["<only include markers that are critically abnormal in a clinically harmful direction and warrant prompt medical evaluation — do NOT include markers that are above range but clinically beneficial (HDL, eGFR, Vitamin D within safe limits) — omit array items if none>"],
  "disclaimer": "This analysis is for educational purposes only and is not a substitute for professional medical advice. Please consult with your healthcare provider before making any changes to your health routine."
}

Your entire response must be ONLY the JSON object, starting with { and ending with }.`;

  const raw = await callClaude(
    apiKey,
    'You summarize lab panels and return structured JSON objects. Return only valid JSON, no prose, no markdown.',
    prompt,
    1500,
    tag,
  );

  const extracted = extractJsonObject(raw);
  console.log(`[analyze-blood-work] ${tag}: extracted candidate (first 300 chars):`, extracted.slice(0, 300));

  const parsed: OverallInsights = JSON.parse(extracted);
  console.log(`[analyze-blood-work] ${tag}: summary parsed successfully`);
  return parsed;
}

// ── Request handler ───────────────────────────────────────────────────────────

console.log('[analyze-blood-work] Function booted');

serve(async (req) => {
  console.log(`[analyze-blood-work] ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate API key
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('[analyze-blood-work] ANTHROPIC_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: ANTHROPIC_API_KEY not set.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('[analyze-blood-work] ANTHROPIC_API_KEY present, length:', anthropicApiKey.length);

    // 2. Parse body
    let user_info: UserInfo;
    let lab_markers: LabMarker[];
    try {
      const body = await req.json();
      user_info = body.user_info ?? {};
      lab_markers = body.lab_markers;
    } catch (err) {
      console.error('[analyze-blood-work] Failed to parse request body:', err);
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!lab_markers || lab_markers.length === 0) {
      return new Response(JSON.stringify({ error: 'No lab markers provided.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[analyze-blood-work] Processing ${lab_markers.length} markers in batches of ${BATCH_SIZE}`);

    // 3. Phase 1 — per-marker analysis in batches
    const allMarkerAnalyses: MarkerAnalysis[] = [];
    const batches: LabMarker[][] = [];
    for (let i = 0; i < lab_markers.length; i += BATCH_SIZE) {
      batches.push(lab_markers.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i++) {
      console.log(`[analyze-blood-work] Running batch ${i} (${batches[i].length} markers)`);
      try {
        const batchResult = await analyzeMarkerBatch(batches[i], user_info, anthropicApiKey, i);
        allMarkerAnalyses.push(...batchResult);
      } catch (batchErr) {
        console.error(`[analyze-blood-work] Batch ${i} failed:`, batchErr);
        throw new Error(`Marker analysis batch ${i} failed: ${batchErr}`);
      }
    }

    console.log(`[analyze-blood-work] All batches done — ${allMarkerAnalyses.length} marker analyses`);

    // 4. Phase 2 — overall summary (single lightweight call over all markers)
    let overallInsights: OverallInsights;
    try {
      overallInsights = await generateOverallInsights(lab_markers, user_info, anthropicApiKey);
    } catch (summaryErr) {
      console.error('[analyze-blood-work] Summary call failed:', summaryErr);
      throw new Error(`Overall summary failed: ${summaryErr}`);
    }

    // 5. Merge and return
    const result = {
      markers: allMarkerAnalyses,
      ...overallInsights,
    };

    console.log(`[analyze-blood-work] Done — returning ${result.markers.length} markers`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (topLevelErr) {
    console.error('[analyze-blood-work] Unhandled error:', topLevelErr);
    return new Response(JSON.stringify({ error: String(topLevelErr) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
