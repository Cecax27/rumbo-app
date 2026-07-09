# Tech stack and conventions

## Technologies

- **Languages:** TypeScript
- **Framework / runtime:** React Native (Expo SDK 53, Expo Router v5) for mobile; Next.js 16 (App Router, Turbopack) for web
- **Database:** Supabase (PostgreSQL)
- **External sources:** Supabase Auth (email/password + deep-link)
- **Tests:** Vitest v4 (only `@repo/retirement-plan-calculation` and `@repo/transactions-parser` have real tests; all other packages/apps use a placeholder script)
- **Deployments:** EAS Build (mobile); no CI/CD or web hosting configured yet

## Files

| Location | Purpose |
|----------|---------|
| `apps/mobile/app/` | Expo Router file-based routes (entry: `app/index.js`) |
| `apps/mobile/app/(app)/` | Authenticated tab layout (Dashboard, Transactions, Accounts, Configuration) |
| `apps/web/src/app/` | Next.js App Router pages: public (`/`, `/login`, `/privacy`, `/docs`) and authenticated (`/app/*`) |
| `apps/web/src/app/app/` | Authenticated layout with sidebar, wraps children in `ToolsProvider > TransactionsProvider > AccountsProvider` |
| `packages/supabase/src/` | Supabase client + per-domain modules (auth, accounts, transactions, reports, tools, retirementPlans, savingGoals) — exported as raw source |
| `packages/shared/src/` | Shared utilities, constants, and error codes — compiled to `dist/`; consumers import from `dist/` |
| `packages/ui/src/` | Shared React component library — exported as raw TSX source |
| `packages/app-constants/src/` | Application-wide constants |
| `packages/formatters/src/` | Shared formatting utilities |
| `packages/transactions-parser/src/` | Bank transaction import parsers (BBVA Excel, etc.) |
| `packages/retirement-plan-calculation/src/` | Retirement plan calculation engine |
| `packages/eslint-config/` | Shared ESLint configs: `base`, `react-internal`, `next-js` |
| `packages/typescript-config/` | Shared tsconfig presets |

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Dev (all) | `pnpm run dev` |
| Build (all) | `pnpm run build` |
| Lint (all) | `pnpm run lint` |
| Typecheck (all) | `pnpm run check-types` |
| Format (all) | `pnpm run format` |
| Test single package | `pnpm --filter @repo/<name> test` |
| Web dev | `pnpm run dev --filter=web` |
| Mobile dev | `pnpm run start --filter=mobile` |
| Mobile prod build | `eas build` |
| Generate UI component | `pnpm run generate:component --filter=@repo/ui` |

## Data models

Core entities (defined in `packages/supabase/src/`):

- **Account** — bank/cash/wallet account with type (checking/savings/credit/loan/investment), color, icon, bank name, balance, credit limit, interest rate
- **Transaction** — amount + date + description, linked to an account and optionally a category; types: spending, income, transfer, deferred
- **Category** — budget group + icon for classifying transactions
- **Saving Goal** — target amount with progress tracking
- **Retirement Plan** — long-term savings projection
- **Report** — aggregated analytics over transactions

All entities are user-scoped (`user_id` foreign key). Auth is handled via Supabase Auth (email/password).

## Conventions

- **Monorepo:** pnpm workspaces + Turborepo v2. `apps/*` and `packages/*`.
- **Node:** >=18. **Package manager:** pnpm@9.0.0 (enforced in root `package.json`).
- **Package exports:** Packages export either raw `.ts`/`.tsx` source (`@repo/supabase`, `@repo/ui`) or compiled `dist/` (`@repo/shared`). Consumers configure their build tooling accordingly.
- **ESLint:** errors are downgraded to warnings via `eslint-plugin-only-warn` (repo convention to not block dev). Mobile uses legacy `.eslintrc.json` with `standard` preset.
- **Auth flow (mobile):** `app/index.js` checks session on mount, listens for `/auth/callback` deep links, redirects to `/(tabs)/` or `/welcome`.
- **No auth middleware on web:** auth checks happen client-side inside context providers.
- **i18n:** `i18next` + `react-i18next` on mobile (locale files: `assets/locales/{en,es}.json`, nested-key style). Web uses `i18next` only for date locale.
- **Styling:** Tailwind CSS v4 (web via PostCSS plugin) and NativeWind v4 (mobile via Babel + Metro). shadcn/ui (New York style, neutral base, Lucide icons) on web.
- **State management:** React Contexts — `AccountsContext`, `TransactionsContext`, `ToolsContext` on web; similar pattern on mobile.
- **TypeScript everywhere** except mobile app files which are mostly `.js`/`.jsx`.

## Visual style

- **Fonts:** Quicksand (headings), Inter (body) — loaded via `@expo-google-fonts/inter` (mobile) and CSS import (web)
- **Brand colors:**
  - Primary: `#0d2e4f` (dark navy)
  - Secondary: `#0fa3b1` (teal)
  - Success: `#22c58e` (green)
  - Emphasis: `#f6b23a` (amber)
  - Warning: `#f97316` (orange)
  - Light/Background: `#f7f3e8` / `rgb(237, 237, 237)`
- **Dark mode:** `class` strategy, follows device `colorScheme` preference (both apps)
- **Icons:** Lucide React (web), react-native-vector-icons (mobile)

## Hard limits

- No secrets in source code (Supabase URL + anon key are currently hardcoded in `packages/supabase/src/client.ts` — should be moved to environment variables)
- Mobile builds must go through EAS (`eas build`); no direct `expo publish`
- Turborepo task dependencies: `build` depends on `^build`, `lint` on `^lint`, `check-types` on `^check-types`, `test` on `^build`
- All TypeScript strict mode (via shared `@repo/typescript-config`)
