import { describe, it, expect } from "vitest"
import {
  createDefaultRegistry,
  evaluateHabit,
} from "./habits"
import type { RuleRegistry } from "./habits"

describe("evaluateHabit", () => {
  it("completes record_n_transactions once the count reaches n", () => {
    const registry = createDefaultRegistry()
    const before = evaluateHabit(
      "record_n_transactions",
      { n: 3 },
      { transactionCount: 2 },
      registry,
    )
    expect(before.completed).toBe(false)
    expect(before.progress).toBeCloseTo(2 / 3)

    const after = evaluateHabit(
      "record_n_transactions",
      { n: 3 },
      { transactionCount: 3 },
      registry,
    )
    expect(after.completed).toBe(true)
    expect(after.progress).toBe(1)
  })

  it("reports missing data without completing or throwing", () => {
    const result = evaluateHabit("record_n_transactions", { n: 5 }, {}, createDefaultRegistry())
    expect(result.completed).toBe(false)
    expect(result.progress).toBe(0)
    expect(result.note).toBe("missing_data:transactionCount")
  })

  it("reports an unknown ruleKey without completing or throwing", () => {
    const result = evaluateHabit("does_not_exist", {}, {}, createDefaultRegistry())
    expect(result.completed).toBe(false)
    expect(result.progress).toBe(0)
    expect(result.note).toContain("unknown_rule")
  })

  it("invalid params never complete", () => {
    const result = evaluateHabit("record_n_transactions", { n: -1 }, { transactionCount: 100 }, createDefaultRegistry())
    expect(result.completed).toBe(false)
    expect(result.note).toBe("invalid_params:n")
  })

  it("a throwing evaluator is caught and reported", () => {
    const throwing: RuleRegistry = new Map([["boom", () => { throw new Error("x") }]])
    const result = evaluateHabit("boom", {}, {}, throwing)
    expect(result.completed).toBe(false)
    expect(result.note).toBe("rule_error")
  })
})
