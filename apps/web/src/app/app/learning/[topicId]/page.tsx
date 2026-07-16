import { notFound } from "next/navigation"
import { MOCK_PATH, MOCK_PROGRESS } from "../mock-data"
import TopicFlow from "@/components/learning/TopicFlow"

interface PageProps {
  params: Promise<{ topicId: string }>
}

export default async function TopicPage({ params }: PageProps) {
  const { topicId } = await params
  const topic = MOCK_PATH.topics.find((t) => t.id === topicId)

  if (!topic) {
    notFound()
  }

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

  return <TopicFlow topic={topic} progress={MOCK_PROGRESS} />
}
