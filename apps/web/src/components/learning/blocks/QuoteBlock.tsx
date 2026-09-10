"use client";

import type { QuoteBlock as QuoteBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: QuoteBlockType;
}

export default function QuoteBlock({ block }: Props) {
  return (
    <blockquote className="border-l-4 border-l-teal-400 pl-4 py-1 italic text-neutral-600 dark:text-neutral-400">
      <p>
        <InlineText>{block.payload.text}</InlineText>
      </p>
      {block.payload.author && (
        <footer className="mt-1 text-sm not-italic text-neutral-400">
          — {block.payload.author}
        </footer>
      )}
    </blockquote>
  );
}
