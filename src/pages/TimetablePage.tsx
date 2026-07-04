/** Weekly L/T/P timetable grid for the active semester. */
import { WeeklyGrid } from '@/components/timetable/WeeklyGrid'

export function TimetablePage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <h1 className="heading-impact text-xl text-[var(--color-text)]">Timetable</h1>
        <p className="font-mono-body text-[11px] text-[var(--color-text-muted)] mt-1">
          Weekly L / T / P grid
        </p>
      </header>

      <WeeklyGrid />
    </div>
  )
}
