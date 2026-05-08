import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const sectionKey = (lessonId: number, order: number) => `${lessonId}:${order}`;

export type ProgressState = {
  completedSections: Record<string, true>;
  bookmarkedLessons: Record<number, true>;
  lastLessonId: number | null;
  toggleSection: (lessonId: number, order: number) => void;
  isSectionCompleted: (lessonId: number, order: number) => boolean;
  toggleBookmark: (lessonId: number) => void;
  setLastLesson: (lessonId: number) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSections: {},
      bookmarkedLessons: {},
      lastLessonId: null,
      toggleSection: (lessonId, order) => {
        const key = sectionKey(lessonId, order);
        const next = { ...get().completedSections };
        if (next[key]) delete next[key];
        else next[key] = true;
        set({ completedSections: next });
      },
      isSectionCompleted: (lessonId, order) =>
        Boolean(get().completedSections[sectionKey(lessonId, order)]),
      toggleBookmark: (lessonId) => {
        const next = { ...get().bookmarkedLessons };
        if (next[lessonId]) delete next[lessonId];
        else next[lessonId] = true;
        set({ bookmarkedLessons: next });
      },
      setLastLesson: (lastLessonId) => set({ lastLessonId }),
      reset: () =>
        set({
          completedSections: {},
          bookmarkedLessons: {},
          lastLessonId: null,
        }),
    }),
    {
      name: 'progress-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ completedSections, bookmarkedLessons, lastLessonId }) => ({
        completedSections,
        bookmarkedLessons,
        lastLessonId,
      }),
    },
  ),
);

export const lessonCompletion = (
  lessonId: number,
  totalSections: number,
  completedMap: Record<string, true>,
): { done: number; total: number; ratio: number } => {
  let done = 0;
  for (const key of Object.keys(completedMap)) {
    const [lid] = key.split(':');
    if (Number(lid) === lessonId) done += 1;
  }
  return { done, total: totalSections, ratio: totalSections === 0 ? 0 : done / totalSections };
};
