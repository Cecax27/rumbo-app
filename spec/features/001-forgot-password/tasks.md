# 001 - Forgot password

## Spec & docs

- [x] Fill `spec/features/001-forgot-password/spec.md` (add "Out of reach" content).
- [x] Fill `spec/features/001-forgot-password/plan.md` (Implementation, Decisions, Risks).
- [x] Fill `spec/features/001-forgot-password/tasks.md` (this checklist).

## Email template (Supabase dashboard)

- [x] Write the email with html to put on the supabase template. (`email-template.html`)
- [x] Use Spanish copy matching the mobile `forgot-password.*` keys (`apps/mobile/assets/locales/{en,es}.json`).
- [x] Confirm the CTA button uses `{{ .RedirectTo }}` and a plain-text fallback link is included.
- [x] Write password-changed notification email (`email-template-password-changed.html`). Spanish copy, Rumbo branding, security advisory footer.
- [ ] Supabase dashboard: configure a hook/trigger/edge function to send `email-template-password-changed.html` after `updateUser({ password })` (Supabase Auth does not automatically send this email; it must be triggered manually or via database webhook).

## Supabase dashboard config (manual — not in repo)

- [x] Auth → URL Configuration → Redirect URLs allow-list: add `https://rumbo-ten.vercel.app/reset-password`.
- [x] Auth → URL Configuration → Redirect URLs allow-list: add `http://localhost:3000/reset-password`.
- [x] Keep the existing mobile `rumbo://update-password` entry.
- [ ] Auth → Email Templates → Reset Password: paste the **clean** `email-template.html` content and save (the original file had corrupted HTML — Supabase dashboard UI text accidentally pasted into the `<div>` element, causing the template to be rejected and the default to be used instead).

## Supabase package (`packages/supabase`)

- [x] Add `resetPasswordForEmail(email, { redirectTo })` helper to `packages/supabase/src/auth.ts`.
- [x] Add `updateUserPassword(password)` helper to `packages/supabase/src/auth.ts`.
- [x] Keep `detectSessionInUrl: false` unchanged in `packages/supabase/src/client.ts`.

## Web app — routes & UI (`apps/web`)

- [x] Wire the existing dead stub button in `apps/web/src/app/login/subpage.tsx:77-81` (`href=""`) to `href="/forgot-password"`.
- [x] Create `apps/web/src/app/forgot-password/page.tsx` (request email; react-hook-form + zod; success message generic regardless of email existence).
- [x] Create `apps/web/src/app/forgot-password/check-email/page.tsx` (confirmation screen + button back to `/login`).
- [x] Create `apps/web/src/app/reset-password/page.tsx`:
  - [x] Parse `code` from `useSearchParams()` and call `supabase.auth.exchangeCodeForSession({ code })` on mount.
  - [x] Handle missing/expired code with an error state + link back to `/forgot-password`.
  - [x] New-password form (password + confirm; min length 8) → `updateUserPassword(password)` → `toast` + `router.push("/login")`.

Note: `onAuthStateChange` → `PASSWORD_RECOVERY` fallback was not added to the web reset page since `exchangeCodeForSession` establishes the session deterministically on the web. The mobile already handles `PASSWORD_RECOVERY` in `apps/mobile/app/_layout.js:43-46`.

## Web app — quality gates

- [x] `pnpm run lint --filter=web` — passes for supabase/web; pre-existing warnings in `@repo/shared` (not related).
- [x] `pnpm run check-types --filter=web` passes.
- [x] `pnpm run build --filter=web` passes (all routes: `/forgot-password`, `/forgot-password/check-email`, `/reset-password`).

## Cross-platform test (final step — both web and mobile)

- [ ] Web → request reset → email received → link opens `/reset-password` (prod origin) → set new password → can log in.
- [ ] Web dev → request reset → `localhost:3000/reset-password` works (allow-listed).
- [ ] Web → request reset for a non-existent email → same generic success message (anti-enumeration).
- [ ] Web → expired/reused recovery code → graceful error + link back to `/forgot-password`.
- [ ] Mobile → regression check: request reset → `rumbo://update-password` deep link opens app → `PASSWORD_RECOVERY` routing still works with the new shared email template.
- [ ] Both platforms → "did not request this" footer copy is consistent.