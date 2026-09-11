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

## Workflow for a New Feature

1. Create `features/NNN-feature-name/` with the next available number (`001`, `002`, …).

2. Write `spec.md`: what it does, why, and measurable acceptance criteria.

3. Write `plan.md`: technical approach and decisions, respecting `constitution/tech-stack.md`.

4. Break down tasks into `tasks.md` and mark progress.

5. Implement and validate (build/tests/lint or as defined in the constitution).

6. Update `constitution/roadmap.md` (move the feature to "Done").

> The constitution takes precedence: if a feature conflicts with `mission.md` or `tech-stack.md`, the feature is redesigned, not the constitution.

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

## Commits

### Conventional commit messages

`<type>(<optional scope>): <description>
empty line as separator
<optional body>
empty line as separator
<optional footer>
`

### Types
- Changes relevant to the API or UI:
    - `feat` Commits that add, adjust or remove a feature to/of/from the API or UI
    - `fix` Commits that fix an API or UI bug of a preceded `feat` commit
- `refactor` Commits that rewrite or restructure code without altering API or UI behavior
    - `perf` Commits are special type of `refactor` commits that specifically improve performance
- `style` Commits that address code style (e.g., white-space, formatting, missing semi-colons) and do not affect application behavior
- `test` Commits that add missing tests or correct existing ones
- `docs` Commits that exclusively affect documentation
- `build` Commits that affect build-related components such as build tools, dependencies, project version, ...
- `ops` Commits that affect operational aspects like infrastructure (IaC), deployment scripts, CI/CD pipelines, backups, monitoring, or recovery procedures, ...
- `chore` Commits that represent tasks like initial commit, modifying `.gitignore`, ...

### Scopes
The `scope` provides additional contextual information.
* The scope is an **optional** part
* Allowed scopes vary and are typically defined by the specific project
* **Do not** use issue identifiers as scopes

### Breaking Changes Indicator
- A commit that introduce breaking changes **must** be indicated by an `!` before the `:` in the subject line e.g. `feat(api)!: remove status endpoint`
- Breaking changes **should** be described in the [commit footer section](#footer), if the [commit description](#description) isn't sufficiently informative

### Description
The `description` contains a concise description of the change. 
- The description is a **mandatory** part
- Use the imperative, present tense: "change" not "changed" nor "changes"
  - Think of `This commit will...` or `This commit should...`
- **Do not** capitalize the first letter
- **Do not** end the description with a period (`.`)
- In case of breaking changes also see [breaking changes indicator](#breaking-changes-indicator)

### Body
The `body` should include the motivation for the change and contrast this with previous behavior.
- The body is an **optional** part
- Use the imperative, present tense: "change" not "changed" nor "changes"

### Footer
The `footer` should contain issue references and informations about **Breaking Changes**
- The footer is an **optional** part, except if the commit introduce breaking changes
- *Optionally* reference issue identifiers (e.g., `Closes #123`, `Fixes JIRA-456`) 
- **Breaking Changes** **must** start with the word `BREAKING CHANGE:`
  - For a single line description just add a space after `BREAKING CHANGE:`
  - For a multi line description add two new lines after `BREAKING CHANGE:`

### Versioning
- **If** your next release contains commit with...
   - **Breaking Changes** incremented the **major version**
   - **API relevant changes** (`feat` or `fix`) incremented the **minor version**
- **Else** increment the **patch version**


### Examples
- ```
  feat: add email notifications on new direct messages
  ```
- ```
  feat(shopping cart): add the amazing button
  ```
- ```
  feat!: remove ticket list endpoint

  refers to JIRA-1337

  BREAKING CHANGE: ticket endpoints no longer supports list all entities.
  ```
- ```
  fix(shopping-cart): prevent order an empty shopping cart
  ```
- ```
  fix(api): fix wrong calculation of request body checksum
  ```
- ```
  fix: add missing parameter to service call

  The error occurred due to <reasons>.
  ```
- ```
  perf: decrease memory footprint for determine unique visitors by using HyperLogLog
  ```
- ```
  build: update dependencies
  ```
- ```
  build(release): bump version to 1.0.0
  ```
- ```
  refactor: implement fibonacci number calculation as recursion
  ```
- ```
  style: remove empty line
  ```