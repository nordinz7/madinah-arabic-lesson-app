export type SectionType =
  | 'topic'
  | 'question'
  | 'exercise'
  | 'vocab'
  | 'grammar';

export type Gender = 'm' | 'f';

export type VocabItem = {
  arabic: string;
  translit?: string;
  meaning?: string;
  example?: string;
  gender?: Gender;
  plural?: string;
  pluralTranslit?: string;
};

export type ExerciseItem = {
  prompt: string;
  translit?: string;
  meaning?: string;
  answer?: string;
  hint?: string;
};

export type Section = {
  type: SectionType;
  content: string;
  order: number;
  translit?: string;
  meaning?: string;
  notes?: string;
  vocab?: VocabItem[];
  examples?: ExerciseItem[];
  items?: ExerciseItem[];
};

export type Lesson = {
  id: number;
  title: string;
  titleEn?: string;
  sections: Section[];
};

export type Book = {
  book: string;
  lessons: Lesson[];
};

export const SECTION_LABELS_AR: Record<SectionType, string> = {
  topic: 'موضوع',
  question: 'سؤال',
  exercise: 'تمرين',
  vocab: 'مفردات',
  grammar: 'قواعد',
};

export const SECTION_LABELS_EN: Record<SectionType, string> = {
  topic: 'Topic',
  question: 'Question',
  exercise: 'Exercise',
  vocab: 'Vocabulary',
  grammar: 'Grammar',
};
