
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
  units?: string;
  reference_range?: string;
}

interface UserInfo {
  age?: number;
  sex?: 'M' | 'F' | 'Other';
  goals?: string;
  activity?: 'Sedentary' | 'Active' | 'Athlete';
}

interface RequestBody {
  user_info: UserInfo;
  lab_values: LabMarker[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_info, lab_values }: RequestBody = await req.json();

    console.log('Received request:', { user_info, lab_values });

    if (!lab_values || lab_values.length === 0) {
      return new Response(JSON.stringify({ error: 'No lab values provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create personalized prompt
    const userContext = `
User Profile:
- Age: ${user_info.age || 'Not specified'}
- Sex: ${user_info.sex || 'Not specified'}
- Activity Level: ${user_info.activity || 'Not specified'}
- Primary Goal: ${user_info.goals || 'General health'}
`;

    const labValuesText = lab_values.map(marker => 
      `${marker.name}: ${marker.value}${marker.units ? ` ${marker.units}` : ''}${marker.reference_range ? ` (Reference: ${marker.reference_range})` : ''}`
    ).join('\n');

    const prompt = `You are a clinical health assistant providing educational health insights based on lab results. 

${userContext}

Lab Results:
${labValuesText}

Please provide:
1. A brief interpretation of the most notable biomarkers (focus on values outside normal ranges)
2. Personalized lifestyle recommendations for diet, exercise, sleep, and stress management
3. Any urgent flags if values are critically high or low (but emphasize this is educational, not medical advice)

Keep your response clear, actionable, and encouraging. Format with line breaks for readability.

IMPORTANT: Always include this disclaimer at the end: "This analysis is for educational purposes only and is not a substitute for professional medical advice. Please consult with your healthcare provider before making any changes to your health routine."`;

    console.log('Sending request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful clinical health assistant that provides educational insights based on lab results.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    console.log('Generated insights successfully');

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
