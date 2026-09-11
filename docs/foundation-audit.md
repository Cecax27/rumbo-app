# Foundation Audit

> Systematic audit of the existing authentication/identity/session implementation against `spec/features/0-financial-awareness/001-app-foundation/spec.md`.
>
> Each finding maps to a corrective task in `tasks.md`. Severity: **Critical** (security/credential exposure, constitution violation), **High** (violates an acceptance criterion or business rule), **Medium** (inconsistency or defect with limited blast radius), **Low** (cleanup/documentation).

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 9 |
| Medium | 12 |
| Low | 2 |
| **Total** | **25** |

The foundation is broadly implemented but suffers from: hardcoded credentials in two places, two divergent Supabase client stacks, inconsistent error surfacing (raw `Alert` messages, swallowed errors), missing session gating on web, and several broken/missing capabilities (terms acceptance, password change, name editing, account deletion).

---

## Findings

### Critical

| ID | Finding | Location | Corrective task |
|----|---------|----------|-----------------|
| C1 | Supabase URL + anon key hardcoded (violates constitution "no credentials in source code", spec BR13 / AC14) | `apps/mobile/lib/supabase/client.js:6-7` | 2.2, 2.3 |
| C2 | Supabase URL + anon key hardcoded | `packages/supabase/src/client.ts:3-4` | 1.7, 3.3 |

### High

| ID | Finding | Location | Corrective task |
|----|---------|----------|-----------------|
| H1 | Logout redirects to `/signUp` instead of the login screen (violates BR7 / AC3) | `apps/mobile/app/(app)/settings/index.js:70` | 2.5 |
| H2 | Two `onAuthStateChange` listeners registered (session routing + PASSWORD_RECOVERY split across files) | `apps/mobile/app/index.js:56` and `apps/mobile/app/_layout.js:42` | 2.4 |
| H3 | Web `/app/*` layout has **no session guard**; unauthenticated users can reach the authenticated area (violates BR6 / AC10) | `apps/web/src/app/app/layout.tsx` | 3.2 |
| H4 | Raw Supabase error messages shown to users via `Alert.alert(error.message)` (violates BR9 / AC8) | `apps/mobile/components/auth.jsx:29`, `apps/mobile/app/signUp.js:104`, `apps/mobile/app/forgotPassword.js:62`, `apps/mobile/app/updatePassword.js:75` | 2.9 |
| H5 | Web logout error swallowed (`console.error` only) (violates BR8 / AC8) | `apps/web/src/app/app/settings/page.tsx:35` | 3.4 |
| H6 | Bug report: empty message allowed, `insertReport` result ignored, failure still navigates to success screen, message not preserved (violates AC12) | `apps/mobile/app/(app)/settings/bugreport.js:21-38` | 2.17 |
| H7 | Terms & conditions acceptance absent from registration on both platforms (violates BR4 / AC1) | `apps/mobile/app/signUp.js`, `apps/web/src/app/login/subpage.tsx` | 2.6, 3.9 |
| H8 | No password-change capability for authenticated users (violates BR16 / AC5) | mobile settings, web settings | 2.14, 3.10 |
| H9 | No account-deletion capability (violates BR18 / AC7); also no `delete-user` Edge Function and no `profiles.terms_accepted_at` column | mobile settings, web settings, `supabase/` | 1.1-1.6, 2.16, 3.12 |

### Medium

| ID | Finding | Location | Corrective task |
|----|---------|----------|-----------------|
| M1 | Divergent Supabase client stacks: mobile `lib/supabase/*` duplicates `@repo/supabase` with different signatures (`signUp` lacks `options`; `resetPassword` hardcodes `redirectTo`) | `apps/mobile/lib/supabase/*` vs `packages/supabase/src/*` | 2.2 |
| M2 | Broken i18n key `signup.password-no-match` (missing `errors.` segment; correct key used in `signUp.js`) | `apps/mobile/app/updatePassword.js:65` | 2.10 |
| M3 | Mobile welcome redirects to `/(app)/accounts/` but `(app)/index.js` redirects to `/dashboard` (divergent; BR14 / AC17) | `apps/mobile/app/welcome.js:24` | 2.12 |
| M4 | Welcome screen renders the `exploreDashboard` step three times (copy-paste) | `apps/mobile/app/welcome.js:98-170` | 2.11 |
| M5 | Web forgot-password swallows Supabase error (`console.error`) and leaves debug `console.log` | `apps/web/src/app/forgot-password/page.tsx:33-37` | 3.5 |
| M6 | Web forgot-password "Reenviar enlace" button just navigates back; no actual resend | `apps/web/src/app/forgot-password/check-email/page.tsx:37` | 3.6 |
| M7 | Web auth-callback / reset-password "Verificando enlace…" state has no timeout; can hang forever | `apps/web/src/app/auth/callback/callback-form.tsx`, `apps/web/src/app/reset-password/reset-password-form.tsx` | 3.7 |
| M8 | No web error boundaries (`error.tsx` / `global-error.tsx`) (violates AC13) | `apps/web/src/app/` | 3.8 |
| M9 | Mobile ErrorBoundary hardcoded English text + hardcoded colors (violates AC13 localization) | `apps/mobile/components/ErrorBoundary.jsx` | 2.13 |
| M10 | `insertReport` returns inconsistent shape (`error` object \| `true`) in both implementations | `packages/supabase/src/reports.ts`, `apps/mobile/lib/supabase/reports.js` | 1.9 |
| M11 | Broken shared module: `welcomeSeen.js` imports non-existent `./supabase/client` | `packages/shared/src/welcomeSeen.js:1` | 1.12 |
| M12 | Broken shared module: `utils.js` imports `react-native` (not a dep), references undefined `months`/`t` | `packages/shared/src/utils.js:1,52-57` | 1.12 |
| M13 | Mobile signUp bypasses the shared `signUp` helper (calls `supabase.auth.signUp` directly) | `apps/mobile/app/signUp.js:94` | 2.7 |
| M14 | Mobile login has no client-side validation (email/password empty or invalid) | `apps/mobile/components/auth.jsx` | 2.x (parity) |
| M15 | Snackbar mounted per-screen while exposing `global.showSnackbar`; should be mounted once globally | `apps/mobile/app/signUp.js:131`, `forgotPassword.js:82`, `updatePassword.js:97` | 2.8 |
| M16 | `@repo/shared` errors module only defines `DatabaseError`; no auth error codes | `packages/shared/src/errors.js` | 1.11 |
| M17 | Mobile checkEmail screen has no "resend confirmation" action | `apps/mobile/app/checkEmail.js` | 2.x |

### Low

| ID | Finding | Location | Corrective task |
|----|---------|----------|-----------------|
| L1 | Stale docs reference `(tabs)/` layout which no longer exists (now `(app)/` sidebar) | `AGENTS.md:77-78`, `spec/constitution/tech-stack.md:65` | 4.8 |
| L2 | `docs/getting-started.md` documents hardcoded credentials as the "normal" setup, which this feature removes | `docs/getting-started.md` | 4.8 |

---

## Data-layer observations (Supabase schema)

- `public.profiles` has an FK `profiles_id_fkey REFERENCES auth.users(id) ON DELETE CASCADE` — deleting an Auth user cascades to the profile. ✅
- The **9 user-scoped tables** (`accounts`, `spendings`, `deferred_spendings`, `incomes`, `transfers`, `budget_plans`, `saving_goals`, `retirement_plans`, `reports`) all have a `user_id` column but **no FK to `auth.users`** — deleting an Auth user would orphan these rows. `budget_plan_groups` is scoped via `plan_id → budget_plans`. Account deletion must therefore delete these rows explicitly (the `delete-user` Edge Function) before calling `admin.deleteUser`.
- `profiles` has a `welcome` boolean (default `false`) used as the onboarding gate; `profiles.full_name` exists; there is **no** `terms_accepted_at` column (task 1.1) and the `handle_new_user()` trigger currently inserts only `id` (task 1.2).
- RLS is enabled on all `public` tables. `profiles` has SELECT/UPDATE own-row policies (covers name editing) but no DELETE policy (not needed — Edge Function uses service role). `reports` has an INSERT policy (needs verification that it is `authenticated`-only and that `user_id` is defaulted correctly).

## Divergence matrix (BR14 / AC17)

| Capability | Mobile | Web | Standard (per spec) |
|------------|--------|-----|---------------------|
| Post-login destination | `/(app)/` → `/dashboard` | `/app/home` | main experience entry ✅ (welcome redirect misaligned) |
| Post-welcome destination | `/(app)/accounts/` ❌ | `/app/home` ✅ | dashboard/home |
| Logout destination | `/signUp` ❌ | `/login` ✅ | login |
| Error surface | `Alert.alert` + Snackbar (mixed) ❌ | sonner toast ✅ | single consistent surface |
| Terms acceptance | missing ❌ | missing ❌ | required |
| Password change | missing ❌ | missing ❌ | required |
| Name editing | missing ❌ | missing ❌ | required |
| Account deletion | missing ❌ | missing ❌ | required |
| Session gating | implicit (index.js redirect) ⚠️ | none ❌ | redirect to login |

---

*This audit was produced from a direct file-by-file review of `apps/mobile`, `apps/web`, `packages/supabase`, and `packages/shared`, plus live Supabase schema introspection (tables, columns, FKs, RLS).*
