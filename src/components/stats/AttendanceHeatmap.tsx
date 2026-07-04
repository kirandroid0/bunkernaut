/** 12-week grid of daily attendance scores with color-coded cells. */
import { useMemo } from 'react'
import { subWeeks, startOfWeek } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { getHeatmapData } from '@/utils/timetable'
import { EmptyState } from '@/components/pixel/EmptyState'

function scoreStyle(score: number | null): React.CSSProperties {
  if (score === null) {
    return { backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)' }
  }
  if (score >= 1) return { backgroundColor: 'rgba(55, 61, 32, 0.95)' }
  if (score >= 0.75) return { backgroundColor: 'rgba(113, 119, 68, 0.82)' }
  if (score >= 0.5) return { backgroundColor: 'rgba(188, 189, 139, 0.72)' }
  if (score > 0) return { backgroundColor: 'rgba(118, 97, 83, 0.65)' }
  return { backgroundColor: 'rgba(192, 57, 43, 0.7)' }
}

export function AttendanceHeatmap() {
  const semester = useAppStore((s) => s.getActiveSemester())

  const data = useMemo(() => {
    if (!semester) return []
    const start = startOfWeek(subWeeks(new Date(), 11), { weekStartsOn: 1 })
    return getHeatmapData(semester, start, 12)
  }, [semester])

  const hasData = data.some((d) => d.score !== null)

  if (!hasData) {
    return (
      <EmptyState
        variant="stats"
        title="No heatmap yet"
        message="Mark some classes to see your attendance patterns~"
      />
    )
  }

  const weeks: typeof data[] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  const legendScores = [null, 0, 0.5, 0.75, 1] as const

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.score !== null ? Math.round(day.score * 100) + '%' : 'No data'}`}
                  className="w-5 h-5 pixel-art border border-[var(--color-border)]/25 rounded-sm"
                  style={scoreStyle(day.score)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 font-mono-body text-[10px] text-[var(--color-text-muted)] uppercase">
        <span>Low</span>
        {legendScores.map((s, i) => (
          <div
            key={i}
            className="w-5 h-5 pixel-art border border-[var(--color-border)]/25 rounded-sm"
            style={scoreStyle(s)}
          />
        ))}
        <span>Full</span>
      </div>
    </div>
  )
}
