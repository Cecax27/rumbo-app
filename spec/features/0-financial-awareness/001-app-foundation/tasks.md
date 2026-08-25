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
- [ ] **2.1** Verify Metro config transpiles `packages/supabase/**` TS source; if not, add a thin `.js` re-export shim with **no logic duplication**.
- [ ] **2.2** Switch mobile from `apps/mobile/lib/supabase/*` to `@repo/supabase`; remove the local duplicated helpers (`auth.js`, `client.js`, `reports.js`).
- [ ] **2.3** Move Supabase URL + anon key to Expo config (`app.json`/`app.config.js` `extra`) consumed via `expo-constants`; remove hardcoded literals from mobile.

### Session & routing
- [ ] **2.4** Consolidate mobile to a **single** `onAuthStateChange` listener (merge the duplicate in `app/_layout.js` + `app/index.js`); preserve `PASSWORD_RECOVERY` → `updatePassword` routing and `/auth/callback` deep-link handling.
- [ ] **2.5** Fix logout redirect in `app/(app)/settings/index.js` → `router.replace('/')` (login), not `/signUp`.

### Registration & terms
- [ ] **2.6** Add terms-and-conditions acceptance checkbox to `app/signUp.js`; block submission until checked; pass `terms_accepted` + optional `full_name` in `signUp` options data.
- [ ] **2.7** Route `signUp.js` through the shared `signUp` helper (stop bypassing it with a direct `supabase.auth.signUp` call).

### Error surface unification (mobile)
- [ ] **2.8** Mount the Snackbar **globally** (so `global.showSnackbar` is always available); remove per-screen mounting.
- [ ] **2.9** Replace `Alert.alert` usage for auth-flow errors with the Snackbar (keep `Alert.alert` only for destructive confirmations like account deletion).
- [ ] **2.10** Fix the broken i18n key in `app/updatePassword.js` (`signup.password-no-match` → `signup.errors.password-no-match`).

### Onboarding fixes
- [ ] **2.11** Fix `app/welcome.js` duplicated `exploreDashboard` step (remove the copy-pasted duplicates).
- [ ] **2.12** Standardize `app/welcome.js` redirect → `/(app)/dashboard` (align with `(app)/index.js`).

### Error boundary
- [ ] **2.13** Localize and theme `components/ErrorBoundary.jsx` (remove hardcoded English text and hardcoded colors); structure a `reportError(error, context)` hook for a future remote sink.

### New capabilities (mobile settings)
- [ ] **2.14** Add **password change** UI to settings: current-password + new-password + confirm fields; validate; call `changePassword`; surface success/error via Snackbar.
- [ ] **2.15** Add **name editing** UI to settings: edit `full_name`; validate non-empty; call `updateProfile`; reflect change in settings header; surface error via Snackbar.
- [ ] **2.16** Add **account deletion** UI to settings: confirm dialog (native `Alert`); on confirm call `deleteAccount()`; on success → `router.replace('/')`; on failure → error via Snackbar, account intact.

### Bug report fix
- [ ] **2.17** Fix `app/(app)/settings/bugreport.js`: validate non-empty message before submit; check `insertReport` result (don't navigate to confirmation on failure); preserve message on failure for retry.

### i18n
- [ ] **2.18** Add new locale keys to `assets/locales/en.json` and `es.json` for: password change, name editing, account deletion (confirm + success + error), terms acceptance. Remove stale `tabs.*` keys if desired.

### Phase 2 verification
- [ ] **2.19** Run `pnpm run lint --filter=mobile`, `pnpm run check-types` (mobile), `pnpm run start --filter=mobile` and exercise the flows manually per the draft checks.

---

## Phase 3 — Web Consolidation & Correction

### Auth context & session gating
- [ ] **3.1** Create `apps/web/src/contexts/AuthContext.tsx` + `useSession` hook: load session on mount, single `onAuthStateChange` listener, expose `session`/`user`/`loading`.
- [ ] **3.2** Add session guard in `src/app/app/layout.tsx`: redirect to `/login` when `loading` is false and `session` is null.
- [ ] **3.3** Read Supabase URL + anon key from `NEXT_PUBLIC_*` env vars in the web client; remove hardcoded literals.

### Error surface unification (web)
- [ ] **3.4** Fix swallowed logout error in `src/app/app/settings/page.tsx` → `toast.error` (not `console.error` only).
- [ ] **3.5** Fix swallowed forgot-password errors in `src/app/forgot-password/page.tsx` → `toast.error` for Supabase errors (not `console.error` only); remove leftover `console.log` debug logging.
- [ ] **3.6** Fix `src/app/forgot-password/check-email/page.tsx` resend: actually call `resendConfirmation(email)` (not just navigate back).
- [ ] **3.7** Add a timeout to the "exchanging" state in `src/app/auth/callback/*` and `src/app/reset-password/*` (show an error instead of hanging forever).

### Error boundaries (web)
- [ ] **3.8** Add `src/app/error.tsx` and `src/app/global-error.tsx` (Next.js App Router error boundaries), localized and themed, with a recovery action.

### Registration & terms
- [ ] **3.9** Add terms-and-conditions acceptance to registration in `src/app/login/subpage.tsx`; block submission until checked; pass `terms_accepted` in `signUp` options data.

### New capabilities (web settings)
- [ ] **3.10** Add **password change** UI to settings: current-password + new-password + confirm; zod-validated; call `changePassword`; toast feedback.
- [ ] **3.11** Add **name editing** UI to settings: edit `full_name`; validate non-empty; call `updateProfile`; reflect change; toast feedback.
- [ ] **3.12** Add **account deletion** UI to settings: explicit confirm (not a single tap); call `deleteAccount()`; on success → `router.push('/login')`; on failure → `toast.error`, account intact.

### Phase 3 verification
- [ ] **3.13** Run `pnpm run lint --filter=web`, `pnpm run check-types --filter=web`, `pnpm run dev --filter=web` and exercise the flows manually.

---

## Phase 4 — Cross-Platform Verification & Docs

### Pre-deployment testing document
- [ ] **4.1** Write `docs/pre-deployment-checks.md`: a structured manual checklist covering every acceptance criterion on **both** platforms, with precondition, steps, expected result, and pass/fail for each item:
  - Registration (incl. terms acceptance; blocked when unchecked; already-used email).
  - Email confirmation (deep link / redirect; expired link; timeout).
  - Login (valid; invalid; unconfirmed email; rate-limit message).
  - Logout (success → login screen; failure → error shown).
  - Password reset (request → non-disclosing message; link → new password; login with new password).
  - Password change (wrong current password rejected; success).
  - Name editing (empty rejected; success persisted).
  - Account deletion (cancel; confirm → data gone, session ended, at login; failure → intact).
  - Onboarding (first login → welcome; complete → dashboard/home; subsequent logins skip).
  - Bug report (empty rejected; success; failure preserves message).
  - Error boundary (trigger crash → localized recovery screen).
  - Session gating (unauthenticated → `/app/*` redirects to login).
  - Credentials (grep source for literals → none).

### Limited automated tests
- [ ] **4.2** Add Vitest unit tests for the shared validation schemas in `@repo/shared` (email, password ≥ 8, name non-empty).
- [ ] **4.3** (If feasible without heavy infra) Add a test for the `delete-user` Edge Function ordering/idempotency (mocked admin client). Lower priority — the manual doc is the gate.

### Acceptance criteria walkthrough
- [ ] **4.4** Walk through all 17 acceptance criteria from `spec.md` on **mobile**; record pass/fail in `docs/pre-deployment-checks.md` (or a linked results section).
- [ ] **4.5** Walk through all 17 acceptance criteria from `spec.md` on **web**; record pass/fail.
- [ ] **4.6** Verify `pnpm run lint`, `pnpm run check-types`, `pnpm run build` all pass from repo root.
- [ ] **4.7** Grep the codebase for hardcoded Supabase URL/anon-key literals → confirm none remain in client source.

### Docs & roadmap
- [ ] **4.8** Update `docs/getting-started.md`: correct the inaccurate test-suite claims; document required env vars (`NEXT_PUBLIC_*`, Expo `extra`); reflect the actual `(app)/` sidebar structure.
- [ ] **4.9** Update `constitution/roadmap.md`: move the App Foundation feature to Done (once criteria pass).
