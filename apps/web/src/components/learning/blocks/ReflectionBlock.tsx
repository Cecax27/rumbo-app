"use client";

import { useState } from "react";
import type { ReflectionBlock as ReflectionBlockType } from "@repo/learning/types";
import { MessageSquareQuote, Check } from "lucide-react";
import InlineText from "../InlineText";

interface Props {
  block: ReflectionBlockType;
}

export default function ReflectionBlock({ block }: Props) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="py-6 px-8">
      <div className="rounded-2xl p-6 bg-stone-50 dark:bg-stone-900/40">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareQuote className="w-4 h-4 text-navy-blue-500 dark:text-navy-blue-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-blue-500 dark:text-navy-blue-400">
            Reflexión
          </span>
        </div>
        <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
          <InlineText>{block.payload.title}</InlineText>
        </h3>
        <p className="text-stone-500 dark:text-stone-400 mt-2 italic leading-relaxed">
          <InlineText>{block.payload.prompt}</InlineText>
        </p>
        <textarea
          className="w-full mt-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800 resize-none text-sm bg-white dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-navy-blue-500/20 focus:border-navy-blue-400 transition-all placeholder:text-stone-400"
          rows={3}
          placeholder="Escribe tus reflexiones aquí..."
        />
        <button
          type="button"
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all ${
            saved
              ? "bg-shamrock-100 text-shamrock-700 dark:bg-shamrock-950 dark:text-shamrock-300"
              : "bg-white dark:bg-stone-950 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800"
          }`}
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Guardado" : "Guardar nota"}
        </button>
      </div>
    </div>
  );
}
