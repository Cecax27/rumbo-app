"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { TutorialBlock as TutorialBlockType } from "@repo/learning/types";
import { useLearning } from "@/contexts/LearningContext";
import InlineText from "@/components/learning/InlineText";
import EmptyState from "@/components/learning/EmptyState";
import { quicksand } from "../../../../../ui/fonts";

interface PageProps {
  params: Promise<{ topicId: string; tutorialId: string }>;
}

export default function TutorialPage({ params }: PageProps) {
  const { topicId, tutorialId } = use(params);
  const { content, loading } = useLearning();

  if (loading && !content) {
    return <EmptyState message="Cargando contenido..." />;
  }

  const topic = content?.topics.find((t) => t.id === topicId);
  if (!topic) notFound();

  const index = Number.parseInt(tutorialId, 10);
  const block = topic.blocks[index];
  if (!block || block.type !== "tutorial") notFound();

  const tutorial = block as TutorialBlockType;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <Link
          href={`/app/learning/${topic.id}`}
          className="text-sm text-navy-blue-600 dark:text-navy-blue-400 hover:underline"
        >
          ← Volver al tema
        </Link>
        <h1
          className={`${quicksand.className} text-2xl font-bold mt-2 text-neutral-700 dark:text-neutral-200`}
        >
          {tutorial.payload.title}
        </h1>
      </div>

      <ol className="flex flex-col gap-4">
        {tutorial.payload.steps.map((step, i) => (
          <li key={i} className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white text-sm flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <p className="text-neutral-600 dark:text-neutral-400">
                <InlineText>{step.text}</InlineText>
              </p>
            </div>
            {step.imagePath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={step.imagePath}
                alt={`Paso ${i + 1}`}
                className="mt-3 w-full h-auto border rounded-md"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
