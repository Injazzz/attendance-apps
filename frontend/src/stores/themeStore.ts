import { create } from "zustand";
import type { Theme } from "@/lib/theme";
import { themeStorage, applyTheme } from "@/lib/theme";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",

  setTheme: (theme: Theme) => {
    themeStorage.setTheme(theme);
    set({ theme });
  },

  initializeTheme: () => {
    const theme = themeStorage.getTheme();
    applyTheme(theme);
    set({ theme });
  },
}));
