import { describe, it, expect } from "vitest"
import {
  computePosition,
  computeCurrentLevel,
  groupTopicsByLevel,
  hasHabit,
  levelCompletionPercentage,
} from "./progress"
import type { LearningLevel, LearningTopic, TopicProgress } from "./types"

function level(id: string, order: number): LearningLevel {
  return { id, slug: id, title: id, description: null, order, published: true }
}

function topic(id: string, levelId: string, order: number, opts?: { habit?: string }): LearningTopic {
  const blocks = opts?.habit
    ? [
        {
          id: `${id}-habit`,
          type: "habit" as const,
          payload: { title: "h", description: "d", habitSlug: opts.habit, ruleKey: "r" },
        },
      ]
    : []
  return { id, levelId, slug: id, title: id, description: null, order, blocks, isSample: false, published: true }
}

function progress(topicId: string, status: "in_progress" | "completed"): TopicProgress {
  return { userId: "u", topicId, status, startedAt: null, completedAt: null }
}

const levels = [level("l0", 0), level("l1", 1)]
const topics = [topic("t0", "l0", 0), topic("t1", "l0", 1, { habit: "h1" }), topic("t2", "l1", 0)]

describe("hasHabit", () => {
  it("detects a habit block", () => {
    expect(hasHabit(topics[1]!)).toBe(true)
    expect(hasHabit(topics[0]!)).toBe(false)
  })
})

describe("levelCompletionPercentage", () => {
  const byLevel = groupTopicsByLevel(levels, topics)
  it("is 0 with no completed topics", () => {
    expect(levelCompletionPercentage(levels[0]!, byLevel, new Map())).toBe(0)
  })
  it("is 100 when all topics completed", () => {
    const map = new Map([
      ["t0", progress("t0", "completed")],
      ["t1", progress("t1", "completed")],
    ])
    expect(levelCompletionPercentage(levels[0]!, byLevel, map)).toBe(100)
  })
  it("rounds partial completion", () => {
    const map = new Map([["t0", progress("t0", "completed")]])
    expect(levelCompletionPercentage(levels[0]!, byLevel, map)).toBe(50)
  })
})

describe("computeCurrentLevel", () => {
  it("returns the first incomplete level", () => {
    const byLevel = groupTopicsByLevel(levels, topics)
    const current = computeCurrentLevel(levels, byLevel, new Map())
    expect(current?.id).toBe("l0")
  })

  it("advances to the next level when the first is complete", () => {
    const byLevel = groupTopicsByLevel(levels, topics)
    const map = new Map([
      ["t0", progress("t0", "completed")],
      ["t1", progress("t1", "completed")],
    ])
    const current = computeCurrentLevel(levels, byLevel, map)
    expect(current?.id).toBe("l1")
  })

  it("returns the last level when all complete", () => {
    const byLevel = groupTopicsByLevel(levels, topics)
    const map = new Map([
      ["t0", progress("t0", "completed")],
      ["t1", progress("t1", "completed")],
      ["t2", progress("t2", "completed")],
    ])
    const current = computeCurrentLevel(levels, byLevel, map)
    expect(current?.id).toBe("l1")
  })

  it("ignores levels with no content", () => {
    const onlyL0Topic = groupTopicsByLevel([levels[0]!], [topics[0]!])
    expect(computeCurrentLevel([levels[0]!], onlyL0Topic, new Map())?.id).toBe("l0")
  })
})

describe("computePosition", () => {
  it("returns position including index and total", () => {
    const byLevel = groupTopicsByLevel(levels, topics)
    const pos = computePosition(levels, byLevel, new Map())
    expect(pos.totalLevels).toBe(2)
    expect(pos.currentLevelIndex).toBe(1)
    expect(pos.currentLevel?.id).toBe("l0")
  })

  it("returns null position when no levels have content", () => {
    const pos = computePosition([level("empty", 0)], groupTopicsByLevel([level("empty", 0)], []), new Map())
    expect(pos.currentLevel).toBeNull()
    expect(pos.totalLevels).toBe(0)
  })
})
