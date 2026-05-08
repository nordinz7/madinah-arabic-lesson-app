// Arabic diacritics (harakat + tatweel + small letter marks).
// Range covers fatha, damma, kasra, sukun, shadda, tanwin variants, etc.
const HARAKAT_REGEX = /[ً-ْٰۖ-ۭـ]/g;

export const stripTashkeel = (s: string): string => s.replace(HARAKAT_REGEX, '');

export const maybeStripTashkeel = (s: string, show: boolean): string =>
  show ? s : stripTashkeel(s);

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

export const toArabicNumber = (n: number): string =>
  String(Math.trunc(n))
    .split('')
    .map((d) => (d >= '0' && d <= '9' ? ARABIC_DIGITS[Number(d)] : d))
    .join('');

// Lesson titles in the dataset come as "الدرس الأول" / "الدَّرْسُ الأَوَّلُ".
// The grid only needs the ordinal half — strip the "lesson" word.
// Done by stripping tashkeel from a copy, checking the prefix matches,
// then walking the original string to skip the equivalent characters
// (a regex with optional harakat is fragile because each diacritic
// is its own combining codepoint, not part of the preceding letter).
const LESSON_WORD = 'الدرس ';

export const stripLessonPrefix = (title: string): string => {
  const stripped = stripTashkeel(title.trimStart());
  if (!stripped.startsWith(LESSON_WORD)) return title.trim();
  const leadingWhitespace = title.length - title.trimStart().length;
  let titleIdx = leadingWhitespace;
  let strippedIdx = 0;
  while (strippedIdx < LESSON_WORD.length && titleIdx < title.length) {
    const ch = title[titleIdx];
    titleIdx++;
    if (!HARAKAT_REGEX.test(ch)) {
      // HARAKAT_REGEX has the global flag — reset lastIndex per test.
      strippedIdx++;
    }
    HARAKAT_REGEX.lastIndex = 0;
  }
  return title.slice(titleIdx).trim();
};
