"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { LearningLevel, LearningTopic } from "@repo/learning/types";
import {
  computePosition,
  groupTopicsByLevel,
  hasHabit,
  levelCompletionPercentage,
} from "@repo/learning/progress";
import { toast } from "sonner";
import {
  RotateCcw,
  CheckCircle2,
  Circle,
  CircleDot,
  Sparkles,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useLearning } from "@/contexts/LearningContext";
import EmptyState from "./EmptyState";
import LearningHero from "./LearningHero";

/* ─── Topic Card ─── */
interface TopicCardProps {
  topic: LearningTopic;
  completed: boolean;
  inProgress: boolean;
}

function TopicCard({ topic, completed, inProgress }: TopicCardProps) {
  return (
    <Link href={`/app/learning/${topic.id}`} className="group block">
      <div className="relative flex items-start gap-4 py-4 pr-4 pl-12 rounded-xl transition-all duration-300 hover:bg-stone-100/60 dark:hover:bg-stone-900/40">
        {/* Connector dot */}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {completed ? (
            <CheckCircle2
              className="w-5 h-5 text-shamrock-600 dark:text-shamrock-400"
              strokeWidth={2.5}
            />
          ) : inProgress ? (
            <CircleDot
              className="w-5 h-5 text-amber-500 dark:text-amber-400"
              strokeWidth={2.5}
            />
          ) : (
            <Circle
              className="w-5 h-5 text-stone-300 dark:text-stone-700"
              strokeWidth={2}
            />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-navy-blue-700 dark:group-hover:text-navy-blue-400 transition-colors truncate">
              {topic.title}
            </h3>
            {completed && (
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-shamrock-100 text-shamrock-700 dark:bg-shamrock-950 dark:text-shamrock-300">
                Listo
              </span>
            )}
            {inProgress && (
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Ahora
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
            {topic.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
            {hasHabit(topic) && (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Hábito
              </span>
            )}
            {topic.isSample && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Ejemplo
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Level Section ─── */
interface LevelSectionProps {
  level: LearningLevel;
  topics: LearningTopic[];
  isCurrent: boolean;
  percent: number;
  completedMap: Map<string, boolean>;
  inProgressMap: Map<string, boolean>;
  isFirst: boolean;
  isLast: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

function LevelSection({
  level,
  topics,
  isCurrent,
  percent,
  completedMap,
  inProgressMap,
  isFirst,
  isLast,
  isOpen,
  onToggle,
}: LevelSectionProps) {
  const { reset } = useLearning();

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <section className="relative">
      {/* Vertical trail line */}
      {!isFirst && (
        <div className="absolute left-[27px] -top-6 w-px h-6 bg-stone-200 dark:bg-stone-800" />
      )}
      {!isLast && isOpen && (
        <div className="absolute left-[27px] top-14 bottom-0 w-px h-[calc(100%-3.5rem)] bg-stone-200 dark:bg-stone-800" />
      )}

      {/* Level header — clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 mb-2 text-left group"
      >
        <div
          className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 transition-colors ${
            percent === 100
              ? "bg-shamrock-100 text-shamrock-700 dark:bg-shamrock-950 dark:text-shamrock-300"
              : isCurrent
                ? "bg-navy-blue-100 text-navy-blue-700 dark:bg-navy-blue-950 dark:text-navy-blue-300"
                : "bg-stone-100 text-stone-500 dark:bg-stone-900 dark:text-stone-500"
          }`}
        >
          <span className="text-lg font-bold tabular-nums">{level.order}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 truncate group-hover:text-navy-blue-700 dark:group-hover:text-navy-blue-400 transition-colors">
              {level.title}
            </h2>
            {isCurrent && (
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-blue-100 text-navy-blue-700 dark:bg-navy-blue-950 dark:text-navy-blue-300">
                Tu nivel
              </span>
            )}
          </div>
          {level.description && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {level.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400 tabular-nums">
            {percent}%
          </span>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar nivel"
            title="Reiniciar nivel"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <ChevronDown
            className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div className="ml-[72px] mb-1 h-1.5 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percent === 100
                ? "bg-shamrock-500"
                : isCurrent
                  ? "bg-navy-blue-500"
                  : "bg-stone-300 dark:bg-stone-700"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Topics */}
        <div className="ml-14 mt-2 border border-stone-100 dark:border-stone-900 rounded-2xl bg-white dark:bg-stone-950/50 divide-y divide-stone-50 dark:divide-stone-900/60">
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
    </section>
  );
}

/* ─── Main Component ─── */
export default function LevelsOverview() {
  const { content, topicProgress, loading, error } = useLearning();

  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set());

  const toggleLevel = useCallback((levelId: string) => {
    setOpenLevels((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) {
        next.delete(levelId);
      } else {
        next.add(levelId);
      }
      return next;
    });
  }, []);

  if (loading && !content) {
    return <EmptyState message="Cargando contenido..." />;
  }

  if (error && !content) {
    return (
      <EmptyState message="No pudimos cargar el contenido. Reintenta más tarde." />
    );
  }

  if (!content) {
    return <EmptyState message="Aún no hay contenido disponible." />;
  }

  const progressByTopic = new Map(
    Array.from(topicProgress.values()).map((p) => [p.topicId, p]),
  );

  const topicsByLevel = groupTopicsByLevel(content.levels, content.topics);
  const position = computePosition(
    content.levels,
    topicsByLevel,
    progressByTopic,
  );

  const visibleLevels = [...content.levels]
    .filter((level) => (topicsByLevel.get(level.id) ?? []).length > 0)
    .sort((a, b) => a.order - b.order);

  const completedMap = new Map<string, boolean>();
  const inProgressMap = new Map<string, boolean>();
  for (const [topicId, p] of topicProgress) {
    if (p.status === "completed") completedMap.set(topicId, true);
    else inProgressMap.set(topicId, true);
  }

  const overallPercent =
    visibleLevels.length > 0
      ? Math.round(
          visibleLevels.reduce(
            (sum, level) =>
              sum +
              levelCompletionPercentage(level, topicsByLevel, progressByTopic),
            0,
          ) / visibleLevels.length,
        )
      : 0;

  // Default open: current level, or first level if none current
  const defaultOpenId =
    position.currentLevel?.id ?? visibleLevels[0]?.id ?? null;

  // Only use default on first render when openLevels is empty
  const effectiveOpenLevels =
    openLevels.size === 0 && defaultOpenId
      ? new Set([defaultOpenId])
      : openLevels;

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl">
      {/* Hero */}
      <LearningHero
        levels={visibleLevels}
        topicsByLevel={topicsByLevel}
        progressByTopic={progressByTopic}
        currentLevelIndex={position.currentLevelIndex}
        totalLevels={position.totalLevels}
        overallPercent={overallPercent}
      />

      {/* Levels */}
      {visibleLevels.length === 0 ? (
        <EmptyState
          message="Aún no hay niveles disponibles en este camino de aprendizaje."
          actionLabel="Volver al inicio"
          actionHref="/app/home"
        />
      ) : (
        <div className="flex flex-col gap-10">
          {visibleLevels.map((level, idx) => (
            <LevelSection
              key={level.id}
              level={level}
              topics={topicsByLevel.get(level.id) ?? []}
              isCurrent={position.currentLevel?.id === level.id}
              percent={levelCompletionPercentage(
                level,
                topicsByLevel,
                progressByTopic,
              )}
              completedMap={completedMap}
              inProgressMap={inProgressMap}
              isFirst={idx === 0}
              isLast={idx === visibleLevels.length - 1}
              isOpen={effectiveOpenLevels.has(level.id)}
              onToggle={() => toggleLevel(level.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
