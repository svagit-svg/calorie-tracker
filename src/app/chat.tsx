'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send, Loader2, Lock } from 'lucide-react'
import { createClient } from './supabase/client'

type Message = { role: 'user' | 'ai'; text: string }

const FREE_LIMIT = 5

type Props = {
  onBack: () => void
  isPro: boolean
  userId: string
  onShowPaywall: () => void
  context: {
    dailyGoal: number
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    remaining: number
    meals: { name: string }[]
    goal: string
  }
}

const QUICK_QUESTIONS = [
  'Что мне поесть сейчас?',
  'Почему я не худею?',
  'Достаточно ли я ем белка?',
  'Оцени мой день',
]

export default function ChatScreen({ onBack, isPro, userId, onShowPaywall, context }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Привет! Я твой персональный нутрициолог 🥗\n\nСегодня ты съел ${context.totalCalories} из ${context.dailyGoal} ккал. Осталось ${context.remaining} ккал.\n\nЧем могу помочь?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatCount, setChatCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const loadCount = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('profiles').select('daily_chat_count, chat_count_date').eq('id', userId).single()
      if (data?.chat_count_date === today) {
        setChatCount(data.daily_chat_count || 0)
      } else {
        setChatCount(0)
      }
    }
    loadCount()
  }, [userId])

  const isLimitReached = !isPro && chatCount >= FREE_LIMIT

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    if (isLimitReached) { onShowPaywall(); return }

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])

      // Increment counter
      const today = new Date().toISOString().split('T')[0]
      const newCount = chatCount + 1
      setChatCount(newCount)
      await supabase.from('profiles').update({ daily_chat_count: newCount, chat_count_date: today }).eq('id', userId)
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Ошибка соединения. Попробуй ещё раз.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack}><ChevronLeft size={24} className="text-gray-400" /></button>
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg">🥗</div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">AI Нутрициолог</p>
          <p className="text-xs text-green-500">Онлайн</p>
        </div>
        {!isPro && (
          <div className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
            {Math.max(0, FREE_LIMIT - chatCount)}/{FREE_LIMIT} сообщ.
          </div>
        )}
        {isPro && (
          <div className="text-xs text-orange-500 bg-orange-50 rounded-full px-3 py-1">👑 PRO</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">🥗</div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${m.role === 'user'
              ? 'bg-orange-500 text-white rounded-tr-sm'
              : 'bg-white text-gray-900 shadow-sm rounded-tl-sm'}`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm mr-2 flex-shrink-0">🥗</div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <Loader2 size={16} className="animate-spin text-orange-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && !isLimitReached && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => send(q)}
              className="bg-white border border-orange-200 text-orange-500 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Limit banner */}
      {isLimitReached && (
        <div className="mx-4 mb-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-orange-800 mb-1">Лимит 5 сообщений/день исчерпан</p>
          <p className="text-xs text-orange-600 mb-3">Перейди на PRO для безлимитного общения с нутрициологом</p>
          <button onClick={onShowPaywall}
            className="bg-orange-500 text-white rounded-xl px-6 py-2 text-sm font-medium flex items-center gap-2 mx-auto">
            <Lock size={14} /> Перейти на PRO
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white px-4 py-3 border-t border-gray-100 flex items-center gap-3 flex-shrink-0 pb-8">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={isLimitReached ? 'Лимит сообщений исчерпан' : 'Спросите что-нибудь...'}
          disabled={isLimitReached}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none disabled:opacity-50"
        />
        <button onClick={() => send()} disabled={!input.trim() || loading || isLimitReached}
          className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
