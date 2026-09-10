"use client";

import { useState } from "react";
import type { HabitBlock as HabitBlockType } from "@repo/learning/types";
import { useLearning } from "@/contexts/LearningContext";
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
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 border-l-4 border-l-emerald-500">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          <InlineText>{payload.title}</InlineText>
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isCompleted
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : isTracking
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {isCompleted ? "Hábito completado" : isTracking ? "En seguimiento" : "No iniciado"}
        </span>
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        <InlineText>{payload.description}</InlineText>
      </p>

      {isCompleted ? (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">
          Completaste este hábito.
        </p>
      ) : isTracking ? (
        <div className="mt-3">
          <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Progreso del hábito: {percent}%
          </p>
        </div>
      ) : (
        <button
          type="button"
          disabled={starting}
          onClick={handleStart}
          className="mt-3 text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
        >
          {starting ? "Iniciando..." : "Empezar hábito"}
        </button>
      )}
    </div>
  );
}
