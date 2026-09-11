import { supabase } from './client'

// Data access for the learning section. Content tables are read-only to
// clients (RLS: authenticated SELECT). Progress tables are user-scoped via
// RLS (`user_id = auth.uid()`); the caller never supplies user_id explicitly.

function wrapError(error) {
  return { error: error ? error.message : null }
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export async function getContentVersion() {
  const { data, error } = await supabase
    .from('learning_meta')
    .select('content_version')
    .single()
  if (error) return { error: error.message, version: null }
  return { error: null, version: data?.content_version ?? null }
}

export async function fetchPublishedContent() {
  const [meta, levels, topics] = await Promise.all([
    supabase.from('learning_meta').select('content_version').single(),
    supabase
      .from('learning_levels')
      .select('id, slug, title, description, order, published')
      .eq('published', true)
      .order('order', { ascending: true }),
    supabase
      .from('learning_topics')
      .select('id, level_id, slug, title, description, order, blocks, is_sample, published')
      .eq('published', true)
      .order('order', { ascending: true }),
  ])

  if (meta.error) return { error: meta.error.message, content: null }
  if (levels.error) return { error: levels.error.message, content: null }
  if (topics.error) return { error: topics.error.message, content: null }

  return {
    error: null,
    content: {
      version: meta.data?.content_version ?? 1,
      levels: levels.data ?? [],
      topics: topics.data ?? [],
    },
  }
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function getTopicProgress() {
  const { data, error } = await supabase.from('learning_topic_progress').select('*')
  if (error) return { error: error.message, progress: null }
  return { error: null, progress: data ?? [] }
}

export async function getHabitProgress() {
  const { data, error } = await supabase.from('learning_habit_progress').select('*')
  if (error) return { error: error.message, progress: null }
  return { error: null, progress: data ?? [] }
}

export async function markTopicInProgress(topicId) {
  const { error } = await supabase.from('learning_topic_progress').upsert(
    { topic_id: topicId, status: 'in_progress', started_at: new Date().toISOString() },
    { onConflict: 'user_id,topic_id' }
  )
  return wrapError(error)
}

export async function completeTopic(topicId) {
  const { error } = await supabase.from('learning_topic_progress').upsert(
    {
      topic_id: topicId,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id' }
  )
  return wrapError(error)
}

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export async function startHabit(topicId, habitSlug) {
  const { count, error: countError } = await supabase
    .from('learning_habit_progress')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId)
    .eq('habit_slug', habitSlug)

  if (countError) return wrapError(countError)
  if ((count ?? 0) > 0) return { error: null }

  const { error } = await supabase.from('learning_habit_progress').insert([
    {
      topic_id: topicId,
      habit_slug: habitSlug,
      status: 'tracking',
      tracking_started_at: new Date().toISOString(),
    },
  ])
  return wrapError(error)
}

export async function completeHabit(topicId, habitSlug, note) {
  const { error } = await supabase
    .from('learning_habit_progress')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      evaluation_note: note,
    })
    .eq('topic_id', topicId)
    .eq('habit_slug', habitSlug)
    .eq('status', 'tracking')
  return wrapError(error)
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

function buildTopicQuery(scope) {
  const base = supabase.from('learning_topic_progress').delete()
  if (scope.kind === 'topic') return base.eq('topic_id', scope.topicId)
  if (scope.kind === 'topics') return base.in('topic_id', scope.topicIds)
  return base.not('id', 'is', null)
}

function buildHabitQuery(scope) {
  const base = supabase.from('learning_habit_progress').delete()
  if (scope.kind === 'topic') return base.eq('topic_id', scope.topicId)
  if (scope.kind === 'topics') return base.in('topic_id', scope.topicIds)
  return base.not('id', 'is', null)
}

export async function resetProgress(scope) {
  const { error: habitError } = await buildHabitQuery(scope)
  if (habitError) return wrapError(habitError)

  const { error: topicError } = await buildTopicQuery(scope)
  return wrapError(topicError)
}

// ---------------------------------------------------------------------------
// Intro flag
// ---------------------------------------------------------------------------

export async function getIntroSeen() {
  const { data, error } = await supabase
    .from('profiles')
    .select('learning_intro_seen')
    .single()
  if (error) return { error: error.message, seen: null }
  return { error: null, seen: data?.learning_intro_seen ?? false }
}

export async function setIntroSeen() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('profiles')
    .update({ learning_intro_seen: true })
    .eq('id', user?.id ?? '')
  return wrapError(error)
}

// Total number of transactions recorded by the user (spendings + incomes +
// transfers). Used as evidence by habit rules (e.g. record_n_transactions).
export async function getTransactionCount() {
  const [spendings, incomes, transfers] = await Promise.all([
    supabase.from('spendings').select('id', { count: 'exact', head: true }),
    supabase.from('incomes').select('id', { count: 'exact', head: true }),
    supabase.from('transfers').select('id', { count: 'exact', head: true }),
  ])
  return (spendings.count ?? 0) + (incomes.count ?? 0) + (transfers.count ?? 0)
}
