// pages/api/generate-insights.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_info, lab_values } = req.body

  const messages = [
    {
      role: "system",
      content: "[INSERT SYSTEM PROMPT HERE]"
    },
    {
      role: "user",
      content: JSON.stringify({ user_info, lab_values })
    }
  ]

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.7
    })
  })

  const data = await response.json()
  res.status(200).json({ insights: data.choices?.[0]?.message?.content })
}