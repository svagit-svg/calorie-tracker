export const runtime = 'edge'

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

    const prompt = `Ты профессиональный нутрициолог. Пользователь голосом назвал что съел: "${text}"

Извлеки все блюда/продукты и рассчитай их КБЖУ с учётом типичной порции.

Правила расчёта:
- calories, protein, carbs, fat — итоговые значения ЗА ПОРЦИЮ (не на 100г)
- grams — вес порции в граммах
- Типичные порции русской кухни: тарелка супа 350г, второе блюдо 250-300г, кусок хлеба 30г, стакан сока/молока 200г, банан 120г, яблоко 150г, шоколадка 50г
- Если пользователь сам назвал количество (штук, грамм, мл) — используй его
- Название: конкретное, на русском (не "суп", а "Куриный суп с лапшой")

Верни ТОЛЬКО валидный JSON массив без markdown:
[
  {"name":"Борщ со сметаной","calories":280,"protein":10,"carbs":28,"fat":13,"emoji":"🍲","grams":350},
  {"name":"Ржаной хлеб","calories":75,"protein":2,"carbs":15,"fat":1,"emoji":"🍞","grams":30}
]

Если текст не про еду или ничего не распознано — верни [].`

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
