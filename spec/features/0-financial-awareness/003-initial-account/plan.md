# Implementation Plan — Initial Account

> This plan translates the approved `spec.md` into a high-level implementation strategy. It is not a line-by-line checklist (that is `tasks.md`). It respects the existing architecture and the constitution's `tech-stack.md` hard limits.

---

## Implementation Overview

The feature is remarkably small because of how the app is already built: **both platforms sign up through Supabase Auth**, and Supabase already runs a server-side `handle_new_user()` trigger on every new `auth.users` row to create the user's `profiles` record. The initial account belongs in exactly that same trigger.

The implementation is therefore **a single, additive database migration** that extends `handle_new_user()` to also insert one cash account for the new user. No mobile code, no web code, and no shared-package code changes: because the account is created server-side at signup time, it exists before the user's first session on either platform, and the existing `getAccounts()` queries (which read `accounts_with_balance`) will show it automatically.

The work is one migration file plus verification. The heavy lifting is confirming the product decisions (name, styling, primary flag) and validating the failure semantics — not building new code paths.

---

## Decisions on Open Questions

The spec left seven open questions. Decisions taken here are recommendations that must be confirmed by the user (marked ✋ where the answer is a product choice, not a technical necessity). The rest follow directly from the codebase's existing patterns.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Exact account name | ✋ **"Cartera"** (Spanish) | The product is Spanish-first for the Mexican market, and every existing seeded account name is Spanish ("Efectivo", "Nómina", "Colegio"). The issue's "Wallet" is the English rendering of the same idea. |
| 2 | Localization of the name | **Single canonical string in the DB, no display-time localization.** | Account names are user-owned free text, not translated UI strings — the app never localizes account names anywhere, and the trigger has no language context anyway. Users rename the account to whatever they like immediately after. |
| 3 | Where creation happens | **Extend `handle_new_user()` (server-side trigger).** | It already runs `AFTER INSERT ON auth.users` and creates `profiles`. Adding the account there is atomic with user creation, works identically for mobile and web signup, and covers the email-confirmation case (the trigger fires regardless of whether a session is returned). |
| 4 | Behavior on creation failure | **Atomic: a failure rolls back the whole signup.** | Because the account insert lives in the same `AFTER INSERT` trigger as the profile insert, any error raises and rolls back the `auth.users` insert, surfacing the normal Supabase signup error. This is precisely BR5 ("atomic with user creation") — a new user must never end up without their initial account. The insert is trivial (cash account, all defaults), so failure is vanishingly rare. |
| 5 | Existing users (backfill) | **No backfill.** Strictly new signups. | The issue targets *new* account creation. A one-time backfill for existing users can be added later as a separate migration if requested, but mutating existing users' data is out of scope. |
| 6 | Primary-account flag | **`is_primary_account = true`.** | At signup the initial account is the user's only account, so it should be primary by default. |
| 7 | Color and icon | ✋ **icon `monetization-on`, color `#546E7A`** | Matches the existing seeded cash account ("Efectivo" uses the same icon and color), so the initial account is visually consistent with how cash accounts already look. |

---

## Affected Areas

### Database (Supabase project — one additive migration)
- **`handle_new_user()`** — add an `insert into public.accounts (...)` after the existing `profiles` insert.
- **New migration file** — `supabase/migrations/20260912000000_create_initial_account.sql` (replaces the function with the extended body, following the `20260825000001_update_handle_new_user.sql` precedent).
- **No new tables, columns, RLS policies, buckets, or Edge Functions.** The `accounts` table, its RLS, and the `handle_new_user` `SECURITY DEFINER` ownership already allow this insert (the function owner bypasses RLS, exactly as it already does for `profiles`).

### No code changes (verified, not modified)
- **Mobile (`apps/mobile`)** — signup flow (`app/signUp.js`) and account listing (`lib/supabase/transactions.js` `getAccounts`) are unchanged; the new account appears automatically.
- **Web (`apps/web`)** — signup (`login/subpage.tsx`) and `@repo/supabase/accounts.ts` are unchanged; the new account appears automatically.
- **`supabase/functions/delete-user/index.ts`** — already deletes the `accounts` table among user-scoped data, so account deletion still cleans up the initial account. No change.

### Docs
- Update `docs/pre-deployment-checks.md` with an initial-account check (the release gate established by the app-foundation feature).
- Update `spec/constitution/roadmap.md` feature status at completion.

---

## Architectural Considerations

### The trigger is the single source of truth
The `handle_new_user()` function already runs `SECURITY DEFINER SET search_path = ''` on `AFTER INSERT ON auth.users`, inserting `public.profiles`. Extending it to insert `public.accounts` is the minimal change that preserves every property the spec requires:

- **Atomic** — same transaction as profile creation; a failure rolls back the signup.
- **Platform-independent** — fires for signups from mobile, web, or any future client.
- **Session-independent** — works whether signup returns an immediate session or requires email confirmation.
- **RLS-safe** — the `SECURITY DEFINER` owner bypasses RLS on `accounts`, just as it does for `profiles` today.

### Account insert shape
The insert must explicitly set `user_id = new.id` (the trigger context has no `auth.uid()`), `account_type = 3` (cash, per `accounts_types`), the chosen name, icon, color, and `is_primary_account = true`. All other columns (`bank_name`, `credit_limit`, `platform`, `loan_amount`, etc.) are left `NULL`, and `id`/`created_at` use their existing defaults. `name` is a fixed literal in the migration, so the string only lives in one place and is trivial to change later.

### Idempotency is inherent
Because the trigger fires once per `auth.users` row, exactly one initial account is created per user with no client-side logic to race. No unique constraint or dedupe is required.

### What is NOT changed
- Auth/session flow, signup screens, onboarding, account CRUD, transaction tools, and account deletion are all untouched.
- No client-side "create default account on first login" fallback is added (it would introduce the exact race and duplication the trigger avoids).
- No `balance_adjustments` seeding — the initial account starts at zero balance (that feature is separate).

---

## Data and State Changes

### Database migration (additive, single file)
Replace `handle_new_user()` so that, after creating the `profiles` row, it also inserts one `accounts` row:

- `user_id` = `new.id`
- `name` = `'Cartera'` (pending confirmation of the exact name)
- `account_type` = `3` (`cash`)
- `icon` = `'monetization-on'`
- `color` = `'#546E7A'`
- `is_primary_account` = `true`

### Effects on existing data
- **None.** The migration only changes the function definition; it does not touch existing rows. Existing users are unaffected (no backfill, per decision #5).
- New users created after the migration is applied automatically receive the initial account.

---

## Implementation Phases

### Phase 1 — Database
- Write `supabase/migrations/20260912000000_create_initial_account.sql` extending `handle_new_user()`.
- Apply the migration (CLI/owner, or via Supabase MCP).
- Verify the function body and that `accounts_types` still maps id `3` → `cash`.

### Phase 2 — Verification
- Sign up a new user on both mobile and web; confirm exactly one "Cartera" account exists immediately and appears in the accounts list with no client action.
- Confirm the email-confirmation path also produces the account (signup without immediate session, then log in).
- Confirm the account can be renamed, edited, and deleted like any other, and deletion does not recreate it.
- Confirm signup still works and `profiles` creation is unchanged.

### Phase 3 — Docs
- Add an initial-account section to `docs/pre-deployment-checks.md`.
- Update `spec/constitution/roadmap.md` (feature status → Done).

---

## Testing and Verification Strategy

### Automated
- There is no new logic to unit test — the change is a SQL trigger. The repo has no SQL test harness, so verification is manual/introspection, consistent with the app-foundation feature's approach.

### Manual (the release gate — `docs/pre-deployment-checks.md`, initial account)
Each acceptance criterion maps to a check:

1. **Account created on signup** — new signup yields exactly one cash account with the chosen name, on mobile and web.
2. **No client-side setup** — first session shows the account in the list and allows recording a transaction immediately.
3. **Email confirmation** — account exists before first login after confirming email.
4. **Natural naming** — account name is "Cartera"/chosen name, never "Default".
5. **Editable/deletable** — rename, edit, and delete all work; no recreation after delete.
6. **Exactly one** — signup via mobile then web (same or different users) never duplicates the account.
7. **No regression for existing users** — an existing user's accounts are unchanged.

### Introspection
- Inspect `handle_new_user()` via SQL to confirm the extended body and the account insert.

### Baseline
- `pnpm run lint`, `pnpm run check-types`, `pnpm run build` must pass (the migration itself doesn't affect these, but the repo convention requires them before release).

---

## Risks and Considerations

- **Failure semantics trade-off.** Making account creation atomic means an account-insert failure would block signup. This is intentional (BR5) and the insert is trivial; but it is worth a sanity check that `accounts` has no surprising constraints (e.g., a NOT NULL with no default that the insert would violate). Confirmed during Phase 1: the insert sets every required column explicitly or relies on an existing default.
- **`SECURITY DEFINER` surface.** Extending `handle_new_user()` slightly widens a privileged function. The added statement only inserts a fixed row with `user_id = new.id`, so the risk is minimal, but the function must keep `SET search_path = ''` and fully-qualified table names.
- **Naming drift.** If the name is a hardcoded literal, changing it later requires a migration. That is acceptable for a single string, and the spec treats the name as a one-time product decision.
- **No client fallback.** If the trigger were ever dropped or bypassed (e.g., a user created via the Supabase dashboard without going through Auth), no account would be created. This is acceptable because the trigger is the defined signup path; the plan does not add a client-side safety net that could create duplicates.
- **Localization assumption.** The decision to store one non-localized string means an English-only user sees "Cartera" until they rename it. If the product later wants per-language names, that is a separate enhancement, not part of this feature.
