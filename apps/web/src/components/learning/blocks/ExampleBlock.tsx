"use client";

import type { ExampleBlock as ExampleBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: ExampleBlockType;
}

export default function ExampleBlock({ block }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
      <span className="text-xs uppercase tracking-wide font-semibold text-teal-600 dark:text-teal-400">
        Ejemplo
      </span>
      <h3 className="font-semibold text-lg mt-1">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        <InlineText>{block.payload.body}</InlineText>
      </p>
    </div>
  );
}
