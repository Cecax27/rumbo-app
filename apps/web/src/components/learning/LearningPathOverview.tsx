"use client"

import Link from "next/link"
import type { MockPath, MockProgress } from "@/app/app/learning/mock-data"
import ProgressBadge from "./ProgressBadge"
import EmptyState from "./EmptyState"

interface TopicCardProps {
  topic: MockPath["topics"][number]
  progress: MockProgress
  isLocked: boolean
  blockingTopics: string[]
}

function TopicCard({ topic, progress, isLocked, blockingTopics }: TopicCardProps) {
  const tp = progress.topicStatus[topic.id]

  const taskBlocks = topic.blocks.filter((b) => b.type === "task")
  const completedTasks = taskBlocks.filter(
    (b) => progress.taskStatus[b.id]?.status === "completed"
  ).length

  const badge = isLocked
    ? { label: `Requiere: ${blockingTopics.join(", ")}`, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" }
    : tp?.status === "completed"
      ? { label: "Completado", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }
      : tp?.status === "in_progress"
        ? { label: "En progreso", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" }
        : { label: "No iniciado", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" }

  const card = (
    <div
      className={`border rounded-lg p-4 transition-colors ${
        isLocked
          ? "opacity-50"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{topic.title}</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
          {badge.label}
        </span>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{topic.description}</p>
      {taskBlocks.length > 0 && (
        <div className="mt-2">
          <ProgressBadge completed={completedTasks} total={taskBlocks.length} />
        </div>
      )}
    </div>
  )

  if (isLocked) return card

  return (
    <Link href={`/app/learning/${topic.id}`} className="block">
      {card}
    </Link>
  )
}

interface Props {
  path: MockPath
  progress: MockProgress
}

export default function LearningPathOverview({ path, progress }: Props) {
  const completedCount = path.topics.filter(
    (t) => progress.topicStatus[t.id]?.status === "completed"
  ).length
  const total = path.topics.length
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
          {path.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">{path.description}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          {completedCount}/{total} completados ({percent}%)
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {path.topics.length === 0 ? (
          <EmptyState
            message="Aún no hay temas disponibles en este camino de aprendizaje."
            actionLabel="Volver al inicio"
            actionHref="/app/home"
          />
        ) : (
          path.topics.map((topic) => {
          const isLocked =
            topic.dependsOn.length > 0 &&
            topic.dependsOn.some((depSlug) => {
              const depTopic = path.topics.find((t) => t.slug === depSlug)
              if (!depTopic) return true
              const depProgress = progress.topicStatus[depTopic.id]
              return depProgress?.status !== "completed"
            })

          const blockingTopics = topic.dependsOn
            .map((slug) => path.topics.find((t) => t.slug === slug)?.title ?? slug)
            .filter(Boolean)

          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              progress={progress}
              isLocked={isLocked}
              blockingTopics={blockingTopics}
            />
          )
        }))}
      </div>
    </div>
  )
}
