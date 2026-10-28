import { create } from 'zustand'

const getInitialTheme = () => {
  const saved = localStorage.getItem('healthrisk_theme')
  // By default, it is white (light) theme as requested
  if (saved === 'dark' || saved === 'light') {
    return saved
  }
  return 'light'
}

const applyThemeToDOM = (theme) => {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Apply on initial script evaluation
const initialTheme = getInitialTheme()
applyThemeToDOM(initialTheme)

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('healthrisk_theme', nextTheme)
      applyThemeToDOM(nextTheme)
      return { theme: nextTheme }
    })
  },
  setTheme: (newTheme) => {
    localStorage.setItem('healthrisk_theme', newTheme)
    applyThemeToDOM(newTheme)
    set({ theme: newTheme })
  },
}))
