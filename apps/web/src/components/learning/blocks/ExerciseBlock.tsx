"use client";

import type { ExerciseBlock as ExerciseBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: ExerciseBlockType;
}

export default function ExerciseBlock({ block }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <h3 className="font-semibold text-lg">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        <InlineText>{block.payload.body}</InlineText>
      </p>
      <div className="mt-3 p-6 border border-dashed rounded-md text-center text-neutral-400 dark:border-neutral-700">
        <p className="text-sm">Interactividad próximamente</p>
      </div>
    </div>
  );
}
