import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import { requireAuth } from '../../supabase/server'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { dailyGoal, goal, activity } = await req.json()

    const goalText = { lose: 'похудение (дефицит калорий ~300 ккал)', maintain: 'поддержание веса', gain: 'набор мышечной массы (профицит ~200 ккал)' }[goal as string] || 'поддержание веса'
    const activityText = { low: 'низкая (сидячая работа)', moderate: 'умеренная (прогулки, лёгкие тренировки)', high: 'высокая (интенсивные тренировки)' }[activity as string] || 'умеренная'

    const proteinG = Math.round(dailyGoal * 0.28 / 4)
    const fatG = Math.round(dailyGoal * 0.28 / 9)
    const carbG = Math.round(dailyGoal * 0.44 / 4)

    const prompt = `Составь план питания на 7 дней. Всё на русском языке.

Параметры:
- Цель: ${goalText}
- Норма калорий: ${dailyGoal} ккал/день
- Активность: ${activityText}
- Белки: ~${proteinG}г, жиры: ~${fatG}г, углеводы: ~${carbG}г

Верни ТОЛЬКО валидный JSON (без markdown, без комментариев):
{
  "days": [
    {
      "day": "Понедельник",
      "total": 2000,
      "meals": [
        {"type":"breakfast","emoji":"🥣","name":"Овсяная каша с бананом","calories":380,"protein":12,"carbs":65,"fat":8,"grams":350},
        {"type":"lunch","emoji":"🍲","name":"Куриный суп с лапшой","calories":320,"protein":28,"carbs":30,"fat":8,"grams":400},
        {"type":"snack","emoji":"🍎","name":"Яблоко и горсть орехов","calories":180,"protein":4,"carbs":20,"fat":10,"grams":120},
        {"type":"dinner","emoji":"🥩","name":"Гречка с котлетой из индейки","calories":480,"protein":38,"carbs":45,"fat":12,"grams":450}
      ]
    }
  ]
}

Требования к блюдам:
- Преимущественно русская/советская кухня: борщ, щи, гречка, овсянка, творог, котлеты, пельмени, омлет, салат оливье, вареники и т.д.
- Разнообразие — не повторяй одно блюдо более 2 раз за неделю
- Сумма calories всех meals каждого дня должна равняться total
- Реалистичные порции в граммах
- Распределение: завтрак 25%, обед 35%, ужин 30%, перекус 10%
- В поле name указывай конкретное блюдо с ингредиентами, не просто "Каша"`

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      maxTokens: 3000,
    })

    const content = response.choices?.[0]?.message?.content as string || ''
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json(result)
  } catch (e) {
    console.error('meal-plan error:', e)
    return NextResponse.json({ error: 'Не удалось составить план' }, { status: 500 })
  }
}
