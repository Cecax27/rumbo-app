"use client"

import type { MockBlock } from "@/app/app/learning/mock-data"

interface Props {
  block: MockBlock
}

export default function ConceptBlock({ block }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <h3 className="font-semibold text-lg">{block.payload.title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">{block.payload.body}</p>
    </div>
  )
}
