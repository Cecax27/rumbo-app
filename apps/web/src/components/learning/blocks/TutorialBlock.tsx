"use client";

import Link from "next/link";
import type { TutorialBlock as TutorialBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: TutorialBlockType;
  topicId: string;
  index: number;
}

export default function TutorialBlock({ block, topicId, index }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 border-l-4 border-l-navy-blue-500">
      <h3 className="font-semibold text-lg">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        {block.payload.steps.length} pasos
      </p>
      <Link
        href={`/app/learning/${topicId}/tutorial/${index}`}
        className="inline-block mt-3 text-sm px-3 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
      >
        Abrir tutorial
      </Link>
    </div>
  );
}
