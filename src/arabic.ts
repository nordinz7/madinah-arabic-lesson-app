// Arabic diacritics (harakat + tatweel + small letter marks).
// Range covers fatha, damma, kasra, sukun, shadda, tanwin variants, etc.
const HARAKAT_REGEX = /[ً-ٰٟۖ-ۭـ]/g;

export const stripTashkeel = (s: string): string => s.replace(HARAKAT_REGEX, '');

export const maybeStripTashkeel = (s: string, show: boolean): string =>
  show ? s : stripTashkeel(s);
