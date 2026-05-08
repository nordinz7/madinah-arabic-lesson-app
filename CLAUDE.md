# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Open-source Expo (React Native) app for learning Arabic from the **Madinah Arabic** book series. Goal: mirror the printed curriculum exactly, adding meanings, transliteration, examples, and progress features. Target distribution is the Google Play Store.

## Stack

- Expo SDK 54, React Native 0.81, React 19, new architecture enabled
- TypeScript (strict), Expo Router 6 with `experiments.typedRoutes: true`
- RTL forced globally in `app/_layout.tsx` via `I18nManager.forceRTL(true)` — this only takes effect after a reload, so a fresh install may render LTR until the first restart. Don't undo this; the entire app is Arabic-first.

## Commands

```sh
npm install
npm start          # Expo dev server (Metro)
npm run android    # build + open on Android
npm run ios        # build + open on iOS simulator (macOS)
npm run web        # web build
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
```

There is no test runner configured yet. If asked to add tests, default to `jest-expo` (the Expo-blessed preset) and confirm with the user before scaffolding.

## Architecture

**Routing.** File-based via `expo-router`, configured as a Stack at the root with a bottom-tabs group as the anchor and `lesson/[id]` stacking on top. Tabs live in `app/(tabs)/`: `index` (Lessons), `vocabulary`, `practice`, `settings`. Typed routes are on, so `<Link href={{ pathname: '/lesson/[id]', params: { id } }} />` is type-checked — prefer this over string hrefs.

**Data layer.** Lesson content lives in `src/data/lessons.json` and is consumed via `src/data/index.ts`, which:

- casts the JSON to the `Book` type from `src/types.ts`,
- sorts `sections` by `order` and lessons by `id` at module load (so screens can render directly without re-sorting),
- exposes `LESSONS`, `BOOK_TITLE`, and `getLesson(id)`.

**Schema (`src/types.ts`).** The `Section` type extends the original outline-only shape with optional `translit`, `meaning`, `notes`, and a structured `vocab: VocabItem[]`. These are *additive and optional* on purpose: partial digitization of a lesson can be merged without breaking screens that only render `content`. When digitizing more content from the PDF, prefer extending these fields over inventing new top-level keys.

**Section types.** Closed enum: `topic | question | exercise | vocab | grammar`. Labels in both Arabic and English are exported from `src/types.ts` (`SECTION_LABELS_AR`, `SECTION_LABELS_EN`). Color palette per type lives in `src/section-style.ts`. To add a section type, update the union, both label maps, the palette, and check the lessons JSON for any new values introduced.

**State (`src/stores/`).** Two zustand stores, both persisted to AsyncStorage via `zustand/middleware`'s `persist`:

- `useSettings` — `fontScale`, `showTashkeel`, `theme` (`'system' | 'light' | 'dark'`), `audioSpeed`. The Settings tab is the source of truth UI; other screens read these values directly. `theme` flows through `src/hooks/use-effective-color-scheme.ts`, which is what `app/_layout.tsx` and `(tabs)/_layout.tsx` use instead of the template's `useColorScheme` hook.
- `useProgress` — `completedSections` (keyed `${lessonId}:${order}`), `bookmarkedLessons`, `lastLessonId`. The lesson detail screen calls `setLastLesson(id)` on mount; the lessons list reads `lastLessonId` to render a "Resume" CTA. `lessonCompletion(id, total, completedMap)` returns `{ done, total, ratio }` for progress bars.

**Typography.** `@expo-google-fonts/noto-naskh-arabic` is loaded in `app/_layout.tsx` via `useFonts`, gated by `SplashScreen.preventAutoHideAsync()` until ready. `ThemedText` defaults to `NotoNaskhArabic_400Regular` (or `_700Bold` for `title` / `subtitle` / `defaultSemiBold` types) — system fonts render Arabic with harakat poorly, especially on Android. Don't introduce raw `<Text>`; use `ThemedText` everywhere.

**Tashkeel handling.** `src/arabic.ts` exposes `stripTashkeel` and `maybeStripTashkeel(s, show)` — the lesson detail screen runs all displayed Arabic content through `maybeStripTashkeel` so the user's `showTashkeel` setting takes effect globally. New screens that render lesson content should do the same.

**UI primitives.** `components/themed-text.tsx`, `components/themed-view.tsx`, `hooks/use-theme-color.ts`, and `constants/theme.ts` are the Expo template's theme wiring. The template also left `external-link.tsx`, `haptic-tab.tsx`, and `components/ui/*` — currently orphaned, fine to delete when convenient.

## Source material

The canonical reference is the **Madinah Arabic** book series by Dr. V. Abdur Rahim. PDFs may sit in the repo root locally but are **gitignored** (`*.pdf` in `.gitignore`) and must never be committed — copyright for redistribution is uncertain, and binary blobs bloat git history permanently. Treat them as digitization input only; never `import` or bundle them.

`src/data/lessons.json` currently covers **Book 1** as an outline (section headings only, no body content) — full content needs manual transcription from the PDF, and this is expected to be the bulk of ongoing work. **Book 2 has no structured data yet** — when adding it, mirror the Book 1 schema and discuss with the user whether to extend the same `lessons` array (continuing `id`s) or introduce a `book` discriminator on each lesson.

## Conventions

- **Arabic strings**: preserve harakat (diacritics) and shadda exactly — they are pedagogically meaningful, not decoration. The file is UTF-8.
- **Path alias**: `@/*` resolves to repo root (e.g. `@/src/data`, `@/components/themed-text`). Use it instead of long relative paths.
- **Android/iOS identifiers**: `com.madinaharabic.lessons` (in `app.json`). The slug is `madinah-arabic-lessons`. Don't change these casually — they're the Play Store / App Store identity.
- **No EAS/build config yet.** If asked to set up Play Store builds, the path is `eas.json` + `eas build` — confirm Apple/Google credentials handling with the user before initializing.
