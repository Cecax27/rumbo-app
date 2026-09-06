/**
 * Core data model for the learning section.
 *
 * These types are the single source of truth for learning content, shared by
 * the web and mobile renderers, the habit engine, and the authoring guide.
 * Content is authored as structured JSON blocks (see `docs/learning-authoring-guide.md`)
 * and stored in `public.learning_topics.blocks` (jsonb).
 */

export type LevelId = string
export type TopicId = string

export interface LearningLevel {
  id: LevelId
  slug: string
  title: string
  description: string | null
  order: number
  published: boolean
}

export interface LearningTopic {
  id: TopicId
  levelId: LevelId
  slug: string
  title: string
  description: string | null
  order: number
  blocks: Block[]
  isSample: boolean
  published: boolean
}

export interface LearningContent {
  levels: LearningLevel[]
  topics: LearningTopic[]
}

/* ------------------------------------------------------------------------- */
/* Blocks                                                                    */
/* ------------------------------------------------------------------------- */

export interface BaseBlock<Type extends string, Payload extends object> {
  id: string
  type: Type
  payload: Payload
}

/* --- Text blocks --- */

export interface ConceptPayload {
  title: string
  body: string
}
export type ConceptBlock = BaseBlock<"concept", ConceptPayload>

export interface ExplanationPayload {
  title: string
  body: string
}
export type ExplanationBlock = BaseBlock<"explanation", ExplanationPayload>

export interface TipPayload {
  title: string
  body: string
}
export type TipBlock = BaseBlock<"tip", TipPayload>

export interface WarningPayload {
  title: string
  body: string
}
export type WarningBlock = BaseBlock<"warning", WarningPayload>

export interface ExamplePayload {
  title: string
  body: string
}
export type ExampleBlock = BaseBlock<"example", ExamplePayload>

export interface ReflectionPayload {
  title: string
  prompt: string
}
export type ReflectionBlock = BaseBlock<"reflection", ReflectionPayload>

export interface ExercisePayload {
  title: string
  body: string
  placeholder?: string
}
export type ExerciseBlock = BaseBlock<"exercise", ExercisePayload>

/* --- Structural / formatting blocks --- */

export interface HeadingPayload {
  level: 2 | 3
  text: string
}
export type HeadingBlock = BaseBlock<"heading", HeadingPayload>

export interface QuotePayload {
  text: string
  author?: string
}
export type QuoteBlock = BaseBlock<"quote", QuotePayload>

export interface TablePayload {
  headers: string[]
  rows: string[][]
}
export type TableBlock = BaseBlock<"table", TablePayload>

/* --- Asset blocks --- */

/** Downloadable and shareable image. */
export interface InfographicPayload {
  title?: string
  imagePath: string
  altText: string
}
export type InfographicBlock = BaseBlock<"infographic", InfographicPayload>

/** View-only image (not downloadable nor shareable). */
export interface IllustrationPayload {
  imagePath: string
  caption?: string
  altText: string
}
export type IllustrationBlock = BaseBlock<"illustration", IllustrationPayload>

/* --- Tutorial block --- */

export interface TutorialStep {
  text: string
  imagePath?: string
}

export interface TutorialPayload {
  title: string
  steps: TutorialStep[]
}
export type TutorialBlock = BaseBlock<"tutorial", TutorialPayload>

/* --- Habit block --- */

export interface HabitPayload {
  title: string
  description: string
  /** Authored, stable slug. Never rename once published (progress references it). */
  habitSlug: string
  /** Registry key in `@repo/learning` habit engine. */
  ruleKey: string
  ruleParams?: Record<string, unknown>
}
export type HabitBlock = BaseBlock<"habit", HabitPayload>

/** All supported block types. Unknown types render as a graceful fallback. */
export type Block =
  | ConceptBlock
  | ExplanationBlock
  | TipBlock
  | WarningBlock
  | ExampleBlock
  | ReflectionBlock
  | ExerciseBlock
  | HeadingBlock
  | QuoteBlock
  | TableBlock
  | InfographicBlock
  | IllustrationBlock
  | TutorialBlock
  | HabitBlock

export type BlockType = Block["type"]

/* ------------------------------------------------------------------------- */
/* Progress                                                                  */
/* ------------------------------------------------------------------------- */

/** Topic completion state. `not_started` is represented by the absence of a row. */
export type TopicProgressStatus = "in_progress" | "completed"

export interface TopicProgress {
  userId: string
  topicId: TopicId
  status: TopicProgressStatus
  startedAt: string | null
  completedAt: string | null
}

/** Habit state. `not_started` is represented by the absence of a row. */
export type HabitProgressStatus = "tracking" | "completed"

export interface HabitProgress {
  userId: string
  topicId: TopicId
  habitSlug: string
  status: HabitProgressStatus
  trackingStartedAt: string | null
  completedAt: string | null
}
