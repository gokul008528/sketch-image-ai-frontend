import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 's2r_theme_preference'
const ThemeContext = createContext(null)

function resolveSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(preference) {
  const resolved = preference === 'system' ? resolveSystemTheme() : preference
  document.documentElement.setAttribute('data-theme', resolved)
  return resolved
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'light'
  )
  const [resolvedTheme, setResolvedTheme] = useState(() => applyTheme(preference))

  useEffect(() => {
    setResolvedTheme(applyTheme(preference))
    localStorage.setItem(STORAGE_KEY, preference)

    if (preference !== 'system') return undefined

    // Keep in sync if the OS-level preference changes while a tab is open.
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolvedTheme(applyTheme('system'))
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [preference])

  const setTheme = useCallback((mode) => setPreference(mode), [])

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
