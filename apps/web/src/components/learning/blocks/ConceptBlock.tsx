"use client";

import type { ConceptBlock as ConceptBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: ConceptBlockType;
}

export default function ConceptBlock({ block }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <h3 className="font-semibold text-lg">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        <InlineText>{block.payload.body}</InlineText>
      </p>
    </div>
  );
}
