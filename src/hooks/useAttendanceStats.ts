import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { computeCourseStats } from '@/utils/calculations'
import { entriesWithRescheduled } from '@/utils/rescheduled'

/** Derives per-course attendance stats for the active semester. */
export function useAttendanceStats() {
  const semester = useAppStore((s) => s.getActiveSemester())

  return useMemo(() => {
    if (!semester) {
      return { courseStats: [] }
    }

    const entries = entriesWithRescheduled(semester)
    const courseStats = semester.courses.map((c) => computeCourseStats(c, entries))

    return { courseStats }
  }, [semester])
}
