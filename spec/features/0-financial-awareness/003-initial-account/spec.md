# Initial Account

## Feature Name

**Initial Account** — every new Rumbo user gets a ready-to-use financial account created for them automatically at signup, so they can start recording transactions immediately without having to set anything up first.

---

## Description

Today, a brand-new user lands in an empty app. Before they can record a single expense or income, they must first create a financial account, because every transaction in Rumbo belongs to an account. That first mandatory step is friction, and it is unnecessary.

This feature removes that step: when a user signs up, Rumbo automatically creates one account for them — a simple cash account (a "wallet") — ready to use from the very first session. From the user's perspective, they can open the app for the first time and immediately start recording transactions; the account already exists.

Key points:

- The account is created **once**, at the moment the user's account comes into existence, and belongs to that user only.
- The account is a **cash account** — the simplest, most universal account type — so it needs no bank details, credit limit, or any extra configuration.
- It is **not** named "Default" or "Default account." It is named something natural and meaningful, like "Wallet" ("Cartera"), so it reads as the user's own money rather than a system artifact.
- It is a **real account**: it appears in the accounts list like any other, the user can record transactions against it, and the user can rename, edit, or delete it later just like any account they create themselves.

---

## Problem and Purpose

### The problem

Rumbo's core loop is *record → observe → understand*. But a user who just signed up cannot record anything: every income and expense must be attached to an account, and none exists yet. The very first thing a new user is forced to do is configuration — creating an account — before they can experience the value the app promises.

This is a well-known onboarding killer: the harder the first useful action is to reach, the more likely a new user is to abandon the product before it has delivered any value. The moment of signup is when motivation is highest; requiring account setup right then squanders it.

### Why this feature is necessary

Rumbo's awareness stage (level 0) is about making money *concrete*, not about building a financial system. A default cash account matches that goal exactly: it lets the user start logging transactions right away, with zero setup. Removing this one barrier is the single highest-leverage onboarding improvement for the transaction tools.

### What outcome indicates success

- A user who signs up can record their first income or expense immediately, with no account-setup step in between.
- The new account is present on both mobile and web from the first session, without any client-side race or duplicated account.
- The account does not feel like a system artifact: it has a natural name and reads as the user's own money.
- The user is not locked into it: they can rename, edit, or delete it, and create additional accounts, exactly as before.

---

## Normal Flow

1. **Signup.** A new user creates their Rumbo account (email + password, with terms accepted).

2. **Account creation (automatic).** At the moment the user account is created, Rumbo also creates a single cash account for that user, with a natural name (e.g., "Wallet") and sensible defaults (a color and icon). This happens server-side, so it works regardless of how signup completes.

3. **First use.** The user completes signup (or confirms their email, depending on the signup configuration) and enters the app. The accounts list already shows their account; the app is ready to record transactions against it immediately.

4. **Normal life.** The account behaves like any other account: it appears in the account pickers when adding transactions, transfers, and other tools; it shows a balance; the user can rename, edit, or delete it, or add more accounts.

---

## Alternative Flows

- **Email confirmation required.** Signup does not return an immediate session; the user must confirm their email first. The account is still created at signup time (server-side), so it is waiting for them when they first log in.
- **User signs up from mobile vs. web.** Regardless of which platform the user signs up on, the account exists on both — account creation is tied to the user, not to a specific client.
- **User renames the account.** The user edits the name to something else (e.g., their own "Cajón" or "Cuenta principal"). The account keeps its identity; only the name changes. Nothing is recreated.
- **User deletes the account.** The user removes the initial account like any other. It is not automatically recreated, and no empty-state nag appears.
- **User adds more accounts.** The user creates additional accounts (debit, credit, investment, …). The initial account remains unless they choose to delete it.
- **Existing users (pre-feature).** A user who already had an account before this feature ships does not get an initial account automatically (see Open Questions).

---

## Business Rules

1. **One initial account per user.** At most one account is auto-created per user, and only at the moment their user account is created. It must never be duplicated.

2. **It is a cash account.** The auto-created account uses the *cash* account type — no bank name, credit limit, cut-off day, platform, or loan fields are required or set.

3. **It has a natural, product-chosen name.** The account is not called "Default" or "Default account." The exact name is chosen by the product (e.g., "Wallet" / "Cartera") and is consistent across users and platforms.

4. **It is a fully normal account.** Once created, the initial account is indistinguishable in behavior from a user-created account: it can be used in transactions, renamed, edited, and deleted.

5. **Creation is atomic with user creation.** The account is created as part of the same server-side step that creates the user's profile, so a new user can never end up in a state where their account exists but their initial account does not.

6. **No empty state for the initial account.** The feature does not introduce a special "you have no accounts" flow for new users; the initial account is always present from the start.

---

## Data Involved

- **Account record (`accounts`)** — the auto-created row: `user_id` (the new user), `name` (product-chosen, e.g., "Wallet"), `account_type` (cash), `color` and `icon` (product-chosen defaults). Created once at signup; afterwards it is normal user-owned data that can be updated or deleted by the user.

- **User record (`auth.users`) / profile (`profiles`)** — the trigger for creation: the account is created when a new user row is inserted, in the same server-side flow that already creates the user's profile. Read (the new user's id); no modification.

- **Account type (`accounts_types`)** — the cash type (id 3) is referenced to set `account_type`. Read-only, referenced by the created account.

- **Localization data (locale files)** — if the account name needs to be shown differently per language (e.g., "Wallet" in English, "Cartera" in Spanish), the display name may be derived from the user's locale rather than a single hardcoded string. Read at display time (see Open Questions).

---

## Validations

### System state validation

- An initial account must be created exactly once per user; creating it must not run twice for the same user.
- The initial account must be scoped to the correct user (`user_id = the new user's id`), never to another user or to no user.
- The `account_type` must reference a valid, existing `accounts_types` row (cash).

### Business rule validation

- The account must never be named "Default" (or its localized equivalent that means "default").
- If a user deletes the initial account, the system must not silently recreate it.

---

## Possible Errors and Edge Cases

- **Account creation fails at signup.** If the auto-creation step fails (e.g., a constraint or transient DB error), the signup itself should not be left in a broken half-state: either the whole creation succeeds (user + profile + account) or the failure is surfaced. The spec must not let a failed account insert leave a user who cannot use the app (see Open Questions).
- **Duplicate creation (race or double trigger).** The creation must be idempotent; a user must never end up with two "Wallet" accounts.
- **Existing users after the feature ships.** They have no initial account; the feature must not break their current behavior or force a migration that mutates their data without consent.
- **User renames then deletes.** Renaming must not cause recreation, and deletion must be permanent (same as any account).
- **Email-confirmation signup.** The account must already exist before first login, since it is created at signup time, not first login.
- **Name localization.** If the name is localized, a user switching the app language must not end up with a confusingly renamed or duplicated account.

---

## Acceptance Criteria

1. **Account created on signup.** Given a new user completes signup, then exactly one cash account named with the product-chosen name (not "Default") exists for that user, on both mobile and web.

2. **No client-side setup required.** Given a newly signed-up user enters the app for the first time, then they can record a transaction immediately against their initial account, with no account-creation step in between.

3. **Works with email confirmation.** Given signup requires email confirmation, then the initial account already exists when the user first logs in after confirming.

4. **Natural naming.** Given the initial account is displayed anywhere (accounts list, pickers), then its name is the product-chosen natural name (e.g., "Wallet"/"Cartera"), never "Default".

5. **Fully editable/deletable.** Given a user with an initial account, then they can rename, edit, and delete it exactly like any other account, and deleting it does not cause it to be recreated.

6. **Exactly one, never duplicated.** Given a new user, then only one initial account is created regardless of platform, session state, or retries.

7. **No regression for existing users.** Given a user who existed before this feature, then their accounts are unchanged and the app behaves as before.

---

## Out of Scope

- **Creating additional accounts or a "full" financial setup.** Only one cash account is auto-created; nothing else (categories, budgets, goals, balances) is seeded.
- **Backfilling initial accounts for existing users.** This feature is about *new* signups; migrating or seeding accounts for already-existing users is a separate decision (see Open Questions).
- **Guessing or defaulting a real bank/debit/credit account.** The initial account is cash only; no attempt to model the user's actual bank account.
- **An account wizard or guided account setup at first launch.** The point is to remove setup, not replace it with a different guided flow.
- **Balance adjustments / initial balance seeding.** The initial account starts empty; setting an initial balance is the `balance_adjustments` feature, not this one.
- **Onboarding copy about the account.** Explanatory in-app messaging about the initial account is out of scope here.

---

## Open Questions

1. **The exact name.** The issue proposes "Wallet." Confirm the final product name (and its Spanish equivalent, e.g., "Cartera"). This decides the literal string(s) used.

2. **Localization of the name.** Rumbo is bilingual (en/es). Should the account name be stored as a single string in the DB (e.g., always "Cartera" or always "Wallet"), or stored with a marker so the UI renders the correct language ("Wallet"/"Cartera")? If localized, the DB value and the display logic need to be defined (plan-stage detail).

3. **Where creation happens.** The natural place is the existing `handle_new_user` trigger (server-side, alongside profile creation), which also covers the email-confirmation case. Confirm this is the intended approach vs. a client-side insert on first login.

4. **Behavior on creation failure.** If the account insert fails during the trigger, should signup be allowed to complete (user logs in with no account and, e.g., creates one on demand) or should the failure be treated as a signup failure? Define the failure semantics.

5. **Existing users.** Should existing users be given the initial account too (a one-time backfill), or is this strictly for new signups? The acceptance criteria currently assume new signups only.

6. **Primary-account flag.** Should the initial account be marked `is_primary_account = true`? The field exists on `accounts`; confirm whether the initial account should default to primary.

7. **Color and icon defaults.** Confirm which color/icon the initial account should use (e.g., a neutral "wallet" icon and a product color), or whether it should match the existing cash-account styling.
