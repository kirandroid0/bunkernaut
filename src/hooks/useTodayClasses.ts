/** Expands weekly slots into scheduled classes for a given date. */
import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getTodayClasses } from '@/utils/timetable'

export function useTodayClasses(date: Date = new Date()) {
  const semester = useAppStore((s) => s.getActiveSemester())

  return useMemo(() => {
    if (!semester) return []
    return getTodayClasses(semester, date)
  }, [semester, date])
}

export function useActiveSemester() {
  return useAppStore((s) => s.getActiveSemester())
}
