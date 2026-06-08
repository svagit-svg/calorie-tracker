'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

type Profile = {
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  goal: 'lose' | 'maintain' | 'gain'
  activity: 'low' | 'medium' | 'high'
}

type Props = {
  onComplete: (profile: Profile, goal: number) => void
}

function calcCalories(p: Profile): number {
  // Mifflin-St Jeor
  const bmr = p.gender === 'male'
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
    : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
  const activity = { low: 1.2, medium: 1.55, high: 1.9 }[p.activity]
  const tdee = bmr * activity
  const adjust = { lose: -400, maintain: 0, gain: 300 }[p.goal]
  return Math.round(tdee + adjust)
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Profile>({
    gender: 'male', age: 25, height: 175, weight: 70,
    goal: 'maintain', activity: 'medium'
  })

  const steps = [
    {
      title: 'Ваш пол',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[['male', '👨', 'Мужчина'], ['female', '👩', 'Женщина']].map(([val, emoji, label]) => (
            <button key={val} onClick={() => setProfile(p => ({ ...p, gender: val as 'male' | 'female' }))}
              className={`p-6 rounded-2xl border-2 text-center transition-all ${profile.gender === val ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="font-medium">{label}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Возраст',
      content: (
        <div className="text-center">
          <div className="flex items-center justify-center gap-6 my-8">
            <button onClick={() => setProfile(p => ({ ...p, age: Math.max(10, p.age - 1) }))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold flex items-center justify-center">−</button>
            <div>
              <span className="text-7xl font-bold text-orange-500">{profile.age}</span>
              <span className="text-2xl text-gray-400 ml-2">лет</span>
            </div>
            <button onClick={() => setProfile(p => ({ ...p, age: Math.min(100, p.age + 1) }))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold flex items-center justify-center">+</button>
          </div>
        </div>
      )
    },
    {
      title: 'Рост и вес',
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <label className="text-sm text-gray-400 block mb-2">Рост (см)</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setProfile(p => ({ ...p, height: Math.max(100, p.height - 1) }))}
                className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold flex items-center justify-center">−</button>
              <span className="text-4xl font-bold text-orange-500 flex-1 text-center">{profile.height}</span>
              <button onClick={() => setProfile(p => ({ ...p, height: Math.min(250, p.height + 1) }))}
                className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold flex items-center justify-center">+</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <label className="text-sm text-gray-400 block mb-2">Вес (кг)</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setProfile(p => ({ ...p, weight: Math.max(30, p.weight - 1) }))}
                className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold flex items-center justify-center">−</button>
              <span className="text-4xl font-bold text-orange-500 flex-1 text-center">{profile.weight}</span>
              <button onClick={() => setProfile(p => ({ ...p, weight: Math.min(300, p.weight + 1) }))}
                className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold flex items-center justify-center">+</button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Ваша цель',
      content: (
        <div className="space-y-3">
          {[
            ['lose', '🔥', 'Похудеть', '-400 ккал от нормы'],
            ['maintain', '⚖️', 'Поддержать вес', 'Норма калорий'],
            ['gain', '💪', 'Набрать массу', '+300 ккал к норме'],
          ].map(([val, emoji, label, desc]) => (
            <button key={val} onClick={() => setProfile(p => ({ ...p, goal: val as Profile['goal'] }))}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${profile.goal === val ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
              <span className="text-3xl">{emoji}</span>
              <div className="text-left">
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-400">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Уровень активности',
      content: (
        <div className="space-y-3">
          {[
            ['low', '🛋️', 'Низкий', 'Сидячая работа, мало движения'],
            ['medium', '🚶', 'Средний', 'Тренировки 3-4 раза в неделю'],
            ['high', '🏃', 'Высокий', 'Ежедневные тренировки'],
          ].map(([val, emoji, label, desc]) => (
            <button key={val} onClick={() => setProfile(p => ({ ...p, activity: val as Profile['activity'] }))}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${profile.activity === val ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
              <span className="text-3xl">{emoji}</span>
              <div className="text-left">
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-400">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      )
    },
  ]

  const isLast = step === steps.length - 1
  const calories = calcCalories(profile)

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col px-6 pt-12 pb-8">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">{steps[step].title}</h2>

      <div className="flex-1">{steps[step].content}</div>

      {isLast && (
        <div className="bg-orange-50 rounded-2xl p-4 my-4 text-center">
          <p className="text-gray-500 text-sm">Ваша норма калорий</p>
          <p className="text-4xl font-bold text-orange-500">{calories}</p>
          <p className="text-gray-400 text-sm">ккал в день</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center">
            <ChevronLeft size={24} className="text-gray-400" />
          </button>
        )}
        <button onClick={() => isLast ? onComplete(profile, calories) : setStep(s => s + 1)}
          className="flex-1 bg-orange-500 text-white rounded-2xl py-4 font-medium flex items-center justify-center gap-2">
          {isLast ? 'Начать!' : 'Далее'}
          {!isLast && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  )
}
