# AGENTS.md

## Monorepo overview

- **pnpm** workspace (requires `pnpm@9.0.0`, Node `>=18`). Do not use npm or yarn.
- **Turborepo** v2 orchestrates tasks. Pipeline: `lint` depends on `^lint`, `check-types` on `^check-types`, `build` on `^build`, `test` on `^build`.
- Apps: `apps/mobile` (name: `rumbo`), `apps/web` (name: `web`).
- Packages: `packages/*`. Key ones — `@repo/supabase`, `@repo/shared`, `@repo/ui`, `@repo/app-constants`, `@repo/formatters`, `@repo/transactions-parser`, `@repo/retirement-plan-calculation`.

## Commands (run from repo root)

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Dev all | `pnpm run dev` |
| Build all | `pnpm run build` |
| Lint all | `pnpm run lint` |
| Typecheck all | `pnpm run check-types` |
| Format all | `pnpm run format` |
| Run a single package test | `pnpm --filter @repo/<name> test` (e.g. `pnpm --filter @repo/retirement-plan-calculation test`) |
| Run a single app dev | `pnpm run dev --filter=web` or `pnpm run start --filter=mobile` |
| Turbo gen (component scaffold) | `pnpm run generate:component --filter=@repo/ui` |

## Testing

- Only two packages have real tests: `retirement-plan-calculation` and `transactions-parser`. Both use **Vitest v4**.
- All other packages have `"test": "echo Error..."` placeholder. The apps (`mobile`, `web`) have zero tests.
- Turbo test tasks depend on `^build`, so run `pnpm run build` first or let Turbo handle it.

## ESLint

- Shared config at `packages/eslint-config`. Three presets: `@repo/eslint-config/base`, `next-js`, `react-internal`.
- **Mobile** (`apps/mobile`): uses legacy `.eslintrc.json` extending `standard` (JS Standard Style), not the shared repo config. Lint via `expo lint`.
- **Web** (`apps/web`): flat config `eslint.config.mjs` extending `next/core-web-vitals` and `next/typescript`.
- **Packages**: extend `@repo/eslint-config/react-internal` or `@repo/eslint-config/base`.
- The shared base config uses `eslint-plugin-only-warn` — ESLint errors are downgraded to warnings (repo convention to not block dev).

## Spec folder (`spec/`)

> For opencode agents reference only — not application code. Read these before starting work on a feature.

- `spec/constitution/` — project foundation docs:
  - `mission.md` — product purpose, target users, principles, non-goals.
  - `roadmap.md` — versioned roadmap (V0.1 → V1.0) + backlog. Convention: each new feature is scaffolded as `spec/features/NNN-name/` with `spec.md`, `plan.md`, `tasks.md` **before any code is touched**.
  - `tech-stack.md` — canonical tech stack, file map, commands, data models, conventions, visual style, and hard limits. May overlap with this file but is more detailed.
- `spec/features/NNN-name/` — per-feature specs:
  - `spec.md` — feature requirements.
  - `plan.md` — approach, implementation notes, decisions, risks.
  - `tasks.md` — checklist of work items.
  - Current feature in progress: `001-forgot-password` (reset password via Supabase Auth, cross web/mobile redirect).

When implementing a feature, check `spec/features/` for an existing spec; if absent, create one following the `NNN-name/` convention before writing code.

## Architecture notes

### Mobile (`apps/mobile`)
- **Expo SDK 53** with **Expo Router v5** (file-based routing under `app/`). Entry: `expo-router/entry`.
- **NativeWind v4** (Tailwind on React Native). Babel preset + Metro config + `nativewind-env.d.ts`.
- **i18n**: `i18next` + `react-i18next` via `expo-localization`. Locale files: `assets/locales/{en,es}.json`. Nested key style (VSCode `i18n-ally.keystyle: nested`). Init is a side-effect import in `app/index.js`.
- **Supabase client**: hardcoded URL + anon key in `lib/supabase/client.js`. Not from env vars.
- **Auth flow**: root `app/index.js` checks session on mount. On auth state change, listens for `/auth/callback` deep links. Redirects users to `/(tabs)/` if logged in + welcome seen, else to `/welcome`.
- **Tab layout** (`app/(tabs)/_layout.js`): 4 tabs (Dashboard, Transactions, Accounts, Configuration), each with nested `<Stack>` sub-routes.
- **EAS Build**: projectId `87bcce5e-f990-4991-917a-4e654dee403c`. Use `eas build` for production builds.
- Most files are `.js`/`.jsx`, not TypeScript. tsconfig just extends `expo/tsconfig.base`.

### Web (`apps/web`)
- **Next.js 16** App Router with Turbopack (`--turbopack` flag on dev and build).
- **Tailwind CSS v4** with `@tailwindcss/postcss` PostCSS plugin (not the legacy CLI).
- **shadcn/ui** (New York style, neutral base, lucide icons). Configured in `components.json`. Also pulls in MUI for icons/material components and Radix UI primitives.
- **Two layout trees**: public (`/`, `/login`, `/privacy`, `/docs`) vs authenticated (`/app/*`). The `/app/*` layout has a sidebar and wraps children in `ToolsProvider > TransactionsProvider > AccountsProvider`.
- **No auth middleware** — no `middleware.ts` exists.
- **i18n**: `i18next` is used only for date locale in `TransactionsContext`. No full i18n setup.
- Data layer from `@repo/supabase` package. Three React Contexts hold global state: `AccountsContext`, `TransactionsContext`, `ToolsContext`.

### Packages
- Most packages define `build: tsc -p tsconfig.json`, outputting to `dist/`. Exceptions: `@repo/ui` and `@repo/supabase` export raw source files directly.
- `@repo/shared` mixes `.js` and `.ts` source files. Builds to `dist/`; consumers import compiled output.
- `@repo/app-constants` has a standalone tsconfig (does not extend `@repo/typescript-config`).
