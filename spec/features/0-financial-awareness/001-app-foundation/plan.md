# Implementation Plan — App Foundation

> This plan translates the approved `spec.md` into a high-level implementation strategy. It is not a line-by-line checklist (that is `tasks.md`). It respects the existing architecture and the constitution's `tech-stack.md` hard limits.

---

## Implementation Overview

The app foundation is mostly **already built but inconsistent and partly broken**. The implementation is therefore structured as: **audit → standardize → correct → extend → document**.

The work touches three layers:

1. **Data layer (Supabase)** — small schema additions (terms-acceptance column), an Edge Function for account deletion (the only privileged operation the client cannot perform), and verification that the existing `handle_new_user` trigger and RLS policies are sufficient.
2. **Shared auth/data-access layer (`@repo/supabase` + `@repo/shared`)** — consolidate the two divergent Supabase stacks (mobile-local vs package) onto the package as the single source of truth, fill the missing helpers (`updateProfile`, `changePassword`, `deleteAccount`, `resendConfirmation`, `getUser`), and add shared validation schemas/error codes.
3. **App layer (mobile + web)** — correct the broken/incorrect behaviors (logout redirect, swallowed errors, missing validations, stale onboarding redirect, broken i18n key, duplicated onboarding step), add the new capabilities (password change, name editing, account deletion, terms acceptance), unify the error surfaces, harden session gating, and localize the error boundary.

Two **deliverables** accompany the code:
- `docs/foundation-audit.md` — the written audit of bad practices and failure points (produced first, drives the corrective tasks).
- `docs/pre-deployment-checks.md` — the human-readable manual testing document for verifying the foundation before each deployment.

The two platforms must converge on the **same observable behavior** for every foundational capability, even while keeping their distinct UI frameworks (Expo Router / NativeWind vs Next.js App Router / Tailwind + shadcn).

---

## Decisions on Open Questions

The spec left open questions that must be resolved before/during planning. The schema introspection resolved several. Decisions taken here; the user may override at review.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Web i18n depth | **Defer full i18n.** Foundational web strings stay hardcoded-but-consistent Spanish; non-raw-error, non-English-on-Spanish. | Spec assumption; full web i18n is a separate effort. |
| 2 | Brute-force throttling | **Rely on Supabase Auth rate limiting** + a client-side submit-throttle/disabled state. No custom counter. | Supabase has built-in throttling; custom logic adds risk. |
| 3 | Hosted error service | **Out of scope.** Error boundary logs locally and records via the existing manual bug-report path; structure the boundary so a remote sink can be added later. | Spec puts it out of scope. |
| 4 | Audit deliverable format | **Standalone `docs/foundation-audit.md`** + corrective items tracked in `tasks.md`. | A persistent written record survives implementation; tasks track execution. |
| 5 | Post-welcome destination | **Dashboard/home** as the single standard on both platforms (mobile `/(app)/dashboard`, web `/app/home`). | The main-experience entry; removes the current 3-way divergence. |
| 6 | Email confirmation strictness | **Inform + offer resend**, not a hard block. Matches the spec's stated behavior. | Spec. |
| 7 | Account deletion mechanism | **Edge Function** (`delete-user`) using the service-role key. | Client cannot call `admin.deleteUser`; the 9 user-scoped tables have no FK to `auth.users` and would orphan. See "Data and State Changes". |
| 8 | Terms-acceptance storage | **`profiles.terms_accepted_at timestamptz`**, populated by the `handle_new_user` trigger reading `raw_user_meta_data`. | Works whether or not signup returns an immediate session (RLS would block a client-side update when no session). |
| 9 | Name column in profiles | **Use existing `profiles.full_name`** (text, nullable). No migration for the name. | Confirmed by schema introspection. |

---

## Affected Areas

### Mobile (`apps/mobile/`)
- `app/index.js` — entry/session bootstrap (consolidate the redundant `onAuthStateChange`, route correctly).
- `app/_layout.js` — remove duplicate auth listener; keep deep-link + `PASSWORD_RECOVERY` handling.
- `app/signUp.js` — add terms-acceptance checkbox; route through the shared `signUp` helper; unify error surface.
- `app/forgotPassword.js`, `app/updatePassword.js`, `app/checkEmail.js` — error-surface unification; fix broken i18n key (`signup.password-no-match` → `signup.errors.password-no-match`); add resend.
- `app/welcome.js` — fix duplicated step; standardize redirect to `/(app)/dashboard`.
- `app/(app)/settings/index.js` — fix logout redirect (`/`, not `/signUp`); wire name editing; wire password change; wire account deletion; surface errors via the unified mechanism.
- `app/(app)/settings/bugreport.js` — validate non-empty; check `insertReport` result; preserve message on failure.
- `components/auth.jsx` — add client-side validation (parity with signUp); unify error surface.
- `components/ErrorBoundary.jsx` — i18n + theme; structure for remote sink.
- `lib/supabase/*` — **retire in favor of `@repo/supabase`** (or, at minimum, align signatures exactly). The local `client.js` hardcoded credentials are removed.
- `lib/welcomeSeen.js`, `lib/utils.js` — consolidate with the shared package versions.
- `assets/locales/{en,es}.json` — add keys for new features (password change, name edit, account deletion, terms); fix the broken key; remove stale `tabs.*` if desired.
- `app.json` / `app.config.js` — read Supabase URL + anon key from env (`extra` in app.config, consumed via `expo-constants`).

### Web (`apps/web/`)
- `src/app/login/subpage.tsx` — add terms-acceptance on registration; loading state on submit; consider default mode (`login` vs `register` — keep `register` only if intentional; flag in audit).
- `src/app/forgot-password/*` — surface Supabase errors via `toast.error` (currently swallowed); fix the resend on check-email (currently just navigates back).
- `src/app/auth/callback/*`, `src/app/reset-password/*` — add a timeout to the "exchanging" state.
- `src/app/app/layout.tsx` — **add a session guard** (redirect to `/login` when unauthenticated). This is the core session-gating fix.
- `src/app/app/settings/page.tsx` — add password change, name editing, account deletion; surface logout errors via `toast.error` (currently `console.error` only).
- `src/app/welcome/page.tsx` — keep `/app/home` destination (already standard).
- **New**: `src/contexts/AuthContext.tsx` (+ `useSession` hook) — central auth state so `/app/*` layout, settings, and providers can react to sign-in/out/expiry uniformly.
- **New**: `src/app/app/settings/change-password/page.tsx`, `src/app/app/settings/account/page.tsx` (or inline sections) for name edit + delete account.
- **New**: `src/app/error.tsx` and `src/app/global-error.tsx` — Next.js App Router error boundaries (currently none).
- `next.config` / `.env.local` — read Supabase URL + anon key from `NEXT_PUBLIC_*` env vars.

### Shared packages
- `packages/supabase/src/client.ts` — read from env, remove hardcoded literals.
- `packages/supabase/src/auth.ts` — add `updateProfile`, `changePassword`, `deleteAccount` (calls Edge Function), `resendConfirmation`, `getUser`. Align mobile onto these.
- `packages/supabase/src/reports.ts` — fix the inconsistent return type (`insertReport` returns `error | true`); return a consistent `{ error } | { success }` shape; verify column names against the actual `reports` schema (`device_info jsonb`, `app_version`, `message`).
- `packages/shared/src/` — add shared validation schemas (email, password ≥8, name non-empty) usable by both apps; add shared auth error-code constants; **remove or fix the broken `welcomeSeen.js` and `utils.js`** (invalid imports) — consolidate to one correct implementation.
- `packages/shared/src/errors.js` — extend beyond `DatabaseError` with auth-related error codes.

### Supabase (database + edge function)
- Migration: add `profiles.terms_accepted_at timestamptz`.
- Migration: update `handle_new_user()` to read `new.raw_user_meta_data->>'terms_accepted'` and set `profiles.terms_accepted_at` (and optionally `full_name` from meta data).
- New Edge Function: `supabase/functions/delete-user/index.ts` (service-role).
- (Optional, noted as alternative) Migration: add `ON DELETE CASCADE` FKs from the 9 user-scoped tables to `auth.users` so deletion cascades without the Edge Function needing to delete each table — **not chosen** for now to avoid wide schema change; the Edge Function deletes explicitly.

### Docs
- New: `docs/foundation-audit.md`.
- New: `docs/pre-deployment-checks.md`.

---

## Architectural Considerations

### Single source of truth for Supabase access
The most consequential architectural decision is **retiring `apps/mobile/lib/supabase/*` in favor of `@repo/supabase`**. Today there are two divergent copies (the mobile local JS helpers and the package TS helpers) with different signatures (`signUp` lacks `options` on mobile; `resetPassword` hardcodes the redirect on mobile). This drift is the root cause of several observed bugs (signUp bypassing the helper, broken i18n key, inconsistent error handling). Consolidating onto the package means:
- One auth API surface, consumed by both apps.
- Env-based credentials in one place (`packages/supabase/src/client.ts`).
- Mobile imports from `@repo/supabase/auth` etc. (the package already exports raw `.ts`, and Metro transpiles it — already the case for web).

**Risk:** Mobile currently imports `.js` helpers; switching to the package's `.ts` source requires Metro to transpile `packages/supabase/**` (likely already configured since `@repo/ui` is TSX and consumed by web; verify for mobile). If Metro can't, keep a thin `.js` re-export shim that re-exports from the package — but no logic duplication.

### Auth context on web
Web has no `AuthContext`/`useSession`; every page calls `supabase.auth.getSession()` ad-hoc, and the `/app/*` layout doesn't redirect unauthenticated users. The plan introduces a single `AuthContext` that:
- Loads the session once on mount.
- Subscribes to `onAuthStateChange` (one listener, not the current two on mobile).
- Exposes `session`, `user`, `loading`, and sign-out.
- The `/app/*` layout uses it to redirect to `/login` when `loading` is false and `session` is null.

Mobile's equivalent is the `index.js` session check — this gets consolidated into the same single-listener pattern (one `onAuthStateChange`, not two).

### Error-surface unification
- **Mobile**: adopt the **Snackbar** as the single in-app error/feedback surface for auth flows, mounted **globally** (not per-screen) so the implicit `global.showSnackbar` coupling is safe. Remove `Alert.alert` usage for auth errors (keep `Alert` only for destructive confirmations like account deletion, where a native confirm dialog is appropriate). Fix the broken i18n key.
- **Web**: keep `sonner` toast as the single surface; fix the flows that currently swallow errors (logout, forgot-password) to call `toast.error`. Add `error.tsx`/`global-error.tsx`.
- **Both**: the error-boundary screen is localized and themed; the raw error is logged (and, in future, forwarded to a remote sink via a single `reportError(error, context)` function that currently no-ops on remote but records locally).

### Account deletion requires elevated privileges
`supabase.auth.admin.deleteUser()` needs the service-role key, which **must never** be in client code. The plan uses a Supabase Edge Function `delete-user` that:
1. Verifies the caller's JWT (rejects unauthenticated requests).
2. Deletes the caller's rows from the 9 user-scoped tables + `budget_plan_groups` (by `user_id` / via parent plan).
3. Calls `auth.admin.deleteUser(userId)` — this hard-deletes the `auth.users` row, cascading to `profiles` (FK is `ON DELETE CASCADE`, confirmed) and all auth-schema children (`sessions`, `identities`, `mfa`, etc., all `CASCADE`).
4. Returns success/failure.

Ordering: data deletion first, auth-user deletion last. If step 2 fails, the auth user still exists (user can retry). If step 3 fails after step 2 succeeds, the auth user is orphaned with empty data — retryable (step 2 is idempotent against empty tables, step 3 then succeeds). The Edge Function must be deployed before the client "delete account" action can work.

### Password change semantics
Supabase's `updateUser({ password })` does **not** require the current password. The spec mandates current-password verification. The plan implements: read the user's email from `getUser()`, attempt `signInWithPassword(email, currentPassword)` as a reauthentication check; on success, `updateUser({ password: newPassword })`. This satisfies "current password required" using existing Supabase primitives. (Supabase also offers `reauthenticate()` for sensitive ops via a nonce flow; the sign-in check is simpler and sufficient here.)

### Terms acceptance at signup
`signUp` is called with `options: { data: { terms_accepted: true, terms_version: <version> } }` so the value lands in `raw_user_meta_data`. The updated `handle_new_user` trigger copies it to `profiles.terms_accepted_at = now()` when the meta flag is present. This works whether signup returns an immediate session or requires email confirmation (the trigger runs server-side regardless). The client blocks submission until the checkbox is checked.

### What is NOT changed
- Navigation structure (sidebar on both apps).
- The learning section, transactions, accounts, dashboards.
- The Supabase project itself (no project migration); only additive schema + one function.
- No new third-party dependencies (no Sentry, no new validation lib on mobile — reuse existing `failIf`/`validateEmail` patterns, aligned to shared schemas).

---

## Data and State Changes

### Database migrations (additive)
1. **`profiles.terms_accepted_at`** — `alter table public.profiles add column terms_accepted_at timestamptz;` (nullable; set by trigger).
2. **`handle_new_user()` body** — update to:
   - insert `id` (as today),
   - set `full_name = new.raw_user_meta_data->>'full_name'` if present,
   - set `terms_accepted_at = case when (new.raw_user_meta_data->>'terms_accepted') = 'true' then now() else null end`.
3. **RLS** — no new policies required for the foundation:
   - `profiles` UPDATE policy already allows a user to update their own row (covers `full_name` editing). ✅
   - `profiles` has **no DELETE policy** — account deletion does not delete the profile via client; the Edge Function (service-role, bypasses RLS) handles it, and `profiles_id_fkey CASCADE` removes the row on `auth.users` delete. ✅
   - `reports` INSERT policy exists. ✅
4. **No FK changes** to the 9 user-scoped tables (the Edge Function cleans them explicitly).

### Edge Function
- New `delete-user` function (Deno, service-role key from `SUPABASE_SERVICE_ROLE_KEY` env on the function). Deploys via `supabase functions deploy delete-user`.

### Client state / persistence
- Sessions: no change to Supabase-managed session persistence (AsyncStorage on mobile, cookies/storage on web).
- Onboarding flag: still `profiles.welcome` (boolean) — no schema change; the bug is the redirect destination, not the flag.
- No new client stores; the new web `AuthContext` holds session state only.

### Effects on existing data
- Adding `terms_accepted_at` (nullable) does not affect existing 5 profile rows (they'll have `null` — acceptable; they registered before this feature).
- Updating the trigger only affects **new** signups.
- No data migration/backfill is required for the foundation.

---

## Implementation Phases

### Phase 0 — Audit (produces `docs/foundation-audit.md`)
Run the systematic analysis of the existing implementation against the spec's standard. Output is a written record: each finding (bad practice, inconsistency, failure point) with file path, severity, and the corrective task it maps to. This drives the scope of Phases 2–4.

### Phase 1 — Data layer + shared foundation
- Add the `terms_accepted_at` migration; update `handle_new_user`.
- Create and deploy the `delete-user` Edge Function.
- Move credentials to env in `packages/supabase/src/client.ts`; remove hardcoded literals.
- Extend `@repo/supabase/auth.ts` with `updateProfile`, `changePassword`, `deleteAccount`, `resendConfirmation`, `getUser`.
- Fix `@repo/supabase/reports.ts` return type + column-name verification.
- Add shared validation schemas + auth error codes in `@repo/shared`.
- Remove/fix the broken `packages/shared/src/welcomeSeen.js` and `utils.js`.

### Phase 2 — Mobile consolidation & correction
- Switch mobile from `lib/supabase/*` to `@repo/supabase` (or thin re-export shim).
- Consolidate to one `onAuthStateChange` listener; fix `index.js` session/routing.
- Fix logout redirect → `/`.
- Fix `welcome.js` duplicated step + redirect → `/(app)/dashboard`.
- Fix broken i18n key; add new locale keys (password change, name edit, delete account, terms).
- Unify error surface (global Snackbar; remove `Alert.alert` for auth errors).
- Localize + theme the `ErrorBoundary`.
- Wire terms acceptance into `signUp.js`.
- Add password change, name editing, account deletion to settings.
- Fix bug-report: non-empty validation, check result, preserve message.

### Phase 3 — Web consolidation & correction
- Introduce `AuthContext`/`useSession`; add session guard in `/app/*` layout.
- Surface swallowed errors (logout, forgot-password) via `toast.error`.
- Fix forgot-password resend (actually resend, not navigate back).
- Add timeout to auth-callback / reset-password "exchanging" state.
- Add `error.tsx` + `global-error.tsx`.
- Wire terms acceptance into registration.
- Add password change, name editing, account deletion to settings.
- Read Supabase config from `NEXT_PUBLIC_*` env.

### Phase 4 — Cross-platform verification & docs
- Write `docs/pre-deployment-checks.md` (the manual test document).
- Walk through every acceptance criterion on **both** platforms; record results.
- Update `constitution/roadmap.md` (move the feature to Done) once criteria pass.

---

## Testing and Verification Strategy

The repo currently has **no tests for any foundational flow** and no E2E harness. Per the spec, this feature establishes a **manual** pre-deployment testing document (automated E2E is explicitly out of scope). The verification strategy is therefore:

### Manual verification (the primary gate) — `docs/pre-deployment-checks.md`
A structured checklist a person runs before every deployment, covering each acceptance criterion on **both** platforms, with explicit steps and expected results:
- Registration (incl. terms acceptance; blocked when terms unchecked; already-used email).
- Email confirmation (deep link / redirect; expired link; timeout).
- Login (valid; invalid; unconfirmed email; rate-limit message).
- Logout (success → login screen; failure → error shown).
- Password reset (request → non-disclosing message; link → new password; login with new password).
- Password change (wrong current password rejected; success).
- Name editing (empty rejected; success persisted).
- Account deletion (cancel; confirm → data gone, session ended, at login; failure → intact).
- Onboarding (first login → welcome; complete → dashboard/home; subsequent logins skip).
- Bug report (empty rejected; success; failure preserves message).
- Error boundary (trigger a crash → localized recovery screen).
- Session gating (unauthenticated → `/app/*` redirects to login).
- Credentials (grep source for literals → none).

Each item has: precondition, steps, expected result, pass/fail.

### Automated tests (limited, where they add value without a new framework)
- **Shared validation schemas** (`@repo/shared`) — unit tests with Vitest (the repo already uses Vitest in two packages; adding tests to `@repo/shared` is consistent). These verify the email/password/name rules used by both apps.
- **Edge Function `delete-user`** — if feasible without heavy infra, a Vitest test against a local Supabase instance or a mocked admin client verifying ordering (data delete before auth delete) and idempotency. (Lower priority; the manual doc is the gate.)

### Acceptance-criteria verification
Every one of the 17 acceptance criteria in `spec.md` is mapped to one or more manual-check items in the pre-deployment doc. The feature is not "done" until each passes on both platforms. The audit document (Phase 0) ensures the corrective work actually addressed each finding.

### What is explicitly NOT the verification strategy
- No new E2E framework (Playwright/Detox) is introduced in this feature.
- No hosted error service verifies crashes remotely.
- Lint/typecheck/build (`pnpm run lint`, `pnpm run check-types`, `pnpm run build`) remain the automated baseline and are run before manual checks.

---

## Risks and Considerations

- **Mobile consuming `@repo/supabase` TS source via Metro.** If Metro isn't configured to transpile `packages/supabase/**`, the switch breaks the mobile build. Mitigation: verify Metro config early in Phase 2; if it can't, use a thin `.js` re-export shim with **no logic duplication**.
- **Edge Function availability.** Account deletion depends on `delete-user` being deployed. Until it is, the client "delete account" action can't work. Mitigation: deploy the function in Phase 1, before wiring the UI in Phases 2–3.
- **Orphan risk on partial deletion.** If data deletion succeeds but `admin.deleteUser` fails, the auth user remains with empty data. Mitigation: idempotent retry; the function can be re-invoked. Document this in the audit and the pre-deployment doc (the "account deletion fails" edge case).
- **`updateUser({ password })` not requiring the old password.** The current-password check is enforced via a `signInWithPassword` pre-check. If Supabase changes sign-in throttling, rapid change-password attempts could trip rate limits. Mitigation: note in the doc; rely on Supabase rate limiting (consistent with decision #2).
- **Two `onAuthStateChange` listeners on mobile today.** Removing one must preserve the `PASSWORD_RECOVERY` → `updatePassword` routing and the deep-link `/auth/callback` handling. Mitigation: consolidate carefully in one listener with explicit event handling; verify via the manual doc's password-reset item.
- **Web `AuthContext` introduction could regress existing pages** that currently call `getSession()` directly. Mitigation: the context is additive; pages can migrate gradually, and the `/app/*` guard is the only behavioral change (redirect when no session) — which is the intended fix, not a regression.
- **Stale documentation** (AGENTS.md references `(tabs)/` which no longer exists). Out of scope to fully rewrite, but the audit should flag it; the pre-deployment doc should reflect the actual `(app)/` sidebar structure.
- **Hardcoded credentials removal** requires env vars to be set in all environments (local dev, EAS build, web deploy). Mitigation: document the required env vars in `docs/getting-started.md` (update) and `docs/pre-deployment-checks.md` (verify presence before deploy).
- **Terms-acceptance backfill.** Existing users have `null` `terms_accepted_at`. This is acceptable (they registered pre-feature) but should be noted; a future feature could prompt re-acceptance on terms-version change. Not in scope now.
- **i18n key drift.** Mobile locale files must be kept in sync with the new keys. Mitigation: add keys in both `en.json` and `es.json` together in Phase 2.
