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
      ? "text-xl font-bold mt-4"
      : "text-lg font-semibold mt-2";
  return (
    <Tag className={className}>
      <InlineText>{block.payload.text}</InlineText>
    </Tag>
  );
}
