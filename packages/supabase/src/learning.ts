import { supabase } from "./client";

// Data access for the learning section. Content tables are read-only to
// clients (RLS: authenticated SELECT). Progress tables are user-scoped via
// RLS (`user_id = auth.uid()`); the caller never supplies user_id explicitly.

export interface LearningLevelRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  published: boolean;
}

export interface LearningTopicRow {
  id: string;
  level_id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  blocks: unknown;
  is_sample: boolean;
  published: boolean;
}

export type LearningContentFetch = {
  version: number;
  levels: LearningLevelRow[];
  topics: LearningTopicRow[];
};

export interface TopicProgressRow {
  id: string;
  user_id: string;
  topic_id: string;
  status: "in_progress" | "completed";
  started_at: string | null;
  completed_at: string | null;
}

export interface HabitProgressRow {
  id: string;
  user_id: string;
  topic_id: string;
  habit_slug: string;
  status: "tracking" | "completed";
  tracking_started_at: string | null;
  completed_at: string | null;
  evaluation_note: unknown;
}

function wrapError(error: { message: string } | null): { error: string | null } {
  return { error: error ? error.message : null };
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

/** Returns the latest content version (single-row `learning_meta`). */
export async function getContentVersion(): Promise<{ error: string | null; version: number | null }> {
  const { data, error } = await supabase
    .from("learning_meta")
    .select("content_version")
    .single();
  if (error) return { error: error.message, version: null };
  return { error: null, version: data?.content_version ?? null };
}

/** Fetches all published levels and topics (and the current content version). */
export async function fetchPublishedContent(): Promise<{
  error: string | null;
  content: LearningContentFetch | null;
}> {
  const [meta, levels, topics] = await Promise.all([
    supabase.from("learning_meta").select("content_version").single(),
    supabase
      .from("learning_levels")
      .select("id, slug, title, description, order, published")
      .eq("published", true)
      .order("order", { ascending: true }),
    supabase
      .from("learning_topics")
      .select("id, level_id, slug, title, description, order, blocks, is_sample, published")
      .eq("published", true)
      .order("order", { ascending: true }),
  ]);

  if (meta.error) return { error: meta.error.message, content: null };
  if (levels.error) return { error: levels.error.message, content: null };
  if (topics.error) return { error: topics.error.message, content: null };

  return {
    error: null,
    content: {
      version: meta.data?.content_version ?? 1,
      levels: (levels.data ?? []) as LearningLevelRow[],
      topics: (topics.data ?? []) as LearningTopicRow[],
    },
  };
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

/** Returns the user's topic progress for all topics (scoped by RLS). */
export async function getTopicProgress(): Promise<{
  error: string | null;
  progress: TopicProgressRow[] | null;
}> {
  const { data, error } = await supabase.from("learning_topic_progress").select("*");
  if (error) return { error: error.message, progress: null };
  return { error: null, progress: (data ?? []) as TopicProgressRow[] };
}

/** Returns the user's habit progress for all habits (scoped by RLS). */
export async function getHabitProgress(): Promise<{
  error: string | null;
  progress: HabitProgressRow[] | null;
}> {
  const { data, error } = await supabase.from("learning_habit_progress").select("*");
  if (error) return { error: error.message, progress: null };
  return { error: null, progress: (data ?? []) as HabitProgressRow[] };
}

/** Marks a topic as in-progress if no row exists yet. */
export async function markTopicInProgress(topicId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("learning_topic_progress")
    .upsert(
      { topic_id: topicId, status: "in_progress", started_at: new Date().toISOString() },
      { onConflict: "user_id,topic_id" },
    );
  return wrapError(error);
}

/** Completes a topic (used for habit-less topics' "mark as complete"). */
export async function completeTopic(topicId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("learning_topic_progress")
    .upsert(
      {
        topic_id: topicId,
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id" },
    );
  return wrapError(error);
}

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

/**
 * Starts tracking a habit, creating its progress row in `tracking` state.
 * Idempotent: re-starting an already-tracking habit is a no-op.
 */
export async function startHabit(topicId: string, habitSlug: string): Promise<{ error: string | null }> {
  const { count, error: countError } = await supabase
    .from("learning_habit_progress")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topicId)
    .eq("habit_slug", habitSlug);

  if (countError) return wrapError(countError);
  if ((count ?? 0) > 0) return { error: null };

  const { error } = await supabase.from("learning_habit_progress").insert([
    {
      topic_id: topicId,
      habit_slug: habitSlug,
      status: "tracking",
      tracking_started_at: new Date().toISOString(),
    },
  ]);
  return wrapError(error);
}

/**
 * Records a habit as completed (client-side evaluation already verified the
 * condition). The DB immutability trigger makes the completion permanent; a
 * concurrent completion (first-write-wins) is a no-op.
 */
export async function completeHabit(
  topicId: string,
  habitSlug: string,
  note: Record<string, unknown> | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("learning_habit_progress")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      evaluation_note: note,
    })
    .eq("topic_id", topicId)
    .eq("habit_slug", habitSlug)
    .eq("status", "tracking");
  return wrapError(error);
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

export type ResetScope =
  | { kind: "topic"; topicId: string }
  | { kind: "level"; levelIds: string[] }
  | { kind: "all" };

/** Clears progress for the given scope (habit progress first, then topics). */
export async function resetProgress(scope: ResetScope): Promise<{ error: string | null }> {
  const habitQuery = buildHabitQuery(scope);
  const { error: habitError } = await habitQuery;
  if (habitError) return wrapError(habitError);

  const topicQuery = buildTopicQuery(scope);
  const { error: topicError } = await topicQuery;
  return wrapError(topicError);
}

function buildTopicQuery(scope: ResetScope) {
  const base = supabase.from("learning_topic_progress").delete();
  if (scope.kind === "topic") return base.eq("topic_id", scope.topicId);
  if (scope.kind === "level") return base.in("topic_id", scope.levelIds);
  return base;
}

function buildHabitQuery(scope: ResetScope) {
  const base = supabase.from("learning_habit_progress").delete();
  if (scope.kind === "topic") return base.eq("topic_id", scope.topicId);
  if (scope.kind === "level") return base.in("topic_id", scope.levelIds);
  return base;
}

// ---------------------------------------------------------------------------
// Intro flag
// ---------------------------------------------------------------------------

export async function getIntroSeen(): Promise<{ error: string | null; seen: boolean | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("learning_intro_seen")
    .single();
  if (error) return { error: error.message, seen: null };
  return { error: null, seen: data?.learning_intro_seen ?? false };
}

export async function setIntroSeen(): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({ learning_intro_seen: true })
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
  return wrapError(error);
}
