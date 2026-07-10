# 002 - Registration

## Approach

Implement email-confirmation registration across web and mobile, following the patterns established by `001-forgot-password`. The mobile side already has the pieces (`signUp.js`, `checkEmail.js`, `_layout.js` deep-link handler, `welcome.js`) but is missing the `emailRedirectTo` parameter and proper error display. The web side is missing almost everything: form validation, a confirmation page, a callback handler, and a welcome page.

### Reference: forgot-password pattern

The `001-forgot-password` feature established the following patterns that this feature mirrors:

| Concern | Forgot-password solution | Registration equivalent |
|---|---|---|
| Redirect URL | `window.location.origin + "/reset-password"` (web), `rumbo://update-password` (mobile) | `window.location.origin + "/auth/callback"` (web), `rumbo://auth/callback` (mobile) |
| Session recovery | PKCE `?code=` → `exchangeCodeForSession`, implicit hash fragment → `setSession`, `PASSWORD_RECOVERY` event listener | PKCE `?code=` → `exchangeCodeForSession`, implicit hash fragment → `setSession`, `SIGNED_IN` / `USER_UPDATED` event listener |
| Confirmation page | `/forgot-password/check-email` (Card, anti-enumeration copy, buttons back) | `/login/check-email` (same Card pattern, buttons back to register) |
| Supabase dashboard | Redirect URLs allow-list entries added manually | Add `/auth/callback` entries to allow-list (see below) |
| Email template | `email-template.html` pasted into Supabase dashboard → Auth → Email Templates | Use the **Confirm signup** template (already has a default; may customize for branding) |
| `detectSessionInUrl: false` | Manual code exchange in the reset page | Manual code exchange in the callback page |
| Feedback | `sonner` toaster (already mounted in `apps/web/src/app/layout.tsx:41`) | Same `sonner` toaster |
| Forms | react-hook-form + zod + `@hookform/resolvers/zod` + shadcn `<Form>` | Same stack (already in `apps/web/package.json`) |

## Implementation

### 1. Supabase package (`packages/supabase`)

**`packages/supabase/src/auth.ts`** — extend `signUp` to accept an optional `emailRedirectTo`:

```ts
export const signUp = async (
  email: string,
  password: string,
  options?: { emailRedirectTo?: string }
) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: options ?? {},
  })
}
```

Keep backward compatibility — existing callers (mobile `lib/supabase/auth.js` has its own `signUp`, and `subpage.tsx` currently calls the shared one with two args) still work. The mobile `lib/supabase/auth.js` is a separate file and is NOT changed by this (mobile `signUp.js` calls `supabase.auth.signUp` directly, not the helper).

No other changes to `client.ts` (`detectSessionInUrl: false` stays).

### 2. Web registration form (`apps/web/src/app/login/subpage.tsx`)

Current state (after the prior fix in this session): `handleLogin` picks `signUp` vs `signIn` based on `mode`, but:

- No `emailRedirectTo` passed to `signUp`.
- Confirm-password field rendered (lines 82-96) but **never read or validated**.
- No client-side validation (email format, password length, match).
- Errors only `console.error`'d — no user feedback.
- On success always pushes to `/app/home`, ignoring whether the session exists.

Changes:

1. **Pass `emailRedirectTo`**: `signUp(email, password, { emailRedirectTo: window.location.origin + "/auth/callback" })`.
2. **Validate confirm-password**: in register mode, read the confirm-password field from the form. If it doesn't match password, show `toast.error("Las contraseñas no coinciden")` and return.
3. **Validate email and password**: basic checks — email non-empty + valid format (regex or zod), password min 8 chars (matches mobile `signUp.js:72-78`). On failure, `toast.error(...)` with the specific message.
4. **Handle `signUp` response**:
   - If `error` → `toast.error(error.message)` and return. Do NOT redirect.
   - If `data.session` exists (immediate session) → check `welcome` flag and route to `/welcome` or `/app/home` (same as login).
   - If `data.session` is null (email confirmation required — the normal case) → `router.push("/login/check-email")`. Do NOT push to `/app/home`.
5. **Handle `signIn` response** (login mode, unchanged behavior): on success → check `welcome` flag → route to `/welcome` or `/app/home`.

**Form upgrade option (recommended)**: refactor the form to use `react-hook-form` + `zod` + shadcn `<Form>` (matching `forgot-password/page.tsx`) instead of the current uncontrolled inputs. This gives built-in validation, error messages inline, and consistency with the rest of the web app. The zod schema:

```ts
const registerSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})
```

### 3. Web check-email page (`apps/web/src/app/login/check-email/page.tsx`)

New route. Mirrors `forgot-password/check-email/page.tsx`:

- `<Card>` with `MailCheck` icon, title "Revisa tu correo", subtitle "Te enviamos un correo de confirmación. Ábrelo para confirmar tu cuenta.", help "¿No lo encontraste? Revisa tu spam."
- Buttons:
  - "Ir al inicio de sesión" → `/login?mode=login`
  - "Reenviar enlace" → triggers `supabase.auth.resend({ type: 'signup', email })` — but we need the email. Store it in the form's submit handler (pass via router state or a query param). Alternative: store in `sessionStorage` before redirecting to check-email. **Decision: use `sessionStorage`** (simple, no URL exposure of email, matches SPA patterns). Read it on the check-email page; if missing, hide the resend button.

### 4. Web auth callback (`apps/web/src/app/auth/callback/page.tsx` + `auth/callback/callback-form.tsx`)

New route. This is the web equivalent of mobile's `rumbo://auth/callback` deep-link handler. It's the destination the Supabase confirmation email redirects to (via `emailRedirectTo`).

Structure mirrors `reset-password/reset-password-form.tsx`:

- **Server page** (`auth/callback/page.tsx`): `import { connection } from "next/server"; await connection(); return <CallbackForm />;` — forces dynamic rendering (searchParams read in client form, same pattern as reset-password).
- **Client form** (`auth/callback/callback-form.tsx`): `"use client"` component.
  - On mount, read `code` from `useSearchParams()`.
  - **Path 1 — PKCE (primary)**: if `code` present → `supabase.auth.exchangeCodeForSession(code)`. On success → session established → check welcome flag → route.
  - **Path 2 — Implicit hash fragment (fallback)**: if `window.location.hash` has `#access_token=...&refresh_token=...&type=signup` → `supabase.auth.setSession({ access_token, refresh_token })`.
  - **Path 3 — Existing session**: `supabase.auth.getSession()` — maybe already established by the time the page mounts.
  - **Path 4 — Event listener**: `onAuthStateChange` → on `SIGNED_IN` or `USER_UPDATED` → route.
  - **Error state**: if nothing works → show "Enlace inválido o expirado" Card with button back to `/login?mode=register`.
  - **Routing after session**: `checkWelcomeSeen()` → if true `router.replace("/app/home")`, else `router.replace("/welcome")`.

### 5. Web welcome page (`apps/web/src/app/welcome/page.tsx`)

New route. Mirrors mobile `welcome.js`:

- 3 onboarding steps (createAccount, addTransactions, exploreDashboard) using Card components.
- "Comenzar" button → calls `setWelcomeSeen()` → `router.replace("/app/home")` (web dashboard; mobile goes to `/(app)/accounts/` — web doesn't have an accounts-first convention, dashboard is fine).
- Spanish copy hardcoded inline (matches web convention; no i18n).

### 6. Web welcome helpers (`apps/web/lib/welcomeSeen.ts`)

New file. Web-side mirror of `apps/mobile/lib/welcomeSeen.js`:

```ts
import { supabase } from "@repo/supabase/client"

export const checkWelcomeSeen = async (): Promise<boolean> => {
  const { data, error } = await supabase.from("profiles").select("welcome").single()
  if (error || !data) return false
  return data.welcome === true || data.welcome === "true"
}

export const setWelcomeSeen = async (): Promise<void> => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return
  await supabase.from("profiles").update({ welcome: "true" }).eq("id", user.id)
}
```

Imported by: `subpage.tsx` (after login/signup), `callback-form.tsx` (after email confirmation), `welcome/page.tsx` (on "Comenzar").

Note: `@repo/supabase` exports raw source (`"./*": "./src/*.ts"`), so `@repo/supabase/client` resolves to `packages/supabase/src/client.ts`. The web welcome helper imports the same `supabase` client already used by `reset-password-form.tsx`.

### 7. Mobile changes (`apps/mobile`)

Minimal — the mobile flow already works end-to-end. Only two changes:

1. **`apps/mobile/app/signUp.js:90-96`**: pass `emailRedirectTo`:
   ```js
   const { data: { session }, error } = await supabase.auth.signUp({
     email,
     password,
     options: { emailRedirectTo: "rumbo://auth/callback" },
   });
   ```
   This makes the redirect explicit and future-proof (if the Site URL ever changes, the mobile redirect still works).

2. **Error display**: already uses `Alert.alert(error.message)` — sufficient. No change needed.

No changes to `_layout.js`, `index.js`, `checkEmail.js`, or `welcome.js` — the existing deep-link → `/` → session check → welcome/app routing already handles the confirmed-session case.

**Latent bug noted (not fixed in this scope)**: `signUp.js:108` — if `session` IS returned immediately, `router.replace("checkEmail")` is not called but there's no redirect to `/(app)/` or `/welcome` either (the user stays on the signUp screen). The `onAuthStateChange` in `index.js:56` only updates state, doesn't route; the `Linking` listener in `_layout.js:48` only fires for deep-link URLs, not for in-app `signUp`. This is a separate bug — not fixing here unless the user requests it.

### 8. Supabase dashboard configuration (manual — not in repo)

Following the `001-forgot-password` pattern, these are manual steps in the Supabase dashboard:

- **Auth → URL Configuration → Redirect URLs allow-list**: add
  - `https://rumbo-ten.vercel.app/auth/callback` (production web)
  - `http://localhost:3000/auth/callback` (dev web)
  - `rumbo://auth/callback` (mobile — likely already present since it's the Site URL fallback)
- **Auth → Email Templates → Confirm signup**: the default Supabase template uses `{{ .ConfirmationURL }}` which embeds the `emailRedirectTo`. Verify the template is active. Optionally customize it with the same Rumbo branding as the reset-password template (`email-template.html`) — but this is cosmetic and can be deferred.
- **Auth → Email Templates → Confirm signup** must use the PKCE-compatible template if the project uses PKCE (which it does — the `reset-password` flow already handles PKCE `?code=`). The default template should work; just verify the link resolves to `/auth/callback?code=...` not `#access_token=...`.

### 9. Supabase `resend` for the check-email "Reenviar" button

The web check-email page needs to re-send the confirmation email. Supabase supports this:

```ts
await supabase.auth.resend({ type: "signup", email })
```

The email is read from `sessionStorage` (stored by the registration form before redirecting to check-email). No new package helper needed — import `supabase` directly from `@repo/supabase/client` in the check-email page component.

## Decisions

- **Redirect origin (web)**: `window.location.origin + "/auth/callback"` at call time — always matches the origin the user is on. Production allow-list: `https://rumbo-ten.vercel.app/auth/callback`. Dev: `http://localhost:3000/auth/callback`. Same approach as `reset-password` (`window.location.origin + "/reset-password"`).
- **Redirect origin (mobile)**: `rumbo://auth/callback` — already handled by `_layout.js:48-51` (`url.includes("/auth/callback") → router.replace("/")`). Making it explicit in `signUp` is belt-and-suspenders (the project Site URL is also `rumbo://auth/callback`).
- **Cross-platform email link issue**: the confirmation email is sent with a single `emailRedirectTo`. If a user registers on web but opens the email on a device where `rumbo://` is registered (mobile app installed), the link would try to open the mobile app. This is the same limitation as forgot-password and is accepted as out-of-reach. The mitigation: web `/auth/callback` and mobile `rumbo://auth/callback` are independent routes; if the mobile app handles the link, it completes confirmation there and the user can subsequently log in on web.
- **Session detection after signUp**: Supabase returns `{ data: { session }, error }` from `signUp`. If `session` is `null`, email confirmation is required — route to check-email. If `session` is non-null, the user is immediately logged in — route to welcome/dashboard. This is the same branching mobile `signUp.js:91-108` already uses.
- **Web callback session recovery**: three-path approach (PKCE `?code=`, implicit hash, existing session) + `onAuthStateChange` listener for `SIGNED_IN`/`USER_UPDATED`. Mirrors `reset-password-form.tsx` exactly. Keeps `detectSessionInUrl: false` unchanged.
- **Welcome flag on web**: read/write the `profiles.welcome` column via the shared `supabase` client. On web, there's currently no welcome flow at all — adding it brings parity with mobile. The welcome page is a public route (`/welcome`), not under `/app/*`, so it doesn't require the authed layout.
- **Web forms**: use `react-hook-form` + `zod` + shadcn `<Form>`, matching `forgot-password/page.tsx`. This replaces the current uncontrolled inputs in `subpage.tsx`. For the login mode, the same form is used with a conditional confirm-password field (hidden when `mode === "login"`).
- **check-email email storage**: `sessionStorage` — available within the tab session, cleared on tab close, doesn't expose the email in the URL. If `sessionStorage` is unavailable (SSR), the resend button is hidden.
- **No new dependencies**: everything needed (`react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, `lucide-react`, shadcn UI components) is already in `apps/web/package.json`.
- **Mobile untouched beyond `signUp.js`**: the mobile registration flow (`signUp.js` → `checkEmail.js` → deep-link → `_layout.js` → `index.js` → `welcome.js`) already works. Only the explicit `emailRedirectTo` is added.

## Risks

- **Supabase Site URL trap**: the project Site URL is set to `rumbo://auth/callback` (confirmed in `001-forgot-password/plan.md` risk section). If GoTrue rejects the `emailRedirectTo` (not in allow-list), it falls back to the Site URL → mobile app. **Mitigation**: ensure `https://rumbo-ten.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` are in the allow-list before testing. The `console.log` of the `emailRedirectTo` value (same pattern as `forgot-password/page.tsx:33`) helps debug.
- **localhost port mismatch**: the forgot-password feature found that `localhost:3001` vs allow-list `localhost:3000` caused GoTrue to reject the URL. The web dev server may run on a different port. **Mitigation**: if the dev server is on port 3001, add that to the allow-list too, or use a tunnel for HTTPS.
- **PKCE vs implicit in the confirmation email**: the Supabase project may emit either `?code=` (PKCE) or `#access_token=...&type=signup` (implicit) in the confirmation link, depending on project settings. The callback page handles both (same 3-path approach as `reset-password-form.tsx`). Verify in testing which format the email link uses.
- **`profiles.welcome` column for web users**: the `profiles` table is created by a trigger on new auth users (standard Supabase pattern). If the trigger doesn't exist or the column is missing, `checkWelcomeSeen`/`setWelcomeSeen` will error. The mobile app already depends on this column existing, so it should be fine — but verify in the Supabase dashboard (Table Editor → `profiles`).
- **Race condition on mobile `signUp` with immediate session**: `signUp.js:108` routes to `checkEmail` only when `!session`. If `session` is returned (email confirmation disabled at some point), there's no redirect — the user stays on the signUp screen. This is a pre-existing bug, worsened by the fact that the `onAuthStateChange` in `index.js:56` doesn't route. **Mitigation in scope**: add a `router.replace("/welcome")` or `/(app)/` branch when `session` is non-null and `signUp` succeeds (mirror the web behavior). Low effort, fixes the latent bug.
- **Expired confirmation code**: Supabase confirmation links are single-use and time-boxed. The callback page must handle `exchangeCodeForSession` rejection gracefully (error Card + link back to register). Same as `reset-password-form.tsx` error handling.
- **Duplicate registration**: if a user re-registers with the same email, Supabase may silently succeed (creating a new user) or error (depending on config). The form should surface the error from `signUp` — already handled by `toast.error(error.message)`.
- **No test infrastructure**: the web and mobile apps have zero tests today. See the Testing section below for the proposed testing approach, but note that adding test infrastructure is a prerequisite for automated testing of this feature.