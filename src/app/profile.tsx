'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, LogOut, Lock, Mail, User } from 'lucide-react'
import { createClient } from './supabase/client'

function MaleAvatar() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-m" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bfdbfe"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </radialGradient>
        <clipPath id="clip-m"><circle cx="40" cy="40" r="40"/></clipPath>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg-m)"/>
      {/* Torso — navy tank top */}
      <path d="M0 80 Q8 56 22 52 Q30 49 40 49 Q50 49 58 52 Q72 56 80 80Z" fill="#1e3a5f" clipPath="url(#clip-m)"/>
      {/* Wide shoulders */}
      <ellipse cx="19" cy="56" rx="10" ry="7" fill="#1e3a5f"/>
      <ellipse cx="61" cy="56" rx="10" ry="7" fill="#1e3a5f"/>
      {/* Neck */}
      <rect x="35" y="43" width="10" height="9" rx="3" fill="#f0b890"/>
      {/* Head */}
      <ellipse cx="40" cy="33" rx="17" ry="18" fill="#f0b890"/>
      {/* Ears */}
      <ellipse cx="23" cy="33" rx="3" ry="4.5" fill="#f0b890"/>
      <ellipse cx="57" cy="33" rx="3" ry="4.5" fill="#f0b890"/>
      {/* Hair */}
      <path d="M23 26 Q24 12 40 10 Q56 12 57 26 Q54 14 40 13 Q26 14 23 26Z" fill="#1a0f0a"/>
      <ellipse cx="40" cy="15" rx="16" ry="7" fill="#1a0f0a"/>
      {/* Sideburns */}
      <rect x="23" y="22" width="4" height="9" rx="2" fill="#1a0f0a"/>
      <rect x="53" y="22" width="4" height="9" rx="2" fill="#1a0f0a"/>
      {/* Eyebrows */}
      <path d="M30 28 Q34 26 37 27" stroke="#1a0f0a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M43 27 Q46 26 50 28" stroke="#1a0f0a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="33.5" cy="32" rx="3" ry="3" fill="#1a0f0a"/>
      <ellipse cx="46.5" cy="32" rx="3" ry="3" fill="#1a0f0a"/>
      <circle cx="34.5" cy="31" r="1" fill="white"/>
      <circle cx="47.5" cy="31" r="1" fill="white"/>
      {/* Nose */}
      <path d="M39 35 Q37.5 38.5 40 39.5 Q42.5 38.5 41 35" stroke="#d4906a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M34 43 Q40 47.5 46 43" stroke="#c07858" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function FemaleAvatar() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-f" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fce7f3"/>
          <stop offset="100%" stopColor="#f97316"/>
        </radialGradient>
        <clipPath id="clip-f"><circle cx="40" cy="40" r="40"/></clipPath>
      </defs>
      <circle cx="40" cy="40" r="40" fill="url(#bg-f)"/>
      {/* Body — orange sports top */}
      <path d="M0 80 Q10 58 24 54 Q31 51 40 51 Q49 51 56 54 Q70 58 80 80Z" fill="#ea580c" clipPath="url(#clip-f)"/>
      {/* Shoulder straps */}
      <rect x="34" y="44" width="4" height="10" rx="2" fill="#c2410c"/>
      <rect x="42" y="44" width="4" height="10" rx="2" fill="#c2410c"/>
      {/* Neck */}
      <rect x="36" y="43" width="8" height="9" rx="3" fill="#f0b890"/>
      {/* Head */}
      <ellipse cx="40" cy="33" rx="16" ry="17" fill="#f0b890"/>
      {/* Ears */}
      <ellipse cx="24" cy="33" rx="3" ry="4" fill="#f0b890"/>
      <ellipse cx="56" cy="33" rx="3" ry="4" fill="#f0b890"/>
      {/* Hair back layer */}
      <path d="M24 28 Q25 12 40 10 Q55 12 56 28 Q53 14 40 13 Q27 14 24 28Z" fill="#7c3b1e"/>
      <ellipse cx="40" cy="15" rx="15" ry="7" fill="#7c3b1e"/>
      {/* Ponytail */}
      <path d="M55 20 Q65 17 67 24 Q66 32 58 34" stroke="#7c3b1e" strokeWidth="8" fill="none" strokeLinecap="round"/>
      {/* Hair band */}
      <circle cx="58" cy="26" r="4" fill="#f97316"/>
      <circle cx="58" cy="26" r="2.5" fill="#ea580c"/>
      {/* Side hair */}
      <path d="M24 26 Q20 22 22 17" stroke="#7c3b1e" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Eyebrows (thin arch) */}
      <path d="M31 27.5 Q35 25 38 26" stroke="#7c3b1e" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M42 26 Q45 25 49 27.5" stroke="#7c3b1e" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="34" cy="31" rx="3" ry="3.2" fill="#1a0f0a"/>
      <ellipse cx="46" cy="31" rx="3" ry="3.2" fill="#1a0f0a"/>
      <circle cx="35" cy="30" r="1" fill="white"/>
      <circle cx="47" cy="30" r="1" fill="white"/>
      {/* Lashes */}
      <line x1="31.5" y1="28.5" x2="30" y2="27" stroke="#1a0f0a" strokeWidth="1"/>
      <line x1="33.5" y1="27.8" x2="33" y2="26.5" stroke="#1a0f0a" strokeWidth="1"/>
      <line x1="43" y1="27.8" x2="43" y2="26.5" stroke="#1a0f0a" strokeWidth="1"/>
      <line x1="46.5" y1="28.5" x2="48" y2="27" stroke="#1a0f0a" strokeWidth="1"/>
      {/* Nose */}
      <path d="M39 34 Q37.5 37 40 38 Q42.5 37 41 34" stroke="#d4906a" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="29" cy="37" rx="4.5" ry="3" fill="#fda4af" opacity="0.4"/>
      <ellipse cx="51" cy="37" rx="4.5" ry="3" fill="#fda4af" opacity="0.4"/>
      {/* Smile */}
      <path d="M35 42 Q40 46.5 45 42" stroke="#e07060" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
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
        // Сохраняем имя из OAuth если его не было
        if (!data.name && oauthName) {
          await supabase.from('profiles').update({ name: oauthName }).eq('id', userId)
        }
      }
    }
    loadProfile()
  }, [userId])

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
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <h1 className="text-xl font-bold flex-1">Профиль</h1>
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
                  step="1"
                  min={min}
                  max={max}
                  value={profile[key]}
                  onChange={e => {
                    const v = parseInt(e.target.value)
                    if (!isNaN(v) && v >= min && v <= max) setProfile(p => ({ ...p, [key]: v }))
                  }}
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
                step="0.1"
                min={30}
                max={300}
                value={profile.weight}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v) && v >= 30 && v <= 300) setProfile(p => ({ ...p, weight: v }))
                }}
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

      {/* Save button */}
      <div className="mx-4 mt-4">
        <button onClick={save}
          className="w-full bg-orange-500 text-white rounded-2xl py-4 font-medium text-lg">
          {saved ? '✓ Сохранено!' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
