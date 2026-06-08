'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Flashlight } from 'lucide-react'

type Props = {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const scannerRef = useRef<any>(null)
  const divId = 'barcode-reader'

  useEffect(() => {
    let scanner: any = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        scanner = new Html5Qrcode(divId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.5,
            formatsToSupport: [
              1,  // EAN_13
              2,  // EAN_8
              11, // UPC_A
              12, // UPC_E
              5,  // CODE_128
              6,  // CODE_39
            ],
          },
          (decodedText: string) => {
            setScanning(false)
            scanner.stop().catch(() => {})
            onDetected(decodedText)
          },
          () => {} // ignore per-frame errors
        )
      } catch (e: any) {
        if (e?.message?.includes('Permission')) {
          setError('Нет доступа к камере. Разрешите доступ в настройках браузера.')
        } else {
          setError('Не удалось запустить камеру.')
        }
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 text-white">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 active:bg-white/20">
          <X size={22} />
        </button>
        <p className="font-medium">Сканер штрихкода</p>
        <div className="w-10" />
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center">
        <div id={divId} className="w-full" style={{ maxHeight: '60vh' }} />

        {/* Overlay frame */}
        {scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-40">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
              {/* Scan line animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-orange-400/80 animate-scan-line" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="px-6 py-8 text-center">
        {error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : scanning ? (
          <p className="text-white/70 text-sm">Наведите камеру на штрихкод упаковки</p>
        ) : (
          <p className="text-green-400 text-sm">✓ Штрихкод распознан</p>
        )}
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 8px; }
          50% { top: calc(100% - 8px); }
          100% { top: 8px; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
