import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'purple' | 'blue' | 'emerald' | 'rose' | 'amber';
export type FontScale = 'compact' | 'standard' | 'large';
export type FontFamily = 'inter' | 'sans' | 'serif' | 'mono';

interface AppearanceState {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  fontScale: FontScale;
  fontFamily: FontFamily;
  
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontScale: (scale: FontScale) => void;
  setFontFamily: (family: FontFamily) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      accentColor: 'purple',
      fontScale: 'compact',
      fontFamily: 'inter',
      
      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (color) => set({ accentColor: color }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setFontFamily: (family) => set({ fontFamily: family }),
    }),
    {
      name: 'chatr-appearance-settings',
    }
  )
);
