"use client"

import Link from "next/link"

interface Props {
  message: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ message, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <span className="text-2xl">📚</span>
      </div>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-sm text-navy-blue-600 dark:text-navy-blue-400 hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
