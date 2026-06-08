'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send, Loader2 } from 'lucide-react'

type Message = { role: 'user' | 'ai'; text: string }

type Props = {
  onBack: () => void
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

export default function ChatScreen({ onBack, context }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Привет! Я твой персональный нутрициолог 🥗\n\nСегодня ты съел ${context.totalCalories} из ${context.dailyGoal} ккал. Осталось ${context.remaining} ккал.\n\nЧем могу помочь?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
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
        <div>
          <p className="font-bold text-gray-900">AI Нутрициолог</p>
          <p className="text-xs text-green-500">Онлайн</p>
        </div>
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
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => send(q)}
              className="bg-white border border-orange-200 text-orange-500 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white px-4 py-3 border-t border-gray-100 flex items-center gap-3 flex-shrink-0 pb-8">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Спросите что-нибудь..."
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none"
        />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
