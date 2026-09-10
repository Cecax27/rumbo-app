import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createDefaultRegistry, evaluateHabit } from '@repo/learning/habits'
import { checkAndSync } from '@repo/learning/sync'
import {
  completeHabit,
  completeTopic,
  fetchPublishedContent,
  getContentVersion,
  getHabitProgress,
  getIntroSeen,
  getTopicProgress,
  getTransactionCount,
  markTopicInProgress,
  resetProgress as resetProgressDb,
  setIntroSeen,
  startHabit as startHabitDb,
} from '../lib/supabase/learning'

const CACHE_KEY = 'rumbo:learning:content'

const cache = {
  async get() {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  async set(entry) {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
      // cache write failure is non-fatal
    }
  },
}

function mapLevel(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    order: row.order,
    published: row.published,
  }
}

function mapTopic(row) {
  return {
    id: row.id,
    levelId: row.level_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    order: row.order,
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
    isSample: row.is_sample,
    published: row.published,
  }
}

function mapContent(raw) {
  return {
    levels: raw.levels.map(mapLevel),
    topics: raw.topics.map(mapTopic),
  }
}

function mapTopicProgress(row) {
  return {
    userId: row.user_id,
    topicId: row.topic_id,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }
}

function mapHabitProgress(row) {
  return {
    userId: row.user_id,
    topicId: row.topic_id,
    habitSlug: row.habit_slug,
    status: row.status,
    trackingStartedAt: row.tracking_started_at,
    completedAt: row.completed_at,
  }
}

const fetcher = {
  getRemoteVersion: async () => {
    const { version } = await getContentVersion()
    return version ?? 0
  },
  fetchContent: async () => {
    const { content, error } = await fetchPublishedContent()
    if (error || !content) throw new Error(error ?? 'no content')
    return mapContent(content)
  },
}

const LearningContext = createContext(null)

export function useLearning() {
  return useContext(LearningContext)
}

export function LearningProvider({ children }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [topicProgress, setTopicProgress] = useState(new Map())
  const [habitProgress, setHabitProgress] = useState(new Map())
  const [introSeen, setIntroSeenState] = useState(false)
  const [transactionCount, setTransactionCount] = useState(0)

  const registry = useMemo(() => createDefaultRegistry(), [])

  const syncContent = useCallback(async () => {
    const result = await checkAndSync(cache, fetcher)
    if (result.status === 'updated' || result.status === 'up_to_date') {
      setContent(result.content)
    } else if (result.content) {
      setContent(result.content)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  const loadProgress = useCallback(async () => {
    const [topics, habits, count] = await Promise.all([
      getTopicProgress(),
      getHabitProgress(),
      getTransactionCount(),
    ])
    if (topics.progress) {
      setTopicProgress(new Map(topics.progress.map((p) => [p.topic_id, mapTopicProgress(p)])))
    }
    if (habits.progress) {
      setHabitProgress(
        new Map(habits.progress.map((p) => [`${p.topic_id}:${p.habit_slug}`, mapHabitProgress(p)]))
      )
    }
    setTransactionCount(count)
  }, [])

  const loadIntro = useCallback(async () => {
    const { seen } = await getIntroSeen()
    if (seen !== null) setIntroSeenState(seen)
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([syncContent(), loadProgress(), loadIntro()])
  }, [syncContent, loadProgress, loadIntro])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Re-evaluate started (tracking) habits whenever the evidence changes.
  useEffect(() => {
    if (!content) return
    ;(async () => {
      let completedAny = false
      for (const topic of content.topics) {
        for (const block of topic.blocks) {
          if (block.type !== 'habit') continue
          const payload = block.payload
          const key = `${topic.id}:${payload.habitSlug}`
          const progress = habitProgress.get(key)
          if (!progress || progress.status !== 'tracking') continue

          const evaluation = evaluateHabit(
            payload.ruleKey,
            payload.ruleParams ?? {},
            { transactionCount },
            registry
          )
          if (evaluation.completed) {
            await completeHabit(topic.id, payload.habitSlug, { ruleKey: payload.ruleKey })
            completedAny = true
          }
        }
      }

      if (completedAny) {
        const { progress } = await getHabitProgress()
        const completedByTopic = new Map()
        for (const p of progress ?? []) {
          if (p.status !== 'completed') continue
          const slugs = completedByTopic.get(p.topic_id) ?? new Set()
          slugs.add(p.habit_slug)
          completedByTopic.set(p.topic_id, slugs)
        }
        for (const topic of content.topics) {
          const habitSlugs = topic.blocks
            .filter((b) => b.type === 'habit')
            .map((b) => b.payload.habitSlug)
          if (habitSlugs.length === 0) continue
          const done = completedByTopic.get(topic.id)
          const allDone = done != null && habitSlugs.every((slug) => done.has(slug))
          if (allDone) await completeTopic(topic.id)
        }
        await loadProgress()
      }
    })()
  }, [content, habitProgress, transactionCount, registry, loadProgress])

  const startHabit = useCallback(
    async (topicId, habitSlug) => {
      await startHabitDb(topicId, habitSlug)
      await markTopicInProgress(topicId)
      await loadProgress()
    },
    [loadProgress]
  )

  const markComplete = useCallback(
    async (topicId) => {
      await completeTopic(topicId)
      await loadProgress()
    },
    [loadProgress]
  )

  const reset = useCallback(
    async (scope) => {
      const { error } = await resetProgressDb(scope)
      if (!error) await loadProgress()
      return { error }
    },
    [loadProgress]
  )

  const markIntroSeen = useCallback(async () => {
    await setIntroSeen()
    setIntroSeenState(true)
  }, [])

  const evaluate = useCallback(
    (block, topicId) => {
      if (block.type !== 'habit') return { progress: 0, completed: false }
      const payload = block.payload
      const progress = habitProgress.get(`${topicId}:${payload.habitSlug}`)
      if (progress?.status === 'completed') return { progress: 1, completed: true }
      return evaluateHabit(
        payload.ruleKey,
        payload.ruleParams ?? {},
        { transactionCount },
        registry
      )
    },
    [habitProgress, transactionCount, registry]
  )

  const value = useMemo(
    () => ({
      content,
      loading,
      error,
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
    ]
  )

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}
