import { notFound } from "next/navigation"
import { MOCK_PATH, MOCK_PROGRESS, type MockBlock } from "../mock-data"

interface PageProps {
  params: Promise<{ topicId: string }>
}

function getStatusBadge(status: string) {
  if (status === "completed") {
    return (
      <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        Completada
      </span>
    )
  }
  if (status === "pending") {
    return (
      <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
        Pendiente
      </span>
    )
  }
  return null
}

function BlockRenderer({ block }: { block: MockBlock }) {
  const payload = block.payload
  const taskProgress = MOCK_PROGRESS.taskStatus[block.id]

  switch (block.type) {
    case "concept":
    case "explanation":
      return (
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold text-lg">{payload.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{payload.body}</p>
        </div>
      )

    case "tip":
      return (
        <div
          className="border-l-4 rounded-r-lg p-4"
          style={{ borderLeftColor: "#f6b23a", backgroundColor: "rgba(246,178,58,0.1)" }}
        >
          <h3 className="font-semibold">{payload.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{payload.body}</p>
        </div>
      )

    case "warning":
      return (
        <div
          className="border-l-4 rounded-r-lg p-4"
          style={{ borderLeftColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)" }}
        >
          <h3 className="font-semibold">{payload.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{payload.body}</p>
        </div>
      )

    case "example":
      return (
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <span className="text-xs uppercase tracking-wide font-semibold text-teal-600 dark:text-teal-400">
            Ejemplo
          </span>
          <h3 className="font-semibold text-lg mt-1">{payload.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">{payload.body}</p>
        </div>
      )

    case "reflection":
      return (
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold text-lg">{payload.title}</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 italic">{payload.prompt}</p>
          <textarea
            className="w-full mt-3 p-3 border rounded-md resize-none text-sm dark:bg-neutral-950 dark:border-neutral-700"
            rows={3}
            placeholder="Escribe tus reflexiones aquí..."
          />
          <button
            type="button"
            className="mt-2 text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
            onClick={() => console.log("Nota guardada (placeholder)")}
          >
            Guardar nota
          </button>
        </div>
      )

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
            {taskProgress && getStatusBadge(taskProgress.status)}
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

export default async function TopicPage({ params }: PageProps) {
  const { topicId } = await params
  const topic = MOCK_PATH.topics.find((t) => t.id === topicId)

  if (!topic) {
    notFound()
  }

  const topicProgress = MOCK_PROGRESS.topicStatus[topic.id]
  const isLocked =
    topic.dependsOn.length > 0 &&
    topic.dependsOn.some((depSlug) => {
      const depTopic = MOCK_PATH.topics.find((t) => t.slug === depSlug)
      if (!depTopic) return true
      const depProgress = MOCK_PROGRESS.topicStatus[depTopic.id]
      return depProgress?.status !== "completed"
    })

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h2 className="text-xl font-semibold">Tema bloqueado</h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
          Debes completar{" "}
          {topic.dependsOn
            .map((d) => MOCK_PATH.topics.find((t) => t.slug === d)?.title)
            .join(", ")}{" "}
          antes de acceder a este tema.
        </p>
        <a
          href="/app/learning"
          className="text-sm text-navy-blue-600 dark:text-navy-blue-400 hover:underline"
        >
          Volver al camino de aprendizaje
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <a
          href="/app/learning"
          className="text-sm text-navy-blue-600 dark:text-navy-blue-400 hover:underline"
        >
          ← Volver al camino
        </a>
        <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Quicksand, sans-serif" }}>
          {topic.title}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">{topic.description}</p>
        {topicProgress && (
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-2 ${
              topicProgress.status === "completed"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : topicProgress.status === "in_progress"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {topicProgress.status === "completed"
              ? "Completado"
              : topicProgress.status === "in_progress"
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
