import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useTheme } from '@/hooks/useTheme'
import { useNudges } from '@/hooks/useNudges'

export function AppShell() {
  useTheme()
  useNudges()

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-24">
      <main className="max-w-lg mx-auto px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
