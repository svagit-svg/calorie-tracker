export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'

export async function POST(req: NextRequest) {
  try {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY not set' }, { status: 500 })
  const client = new Mistral({ apiKey })
  const user = await requireAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { image } = await req.json()

  const response = await client.chat.complete({
    model: 'pixtral-12b-2409',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Ты профессиональный нутрициолог и эксперт по распознаванию еды.

Определи блюдо на фото и верни КБЖУ строго на 100 граммов продукта.

Верни ТОЛЬКО валидный JSON без markdown и пояснений:
{"name":"точное название на русском","calories":число,"protein":число,"carbs":число,"fat":число,"emoji":"эмодзи"}

Требования:
- Название: конкретное, на русском (не "суп", а "Борщ со сметаной"; не "салат", а "Греческий салат")
- ВСЕ значения КБЖУ — строго на 100г, не на порцию
- Используй данные из российских таблиц калорийности (Скурихин, USDA)
- Эмодзи: наиболее подходящий для конкретного блюда
- Если на фото не еда или не удаётся определить: {"error":"не удалось определить"}
- Никакого текста вне JSON, никаких \`\`\`json`
        },
        { type: 'image_url', imageUrl: image }
      ]
    }],
  })

  const text = response.choices?.[0]?.message?.content || ''
  const str = typeof text === 'string' ? text : ''
  const match = str.match(/\{[\s\S]*\}/)
  try {
    return NextResponse.json(JSON.parse(match?.[0] || str))
  } catch (parseErr) {
    return NextResponse.json({ error: 'Не удалось распознать еду' }, { status: 400 })
  }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
