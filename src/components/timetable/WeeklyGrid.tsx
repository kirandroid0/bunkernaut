/** Weekly timetable grid showing all scheduled L/T/P slots. */
import { useMemo } from 'react'
import { startOfWeek, addDays, format } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { getWeekSchedule } from '@/utils/timetable'
import { DAY_LABELS } from '@/types'
import { Card } from '@/components/ui/Card'

interface WeeklyGridProps {
  weekStart?: Date
}

export function WeeklyGrid({ weekStart: propStart }: WeeklyGridProps) {
  const semester = useAppStore((s) => s.getActiveSemester())
  const weekStart = propStart ?? startOfWeek(new Date(), { weekStartsOn: 1 })

  const schedule = useMemo(() => {
    if (!semester) return []
    return getWeekSchedule(semester, weekStart)
  }, [semester, weekStart])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  if (!semester || semester.courses.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-[var(--color-text-muted)]">Add courses to see your timetable~</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[var(--color-text-muted)]">
        Week of {format(weekStart, 'MMM d, yyyy')}
      </p>
      {days.map((day, dayIndex) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayClasses = schedule.filter((c) => c.date === dateStr)

        return (
          <Card key={dateStr} padding="sm">
            <p className="text-sm font-bold text-[var(--color-text)] mb-2">
              {DAY_LABELS[dayIndex]} · {format(day, 'MMM d')}
            </p>
            {dayClasses.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">Free day~</p>
            ) : (
              <div className="space-y-1.5">
                {dayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg"
                    style={{ backgroundColor: `${cls.courseColor}25` }}
                  >
                    <span
                      className="w-4 h-4 rounded pixel-art shrink-0"
                      style={{ backgroundColor: cls.courseColor }}
                    />
                    <span className="font-semibold truncate flex-1">{cls.courseName}</span>
                    <span className="text-[var(--color-text-muted)]">{cls.startTime}</span>
                    <span className="font-bold">{cls.entry ? '✓' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
