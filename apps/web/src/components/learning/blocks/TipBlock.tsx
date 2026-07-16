"use client"

import type { MockBlock } from "@/app/app/learning/mock-data"

interface Props {
  block: MockBlock
}

export default function TipBlock({ block }: Props) {
  return (
    <div
      className="border-l-4 rounded-r-lg p-4"
      style={{ borderLeftColor: "#f6b23a", backgroundColor: "rgba(246,178,58,0.1)" }}
    >
      <h3 className="font-semibold">{block.payload.title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">{block.payload.body}</p>
    </div>
  )
}
