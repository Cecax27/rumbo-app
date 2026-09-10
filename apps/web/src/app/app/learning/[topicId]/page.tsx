"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useLearning } from "@/contexts/LearningContext";
import TopicFlow from "@/components/learning/TopicFlow";
import EmptyState from "@/components/learning/EmptyState";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function TopicPage({ params }: PageProps) {
  const { topicId } = use(params);
  const { content, loading } = useLearning();

  if (loading && !content) {
    return <EmptyState message="Cargando contenido..." />;
  }

  const topic = content?.topics.find((t) => t.id === topicId);
  if (!topic) {
    notFound();
  }

  return <TopicFlow topic={topic} />;
}
