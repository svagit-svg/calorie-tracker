'use client'

import { useState } from 'react'
import { ChevronLeft, RefreshCw, Sparkles } from 'lucide-react'

type PlanMeal = {
  type: string
  emoji: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  grams: number
}

type PlanDay = {
  day: string
  total: number
  meals: PlanMeal[]
}

const TYPE_LABELS: Record<string, string> = {
  breakfast: '🌅 Завтрак',
  lunch: '☀️ Обед',
  snack: '🍎 Перекус',
  dinner: '🌙 Ужин',
}

type Props = {
  onBack: () => void
  dailyGoal: number
  goal: 'lose' | 'maintain' | 'gain'
  activity: string
  onAddMeal: (meal: { name: string; calories: number; protein: number; carbs: number; fat: number; emoji: string; meal_type: string }) => Promise<void>
}

export default function MealPlannerScreen({ onBack, dailyGoal, goal, activity, onAddMeal }: Props) {
  const [plan, setPlan] = useState<PlanDay[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeDay, setActiveDay] = useState(0)
  const [added, setAdded] = useState<Set<string>>(new Set())

  const goalLabels = { lose: 'Похудение', maintain: 'Поддержание', gain: 'Набор массы' }
  const activityLabels: Record<string, string> = { low: 'Низкая', moderate: 'Умеренная', high: 'Высокая' }

  const generate = async () => {
    setLoading(true)
    setError('')
    setAdded(new Set())
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyGoal, goal, activity }),
      })
      const data = await res.json()
      if (data.error || !data.days) { setError('Не удалось составить план. Попробуй ещё раз.'); return }
      setPlan(data.days)
      setActiveDay(0)
    } catch {
      setError('Ошибка сети. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (meal: PlanMeal, dayIdx: number) => {
    const key = `${dayIdx}-${meal.name}`
    await onAddMeal({ name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, emoji: meal.emoji, meal_type: meal.type })
    setAdded(prev => new Set([...prev, key]))
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">AI Меню на неделю</h1>
        {plan && !loading && (
          <button onClick={generate} className="text-orange-500 p-1 active:opacity-60">
            <RefreshCw size={20} />
          </button>
        )}
      </div>

      {/* Pre-generate screen */}
      {!plan && !loading && (
        <div className="flex flex-col items-center px-6 pt-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-5xl mb-5 shadow-lg shadow-orange-200">
            🤖
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Персональное меню</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            AI составит план питания на 7 дней с учётом твоей цели, нормы калорий и активности
          </p>

          <div className="w-full space-y-2 mb-6">
            {[
              ['🎯', 'Цель', goalLabels[goal] || goal],
              ['🔥', 'Норма', `${dailyGoal} ккал/день`],
              ['⚡', 'Активность', activityLabels[activity] || activity],
            ].map(([emoji, label, value]) => (
              <div key={label} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <span className="text-xl">{emoji}</span>
                <span className="text-gray-500 text-sm flex-1">{label}</span>
                <span className="font-semibold text-gray-900 text-sm">{value}</span>
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button onClick={generate}
            className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-98 transition-transform">
            <Sparkles size={20} />
            Составить меню
          </button>
          <p className="text-xs text-gray-400 mt-3">Генерация занимает ~15 секунд</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center pt-24 text-center px-6">
          <div className="text-6xl mb-5 animate-bounce">🤖</div>
          <p className="font-semibold text-gray-900 text-lg mb-2">Составляю меню...</p>
          <p className="text-gray-400 text-sm">AI подбирает блюда под твои цели</p>
          <div className="mt-6 flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Plan */}
      {plan && !loading && (
        <>
          {/* Day tabs */}
          <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {plan.map((day, i) => (
                <button key={i} onClick={() => setActiveDay(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeDay === i ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400 bg-gray-100'
                  }`}>
                  {day.day.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-4 mt-4 space-y-3">
            {/* Day header */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-4 flex items-center justify-between text-white">
              <div>
                <p className="text-orange-100 text-xs">{plan[activeDay]?.day}</p>
                <p className="text-3xl font-bold">{plan[activeDay]?.total}</p>
                <p className="text-orange-200 text-xs">ккал за день</p>
              </div>
              <div className="text-right text-orange-100 text-xs space-y-1">
                {plan[activeDay]?.meals.map(m => (
                  <div key={m.type}>{TYPE_LABELS[m.type]?.split(' ')[1] || m.type}: {m.calories}</div>
                ))}
              </div>
            </div>

            {/* Meals */}
            {plan[activeDay]?.meals.map((meal, mi) => {
              const key = `${activeDay}-${meal.name}`
              const isAdded = added.has(key)
              return (
                <div key={mi} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{meal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{TYPE_LABELS[meal.type] || meal.type}</p>
                      <p className="font-semibold text-gray-900 leading-snug">{meal.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{meal.grams}г · Б:{meal.protein}г У:{meal.carbs}г Ж:{meal.fat}г</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-lg">{meal.calories}</p>
                      <p className="text-xs text-gray-400">ккал</p>
                    </div>
                  </div>
                  <button onClick={() => handleAdd(meal, activeDay)} disabled={isAdded}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isAdded
                        ? 'bg-green-50 text-green-500'
                        : 'bg-orange-50 text-orange-500 active:bg-orange-100'
                    }`}>
                    {isAdded ? '✓ Добавлено в дневник' : '+ Добавить в дневник'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
