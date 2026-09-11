"use client";

import { parseInline } from "@repo/learning/markdown";
import type { InlineNode } from "@repo/learning/markdown";

function InlineNodes({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.kind) {
          case "text":
            return <span key={i}>{node.text}</span>;
          case "bold":
            return (
              <strong key={i}>
                <InlineNodes nodes={node.children} />
              </strong>
            );
          case "italic":
            return (
              <em key={i}>
                <InlineNodes nodes={node.children} />
              </em>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default function InlineText({ children }: { children: string }) {
  return <InlineNodes nodes={parseInline(children)} />;
}
