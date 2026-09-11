"use client";

import Image from "next/image";
import type { LearningLevel, LearningTopic, TopicProgress } from "@repo/learning/types";
import { levelCompletionPercentage } from "@repo/learning/progress";
import { CheckCircle2, MapPin } from "lucide-react";

interface LearningHeroProps {
  levels: LearningLevel[];
  topicsByLevel: Map<string, LearningTopic[]>;
  progressByTopic: Map<string, TopicProgress>;
  currentLevelIndex: number | null;
  totalLevels: number;
  overallPercent: number;
}

export default function LearningHero({
  levels,
  topicsByLevel,
  progressByTopic,
  currentLevelIndex,
  totalLevels,
  overallPercent,
}: LearningHeroProps) {
  const imageLevel = currentLevelIndex != null ? currentLevelIndex - 1 : 0;
  const imageSrc = `/images/learning/${imageLevel}.png`;

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row">
          {/* Left: Text & Progress */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-navy-blue-100 text-navy-blue-700 dark:bg-navy-blue-950 dark:text-navy-blue-300">
                  <MapPin className="w-3 h-3" />
                  {currentLevelIndex !== null
                    ? `Nivel ${currentLevelIndex} de ${totalLevels}`
                    : "Comienza tu camino"}
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight"
                style={{ fontFamily: "Quicksand, sans-serif" }}
              >
                Camino de aprendizaje
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-2 text-base leading-relaxed max-w-md">
                {overallPercent > 0
                  ? `Llevas un ${overallPercent}% del camino. Cada nivel te acerca a unas finanzas más sanas.`
                  : "Empieza desde cero y construye hábitos financieros sólidos, paso a paso."}
              </p>
            </div>

            {/* Segmented Progress Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
                <span className="font-medium">Progreso general</span>
                <span className="tabular-nums font-semibold text-stone-600 dark:text-stone-400">
                  {overallPercent}%
                </span>
              </div>
              <div className="flex gap-1.5">
                {levels.map((level) => {
                  const percent = levelCompletionPercentage(
                    level,
                    topicsByLevel,
                    progressByTopic,
                  );
                  const isCompleted = percent === 100;
                  const isCurrent = level.order === currentLevelIndex;

                  return (
                    <div key={level.id} className="flex-1 flex flex-col gap-1.5 group">
                      <div className="h-2.5 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isCompleted
                              ? "bg-shamrock-500"
                              : isCurrent
                                ? "bg-navy-blue-500"
                                : "bg-stone-200 dark:bg-stone-800"
                          }`}
                          style={{
                            width: isCompleted || isCurrent ? "100%" : "0%",
                          }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold text-center tabular-nums transition-colors ${
                          isCompleted
                            ? "text-shamrock-600 dark:text-shamrock-400"
                            : isCurrent
                              ? "text-navy-blue-600 dark:text-navy-blue-400"
                              : "text-stone-300 dark:text-stone-700"
                        }`}
                      >
                        {level.order}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="relative w-full md:w-64 lg:w-80 shrink-0 bg-stone-50 dark:bg-stone-900/30 flex items-center justify-center p-8 md:p-10">
            <div className="relative w-full aspect-square max-w-[200px]">
              <Image
                src={imageSrc}
                alt={`Ilustración del nivel ${imageLevel}`}
                fill
                className="object-contain"
                priority
                onError={(e) => {
                  // Fallback to 0.png if level-specific image doesn't exist
                  const img = e.target as HTMLImageElement;
                  if (img.src !== "/images/learning/0.png") {
                    img.src = "/images/learning/0.png";
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
