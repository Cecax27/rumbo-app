"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Block,
  HabitPayload,
  HabitProgress,
  LearningContent,
  LearningLevel,
  LearningTopic,
  TopicProgress,
} from "@repo/learning/types";
import { createDefaultRegistry, evaluateHabit } from "@repo/learning/habits";
import { checkAndSync } from "@repo/learning/sync";
import type { ContentCache, ContentFetcher } from "@repo/learning/sync";
import {
  completeHabit,
  completeTopic,
  fetchPublishedContent,
  getContentVersion,
  getHabitProgress,
  getIntroSeen,
  getTopicProgress,
  markTopicInProgress,
  resetProgress as resetProgressDb,
  setIntroSeen,
  startHabit as startHabitDb,
} from "@repo/supabase/learning";
import type {
  HabitProgressRow,
  LearningTopicRow,
  TopicProgressRow,
} from "@repo/supabase/learning";
import { TransactionsContext } from "@/contexts/TransactionsContext";

function mapTopic(row: LearningTopicRow): LearningTopic {
  return {
    id: row.id,
    levelId: row.level_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    order: row.order,
    blocks: (Array.isArray(row.blocks) ? row.blocks : []) as Block[],
    isSample: row.is_sample,
    published: row.published,
  };
}

function mapLevel(row: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  published: boolean;
}): LearningLevel {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    order: row.order,
    published: row.published,
  };
}

function mapContent(raw: {
  version: number;
  levels: Parameters<typeof mapLevel>[0][];
  topics: LearningTopicRow[];
}): LearningContent {
  return {
    levels: raw.levels.map(mapLevel),
    topics: raw.topics.map(mapTopic),
  };
}

function mapTopicProgress(row: TopicProgressRow): TopicProgress {
  return {
    userId: row.user_id,
    topicId: row.topic_id,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function mapHabitProgress(row: HabitProgressRow): HabitProgress {
  return {
    userId: row.user_id,
    topicId: row.topic_id,
    habitSlug: row.habit_slug,
    status: row.status,
    trackingStartedAt: row.tracking_started_at,
    completedAt: row.completed_at,
  };
}

const CACHE_KEY = "rumbo:learning:content";

class LocalStorageCache implements ContentCache {
  async get() {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as {
        version: number;
        content: LearningContent;
      };
      return parsed;
    } catch {
      return null;
    }
  }
  async set(entry: { version: number; content: LearningContent }) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  }
}

const fetcher: ContentFetcher = {
  getRemoteVersion: async () => {
    const { version } = await getContentVersion();
    return version ?? 0;
  },
  fetchContent: async () => {
    const { content, error } = await fetchPublishedContent();
    if (error || !content) throw new Error(error ?? "no content");
    return mapContent(content);
  },
};

export type LearningSyncStatus =
  | "idle"
  | "syncing"
  | "updated"
  | "up_to_date"
  | "error";

interface LearningContextType {
  content: LearningContent | null;
  loading: boolean;
  error: string | null;
  syncStatus: LearningSyncStatus;
  topicProgress: Map<string, TopicProgress>;
  habitProgress: Map<string, HabitProgress>;
  introSeen: boolean;
  transactionCount: number;
  startHabit: (topicId: string, habitSlug: string) => Promise<void>;
  markComplete: (topicId: string) => Promise<void>;
  reset: (scope:
    | { kind: "topic"; topicId: string }
    | { kind: "level"; levelIds: string[] }
    | { kind: "all" }) => Promise<{ error: string | null }>;
  markIntroSeen: () => Promise<void>;
  refresh: () => Promise<void>;
  evaluate: (
    block: Block,
    topicId: string,
  ) => { progress: number; completed: boolean; note?: string };
}

const LearningContext = createContext<LearningContextType>(
  {} as LearningContextType,
);

export function useLearning() {
  return useContext(LearningContext);
}

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<LearningSyncStatus>("idle");
  const [topicProgress, setTopicProgress] = useState<Map<string, TopicProgress>>(
    new Map(),
  );
  const [habitProgress, setHabitProgress] = useState<Map<string, HabitProgress>>(
    new Map(),
  );
  const [introSeen, setIntroSeenState] = useState<boolean>(false);
  const { data: transactions } = useContext(TransactionsContext);

  const transactionCount = transactions.length;

  const registry = useMemo(() => createDefaultRegistry(), []);

  const syncContent = useCallback(async () => {
    setSyncStatus("syncing");
    const result = await checkAndSync(new LocalStorageCache(), fetcher);

    if (result.status === "updated" || result.status === "up_to_date") {
      setContent(result.content);
      setSyncStatus(result.status);
    } else {
      setSyncStatus("error");
      if (result.content) {
        // Keep cached content; not fatal.
        setContent(result.content);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  }, []);

  const loadProgress = useCallback(async () => {
    const [topics, habits] = await Promise.all([
      getTopicProgress(),
      getHabitProgress(),
    ]);
    if (topics.progress) {
      setTopicProgress(
        new Map(topics.progress.map((p) => [p.topic_id, mapTopicProgress(p)])),
      );
    }
    if (habits.progress) {
      setHabitProgress(
        new Map(
          habits.progress.map((p) => [
            `${p.topic_id}:${p.habit_slug}`,
            mapHabitProgress(p),
          ]),
        ),
      );
    }
  }, []);

  const loadIntro = useCallback(async () => {
    const { seen } = await getIntroSeen();
    if (seen !== null) setIntroSeenState(seen);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([syncContent(), loadProgress(), loadIntro()]);
  }, [syncContent, loadProgress, loadIntro]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-evaluate started (tracking) habits whenever the evidence changes.
  useEffect(() => {
    if (!content) return;
    (async () => {
      let completedAny = false;
      for (const topic of content.topics) {
        for (const block of topic.blocks) {
          if (block.type !== "habit") continue;
          const payload = block.payload as HabitPayload;
          const key = `${topic.id}:${payload.habitSlug}`;
          const progress = habitProgress.get(key);
          if (!progress || progress.status !== "tracking") continue;

          const evaluation = evaluateHabit(
            payload.ruleKey,
            payload.ruleParams ?? {},
            { transactionCount },
            registry,
          );
          if (evaluation.completed) {
            await completeHabit(topic.id, payload.habitSlug, {
              ruleKey: payload.ruleKey,
            });
            completedAny = true;
          }
        }
      }

      if (completedAny) {
        // Mark topics finished once all of their habits are completed.
        const { progress } = await getHabitProgress();
        const completedByTopic = new Map<string, Set<string>>();
        for (const p of progress ?? []) {
          if (p.status !== "completed") continue;
          const slugs = completedByTopic.get(p.topic_id) ?? new Set<string>();
          slugs.add(p.habit_slug);
          completedByTopic.set(p.topic_id, slugs);
        }
        for (const topic of content.topics) {
          const habitSlugs = topic.blocks
            .filter((b) => b.type === "habit")
            .map((b) => (b.payload as HabitPayload).habitSlug);
          if (habitSlugs.length === 0) continue;
          const done = completedByTopic.get(topic.id);
          const allDone =
            done != null && habitSlugs.every((slug) => done.has(slug));
          if (allDone) await completeTopic(topic.id);
        }
        await loadProgress();
      }
    })();
  }, [content, habitProgress, transactionCount, registry, loadProgress]);

  const startHabit = useCallback(
    async (topicId: string, habitSlug: string) => {
      await startHabitDb(topicId, habitSlug);
      await markTopicInProgress(topicId);
      await loadProgress();
    },
    [loadProgress],
  );

  const markComplete = useCallback(
    async (topicId: string) => {
      await completeTopic(topicId);
      await loadProgress();
    },
    [loadProgress],
  );

  const reset = useCallback(
    async (
      scope:
        | { kind: "topic"; topicId: string }
        | { kind: "level"; levelIds: string[] }
        | { kind: "all" },
    ) => {
      const { error } = await resetProgressDb(scope);
      if (!error) await loadProgress();
      return { error };
    },
    [loadProgress],
  );

  const markIntroSeen = useCallback(async () => {
    await setIntroSeen();
    setIntroSeenState(true);
  }, []);

  const evaluate = useCallback(
    (block: Block, topicId: string) => {
      if (block.type !== "habit") {
        return { progress: 0, completed: false } as const;
      }
      const payload = block.payload as {
        habitSlug: string;
        ruleKey: string;
        ruleParams?: Record<string, unknown>;
      };
      const progress = habitProgress.get(`${topicId}:${payload.habitSlug}`);
      if (progress?.status === "completed") {
        return { progress: 1, completed: true } as const;
      }
      const evaluation = evaluateHabit(
        payload.ruleKey,
        payload.ruleParams ?? {},
        { transactionCount },
        registry,
      );
      return evaluation;
    },
    [habitProgress, transactionCount, registry],
  );

  const value = useMemo<LearningContextType>(
    () => ({
      content,
      loading,
      error,
      syncStatus,
      topicProgress,
      habitProgress,
      introSeen,
      transactionCount,
      startHabit,
      markComplete,
      reset,
      markIntroSeen,
      refresh,
      evaluate,
    }),
    [
      content,
      loading,
      error,
      syncStatus,
      topicProgress,
      habitProgress,
      introSeen,
      transactionCount,
      startHabit,
      markComplete,
      reset,
      markIntroSeen,
      refresh,
      evaluate,
    ],
  );

  return (
    <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
  );
}
