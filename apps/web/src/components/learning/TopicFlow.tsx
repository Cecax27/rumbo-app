"use client"

import Link from "next/link"
import type { MockTopic, MockBlock, MockProgress } from "@/app/app/learning/mock-data"
import ConceptBlock from "./blocks/ConceptBlock"
import ExplanationBlock from "./blocks/ExplanationBlock"
import TipBlock from "./blocks/TipBlock"
import WarningBlock from "./blocks/WarningBlock"
import ExampleBlock from "./blocks/ExampleBlock"
import ReflectionBlock from "./blocks/ReflectionBlock"

function BlockRenderer({ block }: { block: MockBlock }) {
  const payload = block.payload
  const taskProgress = MOCK_PROGRESS.taskStatus[block.id]

  switch (block.type) {
    case "concept":
      return <ConceptBlock block={block} />

    case "explanation":
      return <ExplanationBlock block={block} />

    case "tip":
      return <TipBlock block={block} />

    case "warning":
      return <WarningBlock block={block} />

    case "example":
      return <ExampleBlock block={block} />

    case "reflection":
      return <ReflectionBlock block={block} />

    case "exercise":
      return (
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold text-lg">{payload.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{payload.body}</p>
          <div className="mt-3 p-6 border border-dashed rounded-md text-center text-neutral-400 dark:border-neutral-700">
            <p className="text-sm">Interactividad próximamente</p>
          </div>
        </div>
      )

    case "task":
      return (
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{payload.title}</h3>
            {taskProgress && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  taskProgress.status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                }`}
              >
                {taskProgress.status === "completed" ? "Completada" : "Pendiente"}
              </span>
            )}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{payload.description}</p>
          {block.taskDefinition && (
            <div className="mt-2 text-xs text-neutral-400">
              {block.taskDefinition.taskKind === "achievement" ? "Tarea de logro" : "Tarea de seguimiento"}
              {" · "}
              {block.taskDefinition.validationMode === "automatic" ? "Validación automática" : "Validación manual"}
            </div>
          )}
          {block.taskDefinition && taskProgress?.status !== "completed" && (
            <div className="mt-3 flex gap-2">
              {block.taskDefinition.validationMode === "manual" && (
                <button
                  type="button"
                  className="text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
                  onClick={() => console.log(`Tarea ${block.id} completada (placeholder)`)}
                >
                  Marcar como hecho
                </button>
              )}
              {block.taskDefinition.validationMode === "automatic" && (
                <button
                  type="button"
                  className="text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
                  onClick={() => console.log(`Verificando tarea ${block.id} (placeholder)`)}
                >
                  Verificar
                </button>
              )}
            </div>
          )}
          {block.taskDefinition?.taskKind === "follow_up" && taskProgress?.evaluatedAt && (
            <p className="text-xs text-neutral-400 mt-2">
              Última revisión: {new Date(taskProgress.evaluatedAt).toLocaleDateString("es-MX")}
            </p>
          )}
        </div>
      )

    default:
      return (
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 opacity-70">
          <h3 className="font-semibold">{payload.title || "Bloque"}</h3>
          <p className="text-sm text-neutral-400 mt-1">Tipo de bloque no soportado: {block.type}</p>
        </div>
      )
  }
}

interface Props {
  topic: MockTopic
  progress: MockProgress
}

export default function TopicFlow({ topic, progress }: Props) {
  const tp = progress.topicStatus[topic.id]

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <Link
          href="/app/learning"
          className="text-sm text-navy-blue-600 dark:text-navy-blue-400 hover:underline"
        >
          ← Volver al camino
        </Link>
        <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Quicksand, sans-serif" }}>
          {topic.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">{topic.description}</p>
        {tp && (
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-2 ${
              tp.status === "completed"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : tp.status === "in_progress"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {tp.status === "completed"
              ? "Completado"
              : tp.status === "in_progress"
                ? "En progreso"
                : "No iniciado"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {topic.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
