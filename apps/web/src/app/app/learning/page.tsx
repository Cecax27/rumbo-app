import { MOCK_PATH, MOCK_PROGRESS } from "./mock-data"

export default function LearningPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
        {MOCK_PATH.title}
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        {MOCK_PATH.description}
      </p>

      <div className="flex flex-col gap-4">
        {MOCK_PATH.topics.map((topic) => {
          const progress = MOCK_PROGRESS.topicStatus[topic.id]
          const isLocked =
            topic.dependsOn.length > 0 &&
            topic.dependsOn.some((depSlug) => {
              const depTopic = MOCK_PATH.topics.find((t) => t.slug === depSlug)
              if (!depTopic) return true
              const depProgress = MOCK_PROGRESS.topicStatus[depTopic.id]
              return depProgress?.status !== "completed"
            })

          return (
            <a
              key={topic.id}
              href={isLocked ? "#" : `/app/learning/${topic.id}`}
              className={`block border rounded-lg p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                isLocked ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{topic.title}</h2>
                {progress && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      progress.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : progress.status === "in_progress"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {progress.status === "completed"
                      ? "Completado"
                      : progress.status === "in_progress"
                        ? "En progreso"
                        : isLocked
                          ? `Requiere: ${topic.dependsOn.map((d) => MOCK_PATH.topics.find((t) => t.slug === d)?.title).join(", ")}`
                          : "No iniciado"}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {topic.description}
              </p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
