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

interface UserInfo {
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  goals?: string;
  activity?: 'Sedentary' | 'Active' | 'Athlete';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_info, lab_markers }: { user_info: UserInfo; lab_markers: LabMarker[] } = await req.json();

    if (!lab_markers || lab_markers.length === 0) {
      return new Response(JSON.stringify({ error: 'No lab markers provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userContext = `Patient Profile:
- Age: ${user_info?.age ?? 'Not specified'}
- Biological Sex: ${user_info?.sex ?? 'Not specified'}
- Activity Level: ${user_info?.activity ?? 'Not specified'}
- Health Goal: ${user_info?.goals ?? 'General health'}`;

    const markersText = lab_markers
      .map(m =>
        `- ${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ''}` +
        `${m.reference_range ? ` (reference: ${m.reference_range})` : ''}` +
        `${m.status ? ` [${m.status}]` : ''}`
      )
      .join('\n');

    const prompt = `${userContext}

Lab Results:
${markersText}

Analyze these lab results for this specific patient. Return ONLY valid JSON (no markdown, no code fences) matching this exact structure:

{
  "markers": [
    {
      "name": "<marker name exactly as provided above>",
      "status": "<low|normal|high — use the provided status if given, otherwise determine from value vs reference range>",
      "explanation": "<2-3 sentences in plain English explaining what this result means for this patient. Be accessible, factual, and non-alarming. Personalize where possible.>",
      "conversation_starter": "<A specific, natural-sounding question this patient could ask their doctor at their next appointment about this marker. Start with 'Doctor,' or 'I noticed...'>"
    }
  ],
  "summary": "<2-3 sentence overall interpretation of the panel, personalized to this patient's profile and goals>",
  "lifestyle_recommendations": {
    "diet": ["<specific, actionable recommendation based on these results>"],
    "exercise": ["<specific recommendation>"],
    "sleep": ["<specific recommendation>"],
    "stress": ["<specific recommendation>"]
  },
  "urgent_flags": ["<only include if a value is critically abnormal and warrants prompt medical evaluation — omit if none>"],
  "disclaimer": "This analysis is for educational purposes only and is not a substitute for professional medical advice. Please consult with your healthcare provider before making any changes to your health routine."
}

Include all ${lab_markers.length} markers in the markers array. Tailor the language to the patient's age, sex, activity level, and health goal.`;

    console.log('Calling Claude API for blood work analysis');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system:
          'You are a clinical health educator helping patients understand their lab results. Provide clear, plain-English explanations personalized to the patient. Never diagnose or prescribe. Return only valid JSON with no markdown formatting.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    let content: string = data.content?.[0]?.text ?? '';

    // Strip markdown code fences if the model includes them despite instructions
    content = content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      console.error('Raw content:', content.slice(0, 500));
      throw new Error('Invalid JSON response from Claude');
    }

    console.log(`Analysis complete: ${analysisResult.markers?.length ?? 0} markers processed`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-blood-work function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
