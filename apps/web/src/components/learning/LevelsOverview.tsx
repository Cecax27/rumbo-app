"use client";

import Link from "next/link";
import type { LearningLevel, LearningTopic } from "@repo/learning/types";
import {
  computePosition,
  groupTopicsByLevel,
  hasHabit,
  levelCompletionPercentage,
} from "@repo/learning/progress";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { useLearning } from "@/contexts/LearningContext";
import EmptyState from "./EmptyState";

interface TopicCardProps {
  topic: LearningTopic;
  completed: boolean;
  inProgress: boolean;
}

function TopicCard({ topic, completed, inProgress }: TopicCardProps) {
  const badge = completed
    ? { label: "Completado", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" }
    : inProgress
      ? { label: "En progreso", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" }
      : { label: "No iniciado", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" };

  return (
    <Link href={`/app/learning/${topic.id}`} className="block">
      <div className="border rounded-lg p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{topic.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {topic.description}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
          {hasHabit(topic) && <span>Incluye hábito</span>}
          {topic.isSample && <span>· Ejemplo</span>}
        </div>
      </div>
    </Link>
  );
}

interface LevelCardProps {
  level: LearningLevel;
  topics: LearningTopic[];
  isCurrent: boolean;
  percent: number;
  completedMap: Map<string, boolean>;
  inProgressMap: Map<string, boolean>;
}

function LevelCard({ level, topics, isCurrent, percent, completedMap, inProgressMap }: LevelCardProps) {
  const { reset } = useLearning();

  const handleReset = async () => {
    const confirmed = window.confirm(
      "¿Reiniciar el progreso de este nivel? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;
    const { error } = await reset({ kind: "level", levelId: level.id });
    if (error) {
      toast.error("No pudimos reiniciar el progreso. Inténtalo de nuevo.");
      return;
    }
    toast.success("Progreso del nivel reiniciado.");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {level.title}
          {isCurrent && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full font-medium bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
              Nivel actual
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            {percent}%
          </span>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar nivel"
            title="Reiniciar nivel"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {level.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{level.description}</p>
      )}
      <div className="flex flex-col gap-3 mt-1">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            completed={completedMap.get(topic.id) ?? false}
            inProgress={inProgressMap.get(topic.id) ?? false}
          />
        ))}
      </div>
    </div>
  );
}

export default function LevelsOverview() {
  const { content, topicProgress, loading, error } = useLearning();

  if (loading && !content) {
    return <EmptyState message="Cargando contenido..." />;
  }

  if (error && !content) {
    return <EmptyState message="No pudimos cargar el contenido. Reintenta más tarde." />;
  }

  if (!content) {
    return <EmptyState message="Aún no hay contenido disponible." />;
  }

  const progressByTopic = new Map(
    Array.from(topicProgress.values()).map((p) => [p.topicId, p]),
  );

  const topicsByLevel = groupTopicsByLevel(content.levels, content.topics);
  const position = computePosition(content.levels, topicsByLevel, progressByTopic);

  // Keep only levels that have content, ordered.
  const visibleLevels = [...content.levels]
    .filter((level) => (topicsByLevel.get(level.id) ?? []).length > 0)
    .sort((a, b) => a.order - b.order);

  const completedMap = new Map<string, boolean>();
  const inProgressMap = new Map<string, boolean>();
  for (const [topicId, p] of topicProgress) {
    if (p.status === "completed") completedMap.set(topicId, true);
    else inProgressMap.set(topicId, true);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Quicksand, sans-serif" }}>
          Camino de aprendizaje
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {position.currentLevelIndex !== null
            ? `Nivel ${position.currentLevelIndex} de ${position.totalLevels}`
            : "Próximamente habrá contenido disponible."}
        </p>
      </div>

      {visibleLevels.length === 0 ? (
        <EmptyState
          message="Aún no hay niveles disponibles en este camino de aprendizaje."
          actionLabel="Volver al inicio"
          actionHref="/app/home"
        />
      ) : (
        visibleLevels.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            topics={topicsByLevel.get(level.id) ?? []}
            isCurrent={position.currentLevel?.id === level.id}
            percent={levelCompletionPercentage(level, topicsByLevel, progressByTopic)}
            completedMap={completedMap}
            inProgressMap={inProgressMap}
          />
        ))
      )}
    </div>
  );
}
