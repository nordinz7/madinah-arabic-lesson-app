# Roadmap

This document is the long-form plan for the Madinah Arabic Lessons app. It is intentionally honest about scope: a *good* implementation of the Madinah curriculum is a multi-month effort, and the unspoken majority of that work is **content digitization**, not engineering.

If you've just discovered the project and want to contribute, the fastest way to help is to digitize a single lesson from the source PDF following the schema in [`src/types.ts`](../src/types.ts). See [Content cost](#the-hidden-cost-content) for the realistic estimate.

---

## Phases

### Phase 0 — Skeleton ✅ done

- Expo + TypeScript + Expo Router scaffold
- Forced RTL layout
- Lessons list → lesson detail Stack
- Typed data layer (`src/data/`, `src/types.ts`)
- `data.json` digitized as outline-only (Book 1, 23 lesson titles + section headings)

### Phase 1 — MVP shell (1–2 weeks)

The app feels like a real app even with skeletal content.

- App icon + splash + brand color (replace Expo defaults — required for Play Store)
- Bottom tab navigation: **Lessons / Vocabulary / Practice / Settings**
- Persistent state via `AsyncStorage`: last lesson visited, completion checkmarks per section, bookmarks, settings
- Settings screen: font size, tashkeel toggle, theme, audio speed (UI wired up; features land as they're built)
- Bundled high-quality Arabic font (Noto Naskh Arabic via `@expo-google-fonts`) — system fonts render Arabic with harakat *badly*, this single change is the biggest perceived-quality lever
- Cross-lesson search UI scaffold
- EAS dev build → real APK on a phone (not Expo Go)

### Phase 2 — Lesson 1 vertical slice (2–3 weeks)

Prove the rich-content pattern end-to-end on a single lesson, then replicate.

- Manually digitize **Lesson 1** in full from the PDF: passage, vocab table (Arabic / translit / meaning / example), all exercises *with answers*
- Tap-any-word → bottom sheet with meaning + part of speech + grammar tag (the single most useful interaction in any language app)
- Interactive exercise components: tap-to-reveal answer, fill-in-blank, multiple choice
- Audio playback per word + per passage (`expo-av`); record or source native pronunciation for Lesson 1 — for Arabic this is non-negotiable (the emphatic letters ع ح ق ط ظ ض ص خ غ are the whole point)
- Reading mode: chrome-free, larger type, distraction-free

### Phase 3 — Vocabulary + spaced repetition (2–3 weeks)

The feature that turns a reader app into an actual learning app.

- Vocabulary tab: aggregated across all lessons, browseable + searchable
- **Spaced repetition** (SM-2 or Leitner box): daily review queue of words you've encountered. This is *the* mechanic that makes vocab stick. Most "Arabic apps" skip it; the ones that don't (Quranic, Memrise) win on retention.
- Bookmarks + personal notes per word/section
- Streak counter (gentle — not Duolingo-aggressive)

### Phase 4 — Content scale-out (months, parallel)

Engineering becomes the bottleneck *less* than content. This phase is mostly transcription work, not code.

- Digitize Lessons 2–23 of Book 1 using Lesson 1 as a template
- Set up a clean contribution flow: PR template for new lessons, JSON schema validation in CI, lint rules for harakat preservation
- Audio: ideally a native-speaker recording session (one weekend gives you all 23 lessons); failing that, high-quality TTS as a placeholder

### Phase 5 — Play Store launch (1–2 weeks of process)

- EAS production build → Play Console internal track → closed beta → production
- Required artifacts: screenshots (Arabic + English), description, **privacy policy** (Play Store requires one even for fully offline apps)
- Crash reporting (Sentry free tier) + minimal privacy-respecting analytics (Aptabase or Plausible)
- Google Play review: 3–7 days

### Phase 6 — Book 2

- Schema decision: extend existing `lessons` array (continuing IDs) vs. introduce a `book` discriminator. Leaning toward the discriminator — separates the books cleanly in UI and lets Book 1 ship without Book 2 content blocking it.
- Same content pipeline as Book 1.

### Phase 7+ — Stretch (deferred)

iOS App Store · Web build · Account/cloud sync · Sentence-level audio · Arabic letter tracing/handwriting · Quranic-Arabic bridge content · Community/discussion features.

---

## Necessary UI/UX features

These aren't "nice to have" — without them, an Arabic learning app feels broken to its target audience.

### Arabic-specific (most apps get these wrong)

- **Bundled Arabic font** (Noto Naskh Arabic / Amiri / KFGQPC Uthmanic) — *not* system default. Android in particular ships Arabic fallbacks that handle harakat poorly.
- **Adjustable Arabic font size** with consideration for harakat (diacritics get unreadable when scaled small)
- **Tashkeel toggle** — show/hide diacritics on demand (intermediate learners read without; beginners need them)
- **Audio on every word and passage** — at minimum 1 normal speed + 1 slow speed
- **RTL-correct gestures**: swipe direction for next/prev follows visual reading order
- **Dark mode tuned for Arabic** — off-white on near-black, never pure white on pure black (harakat smear on OLED)

### General mobile must-haves

- Bottom-sheet word lookup (not a navigated screen — keeps reading context)
- Haptic feedback on answer-correct/wrong (`expo-haptics`, already installed)
- Skeleton loaders, no flashes of unstyled Arabic text
- Pull-to-refresh on Vocabulary tab
- Progress strip at the top of each lesson (3/8 sections, etc.)
- Reading mode — chrome-free
- Empty states with guidance, not blank screens

### High-leverage, not strictly required

- Streak counter
- Daily-review notification (one notification per day max, opt-in)
- Achievement-light gamification (Madinah is serious; don't over-Duolingo it)

---

## The hidden cost: content

The PDFs hold ~250+ pages of dense Arabic content across two books. To "follow the curriculum exactly" means transcribing all of it with harakat preserved, plus meanings, plus exercise answers, plus audio. Realistic estimates:

| Task | Effort |
| --- | --- |
| Per lesson, full digitization | 2–4 hours focused work |
| Book 1 (23 lessons) | 50–90 hours of transcription |
| Audio recording for Book 1 | 4–8 hours studio + editing |
| Book 2 | similar scale |

This is why this is open source. One person digitizing Lesson 1 perfectly, plus a contribution template, plus CI schema checks, is enough to unblock other contributors.

---

## Distinguishing principles

What this app should be (and shouldn't):

- **Authentic** — actual Madinah curriculum, not a Duolingo-style approximation
- **Open source** — community-driven, free forever
- **No ads, no IAP** — purity of mission
- **Tashkeel-first** — most apps strip harakat; we preserve it
- **Offline-first** — language learners study on commutes/planes; bundle core data, downloadable audio
- **Quality typography** — Arabic deserves better than default Roboto

---

## Where we are right now

Phase 0 done. Starting Phase 1 (MVP shell). Updated as work lands.
