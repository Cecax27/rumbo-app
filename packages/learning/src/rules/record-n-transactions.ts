import type { RuleEvaluator } from "../habits"

/**
 * `record_n_transactions`
 *
 * Completes once the user has recorded at least `n` transactions in Rumbo.
 * Only activity performed while the habit is being tracked counts: the app
 * supplies `transactionCount` already time-boxed to transactions created on or
 * after `tracking_started_at`.
 *
 * params: { n: number } (required, positive integer)
 * snapshot: { transactionCount: number } (transactions recorded since tracking began)
 */
export const recordNTimes: RuleEvaluator = (params, snapshot) => {
  const n = params.n
  const count = snapshot.transactionCount

  if (typeof n !== "number" || !Number.isInteger(n) || n <= 0) {
    return { progress: 0, completed: false, note: "invalid_params:n" }
  }
  if (typeof count !== "number" || Number.isNaN(count)) {
    // Evidence source not available (feature not yet built / no data).
    return { progress: 0, completed: false, note: "missing_data:transactionCount" }
  }

  const progress = Math.min(Math.max(0, count / n), 1)
  return {
    progress,
    completed: count >= n,
  }
}
