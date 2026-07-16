# 003 - Guided Learning Engine

## Approach

Build the Learning Engine as a **cross-functional capability** (not a single app section), per the spec's design considerations. The engine interprets content stored in the database, evaluates user progress, and coordinates with existing app actions (transactions, accounts, budgets). The UI is a thin visual layer over this engine.

To allow step-by-step inspection, the feature is divided into **5 sequential phases**. Each phase produces a reviewable artifact and is inspected before the next begins. **Phases 1 and 2 build the UI shell (routes, components, styling) with mock/dummy data** — the dev server must be runnable at the end of each to visually inspect the design. No backend wiring or real data fetching happens until Phase 5. Phase 3 is schema; Phase 4 is engine + types + data access; Phase 5 connects the engine to the UI built in 1 and 2.

```
Phase 1 — Web UI             (routes, components, styles, mock data — runnable dev server)
Phase 2 — Mobile UI          (screens, navigation, styles, mock data — runnable Expo dev)
Phase 3 — Database design    (Supabase schema + RLS + seed)
Phase 4 — Engine             (@repo/learning: types, queries, validators, progress, tests)
Phase 5 — Integration        (wire engine into existing web + mobile UI, remove mocks)
```

The engine lives in a **new package `@repo/learning`** so both apps consume the same typed surface and validation logic. This mirrors how `@repo/retirement-plan-calculation` isolates a calculation domain, and keeps `@repo/supabase` as a thin data-access layer (queries only, no domain rules).

### Shared entity contract (referenced by every phase)

Defined once; the DB schema, web UI, mobile UI, and engine all bind to it. The **shape** is decided during Phase 1/2 UI design so mockups bind to realistic data; the **formalization** happens in Phase 3 (DDL) and Phase 4 (TS types).

| Entity | Responsibility |
|---|---|
| `LearningPath` | Ordered recommended journey (root container). |
| `Topic` | A learning unit (e.g. Budgeting). Belongs to a path, has an order. |
| `TopicDependency` | Edge between two topics (prerequisite -> dependent). |
| `ContentBlock` | One node in a topic's free-flow sequence. Polymorphic by `type`. |
| `BlockType` | Config: concept, explanation, tip, example, warning, reflection, exercise, task. Extensible to video/quiz/simulator later. |
| `TaskDefinition` | Achievement vs follow-up + validation descriptor (automatic rule key + params, or manual). |
| `UserTopicProgress` | Per-user topic state: not_started / in_progress / completed. |
| `UserTaskProgress` | Per-user task state: pending / completed (+ completed_at; + evaluated_at for follow-ups). |

---

## Implementation

### Phase 1 — Web UI

**Goal:** build the learning UI shell on web with routes, components, and styling — backed by **hardcoded mock data**, no real Supabase calls. At the end of this phase, the dev server shows the learning screens fully styled and navigable via mock data.

**Sub-steps (each inspectable):**

1. **Sidebar entry** — add an "Aprende" nav item to the authenticated sidebar (`apps/web/src/app/ui/components/navigation.tsx`). The existing nav uses **MUI icons** (`@mui/icons-material`); pick one not already used (e.g. `School` or `AutoStories` — `MenuBook` is taken by Documentación). Position after Cuentas, before Ajustes. Links to `/app/learning`.
2. **Mock data file** — create `apps/web/src/app/app/learning/mock-data.ts` with a hardcoded demo path + 2 topics (one unlocked, one locked behind a dependency) + ~5-6 blocks per topic covering all block types (concept, tip, warning, example, reflection, exercise, task) + 1 achievement task + 1 follow-up task. No Supabase imports. Pure JS/TS objects matching the entity shapes from the shared contract.
3. **Filesystem routes** — create the route files under `apps/web/src/app/app/learning/`:
   - `page.tsx` — `/app/learning` (path overview).
   - `[topicId]/page.tsx` — `/app/learning/[topicId]` (topic flow).
   - `[topicId]/[blockId]/page.tsx` — optional per-block anchor (deferred; create placeholder or skip — see tasks).
4. **Path overview screen** (`page.tsx`) — server component wrapping `LearningPathOverview` client component. Renders a header (path title, progress), then an ordered list of `TopicCard`s from the mock data. Each card shows: title, description, status badge (not started / in progress / completed / locked), CTA linking to `[topicId]`. Locked topics show a hint of what unblocks them.
5. **Topic flow screen** (`[topicId]/page.tsx`) — server component wrapping `TopicFlow` client component. Renders a vertical stack of `ContentBlock` components dispatched by `block.type`. The dispatch is a `switch` on `block.type` mapped to `ConceptBlock`, `TipBlock`, `WarningBlock`, `ExampleBlock`, `ReflectionBlock`, `ExerciseBlock`, `TaskBlock`. Props are the block's `payload` fields.
6. **Block components** — build one shadcn-based component per block type under `apps/web/src/components/learning/`:
   - `ConceptBlock` / `ExplanationBlock` — prose card with title + body.
   - `TipBlock` — callout card with amber/emphasis background (`#f6b23a`).
   - `WarningBlock` — callout card with orange/red background (`#f97316`).
   - `ExampleBlock` — framed card with "Ejemplo" label.
   - `ReflectionBlock` — prompt card with a `<textarea>` for notes (local state only, not persisted in this phase).
   - `ExerciseBlock` — placeholder card (text content, frame for future interactivity).
   - `TaskBlock` — dispatches to `AchievementTaskCard` or `FollowupTaskCard` based on `taskKind`.
7. **Task card components** — two variants under `apps/web/src/components/learning/`:
   - `AchievementTaskCard` — title, description, status chip (pending/done), a button for manual completion. Clicking the button flips local state only (no persistence). Once done, stays done.
   - `FollowupTaskCard` — title, description, status chip (may flip), last-evaluated hint, a button "Verificar ahora" that simulates evaluation using mock data. Status can flip pending↔done for visual preview.
8. **Progress indicators** — `ProgressBadge` component (topic-level progress: X/Y blocks done). Overall path progress bar (completed topics / total). Both computed from mock data.
9. **Empty / loading / error states** — styled states for: no path assigned, network error placeholder, empty topic. Renderable via mock data flags.
10. **Quality gates** — `pnpm run lint --filter=web` passes, `pnpm run check-types --filter=web` passes, `pnpm run build --filter=web` passes, dev server at `pnpm run dev --filter=web` is runnable and the learning screens are visually inspectable.

**Deliverable:** working `/app/learning/*` routes on the web dev server, fully styled with mock data. CTA buttons may fire `console.log` or flip local state; no Supabase calls, no real task validation, no database reads/writes.

### Phase 2 — Mobile UI

**Goal:** build the learning UI shell on mobile with screens, navigation, and styling — backed by **the same mock data shapes** as Phase 1. At the end of this phase, the Expo dev server shows the learning screens fully styled and navigable via mock data.

**Sub-steps:**

1. **Navigation placement** — keep the 4 existing tabs (core financial tools); add learning as a Stack route `/(tabs)/learning/*`. Entry point: a Dashboard card or "Aprende" button. To confirm during review. Route files:
   - `app/(tabs)/learning/index.js` — path overview.
   - `app/(tabs)/learning/[topicId].js` — topic flow.
   - `app/(tabs)/learning/[topicId]/[blockId].js` — optional deep-link (deferred).
2. **Mock data** — create `apps/mobile/lib/learning/mockData.js` using the same demo data shapes and values as the web mock.
3. **Path overview screen** — `ScrollView`/`FlatList` of `TopicCard` components with progress. NativeWind styling consistent with Dashboard.
4. **Topic flow screen** — `ScrollView` of block components dispatched by type, same block-types and semantics as web.
5. **Block components** — build NativeWind components mirroring web: `ConceptBlock`, `TipBlock`, `WarningBlock`, `ExampleBlock`, `ReflectionBlock`, `ExerciseBlock`, `TaskBlock`. Uses `react-native-vector-icons` for status/aesthetic icons.
6. **Task card variants** — `AchievementTaskCard` + `FollowupTaskCard`. Local state for status changes (same as web). Feedback via `Alert` or inline text instead of `sonner`.
7. **i18n keys** — add `learning.*` namespace to `apps/mobile/assets/locales/{en,es}.json`.
8. **Quality gates** — `expo lint` passes, `pnpm run start --filter=mobile` is runnable and the learning screens are visually inspectable.

**Deliverable:** working `/(tabs)/learning/*` screens on the Expo dev server, fully styled with mock data. Same mock-data-fed behavior as web Phase 1.

### Phase 3 — Database design (Supabase)

**Goal:** schema that stores all engine configuration and user progress dynamically — no hardcoded content. Output: `phase-3-database.md` (DDL draft, reviewed before applying via `supabase_apply_migration`).

**Sub-steps:**

1. **Table `learning_paths`** — `id uuid pk`, `slug text unique`, `title text`, `description text`, `is_active bool default true`, `created_at`, `updated_at`. Seed with one default path; real content authoring is out of scope per spec.
2. **Table `learning_topics`** — `id uuid pk`, `path_id uuid fk`, `slug text`, `title text`, `description text`, `order int`, `is_active bool`. Unique `(path_id, slug)`.
3. **Table `learning_topic_dependencies`** — `topic_id uuid fk`, `requires_topic_id uuid fk`, primary key on both. Check constraint preventing self-reference. This is the prerequisite graph.
4. **Table `learning_block_types`** — config table (not enum, so new types can be added without DDL — matches acceptance "new task types can be added using the existing architecture" and "extensible to new types of blocks"). Columns: `id`, `key text unique` (e.g. `concept`, `tip`, `task`), `display_name text`, `category text` (`content` vs `task`), `is_task bool`.
5. **Table `learning_blocks`** — `id uuid pk`, `topic_id uuid fk`, `type_key text fk->learning_block_types.key`, `order int`, `payload jsonb` (title, body, etc. — schema varies by type), `is_active bool`. Polymorphic via `type_key` + `payload`; adding a new block type = inserting a row in `learning_block_types` + a payload convention, no DDL.
6. **Table `learning_task_definitions`** — `id uuid pk`, `block_id uuid fk` (1:1 with task-typed blocks), `task_kind text` (`achievement` | `follow_up`), `validation_mode text` (`automatic` | `manual`), `rule_key text null` (only when automatic — references a registered validator key in the engine, e.g. `has_created_budget`), `rule_params jsonb null`. No code per task: the engine resolves `rule_key` -> validator function via a registry (Phase 4).
7. **Table `learning_user_topic_progress`** — `user_id uuid fk->auth.users`, `topic_id uuid fk`, `status text` (`not_started` | `in_progress` | `completed`), `started_at timestamptz null`, `completed_at timestamptz null`, pk `(user_id, topic_id)`. RLS: own rows only.
8. **Table `learning_user_task_progress`** — `user_id uuid fk->auth.users`, `task_definition_id uuid fk`, `status text` (`pending` | `completed`), `completed_at timestamptz null`, `evaluated_at timestamptz null` (for follow-ups: last automatic evaluation), `manual_override bool default false`, pk `(user_id, task_definition_id)`. RLS: own rows only.
9. **Block-level progress (decision needed)** — see Decisions. Recommended: per-task + per-topic only; no per-block completion table (block-level completion is derived). A future "seen" flag per block can be added without redesign.
10. **RLS policies** — config tables (`learning_paths`, `learning_topics`, `learning_topic_dependencies`, `learning_block_types`, `learning_blocks`, `learning_task_definitions`) are read-only to `authenticated` (SELECT only; no client INSERT/UPDATE/DELETE). Progress tables are user-scoped (SELECT/INSERT/UPDATE where `auth.uid() = user_id`). Run `supabase_get_advisors` after migration to confirm no missing policies.
11. **Seed data** — insert block types (concept, explanation, tip, example, warning, reflection, exercise, task) and one minimal demo topic with 2-3 blocks + 1 task, purely for end-to-end verification. Real content authoring is explicitly out of scope (spec §Scope of Work).
12. **Indexing** — indexes on `(path_id, order)`, `(topic_id, order)`, `(user_id, topic_id)`, `(user_id, task_definition_id)`. Run `supabase_get_advisors` performance pass after migration.

**Deliverable:** `phase-3-database.md` (full DDL + RLS + seed), then applied via `supabase_apply_migration` during Phase 4 setup.

### Phase 4 — Engine implementation (`@repo/learning` package)

**Goal:** the typed, framework-agnostic core both apps consume. No UI here — types, data access, validators, and progress computation. Output: new package `packages/learning/`.

**Sub-steps:**

1. **Scaffold package** — `packages/learning/package.json` (`@repo/learning`, exports raw source like `@repo/supabase`/`@repo/ui`), `tsconfig.json` extending `@repo/typescript-config`, ESLint extending `@repo/eslint-config/base`. Auto-included by `pnpm-workspace.yaml` (already globs `packages/*`).
2. **Apply the Phase 3 migration** via `supabase_apply_migration`, then run `supabase_get_advisors` (security + performance) and address findings.
3. **Types** (`src/types.ts`) — TS interfaces mirroring the DB contract, plus discriminated unions for `ContentBlock` by `type` so the UI can exhaustively `switch` on block type.
4. **Data access** (`src/queries.ts`) — thin functions calling `@repo/supabase/client`:
   - `getPath(slug)` -> path + topics + dependencies (single round-trip).
   - `getTopic(topicId)` -> topic + ordered blocks + task definitions.
   - `getUserProgress(topicId?)` -> topic + task progress for the current user.
   - `upsertTaskProgress(taskId, status)` — for manual completion.
   - `upsertTopicProgress(topicId, status)` — `in_progress` on first open, `completed` when engine computes it.
5. **Validator registry** (`src/validators/index.ts`) — the key extensibility seam. Map of `rule_key -> (params, ctx) => Promise<boolean>`. Initial built-in validators reference existing app state (has the user created a budget, recorded income, created a savings goal, set up >=2 accounts — per spec examples). Validators receive a `ctx` with the user's data (read via `@repo/supabase`) and `rule_params` from the DB. **No per-task code**: adding a task = using a `rule_key` in a task definition row + a validator entry here. New rule types are added to the registry, not the model.
6. **Progress computation** (`src/progress.ts`) — pure functions:
   - `isTopicUnlocked(topicId, dependencies, userProgress)` — all prerequisites completed.
   - `computeTopicStatus(topicId, blocks, userTaskProgress)` — completed when all task-blocks of the topic are completed. Non-task blocks don't affect completion (see Decisions).
   - `computePathProgress(path, userTopicProgress)` — % of completed topics.
7. **Follow-up evaluation runner** (`src/runners/followup.ts`) — for a given user, selects all `follow_up` task definitions, runs their validators, and upserts `learning_user_task_progress` with the new status + `evaluated_at`. Invoked on-demand ("Revisar ahora" button) in this phase. Scheduled evaluation (Supabase Cron / Edge Function) is deferred, out of scope.
8. **Unit tests** (`src/__tests__/`) — Vitest v4, matching the repo's test convention (`@repo/retirement-plan-calculation` and `@repo/transactions-parser` are the references). Cover: dependency unlock logic, topic status computation, path progress %, validator registry dispatch. Data-access functions are not unit-tested (they hit Supabase); correctness is verified in Phase 5 end-to-end.
9. **Build & verify** — `build: tsc -p tsconfig.json` to `dist/`, registered in Turborepo `build` pipeline. Run `pnpm run check-types`, `pnpm run lint`, `pnpm --filter @repo/learning test`.

**Deliverable:** `@repo/learning` package with types, queries, validators, progress logic, and passing tests.

### Phase 5 — Integration (web + mobile)

**Goal:** replace mock data with real engine calls, wire `@repo/learning` data access into both apps, add real task validation, and remove all hardcoded mock data. The UI built in Phases 1 and 2 is wired to the engine built in Phase 4.

**Sub-steps:**

1. **Web — `LearningContext`** (`apps/web/src/contexts/LearningContext.tsx`) — new provider added to the `/app/*` layout's provider stack (`ToolsProvider > TransactionsProvider > AccountsProvider` -> add `LearningProvider`). Replaces the mock data imports with calls to `@repo/learning` queries. Exposes `refresh`, `completeTaskManually`, `evaluateFollowups`.
2. **Web — replace mock data** — remove `apps/web/src/app/app/learning/mock-data.ts`. Update all components to read from `LearningContext` instead of the mock import.
3. **Web — sidebar entry** — confirm the Phase 1 sidebar entry is correct (already built).
4. **Web — task interactions** — wire task CTA buttons to `@repo/learning` functions: manual tasks call `upsertTaskProgress`; automatic tasks call the follow-up runner and upsert the result. Replace local `useState` with context state.
5. **Mobile — learning hook** (`apps/mobile/lib/learning/`) — a `useLearning()` hook wrapping `@repo/learning` data-access functions. Replaces mock data imports.
6. **Mobile — replace mock data** — remove mock data file. Update all screens to use `useLearning()`.
7. **Mobile — task interactions** — same semantics as web: manual complete, automatic evaluate, follow-up status display. Wire to engine functions.
8. **Cross-platform parity check** — verify both apps render the same demo topic and that a task completed on one platform is reflected on the other (progress is server-side).

---

## Decisions

- **New package `@repo/learning`** (vs. putting logic in `@repo/supabase`): the spec frames learning as a cross-functional *capability*, not a data table. `@repo/supabase` stays a thin data-access layer; the engine (validators, progress computation, runner) belongs in its own package. Mirrors the precedent of `@repo/retirement-plan-calculation` isolating a calculation domain.
- **Block-type extensibility via config table, not enum**: `learning_block_types` is a regular table so new types (video, quiz, simulator) are added by inserting a row + a new payload convention, with no DDL and no model change — directly satisfying acceptance "new task types can be added using the existing architecture" and "extensible to new types of blocks."
- **Validator registry vs. per-task code**: the spec is explicit ("Validation rules do not depend on specific code for each task"). The registry pattern (`rule_key -> validator`) means a task's logic is referenced by a string in the DB and resolved at runtime. Adding a new automatic rule = adding a validator function + using its key in a task definition row. This is the minimum viable interpretation of "no per-task code" while still requiring *some* code for genuinely new rule types.
- **Polymorphic blocks via `payload jsonb`**: avoids a wide single-table-per-type model and lets new block types appear without schema changes. Trade-off: less referential integrity on payload shape — mitigated by TS discriminated unions in `@repo/learning` and by keeping payload schemas small and documented in `phase-3-database.md`.
- **Per-topic + per-task progress only (no per-block completion table)**: the spec's progress acceptance criteria are "which topics completed", "which tasks active/pending/incomplete", and "which topics can be started based on dependencies" — none require block-level completion. A topic is `completed` when all its task-blocks are completed. Non-task blocks (concept, tip, ...) are informational and don't gate progress. Keeps the schema minimal. A future "seen" flag per block can be added without redesign (extensibility acceptance).
- **Learning is an authenticated feature on both platforms** — no public routes, no middleware added (web has no `middleware.ts` and this feature doesn't introduce one).
- **Learning is a sub-route, not a new 5th tab** (mobile) and a sibling `/app/learning/*` branch (web) — to be confirmed at the start of Phase 1 and Phase 2 respectively. Keeping the 4 core tabs preserves the existing information architecture.
- **Initial follow-up evaluation is on-demand** ("Revisar ahora" button), not scheduled. Scheduled evaluation (Supabase Cron / Edge Function) is deferred, out of scope for this phase.
- **Reflection notes storage** (open question): whether reflections get persisted as user notes is not required by any acceptance criterion. Decision for Phase 1: build the reflection card with a local-only notes field (`<textarea>` on web, `TextInput` on mobile); persisting notes is deferred unless a later spec requires it.
- **Spanish-first copy**: web is hardcoded Spanish inline (web convention); mobile uses the i18n `learning.*` namespace. Both apps display the same Spanish copy in this phase.
- **No new dependencies expected**: web already has shadcn, react-hook-form, zod, sonner, lucide-react. Mobile already has react-native-vector-icons, i18next, NativeWind. `@repo/learning` adds no runtime deps beyond `@repo/supabase` (already present) and Vitest dev-dep (already in repo).

## Risks

- **Validator registry scope creep**: "no per-task code" could be misread as "no code at all for new rules." Any genuinely new automatic rule still requires a validator function in `@repo/learning`. Mitigation: document the registry contract clearly in Phase 4 and require a spec/PR description when adding a new `rule_key`.
- **RLS on config tables**: forgetting SELECT-only policies would let any user edit content. Mitigation: run `supabase_get_advisors` (security) immediately after the Phase 3 migration and again at the end of Phase 5.
- **Jsonb payload drift**: with polymorphic blocks, the `payload` shape is only enforced in TS, not in Postgres. A typo in seed data or a future content edit could break rendering. Mitigation: keep payload schemas small, document them in `phase-3-database.md`, and have `@repo/learning` types act as the contract; add a parser test for each block type.
- **Follow-up evaluation cost**: on-demand evaluation reads the user's full financial state per validator. If a path has many follow-up tasks, "Revisar ahora" could be slow. Mitigation: batch reads in the `ctx` (one query per data type, not per task); defer scheduled batch evaluation to a later feature.
- **Cross-platform state staleness**: a user completes a task on mobile, then opens web — the web `LearningContext` must refetch, not assume cached state. Mitigation: `LearningContext` fetches on mount and exposes `refresh` for explicit re-fetch after cross-device transitions.
- **Mobile tab layout complexity**: adding a Stack under `(tabs)` may interact with the existing nested `<Stack>` per-tab pattern (`apps/mobile/app/(tabs)/_layout.js`). Mitigation: confirm in Phase 2 that the Stack nesting is supported by Expo Router v5 before designing deeper.
- **Hardcoded Supabase URL/key** (existing repo risk, not introduced here): `@repo/learning` depends on `@repo/supabase/client` which has hardcoded credentials. Out of scope for this feature; flagged in `tech-stack.md`.
