'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus } from 'lucide-react'

type Platform = 'ios' | 'android' | 'desktop' | null

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  const [showIOSHint, setShowIOSHint] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed today
    const dismissed = localStorage.getItem('install_dismissed')
    if (dismissed === new Date().toISOString().split('T')[0]) return

    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((window.navigator as any).standalone) return

    // Detect platform
    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isAndroid = /android/i.test(ua)

    if (isIOS) {
      // iOS: show after a slight delay (can't use beforeinstallprompt)
      const visits = Number(localStorage.getItem('visit_count') || 0) + 1
      localStorage.setItem('visit_count', String(visits))
      if (visits >= 2) {
        setTimeout(() => { setPlatform('ios'); setShow(true) }, 3000)
      }
    } else if (isAndroid) {
      // Android: listen for beforeinstallprompt
      const handler = (e: Event) => {
        e.preventDefault()
        ;(window as any).__deferredInstall = e
        const visits = Number(localStorage.getItem('visit_count') || 0) + 1
        localStorage.setItem('visit_count', String(visits))
        if (visits >= 2) {
          setTimeout(() => { setPlatform('android'); setShow(true) }, 3000)
        }
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('install_dismissed', new Date().toISOString().split('T')[0])
  }

  const handleInstall = async () => {
    if (platform === 'android') {
      const deferred = (window as any).__deferredInstall
      if (deferred) {
        deferred.prompt()
        const { outcome } = await deferred.userChoice
        if (outcome === 'accepted') dismiss()
      }
    } else if (platform === 'ios') {
      setShowIOSHint(true)
    }
  }

  if (!show) return null

  return (
    <>
      {/* Main banner */}
      <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="FitDiary" className="w-full h-full object-cover" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Установить FitDiary</p>
            <p className="text-gray-400 text-xs">Работает без интернета · Быстрый доступ</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              {platform === 'ios' ? 'Как?' : 'Добавить'}
            </button>
            <button onClick={dismiss} className="p-1.5 text-gray-500 active:text-gray-300">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS instruction sheet */}
      {showIOSHint && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowIOSHint(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">Добавить на экран «Домой»</h3>
              <button onClick={() => setShowIOSHint(false)} className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Share size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">1. Нажми «Поделиться»</p>
                  <p className="text-gray-500 text-xs mt-0.5">Кнопка внизу Safari — квадрат со стрелкой вверх</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plus size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">2. «На экран «Домой»»</p>
                  <p className="text-gray-500 text-xs mt-0.5">Прокрути список действий вниз и выбери этот пункт</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🍊</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">3. Нажми «Добавить»</p>
                  <p className="text-gray-500 text-xs mt-0.5">FitDiary появится на главном экране</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowIOSHint(false); dismiss() }}
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform mt-2"
            >
              Понятно!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
