"use client";

import type { ExerciseBlock as ExerciseBlockType } from "@repo/learning/types";
import { PencilRuler } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: ExerciseBlockType;
}

export default function ExerciseBlock({ block }: Props) {
  return (
    <div className="py-8 px-8">
      <div className="flex items-center gap-2 mb-4">
        <PencilRuler className="w-4 h-4 text-stone-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Ejercicio
        </span>
      </div>
      <h3 className="font-semibold text-xl text-stone-900 dark:text-stone-100 leading-snug">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-stone-600 dark:text-stone-400 mt-4 leading-[1.75]">
        <InlineText>{block.payload.body}</InlineText>
      </p>
      <div className="mt-5 p-8 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center bg-stone-50/30 dark:bg-stone-950/20">
        <p className="text-sm text-stone-400">Interactividad próximamente</p>
      </div>
    </div>
  );
}
