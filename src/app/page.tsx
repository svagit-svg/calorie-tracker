'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Beef, Wheat, Droplets, Loader2, LogOut, Trash2, Plus, X, Mic, MicOff } from 'lucide-react'
import { createClient } from './supabase/client'
import Onboarding from './onboarding'
import ProfileScreen from './profile'
import StatsScreen from './stats'
import AchievementsScreen from './achievements'
import WeightScreen from './weight'
import ChatScreen from './chat'
import FoodDBScreen from './fooddb'

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Завтрак', emoji: '🌅' },
  { key: 'lunch',     label: 'Обед',    emoji: '☀️' },
  { key: 'dinner',    label: 'Ужин',    emoji: '🌙' },
  { key: 'snack',     label: 'Перекус', emoji: '🍎' },
]

function detectMealType(): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 15 && h < 20) return 'dinner'
  return 'snack'
}

type Meal = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  emoji: string
  eaten_at: string
  meal_type: string
}

type PendingMeal = {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  emoji: string
  grams: number
  meal_type: string
}


const PLANS = [
  { key: 'week',  label: 'Неделя',  price: 99,   perDay: 14,  badge: null },
  { key: 'month', label: 'Месяц',   price: 299,  perDay: 10,  badge: 'Популярный' },
  { key: 'year',  label: 'Год',     price: 1990, perDay: 5,   badge: 'Выгоднее на 33%' },
]

function PaywallScreen({ onClose, limitReason }: { onClose: () => void; limitReason: 'photos' | 'daily' }) {
  const [selected, setSelected] = useState('month')
  const plan = PLANS.find(p => p.key === selected)!

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl overflow-hidden">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 px-6 pt-8 pb-6 text-white text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-2xl font-bold mb-1">Перейти на PRO</h2>
          <p className="text-orange-100 text-sm">
            {limitReason === 'photos' ? 'Вы использовали все 10 бесплатных распознаваний' : 'Бесплатно — 1 фото в день'}
          </p>
        </div>

        <div className="px-6 pt-5 pb-6">
          {/* Features */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              ['📷', 'Безлимитные фото'],
              ['🤖', 'AI распознавание'],
              ['📊', 'Детальная статистика'],
              ['🏆', 'Все ачивки'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2">
                <span>{icon}</span>
                <span className="text-xs text-gray-700 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="flex gap-2 mb-5">
            {PLANS.map(p => (
              <button key={p.key} onClick={() => setSelected(p.key)}
                className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all relative ${selected === p.key ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                {p.badge && (
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${p.key === 'month' ? 'bg-orange-500' : 'bg-green-500'}`}>
                    {p.badge}
                  </div>
                )}
                <p className={`text-xs mb-1 ${selected === p.key ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{p.label}</p>
                <p className={`text-xl font-bold ${selected === p.key ? 'text-gray-900' : 'text-gray-600'}`}>{p.price} ₽</p>
                <p className="text-xs text-gray-400">{p.perDay} ₽/день</p>
              </button>
            ))}
          </div>

          {/* CTA */}
          <button className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-200 mb-3">
            Оформить за {plan.price} ₽ · {plan.label.toLowerCase()}
          </button>
          <button onClick={onClose} className="w-full text-gray-400 py-2 text-sm">Не сейчас</button>
          <p className="text-center text-xs text-gray-300 mt-2">Отменить можно в любой момент</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showWeight, setShowWeight] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showFoodDB, setShowFoodDB] = useState(false)
  const [recommendation, setRecommendation] = useState<{emoji: string; title: string; tip: string} | null>(null)
  const [recDismissed, setRecDismissed] = useState(false)
  const [recLoading, setRecLoading] = useState(false)
  const [profileKey, setProfileKey] = useState(0)
  const [startWeight, setStartWeight] = useState(70)
  const [userGoal, setUserGoal] = useState<'lose'|'maintain'|'gain'>('maintain')
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [showLanding, setShowLanding] = useState(true)
  const [pending, setPending] = useState<PendingMeal | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manual, setManual] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: detectMealType() })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [voicePending, setVoicePending] = useState<any[]>([])
  const recognitionRef = useRef<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
      if (data.user) { loadMeals(data.user.id); loadProfile(data.user.id) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) { loadMeals(session.user.id); loadProfile(session.user.id) }
      else setMeals([])
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!data || !data.gender) {
      setShowOnboarding(true)
    } else {
      setDailyGoal(data.daily_goal || 2000)
      // Подтянуть имя из OAuth если не было сохранено
      if (!data.name) {
        const { data: { user: u } } = await supabase.auth.getUser()
        const name = u?.user_metadata?.full_name || u?.user_metadata?.name || ''
        if (name) await supabase.from('profiles').update({ name }).eq('id', userId)
      }
    }
    if (data) {
      setIsPro(data.is_pro || false)
      setTotalPhotos(data.total_photos || 0)
      setStreak(data.streak || 0)
      setStartWeight(data.weight || 70)
      setUserGoal(data.goal || 'maintain')
    }
  }

  const saveProfile = async (profile: any, goal: number) => {
    if (!user) return
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
    await supabase.from('profiles').upsert({ id: user.id, daily_goal: goal, name, ...profile })
    setDailyGoal(goal)
    setShowOnboarding(false)
  }

  const loadMeals = async (userId: string, date?: Date) => {
    const d = date || selectedDate
    const dateStr = d.toISOString().split('T')[0]
    const nextDay = new Date(d)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextStr = nextDay.toISOString().split('T')[0]
    const { data } = await supabase.from('meals').select('*').eq('user_id', userId)
      .gte('eaten_at', dateStr).lt('eaten_at', nextStr).order('eaten_at', { ascending: true })
    if (data) setMeals(data)
  }

  const handleSignUp = async () => {
    setAuthError('')
    setAuthSuccess('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthError(error.message)
    else setAuthSuccess(`Письмо отправлено на ${email}. Проверьте почту и перейдите по ссылке для подтверждения.`)
  }

  const handleSignIn = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError('Неверный email или пароль')
  }

  const handleOAuth = async (provider: 'google' | 'vk') => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: `https://fitdiary-app.netlify.app/api/auth/callback` },
    })
    if (error) setAuthError('Ошибка входа через ' + (provider === 'google' ? 'Google' : 'ВКонтакте'))
  }

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Голосовой ввод не поддерживается в этом браузере'); return }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      setLoading(true)
      try {
        const res = await fetch('/api/analyze-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript }),
        })
        const data = await res.json()
        if (data.dishes?.length > 0) {
          setVoicePending(data.dishes.map((d: any) => ({ ...d, confirmed: true })))
        } else {
          alert('Не удалось распознать блюда. Попробуйте ещё раз.')
        }
      } finally {
        setLoading(false)
      }
    }
    recognition.start()
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const confirmVoiceMeals = async () => {
    if (!user) return
    const confirmed = voicePending.filter(d => d.confirmed)
    for (const dish of confirmed) {
      const { data: meal } = await supabase.from('meals').insert({
        user_id: user.id,
        name: dish.name,
        calories: dish.calories,
        protein: dish.protein,
        carbs: dish.carbs,
        fat: dish.fat,
        emoji: dish.emoji || '🍽️',
        meal_type: detectMealType(),
      }).select().single()
      if (meal) setMeals(prev => [...prev, meal])
    }
    setVoicePending([])
  }

  const handleSignOut = async () => { await supabase.auth.signOut() }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!isPro) {
      if (totalPhotos >= 10) { setShowPaywall(true); return }
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase.from('meals').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).gte('eaten_at', today)
      if ((count || 0) >= 1) { setShowPaywall(true); return }
    }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      setLoading(true)
      try {
        const res = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const data = await res.json()
        const hasCalories = data.calories && !isNaN(Number(data.calories)) && Number(data.calories) > 0
        if (data.error || !hasCalories) {
          if (data.name) setManual(m => ({ ...m, name: data.name }))
          setShowManual(true)
        } else {
          setPending({ ...data, grams: 100, meal_type: detectMealType() })
        }
      } catch {
        setShowManual(true)
      } finally {
        setLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const confirmMeal = async () => {
    if (!pending || !user) return
    const ratio = pending.grams / 100
    const { data: meal } = await supabase.from('meals').insert({
      user_id: user.id,
      name: pending.name,
      calories: Math.round(pending.calories * ratio),
      protein: Math.round(pending.protein * ratio),
      carbs: Math.round(pending.carbs * ratio),
      fat: Math.round(pending.fat * ratio),
      emoji: pending.emoji || '🍽️',
      meal_type: pending.meal_type,
    }).select().single()
    if (meal) setMeals(prev => [...prev, meal])
    setPending(null)
  }

  const saveManual = async () => {
    if (!manual.name || !manual.calories || !user) return
    const { data: meal } = await supabase.from('meals').insert({
      user_id: user.id,
      name: manual.name,
      calories: Number(manual.calories),
      protein: Number(manual.protein) || 0,
      carbs: Number(manual.carbs) || 0,
      fat: Number(manual.fat) || 0,
      emoji: '🍽️',
      meal_type: manual.meal_type,
    }).select().single()
    if (meal) setMeals(prev => [...prev, meal])
    setShowManual(false)
    setManual({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: detectMealType() })
  }

  const deleteMeal = async (id: string) => {
    await supabase.from('meals').delete().eq('id', id)
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  // Auto-fetch recommendation in the evening if there are meals
  useEffect(() => {
    const hour = new Date().getHours()
    const todayKey = `rec_${new Date().toISOString().split('T')[0]}`
    const alreadyShown = localStorage.getItem(todayKey)
    if (hour >= 17 && meals.length > 0 && !recommendation && !recDismissed && !alreadyShown) {
      fetchRecommendation()
    }
  }, [meals])

  const fetchRecommendation = async () => {
    if (recLoading) return
    setRecLoading(true)
    try {
      const cal = meals.reduce((s, m) => s + m.calories, 0)
      const prot = meals.reduce((s, m) => s + m.protein, 0)
      const carb = meals.reduce((s, m) => s + m.carbs, 0)
      const fat = meals.reduce((s, m) => s + m.fat, 0)
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meals, dailyGoal, goal: userGoal, totalCalories: cal, totalProtein: prot, totalCarbs: carb, totalFat: fat }),
      })
      const data = await res.json()
      setRecommendation(data)
    } finally {
      setRecLoading(false)
    }
  }

  const dismissRecommendation = () => {
    setRecDismissed(true)
    setRecommendation(null)
    const todayKey = `rec_${new Date().toISOString().split('T')[0]}`
    localStorage.setItem(todayKey, '1')
  }

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0)
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0)
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0)
  const remaining = Math.max(dailyGoal - totalCalories, 0)
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100)
  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const dateLabel = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  const goToPrevDay = () => {
    const d = new Date(selectedDate); d.setDate(d.getDate() - 1)
    setSelectedDate(d); if (user) loadMeals(user.id, d)
  }
  const goToNextDay = () => {
    if (isToday) return
    const d = new Date(selectedDate); d.setDate(d.getDate() + 1)
    setSelectedDate(d); if (user) loadMeals(user.id, d)
  }

  // Group meals by type
  const mealsByType = MEAL_TYPES.map(type => ({
    ...type,
    meals: meals.filter(m => m.meal_type === type.key),
    calories: meals.filter(m => m.meal_type === type.key).reduce((s, m) => s + m.calories, 0),
  })).filter(g => g.meals.length > 0)

  const otherMeals = meals.filter(m => !MEAL_TYPES.find(t => t.key === m.meal_type))

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-orange-500" />
    </div>
  )

  if (showOnboarding && user) return <Onboarding onComplete={saveProfile} />
  if (showFoodDB && user) return (
    <FoodDBScreen
      onBack={() => setShowFoodDB(false)}
      onAdd={async (item) => {
        const { data: meal } = await supabase.from('meals').insert({
          user_id: user.id,
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          emoji: item.emoji,
          meal_type: item.meal_type || detectMealType(),
        }).select().single()
        if (meal) setMeals(prev => [...prev, meal])
        setShowFoodDB(false)
      }}
    />
  )

  if (showChat && user) return (
    <ChatScreen
      onBack={() => setShowChat(false)}
      context={{
        dailyGoal,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        remaining,
        meals,
        goal: userGoal,
      }}
    />
  )

  if (showWeight && user) return (
    <WeightScreen onBack={() => setShowWeight(false)} userId={user.id} startWeight={startWeight}
      currentGoal={userGoal} onWeightUpdate={(w) => { setStartWeight(w); setProfileKey(k => k + 1) }} />
  )
  if (showAchievements && user) return (
    <AchievementsScreen onBack={() => setShowAchievements(false)} userId={user.id} streak={streak} />
  )
  if (showStats && user) return (
    <StatsScreen onBack={() => setShowStats(false)} userId={user.id} dailyGoal={dailyGoal} />
  )
  if (showProfile && user) return (
    <>
      <ProfileScreen key={profileKey} onBack={() => setShowProfile(false)} onSignOut={handleSignOut}
        userId={user.id} userEmail={user.email || ''}
        onGoalUpdate={(goal) => { setDailyGoal(goal); setShowProfile(false) }}
        onShowPaywall={() => setShowPaywall(true)} />
      {showPaywall && <PaywallScreen onClose={() => setShowPaywall(false)} limitReason={totalPhotos >= 10 ? 'photos' : 'daily'} />}
    </>
  )

  if (!user && showLanding) return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 px-6 pt-16 pb-12 text-white text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
          Beta
        </div>
        <div className="text-6xl mb-4">🥗</div>
        <h1 className="text-3xl font-bold mb-2">FitDiary</h1>
        <p className="text-orange-100 text-lg">Дневник питания с AI</p>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 py-8 space-y-4">
        {[
          { emoji: '📸', title: 'Фото еды', desc: 'Сфотографируй блюдо — AI посчитает калории автоматически' },
          { emoji: '🎤', title: 'Голосовой ввод', desc: 'Скажи что съел — распознаём речь и добавляем в дневник' },
          { emoji: '📊', title: 'Статистика', desc: 'Графики БЖУ, динамика веса, стрики и достижения' },
          { emoji: '🤖', title: 'AI нутрициолог', desc: 'Персональные советы на основе твоего рациона' },
        ].map(f => (
          <div key={f.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <span className="text-2xl">{f.emoji}</span>
            <div>
              <p className="font-semibold text-gray-900">{f.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 space-y-3">
        <button onClick={() => setShowLanding(false)}
          className="w-full bg-orange-500 text-white rounded-2xl py-4 font-semibold text-lg">
          Начать бесплатно
        </button>
        <button onClick={() => setShowLanding(false)}
          className="w-full text-gray-400 text-sm py-2">
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🥗</div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">FitDiary</h1>
          <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-gray-400 mt-1">Считай калории с помощью AI</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
        <input type="password" placeholder="Пароль (минимум 6 символов)" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
        {authError && <p className="text-red-500 text-sm">{authError}</p>}
        {authSuccess && <p className="text-green-600 text-sm bg-green-50 rounded-xl px-3 py-2">{authSuccess}</p>}
        <button onClick={handleSignIn} className="w-full bg-orange-500 text-white rounded-xl py-3 font-medium">Войти</button>
        <button onClick={handleSignUp} className="w-full border border-orange-500 text-orange-500 rounded-xl py-3 font-medium">Зарегистрироваться</button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">или войти через</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button onClick={() => handleOAuth('google')}
          className="w-full border border-gray-200 rounded-xl py-3 font-medium flex items-center justify-center gap-3 text-gray-700 active:bg-gray-50">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>

        <button onClick={() => setShowLanding(true)}
          className="w-full text-gray-400 text-sm py-1">
          ← Назад
        </button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex justify-between items-end">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button onClick={goToPrevDay} className="text-gray-400 p-1">‹</button>
            <p className="text-gray-400 text-sm capitalize flex-1 text-center">{dateLabel}</p>
            <button onClick={goToNextDay} className={`p-1 ${isToday ? 'text-gray-200' : 'text-gray-400'}`}>›</button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isToday ? 'Сегодня' : 'Дневник'}</h1>
        </div>
        <div className="flex gap-3 pb-1">
          <button onClick={() => setShowAchievements(true)} className="flex items-center gap-1 text-orange-500">
            <span className="text-sm font-bold">{streak}</span><span>🔥</span>
          </button>
          <button onClick={() => setShowWeight(true)} className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
          </button>
          <button onClick={() => setShowStats(true)} className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </button>
          <button onClick={() => setShowChat(true)}
            className="flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            🥗 AI
          </button>
          <button onClick={() => setShowProfile(true)} className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
          <button onClick={handleSignOut} className="text-gray-400"><LogOut size={20} /></button>
        </div>
      </div>

      {/* Calories Card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-orange-100 text-sm">Съедено</p>
            <p className="text-4xl font-bold">{totalCalories}</p>
            <p className="text-orange-100 text-sm">из {dailyGoal} ккал</p>
          </div>
          <div className="text-right">
            <p className="text-orange-100 text-sm">Осталось</p>
            <p className="text-3xl font-bold">{remaining}</p>
            <p className="text-orange-100 text-sm">ккал</p>
          </div>
        </div>
        <div className="bg-orange-300 rounded-full h-2 mb-4">
          <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['Белки', totalProtein, <Beef size={16} key="b"/>], ['Углеводы', totalCarbs, <Wheat size={16} key="u"/>], ['Жиры', totalFat, <Droplets size={16} key="zh"/>]].map(([label, val, icon]) => (
            <div key={label as string} className="bg-white/20 rounded-xl p-2 text-center">
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="text-lg font-bold">{val as number}г</p>
              <p className="text-orange-100 text-xs">{label as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation card */}
      {recommendation && !recDismissed && (
        <div className="mx-4 mt-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 shadow-lg text-white relative">
          <button onClick={dismissRecommendation} className="absolute top-3 right-3 text-white/60 hover:text-white text-lg leading-none">×</button>
          <div className="flex items-start gap-3 pr-6">
            <span className="text-3xl">{recommendation.emoji}</span>
            <div>
              <p className="font-bold text-sm mb-1">{recommendation.title}</p>
              <p className="text-purple-100 text-xs leading-relaxed">{recommendation.tip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Meals grouped by type */}
      <div className="mx-4 mt-4 pb-32">
        {meals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📷</div>
            <p>Сфотографируйте еду чтобы начать</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mealsByType.map(group => (
              <div key={group.key}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-gray-600 font-semibold flex items-center gap-1.5">
                    <span>{group.emoji}</span> {group.label}
                  </h2>
                  <span className="text-sm text-gray-400">{group.calories} ккал</span>
                </div>
                <div className="space-y-2">
                  {group.meals.map(meal => (
                    <div key={meal.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="text-3xl">{meal.emoji}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(meal.eaten_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · Б:{meal.protein}г У:{meal.carbs}г Ж:{meal.fat}г
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="font-bold text-gray-900">{meal.calories}</p>
                          <p className="text-gray-400 text-xs">ккал</p>
                        </div>
                        <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {otherMeals.length > 0 && (
              <div>
                <h2 className="text-gray-600 font-semibold mb-2">🍽️ Другое</h2>
                <div className="space-y-2">
                  {otherMeals.map(meal => (
                    <div key={meal.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                      <div className="text-3xl">{meal.emoji}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        <p className="text-gray-400 text-sm">Б:{meal.protein}г У:{meal.carbs}г Ж:{meal.fat}г</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div><p className="font-bold text-gray-900">{meal.calories}</p><p className="text-gray-400 text-xs">ккал</p></div>
                        <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meal type selector component */}
      {(pending || showManual) && null}

      {/* Confirmation modal */}
      {pending && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{pending.emoji}</span>
              <div>
                <p className="font-bold text-lg">{pending.name}</p>
                <p className="text-gray-400 text-sm">на 100г: {pending.calories} ккал</p>
              </div>
            </div>

            {/* Meal type selector */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">Приём пищи</label>
              <div className="flex gap-2">
                {MEAL_TYPES.map(t => (
                  <button key={t.key} onClick={() => setPending({ ...pending, meal_type: t.key })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${pending.meal_type === t.key ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200'}`}>
                    {t.emoji}<br/>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">Сколько грамм съели?</label>
              <div className="flex items-center gap-3">
                <input type="number" value={pending.grams}
                  onChange={e => setPending({ ...pending, grams: Number(e.target.value) })}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-orange-400" />
                <span className="text-gray-400">г</span>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{Math.round(pending.calories * pending.grams / 100)} ккал</p>
              <p className="text-xs text-gray-400">Б:{Math.round(pending.protein * pending.grams / 100)}г У:{Math.round(pending.carbs * pending.grams / 100)}г Ж:{Math.round(pending.fat * pending.grams / 100)}г</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPending(null)} className="flex-1 border border-gray-200 rounded-xl py-3 text-gray-500">Отмена</button>
              <button onClick={confirmMeal} className="flex-1 bg-orange-500 text-white rounded-xl py-3 font-medium">Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual entry modal */}
      {showManual && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Добавить вручную</h3>
              <button onClick={() => setShowManual(false)}><X size={24} className="text-gray-400" /></button>
            </div>

            {/* Meal type selector */}
            <div className="mb-3">
              <label className="text-sm text-gray-500 mb-2 block">Приём пищи</label>
              <div className="flex gap-2">
                {MEAL_TYPES.map(t => (
                  <button key={t.key} onClick={() => setManual({ ...manual, meal_type: t.key })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${manual.meal_type === t.key ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200'}`}>
                    {t.emoji}<br/>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <input placeholder="Название блюда" value={manual.name} onChange={e => setManual({...manual, name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400" />
              <input type="number" placeholder="Калории (ккал)" value={manual.calories} onChange={e => setManual({...manual, calories: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Белки г" value={manual.protein} onChange={e => setManual({...manual, protein: e.target.value})}
                  className="border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 text-sm" />
                <input type="number" placeholder="Углев г" value={manual.carbs} onChange={e => setManual({...manual, carbs: e.target.value})}
                  className="border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 text-sm" />
                <input type="number" placeholder="Жиры г" value={manual.fat} onChange={e => setManual({...manual, fat: e.target.value})}
                  className="border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 text-sm" />
              </div>
            </div>
            <button onClick={saveManual} className="w-full bg-orange-500 text-white rounded-xl py-3 font-medium mt-4">Добавить</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

      {/* Buttons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        <button onClick={() => setShowFoodDB(true)}
          className="bg-white text-orange-500 border-2 border-orange-500 rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-transform text-xl">
          🍽️
        </button>
        <button onClick={() => { setManual({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: detectMealType() }); setShowManual(true) }}
          className="bg-white text-orange-500 border-2 border-orange-500 rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
        <button onClick={isListening ? stopVoice : startVoice} disabled={loading}
          className={`rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-orange-500 border-2 border-orange-500'}`}>
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
        <button onClick={() => fileInputRef.current?.click()} disabled={loading}
          className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl active:scale-95 transition-transform disabled:opacity-50">
          {loading ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} />}
        </button>
      </div>

      {/* Voice confirmation modal */}
      {voicePending.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Распознанные блюда</h3>
              <button onClick={() => setVoicePending([])}><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="space-y-2 mb-5">
              {voicePending.map((dish, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${dish.confirmed ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => setVoicePending(prev => prev.map((d, j) => j === i ? { ...d, confirmed: !d.confirmed } : d))}>
                  <span className="text-2xl">{dish.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{dish.name}</p>
                    <p className="text-xs text-gray-400">{dish.grams}г · Б:{dish.protein}г У:{dish.carbs}г Ж:{dish.fat}г</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{dish.calories}</p>
                    <p className="text-xs text-gray-400">ккал</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mb-3">Нажмите на блюдо чтобы убрать его</p>
            <button onClick={confirmVoiceMeals} className="w-full bg-orange-500 text-white rounded-xl py-3 font-medium">
              Добавить {voicePending.filter(d => d.confirmed).length} блюда
            </button>
          </div>
        </div>
      )}

      {/* Paywall */}
      {showPaywall && <PaywallScreen onClose={() => setShowPaywall(false)} limitReason={totalPhotos >= 10 ? 'photos' : 'daily'} />}
    </main>
  )
}
