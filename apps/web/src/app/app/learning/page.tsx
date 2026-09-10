"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/contexts/LearningContext";
import LevelsOverview from "@/components/learning/LevelsOverview";

export default function LearningPage() {
  const router = useRouter();
  const { introSeen, loading } = useLearning();

  // If the intro hasn't been seen yet, show it first (once, but always
  // re-accessible via a link).
  useEffect(() => {
    if (!loading && !introSeen) {
      router.replace("/app/learning/intro");
    }
  }, [loading, introSeen, router]);

  if (!loading && !introSeen) {
    return null;
  }

  return <LevelsOverview />;
}
