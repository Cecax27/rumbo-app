"use client";

import type { ConceptBlock as ConceptBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: ConceptBlockType;
}

export default function ConceptBlock({ block }: Props) {
  return (
    <div className="py-8 px-8">
      <h3 className="font-semibold text-xl text-stone-900 dark:text-stone-100 leading-snug">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-stone-600 dark:text-stone-400 mt-4 leading-[1.75]">
        <InlineText>{block.payload.body}</InlineText>
      </p>
    </div>
  );
}
