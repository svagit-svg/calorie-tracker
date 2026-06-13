export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'



export async function POST(req: NextRequest) {
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })
  const user = await requireAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized', reply: 'Требуется авторизация' }, { status: 401 })

  try {
    const { message, context } = await req.json()

    const systemPrompt = `Ты персональный AI нутрициолог. Отвечай кратко, по делу, на русском языке.
Ты знаешь данные пользователя:
- Дневная норма калорий: ${context.dailyGoal} ккал
- Съедено сегодня: ${context.totalCalories} ккал (белки: ${context.totalProtein}г, углеводы: ${context.totalCarbs}г, жиры: ${context.totalFat}г)
- Осталось до нормы: ${context.remaining} ккал
- Блюда сегодня: ${context.meals.map((m: any) => m.name).join(', ') || 'ничего не добавлено'}
- Цель пользователя: ${context.goal === 'lose' ? 'похудеть' : context.goal === 'gain' ? 'набрать массу' : 'поддерживать вес'}

Давай конкретные советы на основе реальных данных пользователя. Не используй markdown. Будь дружелюбным и мотивирующим.`

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      maxTokens: 300,
    })

    const reply = response.choices?.[0]?.message?.content as string || 'Не удалось получить ответ'
    return NextResponse.json({ reply })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error', reply: 'Произошла ошибка, попробуйте ещё раз' })
  }
}
