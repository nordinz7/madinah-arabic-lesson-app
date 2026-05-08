import type { Book, Lesson } from '../types';
import raw from './lessons.json';

const book = raw as Book;

export const BOOK_TITLE = book.book;

export const LESSONS: Lesson[] = book.lessons
  .map((lesson) => ({
    ...lesson,
    sections: [...lesson.sections].sort((a, b) => a.order - b.order),
  }))
  .sort((a, b) => a.id - b.id);

export const getLesson = (id: number): Lesson | undefined =>
  LESSONS.find((l) => l.id === id);
