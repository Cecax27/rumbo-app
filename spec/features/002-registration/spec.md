# 002 - Registration

**Status:** Planning

## What

A complete registration flow with email confirmation. The user registers on either the web or mobile app, receives a confirmation email, clicks the link, and is redirected back to the correct platform where their account is confirmed, they are automatically logged in, and greeted on a welcome page.

## Why

Registration is currently broken — after `signUp` the user is immediately pushed to the dashboard (`/app/home`) even though their account is not confirmed. No confirmation email is expected by the user, no feedback is given, and there is no redirect handling for the email link. The user cannot complete a real registration.

Additionally, no `emailRedirectTo` is passed to `signUp` on either platform, so Supabase falls back to the project Site URL (`rumbo://auth/callback`) for the confirmation link. This means confirmation links always deep-link the mobile app regardless of which platform the user registered on — a web-only user who clicks the email on their phone is taken to a mobile app they may not have installed.

## Acceptance criteria

- [ ] On the web registration form, email, password, and confirm-password are all validated client-side before submission. The confirm-password field value must match the password field.
- [ ] The `signUp` call passes an `emailRedirectTo` pointing to the correct platform: `https://[origin]/auth/callback` for web, `rumbo://auth/callback` for mobile.
- [ ] After a successful `signUp` where no session is returned (email confirmation required — the Supabase project default), the user sees a confirmation message on a "check your email" page. The user is NOT redirected to the dashboard.
- [ ] After a successful `signUp` where a session IS returned immediately (email confirmation disabled or already confirmed), the user is redirected to the welcome page (first time) or the dashboard, same as login.
- [ ] `signUp` errors are displayed to the user (toast on web, Alert on mobile), not only logged to the console.
- [ ] The confirmation email contains a link that redirects to the correct platform's callback URL.
- [ ] **Web callback** (`/auth/callback`): the page exchanges the code (PKCE) or hash fragment (implicit) for a session, then redirects the user to `/welcome` if they have not seen onboarding, or `/app/home` if they have.
- [ ] **Mobile callback**: the existing `rumbo://auth/callback` deep-link handler in `_layout.js` routes the user to `/` where `index.js` checks the session and routes to `/welcome` or `/(app)/`.
- [ ] After the email is confirmed and the session is established, the user lands on a welcome/onboarding page. On web, a new `/welcome` page mirrors the mobile `welcome.js` onboarding content (3 steps + "Comenzar" button). On mobile, the existing `/welcome` page is used.
- [ ] The welcome page sets the `profiles.welcome` flag so subsequent logins skip onboarding and go directly to the dashboard.
- [ ] If the email confirmation link is invalid, expired, or already used, the web callback page shows an error message with a link back to the registration page.
- [ ] The registration form displays a "Resend confirmation email" option on the check-email page (web) or a path to re-trigger (mobile).

## Out of reach

- Full web i18n / `react-i18next` integration (web will hardcode Spanish strings inline, consistent with the existing `forgot-password` and `login` pages).
- Introduction of `@supabase/ssr` and cookie-based sessions on web — stays client-side.
- Auth `middleware.ts` route guard on web — explicitly deferred (matches `001-forgot-password` decision).
- Changes to the shared Supabase client config (`detectSessionInUrl` stays `false`) — the web callback page manually exchanges the code, same approach as `reset-password`.
- Refactoring the hardcoded Supabase URL/anon key to env vars (separate "hard limit" tracked in `tech-stack.md`).
- Google / Facebook OAuth registration (roadmap V0.8).
- Changing the Supabase project's email confirmation setting (currently enabled) — this is a dashboard config, not code.
- Mobile UI redesign of `signUp.js` / `checkEmail.js` (already exist and work) — only the `emailRedirectTo` parameter and error handling are touched.
- Merging the mobile and shared Supabase clients into one.
- Deduplicating the `welcomeSeen` logic across `apps/mobile/lib/welcomeSeen.js` and `packages/shared/src/welcomeSeen.js` (separate cleanup).