export async function GET() {
  const apiKey = process.env.NOVELAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'NOVELAI_API_KEY が設定されていません' }, { status: 500 })
  }

  const res = await fetch('https://api.novelai.net/user/subscription', {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    return Response.json({ error: `NovelAI API エラー ${res.status}` }, { status: res.status })
  }

  const data = await res.json()
  const fixed: number = data.trainingStepsLeft?.fixedTrainingStepsLeft ?? 0
  const purchased: number = data.trainingStepsLeft?.purchasedTrainingSteps ?? 0
  return Response.json({ anlas: fixed + purchased })
}
