# Implementation Plan — Learning Section

> This plan translates the approved `spec.md` (including the user's answers to the open questions) into a high-level implementation strategy. It is not a line-by-line checklist (that is `tasks.md`). It respects the existing architecture and the constitution's `tech-stack.md` hard limits.

---

## Implementation Overview

Unlike the app foundation, the learning section is **new capability built on an existing prototype**. The web app already contains a mock learning section (`/app/learning` with `LearningPathOverview`, `TopicFlow`, and a block-based renderer fed by `mock-data.ts`), and the web sidebar already links to it. Mobile has nothing. The database has no learning tables.

The implementation is therefore structured as: **data layer → shared domain → evolve web prototype → build mobile → verify and document**.

The work touches five layers:

1. **Data layer (Supabase)** — new learning content tables (levels, topics with block-based content), per-user progress tables (topic progress, habit progress), a single-row content-version table, a `learning-assets` Storage bucket, RLS policies, a DB-enforced habit-immutability trigger, and seeded sample content for end-to-end verification.
2. **Shared domain package (new `@repo/learning`)** — pure, platform-agnostic logic: content type definitions, block payload validation, the **habit rule engine + rule registry**, progress computation, version-compare/sync orchestration (with injected cache adapters), and a minimal inline-formatting parser (**bold**, *italic*). No Supabase import — fully unit-testable with Vitest.
3. **Data access (`@repo/supabase/learning.ts`)** — the per-domain module pattern: content fetch, progress read/write, habit start/complete, manual topic completion, scoped/global reset, intro flag.
4. **Web (`apps/web`)** — evolve the existing prototype: real data via a new `LearningContext`, levels overview (position + percentage), reworked topic reader with new blocks (heading, quote, table, infographic, illustration, tutorial), habit card with explicit start-tracking → automatic completion, topic-level manual completion for habit-less topics, intro screen, settings reset. **Remove `dependsOn` locking** (contradicts the approved "all content accessible" decision).
5. **Mobile (`apps/mobile`)** — new `(app)/learning/` route group, fifth sidebar entry, NativeWind block renderers mirroring the web block vocabulary, same habit/intro/reset flows, i18n keys, background content sync on app open.

Two **deliverables** accompany the code:
- `docs/learning-authoring-guide.md` — the topic-creation instructions (block vocabulary, habit rules, asset specs), ready for the user to publish to the GitHub wiki.
- An extension of `docs/pre-deployment-checks.md` with a learning-section checklist (established by the app-foundation feature as the release gate).

---

## Decisions on Open Questions

The user answered the spec's open questions inline in `spec.md`. Decisions taken here translate those answers into implementation; derived decisions are marked ⚙️.

| # | Question (user's answer) | Decision | Rationale |
|---|--------------------------|----------|-----------|
| 1 | Navigation (mobile: "a fifth tab"; web: sidebar) | **Fifth item in the mobile sidebar** (`SidebarPanel.jsx` items array → `/learning`); web sidebar entry **already exists** (`/app/learning` "Aprende"). | The app-foundation feature replaced mobile's tabs with the `(app)/` sidebar; a fifth sidebar item is the mobile equivalent of "a fifth tab." Flagged so the user is aware of the codebase reality. |
| 2 | Gating (all content accessible; habits must be started intentionally) | **No locking.** Delete the prototype's `dependsOn` mechanism. **Habit lifecycle: `not_started → tracking → completed`** — an explicit "start habit" button moves a habit to `tracking`; only then does automatic evaluation run. ⚙️ **"Current level" = the first level (by `order`) with any incomplete topic** (last level if all complete), so position stays meaningful without gating. | User's answer; prevents accidental habit starts from browsing. |
| 3 | Levels (only levels with content) | The levels overview **queries only levels having ≥1 published topic**. Seed the real level structure (slug `awareness`, order 0) containing the sample topic. | The 7-level skeleton never renders empty; the real Awareness level survives when the sample topic is later removed. |
| 4 | Sample content (yes) | Seed **one sample topic inside the Awareness level** exercising every block type, plus a second habit-less sample topic (verifies manual completion), one infographic asset, one illustration, one tutorial, and one habit with rule `record_n_transactions` (params `{ n: 3 }`) — transactions already work on both platforms, so the full pipeline (evaluate → complete → record → reset) is verifiable end-to-end. Sample topics carry `is_sample: true` for easy later removal. | Chosen rule exercises real user data that already exists. |
| 5 | Habit logic (mix; client evaluates; state written to DB) | **Client-side rule engine in `@repo/learning`**: each rule is a pure function `evaluate(ruleParams, dataSnapshot) → { progress, completed }`. Apps build the snapshot from their existing data (contexts / `@repo/supabase`). On completion the client writes the record to the DB (`learning_habit_progress`). Evaluation triggers: entering the learning section and relevant data changes (transactions/accounts contexts). | Leverages client compute; data source is server-synced so all platforms/sessions see the same inputs; keeps rules unit-testable in isolation. |
| 6 | Intro (first entry only, always accessible) | `profiles.learning_intro_seen boolean` gate; the intro is a screen reachable at any time via a link in the learning section header. | Mirrors the existing `profiles.welcome` precedent. |
| 7 | Content format (evaluate alternatives; space-efficient, flexible: title hierarchy, special paragraph types, bold/italic/tables) | **Structured JSON blocks stored in `jsonb`** — evolve the existing prototype's block vocabulary (concept, explanation, tip, warning, example, reflection, exercise) and add: `heading` (h2/h3 hierarchy), `quote`, `table`, `infographic`, `illustration`, `tutorial`, `habit`. Inline **bold**/*italic* via a minimal markdown-subset parser in `@repo/learning`. **Not raw HTML.** | The prototype already proves the model. vs HTML: no tag boilerplate (space), no sanitization/XSS surface, type-safe per-block rendering, trivially JSON-cacheable offline, and it natively supports "special paragraph types" as first-class blocks. |
| 8 | Sync (online-first today) | **Online-first with offline reading.** Habit completion conflicts resolved as **first-write-wins** enforced by the DB (immutability trigger makes a completed row un-updatable; insert is idempotent via unique constraint). Progress writes queue offline only insofar as the platform clients already tolerate it; a full offline sync architecture is out of scope per the spec. | Matches the app's current online reality; habit immutability makes first-write-wins deterministic. |
| ⚙️ | Reset scope semantics | Global reset (settings) and scoped resets (topic/level) **delete progress rows only** — the `learning_intro_seen` flag is not reset (the intro remains "seen" but is always accessible). | The intro is explanatory, not progress; resetting it would force re-reading on every reset. |
| ⚙️ | Stable habit identity | Habits live inside topic `blocks` (jsonb), so their identity is the pair **`(topic_id, habit_slug)`** — authored slugs, documented in the authoring guide as an immutability contract (never rename a published habit slug). Progress rows reference this pair. | Content can be edited freely (jsonb) without orphaning progress; block `id`s may change, authored slugs must not. |
| ⚙️ | Content versioning | Single-row `learning_meta` table with a monotonically increasing `content_version int`, bumped by a trigger on insert/update of published levels/topics. Clients compare one integer and re-download the full published content set when it differs. | Simplest correct scheme at this content scale; per-topic diffing is premature. |

---

## Affected Areas

### Database (Supabase project — additive migrations)
- New tables: `learning_meta`, `learning_levels`, `learning_topics`, `learning_topic_progress`, `learning_habit_progress`.
- New column: `profiles.learning_intro_seen boolean not null default false` (existing trigger `handle_new_user` untouched — default covers new users).
- RLS: content tables read-only to authenticated users (no user INSERT/UPDATE/DELETE); progress tables user-scoped (`user_id = auth.uid()`).
- Trigger: `learning_habit_progress` immutability — reject any UPDATE that changes `completed_at` from non-null (or changes status from `completed`); DELETE allowed only via reset paths (RLS user-scoped delete).
- Storage bucket: `learning-assets` (public read) with path convention `levels/{level_slug}/topics/{topic_slug}/{asset}`.
- Seed migration: Awareness level + two sample topics (habit and habit-less) + sample assets + `learning_meta` row.

### Shared packages
- **New `packages/learning/`** (`@repo/learning`, raw TS source export like `@repo/supabase`): content types (`LearningLevel`, `LearningTopic`, `Block` union), block payload validators, **habit rule engine + registry** (rule: `evaluate(params, snapshot)`), progress/position computation (current level, per-level %), sync orchestration (`checkAndSync({ getVersion, fetchContent, cache })` with an injected `ContentCache` adapter), minimal markdown-subset parser, Vitest test suite.
- **`packages/supabase/src/learning.ts`** — data access: `fetchPublishedContent()`, `getContentVersion()`, `getLearningProgress(userId)`, `startHabit(topicId, habitSlug)`, `completeHabit(topicId, habitSlug, evaluatedSnapshotSummary)`, `completeTopicManually(topicId)`, `resetLearningProgress({ scope })`, `get/setIntroSeen()`. Consistent `{ error }` return shapes.

### Mobile (`apps/mobile/`)
- `app/(app)/_layout.js` area: **add fifth item to `SidebarPanel.jsx`** (`/learning`, i18n `tabs.learning`) with a suitable Ionicon.
- **New route group `app/(app)/learning/`**: `_layout.js` (Stack), `index.js` (levels overview + intro gate), `intro.js`, `[topicId].js` (topic reader), `[topicId]/tutorial/[tutorialId].js` (tutorial screen).
- New components: block renderers (NativeWind) mirroring the web vocabulary, habit card (start tracking / progress / completed), infographic viewer (expo-image + `expo-sharing` / `expo-media-library` or `Sharing` API), tutorial stepper, progress header (level position + %).
- `contexts/LearningContext.jsx` — content cache + progress state + sync trigger on app open; habit evaluation hook reacting to `TransactionsContext`/data changes.
- `app/(app)/settings/index.js` — global "reset learning progress" with confirmation.
- `assets/locales/{en,es}.json` — `tabs.learning` + `learning.*` keys (intro, habits, statuses, resets, errors) in both files together.
- Local cache: `expo-file-system` (or AsyncStorage) via the shared `ContentCache` adapter; `expo-image` disk-caches assets for offline.

### Web (`apps/web/`)
- `src/app/app/learning/page.tsx` + `mock-data.ts` — **remove mocks**; render from `LearningContext`.
- `src/components/learning/` — **evolve**: keep `ConceptBlock`, `ExplanationBlock`, `TipBlock`, `WarningBlock`, `ExampleBlock`, `ReflectionBlock`, `ExerciseBlock`, `EmptyState`, `ErrorState`, `ProgressBadge`; **rework** `LearningPathOverview` → levels view (position, per-level %, only levels with content); **rework** `TopicFlow` (real data; topic-level "mark as complete" for habit-less topics); **rework** `TaskBlock` → `HabitBlock` (explicit start button; no manual completion; auto progress); **add** `HeadingBlock`, `QuoteBlock`, `TableBlock`, `InfographicBlock` (download/share — anchor download + Web Share API with download fallback), `IllustrationBlock`, `TutorialBlock` (card linking to tutorial route).
- `src/app/app/learning/[topicId]/page.tsx` — **remove `dependsOn` locking**; render real topic.
- New: `src/app/app/learning/intro/page.tsx`; `src/app/app/learning/[topicId]/tutorial/[tutorialId]/page.tsx`; `src/contexts/LearningContext.tsx` (progress + sync + evaluation hook); IndexedDB (or localStorage) `ContentCache` adapter.
- `src/app/app/settings/page.tsx` — global reset section with confirmation.

### Docs
- New: `docs/learning-authoring-guide.md` (the wiki deliverable).
- Update: `docs/pre-deployment-checks.md` (learning-section items).
- Update at completion: `spec/constitution/roadmap.md` (feature status → Done).

---

## Architectural Considerations

### Content model: JSON blocks, not HTML
The approved answer requires space efficiency without sacrificing flexibility (title hierarchies, special paragraph types, bold/italic/tables). The existing prototype already answers this: typed blocks with typed payloads, rendered by per-platform components. `jsonb` gives compact storage, indexable slugs, and direct (de)serialization for offline caching — and eliminates the sanitization surface raw HTML would add on both renderers. The block vocabulary is a **shared contract** defined once in `@repo/learning` (types + validators) and implemented per platform (web Tailwind/shadcn components, mobile NativeWind components). Unknown block types render a graceful fallback (the prototype already does this) so new content can't break old clients.

### The habit mechanism (the core of the feature)
- **Definition** (authored): a `habit` block payload — `habitSlug`, `ruleKey`, `ruleParams`, title, description. The rule registry in `@repo/learning` maps `ruleKey → evaluate(params, snapshot)`.
- **Snapshot** (runtime): the app assembles the evidence data the rules read (e.g., transaction counts/dates, accounts) from its existing contexts/`@repo/supabase` — the same server-synced source on every platform, satisfying "resources available for all platforms and sessions."
- **Lifecycle**: `not_started` → user presses **"Start habit"** → `tracking` (row in `learning_habit_progress`) → evaluation runs (on learning-section entry + on relevant data changes) → condition met → client writes `completed_at` → topic completes. No manual path exists for habit-based topics.
- **Immutability**: enforced twice — the client never writes to a completed row, and the DB trigger rejects any mutation of a completed row. Resets DELETE rows (the only path back to `not_started`).
- **Idempotent completion**: unique constraint on `(user_id, topic_id, habit_slug)`; a second device completing the same habit is a no-op (first-write-wins).

### Content sync and offline caching
`@repo/learning` exposes `checkAndSync`: read cached `{ version, content }` → fetch remote `learning_meta.content_version` → equal: no-op; different: fetch all published levels/topics → write through the injected `ContentCache` adapter → return content. Platform adapters: mobile `expo-file-system`/AsyncStorage; web IndexedDB. Assets are referenced by Storage URLs; offline image display relies on platform disk caches (expo-image on mobile, Cache API best-effort on web) — **text content is the offline guarantee, images are best-effort**, which matches the spec's "read a topic offline." Sync runs on app open (background, non-blocking) and on learning-section entry if the last sync failed.

### Evolving (not discarding) the web prototype
The prototype's components become the real renderer; the **mock data layer is deleted** and the **`dependsOn` lock is removed** (contradicts the approved all-accessible decision). The `task` block concept is renamed to `habit` everywhere user-facing (spec terminology rule), and `validationMode: "manual"` disappears from habits — manual completion moves to the **topic level** and only exists for topics without a habit block (derived at render time from the topic's blocks). `ExerciseBlock`'s interactive-input placeholder stays read-only (interactive exercises are out of scope).

### Mobile consuming raw TS source
`@repo/learning` exports raw `.ts` source, consumed by Metro (mobile) and Next (web) — the same pattern the foundation feature established for `@repo/supabase`. Risk and mitigation are known from that feature (verify Metro transpile config early; thin `.js` re-export shim if needed, without logic duplication).

### What is NOT changed
- The sidebar/tab navigation structure beyond adding the one learning entry.
- Transactions, accounts, dashboards, tools — the feature only **reads** their data for habit snapshots.
- Auth/session (the section simply sits behind the existing `(app)/` and `/app/*` gates).
- No new third-party runtime dependencies on web; mobile adds only Expo modules it doesn't already ship (`expo-sharing` / media-library for download/share, if not present).
- No Edge Functions (all operations are client-representable under RLS; nothing needs service-role).

---

## Data and State Changes

### Database migrations (additive)

1. `learning_meta` — `id int primary key default 1 check (id = 1)`, `content_version int not null default 1`, `updated_at timestamptz`. Single row.
2. `learning_levels` — `id uuid pk`, `slug text unique not null`, `title text not null`, `description text`, `order int not null`, `published boolean not null default false`, timestamps.
3. `learning_topics` — `id uuid pk`, `level_id uuid → learning_levels(id)`, `slug text unique not null`, `title text not null`, `description text`, `order int not null`, `blocks jsonb not null default '[]'`, `is_sample boolean not null default false`, `published boolean not null default false`, timestamps.
4. `profiles.learning_intro_seen` — `boolean not null default false`.
5. `learning_topic_progress` — `id uuid pk`, `user_id uuid → auth.users(id) on delete cascade`, `topic_id uuid → learning_topics(id)`, `status text check (in 'in_progress','completed')`, `started_at`, `completed_at`, unique `(user_id, topic_id)`.
6. `learning_habit_progress` — `id uuid pk`, `user_id uuid → auth.users(id) on delete cascade`, `topic_id uuid → learning_topics(id)`, `habit_slug text not null`, `status text check (in 'tracking','completed')`, `tracking_started_at`, `completed_at`, `evaluation_note jsonb`, unique `(user_id, topic_id, habit_slug)`.
7. Trigger `bump_learning_content_version()` on INSERT/UPDATE of `learning_levels`/`learning_topics` (published only) → `learning_meta.content_version += 1`.
8. Trigger `learning_habit_immutable()` BEFORE UPDATE on `learning_habit_progress` — raise if `OLD.status = 'completed'` and row would change.
9. RLS: `learning_levels`/`learning_topics`/`learning_meta` → SELECT for authenticated (public content; team writes via dashboard/service role). Progress tables → full CRUD where `user_id = auth.uid()`. `profiles` UPDATE policy already covers the intro flag.
10. Storage bucket `learning-assets` (public).
11. Seed: Awareness level (published), sample habit-topic (all block types incl. infographic/illustration/tutorial/habit `record_n_transactions n=3`), sample habit-less topic, sample assets in the bucket.

### Client state / persistence
- New `LearningContext` per platform: published content (from cache/sync), user progress map, habit evaluation results, sync status. No changes to existing contexts.
- Local content cache per device (adapter pattern); progress always fetched from the DB (source of truth), never cached as authoritative.

### Effects on existing data
- All migrations are additive; existing users get `learning_intro_seen = false` (intro shows once — correct: the section is new to everyone) and empty progress. No backfill.

---

## Implementation Phases

### Phase 1 — Data layer
- Migrations (tables, column, triggers, RLS, bucket, seed + sample assets).
- Verify policies with the advisors; publish content-version bump works.

### Phase 2 — Shared domain (`@repo/learning`)
- Package scaffold (raw-source export, tsconfig from `@repo/typescript-config`, Vitest).
- Content types + block payload validators; markdown-subset parser.
- Habit rule engine + registry (+ the `record_n_transactions` rule); position/percentage computation; sync orchestration with cache adapter interface.
- `@repo/supabase/learning.ts` data-access module.
- Unit tests (validators, parser, rules, position math, sync logic with fake adapters/cache).

### Phase 3 — Web
- `LearningContext` + IndexedDB adapter; wire sync on app open / section entry.
- Rework overview → levels view (only levels with content, position, %); remove locking; delete mocks.
- Rework topic reader: real data, new blocks, `HabitBlock` (start/progress/completed), manual completion for habit-less topics, infographic download/share, tutorial screen.
- Intro screen + gate + permanent access link; settings global reset.

### Phase 4 — Mobile
- Sidebar entry + i18n keys; `learning/` route group; `LearningContext` + file-system cache adapter.
- Levels overview, topic reader with NativeWind block renderers, habit card, infographic share/download, tutorial screen, intro screen, settings reset.
- Habit evaluation hook on transactions/data changes.

### Phase 5 — Verification & docs
- `docs/learning-authoring-guide.md`; extend `docs/pre-deployment-checks.md`.
- Walk every acceptance criterion on both platforms (sample content end-to-end: read → start habit → record 3 transactions → auto-completion → topic finished → % updates → resets).
- Update `constitution/roadmap.md` → Done.

---

## Testing and Verification Strategy

### Automated (Vitest, in `@repo/learning` — consistent with the repo's test convention)
- Block payload validators: every block type (valid/invalid payloads, unknown types).
- Markdown-subset parser: bold/italic/nesting edge cases, no HTML pass-through.
- Rule engine: `record_n_transactions` progress math and completion threshold; registry behavior for unknown ruleKey (habit renders but never completes — the spec's "evidence source not built" edge).
- Position computation: current level (first incomplete, all-complete), percentage.
- Sync orchestration: same version → no fetch; newer → fetch + cache write; fetch failure → cached content preserved + error surfaced; version rollback rejected.
- Immutability/first-write-wins are DB-level — verified via the manual doc (and optionally an integration test if a local Supabase harness is easily available; not required).

### Manual (the release gate — `docs/pre-deployment-checks.md`, learning section)
Each acceptance criterion maps to items covering both platforms: entry point; position/percentage; intro (first entry + anytime access); topic reading (all block types); infographic download/share vs illustration no-actions; tutorial screen; habit start → automatic completion via 3 recorded transactions; no manual path on habit topics; manual completion on habit-less topic; completion immutability (post-completion behavior doesn't revert it); global reset from settings; scoped resets; background version bump → refresh; offline reading (airplane-mode after sync); cross-platform progress (complete on mobile, verify on web); error surfaces (first-open offline, download failure, reset failure); "hábito" terminology on every screen.

### Baseline
`pnpm run lint`, `pnpm run check-types`, `pnpm run build` must pass before manual checks (repo convention).

---

## Risks and Considerations

- **Metro transpiling `@repo/learning` TS source on mobile** — same known risk as `@repo/supabase` in the foundation feature; verify early in Phase 4, fall back to a thin `.js` re-export shim without logic duplication.
- **Habit evaluation correctness across platforms** — two renderer stacks evaluating one engine: mitigated by the engine living in `@repo/learning` with unit tests; apps only build snapshots, and snapshot shape is typed in the shared package.
- **Snapshot availability** — rules read transaction/account data through existing contexts; if a rule's evidence doesn't exist yet (feature not built), the habit must sit at `tracking` with zero progress and never crash — covered by engine tests and the unknown/missing-data path.
- **Content version stampedes** — a bump triggers one full re-download per device; content is small (jsonb text + asset URLs) but the sync must be non-blocking on app open and must never brick the section on failure (cached content remains authoritative).
- **Offline images are best-effort** — only text content is guaranteed offline; the authoring guide must tell authors that infographics should be reasonably sized and that critical information must not live only inside an image.
- **Immutability trigger vs. scoped resets** — resets DELETE rows (allowed by RLS), the trigger only guards UPDATEs; the plan keeps these paths strictly separate. A reset racing an in-flight completion resolves as either "row deleted then re-inserted on next evaluation" or "completion rejected because the row is gone" — both converge to a consistent state.
- **Renaming the prototype's semantics** — removing `dependsOn` and `validationMode: "manual"` changes the mock's authored shape; nothing persisted depends on it (mocks only), so the change is free, but the authoring guide must describe only the new model to avoid stale wiki content.
- **Content authoring ergonomics** — writing `jsonb` blocks by hand is error-prone; the guide must include copy-pasteable block templates and the payload schemas, and the validators' error messages should be author-readable so a malformed payload is diagnosed at seed time, not at render time.
- **`profiles.learning_intro_seen` on existing users** — defaults false, so every current user sees the intro once on first entry to the new section: intended (the section is new to everyone).
- **Sample content in production** — the sample topics ship behind `is_sample: true` and `published: true`; removing them later is a one-line unpublish + version bump. The guide must mark them clearly so they aren't mistaken for real curriculum content.
