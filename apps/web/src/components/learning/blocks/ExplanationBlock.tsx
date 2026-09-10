"use client";

import type { ExplanationBlock as ExplanationBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: ExplanationBlockType;
}

export default function ExplanationBlock({ block }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 border-l-4 border-l-teal-500">
      <h3 className="font-semibold text-lg">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        <InlineText>{block.payload.body}</InlineText>
      </p>
    </div>
  );
}
