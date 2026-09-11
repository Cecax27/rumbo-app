"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { TutorialBlock as TutorialBlockType } from "@repo/learning/types";
import { useLearning } from "@/contexts/LearningContext";
import InlineText from "@/components/learning/InlineText";
import EmptyState from "@/components/learning/EmptyState";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

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
    <div className="flex flex-col gap-8 w-full max-w-3xl">
      <Link
        href={`/app/learning/${topic.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-navy-blue-600 dark:hover:text-navy-blue-400 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al tema
      </Link>

      <div>
        <h1
          className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          {tutorial.payload.title}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">
          {tutorial.payload.steps.length} {tutorial.payload.steps.length === 1 ? "paso" : "pasos"}
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {tutorial.payload.steps.map((step, i) => (
          <li
            key={i}
            className="rounded-2xl p-6 bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-sm flex items-center justify-center font-bold tabular-nums">
                {i + 1}
              </span>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                <InlineText>{step.text}</InlineText>
              </p>
            </div>
            {step.imagePath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={step.imagePath}
                alt={`Paso ${i + 1}`}
                className="mt-5 w-full h-auto rounded-xl border border-stone-100 dark:border-stone-900"
              />
            )}
          </li>
        ))}
      </ol>

      {/* Completion note */}
      <div className="flex items-center gap-3 py-6 px-6 rounded-2xl bg-shamrock-50/60 dark:bg-shamrock-950/20 border border-shamrock-100 dark:border-shamrock-900/30">
        <CheckCircle2 className="w-6 h-6 text-shamrock-600 dark:text-shamrock-400 shrink-0" />
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-100">
            Tutorial completado
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Vuelve al tema para seguir aprendiendo.
          </p>
        </div>
        <Link
          href={`/app/learning/${topic.id}`}
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-shamrock-100 text-shamrock-700 hover:bg-shamrock-200 dark:bg-shamrock-950 dark:text-shamrock-300 dark:hover:bg-shamrock-900 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>
    </div>
  );
}
