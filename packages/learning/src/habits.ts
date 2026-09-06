/**
 * Habit rule engine.
 *
 * Each habit references a `ruleKey` that maps to an evaluator. Evaluators are
 * pure functions: `evaluate(params, snapshot) => HabitEvaluation`. Apps build
 * the snapshot from their server-synced data (transactions, accounts, ...) and
 * the engine computes `{ progress, completed }` client-side. When `completed`
 * is true, the app writes the completion record to the database.
 *
 * A rule whose evidence is missing or whose key is unknown never completes and
 * never throws: it reports progress 0 with an explanatory note.
 */

export interface HabitEvaluation {
  /** A value in `[0, 1]` indicating how far the habit is along before completion. */
  progress: number
  /** True when the habit's completion condition is satisfied. */
  completed: boolean
  /** Optional human-readable note for diagnostics (e.g. unknown ruleKey). */
  note?: string
}

/**
 * Evidence data for rule evaluation. Rules read only the fields they need;
 * the shape is intentionally loose so rules for features not yet built simply
 * observe missing data and report `progress: 0`.
 */
export interface HabitSnapshot {
  [key: string]: unknown
}

export type RuleEvaluator = (
  params: Record<string, unknown>,
  snapshot: HabitSnapshot,
) => HabitEvaluation

export type RuleRegistry = Map<string, RuleEvaluator>

/** Lower bound so `unknown_key` rules produce a distinct, debuggable note. */
const UNKNOWN_RULE_NOTE = "unknown_rule"

export function evaluateHabit(
  ruleKey: string,
  params: Record<string, unknown>,
  snapshot: HabitSnapshot,
  registry: RuleRegistry,
): HabitEvaluation {
  const evaluator = registry.get(ruleKey)
  if (!evaluator) {
    return { progress: 0, completed: false, note: `${UNKNOWN_RULE_NOTE}:${ruleKey}` }
  }
  try {
    return evaluator(params, snapshot)
  } catch {
    // A rule bug must not crash the learning section.
    return { progress: 0, completed: false, note: "rule_error" }
  }
}

export function createDefaultRegistry(): RuleRegistry {
  return new Map(Object.entries(defaultRules))
}

import { recordNTimes } from "./rules/record-n-transactions"

const defaultRules: Record<string, RuleEvaluator> = {
  record_n_transactions: recordNTimes,
}
