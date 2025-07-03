// /api/generate-insights.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { user_info, lab_values } = await req.json()

  const messages = [
    {
      role: "system",
      content: `
You are a helpful health insight assistant. Your job is to interpret a user's blood test results and return a set of simple, accurate, and encouraging insights — in language a non-expert can understand.

Given a list of lab values and optional user context (age, sex, health goals, activity level), do the following:
1. Identify markers that are low, high, or borderline based on the provided reference ranges.
2. For each flagged marker, return:
   - A short explanation of what the result might mean, using calm and supportive language.
   - One clear, general lifestyle recommendation — based on diet, supplements, sleep, exercise, or stress reduction.
   - Optionally tie the recommendation to the user's goal (e.g., boosting energy, improving focus).
   - Avoid medical terms like 'disease' or 'risk' unless necessary.

Return your response as a JSON array with this format:
[
  {
    "marker": "Marker Name",
    "status": "low | high | borderline | normal",
    "insight": "Brief, layperson-friendly explanation of the marker and what it may indicate.",
    "recommendation": "One simple tip or suggestion for the user to consider (not medical advice).",
    "group": "diet | lifestyle | supplement | sleep | exercise"
  }
]

Close the output with this disclaimer:
“This is not medical advice. For informational and educational use only.”
      `
    },
    {
      role: "user",
      content: JSON.stringify({ user_info, lab_values })
    }
  ]

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.7
    })
  })

  const data = await response.json()
  return NextResponse.json({ insights: data.choices?.[0]?.message?.content })
}