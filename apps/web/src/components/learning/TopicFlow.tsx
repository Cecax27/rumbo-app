"use client";

import Link from "next/link";
import type { Block, LearningTopic } from "@repo/learning/types";
import { toast } from "sonner";
import { RotateCcw, ArrowLeft, CheckCircle2, CircleDot, Circle } from "lucide-react";
import { useLearning } from "@/contexts/LearningContext";
import ConceptBlock from "./blocks/ConceptBlock";
import ExplanationBlock from "./blocks/ExplanationBlock";
import TipBlock from "./blocks/TipBlock";
import WarningBlock from "./blocks/WarningBlock";
import ExampleBlock from "./blocks/ExampleBlock";
import ReflectionBlock from "./blocks/ReflectionBlock";
import ExerciseBlock from "./blocks/ExerciseBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import TableBlock from "./blocks/TableBlock";
import InfographicBlock from "./blocks/InfographicBlock";
import IllustrationBlock from "./blocks/IllustrationBlock";
import TutorialBlock from "./blocks/TutorialBlock";
import HabitBlock from "./blocks/HabitBlock";
import EmptyState from "./EmptyState";

/* ─── Single article sheet ─── */
function ArticleSheet({ children }: { children: React.ReactNode }) {
  return (
    <article className="w-full rounded-3xl bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {children}
    </article>
  );
}

/* ─── Block renderer ─── */
function BlockRenderer({
  block,
  topicId,
  index,
  isFirst,
  isLast,
}: {
  block: Block;
  topicId: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const common = { isFirst, isLast };

  switch (block.type) {
    case "concept":
      return <ConceptBlock block={block} {...common} />;
    case "explanation":
      return <ExplanationBlock block={block} {...common} />;
    case "tip":
      return <TipBlock block={block} {...common} />;
    case "warning":
      return <WarningBlock block={block} {...common} />;
    case "example":
      return <ExampleBlock block={block} {...common} />;
    case "reflection":
      return <ReflectionBlock block={block} {...common} />;
    case "exercise":
      return <ExerciseBlock block={block} {...common} />;
    case "heading":
      return <HeadingBlock block={block} {...common} />;
    case "quote":
      return <QuoteBlock block={block} {...common} />;
    case "table":
      return <TableBlock block={block} {...common} />;
    case "infographic":
      return <InfographicBlock block={block} {...common} />;
    case "illustration":
      return <IllustrationBlock block={block} {...common} />;
    case "tutorial":
      return <TutorialBlock block={block} topicId={topicId} index={index} {...common} />;
    case "habit":
      return <HabitBlock block={block} topicId={topicId} {...common} />;
    default:
      return (
        <div className="py-6 px-8 opacity-70">
          <h3 className="font-semibold text-stone-800 dark:text-stone-200">Bloque</h3>
          <p className="text-sm text-stone-400 mt-1">Tipo de bloque no soportado.</p>
        </div>
      );
  }
}

/* ─── Separator between blocks ─── */
function BlockSeparator() {
  return (
    <div className="px-8">
      <div className="h-px bg-stone-100 dark:bg-stone-900" />
    </div>
  );
}

interface Props {
  topic: LearningTopic;
}

export default function TopicFlow({ topic }: Props) {
  const { topicProgress, reset } = useLearning();
  const tp = topicProgress.get(topic.id);

  const handleReset = async () => {
    const confirmed = window.confirm(
      "¿Reiniciar el progreso de este tema? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;
    const { error } = await reset({ kind: "topic", topicId: topic.id });
    if (error) {
      toast.error("No pudimos reiniciar el progreso. Inténtalo de nuevo.");
      return;
    }
    toast.success("Progreso del tema reiniciado.");
  };

  const statusIcon =
    tp?.status === "completed" ? (
      <CheckCircle2 className="w-5 h-5 text-shamrock-600 dark:text-shamrock-400" />
    ) : tp?.status === "in_progress" ? (
      <CircleDot className="w-5 h-5 text-amber-500 dark:text-amber-400" />
    ) : (
      <Circle className="w-5 h-5 text-stone-300 dark:text-stone-700" />
    );

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl pb-20">
      {/* Back link */}
      <Link
        href="/app/learning"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-navy-blue-600 dark:hover:text-navy-blue-400 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al camino
      </Link>

      {/* Topic header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {statusIcon}
            {tp && (
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  tp.status === "completed"
                    ? "bg-shamrock-100 text-shamrock-700 dark:bg-shamrock-950 dark:text-shamrock-300"
                    : tp.status === "in_progress"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400"
                }`}
              >
                {tp.status === "completed"
                  ? "Completado"
                  : tp.status === "in_progress"
                    ? "En progreso"
                    : "No iniciado"}
              </span>
            )}
          </div>
          <h1
            className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight"
            style={{ fontFamily: "Quicksand, sans-serif" }}
          >
            {topic.title}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-base leading-relaxed max-w-2xl">
            {topic.description}
          </p>
        </div>

        {tp && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar tema"
            title="Reiniciar tema"
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors shrink-0 mt-8"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Content article */}
      <ArticleSheet>
        {topic.blocks.length === 0 ? (
          <div className="py-16">
            <EmptyState message="Este tema aún no tiene contenido." />
          </div>
        ) : (
          topic.blocks.map((block, index) => (
            <div key={block.id}>
              <BlockRenderer
                block={block}
                topicId={topic.id}
                index={index}
                isFirst={index === 0}
                isLast={index === topic.blocks.length - 1}
              />
              {index < topic.blocks.length - 1 && <BlockSeparator />}
            </div>
          ))
        )}

        {/* Completion CTA inside the sheet */}
        <TopicCompletion topic={topic} />
      </ArticleSheet>
    </div>
  );
}

function TopicCompletion({ topic }: { topic: LearningTopic }) {
  const { topicProgress, markComplete } = useLearning();
  const hasHabit = topic.blocks.some((b) => b.type === "habit");
  const tp = topicProgress.get(topic.id);

  if (tp?.status === "completed") {
    return (
      <div className="flex items-center gap-3 py-8 px-8 border-t border-stone-100 dark:border-stone-900">
        <CheckCircle2 className="w-5 h-5 text-shamrock-600 dark:text-shamrock-400" />
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Tema completado
        </p>
      </div>
    );
  }

  if (hasHabit) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 px-8 border-t border-stone-100 dark:border-stone-900">
      <p className="text-stone-500 dark:text-stone-400 text-sm">
        ¿Ya aplicaste lo que aprendiste?
      </p>
      <button
        type="button"
        onClick={() => markComplete(topic.id)}
        className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-navy-blue-600 text-white rounded-xl hover:bg-navy-blue-700 active:scale-[0.98] transition-all"
      >
        <CheckCircle2 className="w-4 h-4" />
        Marcar como completado
      </button>
    </div>
  );
}
