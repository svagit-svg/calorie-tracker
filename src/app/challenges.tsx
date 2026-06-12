'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { createClient } from './supabase/client'

type Challenge = {
  id: string
  emoji: string
  title: string
  desc: string
  current: number
  target: number
}

type Props = {
  onBack: () => void
  userId: string
  streak: number
  dailyGoal: number
}

export default function ChallengesScreen({ onBack, userId, streak, dailyGoal }: Props) {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadChallenges() }, [])

  const loadChallenges = async () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: meals } = await supabase.from('meals').select('*')
      .eq('user_id', userId)
      .gte('eaten_at', weekAgo.toISOString())

    const byDay: Record<string, number> = {}
    meals?.forEach(m => {
      const day = m.eaten_at.split('T')[0]
      byDay[day] = (byDay[day] || 0) + m.calories
    })

    const daysLogged = Object.keys(byDay).length
    const daysInNorm = Object.values(byDay).filter(cal => cal > 0 && cal <= dailyGoal).length

    let waterDays = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `water_${d.toISOString().split('T')[0]}`
      if (Number(localStorage.getItem(key) || 0) >= 6) waterDays++
    }

    setChallenges([
      {
        id: 'streak',
        emoji: '🔥',
        title: 'Стрик 7 дней',
        desc: 'Записывай еду 7 дней подряд без пропусков',
        current: Math.min(streak, 7),
        target: 7,
      },
      {
        id: 'log',
        emoji: '📅',
        title: 'Активная неделя',
        desc: 'Заполняй дневник хотя бы 5 дней из 7',
        current: Math.min(daysLogged, 5),
        target: 5,
      },
      {
        id: 'norm',
        emoji: '🎯',
        title: '5 дней в норме',
        desc: 'Укладывайся в норму калорий 5 дней за неделю',
        current: Math.min(daysInNorm, 5),
        target: 5,
      },
      {
        id: 'water',
        emoji: '💧',
        title: 'Водный режим',
        desc: 'Пей не менее 6 стаканов воды 5 дней из 7',
        current: Math.min(waterDays, 5),
        target: 5,
      },
    ])
    setLoading(false)
  }

  const completedCount = challenges.filter(c => c.current >= c.target).length

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto pb-24">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">Челленджи недели</h1>
        {!loading && (
          <span className="text-sm font-semibold text-orange-500">{completedCount}/4 выполнено</span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Загрузка...</div>
      ) : (
        <>
          {/* Hero banner */}
          <div className="mx-4 mt-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white">
            <p className="text-orange-100 text-sm mb-1">Эта неделя</p>
            <div className="flex items-end gap-2">
              <p className="text-5xl font-bold">{completedCount}</p>
              <p className="text-orange-200 text-lg mb-1">из 4 челленджей</p>
            </div>
            <div className="mt-3 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(completedCount / 4) * 100}%` }} />
            </div>
          </div>

          {/* Challenges list */}
          <div className="mx-4 mt-3 space-y-3">
            {challenges.map(c => {
              const done = c.current >= c.target
              const pct = Math.min(c.current / c.target * 100, 100)
              return (
                <div key={c.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm transition-all ${done ? 'border-2 border-green-400' : 'border border-gray-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${done ? 'bg-green-50' : 'bg-orange-50'}`}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                        {done
                          ? <span className="text-green-500 text-xs font-bold whitespace-nowrap">✓ Выполнено!</span>
                          : <span className="text-gray-400 text-xs whitespace-nowrap">{c.current}/{c.target}</span>
                        }
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${done ? 'bg-green-400' : 'bg-orange-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 px-4">
            Результаты за последние 7 дней · обновляется каждый день
          </p>
        </>
      )}
    </div>
  )
}
