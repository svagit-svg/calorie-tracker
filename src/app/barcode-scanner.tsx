'use client'

import { useEffect, useRef, useState } from 'react'
import { X, RefreshCw } from 'lucide-react'

export type BarcodeResult = {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  emoji: string
  grams: number
}

type Props = {
  onResult: (result: BarcodeResult) => void
  onClose: () => void
}

type Status = 'scanning' | 'loading' | 'notfound' | 'error'

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const scannerRef = useRef<any>(null)
  const [status, setStatus] = useState<Status>('scanning')
  const [lastCode, setLastCode] = useState('')
  const divId = 'barcode-reader'

  useEffect(() => {
    startScanner()
    return () => { scannerRef.current?.stop().catch(() => {}) }
  }, [])

  const startScanner = async () => {
    setStatus('scanning')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (scannerRef.current) {
        try { await scannerRef.current.stop() } catch {}
      }
      const scanner = new Html5Qrcode(divId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 120 },
          aspectRatio: 1.7,
        },
        async (code: string) => {
          await scanner.stop().catch(() => {})
          setLastCode(code)
          await lookupProduct(code)
        },
        () => {}
      )
    } catch (e: any) {
      setStatus('error')
    }
  }

  const lookupProduct = async (barcode: string) => {
    setStatus('loading')
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { signal: AbortSignal.timeout(8000) }
      )
      const data = await res.json()
      if (data.status === 0 || !data.product) { setStatus('notfound'); return }

      const p = data.product
      const n = p.nutriments || {}
      const name = p.product_name_ru || p.product_name_en || p.product_name || 'Продукт'
      const kcalPer100 = Math.round(
        n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0)
      )
      if (!kcalPer100) { setStatus('notfound'); return }

      onResult({
        name,
        calories: kcalPer100,
        protein: Math.round(n['proteins_100g'] || 0),
        carbs: Math.round(n['carbohydrates_100g'] || 0),
        fat: Math.round(n['fat_100g'] || 0),
        emoji: '🏷️',
        grams: 100,
      })
    } catch {
      setStatus('notfound')
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-4 z-10 bg-gradient-to-b from-black/70 to-transparent">
        <p className="font-semibold text-white text-lg">Сканер штрихкода</p>
        <button onClick={() => { scannerRef.current?.stop().catch(() => {}); onClose() }}
          className="p-2 rounded-full bg-white/10 text-white active:bg-white/20">
          <X size={22} />
        </button>
      </div>

      {/* Scanner area */}
      <div className="flex-1 relative overflow-hidden" id={divId} />

      {/* Corner frame overlay */}
      {status === 'scanning' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-36">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
            <div className="absolute left-2 right-2 h-0.5 bg-orange-400/80 rounded-full animate-bounce" style={{ top: '50%' }} />
          </div>
        </div>
      )}

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-8 bg-gradient-to-t from-black/80 to-transparent text-center">
        {status === 'scanning' && (
          <p className="text-white/70 text-sm">Наведи камеру на штрихкод упаковки</p>
        )}
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <RefreshCw size={16} className="animate-spin" />
            <p className="text-sm">Ищу продукт...</p>
          </div>
        )}
        {status === 'notfound' && (
          <div className="space-y-3">
            <p className="text-red-400 text-sm">Продукт не найден · {lastCode}</p>
            <button onClick={startScanner}
              className="bg-white text-gray-900 px-8 py-2.5 rounded-full text-sm font-semibold active:scale-95 transition-transform">
              Сканировать снова
            </button>
          </div>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-sm">Нет доступа к камере. Разреши доступ в настройках браузера.</p>
        )}
      </div>
    </div>
  )
}
