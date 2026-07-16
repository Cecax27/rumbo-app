"use client"

interface Props {
  title: string
  description: string
  status: "pending" | "completed"
  validationMode: "automatic" | "manual"
  evaluatedAt?: string | null
  onComplete?: () => void
  onEvaluate?: () => void
}

export default function FollowupTaskCard({
  title,
  description,
  status,
  validationMode,
  evaluatedAt,
  onComplete,
  onEvaluate,
}: Props) {
  const isCompleted = status === "completed"

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isCompleted
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          }`}
        >
          {isCompleted ? "Completada" : "Pendiente"}
        </span>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">{description}</p>
      <p className="mt-2 text-xs text-neutral-400">
        Tarea de seguimiento{" · "}
        {validationMode === "automatic" ? "Validación automática" : "Validación manual"}
      </p>
      {!isCompleted && (
        <div className="mt-3 flex gap-2">
          {validationMode === "manual" && (
            <button
              type="button"
              className="text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
              onClick={onComplete}
            >
              Marcar como hecho
            </button>
          )}
          {validationMode === "automatic" && (
            <button
              type="button"
              className="text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
              onClick={onEvaluate}
            >
              Revisar ahora
            </button>
          )}
        </div>
      )}
      {evaluatedAt && (
        <p className="text-xs text-neutral-400 mt-2">
          Última revisión: {new Date(evaluatedAt).toLocaleDateString("es-MX")}
        </p>
      )}
    </div>
  )
}
