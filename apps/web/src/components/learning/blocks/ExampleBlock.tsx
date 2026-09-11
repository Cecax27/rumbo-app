"use client";

import type { ExampleBlock as ExampleBlockType } from "@repo/learning/types";
import { FlaskConical } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: ExampleBlockType;
}

export default function ExampleBlock({ block }: Props) {
  return (
    <div className="py-8 px-8">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-4 h-4 text-stone-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Ejemplo
        </span>
      </div>
      <h3 className="font-semibold text-xl text-stone-900 dark:text-stone-100 leading-snug">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-stone-600 dark:text-stone-400 mt-4 leading-[1.75]">
        <InlineText>{block.payload.body}</InlineText>
      </p>
    </div>
  );
}
