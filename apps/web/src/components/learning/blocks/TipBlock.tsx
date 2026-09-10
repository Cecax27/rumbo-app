"use client";

import type { TipBlock as TipBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: TipBlockType;
}

export default function TipBlock({ block }: Props) {
  return (
    <div
      className="border-l-4 rounded-r-lg p-4"
      style={{ borderLeftColor: "#f6b23a", backgroundColor: "rgba(246,178,58,0.1)" }}
    >
      <h3 className="font-semibold">
        <InlineText>{block.payload.title}</InlineText>
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mt-1">
        <InlineText>{block.payload.body}</InlineText>
      </p>
    </div>
  );
}
