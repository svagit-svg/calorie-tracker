'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, LogOut, Lock, Mail, User } from 'lucide-react'
import { createClient } from './supabase/client'

function MaleAvatar() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mbg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#1e3a8a"/>
        </linearGradient>
        <clipPath id="mclip"><circle cx="40" cy="40" r="40"/></clipPath>
      </defs>
      <g clipPath="url(#mclip)">
        <rect width="80" height="80" fill="url(#mbg)"/>
        {/* Body — dark athletic tank, V-taper */}
        <path d="M-5 80 Q5 54 20 49 Q29 46 40 46 Q51 46 60 49 Q75 54 85 80Z" fill="#0f172a"/>
        <path d="M33 50 Q36 47 40 46.5 Q44 47 47 50 L45 55 Q43 57 40 57 Q37 57 35 55Z" fill="#1e293b"/>
        {/* Neck */}
        <path d="M35 44 Q35 52 40 53 Q45 52 45 44 Q42 45.5 40 45.5 Q38 45.5 35 44Z" fill="#f0a882"/>
        {/* Head */}
        <path d="M25 30 Q24 44 28 50 Q33 55 40 55 Q47 55 52 50 Q56 44 55 30 Q53 15 40 14 Q27 15 25 30Z" fill="#f0a882"/>
        {/* Ears */}
        <path d="M25 30 Q20 32 20 37 Q20 42 25 43" stroke="#f0a882" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M55 30 Q60 32 60 37 Q60 42 55 43" stroke="#f0a882" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {/* Hair — modern clean cut */}
        <path d="M25 29 Q25 12 40 11 Q55 12 55 29 Q52 16 40 15 Q28 16 25 29Z" fill="#1c1008"/>
        <ellipse cx="40" cy="16" rx="15" ry="6.5" fill="#1c1008"/>
        <path d="M25 27 Q22 21 24 16" stroke="#1c1008" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
        <path d="M55 27 Q58 21 56 16" stroke="#1c1008" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
        {/* Eyebrows — strong */}
        <path d="M29 27 Q33 24.5 37.5 25.5" stroke="#1c1008" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M42.5 25.5 Q47 24.5 51 27" stroke="#1c1008" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Eyes — almond shape */}
        <path d="M29.5 30.5 Q33.5 27 37.5 30.5 Q33.5 33.5 29.5 30.5Z" fill="#1c1008"/>
        <path d="M42.5 30.5 Q46.5 27 50.5 30.5 Q46.5 33.5 42.5 30.5Z" fill="#1c1008"/>
        <circle cx="33.5" cy="30" r="1.2" fill="white"/>
        <circle cx="46.5" cy="30" r="1.2" fill="white"/>
        {/* Nose */}
        <path d="M38.5 35 Q37 38.5 40 39.5 Q43 38.5 41.5 35" stroke="#d07858" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Smile */}
        <path d="M33.5 45 Q40 49.5 46.5 45" stroke="#c07050" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

function FemaleAvatar() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fbg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#9a3412"/>
        </linearGradient>
        <clipPath id="fclip"><circle cx="40" cy="40" r="40"/></clipPath>
      </defs>
      <g clipPath="url(#fclip)">
        <rect width="80" height="80" fill="url(#fbg)"/>
        {/* Body — sports crop top */}
        <path d="M-5 80 Q8 56 22 52 Q30 49 40 49 Q50 49 58 52 Q72 56 85 80Z" fill="#7c2d12"/>
        {/* Thin straps */}
        <rect x="34.5" y="44" width="3" height="8" rx="1.5" fill="#9a3412"/>
        <rect x="42.5" y="44" width="3" height="8" rx="1.5" fill="#9a3412"/>
        {/* Neck */}
        <path d="M36 43 Q36 51 40 52 Q44 51 44 43 Q42 44.5 40 44.5 Q38 44.5 36 43Z" fill="#f0a882"/>
        {/* Head — oval, gentle jaw */}
        <path d="M26 30 Q25 44 29 50 Q34 55.5 40 55.5 Q46 55.5 51 50 Q55 44 54 30 Q52 15 40 14 Q28 15 26 30Z" fill="#f0a882"/>
        {/* Ears */}
        <path d="M26 30 Q21 32 21 37 Q21 42 26 43" stroke="#f0a882" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M54 30 Q59 32 59 37 Q59 42 54 43" stroke="#f0a882" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {/* Hair — long, back layer */}
        <path d="M26 28 Q25 9 40 8 Q55 9 54 28 Q52 13 40 12 Q28 13 26 28Z" fill="#92400e"/>
        <ellipse cx="40" cy="13" rx="14.5" ry="7" fill="#92400e"/>
        {/* Left side hair flowing down */}
        <path d="M26 28 Q21 22 22 14" stroke="#92400e" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
        {/* Ponytail up and right */}
        <path d="M53 17 Q62 11 67 19 Q69 27 63 34 Q61 36 57 37" stroke="#92400e" strokeWidth="8" fill="none" strokeLinecap="round"/>
        {/* Hair band */}
        <circle cx="55" cy="22" r="4.5" fill="#f97316"/>
        <circle cx="55" cy="22" r="2.5" fill="#ea580c"/>
        {/* Eyebrows — arched */}
        <path d="M30 26 Q34 23 38 24" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M42 24 Q46 23 50 26" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Eyes — feminine almond + lash line */}
        <path d="M29.5 29.5 Q33.5 26 37.5 29.5 Q33.5 33 29.5 29.5Z" fill="#1c1008"/>
        <path d="M42.5 29.5 Q46.5 26 50.5 29.5 Q46.5 33 42.5 29.5Z" fill="#1c1008"/>
        <path d="M29.5 29.5 Q33.5 26.5 37.5 29.5" stroke="#1c1008" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M42.5 29.5 Q46.5 26.5 50.5 29.5" stroke="#1c1008" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="33.5" cy="29" r="1.2" fill="white"/>
        <circle cx="46.5" cy="29" r="1.2" fill="white"/>
        {/* Nose */}
        <path d="M38.5 34 Q37 37.5 40 38.5 Q43 37.5 41.5 34" stroke="#d07858" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        {/* Blush */}
        <ellipse cx="29" cy="37" rx="5" ry="3" fill="#fda4af" opacity="0.4"/>
        <ellipse cx="51" cy="37" rx="5" ry="3" fill="#fda4af" opacity="0.4"/>
        {/* Smile */}
        <path d="M34 43 Q40 47.5 46 43" stroke="#d06050" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

type ProfileData = {
  name: string
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  goal: 'lose' | 'maintain' | 'gain'
  activity: 'low' | 'medium' | 'high'
  daily_goal: number
  is_pro?: boolean
}

function calcCalories(p: ProfileData): number {
  const bmr = p.gender === 'male'
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
    : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
  const activity = { low: 1.2, medium: 1.55, high: 1.9 }[p.activity]
  const tdee = bmr * activity
  const adjust = { lose: -400, maintain: 0, gain: 300 }[p.goal]
  return Math.round(tdee + adjust)
}

type Props = {
  onBack: () => void
  onSignOut: () => void
  userId: string
  userEmail: string
  onGoalUpdate: (goal: number) => void
  onShowPaywall: () => void
}

export default function ProfileScreen({ onBack, onSignOut, userId, userEmail, onGoalUpdate, onShowPaywall }: Props) {
  const supabase = createClient()
  const [profile, setProfile] = useState<ProfileData>({
    name: '', gender: 'male', age: 25, height: 175, weight: 70,
    goal: 'maintain', activity: 'medium', daily_goal: 2000
  })
  const [saved, setSaved] = useState(false)
  const isLoaded = useRef(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.auth.getUser(),
      ])
      if (data) {
        const oauthName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
        const name = data.name || oauthName
        setProfile(p => ({ ...p, ...data, name }))
        if (!data.name && oauthName) {
          await supabase.from('profiles').update({ name: oauthName }).eq('id', userId)
        }
      }
      setTimeout(() => { isLoaded.current = true }, 0)
    }
    loadProfile()
  }, [userId])

  // Auto-save 1.5s after any profile change
  useEffect(() => {
    if (!isLoaded.current) return
    const timer = setTimeout(() => save(), 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const save = async () => {
    const goal = calcCalories(profile)
    await supabase.from('profiles').upsert({ id: userId, ...profile, daily_goal: goal })
    // Sync weight to weight_logs for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase.from('weight_logs').select('id').eq('user_id', userId).eq('logged_at', today).single()
    if (existing) {
      await supabase.from('weight_logs').update({ weight: profile.weight }).eq('id', existing.id)
    } else {
      await supabase.from('weight_logs').insert({ user_id: userId, weight: profile.weight, logged_at: today })
    }
    onGoalUpdate(goal)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')

  const deleteAccount = async () => {
    if (deleteEmail !== userEmail) return
    // Delete all user data
    await supabase.from('meals').delete().eq('user_id', userId)
    await supabase.from('weight_logs').delete().eq('user_id', userId)
    await supabase.from('achievements').delete().eq('user_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)
    // Sign out (account deletion requires server-side in Supabase, signing out is enough for now)
    await supabase.auth.signOut()
  }

  const changePassword = async () => {
    if (newPassword.length < 6) { setPasswordMsg('Минимум 6 символов'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordMsg('Ошибка: ' + error.message)
    else { setPasswordMsg('Пароль изменён!'); setNewPassword(''); setShowPasswordForm(false) }
    setTimeout(() => setPasswordMsg(''), 3000)
  }

  const calories = calcCalories(profile)
  const goals = { lose: 'Похудеть', maintain: 'Поддержать', gain: 'Набрать' }
  const activities = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">Профиль</h1>
        {saved && <span className="text-xs text-green-500 font-medium">✓ Сохранено</span>}
        <button onClick={onSignOut} className="text-gray-400"><LogOut size={20} /></button>
      </div>

      {/* Avatar + email */}
      <div className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-md">
            {profile.gender === 'male' ? <MaleAvatar /> : <FemaleAvatar />}
          </div>
          <div className="flex-1">
            <input
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Ваше имя"
              className="text-lg font-bold w-full outline-none border-b border-transparent focus:border-orange-300"
            />
            <div className="flex items-center gap-1 mt-1">
              <Mail size={12} className="text-gray-400" />
              <p className="text-gray-400 text-sm">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calorie goal */}
      <div className="mx-4 mt-3 bg-orange-500 rounded-2xl p-4 text-white text-center shadow-sm">
        <p className="text-orange-100 text-sm">Ваша норма калорий</p>
        <p className="text-4xl font-bold">{calories}</p>
        <p className="text-orange-100 text-sm">ккал в день</p>
      </div>

      {/* Subscription */}
      {profile.is_pro ? (
        <div className="mx-4 mt-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">👑</div>
          <div className="flex-1">
            <p className="font-bold text-white">PRO подписка активна</p>
            <p className="text-orange-100 text-xs">Безлимитные фото · AI чат · Поделиться итогами</p>
          </div>
        </div>
      ) : (
        <button onClick={onShowPaywall}
          className="mx-4 mt-3 w-[calc(100%-2rem)] bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🚀</div>
          <div className="flex-1">
            <p className="font-bold text-white">Перейти на PRO</p>
            <p className="text-orange-100 text-xs">от 99 ₽/нед · 299 ₽/мес · 1990 ₽/год</p>
          </div>
          <span className="text-white/70 text-xl">›</span>
        </button>
      )}

      {/* Body data */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Физические данные</h3>

        <div className="space-y-4">
          {/* Gender */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Пол</span>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(g => (
                <button key={g} onClick={() => setProfile(p => ({ ...p, gender: g }))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${profile.gender === g ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {g === 'male' ? 'Мужской' : 'Женский'}
                </button>
              ))}
            </div>
          </div>

          {/* Age, height */}
          {[
            { label: 'Возраст', key: 'age' as const, unit: 'лет', min: 10, max: 100 },
            { label: 'Рост', key: 'height' as const, unit: 'см', min: 100, max: 250 },
          ].map(({ label, key, unit, min, max }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-500">{label}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setProfile(p => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
                  className="w-8 h-8 rounded-full bg-gray-100 font-bold flex items-center justify-center">−</button>
                <input
                  type="number"
                  inputMode="numeric"
                  value={profile[key]}
                  onChange={e => {
                    const v = parseInt(e.target.value)
                    if (!isNaN(v)) setProfile(p => ({ ...p, [key]: v }))
                  }}
                  onBlur={() => setProfile(p => ({ ...p, [key]: Math.min(max, Math.max(min, p[key])) }))}
                  className="w-16 text-center font-bold border border-gray-200 rounded-xl py-1 outline-none focus:border-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-500 text-sm">{unit}</span>
                <button onClick={() => setProfile(p => ({ ...p, [key]: Math.min(max, p[key] + 1) }))}
                  className="w-8 h-8 rounded-full bg-gray-100 font-bold flex items-center justify-center">+</button>
              </div>
            </div>
          ))}

          {/* Weight with 0.1 step */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Вес</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setProfile(p => ({ ...p, weight: +Math.max(30, p.weight - 0.1).toFixed(1) }))}
                className="w-8 h-8 rounded-full bg-gray-100 font-bold flex items-center justify-center">−</button>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={profile.weight}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v)) setProfile(p => ({ ...p, weight: v }))
                }}
                onBlur={() => setProfile(p => ({ ...p, weight: +Math.min(300, Math.max(30, p.weight)).toFixed(1) }))}
                className="w-20 text-center font-bold border border-gray-200 rounded-xl py-1 outline-none focus:border-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-gray-500 text-sm">кг</span>
              <button onClick={() => setProfile(p => ({ ...p, weight: +Math.min(300, p.weight + 0.1).toFixed(1) }))}
                className="w-8 h-8 rounded-full bg-gray-100 font-bold flex items-center justify-center">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Goal & Activity */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Цели</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500">Цель</span>
          <div className="flex gap-1">
            {(['lose', 'maintain', 'gain'] as const).map(g => (
              <button key={g} onClick={() => setProfile(p => ({ ...p, goal: g }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${profile.goal === g ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {goals[g]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Активность</span>
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as const).map(a => (
              <button key={a} onClick={() => setProfile(p => ({ ...p, activity: a }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${profile.activity === a ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {activities[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white mx-4 mt-3 rounded-2xl p-5 shadow-sm">
        <button onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <span className="text-gray-700">Сменить пароль</span>
          </div>
          <ChevronRight size={18} className={`text-gray-300 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
        </button>
        {showPasswordForm && (
          <div className="mt-3 space-y-2">
            <input type="password" placeholder="Новый пароль" value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-400" />
            <button onClick={changePassword}
              className="w-full bg-gray-800 text-white rounded-xl py-2 text-sm font-medium">
              Изменить пароль
            </button>
            {passwordMsg && <p className="text-sm text-center text-green-500">{passwordMsg}</p>}
          </div>
        )}
      </div>

    </div>
  )
}
