"use client";

import type { ExplanationBlock as ExplanationBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: ExplanationBlockType;
}

export default function ExplanationBlock({ block }: Props) {
  return (
    <div className="py-8 px-8">
      <div className="border-l-2 border-navy-blue-400 dark:border-navy-blue-600 pl-6">
        <h3 className="font-semibold text-xl text-stone-900 dark:text-stone-100 leading-snug">
          <InlineText>{block.payload.title}</InlineText>
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mt-4 leading-[1.75]">
          <InlineText>{block.payload.body}</InlineText>
        </p>
      </div>
    </div>
  );
}
