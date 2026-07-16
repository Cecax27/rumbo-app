"use client"

import { useState } from "react"
import type { MockBlock } from "@/app/app/learning/mock-data"

interface Props {
  block: MockBlock
}

export default function ReflectionBlock({ block }: Props) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <h3 className="font-semibold text-lg">{block.payload.title}</h3>
      <p className="text-neutral-500 dark:text-neutral-400 mt-2 italic">{block.payload.prompt}</p>
      <textarea
        className="w-full mt-3 p-3 border rounded-md resize-none text-sm dark:bg-neutral-950 dark:border-neutral-700"
        rows={3}
        placeholder="Escribe tus reflexiones aquí..."
      />
      <button
        type="button"
        className="mt-2 text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
        onClick={() => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
      >
        {saved ? "Nota guardada" : "Guardar nota"}
      </button>
    </div>
  )
}
