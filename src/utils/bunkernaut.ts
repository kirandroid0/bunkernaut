import type { CourseStats } from '@/types'
import { formatSafeMisses } from '@/utils/bunk'

/** Course-level bunks from the same graded L/T/P pool as overall %. */
export function computeCourseBunkernaut(stats: CourseStats) {
  const bunks = stats.safeMisses
  return {
    bunksAvailable:
      bunks === Infinity || (bunks === 0 && stats.components.length === 0)
        ? '—'
        : formatSafeMisses(bunks),
  }
}
