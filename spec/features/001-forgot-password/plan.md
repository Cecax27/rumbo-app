# 001 - Forgot password

## Approach

Functionality to allow users to reset their password if they have lost it. This will be done using Supabase's authentication functions. One challenge is enabling this function from both the web and the mobile app, so it must redirect correctly.

The **mobile** side is already implemented and working (apps/mobile). This document focuses on bringing the same feature to the **web** side (apps/web) and on the cross-platform verification step.

### Mobile reference flow (already done — do not modify)

1. `/login` → `<Link href="/forgotPassword">` in `apps/mobile/components/auth.jsx:82`.
2. `/forgotPassword` (`apps/mobile/app/forgotPassword.js`) → calls `resetPassword(email)` from `apps/mobile/lib/supabase/auth.js:19`, which calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'rumbo://update-password' })`.
3. `/checkEmail` → confirmation screen after the email is sent.
4. Email link `rumbo://update-password` opens the app → Supabase client parses the recovery token → emits `PASSWORD_RECOVERY` → `apps/mobile/app/_layout.js:46` replaces to `/updatePassword`.
5. `/updatePassword` (`apps/mobile/app/updatePassword.js`) → `updateUserPassword(password)` → `supabase.auth.updateUser({ password })` → success alert → `router.replace("/")`.

## Implementation

### Web scope (apps/web)

Two new public routes under `apps/web/src/app/`, plus wiring the existing login stub button to the request page.

1. **Login page wiring**
   - `apps/web/src/app/login/subpage.tsx:77-81` currently has a dead `<Button href="" ...>Olvidé mi contraseña</Button>`.
   - Change `href` to `href="/forgot-password"`.

2. **Request page — `/forgot-password`** (`apps/web/src/app/forgot-password/page.tsx`)
   - Public route (no layout beyond root `src/app/layout.tsx`).
   - Client component. shadcn/ui `<Card>` + `<Form>` (react-hook-form + zod) following the pattern in `apps/web/src/app/app/transactions/income-form.tsx`.
   - On submit: call `resetPasswordForEmail(email, { redirectTo })` (new helper, see Supabase package changes below).
     - `redirectTo` resolution:
       - Production: `https://rumbo-ten.vercel.app/reset-password`
       - Development/local: `http://localhost:3000/reset-password`
     - Determine via `process.env.NODE_ENV` (or `window.location.origin`) at call time. Preferred: `window.location.origin + "/reset-password"` so it always matches the allow-listed origin the user is on.
   - Security: per acceptance criterion, **always** show the same generic success message regardless of whether the email exists. Do not surface Supabase errors that reveal account existence; log them only.
   - On success: redirect to `/forgot-password/check-email` (or inline "check your email" state); do not auto-login.
   - On hard failure (network): `toast.error(...)` via `sonner`.
   - Strings hardcoded inline in Spanish (web has no i18n infra, matches current convention).

3. **Check email page — `/forgot-password/check-email`** (`apps/web/src/app/forgot-password/check-email/page.tsx`)
   - Simple confirmation page ("Revisa tu correo…") with a button back to `/login`.
   - Mirrors mobile `/checkEmail`.

4. **Reset page — `/reset-password`** (`apps/web/src/app/reset-password/page.tsx`)
   - Public route. Client component.
   - Recovery handling: the shared Supabase client sets `detectSessionInUrl: false` (`packages/supabase/src/client.ts:10`), so the page must manually exchange the recovery code:
     - On mount, read `code` from `useSearchParams()`.
     - Call `supabase.auth.exchangeCodeForSession({ code })` (PKCE flow) to establish the recovery session.
     - Also subscribe to `onAuthStateChange` and route on `PASSWORD_RECOVERY` as a fallback (mirrors mobile `apps/mobile/app/_layout.js:46`).
     - If `code` is missing and no `PASSWORD_RECOVERY` fires, show an invalid/expired-link error with a button back to `/forgot-password`.
   - New password form: react-hook-form + zod, two fields (password + confirm). Min length 8 (matches mobile `apps/mobile/app/updatePassword.js`). Validation messages inline, Spanish.
   - On submit: call `updateUserPassword(password)` (new helper).
   - On success: `toast.success(...)`, then `router.push("/login")`.
   - On error: `toast.error(...)` and keep the user on the page to retry.

### Supabase package changes (packages/supabase)

- `packages/supabase/src/auth.ts` currently exposes only `signUp`, `signIn`, `getSession`, `signOut`. Add two helpers mirroring the mobile ones (`apps/mobile/lib/supabase/auth.js:19-27`):
  - `resetPasswordForEmail(email, { redirectTo })` → wraps `supabase.auth.resetPasswordForEmail`.
  - `updateUserPassword(password)` → wraps `supabase.auth.updateUser({ password })`.
- Do **not** change `detectSessionInUrl` on the shared client (out of reach). `exchangeCodeForSession` is a method call, not a client-config change, so it works with the current client.

### Supabase dashboard configuration (manual, outside repo)

' config is not in version control. Required manual steps:
- **Auth → URL Configuration → Redirect URLs allow-list**: add
  - `https://rumbo-ten.vercel.app/reset-password`
  - `http://localhost:3000/reset-password`
  - (keep the existing `rumbo://update-password` for mobile)
- **Auth → Email Templates → Reset Password**: replace the default template with the HTML in `spec/features/001-forgot-password/email-template.html`. The template must use `{{ .RedirectTo }}` for the button/link so Supabase substitutes the platform-appropriate redirect URL (web origin for web requests, `rumbo://update-password` for mobile requests).

### Email templates

- `spec/features/001-forgot-password/email-template.html` — brand-aligned Rumbo HTML email. Spanish copy matching mobile strings (`forgot-password.*` keys in `apps/mobile/assets/locales/{en,es}.json`). Single CTA button linking to `{{ .RedirectTo }}`, with a plain-text fallback link below it, and a "didn't request this change" footer line. Paste into Supabase dashboard → Auth → Email Templates → Reset Password.
- `spec/features/001-forgot-password/email-template-password-changed.html` — notification sent after the password is successfully updated. No CTA; informational only. Includes security advisory ("if you didn't make this change, contact us"). Supabase Auth does not send this automatically — it requires a manual trigger (edge function, database webhook, or calling `supabase.auth.admin` / an email service after `updateUser`).

## Decisions

- **Recovery URL handling on web:** parse `?code=` and call `exchangeCodeForSession` on `/reset-password`, with an `onAuthStateChange` → `PASSWORD_RECOVERY` fallback. Rationale: keeps the shared `detectSessionInUrl: false` client config unchanged (lowest blast radius), and mirrors the mobile event-driven pattern (`apps/mobile/app/_layout.js:46`).
- **Redirect origin:** `window.location.origin + "/reset-password"` at call time, with the production allow-list entry `https://rumbo-ten.vercel.app/reset-password` and dev entry `http://localhost:3000/reset-password`.
- **No `@supabase/ssr` / no middleware** introduced (explicitly out of reach). Web stays client-side only, consistent with `spec/constitution/tech-stack.md:66`.
- **Web i18n:** hardcoded Spanish inline. Web has no `react-i18next` infra today (`apps/web/src/contexts/TransactionsContext.tsx:5` is the only `i18n` use, just for `i18n.language`). Wiring full web i18n is deferred to a separate feature.
- **Forms:** use the dominant web pattern (react-hook-form + zod + `@hookform/resolvers/zod` + shadcn `<Form>`/`<FormField>`/`<Input>`/`<Button>`), reference `apps/web/src/app/app/transactions/income-form.tsx`. Success/error feedback via `sonner` (toaster already mounted in `apps/web/src/app/layout.tsx:41`).
- **Security (anti-enumeration):** the request page returns the same generic success message whether or not the email exists. Only network/hard errors are surfaced (via `sonner`), never "user not found".

## Risks

- Wrong redirection: if there is a problem with it, the user never will be able to change their password. Mitigations: allow-list both web origins in the dashboard; use `window.location.origin` so dev and prod never cross; the email template's `{{ .RedirectTo }}` is platform-aware.
- **Expired/already-used recovery code:** Supabase recovery links are single-use and time-boxed. The reset page must handle `exchangeCodeForSession` rejection gracefully (clear message + link back to `/forgot-password`).
- **`detectSessionInUrl: false` quirk:** if a future change flips this on for web, the manual `exchangeCodeForSession` could double-process. Mitigation: gate the manual exchange on "code present AND no session yet", and treat `PASSWORD_RECOVERY` as the source of truth.
- **Mobile regression:** the email template change is shared with mobile. The `{{ .RedirectTo }}` substitution and copy must be validated on both platforms in the final cross-platform test task.
- **Hardcoded URL/keys:** the Supabase URL/anon key are hardcoded (`packages/supabase/src/client.ts:3-4`, `apps/mobile/lib/supabase/client.js:6-7`). Not changed by this feature; flagged in `tech-stack.md:87` as a separate hard limit.