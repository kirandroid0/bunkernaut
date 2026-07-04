import { useEffect } from 'react'
import { format } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { getTodayClasses } from '@/utils/timetable'

/** Auto-mark scheduled classes as Holiday when date is in institute calendar */
export function useAutoHolidayMarking(date: Date) {
  const semester = useAppStore((s) => s.getActiveSemester())
  const upsertAttendance = useAppStore((s) => s.upsertAttendance)

  useEffect(() => {
    if (!semester) return
    const dateStr = format(date, 'yyyy-MM-dd')
    if (!semester.holidays.some((h) => h.date === dateStr)) return

    const classes = getTodayClasses(semester, date)
    for (const cls of classes) {
      if (!cls.entry) {
        upsertAttendance(cls.componentId, dateStr, 'Holiday', cls.durationMinutes)
      }
    }
  }, [semester, date, upsertAttendance])
}
