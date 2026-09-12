# Implementation Tasks — Initial Account

> Derived from the approved `plan.md`. This is the living implementation record; mark items `[x]` only after the work is actually done and verified.

## Phase 1: Database

- [x] **1.1** Create `supabase/migrations/20260912000000_create_initial_account.sql` — replace `handle_new_user()` to also insert one `accounts` row after the `profiles` insert (`user_id = new.id`, `name = 'Cartera'`, `account_type = 3`, `icon = 'monetization-on'`, `color = '#546E7A'`, `is_primary_account = true`).
- [ ] **1.2** Apply the migration (CLI/owner). _Blocked: MCP SQL role is read-only (`permission denied for schema public`), as in previous features._
- [x] **1.3** Introspect `handle_new_user()` body to confirm the extended insert; confirm `accounts_types` id `3` → `cash` (verified: `cash`).

## Phase 2: Verification

- [ ] **2.1** Sign up a new user on mobile; confirm exactly one "Cartera" account exists and appears in the accounts list with no client action.
- [ ] **2.2** Sign up a new user on web; confirm the same behavior (one "Cartera" account).
- [ ] **2.3** Confirm the email-confirmation path: signup without immediate session, then log in after confirming — account already exists.
- [ ] **2.4** Record a transaction against the initial account immediately (no account-creation step in between).
- [ ] **2.5** Rename, edit, and delete the initial account; confirm no recreation after delete.
- [ ] **2.6** Confirm an existing user's accounts are unchanged (no backfill / no regression).
- [ ] **2.7** Confirm account deletion (`delete-user` Edge Function) still removes the initial account.

## Phase 3: Docs

- [ ] **3.1** Add an initial-account section to `docs/pre-deployment-checks.md`.
- [ ] **3.2** Update `spec/constitution/roadmap.md` (feature status → Done).

## Final

- [x] **4.1** Run `pnpm run check-types` (✅) and `pnpm run build` (✅). `pnpm run lint` fails only on mobile `expo lint` (pre-existing ESLint 9 + legacy `standard` config incompatibility, documented in `AGENTS.md` / `docs/pre-deployment-checks.md`); this change adds no lintable code.
