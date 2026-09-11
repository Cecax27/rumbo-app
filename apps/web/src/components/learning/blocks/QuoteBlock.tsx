"use client";

import type { QuoteBlock as QuoteBlockType } from "@repo/learning/types";
import { Quote } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: QuoteBlockType;
}

export default function QuoteBlock({ block }: Props) {
  return (
    <div className="py-8 px-8">
      <figure className="relative">
        <Quote className="w-8 h-8 text-stone-200 dark:text-stone-800 mb-3" />
        <blockquote className="text-xl italic text-stone-700 dark:text-stone-300 leading-relaxed pl-2">
          <InlineText>{block.payload.text}</InlineText>
        </blockquote>
        {block.payload.author && (
          <figcaption className="mt-4 pl-2 text-sm text-stone-400 dark:text-stone-500">
            — {block.payload.author}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
