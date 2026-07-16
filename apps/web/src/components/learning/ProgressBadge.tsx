"use client"

interface Props {
  completed: number
  total: number
}

export default function ProgressBadge({ completed, total }: Props) {
  if (total === 0) return null

  return (
    <span className="text-xs text-neutral-500 dark:text-neutral-400">
      {completed}/{total} bloques completados
    </span>
  )
}
