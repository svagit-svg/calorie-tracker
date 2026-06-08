import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { meals, dailyGoal, goal, totalCalories, totalProtein, totalCarbs, totalFat } = await req.json()

    const prompt = `Пользователь заполнил дневник питания за сегодня. Дай 1-2 конкретных совета на вечер.

Данные:
- Цель: ${goal === 'lose' ? 'похудеть' : goal === 'gain' ? 'набрать массу' : 'поддерживать вес'}
- Норма калорий: ${dailyGoal} ккал
- Съедено: ${totalCalories} ккал
- Белки: ${totalProtein}г, Углеводы: ${totalCarbs}г, Жиры: ${totalFat}г
- Блюда: ${meals.map((m: any) => m.name).join(', ') || 'ничего'}

Рекомендуемые нормы БЖУ: белки ~${Math.round(dailyGoal * 0.3 / 4)}г, углеводы ~${Math.round(dailyGoal * 0.45 / 4)}г, жиры ~${Math.round(dailyGoal * 0.25 / 9)}г.

Ответь в формате JSON:
{
  "emoji": "💪",
  "title": "Короткий заголовок (5-7 слов)",
  "tip": "Конкретный совет 1-2 предложения без markdown. Укажи конкретные продукты если нужно."
}

Только JSON, без лишнего текста.`

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
