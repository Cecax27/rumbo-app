"use client";

import Link from "next/link";
import type { TutorialBlock as TutorialBlockType } from "@repo/learning/types";
import { BookOpenText, ArrowRight } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: TutorialBlockType;
  topicId: string;
  index: number;
}

export default function TutorialBlock({ block, topicId, index }: Props) {
  return (
    <div className="py-6 px-8">
      <div className="rounded-2xl p-6 bg-navy-blue-50/60 dark:bg-navy-blue-950/20 border border-navy-blue-100 dark:border-navy-blue-900/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-navy-blue-100 dark:bg-navy-blue-900/40 flex items-center justify-center shrink-0">
          <BookOpenText className="w-5 h-5 text-navy-blue-600 dark:text-navy-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-blue-500 dark:text-navy-blue-400">
            Tutorial
          </span>
          <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 mt-1">
            <InlineText>{block.payload.title}</InlineText>
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {block.payload.steps.length} {block.payload.steps.length === 1 ? "paso" : "pasos"}
          </p>
          <Link
            href={`/app/learning/${topicId}/tutorial/${index}`}
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium px-4 py-2 rounded-xl bg-white dark:bg-stone-950 text-navy-blue-700 hover:bg-navy-blue-50 dark:text-navy-blue-300 dark:hover:bg-navy-blue-950 border border-navy-blue-200 dark:border-navy-blue-900 transition-colors"
          >
            Abrir tutorial
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
