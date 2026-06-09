'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, Scale, Target, Droplets, Dumbbell, Brain, Share2 } from 'lucide-react'
import { createClient } from './supabase/client'
import ShareCard from './share-card'

type WeightLog = { id: string; weight: number; logged_at: string }
type Profile = { weight: number; height: number; age: number; gender: string; activity: string }

type Props = {
  onBack: () => void
  userId: string
  startWeight: number
  currentGoal: 'lose' | 'maintain' | 'gain'
  onWeightUpdate: (weight: number) => void
  userName: string
  streak: number
}

function calcMetrics(p: Profile) {
  const hm = p.height / 100
  const bmi = +(p.weight / (hm * hm)).toFixed(1)
  const bmiLabel = bmi < 18.5 ? 'Дефицит' : bmi < 25 ? 'Норма' : bmi < 30 ? 'Избыток' : 'Ожирение'
  const bmiColor = bmi < 18.5 ? 'text-blue-500' : bmi < 25 ? 'text-green-500' : bmi < 30 ? 'text-yellow-500' : 'text-red-500'
  const hi = p.height / 2.54
  const idealWeight = +(p.gender === 'male' ? 50 + 2.3 * (hi - 60) : 45.5 + 2.3 * (hi - 60)).toFixed(1)
  const water = +(p.weight * 35 / 1000).toFixed(1)
  const proteinCoef = ['active', 'very_active'].includes(p.activity) ? 1.8 : p.activity === 'moderate' ? 1.3 : 0.9
  const protein = Math.round(p.weight * proteinCoef)
  const actMult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }
  const bmr = Math.round(p.gender === 'male' ? 10*p.weight + 6.25*p.height - 5*p.age + 5 : 10*p.weight + 6.25*p.height - 5*p.age - 161)
  const tdee = Math.round(bmr * (actMult[p.activity] || 1.2))
  const avgBmr = Math.round(p.gender === 'male' ? 10*80 + 6.25*178 - 5*p.age + 5 : 10*68 + 6.25*166 - 5*p.age - 161)
  return { bmi, bmiLabel, bmiColor, idealWeight, water, protein, tdee, bmr, avgBmr }
}

export default function WeightScreen({ onBack, userId, startWeight, currentGoal, onWeightUpdate, userName, streak }: Props) {
  const supabase = createClient()
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [newWeight, setNewWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [chartMode, setChartMode] = useState<'weight' | 'bmi'>('weight')
  const [showShare, setShowShare] = useState(false)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [logsRes, profileRes] = await Promise.all([
      supabase.from('weight_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: true }).limit(30),
      supabase.from('profiles').select('weight,height,age,gender,activity').eq('id', userId).single()
    ])
    if (logsRes.data) setLogs(logsRes.data)
    if (profileRes.data?.height && profileRes.data?.age) setProfile(profileRes.data as Profile)
    setLoading(false)
  }

  const logWeight = async () => {
    const w = parseFloat(newWeight)
    if (!w || w < 20 || w > 400) return
    const existing = logs.find(l => l.logged_at === logDate)
    if (existing) {
      await supabase.from('weight_logs').update({ weight: w }).eq('id', existing.id)
      setLogs(prev => prev.map(l => l.logged_at === logDate ? { ...l, weight: w } : l))
    } else {
      const { data } = await supabase.from('weight_logs').insert({ user_id: userId, weight: w, logged_at: logDate }).select().single()
      if (data) setLogs(prev => [...prev, data].sort((a,b) => a.logged_at.localeCompare(b.logged_at)))
    }
    const { error: profileErr } = await supabase.from('profiles').update({ weight: w }).eq('id', userId)
    if (profileErr) alert('Ошибка обновления профиля: ' + profileErr.message)
    if (profile) setProfile({ ...profile, weight: w })
    onWeightUpdate(w)
    setNewWeight('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const firstWeight = logs[0]?.weight || startWeight
  const lastWeight = logs[logs.length - 1]?.weight
  const diff = lastWeight ? +(lastWeight - firstWeight).toFixed(1) : 0

  // Weight chart
  const maxW = Math.max(...logs.map(l => l.weight), firstWeight) + 2
  const minW = Math.min(...logs.map(l => l.weight), firstWeight) - 2
  const chartH = 120
  const getYW = (w: number) => chartH - ((w - minW) / (maxW - minW)) * chartH

  // BMI chart
  const bmiLogs = profile ? logs.map(l => ({ ...l, bmi: +(l.weight / Math.pow(profile.height / 100, 2)).toFixed(1) })) : []
  const maxBmi = Math.max(...bmiLogs.map(l => l.bmi), 30) + 1
  const minBmi = Math.min(...bmiLogs.map(l => l.bmi), 18) - 1
  const getYB = (b: number) => chartH - ((b - minBmi) / (maxBmi - minBmi)) * chartH

  const metrics = profile ? calcMetrics(profile) : null
  const currentBmi = metrics?.bmi

  const dateLabels = (arr: WeightLog[]) =>
    arr.filter((_, i) => i === 0 || i === arr.length - 1 || i === Math.floor(arr.length / 2))
      .map(l => new Date(l.logged_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }))

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-8">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">Моё тело</h1>
        {metrics && lastWeight && (
          <button onClick={() => setShowShare(true)} className="text-orange-400 p-1">
            <Share2 size={22} />
          </button>
        )}
      </div>

      {showShare && metrics && lastWeight && (
        <ShareCard
          type="body"
          onClose={() => setShowShare(false)}
          name={userName}
          currentWeight={lastWeight}
          startWeight={firstWeight}
          bmi={metrics.bmi}
          bmiLabel={metrics.bmiLabel}
          goal={currentGoal}
          streak={streak}
        />
      )}

      {/* Stats */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-2">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">Старт</p>
          <p className="text-lg font-bold text-gray-700">{firstWeight}</p>
          <p className="text-xs text-gray-400">кг</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">Сейчас</p>
          <p className="text-lg font-bold text-orange-500">{lastWeight || '—'}</p>
          <p className="text-xs text-gray-400">кг</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">Изменение</p>
          <p className={`text-lg font-bold ${diff < 0 ? 'text-green-500' : diff > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {diff > 0 ? '+' : ''}{diff || '—'}
          </p>
          <p className="text-xs text-gray-400">кг</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">ИМТ</p>
          <p className={`text-lg font-bold ${metrics?.bmiColor || 'text-gray-400'}`}>{currentBmi || '—'}</p>
          <p className={`text-xs ${metrics?.bmiColor || 'text-gray-400'}`}>{metrics?.bmiLabel || ''}</p>
        </div>
      </div>

      {/* Chart toggle + chart */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Последние 30 дней</p>
          <div className="flex bg-gray-100 rounded-xl p-0.5">
            <button onClick={() => setChartMode('weight')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${chartMode === 'weight' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}>
              Вес
            </button>
            <button onClick={() => setChartMode('bmi')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${chartMode === 'bmi' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}>
              ИМТ
            </button>
          </div>
        </div>

        {logs.length < 2 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Добавьте минимум 2 записи для графика</div>
        ) : chartMode === 'weight' ? (
          <div className="relative">
            <svg width="100%" height={chartH} viewBox={`0 0 ${Math.max(logs.length - 1, 1) * 40} ${chartH}`} preserveAspectRatio="none">
              <line x1="0" y1={getYW(firstWeight)} x2="10000" y2={getYW(firstWeight)} stroke="#fed7aa" strokeWidth="1" strokeDasharray="4,4" />
              <polyline fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round"
                points={logs.map((l, i) => `${i * 40},${getYW(l.weight)}`).join(' ')} />
              {logs.map((l, i) => <circle key={i} cx={i * 40} cy={getYW(l.weight)} r="4" fill="#f97316" />)}
            </svg>
            <div className="flex justify-between mt-1">
              {dateLabels(logs).map((d, i) => <span key={i} className="text-xs text-gray-400">{d}</span>)}
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* BMI zones */}
            <svg width="100%" height={chartH} viewBox={`0 0 ${Math.max(bmiLogs.length - 1, 1) * 40} ${chartH}`} preserveAspectRatio="none">
              {/* Zone lines */}
              {[18.5, 25, 30].map(z => (
                <line key={z} x1="0" y1={getYB(z)} x2="10000" y2={getYB(z)}
                  stroke={z === 18.5 ? '#93c5fd' : z === 25 ? '#86efac' : '#fca5a5'}
                  strokeWidth="1" strokeDasharray="4,4" />
              ))}
              <polyline fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round"
                points={bmiLogs.map((l, i) => `${i * 40},${getYB(l.bmi)}`).join(' ')} />
              {bmiLogs.map((l, i) => <circle key={i} cx={i * 40} cy={getYB(l.bmi)} r="4" fill="#f97316" />)}
            </svg>
            <div className="flex justify-between mt-1">
              {dateLabels(logs).map((d, i) => <span key={i} className="text-xs text-gray-400">{d}</span>)}
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-blue-300 border-dashed inline-block"/>18.5</span>
              <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-green-300 border-dashed inline-block"/>25</span>
              <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-red-300 border-dashed inline-block"/>30</span>
            </div>
          </div>
        )}
      </div>

      {/* Log weight */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-3">Записать вес</p>
        <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 mb-3" />
        <div className="flex gap-3">
          <div className="flex-1 flex items-center border border-gray-200 rounded-xl px-4">
            <input type="number" step="0.1" placeholder="70.5" value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              className="flex-1 py-3 outline-none text-lg font-bold" />
            <span className="text-gray-400">кг</span>
          </div>
          <button onClick={logWeight} className="bg-orange-500 text-white rounded-xl px-5 font-medium flex items-center gap-1">
            {saved ? '✓' : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* My metrics */}
      {metrics && (
        <div className="mx-4 mt-3">
          <p className="text-sm font-semibold text-gray-500 mb-2 px-1">Мои показатели</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1"><Scale size={16} className="text-orange-400" /><span className="text-xs text-gray-400">Индекс массы тела</span></div>
              <p className={`text-3xl font-bold ${metrics.bmiColor}`}>{metrics.bmi}</p>
              <p className={`text-xs font-medium mt-0.5 ${metrics.bmiColor}`}>{metrics.bmiLabel}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1"><Target size={16} className="text-orange-400" /><span className="text-xs text-gray-400">Идеальный вес</span></div>
              <p className="text-3xl font-bold text-gray-900">{metrics.idealWeight}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {Math.abs(profile!.weight - metrics.idealWeight) < 1 ? '🎯 Вы в норме!'
                  : profile!.weight > metrics.idealWeight ? `−${+(profile!.weight - metrics.idealWeight).toFixed(1)} кг до цели`
                  : `+${+(metrics.idealWeight - profile!.weight).toFixed(1)} кг до цели`}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1"><Droplets size={16} className="text-blue-400" /><span className="text-xs text-gray-400">Норма воды</span></div>
              <p className="text-3xl font-bold text-gray-900">{metrics.water}</p>
              <p className="text-xs text-gray-400">литров в день</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1"><Dumbbell size={16} className="text-orange-400" /><span className="text-xs text-gray-400">Норма белка</span></div>
              <p className="text-3xl font-bold text-gray-900">{metrics.protein}</p>
              <p className="text-xs text-gray-400">г в день</p>
            </div>
            <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Brain size={28} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Суточный расход калорий</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.tdee} <span className="text-base font-normal text-gray-400">ккал</span></p>
                <p className="text-xs text-gray-400 mt-0.5">Полный расход с учётом активности</p>
              </div>
            </div>
            <div className="col-span-2 bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-3">Сжигание калорий в покое</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 flex-shrink-0">Средний россиянин</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="h-full bg-gray-300 rounded-full" style={{ width: `${Math.min((metrics.avgBmr / Math.max(metrics.bmr, metrics.avgBmr)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-16 text-right">{metrics.avgBmr} ккал</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 flex-shrink-0">Ты</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className={`h-full rounded-full ${metrics.bmr >= metrics.avgBmr ? 'bg-orange-400' : 'bg-blue-400'}`}
                      style={{ width: `${Math.min((metrics.bmr / Math.max(metrics.bmr, metrics.avgBmr)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-16 text-right">{metrics.bmr} ккал</span>
                </div>
              </div>
              <p className={`text-xs mt-3 font-medium ${metrics.bmr >= metrics.avgBmr ? 'text-orange-500' : 'text-blue-500'}`}>
                {metrics.bmr >= metrics.avgBmr
                  ? `В покое ты сжигаешь на ${metrics.bmr - metrics.avgBmr} ккал больше среднего россиянина 💪`
                  : `В покое ты сжигаешь на ${metrics.avgBmr - metrics.bmr} ккал меньше среднего россиянина`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {logs.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">История</p>
          <div className="space-y-2">
            {[...logs].reverse().slice(0, 7).map(l => {
              const bmi = profile ? +(l.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : null
              return (
                <div key={l.id} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    {new Date(l.logged_at).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-3">
                    {bmi && <span className="text-xs text-gray-400">ИМТ {bmi}</span>}
                    <span className="font-bold text-gray-900">{l.weight} кг</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
