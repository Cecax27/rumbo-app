# App Foundation

## Feature Name

**App Foundation** — the essential, cross-cutting capabilities that every application must provide before any feature work is meaningful: identity (registration, login, logout, password management), session integrity, error and bug reporting, onboarding, and a repeatable way to verify all of it before each deployment.

---

## Description

This feature defines the minimum viable "spine" of the Rumbo application on both **web** and **mobile**. It covers the standard functions any application is expected to include so that a user can create an account, authenticate, recover access, manage their identity, end their session, and fully remove themselves if they choose — together with the observability and testing practices that guarantee these functions keep working as the product evolves.

From the user's perspective, this feature ensures that:

- A new person can **register** an account with their email and a password, confirm their email address, and **accept the terms and conditions** as part of registration.
- A returning person can **log in** and be taken to the right place.
- An authenticated person can **log out** and return to the entry point.
- An authenticated person can **change their password** without leaving the app, and can **edit their display name**.
- A person who forgets their password can **reset** it through an email flow and choose a new one.
- A person can **delete their account** and all associated data when they no longer wish to use the app.
- When something breaks, the user is **informed in a clear, non-technical, consistent way**, and has a path to **report a problem** to the team.
- On first use, the person is **introduced** to the app through a brief onboarding before reaching the main experience.

Because the application already contains partial implementations of these capabilities, this feature is as much about **defining the correct standard** and **auditing the current implementation against it** as it is about building from scratch. A dedicated audit task reviews the existing code for bad practices, inconsistencies between platforms, and points of failure, producing a written record that drives the corrective work.

This feature also establishes a **pre-deployment testing practice**: a human-readable document, kept in the `docs/` folder, that describes how to manually verify these basic functions before every release. This document is the authority on "is the app safe to ship?" for the foundation.

---

## Problem and Purpose

### The problem

Rumbo already has working-but-uneven implementations of registration, login, logout, password reset, and error handling across two platforms (mobile and web). An audit of the current code reveals the following underlying problems that this feature exists to solve:

1. **No agreed standard.** The essentials exist but were never defined as a coherent set of expected behaviors. Because the standard was never written down, each screen and each platform drifted toward its own interpretation of "correct."

2. **Platform divergence.** Mobile and web implement the same capabilities in different ways, with different validation rules, different error surfaces, different redirect destinations, and different levels of robustness. A user switching between platforms has an inconsistent experience, and a developer maintaining both has two sources of truth.

3. **Inconsistent and sometimes broken error handling.** Errors are surfaced through at least three different mechanisms (native `Alert`, a global snackbar, and web toasts), and in several places errors are silently swallowed (`console.error` only) — including in logout, password reset, and bug reporting itself. A user can experience a failure with no feedback at all.

4. **No verification practice.** There are no tests — automated or documented manual — for any foundational flow. `apps/mobile` and `apps/web` have zero tests. The two packages claimed to have tests don't both actually have them. There is no checklist a person can run before deploying to confirm "registration still works, login still works, logout still works." Every release ships on faith.

5. **Undocumented failure points and bad practices.** Hardcoded credentials, a broken i18n key on the mobile password-update screen, a logout that redirects to the registration page, a welcome screen that sends users to a different destination than the app's own redirect, a copied-and-pasted onboarding step rendered three times, an error boundary with English-only hardcoded text, and several no-op settings items. None of these are tracked anywhere.

### Why this feature is necessary

Without a reliable foundation, every subsequent feature (transactions, accounts, the learning section, dashboards) is built on sand. A user who can't log in can't use any of it. A developer who can't trust "login works" can't ship confidently. The foundation is the layer that makes everything else verifiable.

### What outcome indicates success

- A single, written standard defines how registration, login, logout, password management, error reporting, and onboarding should behave — on both platforms.
- The existing implementation has been audited against that standard, with bad practices and failure points recorded.
- Corrective work brings the implementation in line with the standard where it diverges.
- A pre-deployment testing document exists in `docs/` and is the routine way the team confirms the foundation is intact before a release.
- The two platforms behave consistently for the same capability, and errors are never silently swallowed.

---

## Normal Flow

The normal flow is the happy path a user follows across the application's lifetime, from first contact to routine use.

1. **First contact.** A person without an account opens the app (mobile or web) and lands on the entry screen, which offers registration and login.

2. **Registration.** The person enters an email and a password (with confirmation) and **accepts the terms and conditions**. The system validates the input, creates the account, and sends a confirmation email. The user is informed to check their inbox.

3. **Email confirmation.** The user clicks the link in the email. The app receives the deep link / redirect, establishes the session, and — because this is a first-time user — routes to the onboarding/welcome screen.

4. **Onboarding.** The user is introduced to the app's purpose and basic navigation through a short, clear set of steps. On completion, the system records that onboarding has been seen and routes the user to the main experience.

5. **Routine login.** On subsequent opens, an authenticated session is detected and the user is taken straight to the main experience. If no session exists, the user logs in with email and password and is taken to the main experience.

6. **Using the app.** The user interacts with the core features (all other features in the roadmap). If something goes wrong during use, the user sees a clear error message; if they choose, they can submit a bug report from settings.

7. **Logout.** From the settings/configuration area, the user logs out. The session is ended and the user is returned to the entry (login) screen.

8. **Password recovery (when needed).** A user who forgets their password requests a reset email from the login screen, receives it, follows the link, chooses a new password, and is returned to login.

9. **Password change (authenticated).** From the settings area, a logged-in user who knows their current password can change it directly within the app, without an email flow.

10. **Name editing.** From the settings area, a logged-in user can edit their display name. The change is persisted to their profile.

11. **Account deletion.** From the settings area, a logged-in user can choose to delete their account. The system requires explicit confirmation, then removes the user's account and all associated data, ends the session, and returns the user to the login screen.

### Pre-deployment flow (team side)

Before each deployment, a person on the team follows the testing document in `docs/` to manually verify that registration, login, logout, password reset, email confirmation, onboarding, and error/bug reporting still behave as defined. The release proceeds only when every item in the document passes.

---

## Alternative Flows

- **Registration with an already-used email.** The system informs the user that the email is already registered, without leaking whether it belongs to a confirmed or unconfirmed account, and offers a path to login or password reset.

- **Registration where email confirmation is required but the user already has a session.** Some Supabase configurations return a session immediately on signup. The app must handle both the "check your email" path and the "logged in immediately" path, routing accordingly.

- **Login as a returning user who hasn't confirmed their email.** The system informs the user that confirmation is required and offers to resend the confirmation email.

- **Login fails (wrong password / network error).** The user sees a clear error and can retry. Repeated failures are throttled to discourage brute force.

- **Deep-link / redirect failure.** If the email-confirmation or password-reset link fails to establish a session (expired link, wrong app, network issue), the user sees a clear error explaining what happened and how to request a new link — rather than an infinite "verifying" state.

- **Session expires mid-use.** The user is returned to the login screen with an explanation, not silently dropped into a broken state.

- **Logout fails.** The user is informed that logout didn't complete and offered a retry; they are not left in an ambiguous state.

- **Onboarding skipped or interrupted.** If the user closes the app during onboarding, on next launch they are returned to onboarding (it is only marked "seen" on explicit completion), not to the main experience.

- **Bug report submission fails.** The user is informed the report couldn't be sent and offered a retry, with their composed message preserved so they don't lose what they typed.

- **Password change with wrong current password.** The system informs the user that their current password is incorrect, without revealing any account details, and lets them retry.

- **Name editing with invalid input.** If the user submits an empty or invalid name, the system rejects it with a clear message and preserves the previous value.

- **Account deletion cancelled.** The user can back out of the confirmation at any time; no deletion occurs and the session and data remain intact.

- **Account deletion fails.** The system informs the user the deletion didn't complete, the account and data remain intact, and the user can retry or contact support.

- **Terms and conditions not accepted.** Registration cannot be submitted until the user has explicitly accepted the terms and conditions.

- **Error boundary triggered.** The user sees a recoverable, localized "something went wrong" screen with an option to try again, and the underlying error is recorded (not only logged to console).

---

## Business Rules

1. **Identity is email-based.** A user is uniquely identified by their email address. One email maps to exactly one account.

2. **Password is required and must meet a minimum strength.** A password must be at least 8 characters. The same minimum applies on both platforms and across registration, password reset, password change, and any other password-entry context.

3. **Email confirmation governs first access.** A newly registered account must confirm its email before it is considered fully active. The system must handle both the "confirmation required" and "immediate session" Supabase outcomes correctly.

4. **Terms acceptance is mandatory for registration.** A user cannot complete registration without explicitly accepting the current terms and conditions. The acceptance is recorded at the time of registration.

5. **Onboarding is a gate, shown once.** A user who has never completed onboarding is routed to the welcome screen before the main experience. Onboarding is marked complete only by an explicit user action. Once marked, it is not shown again automatically.

6. **A valid session is required for the authenticated area.** The main experience (`/app/*` on web, `(app)/` on mobile) is only reachable with a valid session. An unauthenticated user attempting to access it is redirected to login.

7. **Logout always returns to the entry point.** After a successful logout, the user lands on the login screen — not on registration, not on the last-visited page.

8. **Errors are surfaced, never swallowed.** Any failure in a foundational flow (auth, password, onboarding, bug report, account deletion, name editing) must produce a user-visible message. `console.error` alone is never an acceptable end state for a user-initiated action.

9. **Error messages are non-technical and consistent.** The user never sees a raw stack trace, a Supabase error code, or an English string on a Spanish UI. Error messaging is funneled through a single consistent mechanism per platform.

10. **Information disclosure is minimized.** Password reset and registration flows do not reveal whether a given email exists in the system. A reset request always shows the same "if the account exists, an email was sent" outcome.

11. **Brute force is discouraged.** Repeated failed login attempts are throttled. The app does not allow unbounded immediate retries.

12. **Bug reports are user-initiated and contain what the user consents to send.** A bug report includes the user's message and, with their awareness, basic device/app metadata. No silent telemetry.

13. **Credentials are not in source code.** The Supabase URL and key are provided through configuration/environment, not hardcoded in client source. (This is a stated hard limit of the constitution.)

14. **Behavior is consistent across platforms.** For any foundational capability, the web and mobile implementations must produce the same user-visible outcome even if the UI differs. The same input validation rules and the same redirect logic apply on both.

15. **The pre-deployment test document is the release gate for the foundation.** A deployment is not considered ready if the documented manual checks have not been performed and passed.

16. **Password change requires the current password.** An authenticated user changing their password must supply their current password. The change is rejected if the current password is incorrect. This is distinct from the email-based reset flow, which is for users who cannot log in.

17. **Name editing is limited to the display name.** The user may edit their display name only. Avatar and phone number are not editable in this feature. The name must be non-empty.

18. **Account deletion is irreversible and requires explicit confirmation.** A user who deletes their account has all their data removed. The action requires a deliberate confirmation step (not a single tap). On success, the session is ended and the user is returned to login. The system must delete both the Supabase Auth user and all user-scoped data in application tables.

---

## Data Involved

- **Email address** — the user's unique identifier. Provided by the user during registration; read during login and password reset; never modified by these flows. Required.

- **Password** — the user's secret. Provided during registration, login, password reset, password change, and as current-password verification during a change. Never stored in plaintext by the app (Supabase Auth manages hashing). Never logged, never displayed, never persisted in client state beyond the form field.

- **Display name** — the user's name as shown in the app. Provided optionally during or after registration; edited by the user through the settings area. Stored on the user's profile. Read for display in settings and elsewhere. Limited to the display name only (avatar and phone are not touched by this feature).

- **Terms acceptance** — a record that the user accepted the current terms and conditions at registration time. Created during registration; read-only thereafter. Stored associated with the user's account.

- **Session** — the authentication token (access + refresh) issued by Supabase Auth. Created on login/email-confirmation, persisted client-side, read on app open to gate routing, destroyed on logout and on account deletion. The app must react to session expiry.

- **Onboarding flag (`profiles.welcome`)** — a per-user flag indicating whether the welcome/onboarding has been completed. Read on session establishment to decide routing; set to "seen" on explicit onboarding completion. Stored server-side on the user's profile.

- **Bug report** — a free-text message authored by the user, plus basic device/app metadata (OS, model, app version). Created by the bug-report feature and inserted into the `reports` table. Read only by the team.

- **Password reset request** — an email address submitted to request a reset link. Transient; not persisted by the app beyond the form submission.

- **Account deletion request** — a user-initiated, explicitly confirmed action to remove the account and all user-scoped data. Triggers deletion of the Supabase Auth user and cascade removal of application data. Irreversible.

- **Error context** — when an error occurs, the context (which flow, which platform, which step) is what determines the message shown to the user. For unhandled crashes caught by an error boundary, the error itself is the data recorded for the team.

---

## Validations

### User input validation

- **Email** — must be non-empty and match a valid email format. Validated client-side on registration, login, and password reset, on both platforms, using a single shared rule.
- **Password (registration, reset, & change)** — must be non-empty and at least 8 characters. The same minimum applies everywhere, including the new password in a change-password flow.
- **Current password (password change only)** — must be non-empty and must match the user's actual current password (verified server-side via Supabase Auth).
- **Password confirmation** — must match the password. Validated on registration, password reset, and password change.
- **Display name** — must be non-empty when edited. No other fields (avatar, phone) are editable in this feature.
- **Terms and conditions** — must be explicitly accepted before registration can be submitted.
- **Bug report message** — must be non-empty before submission is allowed.
- **Account deletion** — must be explicitly confirmed (not a single tap) before deletion proceeds.

### Business rule validation

- On registration, the system must handle an already-registered email gracefully (no crash, no raw error).
- On registration, the terms and conditions must be accepted before the account is created.
- On login, the system must handle invalid credentials and unconfirmed emails distinctly, guiding the user to the right next step.
- Onboarding must not be markable as "seen" except through the explicit completion action.
- A bug report must not be submittable with an empty message.
- A password change must not proceed if the current password is incorrect.
- A name edit must not persist an empty value.
- Account deletion must not proceed without explicit confirmation.

### System state validation

- The authenticated area must not render its data-dependent content without a valid session.
- A password reset/update must not be allowed without an established recovery session (the user must have arrived via the reset link, not by navigating directly to the update-password screen).
- A password change must only be available to an authenticated user with an active session.
- Account deletion must only be available to an authenticated user with an active session.
- Logout must confirm session destruction before redirecting.
- Account deletion must confirm both Auth-user removal and application-data removal before returning the user to login.

---

## Possible Errors and Edge Cases

- **Expired or already-used confirmation/reset link.** The user sees a clear message and a way to request a new link. The app must not hang on a "verifying" state indefinitely — a timeout or explicit error is required.
- **Wrong deep-link target.** If a reset link is opened on a device/browser without the app, the user is told how to proceed rather than seeing a blank screen.
- **Network failure during any auth action.** The user sees a "connection error" message and can retry. The app does not silently fail or freeze.
- **Supabase rate limiting.** If the auth service throttles requests (too many login attempts, too many reset emails), the user is informed to wait — not shown a raw error.
- **Session expires while the user is in the app.** The user is returned to login with an explanatory message, not dropped into a half-broken screen.
- **Logout fails (network or server).** The user is told logout didn't work and can retry; they are not redirected as if it succeeded.
- **Bug report submission fails.** The user is told the report failed, their message is preserved, and they can retry.
- **Error boundary catches a crash.** The user sees a localized, themed recovery screen; the error is recorded for the team; "try again" doesn't instantly re-crash if the cause was transient.
- **User opens the app in an unsupported locale.** The app falls back to a default locale rather than showing missing translation keys.
- **Duplicate registration race.** Two near-simultaneous registrations with the same email are handled by the backend; the app shows the appropriate message.
- **Direct navigation to the update-password screen without a recovery session.** The app must not attempt the update; it must route the user to request a reset link instead.
- **Account deletion partial failure.** If the Supabase Auth user is removed but application-data cleanup fails (or vice versa), the system must not leave the user in an ambiguous state. The user is informed of the outcome and the team is made aware of any partial cleanup that needs attention.
- **Terms and conditions link unreachable.** If the user cannot open the terms document at registration time (e.g., offline), the acceptance checkbox is still available, but the link should degrade gracefully (open in browser / retry).

---

## Acceptance Criteria

1. **Registration.** Given a person with a valid email and a password meeting the minimum who has accepted the terms and conditions, when they submit the registration form on either platform, then an account is created and the user is either prompted to confirm their email or routed into the app, according to the Supabase response — and the same validation rules apply on web and mobile. Given the terms are not accepted, then submission is blocked.

2. **Login.** Given a registered user with a confirmed email, when they submit valid credentials, then they are authenticated and routed to the main experience (or onboarding if it hasn't been seen). Given invalid credentials, then they see a clear error and can retry.

3. **Logout.** Given an authenticated user, when they log out, then the session is destroyed and they land on the login screen — not the registration screen — on both platforms.

4. **Password reset.** Given a user who forgot their password, when they request a reset, then an email is sent (if the account exists) and the user sees a non-disclosing success message. Given they follow the link and choose a valid new password, then the password is updated and they can log in with it.

5. **Password change (authenticated).** Given an authenticated user who supplies their correct current password and a valid new password, when they submit, then the password is changed and the user is informed. Given the current password is wrong, then the change is rejected with a clear message and the password is unchanged.

6. **Name editing.** Given an authenticated user, when they edit their display name to a non-empty value and save, then the name is persisted to their profile and reflected in the app. Given they submit an empty value, then the change is rejected. Given they attempt to edit avatar or phone, then those fields are not editable in this feature.

7. **Account deletion.** Given an authenticated user who confirms deletion, when the deletion proceeds, then the Supabase Auth user and all user-scoped application data are removed, the session is ended, and the user is returned to login. Given the user cancels confirmation, then nothing is deleted. Given deletion fails, then the user is informed and the account and data remain intact.

8. **Error surfacing.** Given any foundational flow fails (login, logout, reset, password change, name edit, account deletion, bug report, onboarding), then the user sees a clear, localized, non-technical message — never a raw error, never a silent `console.error`-only failure.

9. **Consistent error mechanism.** Given the same kind of error on web and mobile, then the user experience is consistent in tone and clarity, even if the visual surface differs.

10. **Session gating.** Given an unauthenticated user, when they attempt to reach the authenticated area, then they are redirected to login — on both platforms.

11. **Onboarding gate.** Given a user who has never completed onboarding, when they establish a session, then they are routed to the welcome screen. Given they complete it, then they reach the main experience and are not shown onboarding again on subsequent logins.

12. **Bug reporting.** Given an authenticated user, when they submit a non-empty bug report, then it is stored and the user sees confirmation. Given submission fails, then the user is informed and their message is preserved.

13. **Error boundary.** Given an unhandled crash on either platform, then the user sees a localized, themed recovery screen and can attempt to recover.

14. **No hardcoded credentials.** Given the source code, then the Supabase URL and key are not present as literals in client source files.

15. **Implementation audit.** Given the existing codebase, when the audit task is complete, then a written record exists enumerating the bad practices, inconsistencies, and failure points found, and each finding is linked to a corrective task.

16. **Pre-deployment test document.** Given the `docs/` folder, when this feature is complete, then a Markdown document exists describing how to manually verify registration (including terms acceptance), login, logout, password reset, password change, name editing, account deletion, email confirmation, onboarding, and error/bug reporting before each deployment. Given a person follows it, then they can confidently decide whether the foundation is safe to ship.

17. **Platform consistency.** Given any foundational capability, when it is exercised on web and on mobile, then the observable behavior (validation rules, redirect destinations, error messaging tone) matches the single written standard.

---

## Out of Scope

- **Social/OAuth login** (Google, Apple, etc.) — not part of the initial foundation; email/password only.
- **Multi-factor authentication** — deferred to a future stability-stage feature.
- **Avatar and phone number editing** — this feature includes display-name editing only. Avatar and phone are a separate future feature.
- **Full i18n rollout on web** — the web app currently has no i18n. This feature requires that foundational strings be consistent and non-raw-error, but a complete web i18n implementation is a separate effort. (Mobile already has en/es.)
- **Automated E2E test suite** — this feature establishes a *manual* pre-deployment testing document. Building automated E2E is a future initiative; the document is the precursor.
- **A hosted error-reporting service (Sentry/Bugsnag)** — out of scope for this iteration; the feature ensures errors are surfaced to the user and recorded locally/logged, and that manual bug reporting works. Integrating a remote error service is a future task.
- **Changing the navigation structure** (sidebar vs tabs) — not in scope; this feature works within the existing navigation.
- **Redesigning the learning section, transactions, accounts, or dashboards** — those are separate features under their own specs.
- **Resetting onboarding from settings** — a nice-to-have referenced in the roadmap; not required for this foundation feature.

---

## Open Questions

1. **Web i18n depth.** Should the foundation feature, for the foundational screens only, introduce a minimal i18n setup on web (so login/logout/error strings are translatable), or is hardcoded-but-consistent Spanish acceptable for now with full i18n deferred? The spec assumes the latter; confirm.

2. **Brute-force throttling.** Should the app implement its own client-side throttle on login attempts, or rely solely on Supabase's built-in rate limiting? The spec calls for "discouraging" brute force but doesn't prescribe the mechanism.

3. **Error reporting service.** Is introducing a hosted error service (e.g., Sentry) completely off the table for this feature, or is minimal integration (e.g., capturing error-boundary crashes remotely) desirable if it's low-effort? The spec puts it out of scope.

4. **Audit deliverable format.** Should the implementation audit produce a standalone Markdown report (e.g., `docs/foundation-audit.md` or within the spec folder), or just a set of corrective tasks tracked in `tasks.md`? The spec assumes a written record; confirm the location.

5. **Welcome/onboarding redirect destination.** There are currently three different post-welcome destinations across the codebase. Should the standard be the dashboard/home (the main experience entry), and should mobile and web agree on a single route? The spec assumes yes; confirm.

6. **Email confirmation strictness.** Should an unconfirmed user be allowed to log in and use a limited subset of the app, or fully blocked until confirmation? The spec currently says "informed and offered resend"; confirm whether full block is required.

7. **Account deletion mechanism.** Should account deletion remove the Supabase Auth user via the client SDK (`supabase.auth.admin.deleteUser` requires a service-role key and cannot run on the client), via a Supabase Edge Function with elevated privileges, or via database cascades (e.g., a trigger on `auth.users` deletion that cleans up application tables)? The implementation approach must be decided at the plan stage since it affects where the deletion logic lives and what privileges are required.

8. **Terms and conditions storage.** Should the terms-acceptance be stored as a timestamped record on the user's profile (e.g., `profiles.terms_accepted_at`), or as a separate audit table? The spec requires that acceptance is recorded; the storage shape should be confirmed at the plan stage after checking the current `profiles` schema in Supabase.

9. **Name field in profiles.** Does the current `profiles` table in Supabase already have a `name`/`full_name` column, or does one need to be added? The plan stage should verify the schema before deciding whether a migration is required.
