# 003 - Phase 1: Web UI

> **Scope:** build the learning UI shell on web — routes, components, styling — backed by hardcoded mock data. No Supabase calls, no real task validation, no database reads/writes. At the end, `pnpm run dev --filter=web` shows the learning screens fully styled and navigable.
>
> Each task is a separate commit on `feat/learning-section-phase-1`. The user reviews each commit before continuing.

## Spec & docs

- [ ] Fill `spec/features/003-learning-section/plan.md` (Phase 1 updated to production code, not design-only).
- [ ] Fill `spec/features/003-learning-section/phase_01_tasks.md` (this file).

## 1. Sidebar entry

- [ ] Add an "Aprende" nav item to `apps/web/src/app/ui/components/navigation.tsx`.
- [ ] Pick an MUI icon not already used: candidates `School` or `AutoStories` (`MenuBook` is taken by Documentación).
- [ ] Position: after "Cuentas", before "Ajustes".
- [ ] Link to `/app/learning`.
- [ ] Use the existing `Item` component pattern (same styles, `figtree` font, active highlighting).

## 2. Mock data

- [ ] Create `apps/web/src/app/app/learning/mock-data.ts`.
- [ ] Define TS interfaces inline: `Topic`, `ContentBlock`, `TaskDefinition`, `UserProgress` (subset of the future `@repo/learning` types — just enough for the UI).
- [ ] Export a `MOCK_PATH` object with:
  - `title`: "Tu camino financiero"
  - 2 topics: "Presupuesto" (unlocked) and "Fondo de emergencia" (locked, depends on "Presupuesto").
  - Each topic has 5–8 blocks covering all types: concept, tip, warning, example, reflection, exercise, task.
  - "Presupuesto" includes 1 achievement task ("Crear tu primer presupuesto") and 1 follow-up task ("Registrar ingresos este mes").
- [ ] Export `MOCK_PROGRESS` object with hardcoded statuses (Presupuesto = in_progress, some tasks pending, some completed).
- [ ] No Supabase imports. Pure TS objects.

## 3. Filesystem routes

- [ ] Create `apps/web/src/app/app/learning/page.tsx` — server component skeleton. Import and render `<LearningPathOverview mockData={MOCK_PATH} progress={MOCK_PROGRESS} />`.
- [ ] Create `apps/web/src/app/app/learning/[topicId]/page.tsx` — server component. Read `topicId` from params, find the topic in `MOCK_PATH`, render `<TopicFlow topic={topic} progress={MOCK_PROGRESS} />`. If topic not found, render the "topic not found" error state component.
- [ ] `[blockId]` deep-link route is deferred (skip for now; file not created).
- [ ] Verify the routes are reachable from the sidebar (Task 1) and build correctly.

## 4. Path overview screen

- [ ] Create client component `apps/web/src/components/learning/LearningPathOverview.tsx`.
- [ ] Props: `{ path: {...}, progress: {...} }`.
- [ ] Renders: header with path title + overall progress bar (completed topics / total).
- [ ] Renders an ordered list of `TopicCard` components (inline or imported).
- [ ] Each `TopicCard` shows: title, description, status badge, CTA link to `/app/learning/[topicId]`.
- [ ] Locked topics: visible but disabled/opacity-reduced, with a hint like "Requiere: Presupuesto".
- [ ] Use shadcn primitives: `Card`, `Badge` (for status), `Progress` (for bar), `Button` (for CTA).
- [ ] Spanish copy hardcoded inline.

## 5. Topic flow screen

- [ ] Create client component `apps/web/src/components/learning/TopicFlow.tsx`.
- [ ] Props: `{ topic: Topic, progress: UserProgress }`.
- [ ] Renders: topic title header, then a vertical stack of `ContentBlock` components.
- [ ] Uses a `switch` on `block.type` to dispatch to the correct block component (see tasks 6–12).
- [ ] If a block of unknown type, render a fallback card with the block title and a "Tipo de bloque no soportado" message.
- [ ] Spanish copy hardcoded inline.

## 6. Block components — conceptual blocks

- [ ] Create `apps/web/src/components/learning/blocks/ConceptBlock.tsx` — prose card. Title (bold, `Quicksand` font), body (paragraphs, `Figtree`/`Inter`).
- [ ] Create `apps/web/src/components/learning/blocks/ExplanationBlock.tsx` — same as ConceptBlock (can share a base). Subtle left border accent (teal `#0fa3b1`).
- [ ] Both use shadcn `Card` with appropriate padding and typography.
- [ ] Spanish copy comes from `block.payload`.

## 7. Block components — callout blocks

- [ ] Create `apps/web/src/components/learning/blocks/TipBlock.tsx` — callout card with amber background (`#f6b23a` at low opacity), a lamp/lightbulb icon, and the tip text.
- [ ] Create `apps/web/src/components/learning/blocks/WarningBlock.tsx` — callout card with orange/red background (`#f97316` at low opacity), a warning icon, and the warning text.
- [ ] Both use shadcn `Card` with a left colored border and an icon from MUI (matching the nav pattern) or Lucide if simpler.
- [ ] Spanish copy comes from `block.payload`.

## 8. Block components — example & reflection

- [ ] Create `apps/web/src/components/learning/blocks/ExampleBlock.tsx` — framed card with an "Ejemplo" label at the top, body text below.
- [ ] Create `apps/web/src/components/learning/blocks/ReflectionBlock.tsx` — prompt card with a question, a `<textarea>` below for the user to write. Local state only (`useState`); no persistence. A "Guardar nota" button that just `console.log`-s the note (placeholder).
- [ ] Both use shadcn `Card`.

## 9. Block component — exercise

- [ ] Create `apps/web/src/components/learning/blocks/ExerciseBlock.tsx` — placeholder card. Title "Ejercicio", body text, a disabled area labeled "Interactividad próximamente" with a muted style. This is a future slot for quizzes/simulators.

## 10. Task block wrapper

- [ ] Create `apps/web/src/components/learning/blocks/TaskBlock.tsx`.
- [ ] Props: block + task definition + current progress for this task.
- [ ] If `taskKind === "achievement"` → render `AchievementTaskCard`.
- [ ] If `taskKind === "follow_up"` → render `FollowupTaskCard`.
- [ ] Otherwise → fallback card with "Tipo de tarea no soportado".

## 11. Achievement task card

- [ ] Create `apps/web/src/components/learning/cards/AchievementTaskCard.tsx`.
- [ ] Props: title, description, status (`pending` | `completed`), `onComplete` callback.
- [ ] Renders: title, description, status chip (green when done, amber when pending).
- [ ] If pending: a button "Marcar como hecho". Click calls `onComplete` (which, for now, flips local state in the mock — Phase 1 only).
- [ ] If completed: no button, a checkmark + "Completado" text.
- [ ] Once done, stays done (button disappears permanently while the component is mounted).

## 12. Follow-up task card

- [ ] Create `apps/web/src/components/learning/cards/FollowupTaskCard.tsx`.
- [ ] Props: title, description, status (`pending` | `completed`), `evaluatedAt` (nullable), `onEvaluate` callback.
- [ ] Renders: title, description, status chip (may flip), "Última revisión: <evaluatedAt>" hint.
- [ ] Button "Revisar ahora" — calls `onEvaluate` which simulates evaluation by toggling status locally (mock behavior).
- [ ] Status can flip pending ↔ done for visual preview (simulates follow-up re-evaluation).

## 13. Progress indicators

- [ ] Create `apps/web/src/components/learning/ProgressBadge.tsx` — small component showing "X/Y bloques completados" for a topic.
- [ ] On `LearningPathOverview`, add the overall path progress bar at the top (completed topics / total as a `Progress` bar + percentage).
- [ ] Both compute from `MOCK_PROGRESS`.

## 14. Empty / loading / error states

- [ ] Create `EmptyState` — reusable card with icon + message + optional CTA. Used when no path is assigned or mock data is empty.
- [ ] Create `ErrorState` — reusable card with error icon + message + retry button (just console.log for now). Used as a placeholder for network errors.
- [ ] Wire these states into `LearningPathOverview` and `TopicFlow` via conditions on the mock data (mock can include flags or the consumer can pass them).
- [ ] Include an edge case: topic with zero blocks renders "Este tema aún no tiene contenido."

## 15. Quality gates

- [ ] `pnpm run lint --filter=web` passes (no new warnings/errors introduced by the learning code).
- [ ] `pnpm run check-types --filter=web` passes.
- [ ] `pnpm run build --filter=web` passes (all `/app/learning/*` routes build without error).
- [ ] `pnpm run dev --filter=web` starts and the learning screens are navigable: click "Aprende" in sidebar → see path overview → click "Presupuesto" → see topic flow with all block types rendered.
