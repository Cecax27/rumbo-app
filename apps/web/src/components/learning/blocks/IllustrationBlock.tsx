"use client";

import type { IllustrationBlock as IllustrationBlockType } from "@repo/learning/types";

interface Props {
  block: IllustrationBlockType;
}

export default function IllustrationBlock({ block }: Props) {
  const { imagePath, altText, caption } = block.payload;
  return (
    <figure className="border rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagePath} alt={altText} className="w-full h-auto" />
      {caption && (
        <figcaption className="p-3 text-sm text-neutral-500 dark:text-neutral-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
