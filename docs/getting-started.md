# Getting Started

Everything you need to set up the project and run the **web** and **mobile** apps
locally. This is a pnpm + Turborepo monorepo — see
[Monorepo & Turborepo](./monorepo-and-turbo.md) for the architecture background.

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | `>= 18` | Use a version manager (nvm/fnm/volta) to switch versions. |
| **pnpm** | `9.0.0` (exact) | Pinned via `packageManager` in the root `package.json`. |
| **Git** | any recent | Required for cloning and Turbo's content hashing. |

### Mobile-only extras

- **Expo Go** app on a physical device (iOS/Android), **or** a simulator/emulator:
  - iOS Simulator (requires macOS + Xcode).
  - Android Studio / Android emulator.
- For production/device builds: the **EAS CLI** (`npm i -g eas-cli`) and an Expo
  account.

### Install pnpm

If you don't have pnpm 9.0.0:

```bash
# via corepack (recommended, ships with Node)
corepack enable
corepack prepare pnpm@9.0.0 --activate

# or globally
npm install -g pnpm@9.0.0
```

> The exact version is enforced by `packageManager` in `package.json`. Corepack
> will use it automatically.

---

## 2. Clone & install

```bash
git clone <repo-url> rumbo-app
cd rumbo-app
pnpm install
```

`pnpm install` installs dependencies for **every** app and package in the
workspace (defined in `pnpm-workspace.yaml`: `apps/*` and `packages/*`).

> `.npmrc` sets `node-linker=hoisted`, so dependencies are hoisted to the root
> `node_modules/` (needed for Expo/NativeWind compatibility).

### Environment variables

**You do not need any `.env` files for local development.** The Supabase URL and
anon key are hardcoded in:

- `apps/mobile/lib/supabase/client.js` (mobile)
- `packages/supabase/src/client.ts` (web, via the `@repo/supabase` package)

If you ever need real env vars (e.g. for a different Supabase project), the
`.gitignore` already excludes `.env*`, so create local files safely.

---

## 3. Project layout (quick view)

```
rumbo-app/
├── apps/
│   ├── mobile/   # Expo / React Native app  (package name: "rumbo")
│   └── web/      # Next.js 16 app            (package name: "web")
├── packages/     # shared libraries (@repo/*)
├── turbo.json    # Turborepo task pipeline
├── pnpm-workspace.yaml
└── package.json  # root scripts (turbo run ...)
```

Full breakdown in [Monorepo & Turborepo](./monorepo-and-turbo.md).

---

## 4. Running the web app (`apps/web`)

**Stack:** Next.js 16 (App Router + Turbopack), Tailwind CSS v4, shadcn/ui,
MUI, Radix UI. Data layer comes from the `@repo/supabase` package.

```bash
# Start the dev server (Turbopack) → http://localhost:3000
pnpm --filter web dev
```

Other useful commands:

```bash
pnpm --filter web build     # production build (next build --turbopack)
pnpm --filter web lint      # ESLint (flat config: eslint.config.mjs)
```

### Route structure

- **Public routes:** `/`, `/login`, `/privacy`, `/docs`
- **Authenticated routes:** everything under `/app/*` (`/app/home`,
  `/app/transactions`, `/app/accounts`, `/app/tools`, `/app/settings`).
  The `/app/*` layout renders a sidebar and wraps children in
  `ToolsProvider > TransactionsProvider > AccountsProvider`
  (`apps/web/src/app/app/layout.tsx`).

> There is **no auth middleware** (`middleware.ts` doesn't exist). Route
> protection is handled client-side via the Supabase session + contexts.

---

## 5. Running the mobile app (`apps/mobile`)

**Stack:** Expo SDK 53, Expo Router v5 (file-based routing in `app/`),
NativeWind v4 (Tailwind for React Native), i18next + react-i18next, Supabase.
Most source files are `.js`/`.jsx` (not TypeScript).

```bash
# Start the Expo dev server (opens the Metro bundler)
pnpm --filter rumbo start
```

The Expo dev server is interactive. After it starts, press:

| Key | Action |
|-----|--------|
| `a` | Open in Android emulator |
| `i` | Open in iOS simulator |
| `w` | Open in web browser |
| `j` | Open devtools |
| `r` | Reload app |
| `q` | Quit |

You can also jump straight to a platform:

```bash
pnpm --filter rumbo android    # expo start --android
pnpm --filter rumbo ios        # expo start --ios
pnpm --filter rumbo web        # expo start --web
```

Lint the mobile app (uses JS Standard Style via a legacy `.eslintrc.json`, **not**
the shared repo config):

```bash
pnpm --filter rumbo lint
```

### Route structure

`app/index.js` is the entry point: it checks the Supabase session on mount and
redirects to `/(app)/` (logged in + welcome seen) or `/welcome`.

- Public screens: `welcome`, `signUp`, `forgotPassword`, `checkEmail`,
  `updatePassword`.
- Authenticated group `app/(app)/`:
  - `dashboard/` — budgets & saving goals
  - `transactions/` — list, add, edit, details
  - `accounts/` — list, new, edit
  - `settings/` — config + bug report

### Scanning QR / opening on a physical device

1. Run `pnpm --filter rumbo start`.
2. Install **Expo Go** on your phone.
3. Scan the QR code shown in the terminal (same Wi-Fi network as your machine).

---

## 6. Running everything at once

From the repo root, Turbo can run a task across the whole workspace:

```bash
pnpm run dev      # = turbo run dev  → starts every package/app with a "dev" script
pnpm run build    # = turbo run build
pnpm run lint     # = turbo run lint
pnpm run check-types
```

> Note: `pnpm run dev` starts the **web** app (and any package with a `dev`
> script, e.g. watch-mode type builds). The **mobile** app has no `dev` script
> — start it separately with `pnpm --filter rumbo start`.

---

## 7. Tests

Only two packages have real test suites, both with **Vitest v4**:

```bash
pnpm --filter @repo/retirement-plan-calculation test
pnpm --filter @repo/transactions-parser test
```

All other packages have a placeholder `test` script. The `web` and `mobile`
apps currently have **no tests**. Turbo's `test` task depends on `^build`, so
either run `pnpm run build` first or let Turbo handle the ordering.

---

## 8. Formatting & code style

```bash
pnpm run format     # Prettier across the repo
```

ESLint config summary (full details in [Monorepo & Turborepo](./monorepo-and-turbo.md)):

- Shared config in `packages/eslint-config` (presets: `base`, `next-js`,
  `react-internal`).
- The shared base uses `eslint-plugin-only-warn`, so errors are downgraded to
  **warnings** — lint won't block you by design.
- **Web** extends `next/core-web-vitals` + `next/typescript`.
- **Mobile** uses JS Standard Style (`standard`), linted via `expo lint`.

---

## 9. Recommended VS Code setup

The repo ships `.vscode/settings.json` with:

- `eslint.workingDirectories: [{ "mode": "auto" }]` — so ESLint finds each
  workspace's config.
- `i18n-ally` configured for the mobile locale files
  (`apps/mobile/assets/locales`), nested key style.

Recommended extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **i18n Ally** (`lokalise.i18n-ally`) — for editing `en`/`es` locale JSON.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — used by both web
  (Tailwind v4) and mobile (NativeWind v4).

---

## 10. Common pitfalls

- **"Missing script start"** — you ran `pnpm run start` at the repo root. The
  root has no `start` script. Use `pnpm --filter rumbo start` for the mobile app.
- **Used `npm` / `yarn`** — don't. The workspace relies on pnpm's `workspace:`
  protocol and the lockfile. Run `pnpm install` to recover.
- **Mobile app won't pick up a shared package change** — most `@repo/*` packages
  build to `dist/`. Run `pnpm run build` (or `pnpm --filter <pkg> build`) so the
  compiled output is current. (`@repo/ui` and `@repo/supabase` are exceptions:
  they export raw source.)
- **Wrong pnpm version** — make sure it's `9.0.0`. `corepack enable` handles
  this automatically from `packageManager`.
