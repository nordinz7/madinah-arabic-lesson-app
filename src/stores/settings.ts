import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

export type SettingsState = {
  fontScale: number;
  showTashkeel: boolean;
  theme: ThemePreference;
  audioSpeed: number;
  setFontScale: (v: number) => void;
  setShowTashkeel: (v: boolean) => void;
  setTheme: (v: ThemePreference) => void;
  setAudioSpeed: (v: number) => void;
};

export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 1.6;
export const AUDIO_SPEED_OPTIONS = [0.5, 0.75, 1] as const;

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      fontScale: 1,
      showTashkeel: true,
      theme: 'system',
      audioSpeed: 1,
      setFontScale: (fontScale) =>
        set({
          fontScale: Math.max(FONT_SCALE_MIN, Math.min(FONT_SCALE_MAX, fontScale)),
        }),
      setShowTashkeel: (showTashkeel) => set({ showTashkeel }),
      setTheme: (theme) => set({ theme }),
      setAudioSpeed: (audioSpeed) => set({ audioSpeed }),
    }),
    {
      name: 'settings-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
