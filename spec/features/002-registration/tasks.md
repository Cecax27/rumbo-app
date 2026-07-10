# 002 - Registration

## Testing

The repo currently has no test infrastructure for either app. Only `@repo/retirement-plan-calculation` has a single Vitest test file; `apps/web` and `apps/mobile` have no test scripts, no framework, no setup. The `001-forgot-password` feature was validated entirely via manual cross-platform testing against the live Supabase project.

This feature should do the same (manual cross-platform testing), but we should also lay the groundwork for automated tests. Below is the strategy, separated into what we do now vs. what we defer.

### What we do now (in this feature)

Nothing automated — match the `001-forgot-password` approach. All validation is manual + lint + type-check + build. Rationale: adding test infrastructure is a separate concern (scope creep), and the repo convention (AGENTS.md) only expects tests in `@repo/retirement-plan-calculation` and `@repo/transactions-parser`.

### What we should do next (proposed as a follow-up feature `003-web-test-infra`)

1. **Add Vitest to `apps/web`**:
   - Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` to `apps/web/package.json` devDependencies.
   - Create `apps/web/vitest.config.ts` with `environment: "jsdom"`, `setupFiles: ["./vitest.setup.ts"]`.
   - Create `apps/web/vitest.setup.ts` (`import "@testing-library/jest-dom"`).
   - Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `apps/web/package.json`.

2. **Unit tests for the registration form** (`apps/web/src/app/login/subpage.test.tsx`):
   - Mock `@repo/supabase/auth` (`vi.mock`) — spy on `signUp` and `signIn`.
   - Test: register mode calls `signUp` with `emailRedirectTo`.
   - Test: confirm-password mismatch → `signUp` not called, error shown.
   - Test: invalid email → `signUp` not called, error shown.
   - Test: `signUp` returns `{ data: { session: null } }` → redirected to `/login/check-email`.
   - Test: `signUp` returns `{ data: { session: {...} } }` → redirected to `/welcome` or `/app/home` depending on `checkWelcomeSeen` mock.
   - Test: `signUp` returns `{ error }` → error toast shown, not redirected.
   - Test: login mode calls `signIn` (not `signUp`).

3. **Unit tests for the web callback** (`apps/web/src/app/auth/callback/callback-form.test.tsx`):
   - Mock `@repo/supabase/client` — spy on `exchangeCodeForSession`, `setSession`, `getSession`, `onAuthStateChange`.
   - Test: PKCE `?code=` present → `exchangeCodeForSession` called → routes to `/welcome` (welcomeSeen=false) or `/app/home` (welcomeSeen=true).
   - Test: hash fragment `#access_token=...&type=signup` → `setSession` called.
   - Test: no code, no hash, no session → error state shown.
   - Test: `exchangeCodeForSession` rejects → error state shown.

4. **Unit tests for the welcome page** (`apps/web/src/app/welcome/page.test.tsx`):
   - Mock `@repo/supabase/client` — spy on `from("profiles").update`.
   - Test: "Comenzar" button calls `setWelcomeSeen` → routes to `/app/home`.

5. **Unit tests for the welcome helpers** (`apps/web/lib/welcomeSeen.test.ts`):
   - Mock the supabase client.
   - Test `checkWelcomeSeen`: returns `true` for `welcome: true` or `"true"`, `false` for `welcome: false` or null or error.
   - Test `setWelcomeSeen`: calls `update({ welcome: "true" }).eq("id", user.id)`.

6. **E2E tests (deferred further — needs Playwright)**:
   - Install `@playwright/test` in `apps/web`.
   - Test the full registration flow against a Supabase local instance (`supabase start` + seed) or a dedicated test project.
   - Test: navigate to `/login?mode=register` → fill form → submit → see check-email page.
   - Test: capture the confirmation email (via Mailpit if local, or Supabase test helpers) → extract link → navigate to it → land on `/welcome`.
   - This is the gold standard but requires significant infra (local Supabase, seed data, Mailpit). Defer to a `004-e2e-infra` feature.

7. **Mobile tests (deferred indefinitely)**:
   - No Detox / Maestro setup exists. Adding it is a separate effort.
   - For now, mobile is validated via manual testing only.

### Manual test plan (executed after implementation)

This is the immediate, non-automated validation — same style as `001-forgot-password/tasks.md` cross-platform test section.

| # | Platform | Test | Expected |
|---|---|---|---|
| 1 | Web | Go to `/login?mode=register`, fill form with mismatched passwords, submit | Toast error, no redirect, `signUp` not called |
| 2 | Web | Fill with invalid email, submit | Toast error "Correo electrónico inválido" |
| 3 | Web | Fill with valid email + password ≥ 8 + matching confirm, submit | Redirected to `/login/check-email` |
| 4 | Web | Check-email page shows "Revisa tu correo" + resend button | Resend button present; clicking it sends another email |
| 5 | Web | Open confirmation email, click link | Browser navigates to `/auth/callback?code=...` → exchanges code → redirects to `/welcome` |
| 6 | Web | On `/welcome`, click "Comenzar" | `profiles.welcome` set to `"true"`, redirected to `/app/home` |
| 7 | Web | Register again with same email (new browser, after signout) | `signUp` success, go through check-email → callback → `/welcome` (welcome flag cleared if using new email) or `/app/home` (if same user, flag already set) |
| 8 | Web | Use an expired/invalid confirmation link | Callback page shows "Enlace inválido o expirado" + button to `/login?mode=register` |
| 9 | Web | After registration + confirmation, sign out, sign back in | Routed to `/app/home` (welcome flag already set, skip onboarding) |
| 10 | Mobile | Go to `/signUp`, fill form, submit | `signUp` called with `emailRedirectTo: "rumbo://auth/callback"`, redirected to `/checkEmail` |
| 11 | Mobile | Open confirmation email, click link | `rumbo://auth/callback` deep link → `_layout.js` → `router.replace("/")` → `index.js` session check → `/welcome` |
| 12 | Mobile | On `/welcome`, click "Comenzar" | `profiles.welcome` set, redirected to `/(app)/accounts/` |
| 13 | Mobile | Regression: forgot-password flow still works | `rumbo://update-password` still routes to `/updatePassword` |
| 14 | Both | Verify Supabase dashboard allow-list includes all 3 redirect URLs | `rumbo://auth/callback`, `https://rumbo-ten.vercel.app/auth/callback`, `http://localhost:3000/auth/callback` |

## Spec & docs

- [x] Fill `spec/features/002-registration/spec.md`.
- [x] Fill `spec/features/002-registration/plan.md`.
- [x] Fill `spec/features/002-registration/tasks.md`.

## Supabase package (`packages/supabase`)

- [ ] Extend `signUp` in `packages/supabase/src/auth.ts` to accept `options?: { emailRedirectTo?: string }`.
- [ ] Keep `detectSessionInUrl: false` unchanged in `packages/supabase/src/client.ts`.

## Supabase dashboard config (manual — not in repo)

- [ ] Auth → URL Configuration → Redirect URLs allow-list: add `https://rumbo-ten.vercel.app/auth/callback`.
- [ ] Auth → URL Configuration → Redirect URLs allow-list: add `http://localhost:3000/auth/callback`.
- [ ] Verify `rumbo://auth/callback` is already in the allow-list (or add it).
- [ ] Auth → Email Templates → Confirm signup: verify the template is active and uses `{{ .ConfirmationURL }}` (embeds the `emailRedirectTo`). Optionally customize with Rumbo branding.

## Web app — registration form (`apps/web/src/app/login/subpage.tsx`)

- [ ] Refactor form to `react-hook-form` + `zod` + shadcn `<Form>` (matching `forgot-password/page.tsx`).
- [ ] Zod schema: email (required + valid), password (min 8), confirmPassword (must match password — refine).
- [ ] In register mode: call `signUp(email, password, { emailRedirectTo: window.location.origin + "/auth/callback" })`.
- [ ] In login mode: call `signIn(email, password)` (unchanged behavior).
- [ ] On `signUp` error → `toast.error(error.message)`, do NOT redirect.
- [ ] On `signUp` success with `session: null` → `router.push("/login/check-email")`.
- [ ] On `signUp` success with `session` → `checkWelcomeSeen()` → route to `/welcome` or `/app/home`.
- [ ] On `signIn` success → `checkWelcomeSeen()` → route to `/welcome` or `/app/home`.
- [ ] Store the registered email in `sessionStorage` before redirecting to check-email (for resend).
- [ ] Fix typo: "Correl electrónico" → "Correo electrónico".

## Web app — check-email page (`apps/web/src/app/login/check-email/page.tsx`)

- [ ] Create the route with a `<Card>` (MailCheck icon, "Revisa tu correo" title, Spanish copy).
- [ ] Read email from `sessionStorage`; if present, show "Reenviar enlace" button.
- [ ] Resend button calls `supabase.auth.resend({ type: "signup", email })`.
- [ ] "Ir al inicio de sesión" button → `/login?mode=login`.

## Web app — auth callback (`apps/web/src/app/auth/callback/`)

- [ ] Create `page.tsx` (server wrapper with `connection()`).
- [ ] Create `callback-form.tsx` ("use client"):
  - [ ] PKCE: `code` from `useSearchParams()` → `exchangeCodeForSession(code)`.
  - [ ] Implicit: parse `#access_token=...&refresh_token=...&type=signup` → `setSession()`.
  - [ ] Fallback: `getSession()` check.
  - [ ] `onAuthStateChange` listener for `SIGNED_IN` / `USER_UPDATED`.
  - [ ] On session established → `checkWelcomeSeen()` → route to `/welcome` or `/app/home`.
  - [ ] Error state: "Enlace inválido o expirado" Card + button to `/login?mode=register`.

## Web app — welcome page (`apps/web/src/app/welcome/page.tsx`)

- [ ] Create the route (public, no authed layout).
- [ ] 3 onboarding step Cards (createAccount, addTransactions, exploreDashboard) — Spanish copy matching mobile `welcome.*` keys.
- [ ] "Comenzar" button → `setWelcomeSeen()` → `router.replace("/app/home")`.

## Web app — welcome helpers (`apps/web/lib/welcomeSeen.ts`)

- [ ] Create `checkWelcomeSeen()` — reads `profiles.welcome`, returns boolean.
- [ ] Create `setWelcomeSeen()` — updates `profiles.welcome` to `"true"` for current user.

## Mobile app (`apps/mobile`)

- [ ] `apps/mobile/app/signUp.js:90-96`: pass `options: { emailRedirectTo: "rumbo://auth/callback" }` to `supabase.auth.signUp`.
- [ ] Fix latent bug: if `session` is returned from `signUp` (non-null), route to `/welcome` or `/(app)/` instead of staying on the signUp screen.

## Quality gates

- [ ] `pnpm run lint --filter=web` passes.
- [ ] `pnpm run check-types --filter=web` passes.
- [ ] `pnpm run build --filter=web` passes (all new routes: `/login/check-email`, `/auth/callback`, `/welcome`).
- [ ] `expo lint` (mobile) passes.
- [ ] `pnpm --filter @repo/retirement-plan-calculation test` still passes (no regression in the only tested package).

## Cross-platform manual test (final validation)

- [ ] Run all 14 manual tests from the Testing section above.
- [ ] Web → register → email → click link → `/auth/callback` → `/welcome` → "Comenzar" → `/app/home`.
- [ ] Mobile → register → email → click link → `rumbo://auth/callback` → `/` → `/welcome` → "Comenzar" → `/(app)/accounts/`.
- [ ] Logout → login (web) → goes directly to `/app/home` (welcome flag set, onboarding skipped).
- [ ] Expired/invalid confirmation link (web) → error page with back-to-register button.

## Roadmap update

- [ ] After all tasks complete, move this feature to "Done" in `spec/constitution/roadmap.md`.