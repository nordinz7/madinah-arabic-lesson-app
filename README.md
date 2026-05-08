# Madinah Arabic Lessons

Open-source Expo (React Native) mobile app for learning Arabic from the **Madinah Arabic** book series. Designed to mirror the curriculum exactly as in the printed book, with added features (vocabulary translations, transliteration, examples, progress tracking) layered on top.

## Status

Early scaffold — the app currently renders a typed lesson outline (titles + section headings) for **Madinah Book 1**. Full lesson content is being digitized lesson-by-lesson from the source PDFs.

## Stack

- Expo SDK 54, React Native 0.81, React 19
- TypeScript (strict)
- Expo Router 6 (file-based routing, typed routes)
- RTL forced globally for Arabic-first layout

## Develop

```sh
npm install
npm start          # Expo dev server
npm run android    # open on Android device/emulator
npm run ios        # open on iOS simulator (macOS only)
npm run web        # open in browser
npm run typecheck  # tsc --noEmit
npm run lint
```

## Layout

- `app/` — Expo Router routes
  - `index.tsx` — lessons list
  - `lesson/[id].tsx` — lesson detail
- `src/data/lessons.json` — source-of-truth lesson dataset (Book 1 outline)
- `src/data/index.ts` — typed accessor (`LESSONS`, `getLesson`)
- `src/types.ts` — `Lesson`, `Section`, `SectionType`, vocab/section schema
- `components/`, `hooks/`, `constants/` — Expo template UI primitives (themed text/view, color scheme, theme constants)

## Source material

The two PDFs in the repo root (`دروس-اللغة-العربية-Madinah-Book-1.pdf`, `...-Book-2.pdf`) are the canonical reference. They are **not bundled into the app** — they exist locally as a digitization source. Book 2 has no structured data yet.

## Contributing

Contributions to digitize lesson content are very welcome. The data schema in `src/types.ts` already supports per-section `meaning`, `translit`, `notes`, and a structured `vocab` array — these fields are optional, so partial enrichment can be merged incrementally.

## License

See [LICENSE](LICENSE).
