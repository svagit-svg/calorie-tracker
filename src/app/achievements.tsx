'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { createClient } from './supabase/client'

type Achievement = {
  type: string
  unlocked_at: string
}

const ALL_ACHIEVEMENTS = [
  { type: 'first_photo', emoji: '📸', title: 'Первый шаг', desc: 'Распознайте первое блюдо' },
  { type: 'streak_3', emoji: '🔥', title: '3 дня подряд', desc: 'Записывайте питание 3 дня подряд' },
  { type: 'streak_7', emoji: '🏆', title: 'Неделя подряд', desc: '7 дней без пропусков' },
  { type: 'streak_30', emoji: '💎', title: 'Месяц подряд', desc: '30 дней без пропусков' },
  { type: 'week_in_norm', emoji: '⚖️', title: 'Неделя в норме', desc: '7 дней в пределах нормы калорий' },
  { type: 'minus_1kg', emoji: '📉', title: 'Минус 1 кг', desc: 'Похудели на 1 кг от начального веса' },
  { type: 'photos_10', emoji: '🌟', title: '10 распознаваний', desc: 'Распознали 10 блюд' },
  { type: 'photos_50', emoji: '👨‍🍳', title: 'Гурман', desc: 'Распознали 50 блюд' },
]

type Props = {
  onBack: () => void
  userId: string
  streak: number
}

export default function AchievementsScreen({ onBack, userId, streak }: Props) {
  const supabase = createClient()
  const [unlocked, setUnlocked] = useState<Achievement[]>([])

  useEffect(() => {
    supabase.from('achievements').select('*').eq('user_id', userId)
      .then(({ data }) => { if (data) setUnlocked(data) })
  }, [userId])

  const isUnlocked = (type: string) => unlocked.some(a => a.type === type)
  const unlockedDate = (type: string) => {
    const a = unlocked.find(a => a.type === type)
    return a ? new Date(a.unlocked_at).toLocaleDateString('ru-RU') : null
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-8">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">Ачивки</h1>
        <span className="text-orange-500 font-bold">{unlocked.length}/{ALL_ACHIEVEMENTS.length}</span>
      </div>

      {/* Streak */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🔥</span>
          <div>
            <p className="text-4xl font-bold">{streak}</p>
            <p className="text-orange-100">дней подряд</p>
          </div>
        </div>
        <p className="text-orange-100 text-sm mt-2">
          {streak === 0 ? 'Начните записывать питание каждый день!' :
           streak < 7 ? `Ещё ${7 - streak} дней до ачивки "Неделя подряд"` :
           'Отличный результат, продолжайте!'}
        </p>
      </div>

      {/* Achievements grid */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {ALL_ACHIEVEMENTS.map(a => {
          const done = isUnlocked(a.type)
          const date = unlockedDate(a.type)
          return (
            <div key={a.type} className={`bg-white rounded-2xl p-4 shadow-sm transition-all ${done ? '' : 'opacity-50'}`}>
              <div className={`text-4xl mb-2 ${done ? '' : 'grayscale'}`} style={{ filter: done ? '' : 'grayscale(1)' }}>
                {a.emoji}
              </div>
              <p className="font-bold text-sm text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
              {done && date && (
                <p className="text-xs text-orange-400 mt-2">✓ {date}</p>
              )}
              {!done && (
                <p className="text-xs text-gray-300 mt-2">Не получена</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
