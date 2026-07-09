# EAS Builds (Expo Application Services)

How to create native builds of the **mobile app** (`apps/mobile`, package
`rumbo`) using Expo's cloud build service, **EAS Build**. This covers dev
builds, internal-sharing builds, store-ready production builds, and store
submission.

> EAS builds run in the cloud on Expo's servers — you don't need macOS to build
> an iOS app, and you don't need Android Studio installed locally to produce an
> APK/AAB. You only need the EAS CLI and an Expo account.

For project setup in general, see [Getting Started](./getting-started.md). For
the monorepo structure, see [Monorepo & Turborepo](./monorepo-and-turbo.md).

---

## 1. What is EAS Build?

EAS is Expo's hosted service for building, signing, and submitting React Native
apps. The build itself happens on Expo's servers: you run a command locally, the
CLI uploads your project, Expo runs `npx expo prebuild` + Gradle/Xcode in the
cloud, and you get back a downloadable `.apk`/`.aab` (Android) or `.ipa` (iOS).

Key files in this repo:

| File | Purpose |
|------|---------|
| `apps/mobile/app.json` | Expo config (app name, slug, version, android package, EAS `projectId`). |
| `apps/mobile/eas.json` | EAS-specific config: build profiles, distribution channels, submit config. |

---

## 2. Prerequisites

1. **An Expo account** — create one at https://expo.dev/signup (free tier
   includes a limited number of monthly builds).
2. **The EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   ```
   The project requires EAS CLI **`>= 16.17.3`** (enforced via `eas.json` ->
   `cli.version`).
3. **Be logged in** to your Expo account from the CLI:
   ```bash
   eas login
   ```
4. The project is already linked to an EAS project. You can confirm with:
   ```bash
   cd apps/mobile
   eas whoami          # confirms you're logged in
   eas project:info    # shows the linked project
   ```
   The link is stored in `app.json` -> `extra.eas.projectId`:
   `87bcce5e-f990-4991-917a-4e654dee403c`.

> All `eas` commands below are run from **`apps/mobile/`** (or use
> `pnpm --filter rumbo exec eas <cmd>` from the repo root). EAS reads
> `eas.json` and `app.json` from the current directory.

### First-time linking (only if `projectId` is missing)

If you ever fork the repo or the `projectId` is removed, relink:

```bash
cd apps/mobile
eas init            # creates a new EAS project and writes the projectId into app.json
```

Do **not** run `eas init` on the existing repo — that would create a *new*
project and break the link for other collaborators.

---

## 3. The build profiles (`eas.json`)

```jsonc
{
  "cli": {
    "version": ">= 16.17.3",
    "appVersionSource": "remote"        // ← app version is managed by EAS, not local app.json
  },
  "build": {
    "development": {                    // ← dev client build for development
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {                        // ← internal build (no dev client), for QA/testers
      "distribution": "internal"
    },
    "production": {                     // ← store-ready build
      "autoIncrement": true             // ← auto bump the build number each build
    }
  },
  "submit": {
    "production": {}                    // ← store submission config (uses store credentials)
  }
}
```

### When to use each profile

| Profile | `distribution` | Use case |
|---------|----------------|----------|
| `development` | `internal` | A **development client** build (`expo-dev-client`) that you install on a device/emulator so you can run `pnpm --filter rumbo start` against a real native shell. Used during active development when JS-only Expo Go isn't enough. |
| `preview` | `internal` | A regular (non-dev-client) build shared **internally** with testers via a shareable link. Great for sharing a near-final build without going through the stores. Android produces an `.apk`; iOS uses ad-hoc/TestFlight-style distribution tied to registered devices. |
| `production` | (store) | A **store-ready** build (`.aab` for Android, `.ipa` for iOS) signed with store credentials and ready to submit to Google Play / App Store. |

### `appVersionSource: "remote"`

The app version is **managed by EAS**, not the local `app.json`. This means:

- When you run a production build, EAS reads/increments the version from its
  servers (combined with `autoIncrement: true` on the `production` profile,
  which bumps the native **build number** each build).
- Don't manually edit `app.json` -> `expo.version` to bump for a release — let
  EAS handle it. If you do change it locally, run `eas build --auto-init` /
  sync carefully to avoid conflicts.

---

## 4. Building

All commands below are run from `apps/mobile/`. Every build prints a
shareable URL (and a QR code) where the artifact can be downloaded once ready.

### 4.1 Development build

A dev-client build for installing on your own device/simulator so you can run
the JS bundler (`pnpm --filter rumbo start`) against it.

```bash
# Android (produces an .apk)
eas build --profile development --platform android

# iOS (produces an .ipa; requires Apple credentials on first run)
eas build --profile development --platform ios

# Both platforms at once
eas build --profile development --platform all
```

> **Heads up:** the `development` profile sets `developmentClient: true`, which
> expects the `expo-dev-client` package to be installed. It is **not** currently
> in `apps/mobile/package.json`. Before relying on this profile, add it:
> `pnpm --filter rumbo add expo-dev-client`. Without it, the build will succeed
> but the resulting app won't behave as a proper development client.

### 4.2 Preview build (internal sharing)

A standalone build to share with testers without going through the stores.

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

- **Android** → downloadable `.apk` anyone with the link can install.
- **iOS** → ad-hoc distribution. Devices must be **registered** with your Apple
  developer account first (see [Registering iOS devices](#6-installing-the-build).

### 4.3 Production build (store-ready)

Store-signed builds for submission.

```bash
eas build --profile production --platform android   # → .aab (Google Play)
eas build --profile production --platform ios        # → .ipa (App Store)
eas build --profile production --platform all
```

`autoIncrement: true` bumps the native build number automatically on every
production build so you never submit the same version twice.

### Useful flags

```bash
eas build --profile production --platform android --non-interactive   # no prompts (CI)
eas build --profile production --platform android --local             # build on your machine instead of cloud
eas build --profile production --platform android --auto-submit       # build + submit in one go
```

### Monitor a build

```bash
eas build:list                       # recent builds + status
eas build:view                       # details of the latest build
# or just open the printed URL in your browser
```

Builds take several minutes (free tier is slower). When the status is
`finished`, the URL serves the installable artifact.

---

## 5. Credentials (one-time setup per platform)

On your first build for a platform, EAS asks how to handle signing
credentials. The recommended path is to **let EAS manage them**.

### Android (keystore)

- EAS can generate a new keystore for you and store it on Expo's servers.
- Choose **"Generate new keystore"** when prompted, or set it explicitly:
  ```bash
  eas credentials --platform android
  ```
- Keep the keystore consistent across builds — Google Play rejects apps signed
  with a different key than the original upload.

### iOS (Apple Developer account)

- You need a paid **Apple Developer Program** membership.
- On first iOS build, EAS prompts for your Apple ID + team, then provisions the
  app for you. EAS stores credentials on Expo's servers.
- You'll be asked for a **bundle identifier** (e.g. `com.cecax27.rumbo`).
  Note: `app.json` currently has the **Android** `package`
  (`com.cecax27.rumbo`) set but **no `ios.bundleIdentifier`** — EAS will prompt
  for one on the first iOS build and can write it into `app.json` for you.
- Manage credentials later with:
  ```bash
  eas credentials --platform ios
  ```

### Pushing credentials config

You can pre-configure credentials behavior in `eas.json` under each profile
(`credentialsSource: "remote"` | `"local"`). By default EAS uses remote
credentials, which is what you want for a team.

---

## 6. Installing the build

### Android

- **Internal/dev builds (.apk):** open the build URL on the Android device and
  tap download. You may need to allow installs from unknown sources.
- **Production (.aab):** not directly installable — it goes to Google Play
  (via `eas submit` or manual upload).

### iOS

- **Internal/dev builds:** EAS generates a QR code + a registration URL. On
  the test device:
  1. Open the EAS project URL to **register the device's UDID** with your
     Apple developer account (one-time per device).
  2. Re-run the build (if the UDID was new) so the profile includes that device.
  3. Scan the install QR from the build page to install via the Safari
     in-app profile flow.
- **Production:** delivered to App Store Connect via `eas submit`.

### Registering iOS devices

```bash
eas device:create        # prompts for a device name + UDID
```

The UDID is shown on the device registration web page; testers visit that page
on their device and you approve it from your developer account.

---

## 7. Submitting to the stores

`eas.json` has a `submit` block with a `production` profile. Once a production
build is finished, submit it:

```bash
eas submit --platform android --profile production   # uploads latest .aab to Google Play
eas submit --platform ios    --profile production     # uploads latest .ipa to App Store Connect
```

You can also combine build + submit:

```bash
eas build --platform android --profile production --auto-submit
```

### First-time submission setup

- **Android:** create a Google Play Console account + a service account JSON
  key. On first `eas submit`, EAS asks for the service account key (paste the
  JSON contents) and stores it. You also need the app created in the Play
  Console (package `com.cecax27.rumbo`).
- **iOS:** your Apple Developer credentials (Apple ID + team) are reused from
  the build step. The app must exist in App Store Connect (EAS can create it on
  first submit).

### Submit a specific build

```bash
eas submit --platform android --profile production --latest           # latest build
eas submit --platform android --profile production --id <build-id>    # a specific build
```

---

## 8. Updating the app version

Because `appVersionSource: "remote"`, versioning is coordinated by EAS:

- The **build number** (`versionCode` / `CFBundleVersion`) auto-increments on
  `production` builds (`autoIncrement: true`).
- To bump the **marketing version** (`expo.version` in `app.json`, currently
  `0.2.0`) for a new release, use:
  ```bash
  eas build:version:get       # see current remote version
  eas build:version:set       # set a new version on the remote
  ```
  Avoid editing `app.json` -> `expo.version` by hand for releases — it can
  conflict with the remote source of truth.

---

## 9. Common pitfalls

- **`eas` command not found** — install the CLI: `npm i -g eas-cli`, then
  `eas login`.
- **Wrong directory** — run from `apps/mobile/`, not the repo root. From the
  root you can use `pnpm --filter rumbo exec eas <cmd>`.
- **Missing `expo-dev-client`** — the `development` profile sets
  `developmentClient: true`, but `expo-dev-client` isn't in
  `apps/mobile/package.json` today. Add it before doing dev builds:
  `pnpm --filter rumbo add expo-dev-client`.
- **No `ios.bundleIdentifier` in `app.json`** — only the Android `package`
  (`com.cecax27.rumbo`) is set. The first iOS build will prompt for a bundle ID;
  accept EAS's offer to write it into `app.json` and commit that change.
- **"Version is managed on EAS"** — `appVersionSource: "remote"` means don't
  manually bump `expo.version` for releases; use `eas build:version:set`.
- **iOS device won't install** — the device UDID isn't registered. Run
  `eas device:create`, then rebuild.
- **Build stuck in "pending"** — free tier queues builds. Check
  `eas build:list` or the web dashboard.
- **Submitted Android app rejected** — usually a signing mismatch. Never
  regenerate the Android keystore for an already-published app; reuse the one
  EAS stored (or restore it with `eas credentials`).

---

## 10. Quick reference

```bash
# --- one-time setup ---
npm i -g eas-cli
eas login
cd apps/mobile

# --- development build (dev client) ---
eas build --profile development --platform all

# --- internal preview build for testers ---
eas build --profile preview --platform android
eas build --profile preview --platform ios

# --- production (store-ready) build ---
eas build --profile production --platform all

# --- submit to stores (after a production build finishes) ---
eas submit --platform android --profile production
eas submit --platform ios    --profile production

# --- monitor builds ---
eas build:list
eas build:view
```
