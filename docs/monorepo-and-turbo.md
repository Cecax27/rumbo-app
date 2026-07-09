# Monorepo & Turborepo

A refresher on how this repository is organized and how Turbo runs tasks across
it. If you've been away from the project for a while, read this top to bottom.

---

## 1. Why a monorepo?

A **monorepo** keeps multiple apps and shared libraries in one Git repository.
For Rumbo this means the **mobile app** (Expo) and the **web app** (Next.js) can
share code — Supabase data access, formatters, constants, finance calculations —
without publishing packages to a registry or copy-pasting files.

Benefits we use day to day:

- **Shared logic lives once.** E.g. `@repo/retirement-plan-calculation` is
  consumed by the web app; fix a bug there and both apps pick it up.
- **One install, one lockfile.** `pnpm install` at the root wires everything up.
- **Unified tooling.** One command (`pnpm run lint`, `pnpm run build`) covers
  the whole workspace, and TypeScript/ESLint configs are shared via
  `@repo/typescript-config` and `@repo/eslint-config`.

---

## 2. The package manager: pnpm

We use **pnpm 9.0.0** (pinned by `packageManager` in `package.json`). Do **not**
use `npm` or `yarn` — the workspace depends on pnpm's `workspace:` protocol and
the `pnpm-lock.yaml` at the root.

### Workspaces

`pnpm-workspace.yaml` declares where packages live:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

So every folder under `apps/` and `packages/` is its own package with its own
`package.json`. The root `package.json` (name `rumbo`, `private: true`) just
defines the Turbo scripts and dev dependencies.

### The `workspace:` protocol

When one package depends on another in the same workspace, the version is
written as `workspace:*` (or `workspace:`) instead of a semver number:

```jsonc
// apps/web/package.json
"@repo/supabase": "workspace:*",
"@repo/shared":   "workspace:*"
```

pnpm resolves this to the local package on disk — there's no published download.
If you change a shared package, the consuming app sees it directly (after a
build, if the package outputs to `dist/`).

### Important filter gotcha

The **mobile** app's package name is `rumbo` (same as the root's name), and the
**web** app's name is `web`. There is **no** package named `mobile`, so
`--filter=mobile` matches nothing. Use:

```bash
pnpm --filter rumbo <script>   # mobile app
pnpm --filter web   <script>   # web app
# or the unambiguous path form:
pnpm --filter ./apps/mobile <script>
```

---

## 3. Directory map

```
rumbo-app/
├── apps/
│   ├── mobile/   → package "rumbo"   (Expo SDK 53, Expo Router v5, NativeWind v4)
│   └── web/      → package "web"     (Next.js 16, Tailwind v4, shadcn/ui)
│
├── packages/
│   ├── supabase/                      → @repo/supabase
│   ├── shared/                        → @repo/shared
│   ├── ui/                            → @repo/ui
│   ├── app-constants/                 → @repo/app-constants
│   ├── formatters/                    → @repo/formatters
│   ├── transactions-parser/           → @repo/transactions-parser  (has tests)
│   ├── retirement-plan-calculation/   → @repo/retirement-plan-calculation (has tests)
│   ├── eslint-config/                 → @repo/eslint-config         (shared lint presets)
│   └── typescript-config/             → @repo/typescript-config     (shared tsconfigs)
│
├── turbo.json          # Turborepo task pipeline + cache config
├── pnpm-workspace.yaml # workspace globs
├── .npmrc              # node-linker=hoisted
└── package.json        # root scripts: dev/build/lint/check-types/format → turbo run ...
```

### What each shared package does

| Package | Purpose |
|---------|---------|
| `@repo/supabase` | Supabase client + data-access modules (accounts, auth, transactions, reports, savingGoals, retirementPlans, tools). Exports **raw `src/*.ts`** (no build step needed by consumers). |
| `@repo/shared` | Mixed `.js`/`.ts` utilities shared across apps. Builds to `dist/`. |
| `@repo/ui` | Shared React component library. Exports raw source (no `dist/`). |
| `@repo/app-constants` | App-wide constants. Standalone tsconfig (doesn't extend `@repo/typescript-config`). |
| `@repo/formatters` | Formatting helpers (currency, dates, etc.). |
| `@repo/transactions-parser` | Parses transaction data. **Tested with Vitest.** |
| `@repo/retirement-plan-calculation` | Retirement plan math. **Tested with Vitest.** |
| `@repo/eslint-config` | Shared ESLint presets: `base`, `next-js`, `react-internal`. |
| `@repo/typescript-config` | Shared `tsconfig.json` bases extended by TS packages. |

### Build outputs — the key rule

Most packages compile with `tsc` and output to `dist/`. Consumers import the
**compiled** output, so after editing one of these you must rebuild it (or run
`pnpm run build`) before an app sees the change.

**Two exceptions export raw source directly** (no `dist/`, no rebuild needed):

- `@repo/ui` — `"exports"` points at source files.
- `@repo/supabase` — `"exports": { "./*": "./src/*.ts" }`.

---

## 4. Turborepo

[Turborepo](https://turbo.build/repo) (v2.6.0) is the task runner that sits on
top of pnpm. It does three valuable things:

1. **Runs tasks across the whole workspace** with one command.
2. **Tracks dependencies between tasks** so they run in the right order.
3. **Caches task output** so unchanged work is skipped on subsequent runs.

### Where it's configured: `turbo.json`

```jsonc
{
  "tasks": {
    "build":        { "dependsOn": ["^build"], "inputs": ["$TURBO_DEFAULT$", ".env*"], "outputs": [".next/**", "!.next/cache/**", "dist/**", "lib/**", "build/**"] },
    "lint":         { "dependsOn": ["^lint"] },
    "check-types":  { "dependsOn": ["^check-types"] },
    "dev":          { "cache": false, "persistent": true },
    "test":         { "dependsOn": ["^build"], "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts"], "outputs": [] },
    "test:watch":   { "dependsOn": ["^build"], "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts"], "outputs": [] }
  }
}
```

### The `^` (caret) notation — dependency ordering

A `dependsOn` entry starting with `^` means **"the same task in the packages
this one depends on."** For example, `build` depends on `^build`:

- `web` depends on `@repo/supabase`, `@repo/shared`, etc.
- So `turbo run build` builds those packages **first**, then builds `web`.
- This is why a shared package's `dist/` is ready before the app compiles.

Without the caret (`dependsOn: ["build"]`) it would mean "run `build` in *this*
package first" — not what we want here.

### Caching: `inputs` and `outputs`

Turbo caches a task's result and reuses it when nothing relevant changed.

- **`inputs`** — the files hashed to decide if a task is stale. `build` adds
  `.env*` to the default file set; `test` restricts it to source + test files.
- **`outputs`** — the folders cached/restored. `build` caches `.next/`, `dist/`,
  `lib/`, `build/`. `test` has `outputs: []` (only the pass/fail matters).
- **`dev`** sets `cache: false` and `persistent: true` — it's a long-running
  process, never cached, never exits on its own.

Cache lives in `.turbo/` (gitignored) and optionally in a remote cache
(`pnpm run build:remote` uses `--remote-cache`). If something looks stale,
delete `.turbo/` or pass `--force` to bust the cache:

```bash
pnpm run build --force   # ignore cache, rebuild everything
```

---

## 5. Running tasks with Turbo

The root `package.json` maps short scripts to `turbo run <task>`:

```jsonc
{
  "dev":         "turbo run dev",
  "build":       "turbo run build",
  "lint":        "turbo run lint",
  "check-types": "turbo run check-types"
}
```

### Run a task everywhere

```bash
pnpm run build        # build all apps + packages (in dependency order)
pnpm run lint
pnpm run check-types
```

### Run a task for one app/package (`--filter`)

`--filter` is Turbo's most useful flag. It accepts a package name, a path, or
selection expressions:

```bash
# Build just the web app (and the shared packages it needs, thanks to ^build)
pnpm run build --filter=web

# Lint only the mobile app
pnpm run lint --filter=rumbo

# Test one package
pnpm --filter @repo/retirement-plan-calculation test

# Run a script directly in a package (bypasses turbo, no caching)
pnpm --filter web dev
pnpm --filter rumbo start
```

> **`pnpm --filter <pkg> <script>`** runs the package's own npm script directly
> (no Turbo involvement). **`pnpm run <task> --filter=<pkg>`** runs the root
> script (`turbo run <task>`) and passes the filter to Turbo (so you get
> caching + dependency ordering). Both are valid; pick based on whether you want
> Turbo's smarts.

### Useful filter expressions

```bash
pnpm run build --filter=web...           # web + everything it depends on
pnpm run build --filter=...@repo/shared  # shared + everything that depends on it
pnpm run lint  --filter=./apps/web       # by path
```

---

## 6. ESLint across the workspace

Shared presets live in `packages/eslint-config`:

| Preset | Used by |
|--------|---------|
| `@repo/eslint-config/base` | Pure-TS packages without React |
| `@repo/eslint-config/react-internal` | Packages with React internals |
| `@repo/eslint-config/next-js` | (available) Next.js packages |

App-specific setups:

- **Web** — flat config `apps/web/eslint.config.mjs`, extends
  `next/core-web-vitals` + `next/typescript`. Lint with `pnpm --filter web lint`.
- **Mobile** — legacy `.eslintrc.json` extending JS **Standard** style
  (`standard`). It does **not** use the shared repo config. Lint with
  `pnpm --filter rumbo lint` (runs `expo lint`).

> The shared base config uses `eslint-plugin-only-warn`, so ESLint **errors are
> downgraded to warnings**. Lint won't block development by design — but fix
> them when you can.

---

## 7. Tests

| Package | Runner | Command |
|---------|--------|---------|
| `@repo/retirement-plan-calculation` | Vitest v4 | `pnpm --filter @repo/retirement-plan-calculation test` |
| `@repo/transactions-parser` | Vitest v4 | `pnpm --filter @repo/transactions-parser test` |
| All other packages | — | placeholder `test` script (no real tests) |
| `apps/web`, `apps/mobile` | — | no tests |

Turbo's `test` task `dependsOn: ["^build"]`, so shared packages are built before
tests run. Run `pnpm run build` first if you're not going through Turbo.

---

## 8. The two apps at a glance

### Web (`apps/web`, package `web`)

- **Next.js 16**, App Router, **Turbopack** for dev + build.
- **Tailwind CSS v4** via `@tailwindcss/postcss` (not the legacy CLI).
- **shadcn/ui** (New York style, neutral, lucide icons) + MUI + Radix primitives.
- **Two layout trees:** public (`/`, `/login`, `/privacy`, `/docs`) vs
  authenticated (`/app/*`). The `/app/*` layout has a sidebar and wraps children
  in `ToolsProvider > TransactionsProvider > AccountsProvider`.
- **No auth middleware** — protection is client-side via Supabase session.
- Global state lives in three React Contexts: `AccountsContext`,
  `TransactionsContext`, `ToolsContext` (in `apps/web/src/contexts/`).
- Data layer: `@repo/supabase` package.

### Mobile (`apps/mobile`, package `rumbo`)

- **Expo SDK 53** + **Expo Router v5** (file-based routing under `app/`). Entry:
  `expo-router/entry`.
- **NativeWind v4** (Tailwind for React Native) — Babel preset + Metro config.
- **i18n:** `i18next` + `react-i18next` via `expo-localization`. Locale files in
  `assets/locales/{en,es}.json`. Initialized as a side-effect import in
  `app/index.js`.
- **Supabase client:** hardcoded in `lib/supabase/client.js` (not env vars).
- **Auth flow:** `app/index.js` checks the session on mount; on auth state
  change it listens for `/auth/callback` deep links and redirects to `/(app)/`
  (logged in + welcome seen) or `/welcome`.
- **Route group `app/(app)/`:** `dashboard`, `transactions`, `accounts`,
  `settings` — each with nested `<Stack>` sub-routes.
- **EAS Build:** projectId `87bcce5e-f990-4991-917a-4e654dee403c` (in
  `app.json`). Use `eas build` for production builds.
- Mostly **`.js`/`.jsx`**, not TypeScript. The tsconfig just extends
  `expo/tsconfig.base`.

---

## 9. "I'm back after a long time" — quick refresh

1. **Update tooling:** ensure Node `>= 18` and `pnpm@9.0.0`
   (`corepack enable` handles the pnpm pin).
2. **Fresh install:** `pnpm install` (resyncs the whole workspace).
3. **Build once:** `pnpm run build` regenerates every `dist/` so apps see
   current shared code. (Skip if you only touch an app.)
4. **Start coding:**
   - Web: `pnpm --filter web dev` → http://localhost:3000
   - Mobile: `pnpm --filter rumbo start`
5. **Verify nothing broke:** `pnpm run lint && pnpm run check-types`, then
   `pnpm --filter @repo/retirement-plan-calculation test` and
   `pnpm --filter @repo/transactions-parser test`.
6. **Remember the gotchas:**
   - No package named `mobile` → filter with `rumbo`.
   - `@repo/ui` & `@repo/supabase` ship source; other `@repo/*` need a rebuild
     to update `dist/`.
   - `pnpm run dev` won't start the mobile app (it has no `dev` script).
   - ESLint errors are warnings here — don't expect lint to block you.
   - Supabase keys are hardcoded, so no `.env` setup is required to run locally.

---

## 10. Adding / changing packages (cheat sheet)

- **Add a dependency to one workspace:** `pnpm --filter web add <pkg>`
  (or `-D` for dev). This edits only that package's `package.json`.
- **Add a dependency to all workspaces:** `pnpm -r add <pkg>`.
- **Add a new shared package:** create `packages/<name>/` with a `package.json`
  named `@repo/<name>`, add `build`/`lint`/`check-types` scripts, then
  `pnpm install` so pnpm links it. Consume it with `"@repo/<name>": "workspace:*"`.
- **Scaffold a UI component:** `pnpm run generate:component --filter=@repo/ui`.
- **After editing a `dist/`-based package:** `pnpm --filter @repo/<name> build`
  (or just `pnpm run build`) so consumers see the change.
