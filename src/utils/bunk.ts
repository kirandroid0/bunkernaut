/**
 * Bunk (skip-class) budgeting and verdict logic.
 *
 * "Safe misses" = how many more absences before dropping below threshold.
 * Bunk verdicts project what happens if you skip the next class.
 */
import type { Course, Semester } from '@/types'
import type { BunkVerdict, BunkVerdictResult, BunkBudgetLine, SemesterBunkBudget } from '@/types/bunk'
import { COMPONENT_TYPE_LABELS } from '@/types'
import {
  computeComponentStats,
  computePercentage,
  computeSafeMisses,
  filterComponentEntries,
  computeComponentCounts,
  getDangerLevel,
} from './calculations'

/** Count Absent entries in a given calendar month. */
export function countAbsencesInMonth(
  entries: Semester['entries'],
  year: number,
  month: number,
): number {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  return entries.filter((e) => e.date.startsWith(prefix) && e.status === 'Absent').length
}

/**
 * Semester-wide bunk budget: total safe misses across all components,
 * plus the tightest component and this month's absence count.
 */
export function computeSemesterBunkBudget(
  semester: Semester,
  now: Date = new Date(),
): SemesterBunkBudget {
  let totalSafeMisses = 0
  let hasUnlimited = false
  let tightestLabel: string | null = null
  let tightestSafeMisses = Infinity

  for (const course of semester.courses) {
    for (const comp of course.components) {
      const stats = computeComponentStats(course, comp.id, semester.entries)
      if (!stats) continue

      if (stats.safeMisses === Infinity) {
        hasUnlimited = true
      } else {
        totalSafeMisses += stats.safeMisses
        if (stats.safeMisses < tightestSafeMisses) {
          tightestSafeMisses = stats.safeMisses
          tightestLabel = `${course.name} ${COMPONENT_TYPE_LABELS[comp.type]}`
        }
      }
    }
  }

  return {
    totalSafeMisses: hasUnlimited && totalSafeMisses === 0 ? Infinity : totalSafeMisses,
    isUnlimited: hasUnlimited && semester.courses.length > 0 && totalSafeMisses === 0,
    absencesThisMonth: countAbsencesInMonth(
      semester.entries,
      now.getFullYear(),
      now.getMonth(),
    ),
    tightestLabel: tightestSafeMisses === Infinity ? null : tightestLabel,
    tightestSafeMisses: tightestSafeMisses === Infinity ? 0 : tightestSafeMisses,
  }
}

/** Per-component bunk budget lines, sorted tightest-first. */
export function getBunkBudgetBreakdown(semester: Semester): BunkBudgetLine[] {
  const lines: BunkBudgetLine[] = []

  for (const course of semester.courses) {
    for (const comp of course.components) {
      const stats = computeComponentStats(course, comp.id, semester.entries)
      if (!stats) continue

      lines.push({
        label: `${course.name} ${COMPONENT_TYPE_LABELS[comp.type]}`,
        safeMisses: stats.safeMisses,
        percentage: stats.percentage,
      })
    }
  }

  return lines.sort((a, b) => {
    if (a.safeMisses === Infinity) return 1
    if (b.safeMisses === Infinity) return -1
    return a.safeMisses - b.safeMisses
  })
}

/**
 * What-if projection: attendance % and safe misses if you skip one more class.
 * Adds one to total without adding to attended.
 */
export function projectPctIfAbsent(
  course: Course,
  componentId: string,
  entries: Semester['entries'],
): { pctBefore: number; pctAfter: number; safeMissesBefore: number; safeMissesAfter: number } {
  const stats = computeComponentStats(course, componentId, entries)
  if (!stats) {
    return { pctBefore: 100, pctAfter: 100, safeMissesBefore: Infinity, safeMissesAfter: Infinity }
  }

  const { attended, total } = computeComponentCounts(
    filterComponentEntries(entries, componentId),
  )
  const pctBefore = stats.percentage
  const pctAfter = computePercentage(attended, total + 1)
  const safeMissesBefore = stats.safeMisses
  const safeMissesAfter = computeSafeMisses(attended, total + 1, course.threshold)

  return { pctBefore, pctAfter, safeMissesBefore, safeMissesAfter }
}

/**
 * Bunk-or-not verdict for a specific upcoming class.
 *
 * dont_bunk — already below threshold or zero safe misses
 * risky     — in warning zone or skipping reduces margin
 * bunk      — safe to skip without dropping below threshold
 */
export function computeBunkVerdict(
  course: Course,
  componentId: string,
  entries: Semester['entries'],
): BunkVerdictResult {
  const { pctBefore, pctAfter, safeMissesBefore, safeMissesAfter } = projectPctIfAbsent(
    course,
    componentId,
    entries,
  )
  const stats = computeComponentStats(course, componentId, entries)
  const threshold = course.threshold
  const danger = stats ? stats.dangerLevel : getDangerLevel(pctBefore, threshold)

  let verdict: BunkVerdict
  let label: string

  if (pctBefore < threshold) {
    verdict = 'dont_bunk'
    label = "Don't bunk — already below threshold"
  } else if (safeMissesBefore <= 0) {
    verdict = 'dont_bunk'
    label = 'No bunks available'
  } else if (danger === 'warning' || safeMissesAfter < safeMissesBefore) {
    verdict = 'risky'
    label = 'Risky — this cuts into your margin'
  } else {
    verdict = 'bunk'
    label = 'You can bunk this one'
  }

  return {
    verdict,
    label,
    pctBefore,
    pctAfterProjected: pctAfter,
    safeMissesBefore,
    safeMissesAfter,
  }
}

/** Display helper: Infinity and large values show as ∞. */
export function formatSafeMisses(n: number): string {
  if (n === Infinity || n > 99) return '∞'
  return String(n)
}
