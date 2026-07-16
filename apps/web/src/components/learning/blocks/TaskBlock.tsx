"use client"

import type { MockBlock } from "@/app/app/learning/mock-data"
import AchievementTaskCard from "../cards/AchievementTaskCard"
import FollowupTaskCard from "../cards/FollowupTaskCard"

interface Props {
  block: MockBlock
  taskProgress: {
    status: "pending" | "completed"
    completedAt: string | null
    evaluatedAt: string | null
  } | undefined
}

export default function TaskBlock({ block, taskProgress }: Props) {
  const def = block.taskDefinition
  const status = taskProgress?.status ?? "pending"

  const handleComplete = () => {
    console.log(`Tarea ${block.id} completada (placeholder)`)
  }

  const handleEvaluate = () => {
    console.log(`Verificando tarea ${block.id} (placeholder)`)
  }

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      {def?.taskKind === "follow_up" ? (
        <FollowupTaskCard
          title={block.payload.title}
          description={block.payload.description}
          status={status}
          validationMode={def.validationMode}
          evaluatedAt={taskProgress?.evaluatedAt}
          onComplete={def.validationMode === "manual" ? handleComplete : undefined}
          onEvaluate={def.validationMode === "automatic" ? handleEvaluate : undefined}
        />
      ) : (
        <AchievementTaskCard
          title={block.payload.title}
          description={block.payload.description}
          status={status}
          validationMode={def?.validationMode ?? "manual"}
          onComplete={def?.validationMode === "manual" ? handleComplete : undefined}
          onEvaluate={def?.validationMode === "automatic" ? handleEvaluate : undefined}
        />
      )}
    </div>
  )
}
