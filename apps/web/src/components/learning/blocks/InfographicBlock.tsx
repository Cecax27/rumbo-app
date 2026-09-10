"use client";

import { toast } from "sonner";
import type { InfographicBlock as InfographicBlockType } from "@repo/learning/types";

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
    <figure className="border rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagePath} alt={altText} className="w-full h-auto" />
      <figcaption className="flex items-center justify-between p-3">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {title ?? "Infografía"}
        </span>
        <div className="flex gap-2">
          <a
            href={imagePath}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
          >
            Descargar
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="text-xs px-2 py-1 bg-navy-blue-50 dark:bg-navy-blue-900 rounded-md hover:bg-navy-blue-100 dark:hover:bg-navy-blue-800"
          >
            Compartir
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
