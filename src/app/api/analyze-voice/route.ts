import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

    const prompt = `Пользователь сказал: "${text}"

Извлеки все блюда и продукты из этого текста. Для каждого блюда определи название, калории, белки, углеводы, жиры и подходящий эмодзи.
Учитывай типичные размеры порций для русской кухни (тарелка борща ~350мл, кусок хлеба ~30г и т.д.).

Верни ТОЛЬКО валидный JSON массив без markdown:
[
  {"name": "Борщ", "calories": 180, "protein": 8, "carbs": 20, "fat": 7, "emoji": "🍲", "grams": 350},
  {"name": "Хлеб", "calories": 75, "protein": 2, "carbs": 15, "fat": 1, "emoji": "🍞", "grams": 30}
]

Если блюдо не распознано или текст не про еду — верни пустой массив [].`

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const content = response.choices?.[0]?.message?.content as string || '[]'
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const dishes = JSON.parse(clean)

    return NextResponse.json({ dishes })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Parse error', dishes: [] })
  }
}
