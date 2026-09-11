import { describe, it, expect } from "vitest"
import { validateBlock, validateBlockType, validateHabitPayload } from "./blocks"

describe("validateBlockType", () => {
  it("recognizes every supported block type", () => {
    expect(validateBlockType("concept")).toBe("concept")
    expect(validateBlockType("table")).toBe("table")
    expect(validateBlockType("habit")).toBe("habit")
    expect(validateBlockType("tutorial")).toBe("tutorial")
  })

  it("returns null for unknown types", () => {
    expect(validateBlockType("nonsense")).toBeNull()
  })
})

describe("validateBlock", () => {
  it("accepts a valid concept block", () => {
    const result = validateBlock(
      { id: "b1", type: "concept", payload: { title: "T", body: "B" } },
      0,
    )
    expect(result.ok).toBe(true)
  })

  it("rejects missing title on a concept block", () => {
    const result = validateBlock(
      { id: "b1", type: "concept", payload: { body: "B" } },
      0,
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain("title")
  })

  it("accepts unknown block types (render fallback) without error", () => {
    const result = validateBlock({ id: "x", type: "future", payload: {} }, 0)
    expect(result.ok).toBe(true)
  })

  it("validates a heading level must be 2 or 3", () => {
    const bad = validateBlock(
      { id: "h", type: "heading", payload: { level: 5, text: "hi" } },
      0,
    )
    expect(bad.ok).toBe(false)
    const good = validateBlock(
      { id: "h", type: "heading", payload: { level: 2, text: "hi" } },
      0,
    )
    expect(good.ok).toBe(true)
  })

  it("validates habit blocks via validateHabitPayload", () => {
    expect(
      validateHabitPayload({
        title: "T",
        description: "D",
        habitSlug: "slug",
        ruleKey: "k",
      }),
    ).toEqual({ ok: true, error: null })

    expect(validateHabitPayload({ title: "", description: "D", habitSlug: "s", ruleKey: "k" }).ok).toBe(false)
  })

  it("rejects non-object blocks", () => {
    expect(validateBlock(null, 0).ok).toBe(false)
    expect(validateBlock("string", 0).ok).toBe(false)
  })
})
