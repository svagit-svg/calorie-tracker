'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Camera, Beef, Wheat, Droplets, Loader2, LogOut, Trash2, Plus, X, Home as HomeIcon, BarChart2, Scale, User, Star, ChevronRight, ScanBarcode, Sparkles } from 'lucide-react'
import { createClient } from './supabase/client'
import Onboarding from './onboarding'
import ProfileScreen from './profile'
import StatsScreen from './stats'
import AchievementsScreen from './achievements'
import WeightScreen from './weight'
import ChatScreen from './chat'
import FoodDBScreen from './fooddb'
import ChallengesScreen from './challenges'
import dynamic from 'next/dynamic'
import type { BarcodeResult } from './barcode-scanner'
const BarcodeScanner = dynamic(() => import('./barcode-scanner'), { ssr: false })
import MealPlannerScreen from './meal-planner'

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

type Tab = 'home' | 'stats' | 'weight' | 'profile'

const PLANS = [
  { key: 'week',  label: 'Неделя',  price: 99,   perDay: 14,  badge: null },
  { key: 'month', label: 'Месяц',   price: 299,  perDay: 10,  badge: 'Популярный' },
  { key: 'year',  label: 'Год',     price: 1990, perDay: 5,   badge: 'Выгоднее на 33%' },
]

function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'home',    label: 'Сегодня',    icon: <HomeIcon size={22} /> },
    { key: 'stats',   label: 'Статистика', icon: <BarChart2 size={22} /> },
    { key: 'weight',  label: 'Моё тело',   icon: <Scale size={22} /> },
    { key: 'profile', label: 'Профиль',    icon: <User size={22} /> },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex z-40">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active === t.key ? 'text-orange-500' : 'text-gray-400'}`}>
          {t.icon}
          <span className="text-xs font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const R = 44
  const C = 2 * Math.PI * R
  const pct = Math.min(consumed / Math.max(goal, 1), 1)
  const isOver = consumed > goal
  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="9" />
      <circle cx="56" cy="56" r={R} fill="none"
        stroke={isOver ? '#fca5a5' : 'white'}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${C * pct} ${C}`}
        transform="rotate(-90 56 56)"
      />
      <text x="56" y="52" textAnchor="middle" fill="white" fontSize="17" fontWeight="bold" fontFamily="system-ui">{consumed}</text>
      <text x="56" y="66" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="system-ui">ккал</text>
    </svg>
  )
}

function HintsCard({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  const hints = [
    { icon: '📷', title: 'Сфотографируй еду', desc: 'AI распознает блюдо и посчитает калории за секунду' },
    { icon: '🔍', title: 'Сканируй штрихкод', desc: 'Наведи камеру на упаковку — продукт добавится автоматически' },
    { icon: '⭐', title: 'Сохраняй в избранное', desc: 'Нажми звёздочку на блюде — добавишь одним tap в следующий раз' },
  ]
  const h = hints[step]
  return (
    <div className="mb-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{h.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{h.title}</p>
          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{h.desc}</p>
        </div>
        <button onClick={onDismiss} className="text-gray-300 text-xl leading-none mt-0.5">×</button>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1.5">
          {hints.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-orange-500 w-3' : 'bg-orange-200'}`} />
          ))}
        </div>
        {step < hints.length - 1
          ? <button onClick={() => setStep(s => s + 1)} className="text-orange-500 text-xs font-semibold">Далее →</button>
          : <button onClick={onDismiss} className="text-orange-500 text-xs font-semibold">Понятно!</button>
        }
      </div>
    </div>
  )
}

function PaywallScreen({ onClose, limitReason }: { onClose: () => void; limitReason: 'photos' | 'daily' }) {
  const [selected, setSelected] = useState('month')
  const plan = PLANS.find(p => p.key === selected)!

  const painMessage = limitReason === 'photos'
    ? 'Ты уже отследил 10 блюд с AI — это работает!'
    : 'Бесплатно доступно только 1 фото в день'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 pt-7 pb-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-2xl leading-none">×</button>
          <div className="inline-flex items-center gap-1.5 bg-orange-500 rounded-full px-3 py-1 text-xs font-bold mb-3">
            👑 FitDiary PRO
          </div>
          <h2 className="text-2xl font-bold mb-1.5">Убери все ограничения</h2>
          <p className="text-gray-400 text-sm">{painMessage}</p>
        </div>

        <div className="px-5 pt-5 pb-6">
          {/* Free vs PRO comparison */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-2">Бесплатно</p>
              {[
                '1 фото в день',
                '1 скан штрихкода в день',
                'AI чат ограничен',
                'Нет меню на неделю',
              ].map(t => (
                <div key={t} className="flex items-center gap-1.5 py-1">
                  <span className="text-red-400 text-xs">✕</span>
                  <span className="text-xs text-gray-500">{t}</span>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 border-2 border-orange-400">
              <p className="text-xs font-bold text-orange-500 mb-2">PRO ✨</p>
              {[
                'Безлимитные фото',
                'Безлимитный сканер',
                'AI чат без ограничений',
                'Меню на неделю от AI',
              ].map(t => (
                <div key={t} className="flex items-center gap-1.5 py-1">
                  <span className="text-green-500 text-xs">✓</span>
                  <span className="text-xs text-gray-700 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div className="flex gap-2 mb-4">
            {PLANS.map(p => (
              <button key={p.key} onClick={() => setSelected(p.key)}
                className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all relative ${selected === p.key ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                {p.badge && (
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${p.key === 'month' ? 'bg-orange-500' : 'bg-green-500'}`}>
                    {p.badge}
                  </div>
                )}
                <p className={`text-xs mb-0.5 ${selected === p.key ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{p.label}</p>
                <p className={`text-xl font-bold ${selected === p.key ? 'text-gray-900' : 'text-gray-600'}`}>{p.price} ₽</p>
                <p className="text-xs text-gray-400">{p.perDay} ₽/день</p>
              </button>
            ))}
          </div>

          <button className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-200 mb-3 active:scale-98 transition-transform">
            Попробовать PRO за {plan.price} ₽
          </button>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-3">
            <span>🔒 Безопасная оплата</span>
            <span>·</span>
            <span>↩ Отмена в любой момент</span>
          </div>
          <button onClick={onClose} className="w-full text-gray-400 py-1.5 text-sm">Продолжить бесплатно</button>
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
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showPaywall, setShowPaywall] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showAchievements, setShowAchievements] = useState(false)
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
  const [water, setWater] = useState(0)
  const [favorites, setFavorites] = useState<Omit<Meal, 'id' | 'eaten_at'>[]>([])
  const [hintsShown, setHintsShown] = useState(true)
  const [showChallenges, setShowChallenges] = useState(false)
  const [showBarcode, setShowBarcode] = useState(false)
  const [showMealPlanner, setShowMealPlanner] = useState(false)
  const [userActivity, setUserActivity] = useState('moderate')
  const [proBannerDismissed, setProBannerDismissed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  // Load favorites and hints once on mount
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
    setFavorites(favs)
    setHintsShown(!!localStorage.getItem('hints_done'))
    const today = new Date().toISOString().split('T')[0]
    setProBannerDismissed(localStorage.getItem('pro_banner_dismissed') === today)
  }, [])

  // Load water for the selected date
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const saved = localStorage.getItem(`water_${dateStr}`)
    setWater(Number(saved) || 0)
  }, [selectedDate])

  const repeatYesterday = async () => {
    if (!user) return
    const yesterday = new Date(selectedDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]
    const yNext = new Date(yesterday); yNext.setDate(yNext.getDate() + 1)
    const { data } = await supabase.from('meals').select('*')
      .eq('user_id', user.id).gte('eaten_at', yStr).lt('eaten_at', yNext.toISOString().split('T')[0])
    if (!data?.length) { alert('Вчера записей нет'); return }
    const today = selectedDate.toISOString().split('T')[0]
    const insertData = data.map(m => ({
      user_id: user.id, name: m.name, calories: m.calories, protein: m.protein,
      carbs: m.carbs, fat: m.fat, emoji: m.emoji, meal_type: m.meal_type, eaten_at: today,
    }))
    const { data: newMeals } = await supabase.from('meals').insert(insertData).select()
    if (newMeals) setMeals(prev => [...prev, ...newMeals])
  }

  const toggleFavorite = (meal: Meal) => {
    const exists = favorites.find(f => f.name === meal.name)
    const newFavs = exists
      ? favorites.filter(f => f.name !== meal.name)
      : [...favorites, { name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, emoji: meal.emoji, meal_type: meal.meal_type }]
    setFavorites(newFavs)
    localStorage.setItem('favorites', JSON.stringify(newFavs))
  }

  const addFromFavorite = async (fav: typeof favorites[0]) => {
    if (!user) return
    const { data: meal } = await supabase.from('meals').insert({
      user_id: user.id, ...fav, meal_type: fav.meal_type || detectMealType(),
    }).select().single()
    if (meal) setMeals(prev => [...prev, meal])
  }

  const openBarcode = () => {
    if (!isPro) {
      const today = new Date().toISOString().split('T')[0]
      const scans = Number(localStorage.getItem(`barcode_${today}`) || 0)
      if (scans >= 1) { setShowPaywall(true); return }
    }
    setShowBarcode(true)
  }

  const handleBarcodeResult = (result: BarcodeResult) => {
    setShowBarcode(false)
    if (!isPro) {
      const today = new Date().toISOString().split('T')[0]
      const scans = Number(localStorage.getItem(`barcode_${today}`) || 0)
      localStorage.setItem(`barcode_${today}`, String(scans + 1))
    }
    setPending({ ...result, meal_type: detectMealType() })
  }

  const dismissHints = () => {
    localStorage.setItem('hints_done', '1')
    setHintsShown(true)
  }

  const toggleWater = (n: number) => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const newVal = water >= n ? n - 1 : n
    setWater(newVal)
    localStorage.setItem(`water_${dateStr}`, String(newVal))
  }

  // Test accounts that always get full PRO access
  const TEST_EMAILS = ['test@fitdiary.ru', 'admin@fitdiary.ru', 's.vagit@gmail.com']

  const loadProfile = async (userId: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const isTestAccount = TEST_EMAILS.includes(currentUser?.email || '')

    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!data || !data.gender) {
      if (isTestAccount) {
        // Auto-setup test profile without onboarding
        await supabase.from('profiles').upsert({
          id: userId,
          name: 'Test User',
          gender: 'male',
          age: 30,
          weight: 75,
          height: 180,
          goal: 'maintain',
          activity: 'moderate',
          daily_goal: 2500,
          is_pro: true,
          total_photos: 0,
          streak: 0,
        })
        setDailyGoal(2500)
        setIsPro(true)
        setTotalPhotos(0)
        setStreak(0)
        setStartWeight(75)
        setUserGoal('maintain')
        return
      }
      setShowOnboarding(true)
    } else {
      setDailyGoal(data.daily_goal || 2000)
      if (!data.name) {
        const { data: { user: u } } = await supabase.auth.getUser()
        const name = u?.user_metadata?.full_name || u?.user_metadata?.name || ''
        if (name) await supabase.from('profiles').update({ name }).eq('id', userId)
      }
    }
    if (data) {
      setIsPro(isTestAccount ? true : (data.is_pro || false))
      setTotalPhotos(isTestAccount ? 0 : (data.total_photos || 0))
      setStreak(data.streak || 0)
      setStartWeight(data.weight || 70)
      setUserGoal(data.goal || 'maintain')
      setUserActivity(data.activity || 'moderate')
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

  const mealsByType = MEAL_TYPES.map(type => ({
    ...type,
    meals: meals.filter(m => m.meal_type === type.key),
    calories: meals.filter(m => m.meal_type === type.key).reduce((s, m) => s + m.calories, 0),
  })).filter(g => g.meals.length > 0)

  const otherMeals = meals.filter(m => !MEAL_TYPES.find(t => t.key === m.meal_type))

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || ''

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
      isPro={isPro}
      userId={user.id}
      onShowPaywall={() => { setShowChat(false); setShowPaywall(true) }}
      context={{ dailyGoal, totalCalories, totalProtein, totalCarbs, totalFat, remaining, meals, goal: userGoal }}
    />
  )

  if (showAchievements && user) return (
    <AchievementsScreen onBack={() => setShowAchievements(false)} userId={user.id} streak={streak} />
  )

  if (showChallenges && user) return (
    <>
      <ChallengesScreen onBack={() => setShowChallenges(false)} userId={user.id} streak={streak} dailyGoal={dailyGoal} />
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  )

  if (showMealPlanner && user) return (
    <>
      <MealPlannerScreen
        onBack={() => setShowMealPlanner(false)}
        dailyGoal={dailyGoal}
        goal={userGoal}
        activity={userActivity}
        onAddMeal={async (meal) => {
          const { data: newMeal } = await supabase.from('meals').insert({
            user_id: user.id, ...meal,
          }).select().single()
          if (newMeal) setMeals(prev => [...prev, newMeal])
        }}
      />
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  )

  // Tab screens
  if (activeTab === 'stats' && user) return (
    <>
      <StatsScreen onBack={() => setActiveTab('home')} userId={user.id} dailyGoal={dailyGoal}
        userName={userName} streak={streak} />
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  )

  if (activeTab === 'weight' && user) return (
    <>
      <WeightScreen onBack={() => setActiveTab('home')} userId={user.id} startWeight={startWeight}
        currentGoal={userGoal} onWeightUpdate={(w) => { setStartWeight(w); setProfileKey(k => k + 1) }}
        userName={userName} streak={streak} />
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  )

  if (activeTab === 'profile' && user) return (
    <>
      <ProfileScreen key={profileKey} onBack={() => setActiveTab('home')} onSignOut={handleSignOut}
        userId={user.id} userEmail={user.email || ''}
        onGoalUpdate={(goal) => { setDailyGoal(goal); setActiveTab('home') }}
        onShowPaywall={() => setShowPaywall(true)} />
      {showPaywall && <PaywallScreen onClose={() => setShowPaywall(false)} limitReason={totalPhotos >= 10 ? 'photos' : 'daily'} />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  )

  if (!user && showLanding) return (
    <div className="bg-white max-w-md mx-auto flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-orange-100 pt-12 text-center">
        <div className="px-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500 rounded-full px-3 py-1 text-xs font-semibold text-white mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
            Beta
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            Считай калории<br/>с помощью <span className="text-orange-500">AI</span>
          </h1>
          <p className="text-gray-500 text-sm mb-6">Сфотографируй еду — AI мгновенно распознает<br/>состав и посчитает калории</p>
          <button onClick={() => setShowLanding(false)}
            className="bg-orange-500 text-white rounded-full px-8 py-3.5 font-bold text-base shadow-lg shadow-orange-200 mb-6">
            Начать бесплатно →
          </button>
        </div>
        <div className="relative mx-auto" style={{ maxWidth: 340 }}>
          <Image src="/hero-opt.jpg" alt="FitDiary — считай калории с AI" width={800} height={1067} className="w-full object-contain" priority />
          <div className="absolute top-8 left-4 bg-white rounded-2xl px-3 py-2 shadow-lg text-left">
            <p className="text-xs font-bold text-gray-900">🔥 1840 ккал</p>
            <p className="text-xs text-gray-400">из 2000 сегодня</p>
            <div className="mt-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
          <div className="absolute top-12 right-2 bg-white rounded-2xl px-3 py-2 shadow-lg text-left">
            <p className="text-xs font-bold text-orange-500">🤖 AI распознал</p>
            <p className="text-xs text-gray-700 font-medium">Греческий салат</p>
            <p className="text-xs text-gray-400">124 ккал · 8г белка</p>
          </div>
          <div className="absolute bottom-16 left-6 bg-orange-500 rounded-2xl px-3 py-2 shadow-lg">
            <p className="text-xs font-bold text-white">🔥 14 дней стрик!</p>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 px-6 py-4 flex justify-around border-b border-orange-100">
        {[
          { value: '400+', label: 'блюд в базе' },
          { value: 'AI', label: 'распознавание' },
          { value: '0 ₽', label: 'бесплатно' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-orange-500 font-bold text-lg">{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 pt-8 pb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Как это работает</h2>
        <div className="space-y-3">
          {[
            { step: '1', emoji: '📸', text: 'Фотографируй или говори что съел' },
            { step: '2', emoji: '🤖', text: 'AI распознаёт еду и считает калории' },
            { step: '3', emoji: '📊', text: 'Следи за прогрессом и достигай цели' },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.step}</div>
              <span className="text-xl">{s.emoji}</span>
              <p className="text-gray-700 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Возможности</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '📸', title: 'Фото еды', desc: 'AI считает калории по фото' },
            { emoji: '🔍', title: 'Штрихкоды', desc: 'Сканируй упаковки' },
            { emoji: '📖', title: 'База блюд', desc: '400+ русских блюд' },
            { emoji: '⚖️', title: 'Трекер веса', desc: 'Динамика и ИМТ' },
            { emoji: '🏆', title: 'Достижения', desc: 'Стрики и награды' },
            { emoji: '🤖', title: 'AI советник', desc: 'Персональные рекомендации' },
            { emoji: '📊', title: 'Статистика', desc: 'БЖУ за неделю и месяц' },
          ].map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-3">
              <span className="text-xl">{f.emoji}</span>
              <p className="font-semibold text-gray-900 text-sm mt-1">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-6 mt-4 bg-green-50 rounded-2xl p-4 border border-green-100">
        <p className="font-semibold text-green-800 text-sm">✅ Бесплатно навсегда</p>
        <p className="text-green-700 text-xs mt-1">Дневник, база блюд, статистика и многое другое — без оплаты</p>
      </div>

      <div className="mx-6 mt-3 bg-orange-50 rounded-2xl p-4 border border-orange-100">
        <p className="font-semibold text-orange-800 text-sm">👑 PRO от 99 ₽/нед</p>
        <p className="text-orange-700 text-xs mt-1">Безлимитные фото · AI чат · Анализ рациона · Поделиться итогами</p>
      </div>

      <div className="px-6 pt-6 pb-10 space-y-3">
        <button onClick={() => setShowLanding(false)}
          className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-orange-200">
          Начать бесплатно
        </button>
        <button onClick={() => setShowLanding(false)}
          className="w-full text-gray-400 text-sm py-2">
          Уже есть аккаунт? Войти
        </button>
        <p className="text-center text-xs text-gray-300">fitdiary.ru · Дневник питания с AI</p>
      </div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto flex flex-col justify-center px-6">
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
        <button onClick={() => setShowLanding(true)} className="w-full text-gray-400 text-sm py-1">← Назад</button>
      </div>
    </div>
  )

  // Main home screen
  return (
    <main className="min-h-screen bg-gray-50 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex justify-between items-end">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button onClick={goToPrevDay} className="text-gray-400 p-1">‹</button>
            <p className="text-gray-400 text-sm capitalize flex-1 text-center">{dateLabel}</p>
            <button onClick={goToNextDay} className={`p-1 ${isToday ? 'text-gray-200' : 'text-gray-400'}`}>›</button>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{isToday ? 'Сегодня' : 'Дневник'}</h1>
            <span className="text-xs bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 rounded-full">Beta</span>
          </div>
        </div>
        <div className="flex gap-2.5 pb-1">
          <button onClick={() => setShowAchievements(true)} className="flex items-center gap-1 text-orange-500">
            <span className="text-sm font-bold">{streak}</span><span>🔥</span>
          </button>
          <button onClick={() => setShowChat(true)}
            className="flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            🥗 AI
          </button>
        </div>
      </div>

      {/* Calories Card with ring */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <CalorieRing consumed={totalCalories} goal={dailyGoal} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-orange-100 text-xs">Цель на день</p>
              <p className="text-2xl font-bold">{dailyGoal} ккал</p>
            </div>
            <div>
              <p className="text-orange-100 text-xs">{totalCalories > dailyGoal ? 'Сверх нормы' : 'Осталось'}</p>
              <p className={`text-2xl font-bold ${totalCalories > dailyGoal ? 'text-red-200' : 'text-white'}`}>
                {Math.abs(dailyGoal - totalCalories)} ккал
              </p>
            </div>
          </div>
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

      {/* Water Tracker */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">💧 Вода</p>
          <p className="text-xs text-gray-400">{water} / 8 · {water * 250} мл</p>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} onClick={() => toggleWater(i + 1)}
              className={`flex-1 h-9 rounded-xl text-sm transition-all active:scale-95 ${i < water ? 'bg-blue-400 text-white shadow-sm' : 'bg-gray-100 text-gray-300'}`}>
              {i < water ? '💧' : '○'}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Challenges teaser + PRO features row */}
      <div className="mx-4 mt-3 flex gap-2">
        <button onClick={() => setShowChallenges(true)}
          className="flex-1 bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-2.5 active:scale-98 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-lg flex-shrink-0">🏆</div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold text-gray-900">Челленджи</p>
            <p className="text-xs text-gray-400">Мой прогресс</p>
          </div>
        </button>
        <button onClick={() => isPro ? setShowMealPlanner(true) : setShowPaywall(true)}
          className="flex-1 bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-2.5 active:scale-98 transition-transform relative overflow-hidden">
          {!isPro && <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">PRO</div>}
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-lg flex-shrink-0">✨</div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold text-gray-900">AI Меню</p>
            <p className="text-xs text-gray-400">На неделю</p>
          </div>
        </button>
      </div>

      {/* PRO upsell banner for free users (shown once per day, dismissible) */}
      {!isPro && meals.length >= 2 && !proBannerDismissed && (
        <div className="mx-4 mt-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center gap-3 relative">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">🚀 Убери ограничения</p>
            <p className="text-gray-400 text-xs mt-0.5">Безлимитные фото · AI меню · от 14 ₽/день</p>
          </div>
          <button onClick={() => setShowPaywall(true)}
            className="bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-transform flex-shrink-0">
            Попробовать
          </button>
          <button
            onClick={() => {
              setProBannerDismissed(true)
              localStorage.setItem('pro_banner_dismissed', new Date().toISOString().split('T')[0])
            }}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 p-0.5 leading-none text-base"
            aria-label="Закрыть"
          >×</button>
        </div>
      )}

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
      <div className="mx-4 mt-4 pb-36">
        {meals.length === 0 ? (
          <div>
            {/* Onboarding hints */}
            {!hintsShown && <HintsCard onDismiss={dismissHints} />}
            {/* Favorites quick-add */}
            {favorites.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">⭐ Избранное</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {favorites.map(fav => (
                    <button key={fav.name} onClick={() => addFromFavorite(fav)}
                      className="flex-shrink-0 bg-white rounded-2xl px-3 py-2 shadow-sm flex items-center gap-2 active:scale-95 transition-transform border border-gray-100">
                      <span className="text-xl">{fav.emoji}</span>
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-900 whitespace-nowrap max-w-[80px] truncate">{fav.name}</p>
                        <p className="text-xs text-gray-400">{fav.calories} ккал</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Empty state */}
            <div className="text-center py-6 text-gray-400">
              <div className="text-4xl mb-2">📷</div>
              <p>Сфотографируй еду чтобы начать</p>
              <button onClick={repeatYesterday}
                className="mt-4 flex items-center gap-2 mx-auto bg-white border border-orange-300 text-orange-500 px-4 py-2 rounded-full text-sm font-medium shadow-sm active:scale-95 transition-transform">
                🔄 Повторить как вчера
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Favorites quick-add (when meals exist) */}
            {favorites.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">⭐ Избранное</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {favorites.map(fav => (
                    <button key={fav.name} onClick={() => addFromFavorite(fav)}
                      className="flex-shrink-0 bg-white rounded-2xl px-3 py-2 shadow-sm flex items-center gap-2 active:scale-95 transition-transform border border-gray-100">
                      <span className="text-xl">{fav.emoji}</span>
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-900 whitespace-nowrap max-w-[80px] truncate">{fav.name}</p>
                        <p className="text-xs text-gray-400">{fav.calories} ккал</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mealsByType.map(group => (
              <div key={group.key}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-gray-600 font-semibold flex items-center gap-1.5">
                    <span>{group.emoji}</span> {group.label}
                  </h2>
                  <span className="text-sm text-gray-400">{group.calories} ккал</span>
                </div>
                <div className="space-y-2">
                  {group.meals.map(meal => {
                    const isFav = !!favorites.find(f => f.name === meal.name)
                    return (
                      <div key={meal.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                        <div className="text-3xl">{meal.emoji}</div>
                        <div className="flex-1 min-w-0">
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
                          <div className="flex flex-col gap-1">
                            <button onClick={() => toggleFavorite(meal)} className={`transition-colors ${isFav ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}>
                              <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                            </button>
                            <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {otherMeals.length > 0 && (
              <div>
                <h2 className="text-gray-600 font-semibold mb-2">🍽️ Другое</h2>
                <div className="space-y-2">
                  {otherMeals.map(meal => {
                    const isFav = !!favorites.find(f => f.name === meal.name)
                    return (
                      <div key={meal.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                        <div className="text-3xl">{meal.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{meal.name}</p>
                          <p className="text-gray-400 text-sm">Б:{meal.protein}г У:{meal.carbs}г Ж:{meal.fat}г</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div><p className="font-bold text-gray-900">{meal.calories}</p><p className="text-gray-400 text-xs">ккал</p></div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => toggleFavorite(meal)} className={`transition-colors ${isFav ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}>
                              <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                            </button>
                            <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Floating action buttons — raised above bottom nav */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
        <button onClick={openBarcode}
          className="bg-white text-orange-500 border-2 border-orange-500 rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-transform relative">
          <ScanBarcode size={22} />
          {!isPro && <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">1</span>}
        </button>
        <button onClick={() => setShowFoodDB(true)}
          className="bg-white text-orange-500 border-2 border-orange-500 rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-transform text-xl">
          🍽️
        </button>
        <button onClick={() => { setManual({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: detectMealType() }); setShowManual(true) }}
          className="bg-white text-orange-500 border-2 border-orange-500 rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-transform">
          <Plus size={24} />
        </button>
        <button onClick={() => fileInputRef.current?.click()} disabled={loading}
          className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl active:scale-95 transition-transform disabled:opacity-50">
          {loading ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} />}
        </button>
      </div>

      {/* Barcode scanner overlay */}
      {showBarcode && <BarcodeScanner onResult={handleBarcodeResult} onClose={() => setShowBarcode(false)} />}

      {/* Paywall */}
      {showPaywall && <PaywallScreen onClose={() => setShowPaywall(false)} limitReason={totalPhotos >= 10 ? 'photos' : 'daily'} />}

      {/* Bottom navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </main>
  )
}
