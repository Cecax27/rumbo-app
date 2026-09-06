# Implementation Tasks — Learning Section

> Derived from the approved `plan.md`. Check off items as work is completed and verified. Do not mark complete until the work is actually done and passing its verification step.

---

## Phase 1: Data Layer (Supabase)

- [ ] Create `learning_meta` table (single row, `content_version int`) with its initial row.
- [ ] Create `learning_levels` table (slug, title, description, order, published, timestamps).
- [ ] Create `learning_topics` table (level FK, slug, title, description, order, `blocks jsonb`, `is_sample`, published, timestamps).
- [ ] Add `profiles.learning_intro_seen boolean not null default false`.
- [ ] Create `learning_topic_progress` table (user FK cascade, topic FK, status, timestamps, unique `(user_id, topic_id)`).
- [ ] Create `learning_habit_progress` table (user FK cascade, topic FK, `habit_slug`, status, `tracking_started_at`, `completed_at`, `evaluation_note jsonb`, unique `(user_id, topic_id, habit_slug)`).
- [ ] Create trigger `bump_learning_content_version()` on published `learning_levels`/`learning_topics` insert/update.
- [ ] Create trigger `learning_habit_immutable()` rejecting updates to completed habit rows.
- [ ] Add RLS policies: content tables + `learning_meta` SELECT for authenticated only; progress tables user-scoped CRUD (`user_id = auth.uid()`).
- [ ] Create public `learning-assets` Storage bucket with the `levels/{level_slug}/topics/{topic_slug}/…` path convention.
- [ ] Seed the Awareness level (published) + sample habit topic (all block types, habit `record_n_transactions` with `{ n: 3 }`) + sample habit-less topic + sample infographic/illustration/tutorial assets in the bucket.
- [ ] Verify: advisors clean, version bump fires on content edit, RLS blocks cross-user access and content writes from clients.

## Phase 2: Shared Domain (`@repo/learning` + `@repo/supabase/learning.ts`)

- [ ] Scaffold `packages/learning/` (raw TS source export, `@repo/typescript-config` tsconfig, Vitest, workspace + Turbo wiring).
- [ ] Define content types: `LearningLevel`, `LearningTopic`, and the `Block` union (concept, explanation, tip, warning, example, reflection, exercise, heading, quote, table, infographic, illustration, tutorial, habit).
- [ ] Implement block payload validators with author-readable error messages (plus graceful unknown-type handling).
- [ ] Implement the minimal markdown-subset parser (**bold**, *italic*; no HTML pass-through).
- [ ] Implement the habit rule engine + registry: `evaluate(params, snapshot) → { progress, completed }`, with defined behavior for unknown ruleKey / missing snapshot data (never completes, never crashes).
- [ ] Implement the `record_n_transactions` rule.
- [ ] Implement position/percentage computation (current level = first level with incomplete topics; per-level %; all-complete case).
- [ ] Implement sync orchestration (`checkAndSync` with injected `ContentCache` adapter; same-version no-op; newer → fetch + cache; failure → keep cache + surface error; reject older versions).
- [ ] Create `packages/supabase/src/learning.ts`: `fetchPublishedContent`, `getContentVersion`, `getLearningProgress`, `startHabit`, `completeHabit`, `completeTopicManually`, `resetLearningProgress({ scope })`, `get/setIntroSeen` — consistent `{ error }` shapes.
- [ ] Unit tests green: validators, parser, rule engine, position math, sync logic with fake adapters/cache (`pnpm --filter @repo/learning test`).

## Phase 3: Web

- [ ] Create `LearningContext` + IndexedDB `ContentCache` adapter; wire sync on app open and on learning-section entry (non-blocking).
- [ ] Rework `/app/learning` overview into the levels view: only levels with published content, current level position, total levels, per-level completion %; delete `mock-data.ts` and remove `dependsOn` locking.
- [ ] Rework `[topicId]` page to render real content through the block renderer, with topic status badge.
- [ ] Add `HeadingBlock`, `QuoteBlock`, `TableBlock` (with inline bold/italic rendering).
- [ ] Rework `TaskBlock` into `HabitBlock`: start-habit button → tracking state with progress → completed state; no manual completion path.
- [ ] Implement topic-level "mark as complete" for habit-less topics only (derived from the topic's blocks).
- [ ] Add `InfographicBlock` (download via anchor + share via Web Share API with download fallback) and `IllustrationBlock` (view only, no actions).
- [ ] Add `TutorialBlock` card + `[topicId]/tutorial/[tutorialId]` step-by-step screen with screenshots.
- [ ] Create the intro screen + first-entry gate (`profiles.learning_intro_seen`) + permanent access link from the learning section.
- [ ] Add the global "reset learning progress" section (with confirmation) to the settings page.

## Phase 4: Mobile

- [ ] Add the fifth sidebar item (`/learning`) in `SidebarPanel.jsx` and `tabs.learning` + all `learning.*` i18n keys in both `en.json` and `es.json`.
- [ ] Verify Metro transpiles `@repo/learning` TS source (fallback: thin `.js` re-export shim, no logic duplication).
- [ ] Create `app/(app)/learning/` route group: `_layout.js`, `index.js`, `intro.js`, `[topicId].js`, `[topicId]/tutorial/[tutorialId].js`.
- [ ] Create `LearningContext` + file-system cache adapter; wire background sync on app open.
- [ ] Build the levels overview screen (position, total, %, only levels with content).
- [ ] Build the topic reader with NativeWind block renderers for the full block vocabulary (unknown-type fallback included).
- [ ] Build the habit card (start tracking / progress / completed) using the shared rule engine.
- [ ] Implement habit evaluation hook reacting to transactions/data changes (snapshot from existing contexts).
- [ ] Implement infographic share/download (`expo-sharing` / media-library; graceful failure with retry) and illustration (view only).
- [ ] Build the tutorial stepper screen.
- [ ] Build the intro screen + gate + access link.
- [ ] Add the global reset (with confirmation) to settings.

## Phase 5: Verification & Documentation

- [ ] Write `docs/learning-authoring-guide.md`: block vocabulary + payload schemas, habit rules (`ruleKey`s + params), asset specs (infographic vs illustration), tutorial format, publishing workflow (insert via dashboard/SQL, version bump), slug-immutability contract, sample-content marker; ready for GitHub wiki publication.
- [ ] Extend `docs/pre-deployment-checks.md` with the learning-section checklist covering every acceptance criterion on both platforms.
- [ ] Run `pnpm run lint`, `pnpm run check-types`, `pnpm run build` — all green.
- [ ] End-to-end walkthrough on web and mobile with sample content: read topic → start habit → record 3 transactions → automatic completion → topic finished → % updates → global and scoped resets.
- [ ] Verify cross-platform progress (complete on one platform, reflects on the other), offline reading after sync, first-open-offline error state, download/share failures, and "hábito" terminology on every screen.
- [ ] Verify all 16 acceptance criteria from `spec.md` pass on both platforms; record results.
- [ ] Update `spec/constitution/roadmap.md` — move `002-learning-section` to Done.
