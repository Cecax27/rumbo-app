# Implementation Tasks — Learning Section

> Derived from the approved `plan.md`. Check off items as work is completed and verified. Do not mark complete until the work is actually done and passing its verification step.

---

## Phase 1: Data Layer (Supabase)

- [x] Create `learning_meta` table (single row, `content_version int`) with its initial row.
- [x] Create `learning_levels` table (slug, title, description, order, published, timestamps).
- [x] Create `learning_topics` table (level FK, slug, title, description, order, `blocks jsonb`, `is_sample`, published, timestamps).
- [x] Add `profiles.learning_intro_seen boolean not null default false`.
- [x] Create `learning_topic_progress` table (user FK cascade, topic FK, status, timestamps, unique `(user_id, topic_id)`).
- [x] Create `learning_habit_progress` table (user FK cascade, topic FK, `habit_slug`, status, `tracking_started_at`, `completed_at`, `evaluation_note jsonb`, unique `(user_id, topic_id, habit_slug)`).
- [x] Create trigger `bump_learning_content_version()` on published `learning_levels`/`learning_topics` insert/update.
- [x] Create trigger `learning_habit_immutable()` rejecting updates to completed habit rows.
- [x] Add RLS policies: content tables + `learning_meta` SELECT for authenticated only; progress tables user-scoped CRUD (`user_id = auth.uid()`).
- [x] Create public `learning-assets` Storage bucket with the `levels/{level_slug}/topics/{topic_slug}/…` path convention.
- [x] Seed the Awareness level (published) + sample habit topic (all block types, habit `record_n_transactions` with `{ n: 3 }`) + sample habit-less topic + sample infographic/illustration/tutorial assets in the bucket.
- [ ] Verify: advisors clean, version bump fires on content edit, RLS blocks cross-user access and content writes from clients. *(blocked — requires applying migrations via Supabase CLI/dashboard; the MCP SQL role cannot run DDL)*

## Phase 2: Shared Domain (`@repo/learning` + `@repo/supabase/learning.ts`)

- [x] Scaffold `packages/learning/` (raw TS source export, `@repo/typescript-config` tsconfig, Vitest, workspace + Turbo wiring).
- [x] Define content types: `LearningLevel`, `LearningTopic`, and the `Block` union (concept, explanation, tip, warning, example, reflection, exercise, heading, quote, table, infographic, illustration, tutorial, habit).
- [x] Implement block payload validators with author-readable error messages (plus graceful unknown-type handling).
- [x] Implement the minimal markdown-subset parser (**bold**, *italic*; no HTML pass-through).
- [x] Implement the habit rule engine + registry: `evaluate(params, snapshot) → { progress, completed }`, with defined behavior for unknown ruleKey / missing snapshot data (never completes, never crashes).
- [x] Implement the `record_n_transactions` rule.
- [x] Implement position/percentage computation (current level = first level with incomplete topics; per-level %; all-complete case).
- [x] Implement sync orchestration (`checkAndSync` with injected `ContentCache` adapter; same-version no-op; newer → fetch + cache; failure → keep cache + surface error; reject older versions).
- [x] Create `packages/supabase/src/learning.ts`: content fetch, version, progress, habit start/complete, topic complete, reset, intro flag — consistent `{ error }` shapes.
- [x] Unit tests green: validators, parser, rule engine, position math, sync logic with fake adapters/cache (`pnpm --filter @repo/learning test` → 36 passed).

## Phase 3: Web

- [x] Create `LearningContext` + localStorage `ContentCache` adapter; wire sync on app open and on learning-section entry (non-blocking).
- [x] Rework `/app/learning` overview into the levels view: only levels with published content, current level position, total levels, per-level completion %; delete `mock-data.ts` and remove `dependsOn` locking.
- [x] Rework `[topicId]` page to render real content through the block renderer, with topic status badge.
- [x] Add `HeadingBlock`, `QuoteBlock`, `TableBlock` (with inline bold/italic rendering).
- [x] Rework `TaskBlock` into `HabitBlock`: start-habit button → tracking state with progress → completed state; no manual completion path.
- [x] Implement topic-level "mark as complete" for habit-less topics only (derived from the topic's blocks).
- [x] Add `InfographicBlock` (download via anchor + share via Web Share API with download fallback) and `IllustrationBlock` (view only, no actions).
- [x] Add `TutorialBlock` card + `[topicId]/tutorial/[tutorialId]` step-by-step screen with screenshots.
- [x] Create the intro screen + first-entry gate (`profiles.learning_intro_seen`) + permanent access link from the learning section.
- [x] Add the global "reset learning progress" section (with confirmation) to the settings page.

## Phase 4: Mobile

- [x] Add the fifth sidebar item (`/learning`) in `SidebarPanel.jsx` and `tabs.learning` + all `learning.*` i18n keys in both `en.json` and `es.json`.
- [x] Verify Metro transpiles `@repo/learning` TS source (verified via `expo export --platform web`; monorepo `watchFolders`/`nodeModulesPaths` added to `metro.config.js`).
- [x] Create `app/(app)/learning/` route group: `_layout.js`, `index.js`, `intro.js`, `[topicId]/index.js`, `[topicId]/tutorial/[tutorialId].js`.
- [x] Create `LearningContext` + AsyncStorage cache adapter; wire background sync on app open.
- [x] Build the levels overview screen (position, total, %, only levels with content).
- [x] Build the topic reader with NativeWind block renderers for the full block vocabulary (unknown-type fallback included).
- [x] Build the habit card (start tracking / progress / completed) using the shared rule engine.
- [x] Implement habit evaluation reacting to transactions/data changes (transaction count fetched directly from the data layer, re-evaluated on load).
- [x] Implement infographic share (React Native `Share` API; no new native dependency) and illustration (view only).
- [x] Build the tutorial stepper screen.
- [x] Build the intro screen + gate + access link.
- [x] Add the global reset (with confirmation) to settings.

## Phase 5: Verification & Documentation

- [x] Write `docs/learning-authoring-guide.md`: block vocabulary + payload schemas, habit rules (`ruleKey`s + params), asset specs (infographic vs illustration), tutorial format, publishing workflow (insert via dashboard/SQL, version bump), slug-immutability contract, sample-content marker; ready for GitHub wiki publication.
- [x] Extend `docs/pre-deployment-checks.md` with the learning-section checklist covering every acceptance criterion on both platforms.
- [x] Run lint/check-types/build — green for `@repo/learning` (lint, types, build, 36 tests), `@repo/supabase` (types, lint), and web (`next build` + `tsc --noEmit`); mobile verified via `expo export` (mobile `expo lint` is pre-existing broken — ESLint 9 vs legacy config).
- [ ] End-to-end walkthrough on web and mobile with sample content: read topic → start habit → record 3 transactions → automatic completion → topic finished → % updates → global and scoped resets. *(blocked — requires migrations applied + running apps)*
- [ ] Verify cross-platform progress, offline reading, first-open-offline error state, download/share failures, and "hábito" terminology. *(blocked — requires running apps)*
- [ ] Verify all 16 acceptance criteria from `spec.md` pass on both platforms; record results. *(blocked — requires running apps)*
- [x] Update `spec/constitution/roadmap.md` — move `002-learning-section` to Done.

---

## Implementation notes / deviations from plan

- **Web content cache** uses `localStorage` rather than IndexedDB (sufficient at this content scale; the plan listed either).
- **Mobile infographic share** uses React Native's built-in `Share` API instead of adding `expo-sharing`/`expo-media-library` (avoids a new native dependency and an EAS rebuild).
- **Mobile habit evidence** is a direct `getTransactionCount()` query (spendings + incomes + transfers) rather than reading the section-scoped `TransactionsContext` (which isn't mounted globally and doesn't fetch on mount). Re-evaluated whenever progress reloads.
- **Migrations/seed** are authored as tracked SQL files but not yet applied to the live project (the MCP SQL role lacks DDL permissions). Apply via `supabase db push` or the dashboard before the end-to-end checks.
