/** Analytics: heatmap, trends, bunk calculator, decision log, and timetable grid. */
import { useState } from 'react'
import { useAttendanceStats } from '@/hooks/useAttendanceStats'
import { useAppStore } from '@/store/useAppStore'
import { AttendanceHeatmap } from '@/components/stats/AttendanceHeatmap'
import { TrendChart } from '@/components/stats/TrendChart'
import { BunkCalculator } from '@/components/stats/BunkCalculator'
import { BunkDecisionLog } from '@/components/bunk/BunkDecisionLog'
import { WeeklyGrid } from '@/components/timetable/WeeklyGrid'
import { Card } from '@/components/ui/Card'
import clsx from 'clsx'

export function StatsPage() {
  const { courseStats } = useAttendanceStats()
  const bunkDecisions = useAppStore((s) => s.getActiveSemester()?.bunkDecisions ?? [])
  const [trendMode, setTrendMode] = useState<'weekly' | 'monthly'>('weekly')

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="heading-impact text-2xl text-[var(--color-text)]">Stats</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Heatmaps, trends & bunk math~
        </p>
      </header>

      <Card>
        <h2 className="heading-impact text-lg text-[var(--color-text)] mb-3">Heatmap</h2>
        <AttendanceHeatmap />
      </Card>

      <div>
        <div className="flex gap-2 mb-3">
          {(['weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTrendMode(mode)}
              className={clsx(
                'pixel-btn px-4 py-1.5 text-xs capitalize',
                trendMode === mode
                  ? 'bg-[var(--color-primary-btn)] text-[var(--color-primary-btn-text)]'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        <TrendChart mode={trendMode} />
      </div>

      {courseStats.length > 0 && (
        <section>
          <h2 className="heading-impact text-lg text-[var(--color-text)] mb-3">
            Bunk calculator
          </h2>
          <div className="space-y-3">
            {courseStats.map((cs) => (
              <div key={cs.courseId}>
                <p className="text-sm font-bold mb-2 flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded pixel-art inline-block"
                    style={{ backgroundColor: cs.color }}
                  />
                  {cs.courseName}
                </p>
                <BunkCalculator stats={cs} label="Course total" />
                <div className="space-y-2 mt-2 pl-2">
                  {cs.components.map((comp) => (
                    <BunkCalculator key={comp.componentId} stats={comp} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="heading-impact text-lg text-[var(--color-text)] mb-3">Decision log</h2>
        <BunkDecisionLog decisions={bunkDecisions} />
      </section>

      <section>
        <h2 className="heading-impact text-lg text-[var(--color-text)] mb-3">Timetable</h2>
        <WeeklyGrid />
      </section>
    </div>
  )
}
