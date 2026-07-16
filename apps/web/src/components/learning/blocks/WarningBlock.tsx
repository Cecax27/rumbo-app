"use client"

import type { MockBlock } from "@/app/app/learning/mock-data"

interface Props {
  block: MockBlock
}

export default function WarningBlock({ block }: Props) {
  return (
    <div
      className="border-l-4 rounded-r-lg p-4"
      style={{ borderLeftColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)" }}
    >
      <h3 className="font-semibold">{block.payload.title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">{block.payload.body}</p>
    </div>
  )
}
