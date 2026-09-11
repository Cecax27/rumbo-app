"use client";

import type { IllustrationBlock as IllustrationBlockType } from "@repo/learning/types";

interface Props {
  block: IllustrationBlockType;
}

export default function IllustrationBlock({ block }: Props) {
  const { imagePath, altText, caption } = block.payload;
  return (
    <div className="py-6 px-8">
      <figure className="rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePath} alt={altText} className="w-full h-auto" />
        {caption && (
          <figcaption className="px-5 py-4 text-sm text-stone-500 dark:text-stone-400">
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
