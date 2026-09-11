"use client";

import type { TipBlock as TipBlockType } from "@repo/learning/types";
import { Lightbulb } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: TipBlockType;
}

export default function TipBlock({ block }: Props) {
  return (
    <div className="py-6 px-8">
      <div className="rounded-2xl p-6 bg-amber-50/60 dark:bg-amber-950/20 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            <InlineText>{block.payload.title}</InlineText>
          </h3>
          <p className="text-stone-600 dark:text-stone-400 mt-2 leading-[1.7]">
            <InlineText>{block.payload.body}</InlineText>
          </p>
        </div>
      </div>
    </div>
  );
}
