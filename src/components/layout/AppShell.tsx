/** App shell with theme, nudges, page outlet, and bottom navigation. */
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useTheme } from '@/hooks/useTheme'
import { useNudges } from '@/hooks/useNudges'

export function AppShell() {
  useTheme()
  useNudges()

  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
