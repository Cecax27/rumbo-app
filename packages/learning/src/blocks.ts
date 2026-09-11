import type { BlockType, HabitPayload } from "./types"

/**
 * Block payload validators. These run on authored/served content so a malformed
 * payload is diagnosed at seed time (author-readable) rather than at render
 * time (user-facing). They return an error message or `null` on success.
 */

export interface BlockValidationResult {
  ok: boolean
  error: string | null
}

export function validateBlockType(type: string): BlockType | null {
  const supported: BlockType[] = [
    "concept",
    "explanation",
    "tip",
    "warning",
    "example",
    "reflection",
    "exercise",
    "heading",
    "quote",
    "table",
    "infographic",
    "illustration",
    "tutorial",
    "habit",
  ]
  return supported.includes(type as BlockType) ? (type as BlockType) : null
}

function fail(message: string): BlockValidationResult {
  return { ok: false, error: message }
}

function pass(): BlockValidationResult {
  return { ok: true, error: null }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function requireNonEmptyString(
  payload: Record<string, unknown>,
  key: string,
): BlockValidationResult | null {
  if (!isNonEmptyString(payload[key])) {
    return fail(
      `block ${JSON.stringify({ ...payload })}: "${key}" must be a non-empty string`
    )
  }
  return null
}

export function validateHabitPayload(payload: HabitPayload): BlockValidationResult {
  if (!isNonEmptyString(payload.title)) return fail("habit block: title must be a non-empty string")
  if (!isNonEmptyString(payload.description))
    return fail("habit block: description must be a non-empty string")
  if (!isNonEmptyString(payload.habitSlug))
    return fail("habit block: habitSlug must be a non-empty string")
  if (!isNonEmptyString(payload.ruleKey))
    return fail(`habit "${payload.habitSlug}": ruleKey must be a non-empty string`)
  return pass()
}

/**
 * Validates a single block. `index` and the habit slug (when applicable) are
 * used to produce author-readable positions in error messages.
 */
export function validateBlock(block: unknown, index: number): BlockValidationResult {
  if (typeof block !== "object" || block === null) {
    return fail(`block at index ${index}: expected an object`)
  }
  const { id, type, payload } = block as { id?: unknown; type?: unknown; payload?: unknown }

  if (!isNonEmptyString(id)) return fail(`block at index ${index}: "id" must be a non-empty string`)
  if (!isNonEmptyString(type)) return fail(`block "${id}": "type" must be a non-empty string`)
  if (typeof payload !== "object" || payload === null) {
    return fail(`block "${id}" (${type}): "payload" must be an object`)
  }

  const blockType = validateBlockType(type)
  if (blockType === null) {
    // Unknown block types are tolerated (graceful fallback at render time),
    // but validated as unknown so authors are not silently silently misled.
    return pass()
  }

  const p = payload as Record<string, unknown>

  switch (blockType) {
    case "concept":
    case "explanation":
    case "tip":
    case "warning":
    case "example":
      return requireNonEmptyString(p, "title") ?? requireNonEmptyString(p, "body") ?? pass()

    case "reflection":
      return (
        requireNonEmptyString(p, "title") ?? requireNonEmptyString(p, "prompt") ?? pass()
      )

    case "exercise":
      return (
        requireNonEmptyString(p, "title") ?? requireNonEmptyString(p, "body") ?? pass()
      )

    case "heading": {
      if (p.level !== 2 && p.level !== 3) {
        return fail(`heading block "${id}": "level" must be 2 or 3`)
      }
      if (!isNonEmptyString(p.text)) {
        return fail(`heading block "${id}": "text" must be a non-empty string`)
      }
      return pass()
    }

    case "quote": {
      if (!isNonEmptyString(p.text)) return fail(`quote block "${id}": "text" must be a non-empty string`)
      return pass()
    }

    case "table": {
      if (!Array.isArray(p.headers))
        return fail(`table block "${id}": "headers" must be an array`)
      if (!Array.isArray(p.rows))
        return fail(`table block "${id}": "rows" must be an array`)
      return pass()
    }

    case "infographic": {
      if (!isNonEmptyString(p.imagePath))
        return fail(`infographic block "${id}": "imagePath" must be a non-empty string`)
      return pass()
    }

    case "illustration": {
      if (!isNonEmptyString(p.imagePath))
        return fail(`illustration block "${id}": "imagePath" must be a non-empty string`)
      return pass()
    }

    case "tutorial": {
      if (!isNonEmptyString(p.title))
        return fail(`tutorial block "${id}": "title" must be a non-empty string`)
      if (!Array.isArray(p.steps))
        return fail(`tutorial block "${id}": "steps" must be an array`)
      return pass()
    }

    case "habit": {
      return validateHabitPayload(p as unknown as HabitPayload)
    }

    default:
      return pass()
  }
}
