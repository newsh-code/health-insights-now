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
  // Handle CORS preflight requests
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

    const prompt = `Extract structured lab marker data from this medical lab report text. Only include rows that represent actual lab test results with numeric values.

Rules:
- Include only genuine lab markers (blood tests, chemistry panels, etc.)
- Skip metadata like patient age, date, lab ID, specimen info
- Each marker must have a name and numeric value
- Include units and reference ranges when available
- Determine status (low/normal/high) based on value vs reference range
- Output valid JSON array only

OCR Text:
${ocrText}

Return JSON array with this structure:
[
  {
    "name": "Test Name",
    "value": 123.4,
    "unit": "mg/dL",
    "reference_range": "80-120",
    "status": "normal"
  }
]`;

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
            content: 'You are a medical data extraction specialist. Extract only valid lab markers from medical reports. Return valid JSON arrays only.' 
          },
          { role: 'user', content: prompt }
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
    const aiResponse = data.choices[0].message.content;

    console.log('AI parsing response received');

    // Parse the JSON response
    let labMarkers: LabMarker[] = [];
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        labMarkers = JSON.parse(jsonMatch[0]);
      } else {
        labMarkers = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI parser');
    }

    // Validate the parsed markers
    const validMarkers = labMarkers.filter(marker => 
      marker.name && 
      typeof marker.name === 'string' && 
      marker.name.trim().length > 0 &&
      typeof marker.value === 'number' && 
      !isNaN(marker.value)
    );

    console.log(`Parsed ${validMarkers.length} valid lab markers`);

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