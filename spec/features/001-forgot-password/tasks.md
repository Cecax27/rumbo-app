# 001 - Forgot password

## Spec & docs

- [ ] Fill `spec/features/001-forgot-password/spec.md` (add "Out of reach" content).
- [ ] Fill `spec/features/001-forgot-password/plan.md` (Implementation, Decisions, Risks).
- [ ] Fill `spec/features/001-forgot-password/tasks.md` (this checklist).

## Email template (Supabase dashboard)

- [x] Write the email with html to put on the supabase template. (`email-template.html`)
- [ ] Use Spanish copy matching the mobile `forgot-password.*` keys (`apps/mobile/assets/locales/{en,es}.json`).
- [ ] Confirm the CTA button uses `{{ .RedirectTo }}` and a plain-text fallback link is included.

## Supabase dashboard config (manual — not in repo)

- [x] Auth → URL Configuration → Redirect URLs allow-list: add `https://rumbo-ten.vercel.app/reset-password`.
- [x] Auth → URL Configuration → Redirect URLs allow-list: add `http://localhost:3000/reset-password`.
- [x] Keep the existing mobile `rumbo://update-password` entry.
- [x] Auth → Email Templates → Reset Password: paste the `email-template.html` content and save.

## Supabase package (`packages/supabase`)

- [ ] Add `resetPasswordForEmail(email, { redirectTo })` helper to `packages/supabase/src/auth.ts`.
- [ ] Add `updateUserPassword(password)` helper to `packages/supabase/src/auth.ts`.
- [ ] Keep `detectSessionInUrl: false` unchanged in `packages/supabase/src/client.ts`.

## Web app — routes & UI (`apps/web`)

- [ ] Wire the existing dead stub button in `apps/web/src/app/login/subpage.tsx:77-81` (`href=""`) to `href="/forgot-password"`.
- [ ] Create `apps/web/src/app/forgot-password/page.tsx` (request email; react-hook-form + zod; success message generic regardless of email existence).
- [ ] Create `apps/web/src/app/forgot-password/check-email/page.tsx` (confirmation screen + button back to `/login`).
- [ ] Create `apps/web/src/app/reset-password/page.tsx`:
  - [ ] Parse `code` from `useSearchParams()` and call `supabase.auth.exchangeCodeForSession({ code })` on mount.
  - [ ] Subscribe to `onAuthStateChange` and route on `PASSWORD_RECOVERY` as a fallback.
  - [ ] Handle missing/expired code with an error state + link back to `/forgot-password`.
  - [ ] New-password form (password + confirm; min length 8) → `updateUserPassword(password)` → `toast` + `router.push("/login")`.

## Web app — quality gates

- [ ] `pnpm run lint --filter=web` passes.
- [ ] `pnpm run check-types --filter=web` passes.
- [ ] `pnpm run build --filter=web` (or `pnpm run build`) passes.

## Cross-platform test (final step — both web and mobile)

- [ ] Web → request reset → email received → link opens `/reset-password` (prod origin) → set new password → can log in.
- [ ] Web dev → request reset → `localhost:3000/reset-password` works (allow-listed).
- [ ] Web → request reset for a non-existent email → same generic success message (anti-enumeration).
- [ ] Web → expired/reused recovery code → graceful error + link back to `/forgot-password`.
- [ ] Mobile → regression check: request reset → `rumbo://update-password` deep link opens app → `PASSWORD_RECOVERY` routing still works with the new shared email template.
- [ ] Both platforms → "did not request this" footer copy is consistent.