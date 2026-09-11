"use client";

import { toast } from "sonner";
import type { InfographicBlock as InfographicBlockType } from "@repo/learning/types";
import { Download, Share2 } from "lucide-react";

interface Props {
  block: InfographicBlockType;
}

export default function InfographicBlock({ block }: Props) {
  const { imagePath, altText, title } = block.payload;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title ?? altText,
          url: imagePath,
        });
      } else {
        window.open(imagePath, "_blank", "noopener,noreferrer");
      }
    } catch {
      toast.error("No pudimos compartir la infografía.");
    }
  };

  return (
    <div className="py-6 px-8">
      <figure className="rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePath} alt={altText} className="w-full h-auto" />
        <figcaption className="flex items-center justify-between px-5 py-4">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
            {title ?? "Infografía"}
          </span>
          <div className="flex gap-2">
            <a
              href={imagePath}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-stone-950 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-stone-950 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
