# Learning Section — Topic Authoring Guide

> How to create and publish topics for Rumbo's learning section. This document is
> the source of truth for content contributors; it is intended to be published to
> the GitHub wiki. No code changes are required to add, edit, or remove topics —
> content lives in the database and is fetched and cached by the apps.

---

## 1. Data model at a glance

Learning content is a **level → topic** hierarchy:

- **`learning_levels`** — a curriculum stage (e.g. "Conciencia financiera"). Has `slug`, `title`, `description`, `order`, `published`.
- **`learning_topics`** — a unit of learning inside a level. Has `slug`, `title`, `description`, `order`, `blocks` (a JSON array of typed blocks), `is_sample`, `published`.

Only **published** levels/topics are served. A level only appears in the app if it has at least one published topic.

Topics are written as a JSON array of **blocks**. Each block is `{ "id", "type", "payload" }`.

---

## 2. Block vocabulary

Every block has a stable `type`. Renderers on web and mobile both implement this
vocabulary; unknown types render a graceful fallback (so new blocks never break
old clients).

| `type` | Purpose | `payload` fields |
|---|---|---|
| `heading` | Section title hierarchy | `level` (`2` \| `3`), `text` |
| `concept` | A core idea | `title`, `body` |
| `explanation` | A longer clarification | `title`, `body` |
| `tip` | A practical hint | `title`, `body` |
| `warning` | A caution / common mistake | `title`, `body` |
| `example` | A worked example | `title`, `body` |
| `reflection` | A prompt for the reader | `title`, `prompt` |
| `exercise` | A practice exercise (read-only for now) | `title`, `body` |
| `quote` | A pull quote | `text`, `author?` |
| `table` | A data table | `headers` (`string[]`), `rows` (`string[][]`) |
| `infographic` | Downloadable/shareable image | `title?`, `imagePath`, `altText` |
| `illustration` | View-only image | `imagePath`, `altText`, `caption?` |
| `tutorial` | Step-by-step app walkthrough | `title`, `steps` |
| `habit` | A habit the user must practice | `title`, `description`, `habitSlug`, `ruleKey`, `ruleParams?` |

### Inline formatting

Inside any text field (`body`, `text`, `prompt`, `description`, table cells), a
minimal markdown subset is supported:

- `**bold**`
- `_italic_`

No other markdown or HTML is interpreted — `<` and `>` render as literal text.

---

## 3. Assets: infographics vs illustrations

- **Infographics** are **downloadable and shareable**. Use the `infographic` block. Keep them reasonably sized; critical information must never live *only* inside an image (offline image display is best-effort).
- **Illustrations** are **view-only** (no download/share actions). Use the `illustration` block.
- Tutorial step screenshots are referenced inside the `tutorial` block's `steps`.

All assets live in the **`learning-assets`** Storage bucket (public) under the path
convention:

```
levels/<level_slug>/topics/<topic_slug>/<file>
```

`imagePath` is the full public URL, e.g.
`https://<project>.supabase.co/storage/v1/object/public/learning-assets/levels/awareness/topics/primer-presupuesto/ciclo.png`.

---

## 4. Tutorials

A `tutorial` block opens a separate step-by-step screen. Each step is
`{ "text", "imagePath?" }`:

```json
{
  "id": "tu1",
  "type": "tutorial",
  "payload": {
    "title": "Cómo registrar un gasto",
    "steps": [
      { "text": "Ve a Transacciones y toca el botón de agregar.", "imagePath": "https://…/paso1.png" },
      { "text": "Ingresa el monto y la descripción." },
      { "text": "Elige la cuenta y guarda." }
    ]
  }
}
```

---

## 5. Habits

A **habit** is the behavior the user must practice to finish a topic. Habits are
the only way a habit-bearing topic can be completed — there is **no manual
"mark as complete"** on those topics.

Habit blocks:

```json
{
  "id": "ha1",
  "type": "habit",
  "payload": {
    "title": "Registra tus primeros gastos",
    "description": "Registra al menos 3 transacciones en Rumbo.",
    "habitSlug": "record-3-transactions",
    "ruleKey": "record_n_transactions",
    "ruleParams": { "n": 3 }
  }
}
```

- **`habitSlug`** — a stable, unique identifier for this habit **within its topic**. **Never rename a published `habitSlug`** — user progress rows reference it. Renaming orphans progress.
- **`ruleKey`** — the completion rule, from the rule registry below.
- **`ruleParams`** — rule-specific parameters.

### Rule registry

| `ruleKey` | Description | `ruleParams` |
|---|---|---|
| `record_n_transactions` | Completes once the user has recorded `n` transactions (spendings + incomes + transfers) *after starting the habit*. Transactions recorded before the habit started do not count. | `{ "n": <positive integer> }` |

Habit lifecycle is enforced by the app: a user explicitly **starts** a habit, it
enters *tracking*, and completes automatically when the rule's condition is met.
Completion is **permanent** (immutable in the database) unless the user resets it.

> Rule authors: new rules are added in `packages/learning/src/rules/` and
> registered in `packages/learning/src/habits.ts`. Rules are pure functions over
> a data snapshot and must never throw or complete when their evidence is missing.

---

## 6. Completing a topic without a habit

A topic with **no** `habit` block renders a **"mark as complete"** button. Use
this for pure-reading topics. A topic may contain at most one habit conceptually;
if it has any habit block, the manual button is hidden and all its habits must be
completed before the topic is finished.

---

## 7. Publishing workflow

1. **Write the blocks** — assemble the topic's `blocks` JSON. Validate locally with the authoring templates below or by running the validators (`@repo/learning`).
2. **Upload assets** to `learning-assets/levels/<level_slug>/topics/<topic_slug>/`.
3. **Insert/update** the row in `learning_topics` (via the Supabase dashboard or SQL), setting `published = true`.
4. The `bump_learning_content_version` trigger increments `learning_meta.content_version` automatically on publish/update — no manual version bump needed.
5. **Verify** the app fetches the new content on next open (see pre-deployment checks 14.16).

Creating a level:

```sql
insert into public.learning_levels (slug, title, description, "order", published)
values ('awareness', 'Conciencia financiera', '…', 0, true)
on conflict (slug) do nothing;
```

Creating a topic (see `supabase/migrations/20260905000001_learning_seed.sql` for a
full worked example):

```sql
insert into public.learning_topics (level_id, slug, title, description, "order", blocks, is_sample, published)
select id, 'mi-tema', 'Mi tema', '…', 0, '<blocks json>'::jsonb, false, true
from public.learning_levels where slug = 'awareness'
on conflict (slug) do nothing;
```

### Removing / unpublishing

Set `published = false` (the version bump fires and clients stop seeing it). To
fully remove, delete the row (progress rows cascade).

---

## 8. Contracts to respect

- **Never rename a published `habitSlug`.** Progress references `(topic_id, habit_slug)`.
- **Never rename a published level or topic `slug`** — it is the stable identifier.
- **`block.id` values** must be unique within a topic (used as React keys) but are
  otherwise free-form; they do **not** participate in progress identity.
- **Unknown block types are tolerated** at render time but should be avoided.
- **`is_sample`** marks temporary verification content. Set it `true` for sample
  topics and unpublish them when real curriculum content lands.
- **No raw HTML** in text fields — only `**bold**` and `_italic_`.

---

## 9. Quick block templates

```json
{ "id": "h1", "type": "heading", "payload": { "level": 2, "text": "Título de sección" } }
{ "id": "c1", "type": "concept", "payload": { "title": "Concepto", "body": "**Negrita** y _cursiva_." } }
{ "id": "t1", "type": "tip", "payload": { "title": "Consejo", "body": "…" } }
{ "id": "w1", "type": "warning", "payload": { "title": "Cuidado", "body": "…" } }
{ "id": "q1", "type": "quote", "payload": { "text": "…", "author": "…" } }
{ "id": "tb1", "type": "table", "payload": { "headers": ["A", "B"], "rows": [["1", "2"]] } }
{ "id": "ig1", "type": "infographic", "payload": { "title": "…", "imagePath": "https://…", "altText": "…" } }
{ "id": "il1", "type": "illustration", "payload": { "imagePath": "https://…", "altText": "…", "caption": "…" } }
{ "id": "ha1", "type": "habit", "payload": { "title": "…", "description": "…", "habitSlug": "…", "ruleKey": "record_n_transactions", "ruleParams": { "n": 3 } } }
```
