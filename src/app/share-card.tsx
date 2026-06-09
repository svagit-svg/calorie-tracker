'use client'

import { useRef } from 'react'
import { Download } from 'lucide-react'

type StatsProps = {
  type: 'stats'
  onClose: () => void
  name: string
  period: string
  avgCalories: number
  dailyGoal: number
  daysTracked: number
  totalDays: number
  streak: number
  favDish: string
}

type BodyProps = {
  type: 'body'
  onClose: () => void
  name: string
  currentWeight: number
  startWeight: number
  bmi: number
  bmiLabel: string
  goal: string
  streak: number
}

type Props = StatsProps | BodyProps

export default function ShareCard(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateAndShare = async () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#f97316')
    grad.addColorStop(1, '#ea580c')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    roundRect(ctx, 60, 180, W - 120, H - 360, 60)
    ctx.fill()

    // App name
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('FitDiary', W / 2, 130)

    if (props.type === 'stats') {
      // Title
      ctx.fillStyle = 'white'
      ctx.font = 'bold 80px Arial'
      ctx.fillText(props.name || 'Мой прогресс', W / 2, 320)

      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '52px Arial'
      ctx.fillText('Статистика · ' + props.period, W / 2, 400)

      // Avg calories
      ctx.fillStyle = 'white'
      ctx.font = 'bold 160px Arial'
      ctx.fillText(String(props.avgCalories), W / 2, 620)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '52px Arial'
      ctx.fillText('ккал в среднем / день', W / 2, 700)

      // Days tracked
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      roundRect(ctx, 120, 770, W - 240, 130, 30)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 64px Arial'
      ctx.fillText('📅 ' + props.daysTracked + ' из ' + props.totalDays + ' дней заполнено', W / 2, 855)

      if (props.streak > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        roundRect(ctx, 120, 930, W - 240, 130, 30)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 64px Arial'
        ctx.fillText('🔥 Стрик ' + props.streak + ' ' + plural(props.streak, 'день', 'дня', 'дней'), W / 2, 1015)
      }

      if (props.favDish) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '48px Arial'
        ctx.fillText('Любимое блюдо:', W / 2, 1140)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 60px Arial'
        ctx.fillText('🍽️ ' + props.favDish, W / 2, 1220)
      }
    } else {
      // Body card
      const diff = +(props.currentWeight - props.startWeight).toFixed(1)
      const diffText = diff < 0 ? '−' + Math.abs(diff) + ' кг' : diff > 0 ? '+' + diff + ' кг' : '0 кг'

      ctx.fillStyle = 'white'
      ctx.font = 'bold 80px Arial'
      ctx.fillText(props.name || 'Мои результаты', W / 2, 320)

      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '52px Arial'
      ctx.fillText('Моё тело', W / 2, 400)

      // Current weight big
      ctx.fillStyle = 'white'
      ctx.font = 'bold 180px Arial'
      ctx.fillText(props.currentWeight + ' кг', W / 2, 640)

      // Diff
      if (diff !== 0) {
        ctx.fillStyle = diff < 0 ? '#86efac' : '#fca5a5'
        ctx.font = 'bold 80px Arial'
        ctx.fillText(diffText + ' от старта', W / 2, 740)
      }

      // BMI
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      roundRect(ctx, 120, 800, W - 240, 140, 30)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 64px Arial'
      ctx.fillText('ИМТ ' + props.bmi + ' · ' + props.bmiLabel, W / 2, 890)

      if (props.streak > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        roundRect(ctx, 120, 980, W - 240, 130, 30)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 64px Arial'
        ctx.fillText('🔥 Стрик ' + props.streak + ' ' + plural(props.streak, 'день', 'дня', 'дней'), W / 2, 1065)
      }

      const goalText = props.goal === 'lose' ? '🎯 Цель: похудеть' : props.goal === 'gain' ? '🎯 Цель: набрать массу' : '🎯 Цель: поддержать вес'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '52px Arial'
      ctx.fillText(goalText, W / 2, 1180)
    }

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '42px Arial'
    ctx.fillText('fitdiary.ru', W / 2, H - 100)

    const link = document.createElement('a')
    link.download = 'fitdiary-' + props.type + '-' + new Date().toISOString().split('T')[0] + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const isStats = props.type === 'stats'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
        <div className="bg-orange-500 px-6 pt-8 pb-6 text-white text-center">
          {isStats ? (
            <>
              <p className="text-orange-200 text-sm mb-1">Статистика · {props.period}</p>
              <p className="text-5xl font-bold">{props.avgCalories}</p>
              <p className="text-orange-200 text-sm mb-3">ккал в среднем / день</p>
              <p className="text-sm">📅 {props.daysTracked} дней заполнено</p>
              {props.streak > 0 && <p className="text-sm mt-1">🔥 Стрик {props.streak} {plural(props.streak, 'день', 'дня', 'дней')}</p>}
              {props.favDish && <p className="text-orange-200 text-xs mt-2">🍽️ {props.favDish}</p>}
            </>
          ) : (
            <>
              <p className="text-orange-200 text-sm mb-1">Моё тело</p>
              <p className="text-5xl font-bold">{props.currentWeight} кг</p>
              {props.currentWeight !== props.startWeight && (
                <p className={`text-sm mt-1 font-semibold ${props.currentWeight < props.startWeight ? 'text-green-300' : 'text-red-300'}`}>
                  {props.currentWeight < props.startWeight ? '−' : '+'}{Math.abs(+(props.currentWeight - props.startWeight).toFixed(1))} кг от старта
                </p>
              )}
              <p className="text-orange-200 text-sm mt-2">ИМТ {props.bmi} · {props.bmiLabel}</p>
              {props.streak > 0 && <p className="text-sm mt-1">🔥 {props.streak} {plural(props.streak, 'день', 'дня', 'дней')}</p>}
            </>
          )}
        </div>
        <div className="p-5 space-y-3">
          <button onClick={generateAndShare}
            className="w-full bg-orange-500 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2">
            <Download size={18} /> Сохранить картинку
          </button>
          <button onClick={props.onClose} className="w-full text-gray-400 text-sm py-2">Закрыть</button>
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
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
