import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { computeSemesterBunkBudget, getBunkBudgetBreakdown } from '@/utils/bunk'

export function useBunkBudget() {
  const semester = useAppStore((s) => s.getActiveSemester())

  return useMemo(() => {
    if (!semester) return null
    return {
      ...computeSemesterBunkBudget(semester),
      breakdown: getBunkBudgetBreakdown(semester),
    }
  }, [semester])
}
