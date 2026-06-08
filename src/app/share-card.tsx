'use client'

import { useRef } from 'react'
import { X, Download } from 'lucide-react'

type Props = {
  onClose: () => void
  name: string
  totalCalories: number
  dailyGoal: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  streak: number
  meals: { name: string }[]
  isPro: boolean
}

export default function ShareCard({ onClose, name, totalCalories, dailyGoal, totalProtein, totalCarbs, totalFat, streak, meals, isPro }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const percent = Math.min(100, Math.round((totalCalories / dailyGoal) * 100))
  const topMeals = meals.slice(0, 3).map(m => m.name)

  const generateAndShare = async () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#f97316')
    grad.addColorStop(1, '#ea580c')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // White card
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, 60, 200, W - 120, H - 400, 60)
    ctx.fill()

    // App name
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '500 52px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('FitDiary', W / 2, 140)

    // Name
    ctx.fillStyle = 'white'
    ctx.font = 'bold 72px Arial'
    ctx.fillText(name || 'Мой день', W / 2, 340)

    // Calories big number
    ctx.font = 'bold 160px Arial'
    ctx.fillText(String(totalCalories), W / 2, 560)
    ctx.font = '500 52px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('ккал из ' + dailyGoal, W / 2, 640)

    // Progress bar bg
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    roundRect(ctx, 120, 700, W - 240, 32, 16)
    ctx.fill()

    // Progress bar fill
    ctx.fillStyle = 'white'
    roundRect(ctx, 120, 700, Math.max(32, (W - 240) * percent / 100), 32, 16)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '42px Arial'
    ctx.fillText(percent + '% от нормы', W / 2, 790)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(120, 830)
    ctx.lineTo(W - 120, 830)
    ctx.stroke()

    // BJU
    const bjuItems = [
      { label: 'Белки', value: totalProtein + 'г' },
      { label: 'Углеводы', value: totalCarbs + 'г' },
      { label: 'Жиры', value: totalFat + 'г' },
    ]
    bjuItems.forEach((item, i) => {
      const x = 200 + i * 340
      ctx.fillStyle = 'white'
      ctx.font = 'bold 72px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.value, x, 960)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '42px Arial'
      ctx.fillText(item.label, x, 1020)
    })

    // Streak
    if (streak > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      roundRect(ctx, 120, 1080, W - 240, 120, 30)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 58px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🔥 ' + streak + ' ' + plural(streak, 'день', 'дня', 'дней') + ' подряд', W / 2, 1160)
    }

    // Top meals
    if (topMeals.length > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '44px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Сегодня я ел:', W / 2, 1280)
      topMeals.forEach((meal, i) => {
        ctx.fillStyle = 'white'
        ctx.font = '500 50px Arial'
        ctx.fillText('• ' + meal, W / 2, 1370 + i * 90)
      })
    }

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '40px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('fitdiary.ru', W / 2, H - 120)

    // Download
    const link = document.createElement('a')
    link.download = 'fitdiary-' + new Date().toISOString().split('T')[0] + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
        {/* Preview */}
        <div className="bg-orange-500 px-6 pt-8 pb-6 text-white text-center">
          <p className="text-orange-200 text-sm mb-1">Мой день</p>
          <p className="text-5xl font-bold mb-1">{totalCalories}</p>
          <p className="text-orange-200 text-sm mb-4">ккал из {dailyGoal}</p>
          <div className="bg-white/20 rounded-full h-2 mb-1">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: percent + '%' }} />
          </div>
          <p className="text-orange-200 text-xs">{percent}% от нормы</p>
          <div className="flex justify-around mt-4">
            {[['Б', totalProtein + 'г'], ['У', totalCarbs + 'г'], ['Ж', totalFat + 'г']].map(([l, v]) => (
              <div key={l} className="text-center">
                <p className="font-bold text-lg">{v}</p>
                <p className="text-orange-200 text-xs">{l}</p>
              </div>
            ))}
          </div>
          {streak > 0 && <p className="mt-3 text-sm">🔥 {streak} {plural(streak, 'день', 'дня', 'дней')} подряд</p>}
        </div>

        <div className="p-5 space-y-3">
          <button onClick={generateAndShare}
            className="w-full bg-orange-500 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2">
            <Download size={18} /> Сохранить и поделиться
          </button>
          <button onClick={onClose}
            className="w-full text-gray-400 text-sm py-2">
            Закрыть
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
