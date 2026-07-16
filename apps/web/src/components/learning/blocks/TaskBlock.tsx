"use client"

import type { MockBlock } from "@/app/app/learning/mock-data"

interface Props {
  block: MockBlock
  taskProgress: {
    status: "pending" | "completed"
    completedAt: string | null
    evaluatedAt: string | null
  } | undefined
}

export default function TaskBlock({ block, taskProgress }: Props) {
  const payload = block.payload
  const isCompleted = taskProgress?.status === "completed"

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{payload.title}</h3>
        {taskProgress && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              isCompleted
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            }`}
          >
            {isCompleted ? "Completada" : "Pendiente"}
          </span>
        )}
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">{payload.description}</p>
      {block.taskDefinition && (
        <div className="mt-2 text-xs text-neutral-400">
          {block.taskDefinition.taskKind === "achievement"
            ? "Tarea de logro"
            : "Tarea de seguimiento"}
          {" · "}
          {block.taskDefinition.validationMode === "automatic"
            ? "Validación automática"
            : "Validación manual"}
        </div>
      )}
      {block.taskDefinition && !isCompleted && (
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
          Última revisión:{" "}
          {new Date(taskProgress.evaluatedAt).toLocaleDateString("es-MX")}
        </p>
      )}
    </div>
  )
}
