# Learning Section

## Feature Name

**Learning Section** — the core educational experience of Rumbo: a structured, level-based curriculum of topics with automatic habit tracking, so users learn personal finance concepts and turn them into real habits through actual use of the app.

---

## Description

This feature is the reason Rumbo exists. It gives users a practical, guided path to improve their personal finances — not as a static library of articles, but as a progression of **levels** containing **topics**, where finishing a topic requires practicing what it teaches.

From the user's perspective, this feature ensures that:

- A user can open the **learning section** from both mobile and web and see **where they are**: which level they are on, how many levels exist in total, and their **completion percentage** within the current level.
- Before starting into the curriculum, the user is shown an **introductory section** explaining Rumbo's recommended approach: don't try to absorb everything at once; read a topic, understand it, practice its **habit**, and only move on once the habit has taken hold. Good finances come from the best habits, not the most knowledge — built through consistency, patience, and 1% daily improvement.
- A user can read a **topic**, which may contain text, **infographics** (downloadable and shareable), and illustrations (not downloadable).
- A user can open **tutorials** from within a topic: separate, step-by-step screens — with screenshots — that show how to perform a specific task in the app, linking the app's tools to the concept being taught (e.g., "enter the category in this field; here you distinguish expenses, needs, and obligations").
- A **topic with a habit** is only marked as finished when the habit — Rumbo's word for "challenge" — is completed. **Habits update automatically** as the user interacts with the app; the user never self-reports completion.
- A **topic without a habit** can be finished via an explicit **"mark as complete"** button.
- Once a habit is completed, it is **recorded permanently** in the database; its status never changes afterwards.
- A user can **reset their learning progress**: a global reset from the configuration page, and individual resets per topic or level within the learning section, in case they want to start over.
- Topic content is **fetched from the database and cached locally**, so it can be updated without recompiling the app, and read **offline**.

The feature also delivers an **authoring guide**: a Markdown document with instructions for creating topics, intended for publication in the GitHub wiki, so content contributors can add topics without developer involvement.

---

## Problem and Purpose

### The problem

Rumbo's mission names the learning section as the app's **main feature** — the strategy through which both product objectives are achieved: better control over personal finances, and a genuine starting point for people who know nothing about personal finance. Today, none of that exists. Concretely:

1. **Users arrive with uneven starting points.** Some know personal finance concepts; others start from scratch. A raw dashboard or a static article library serves neither: beginners are lost, and intermediates see nothing new. There is no guided path that meets both groups and walks them through Rumbo's recommended way of using the app.

2. **Knowledge alone doesn't change behavior.** Mexico's financial education deficit isn't solved by giving people more text to read. A person can understand "spend less than you earn" and still never do it. What changes outcomes is practicing the behavior — which is exactly what a mechanism tied to real app usage (record expenses, review weekly, categorize…) can verify, and a static article cannot.

3. **"Challenge" is the wrong word.** The behavior Rumbo wants to verify is a recurring, mundane practice — a habit. Framing it as a challenge implies a one-time test with a prize, not a durable change. The product language must consistently say **habit**.

4. **Manual completion would be meaningless.** If users could tick "I recorded my expenses for 7 days" by hand, the record would say nothing about their actual behavior. Completion must be derived from the user's real interaction with the app, and once true, it must be immutable — a habit that was genuinely established shouldn't un-establish because of a bad week.

5. **Content must be updatable without shipping.** Learning content will evolve constantly. If topics were bundled into the app binaries, every content fix would require a store review and a recompile. Content must live in the database and be fetched and cached by the clients.

6. **There is no authored content pipeline.** For the section to be sustainable, the people writing topics need written instructions for the format — stored where contributors work (the GitHub wiki) — so developers don't become the bottleneck for every typo.

### Why this feature is necessary

Every other part of Rumbo (transactions, accounts, dashboards) is a tool. The learning section is what turns the tools into changed behavior — it is the product's stated main strategy. Without it, Rumbo is a tracker; with it, it is a coach.

### What outcome indicates success

- A user on either platform can enter the learning section, understand their position in the curriculum at a glance, and know what to do next.
- Reading a topic and practicing its habit are visibly connected: the habit's progress reflects the user's real activity in the app.
- A completed habit is a trustworthy, permanent record.
- Content can be corrected or extended in the database and reach users' cached copies without an app release.
- A contributor can follow the wiki guide to produce a valid topic without touching code.

---

## Normal Flow

1. **Entering the section.** An authenticated user opens the learning section from the app's main navigation (mobile and web). If the user has never seen the introduction, the **introductory section** is presented first.

2. **The introduction.** The user reads Rumbo's recommended approach: you don't need to read everything or understand it all in one day. Read a topic, understand it, practice its habit; move to the next topic only after the habit is established. Sound personal finance is about who has the best habits, not who knows or reads the most — habits are built through consistency and patience, always seeking the 1% daily improvement.

3. **Seeing their position.** The user sees their **current level**, the **total number of levels**, and within the current level, their **completion percentage** — a signal of momentum to keep going.

4. **Opening a topic.** The user opens a topic in their current level. The topic renders its content: text, possibly infographics (viewable, downloadable, shareable), and illustrations (viewable only).

5. **Following a tutorial (optional).** From within the topic, the user can open a **tutorial**: a separate screen with step-by-step instructions and screenshots showing how to perform a specific task in the app, connecting the concept to the app's tools.

6. **Practicing the habit.** If the topic has a habit, the user goes to the relevant part of the app and does the real work (e.g., records expenses). As the user interacts with the app, the **habit's progress updates automatically**. When the habit's specific completion condition is satisfied, the habit is marked complete and recorded in the database.

7. **Topic completion.** When the habit completes, the topic is marked as finished. If the topic has no habit, the user instead presses **"mark as complete"** and the topic is finished directly.

8. **Progress and level advancement.** Completion percentage updates. When the topics of a level are finished, the user advances to the next level and sees their new position.

9. **Content freshness (background).** When the user opens the app, a **background fetch** checks the content version. If it is the latest, nothing happens; otherwise, the new content is downloaded and stored in local memory, replacing the cached copy.

10. **Resetting progress (on demand).** From the configuration page, the user can reset all learning progress. Within the learning section, the user can reset an individual topic's or level's habits. After a reset, the affected habits and topics return to an unstarted state, ready to be completed again.

### Authoring flow (team side)

A contributor follows the **topic-creation guide** (a Markdown document, published to the GitHub wiki) to write a topic, its habit, and its tutorial. The topic is stored in the database and becomes available to users through the normal background fetch.

---

## Alternative Flows

- **Returning user mid-level.** A user who re-enters the learning section partway through a level resumes at their current position; completed topics remain visibly finished and habits remain completed.
- **Offline user.** A user without a connection opens the learning section and reads from the locally cached content. Progress continues to be tracked locally and synced when connectivity returns. The background version check simply doesn't run.
- **First open with no cache and no connection.** A user opens the learning section for the first time while offline and has no cached content: they see a clear message that the content couldn't be downloaded, with a retry — not an empty or broken screen.
- **User resets all progress.** The user confirms the global reset from the configuration page; all levels, topics, and habits return to unstarted. The user re-encounters the learning section as if beginning again.
- **User resets a single topic or level.** Only the selected scope is cleared; everything else is untouched.
- **User cancels a reset.** The user backs out of the reset confirmation; nothing changes.
- **User downloads or shares an infographic.** The infographic is saved to the device or shared through the platform's share mechanism. If the action fails (permission denied, no share target), the user is informed and can retry.
- **User opens a tutorial and backs out.** The user returns to the topic without completing the tutorial; tutorials are optional and never gate topic completion.
- **Habit completes while the user is elsewhere.** The habit's completion is detected from app usage regardless of where the user is in the app; the next visit to the learning section reflects the finished topic.
- **Content updates mid-use.** The background fetch replaces cached content while the user is elsewhere in the app; the learning section shows the new version on next entry, and the user's progress is preserved.

---

## Business Rules

1. **The curriculum is organized as levels → topics.** Levels are the curriculum's stages; topics are the units of learning inside a level. A topic belongs to exactly one level.

2. **"Habit" is the product term.** Everywhere the user sees it, the concept is called a **habit** — never "challenge" or "test."

3. **A topic with a habit is finished only by completing the habit.** The manual "mark as complete" action exists only for topics without a habit; it is never offered as a shortcut for habit-based topics.

4. **Habit completion is automatic and evidence-based.** Each habit has its own specific completion logic, evaluated from the user's actual interaction with the app. The user can never mark a habit as done by hand.

5. **Completed habits are immutable.** Once recorded in the database, a habit's completed status never changes — not by later behavior, not by time, not by partial re-practice. The only way to redo a habit is an explicit reset.

6. **Resets are explicit, scoped, and confirmed.** A global reset (configuration page) clears all learning progress. Individual resets clear a single topic's or level's habits. Every reset requires confirmation before anything is cleared.

7. **Progress is per-user and server-side.** Level position, topic completion, and habit records are stored in the database against the user, so progress is the same on web and mobile.

8. **The introduction precedes the curriculum.** A user entering the learning section for the first time sees the introductory section before starting a level.

9. **Position and progress are always visible.** Within the learning section, the user can see their current level, the total number of levels, and the completion percentage of their current level.

10. **Tutorials are separate, optional modules.** A tutorial opens as its own screen(s) from within a topic, uses screenshots to guide a concrete app task, and never blocks topic completion.

11. **Infographics are downloadable and shareable; illustrations are not.** This distinction is fixed per asset type, not per user choice.

12. **Content lives in the database, not in the app binaries.** Topics (HTML or equivalent format) are fetched over the internet so content can be updated without recompiling the app.

13. **Content is cached locally and version-checked.** On app open, a background fetch compares the available content version with the cached one: same version → do nothing; newer → download and store locally. Cached content must remain readable offline.

14. **Reset habits can be completed again.** After a reset, the affected habits return to an unstarted state and follow the same automatic completion rules as before.

---

## Data Involved

- **Learning content (levels, topics)** — the curriculum served from the database: level definitions, topic bodies in HTML (or an equivalent stored format), and the content version. Created and maintained by the team (via the authoring flow); read by clients; cached in local memory on each device. Never edited by users.

- **Infographics** — images attached to topics, viewable, downloadable, and shareable. Part of the served content; cached with it.

- **Illustrations** — images attached to topics, viewable only. Part of the served content; cached with it.

- **Tutorials** — step-by-step instructions (with screenshots) linked from a topic, produced by the authoring flow and served with the content. Read-only for users.

- **Habit definition** — per topic, the description of the habit and its specific completion logic. Authored with the content; read by the app to evaluate completion.

- **Habit progress** — the user's current state on each uncompleted habit (e.g., days recorded so far), derived from the user's activity in the app. Read to display progress; updated automatically as the user interacts with the app.

- **Habit completion record** — the permanent record that a habit was completed, written once to the database when the completion condition is satisfied. Never modified afterwards except by an explicit reset (which deletes the record so the habit can be re-earned).

- **Topic completion** — whether a topic is finished (via habit or manual mark) and when. Read for progress display and level advancement; created on completion; cleared by resets.

- **Level position** — the user's current level, derived from topic completions. Displayed with the total number of levels and the current level's completion percentage.

- **Reset action** — a user-initiated, confirmed command (global, per-level, or per-topic) that clears the affected progress records. Executed from the configuration page (global) or the learning section (scoped).

- **Introduction flag** — whether the user has seen the introductory section. Read on entering the learning section; set once seen.

- **Content version** — the version identifier of the available content, compared by the background fetch against the cached version to decide whether to re-download.

- **Authoring guide** — the Markdown document explaining how to create topics (structure, habits, tutorials, assets). Maintained in the repository and published to the GitHub wiki. Not application data.

---

## Validations

### User input validation

- **"Mark as complete"** — only offered on topics without a habit; requires an explicit press, never triggered accidentally (no swipe-to-complete).
- **Global reset** — requires explicit confirmation before any progress is cleared.
- **Scoped reset (topic/level)** — requires explicit confirmation, and clearly states what will be lost.

### Business rule validation

- A habit-based topic must not be completable by any manual action.
- A habit must not be recorded as complete unless its specific completion condition is genuinely satisfied by the user's activity data.
- A completed habit must never transition back to incomplete except via an explicit, confirmed reset.
- A topic's manual completion must only be accepted for topics authored without a habit.
- A user must not advance beyond a level whose topics are unfinished (see Open Questions — gating policy).
- Reset scopes must be enforced exactly: a topic reset never touches other topics; a level reset clears only that level; a global reset clears everything.

### System state validation

- The learning section requires an authenticated session; progress is always tied to the logged-in user.
- Cached content must be present or fetchable before topics can be rendered; if neither, a clear error state is shown.
- The background fetch must compare versions before downloading, and must not replace the cache with an older version.
- Habit evaluation must only run against the user's own activity data, scoped by the user's session.

---

## Possible Errors and Edge Cases

- **First open, no cache, offline.** The user sees an explanatory error with a retry option — never a blank screen or a silent failure.
- **Content fetch fails on a later open.** The user keeps reading the cached version; the failure is not surfaced as a blocking error inside the learning section.
- **Corrupt or invalid downloaded content.** The app must not render broken content over a working cache; the previous cache is kept (or the error state is shown if none exists), and the failed version is re-attempted later.
- **Habit completion event races** (e.g., two actions land near-simultaneously, either of which completes the habit). The habit is recorded exactly once; duplicate records must not be possible.
- **Reset while the user is inside the learning section.** The UI reflects the cleared state immediately and consistently; no zombie completed-badges remain.
- **Reset during habit evaluation.** A reset and an in-flight completion must not interleave into an inconsistent state (e.g., a completion recorded for a habit the user just reset).
- **Infographic download fails** (permissions, storage full). The user is informed and may retry; the topic remains fully usable.
- **Infographic share unavailable** (no share target, web browser without Web Share). The option degrades gracefully (e.g., download offered instead) rather than erroring.
- **Large content update on a metered/slow connection.** The background fetch downloads without blocking the user's use of the app; on failure, the cached version remains authoritative.
- **Habit logic references app areas not yet built.** A habit whose evidence source doesn't exist yet can never complete; the section must not crash or show a broken progress state because of it (see Open Questions).
- **User deletes their account.** Learning progress and habit records are removed with the rest of the user's data, per the app-foundation deletion cascade.
- **Content updated while a topic is open.** The open topic finishes rendering from the version it was opened with; the new version appears on the next entry. Progress is never lost to a content update.

---

## Acceptance Criteria

1. **Access on both platforms.** Given an authenticated user on web or mobile, when they open the main navigation, then a learning section entry point exists and leads to the learning home.

2. **Position and progress visible.** Given a user in the learning section, then they can see their current level, the total number of levels, and the completion percentage of their current level, and these values update as topics are completed.

3. **Introduction shown before starting.** Given a user entering the learning section for the first time, then the introductory section — the recommended approach (read → understand → practice the habit → move on), habits over knowledge, consistency and the 1% daily improvement — is presented before they begin a level.

4. **Topic reading.** Given a user opens a topic, then its content (text, infographics, illustrations) renders from the served/cached content, and any tutorial defined for the topic can be opened as a separate step-by-step screen with screenshots.

5. **Infographic actions.** Given a topic with an infographic, then the user can download and share it. Given an illustration, then no download or share action is offered.

6. **Habit-based completion is automatic.** Given a topic with a habit, when the user's real app activity satisfies the habit's specific completion condition, then the habit is recorded as complete in the database, the topic is marked finished, and no manual completion path exists for that topic.

7. **Manual completion for habit-less topics.** Given a topic authored without a habit, when the user presses "mark as complete," then the topic is marked finished.

8. **Habit records are immutable.** Given a completed habit, then its status never changes afterwards regardless of the user's subsequent behavior.

9. **Habit terminology.** Given any user-facing learning-section text on either platform, then the concept is always called "habit" (hábito), never "challenge."

10. **Global reset from configuration.** Given an authenticated user on the configuration page, when they trigger the learning-progress reset and confirm, then all levels, topics, and habits return to unstarted on both platforms.

11. **Scoped reset.** Given a user in the learning section, when they reset a single topic or level and confirm, then only that scope is cleared and other progress is untouched.

12. **Background content sync.** Given the app is opened, then the content version is checked in the background; given a newer version exists, then it is downloaded and cached; given the same version, then nothing is downloaded.

13. **Offline reading.** Given a user with cached content who goes offline, then they can still open and read topics, and their progress continues to be recorded and synced when back online.

14. **Cross-platform progress.** Given a user completes a habit on mobile, when they open the learning section on web, then the same completion and progress are reflected.

15. **Authoring guide exists.** Given the repository, then a Markdown document exists with the instructions to create topics (content structure, habits, tutorials, assets), ready for publication to the GitHub wiki.

16. **Errors surfaced, never swallowed.** Given any learning-section failure (fetch, cache, download, share, reset), then the user sees a clear, non-technical message and a path forward — consistent with the app-foundation error standard.

---

## Out of Scope

- **The actual learning topics** — writing the curriculum content for any level is explicitly excluded; this feature delivers the section, its mechanisms, and the authoring guide.
- **Assets for the learning topics** — infographics, illustrations, and tutorial screenshots for real content.
- **New financial tools the habits might reference** — transactions, accounts, budgets, and dashboards are separate features; this feature only reads their data where a habit's logic requires it.
- **Gamification beyond progress percentage** — streaks, badges, points, leaderboards, or notifications/reminders about habits. Not part of this iteration.
- **Content authoring UI** — topics are created through the database / team workflow described in the wiki guide, not through an in-app editor.
- **A custom recommendation engine** — the path is the curriculum order, not personalized topic selection.
- **Non-authenticated access** — the learning section requires a session; public/preview content is not in scope.
- **Full offline-first sync of the entire app** — offline support is scoped to reading cached topics and recording progress; a general offline architecture is a separate concern.

---

## Open Questions

1. **Navigation entry point.** Where exactly does the learning section live in each app's navigation — a fifth tab on mobile (currently 4 tabs), an item in the web sidebar, or an entry from the dashboard? This affects both apps' layouts and should be settled before planning.

*On mobile, a fifth tab, and in web, on the sidebar.*

2. **Level gating policy.** Must a user finish all topics of level N before level N+1 topics are *accessible*, or are future levels visible-but-locked, or fully browsable with only "position" being tracked? The issue guarantees position/percentage visibility but doesn't define locking.

*All the content will be accessible all the time for users. Users has the option to choose what topics want to complete by themselves. This can be challenging, as a user might inadvertently complete a habit without realizing it belongs to a later topic. Habits should be completed intentionally; therefore, we should include a button for each habit to start tracking the requirements for its completion. This also prevents users from accidentally starting a bunch of habits simply by opening topics out of curiosity.*

3. **Level identity.** Are the learning section's levels the same 7 levels of the roadmap curriculum (Awareness → Mastery)? If so, at launch only the Awareness level will have content (in a later feature) — should the section render the full 7-level skeleton, or only levels that have content?

*Only the levels with content.*

4. **Sample/test content.** Topics are out of scope, but the pipeline (serving, caching, habit evaluation, completion, reset) can't be verified with zero content. Should this feature include one throwaway sample topic with a trivial habit (e.g., "open the app 2 days in a row") purely for end-to-end verification, to be removed when real content lands?

*Yes, should include a sample topic to test the feature.*

5. **Habit logic placement.** Each habit "has its own specific logic for completion." Is that logic evaluated client-side (the app inspects the user's local activity and writes the completion), server-side (the database detects the condition from the user's data), or a mix? This is primarily a plan-stage decision, but the spec must know whether habit evaluation can depend on features not yet built.

*Mix. The habits only can be completed by users actions. So we can take advantage of computing power from the client-side. But the resources for the evaluations must be able for all platforms and all sesions. Once the habit is completed, the client only update the state on the database.*

6. **Intro repetition policy.** Is the introductory section shown once (first entry only), or before starting *each* level? Can it be re-read later from somewhere?

*Only first entry. But should be accessible any time.*

7. **Content format confirmation.** The issue says "HTML — or another format stored in the database." Is HTML (rendered with a sanitized renderer on both platforms) confirmed, or should the plan evaluate alternatives (e.g., Markdown, structured JSON blocks) for security and offline-caching simplicity?

*Should evaluate alternatives. Choose the best option based on space optimization, without sacrificing format flexibility. It should allow for title hierarchies and special paragraph types—such as concepts, quotes, etc.—as well as formatting like bold, italics, and tables.*

8. **Progress sync mechanics.** For offline progress recording: is last-write-wins acceptable, or is there a conflict scenario (habit completes offline on mobile and online on web) that must be resolved deterministically? (Given habit immutability, "first completion wins" may be sufficient — confirm.)

*Currently, the application lacks offline functionality, such as adding expenses while offline and syncing upon going online. If such features were implemented, the synchronization process would need to first sync all pending transactions, check for habits completed via the web or another session, and evaluate pending habits.*