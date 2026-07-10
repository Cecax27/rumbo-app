# 001 - Forgot password

**Status:** Planning

## What makes

It displays a page where the user can enter their email address to receive an email with a link to reset their password. Clicking on the link in the email redirects them to either the website or the mobile app, to a page where they can reset their password.

## Why

Because its ussual users forgot their passwords.

## Acceptance criteria

- [ ] The login page have link to the forgot password page.
- [ ] On the forgot password page, the user can introduce his email and send the reset password requets. 
- [ ] On the forgot password function, for security reasons, users cannot find out if an email address is not registered.
- [ ] The user receives an email with a link to reset theirs passwords.
- [ ] The link redirect users to the web or mobile app and let users write new password.
- [ ] Once the password is reset, the users have feedback, and can login.

## Out of reach

- Mobile implementation (already done; only the cross-platform test remains).
- Web i18n setup (`react-i18next`): web reports use hardcoded Spanish strings inline, consistent with current web pages.
- Introduction of `@supabase/ssr` and cookie-based sessions on web.
- An auth `middleware.ts` route guard on web.
- Changes to the shared Supabase client config (`detectSessionInUrl` stays `false`); the web reset page parses the recovery link manually.
- Refactoring the hardcoded Supabase URL/anon key to env vars (separate "hard limit" tracked in `tech-stack.md`).
- Production domain changes outside known origins (`rumbo-ten.vercel.app`, `localhost`).