<img src="https://github.com/Cecax27/Fundwise/blob/main/mobile/assets/icon.png" width="100" height="100">

# Fundwise

Fundwise is a **personal finance app** designed to help you **track expenses, manage income, and make better financial decisions**.  
The goal is to provide a simple, practical, and cross-platform experience for money management.

---

## 🚀 Features
- Track income and expenses.
- Categorize transactions.
- Create budget plans.
- User authentication with **Supabase Auth**.
- Secure data storage in **Supabase**.
- **Fullstack architecture**:  
  - **Frontend:** React Native (Expo).  
  - **Backend / Database:** Supabase (PostgreSQL + APIs).  

---

## 📸 Screenshots


---

## 🛠️ Tech Stack
- [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)  
- [Supabase](https://supabase.com/) (Auth, Database)  
- [Node.js](https://nodejs.org/) (for development environment)  

---

## 📦 Installation & Setup
### 1. Clone the repository
```bash
git clone https://github.com/yourusername/fundwise.git
cd fundwise
```
### 2. Install dependencies
```bash
npm install
```

### 3. Run the project

```bash
npx expo start
```

---

# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```
