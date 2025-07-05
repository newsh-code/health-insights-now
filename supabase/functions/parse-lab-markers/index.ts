import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { ocrText } = await req.json();
    console.log('Received OCR text for parsing');

    if (!ocrText || typeof ocrText !== 'string' || ocrText.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'No OCR text provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `
You are a medical data extractor. Given the OCR text from a lab report, extract only valid lab markers into a **pure JSON array**.

✅ Rules:
- Include only genuine lab test results with numeric values
- Skip personal info like name, age, gender, date
- Each marker must include:
  • "name" (string)
  • "value" (number)
  • "unit" (string, optional)
  • "reference_range" (string, optional, like "80-120")
  • "status" (low, normal, or high based on value vs. range)

❌ Do NOT include markdown (no triple backticks)
❌ Do NOT include explanations or extra text

OCR Text:
"""${ocrText}"""

Return:
[
  {
    "name": "Hemoglobin",
    "value": 132,
    "unit": "g/L",
    "reference_range": "130–170",
    "status": "normal"
  },
  ...
]
`;

    console.log('Sending request to OpenAI for lab marker parsing');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You extract clean medical data. You return only raw JSON arrays with no markdown, no commentary, no prose.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiContent = data.choices[0].message.content;
    console.log('AI response received:', aiContent.slice(0, 300));

    // Clean markdown if necessary
    aiContent = aiContent.trim();
    if (aiContent.startsWith("```")) {
      aiContent = aiContent.replace(/```json|```/g, '').trim();
    }

    // Attempt to parse
    let labMarkers: LabMarker[] = [];
    try {
      labMarkers = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI parser');
    }

    // Validate
    const validMarkers = labMarkers.filter(marker =>
      marker.name &&
      typeof marker.name === 'string' &&
      typeof marker.value === 'number' &&
      !isNaN(marker.value)
    );

    console.log(`✅ Parsed ${validMarkers.length} valid lab markers`);

    return new Response(JSON.stringify({ labMarkers: validMarkers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-lab-markers function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});