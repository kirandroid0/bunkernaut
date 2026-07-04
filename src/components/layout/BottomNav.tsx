/** Fixed bottom tab bar for the five main routes. */
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { PixelNavIcon } from '@/components/pixel/PixelNavIcon'
import type { NavIconKey } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'

const tabs: { to: string; label: string; icon: NavIconKey }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/today', label: 'Today', icon: 'today' },
  { to: '/timetable', label: 'Timetable', icon: 'timetable' },
  { to: '/courses', label: 'Courses', icon: 'courses' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-bg-secondary)] border-t-[3px] border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-[4.75rem] max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-1 py-1 min-w-0',
                isActive
                  ? 'opacity-100'
                  : 'opacity-60 hover:opacity-80',
              )
            }
          >
            <PixelNavIcon icon={tab.icon} size={ICON_SIZES.nav} />
            <span className="heading-impact text-[10px] uppercase tracking-wide truncate max-w-[56px]">
              {tab.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
