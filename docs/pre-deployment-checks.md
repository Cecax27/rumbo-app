# Pre-Deployment Checks — App Foundation

> Manual verification checklist for the foundational capabilities (registration, login, logout, password management, name editing, account deletion, onboarding, error/bug reporting, session gating). Run this before every release. The foundation is not "safe to ship" until every item passes on **both** platforms.

## Prerequisites

Before running the checks, confirm the following environment/data-layer items are in place:

- [ ] Migrations applied: `profiles.terms_accepted_at` column exists; `handle_new_user()` seeds `full_name` and `terms_accepted_at` from `raw_user_meta_data` (see `supabase/migrations/`).
- [ ] `delete-user` Edge Function deployed (`supabase functions deploy delete-user`) and `SUPABASE_SERVICE_ROLE_KEY` available to it.
- [ ] Env vars set — web: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local`); mobile: `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (`.env`).
- [ ] Email confirmation and password-reset email templates are configured and reachable (deep link / redirect target).
- [ ] Two test accounts available: one confirmed, one unconfirmed (or a way to create them during the run).

Each check lists the **precondition**, **steps**, and **expected result**. Mark ✅ (pass) or ❌ (fail) in each platform column.

---

## 1. Registration (AC 1, BR 2/3/4/10/11)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 1.1 | On the entry screen | Submit the register form with a valid email, a password ≥ 8 chars + matching confirmation, **without** checking terms | Submission is blocked with a clear "accept terms" message | | |
| 1.2 | On the entry screen | Repeat with terms **checked** | Account is created; the user is shown "check your email" (or routed into the app if the project returns an immediate session) | | |
| 1.3 | An existing confirmed account | Register again with the same email | A clear, non-technical "email already in use" message (no raw Supabase error) | | |
| 1.4 | Invalid email / short password | Submit with a malformed email or password < 8 chars | Rejected with a localized validation message | | |

## 2. Email confirmation (AC 1, BR 3)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 2.1 | Account created in 1.2 | Open the confirmation email link | Session is established; first-time user is routed to onboarding/welcome | | |
| 2.2 | Expired/invalid link | Open a stale or malformed link | A clear "invalid/expired link" message with a way to request a new one (no infinite spinner) | | |
| 2.3 | "Verificando enlace…" | Force a slow/blocked network during link verification | After ~15s an error is shown instead of hanging forever | | |

## 3. Login (AC 2, BR 6/11)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 3.1 | Confirmed account | Log in with valid credentials | Authenticated and routed to main experience (or onboarding if unseen) | | |
| 3.2 | Confirmed account | Log in with the wrong password | Clear, non-technical error; can retry | | |
| 3.3 | Unconfirmed account | Log in with correct credentials | Told that email confirmation is required, offered a resend | | |
| 3.4 | Any account | Repeat failed logins rapidly | Rate-limited/throttled message rather than a raw error | | |

## 4. Logout (AC 3, BR 7)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 4.1 | Authenticated user | Log out from settings | Session destroyed; lands on the **login** screen (not registration) | | |
| 4.2 | Authenticated user | Log out while offline | A clear "couldn't log out" message (not silently redirected) | | |

## 5. Password reset (AC 4, BR 10)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 5.1 | From login | Request a reset for a **known** email | Non-disclosing "if the account exists, an email was sent" message | | |
| 5.2 | From login | Request a reset for an **unknown** email | Same non-disclosing message (no account-existence leak) | | |
| 5.3 | Reset email received | Follow the link and set a new password (≥ 8) | Password updated; can log in with the new password | | |
| 5.4 | Reset link expired | Open an expired link | Clear error with a way to request a new link | | |

## 6. Password change (AC 5, BR 16)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 6.1 | Authenticated user | Change password with the **wrong** current password | Rejected with a clear message; password unchanged | | |
| 6.2 | Authenticated user | Change password with the correct current password + valid new password (≥ 8, matching confirmation) | Password changed; success message; old password no longer works | | |

## 7. Name editing (AC 6, BR 17)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 7.1 | Authenticated user | Save an **empty** name | Rejected with a clear message; previous value preserved | | |
| 7.2 | Authenticated user | Save a non-empty name | Name persisted to `profiles.full_name` and reflected in the UI | | |

## 8. Account deletion (AC 7, BR 18)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 8.1 | Authenticated user | Trigger deletion, then **cancel** the confirmation | Nothing is deleted; session and data intact | | |
| 8.2 | Authenticated user (with sample data) | Confirm deletion | Auth user + all user-scoped data removed; session ended; user returned to login | | |
| 8.3 | Authenticated user | Confirm deletion while the Edge Function is unavailable | A clear failure message; account and data remain intact | | |

## 9. Onboarding gate (AC 11, BR 5)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 9.1 | New account, first login | Establish session | Routed to the welcome/onboarding screen | | |
| 9.2 | On onboarding | Complete onboarding | Routed to the main experience; `profiles.welcome` set | | |
| 9.3 | Previous user | Log in again | Onboarding is **not** shown again | | |

## 10. Bug report (AC 12)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 10.1 | Authenticated user | Submit an **empty** report | Rejected with a clear message | | |
| 10.2 | Authenticated user | Submit a non-empty report | Stored in `reports`; confirmation shown | | |
| 10.3 | Authenticated user, offline | Submit a report | Failure message shown; typed message preserved for retry | | |

## 11. Error boundary (AC 13)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 11.1 | Any screen | Trigger an unhandled render error (e.g. temporary dev trigger) | Localized, themed "something went wrong" screen with a retry action | | |

## 12. Session gating (AC 10, BR 6)

| # | Precondition | Steps | Expected result | Mobile | Web |
|---|---|---|---|---|---|
| 12.1 | No session | Navigate directly to the authenticated area (`/app/*` on web, `(app)/` on mobile) | Redirected to login | | |

## 13. No hardcoded credentials (AC 14, BR 13)

| # | Precondition | Steps | Expected result | Pass |
|---|---|---|---|---|
| 13.1 | Source tree | `grep -rn "supabase.co" apps packages --include=*.js --include=*.jsx --include=*.ts --include=*.tsx` (excluding `node_modules`, `dist`, `.env*`) | No Supabase URL/anon-key literals in client source | |

---

## Results

Fill in the pass/fail columns above. A release is blocked if any ❌ remains unresolved.

## Notes / known limitations

- Account deletion depends on the `delete-user` Edge Function being deployed; test 8.x will fail if it is not.
- Mobile `expo lint` is currently broken (ESLint 9 + legacy `standard` config incompatibility) — not a functional blocker for these checks.
- Terms-acceptance backfill: users registered before this feature have `terms_accepted_at = null`; acceptable for now.
