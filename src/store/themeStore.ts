import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ThemeState {
  primaryColor: string
  fontFamily: string
  darkMode: boolean
  setPrimaryColor: (color: string) => void
  setFontFamily: (font: string) => void
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void
  resetTheme: () => void
}

const defaultTheme = {
  primaryColor: '222.2 47.4% 11.2%',
  fontFamily: "'Inter', system-ui, sans-serif",
  darkMode: false,
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...defaultTheme,
      setPrimaryColor: (color: string) => set({ primaryColor: color }),
      setFontFamily: (font: string) => set({ fontFamily: font }),
      setDarkMode: (dark: boolean) => set({ darkMode: dark }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      resetTheme: () => set(defaultTheme),
    }),
    {
      name: 'lms-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

