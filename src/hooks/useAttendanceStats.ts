import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  computeCourseStats,
  computeSemesterGPA,
  deriveMascotMood,
} from '@/utils/calculations'

export function useAttendanceStats() {
  const semester = useAppStore((s) => s.getActiveSemester())

  return useMemo(() => {
    if (!semester) {
      return {
        courseStats: [],
        semesterGPA: 100,
        mascotMood: 'happy' as const,
      }
    }

    const courseStats = semester.courses.map((c) =>
      computeCourseStats(c, semester.entries),
    )

    return {
      courseStats,
      semesterGPA: computeSemesterGPA(semester),
      mascotMood: deriveMascotMood(semester),
    }
  }, [semester])
}
