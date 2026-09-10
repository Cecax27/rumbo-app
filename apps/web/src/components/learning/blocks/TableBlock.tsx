"use client";

import type { TableBlock as TableBlockType } from "@repo/learning/types";
import InlineText from "../InlineText";

interface Props {
  block: TableBlockType;
}

export default function TableBlock({ block }: Props) {
  const { headers, rows } = block.payload;
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200"
              >
                <InlineText>{header}</InlineText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-t border-neutral-200 dark:border-neutral-800"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 text-neutral-600 dark:text-neutral-400"
                >
                  <InlineText>{cell}</InlineText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
