"use client";

import type { HeadingBlock as HeadingBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: HeadingBlockType;
}

export default function HeadingBlock({ block }: Props) {
  const Tag = block.payload.level === 2 ? "h2" : "h3";
  const className =
    block.payload.level === 2
      ? "text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight"
      : "text-xl font-semibold text-stone-800 dark:text-stone-200";
  return (
    <div className="py-6 px-8">
      <Tag className={className} style={{ fontFamily: "Quicksand, sans-serif" }}>
        <InlineText>{block.payload.text}</InlineText>
      </Tag>
    </div>
  );
}
