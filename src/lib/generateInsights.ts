type UserInfo = {
  age?: number
  sex?: string
  goals?: string
  activity_level?: string
}

type LabValue = {
  name: string
  value: number
  units?: string
  reference_range?: string
}

export async function generateInsights(
  user_info: UserInfo,
  lab_values: LabValue[]
): Promise<string> {
  const res = await fetch('https://rmknhbjyzhojtgcjmbvc.functions.supabase.co/generate-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_info, lab_values })
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('Error generating insights:', error)
    throw new Error('Failed to generate insights')
  }

  const { insights } = await res.json()
  return insights
}