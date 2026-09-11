"use client";

import type { TableBlock as TableBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: TableBlockType;
}

export default function TableBlock({ block }: Props) {
  const { headers, rows } = block.payload;
  return (
    <div className="py-6 px-8">
      <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-stone-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-900/60">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-semibold text-stone-700 dark:text-stone-200"
                >
                  <InlineText>{header}</InlineText>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="bg-white dark:bg-stone-950 hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 text-stone-600 dark:text-stone-400"
                  >
                    <InlineText>{cell}</InlineText>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
