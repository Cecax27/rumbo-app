# Rumbo — Development Docs

This folder contains the developer documentation for the Rumbo monorepo.
Start here if you're setting up the project for the first time, or if you're
coming back after a while and need a refresher.

## Documents

| Document | When to read |
|----------|--------------|
| [Getting Started](./getting-started.md) | First time setup, or when you need to start the web/mobile dev servers. |
| [Monorepo & Turborepo](./monorepo-and-turbo.md) | Refresher on how the workspace, packages, and Turbo tasks fit together. |
| [EAS Builds](./eas-builds.md) | When you need to build, sign, or submit the mobile app with Expo EAS. |

## TL;DR

```bash
# 1. Install dependencies (requires pnpm 9 + Node >= 18)
pnpm install

# 2. Start the web app (Next.js) → http://localhost:3000
pnpm --filter web dev

# 3. Start the mobile app (Expo) in another terminal
pnpm --filter rumbo start
```

> The project uses **pnpm workspaces + Turborepo**. Never run `npm` or `yarn`.
> See [Monorepo & Turborepo](./monorepo-and-turbo.md) for the full picture.
