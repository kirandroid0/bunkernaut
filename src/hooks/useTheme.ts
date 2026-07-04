/** Syncs light/dark theme to the data-theme attribute on <html>. */
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useTheme() {
  const theme = useAppStore((s) => s.settings.theme)
  const updateSettings = useAppStore((s) => s.updateSettings)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    updateSettings({ theme: theme === 'light' ? 'dark' : 'light' })
  }

  return { theme, toggleTheme }
}
