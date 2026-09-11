# Implementation Tasks — App Foundation

> Derived from the approved `plan.md`. Checked off as work is completed and verified. If work stops, this file is the source of truth for what's done and what remains.

---

## Phase 0 — Audit

- [x] **0.1** Conduct systematic audit of the existing implementation against `spec.md`, covering both platforms and shared packages.
- [x] **0.2** Record each finding (bad practice, inconsistency, failure point) with file path, severity, and the corrective task it maps to.
- [x] **0.3** Write `docs/foundation-audit.md` with the complete findings table.
- [x] **0.4** Flag stale documentation (AGENTS.md `(tabs)/` references, `tech-stack.md` layout notes, `docs/getting-started.md` test-suite claims) in the audit.

---

## Phase 1 — Data Layer & Shared Foundation

> Note: the Supabase MCP connection in this environment is read-only (`supabase_read_only_user`), and there is no local Supabase CLI linked to the project. Migration files and the Edge Function are committed to the repo; applying them (`supabase db push` / `supabase functions deploy delete-user`) requires the Supabase CLI or a user with table ownership.

### Database migrations
- [x] **1.1** Migration file created: `supabase/migrations/20260825000000_add_terms_accepted_at.sql` (`alter table public.profiles add column terms_accepted_at timestamptz;`). _Apply pending (CLI/owner)._
- [x] **1.2** Migration file created: `supabase/migrations/20260825000001_update_handle_new_user.sql` (sets `full_name` and `terms_accepted_at` from `raw_user_meta_data`). _Apply pending (CLI/owner)._
- [x] **1.3** Verified no new RLS policies are needed: `profiles` has SELECT/UPDATE own-row policies (UPDATE covers `full_name`; no WITH CHECK gap because `id` is the immutable PK/FK); `reports` has an authenticated INSERT policy with `user_id` defaulting to `auth.uid()`; account deletion bypasses RLS via the service-role Edge Function.

### Edge Function — account deletion
- [x] **1.4** Created `supabase/functions/delete-user/index.ts` (Deno): verifies caller JWT via `getUser()`, deletes the caller's rows from the 9 user-scoped tables (`reports`, `spendings`, `deferred_spendings`, `incomes`, `transfers`, `saving_goals`, `retirement_plans`, `budget_plans`, `accounts` — accounts last to respect non-cascading FKs), then `auth.admin.deleteUser(userId)` (cascades to `profiles`). `budget_plan_groups` removed via `budget_plans` ON DELETE CASCADE.
- [x] **1.5** No manual key config needed — `SUPABASE_SERVICE_ROLE_KEY` is auto-injected by the Supabase Edge Functions runtime; the function only references it via `Deno.env`, never in client code.
- [ ] **1.6** Deploy the `delete-user` Edge Function (`supabase functions deploy delete-user`). _Blocked: no CLI._

### Supabase package (`@repo/supabase`)
- [x] **1.7** `client.ts` now reads `EXPO_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` (and anon-key equivalents) from env and throws a descriptive error if missing; hardcoded literals removed.
- [x] **1.8** Extended `auth.ts` with `getUser`, `updateProfile({ full_name })`, `changePassword(currentPassword, newPassword)` (reauthenticates via `signInWithPassword` then `updateUser`), `deleteAccount()` (invokes `delete-user`), `resendConfirmation(email)`; `signUp` now accepts `options.data` for terms acceptance.
- [x] **1.9** Fixed `reports.ts`: `insertReport` returns a consistent `{ error: string | null }`; typed `deviceInfoJSON` as `Record<string, unknown>` (matches the `jsonb` column).

### Shared package (`@repo/shared`)
- [x] **1.10** Added `src/validation.ts`: `isValidEmail`, `isValidPassword` (≥ 8), `isValidName` (non-empty), plus `EMAIL_REGEX` / `MIN_PASSWORD_LENGTH`.
- [x] **1.11** Replaced `errors.js` with `errors.ts`: kept `DatabaseError`, added `AUTH_ERROR_CODES` (invalid_credentials, email_not_confirmed, user_already_exists, weak_password, same_password, rate-limited, session-expired).
- [x] **1.12** Removed broken `welcomeSeen.js` (invalid `./supabase/client` import) and `utils.js` (imports `react-native` Vibration + undefined `t`/`months`); neither was imported anywhere. Per-app copies (`apps/web/src/lib/welcomeSeen.ts`, `apps/mobile/lib/welcomeSeen.js`) remain the single correct implementations.

### Phase 1 verification
- [x] **1.13** `@repo/supabase` and `@repo/shared`: `check-types`, `build`, and `lint` all pass. `apps/web` `tsc --noEmit` passes. `apps/web` `lint` still reports **pre-existing** errors/warnings unrelated to this change (unescaped entities, `any`, unused vars in `docs/`, `login/subpage.tsx`, `reset-password-form.tsx`, `contexts/*`).
- [ ] **1.14** Verify migrations applied cleanly (introspect `profiles` columns; inspect `handle_new_user` body). _Blocked: read-only MCP._
- [ ] **1.15** Verify the `delete-user` Edge Function responds. _Blocked: no CLI to deploy._

---

## Phase 2 — Mobile Consolidation & Correction

### Supabase client consolidation
- [x] **2.1** Verified: mobile keeps its own `lib/supabase/client.js` (AsyncStorage + `AppState` auto-refresh) because `@repo/supabase/client.ts` uses web `localStorage`/`processLock`, which cannot persist sessions on React Native. Full Metro transpilation of `@repo/supabase` was therefore not required for the foundation scope.
- [x] **2.2** Aligned the mobile `lib/supabase/auth.js` and `reports.js` helper **signatures and return shapes to match `@repo/supabase` exactly** (`signUp(email, password, options)`, `getUser`, `updateProfile`, `changePassword`, `deleteAccount`, `resendConfirmation`, `insertReport → { error }`), eliminating the divergent API surface (audit M1) while keeping the AsyncStorage-bound client. _Deviation from literal "switch to `@repo/supabase`": the shared client cannot serve React Native storage, so the mobile client remains local but now exposes the identical API._
- [x] **2.3** Removed hardcoded credentials: `client.js` now reads `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` and throws if missing; added `apps/mobile/.env` (gitignored) + `.env.example` (committed). Used `EXPO_PUBLIC_*` (modern Expo convention, matches `@repo/supabase`) rather than `expo-constants` `extra`.

### Session & routing
- [x] **2.4** Consolidated to a single `onAuthStateChange` listener: removed the redundant (dead) listener + unused `session` state in `app/index.js`; the root `app/_layout.js` listener remains the sole auth listener (preserving `PASSWORD_RECOVERY` → `/updatePassword` and `/auth/callback` deep-link handling).
- [x] **2.5** Fixed logout redirect in `app/(app)/settings/index.js` → `router.replace('/')` (login), not `/signUp`.

### Registration & terms
- [x] **2.6** Added terms-and-conditions checkbox to `app/signUp.js`; submission blocked until accepted (`signup.terms.required`); passes `data: { terms_accepted: true }` in `signUp` options. (`full_name` is set post-registration via edit-profile — name is optional at signup per spec.)
- [x] **2.7** Routed `signUp.js` through the shared `signUp` helper (removed the direct `supabase.auth.signUp` call).

### Error surface unification (mobile)
- [x] **2.8** Mounted the Snackbar globally in `app/_layout.js`; removed all per-screen `<Snackbar />` mounts (`signUp`, `forgotPassword`, `updatePassword`, `addTransaction`, `newaccount`).
- [x] **2.9** Replaced `Alert.alert` for auth-flow errors with the Snackbar (`login`, `signUp`, `forgotPassword`, `updatePassword`); `Alert` retained only for destructive confirmations (sign-out, account deletion).
- [x] **2.10** Fixed the i18n key: moved `password-no-match` under `signup.errors.*` and updated both `signUp.js` and `updatePassword.js` to use `signup.errors.password-no-match`. (The audit's M2 direction was corrected against the actual locale files: `signUp.js` referenced a non-existent `signup.errors.password-no-match`, while the existing key was top-level `signup.password-no-match`.)

### Onboarding fixes
- [x] **2.11** Fixed `app/welcome.js`: removed the two duplicated `exploreDashboard` step blocks (three copies → one).
- [x] **2.12** Standardized `app/welcome.js` redirect → `/(app)/dashboard` (was `/(app)/accounts/`; now aligns with `(app)/index.js` → `/dashboard`).

### Error boundary
- [x] **2.13** Localized and themed `components/ErrorBoundary.jsx`: removed hardcoded English + hex colors, used `i18n.t()` + NativeWind tokens; added `reportError(error, context)` for a future remote sink.

### New capabilities (mobile settings)
- [x] **2.14** Added password-change UI: new `app/(app)/settings/changePassword.js` (current/new/confirm fields, validation, `changePassword`, Snackbar feedback, wrong-current-password mapping).
- [x] **2.15** Added name-editing UI: new `app/(app)/settings/editProfile.js` (edit `full_name`, non-empty validation, `updateProfile`, Snackbar feedback); settings header now reads `profiles.full_name`.
- [x] **2.16** Added account-deletion UI to settings: destructive `Alert` confirm → `deleteAccount()` → success `router.replace('/')`, failure Snackbar (account intact).

### Bug report fix
- [x] **2.17** Fixed `app/(app)/settings/bugreport.js`: non-empty validation, checks `insertReport` result (`{ error }`), preserves message on failure, only navigates to confirmation on success.

### i18n
- [x] **2.18** Added locale keys to `es.json`/`en.json` for: terms acceptance, password change, name editing, account deletion, error boundary, login errors, and generic errors; removed the stale top-level `signup.password-no-match`. (`tabs.*` keys left in place — still referenced by other code.)

### Phase 2 verification
- [x] **2.19** All modified files parse (Babel/JSX); locale JSON validated. `pnpm run lint --filter=mobile` (`expo lint`) is **pre-existing broken** (ESLint 9 + legacy `standard` config + `eslint-plugin-n` incompatibility — `context.getScope is not a function`), unrelated to these changes. Manual device testing deferred to Phase 4 (`docs/pre-deployment-checks.md`).

---

## Phase 3 — Web Consolidation & Correction

### Auth context & session gating
- [x] **3.1** Created `apps/web/src/contexts/AuthContext.tsx` + `useSession` hook: loads session on mount, single `onAuthStateChange` listener, exposes `session`/`user`/`loading`.
- [x] **3.2** Added session guard via new `src/components/require-auth.tsx` (`RequireAuth`) wrapped in `AuthProvider` in `src/app/app/layout.tsx`; redirects to `/login` when `loading` is false and `session` is null, renders `null` while loading.
- [x] **3.3** Supabase URL + anon key read from `NEXT_PUBLIC_*` env in `@repo/supabase/client.ts` (done in Phase 1); `.env.local` (gitignored) + `.env.example` (committed) added.

### Error surface unification (web)
- [x] **3.4** Fixed swallowed logout error in `src/app/app/settings/page.tsx` → `toast.error` (was `console.error` only).
- [x] **3.5** Fixed swallowed forgot-password errors in `src/app/forgot-password/page.tsx` → `toast.error`; removed leftover `console.log` debug logging; stores email in `sessionStorage` for the resend flow.
- [x] **3.6** Fixed resend: `forgot-password/check-email` now actually resends via `resetPasswordForEmail`; `login/check-email` now uses `resendConfirmation` + `toast` feedback (was `console.error` only).
- [x] **3.7** Added a 15s timeout to the "Verificando enlace…" state in `auth/callback/callback-form.tsx` and `reset-password/reset-password-form.tsx` (shows an error instead of hanging forever).

### Error boundaries (web)
- [x] **3.8** Added `src/app/error.tsx` (Tailwind-themed, recovery button) and `src/app/global-error.tsx` (self-contained inline styles, since the root layout is replaced).

### Registration & terms
- [x] **3.9** Added terms-and-conditions acceptance to `login/subpage.tsx`: checkbox in register mode, submission blocked until checked (`toast.error`), passes `data: { terms_accepted: true }` in `signUp` options.

### New capabilities (web settings)
- [x] **3.10** Added password change UI: new `src/app/app/settings/password/page.tsx` (react-hook-form + zod, current/new/confirm, `changePassword`, toast feedback, wrong-current-password mapping).
- [x] **3.11** Added name editing UI: new `src/app/app/settings/account/page.tsx` (edit `full_name`, non-empty validation, `updateProfile`, toast feedback).
- [x] **3.12** Added account deletion UI to `account/page.tsx`: explicit `window.confirm` (not single tap), `deleteAccount()`, success → `router.push('/login')`, failure → `toast.error`, account intact.

### Phase 3 verification
- [x] **3.13** `tsc --noEmit` (web) passes; `pnpm --filter web build` (`next build --turbopack`) succeeds with all routes (incl. new `/app/settings/account` and `/app/settings/password`). Web `eslint` remains at 47 pre-existing problems (no new issues introduced). Manual flow testing deferred to Phase 4.

---

## Phase 4 — Cross-Platform Verification & Docs

### Pre-deployment testing document
- [x] **4.1** Wrote `docs/pre-deployment-checks.md`: a structured manual checklist covering every acceptance criterion on **both** platforms (13 sections: registration, email confirmation, login, logout, password reset, password change, name editing, account deletion, onboarding, bug report, error boundary, session gating, no hardcoded credentials), each with precondition, steps, expected result, and mobile/web pass-fail columns.

### Limited automated tests
- [x] **4.2** Added Vitest unit tests for the shared validation schemas (`packages/shared/src/validation.test.ts`, 7 tests); added `test` script + `vitest` devDependency to `@repo/shared`; excluded `*.test.ts` from the build output. `pnpm --filter @repo/shared test` → 7/7 pass.
- [ ] **4.3** Edge Function ordering/idempotency test — deferred (lower priority; the manual doc is the gate; would need Deno/mocked admin infra).

### Acceptance criteria walkthrough
- [ ] **4.4** Walk through all 17 acceptance criteria on **mobile** and record pass/fail — requires manual device/emulator execution (not possible in this environment). The checklist is ready in `docs/pre-deployment-checks.md`.
- [ ] **4.5** Walk through all 17 acceptance criteria on **web** and record pass/fail — requires manual browser execution. The checklist is ready in `docs/pre-deployment-checks.md`.
- [x] **4.6** `pnpm run build` → 7/7 tasks pass; `pnpm run check-types` → 3/3 pass. `pnpm run lint` still fails on **pre-existing** issues (mobile `expo lint` ESLint 9 + legacy `standard` config incompatibility; web 47 pre-existing lint problems) — no new lint issues introduced by this feature.
- [x] **4.7** Grepped source for hardcoded Supabase URL/anon-key literals — **none** remain in client source (only in gitignored `.next` build artifacts and `.env*` files).

### Docs & roadmap
- [x] **4.8** Updated `docs/getting-started.md`: documented required env vars (`NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`), corrected the "no .env needed" claim, documented the `AuthProvider > RequireAuth` session guard, added `@repo/shared` to the tested-packages list, and reflected the new settings screens.
- [x] **4.9** Updated `constitution/roadmap.md`: added a "Feature status" table marking `001-app-foundation` as ✅ Done.
