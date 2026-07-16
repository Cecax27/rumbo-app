# 003 - Phase 1: Web UI design

> **Scope of this file:** tasks for **Phase 1 only** (web UI design). Phase 1 is **design-only** — no production code is written. The deliverable is the document `spec/features/003-learning-section/phase-1-web-ui.md` containing wireframes, a route map, and a component tree. Implementation of these designs happens in Phase 5.
>
> Each section ends with a **Review checkpoint** so the work can be inspected one piece at a time before continuing, per the user's step-by-step preference.

## Spec & docs

- [ ] Create `spec/features/003-learning-section/phase-1-web-ui.md` with the section scaffolding (headings matching the 8 sub-steps of Phase 1 in `plan.md`).
- [ ] Review: confirm the scaffold covers all Phase 1 sub-steps (route map, sidebar entry, path overview, topic flow, task card, progress, states, component tree).

## 1. Route map

- [ ] Define the authenticated route branch `/app/learning/*` as a sibling of `/app/transactions`, `/app/accounts` (under `apps/web/src/app/app/learning/`).
- [ ] List the routes:
  - `/app/learning` — path overview (topic list with status + dependency lock state).
  - `/app/learning/[topicId]` — topic flow (free sequence of blocks).
  - `/app/learning/[topicId]/[blockId]` — optional per-block deep-link anchor.
- [ ] Confirm no public routes (matches existing `/app/*` convention; no `middleware.ts` added).
- [ ] Review checkpoint.

## 2. Sidebar entry

- [ ] Wireframe the new nav item in `apps/web/src/app/ui/components/navigation.tsx`.
- [ ] Note icon source: the existing nav uses **MUI icons** via `@mui/icons-material` (`Dashboard`, `SwapHoriz`, `AccountBalanceWallet`, `Settings`, `MenuBook`), **not** Lucide. Pick an MUI icon that isn't already used — e.g. `School` or `AutoStories` (`MenuBook` is taken by Documentación).
- [ ] Decide the item's position in the list (after Cuentas / before Ajustes is the leading candidate; confirm at review).
- [ ] Decide the Spanish label (candidates: "Aprende", "Aprendizaje", "Lecciones").
- [ ] Review checkpoint.

## 3. Path overview screen

- [ ] Wireframe the header: path title + overall progress %.
- [ ] Wireframe the `TopicCard` component:
  - [ ] Topic title + short description.
  - [ ] Status badge: `not_started` / `in_progress` / `completed` / `locked-by-dependency`.
  - [ ] CTA button (label depends on status).
  - [ ] Locked state: card visible but disabled, with a hint of which prerequisite unblocks it.
- [ ] Wireframe the ordered list of `TopicCard`s (the recommended path order).
- [ ] Review checkpoint.

## 4. Topic flow screen

- [ ] Wireframe the vertical stack of content blocks (free sequence, no rigid sections).
- [ ] Wireframe each block type:
  - [ ] `concept` / `explanation` → prose card.
  - [ ] `tip` → highlighted callout (amber/emphasis color `#f6b23a`).
  - [ ] `warning` → red/orange callout (`#f97316`).
  - [ ] `example` → framed card with a label.
  - [ ] `reflection` → prompt card with a notes field. **Open question to record:** whether reflection notes are persisted (decision deferred to Phase 3/4; for now design as local-only).
  - [ ] `exercise` → placeholder interactive card (text-only for now; future home for quizzes/simulators).
  - [ ] `task` → task card container (delegates to Phase 5 task component; see section 5).
- [ ] Review checkpoint.

## 5. Task card component

- [ ] Wireframe the **achievement** task variant: title, description, status chip (`pending`/`done`), single CTA "Marcar como hecho" (manual) or "Verificar" (automatic). Once done, stays done.
- [ ] Wireframe the **follow-up** task variant: title, description, status chip that may flip `pending`↔`done` over time, last-evaluated hint, CTA "Revisar ahora" (re-runs rule) or manual "Marcar".
- [ ] Review checkpoint.

## 6. Progress indicators

- [ ] Wireframe the overall path progress bar (completed topics / total).
- [ ] Wireframe the per-topic progress indicator on each `TopicCard`.
- [ ] Record the open question: **block-level vs topic-level completion tracking.** Per `plan.md` Decisions, the recommendation is topic-level + task-level only (no per-block completion table). Confirm or adjust here so Phase 3 can finalize.
- [ ] Review checkpoint.

## 7. Empty / loading / error states

- [ ] Wireframe: no learning path assigned to the user.
- [ ] Wireframe: network error fetching the path/topics.
- [ ] Wireframe: empty topic (a topic with zero blocks — edge case).
- [ ] Review checkpoint.

## 8. Component tree

- [ ] Document the shadcn-based component breakdown (to be implemented in Phase 5):
  - [ ] `LearningPathOverview` → `TopicCard[]`
  - [ ] `TopicFlow` → `ContentBlockRenderer[]` (dispatches on `block.type`)
  - [ ] `ContentBlockRenderer` → one of `ConceptBlock`, `TipBlock`, `WarningBlock`, `ExampleBlock`, `ReflectionBlock`, `ExerciseBlock`, `TaskBlock`
  - [ ] `TaskBlock` → `AchievementTaskCard` | `FollowupTaskCard`
  - [ ] Shared primitives: `ProgressBadge`, `StatusChip`, `LockedOverlay`
- [ ] Map each block type to its component and note the shadcn primitives it builds on (Card, Badge, Button, Progress, etc.).
- [ ] Review checkpoint.

## Phase 1 closeout

- [ ] Full review of `phase-1-web-ui.md` against `plan.md` Phase 1 sub-steps — every sub-step covered.
- [ ] Confirm all open questions are recorded for Phase 3 (DB) / Phase 4 (engine) to resolve.
- [ ] Confirm **no production code was written** (design-only phase — no `pnpm run lint`/`check-types`/`build` gates apply yet).
- [ ] Once approved, proceed to Phase 2 (`phase_02_tasks.md`).
