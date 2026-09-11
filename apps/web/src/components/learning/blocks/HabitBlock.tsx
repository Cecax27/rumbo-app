"use client";

import { useState } from "react";
import type { HabitBlock as HabitBlockType } from "@repo/learning/types";
import { useLearning } from "@/contexts/LearningContext";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: HabitBlockType;
  topicId: string;
}

export default function HabitBlock({ block, topicId }: Props) {
  const { habitProgress, evaluate, startHabit } = useLearning();
  const [starting, setStarting] = useState(false);

  const payload = block.payload;
  const progress = habitProgress.get(`${topicId}:${payload.habitSlug}`);
  const isCompleted = progress?.status === "completed";
  const isTracking = progress?.status === "tracking";
  const evaluation = evaluate(block, topicId);
  const percent = Math.round(evaluation.progress * 100);

  const handleStart = async () => {
    setStarting(true);
    await startHabit(topicId, payload.habitSlug);
    setStarting(false);
  };

  return (
    <div className="py-6 px-8">
      <div className="rounded-2xl p-6 bg-shamrock-50/40 dark:bg-shamrock-950/15 border border-shamrock-100 dark:border-shamrock-900/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-shamrock-100 dark:bg-shamrock-900/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-shamrock-600 dark:text-shamrock-400" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-shamrock-600 dark:text-shamrock-400">
                Hábito
              </span>
              <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 leading-snug">
                <InlineText>{payload.title}</InlineText>
              </h3>
            </div>
          </div>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 mt-1 ${
              isCompleted
                ? "bg-shamrock-100 text-shamrock-700 dark:bg-shamrock-950 dark:text-shamrock-300"
                : isTracking
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400"
            }`}
          >
            {isCompleted ? "Completado" : isTracking ? "En seguimiento" : "Sin iniciar"}
          </span>
        </div>

        <p className="text-stone-600 dark:text-stone-400 mt-4 leading-[1.75] pl-[52px]">
          <InlineText>{payload.description}</InlineText>
        </p>

        {isCompleted ? (
          <div className="mt-5 pl-[52px] flex items-center gap-2 text-sm text-shamrock-700 dark:text-shamrock-300 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completaste este hábito.
          </div>
        ) : isTracking ? (
          <div className="mt-5 pl-[52px]">
            <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-shamrock-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-stone-400">
              Progreso del hábito:{" "}
              <span className="font-medium text-stone-600 dark:text-stone-300">{percent}%</span>
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled={starting}
            onClick={handleStart}
            className="mt-5 ml-[52px] inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-shamrock-100 text-shamrock-700 hover:bg-shamrock-200 dark:bg-shamrock-950 dark:text-shamrock-300 dark:hover:bg-shamrock-900 transition-colors disabled:opacity-60"
          >
            {starting && <Loader2 className="w-4 h-4 animate-spin" />}
            {starting ? "Iniciando..." : "Empezar hábito"}
          </button>
        )}
      </div>
    </div>
  );
}
