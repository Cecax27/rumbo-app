import type {
  LearningLevel,
  LearningTopic,
  TopicProgress,
} from "./types"

/**
 * Progress and position helpers for the learning section. These implement the
 * approved "no gating but still a meaningful position" behavior.
 */

export function hasHabit(topic: LearningTopic): boolean {
  return topic.blocks.some((block) => block.type === "habit")
}

export function habitBlockSlugs(topic: LearningTopic): string[] {
  return topic.blocks
    .filter((block) => block.type === "habit")
    .map((block) => (block.payload as { habitSlug: string }).habitSlug)
}

/**
 * A level is finished when all of its topics are completed.
 */
export function isLevelComplete(
  level: LearningLevel,
  topicsByLevel: Map<string, LearningTopic[]>,
  progressByTopic: Map<string, TopicProgress>,
): boolean {
  const topics = topicsByLevel.get(level.id) ?? []
  if (topics.length === 0) return false
  return topics.every((topic) => progressByTopic.get(topic.id)?.status === "completed")
}

/**
 * Completion percentage (`0..100`) of a level, over its published topics.
 */
export function levelCompletionPercentage(
  level: LearningLevel,
  topicsByLevel: Map<string, LearningTopic[]>,
  progressByTopic: Map<string, TopicProgress>,
): number {
  const topics = topicsByLevel.get(level.id) ?? []
  if (topics.length === 0) return 0
  const completed = topics.filter(
    (topic) => progressByTopic.get(topic.id)?.status === "completed",
  ).length
  return Math.round((completed / topics.length) * 100)
}

/**
 * Groups topics by their level id, filtering to published levels only.
 */
export function groupTopicsByLevel(
  levels: LearningLevel[],
  topics: LearningTopic[],
): Map<string, LearningTopic[]> {
  const result = new Map<string, LearningTopic[]>()
  for (const level of levels) {
    result.set(level.id, [])
  }
  for (const topic of topics) {
    if (!topic.published) continue
    const bucket = result.get(topic.levelId)
    if (bucket) bucket.push(topic)
  }
  return result
}

/**
 * The user's "current level" = the first level (by order) that has at least one
 * topic and is not complete. If every level is complete, it is the last level.
 */
export function computeCurrentLevel(
  levels: LearningLevel[],
  topicsByLevel: Map<string, LearningTopic[]>,
  progressByTopic: Map<string, TopicProgress>,
): LearningLevel | null {
  if (levels.length === 0) return null

  const ordered = [...levels].sort((a, b) => a.order - b.order)
  const levelsWithTopics = ordered.filter((level) => {
    const topics = topicsByLevel.get(level.id) ?? []
    return topics.length > 0
  })

  if (levelsWithTopics.length === 0) return null

  for (const level of levelsWithTopics) {
    if (!isLevelComplete(level, topicsByLevel, progressByTopic)) {
      return level
    }
  }

  return levelsWithTopics[levelsWithTopics.length - 1] ?? null
}

export interface LevelPosition {
  /** The user's current level, or null if there are no levels with content. */
  currentLevel: LearningLevel | null
  /** Total number of levels (measured over levels that have content). */
  totalLevels: number
  /** 1-based index of the current level within levels-with-content. */
  currentLevelIndex: number | null
}

export function computePosition(
  levels: LearningLevel[],
  topicsByLevel: Map<string, LearningTopic[]>,
  progressByTopic: Map<string, TopicProgress>,
): LevelPosition {
  const ordered = [...levels]
    .filter((level) => (topicsByLevel.get(level.id) ?? []).length > 0)
    .sort((a, b) => a.order - b.order)

  const current = computeCurrentLevel(levels, topicsByLevel, progressByTopic)

  return {
    currentLevel: current,
    totalLevels: ordered.length,
    currentLevelIndex: current
      ? ordered.findIndex((level) => level.id === current.id) + 1
      : null,
  }
}
