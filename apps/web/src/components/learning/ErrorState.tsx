"use client"

import { AlertCircle, RotateCcw } from "lucide-react"

interface Props {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-punch-50 dark:bg-punch-950/30 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-punch-500 dark:text-punch-400" />
      </div>
      <p className="text-stone-500 dark:text-stone-400 max-w-md text-base leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  )
}
