import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

export async function POST(req: NextRequest) {
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
          text: `Определи еду на фото и верни JSON без markdown:\n{"name":"название на русском","calories":число,"protein":число,"carbs":число,"fat":число,"emoji":"эмодзи"}\nТолько цифры без единиц. Если еда не определяется, верни {"error":"не удалось определить"}`
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
  } catch {
    return NextResponse.json({ error: 'Не удалось распознать еду' }, { status: 400 })
  }
}
