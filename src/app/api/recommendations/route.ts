import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { meals, dailyGoal, goal, totalCalories, totalProtein, totalCarbs, totalFat } = await req.json()

    const remaining = dailyGoal - totalCalories
    const proteinTarget = Math.round(dailyGoal * 0.3 / 4)
    const carbTarget = Math.round(dailyGoal * 0.45 / 4)
    const fatTarget = Math.round(dailyGoal * 0.25 / 9)
    const proteinDiff = proteinTarget - totalProtein
    const carbDiff = carbTarget - totalCarbs
    const fatDiff = fatTarget - totalFat

    const prompt = `Ты дружелюбный нутрициолог-помощник в фитнес-приложении. Дай персональный совет на вечер.

Цель пользователя: ${goal === 'lose' ? 'похудеть' : goal === 'gain' ? 'набрать мышечную массу' : 'поддерживать вес'}
Калории: съедено ${totalCalories} из ${dailyGoal} ккал (${remaining > 0 ? `осталось ${remaining} ккал` : `превышение на ${-remaining} ккал`})
БЖУ сегодня: Б ${totalProtein}г (норма ${proteinTarget}г, ${proteinDiff > 0 ? `не хватает ${proteinDiff}г` : 'норма выполнена'}), У ${totalCarbs}г (норма ${carbTarget}г), Ж ${totalFat}г (норма ${fatTarget}г)
Блюда за день: ${meals.map((m: any) => m.name).join(', ') || 'ничего не записано'}

Задача: на основе РЕАЛЬНОГО состояния рациона дай 1 конкретный и полезный совет. Не общие слова — конкретно что съесть/сделать вечером, почему это важно для его цели.

Верни ТОЛЬКО JSON без markdown:
{"emoji":"💪","title":"Заголовок 4-6 слов","tip":"Совет 1-2 предложения. Конкретные продукты, граммы, действия."}`

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      maxTokens: 150,
    })

    const content = response.choices?.[0]?.message?.content as string || ''
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ emoji: '💡', title: 'Итог дня', tip: 'Не забудьте выпить воду и хорошо отдохнуть!' })
  }
}
