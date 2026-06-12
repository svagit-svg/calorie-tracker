'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, TrendingUp, Utensils, Flame, Calendar, Share2 } from 'lucide-react'
import { createClient } from './supabase/client'
import ShareCard from './share-card'

type Props = {
  onBack: () => void
  userId: string
  dailyGoal: number
  userName: string
  streak: number
}

type DayData = {
  date: string
  calories: number
  meals: number
}


export default function StatsScreen({ onBack, userId, dailyGoal, userName, streak }: Props) {
  const supabase = createClient()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [days, setDays] = useState<DayData[]>([])
  const [favDish, setFavDish] = useState('')
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    const daysCount = period === 'week' ? 7 : 30
    const from = new Date()
    from.setDate(from.getDate() - daysCount)

    const { data } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('eaten_at', from.toISOString())
      .order('eaten_at', { ascending: true })

    if (!data) { setLoading(false); return }

    const grouped: Record<string, { calories: number; meals: number }> = {}
    const dishCount: Record<string, number> = {}

    data.forEach(meal => {
      const day = meal.eaten_at.split('T')[0]
      if (!grouped[day]) grouped[day] = { calories: 0, meals: 0 }
      grouped[day].calories += meal.calories
      grouped[day].meals += 1
      dishCount[meal.name] = (dishCount[meal.name] || 0) + 1
    })

    const result: DayData[] = []
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      result.push({ date: key, calories: grouped[key]?.calories || 0, meals: grouped[key]?.meals || 0 })
    }

    setDays(result)
    const sorted = Object.entries(dishCount).sort((a, b) => b[1] - a[1])
    setFavDish(sorted[0]?.[0] || '')
    setLoading(false)
  }

  const activeDays = days.filter(d => d.calories > 0)
  const avgCalories = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length) : 0
  const avgMeals = activeDays.length ? Math.round(activeDays.reduce((s, d) => s + d.meals, 0) / activeDays.length) : 0
  const maxCalories = Math.max(...days.map(d => d.calories), dailyGoal)

  const dayLabels: Record<string, string> = { '0': 'Вс', '1': 'Пн', '2': 'Вт', '3': 'Ср', '4': 'Чт', '5': 'Пт', '6': 'Сб' }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">Статистика</h1>
        {!loading && activeDays.length > 0 && (
          <button onClick={() => setShowShare(true)} className="text-orange-400 p-1">
            <Share2 size={22} />
          </button>
        )}
      </div>

      {showShare && (
        <ShareCard
          type="stats"
          onClose={() => setShowShare(false)}
          name={userName}
          period={period === 'week' ? '7 дней' : '30 дней'}
          avgCalories={avgCalories}
          dailyGoal={dailyGoal}
          daysTracked={activeDays.length}
          totalDays={days.length}
          streak={streak}
          favDish={favDish}
        />
      )}

      {/* Period toggle */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-1 flex shadow-sm">
        {(['week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${period === p ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>
            {p === 'week' ? '7 дней' : '30 дней'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Загрузка...</div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-orange-400" />
                <span className="text-xs text-gray-400">Среднее в день</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{avgCalories}</p>
              <p className="text-xs text-gray-400">ккал</p>
              <div className={`mt-2 text-xs font-medium ${avgCalories <= dailyGoal ? 'text-green-500' : 'text-red-400'}`}>
                {avgCalories <= dailyGoal ? `На ${dailyGoal - avgCalories} меньше нормы` : `На ${avgCalories - dailyGoal} больше нормы`}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Utensils size={16} className="text-orange-400" />
                <span className="text-xs text-gray-400">Приёмов пищи</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{avgMeals}</p>
              <p className="text-xs text-gray-400">в среднем в день</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-orange-400" />
                <span className="text-xs text-gray-400">Дней с записями</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{activeDays.length}</p>
              <p className="text-xs text-gray-400">из {days.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-orange-400" />
                <span className="text-xs text-gray-400">Любимое блюдо</span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{favDish || '—'}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">Калории по дням</p>
            <div className="flex items-end gap-1 h-32">
              {(period === 'week' ? days : days.filter((_, i) => i % 3 === 0)).map((day, i) => {
                const height = day.calories > 0 ? Math.max((day.calories / maxCalories) * 100, 4) : 2
                const isOver = day.calories > dailyGoal
                const dateObj = new Date(day.date + 'T12:00:00')
                const label = period === 'week'
                  ? dayLabels[String(dateObj.getDay())]
                  : String(dateObj.getDate())
                const isToday = day.date === new Date().toISOString().split('T')[0]
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                      <div
                        className={`w-full rounded-t-lg transition-all ${day.calories === 0 ? 'bg-gray-100' : isOver ? 'bg-red-400' : 'bg-orange-400'} ${isToday ? 'ring-2 ring-orange-600' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className={`text-xs ${isToday ? 'font-bold text-orange-500' : 'text-gray-400'}`}>{label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block"/>В норме</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"/>Превышение</span>
            </div>
          </div>

          {activeDays.length === 0 && (
            <div className="mx-4 mt-4 text-center text-gray-400 py-4">
              Нет данных за выбранный период
            </div>
          )}

        </>
      )}
    </div>
  )
}
