"use client"

import Link from "next/link"
import { BookOpen, ArrowRight } from "lucide-react"

interface Props {
  message: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ message, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
        <BookOpen className="w-7 h-7 text-stone-400 dark:text-stone-600" />
      </div>
      <p className="text-stone-500 dark:text-stone-400 max-w-md text-base leading-relaxed">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-blue-600 dark:text-navy-blue-400 hover:text-navy-blue-700 dark:hover:text-navy-blue-300 transition-colors"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
