/**
 * Core attendance math for Bunkernaut.
 *
 * Percentages count only Present and Absent entries.
 * Cancelled and Holiday entries are excluded from totals.
 *
 * Course-level % is a credit-weighted average of graded L/T/P components
 * (e.g. L×3 + T×1 + P×2, divided by total credits).
 */
import type { AttendanceEntry, AttendanceStatus, Course, Semester } from '@/types'
import { entriesWithRescheduled } from '@/utils/rescheduled'

/** Whether this status counts toward attendance totals (numerator and denominator). */
export function isCountableStatus(status: AttendanceStatus): boolean {
  return status === 'Present' || status === 'Absent'
}

/** Whether this status counts as attended (numerator only). */
export function isAttendedStatus(status: AttendanceStatus): boolean {
  return status === 'Present'
}

/** All attendance entries for a single L/T/P component. */
export function filterComponentEntries(
  entries: AttendanceEntry[],
  componentId: string,
): AttendanceEntry[] {
  return entries.filter((e) => e.componentId === componentId)
}

/** Count attended, missed, and total countable classes for a component. */
export function computeComponentCounts(entries: AttendanceEntry[]) {
  let attended = 0
  let missed = 0

  for (const entry of entries) {
    if (!isCountableStatus(entry.status)) continue
    if (isAttendedStatus(entry.status)) attended++
    else missed++
  }

  return { attended, missed, total: attended + missed }
}

/**
 * Attendance percentage rounded to one decimal.
 * Returns 100% when no classes have been marked yet (empty denominator).
 */
export function computePercentage(attended: number, total: number): number {
  if (total === 0) return 100
  return Math.round((attended / total) * 1000) / 10
}

/**
 * How many more absences are allowed before dropping below the threshold.
 *
 * Derived from: (attended + x) / (total + x) >= threshold/100
 * Solving for x gives: x = floor(attended / (threshold/100) - total)
 *
 * Returns Infinity when total is 0 (no classes marked — unlimited buffer).
 */
export function computeSafeMisses(
  attended: number,
  total: number,
  threshold: number,
): number {
  if (total === 0) return Infinity
  const raw = Math.floor(attended / (threshold / 100) - total)
  return Math.max(0, raw)
}

/**
 * How many consecutive presents are needed to recover when below threshold.
 *
 * Solves (attended + x) / (total + x) >= threshold/100 for x.
 */
export function computeRecoveryNeeded(
  attended: number,
  total: number,
  threshold: number,
): number {
  const pct = computePercentage(attended, total)
  if (pct >= threshold) return 0

  const th = threshold / 100
  const needed = (th * total - attended) / (1 - th)
  return Math.max(0, Math.ceil(needed))
}

/** Maps percentage vs threshold to safe / warning (within 5%) / danger (below). */
export function getDangerLevel(
  percentage: number,
  threshold: number,
): 'safe' | 'warning' | 'danger' {
  if (percentage < threshold) return 'danger'
  if (percentage < threshold + 5) return 'warning'
  return 'safe'
}

/** Whether a component contributes to credit-weighted course % and bunk counts. */
export function isGraded(component: { graded?: boolean; mandatory?: boolean }): boolean {
  if (component.graded !== undefined) return component.graded
  return (component as { mandatory?: boolean }).mandatory !== false
}

/** Prefer explicitly graded components; fall back to all if none are graded. */
export function pickGraded<T extends { graded: boolean }>(components: T[]): T[] {
  const graded = components.filter((c) => c.graded)
  return graded.length > 0 ? graded : components
}

/** Credit-weighted average of component percentages. */
export function weightedAverageByCredits(
  items: { percentage: number; credits: number }[],
): number {
  const totalCredits = items.reduce((sum, c) => sum + c.credits, 0)
  if (totalCredits === 0) return 100
  const weighted = items.reduce((sum, c) => sum + c.percentage * c.credits, 0) / totalCredits
  return Math.round(weighted * 10) / 10
}

/** Full stats for one L/T/P component: counts, %, safe misses, recovery, danger level. */
export function computeComponentStats(
  course: Course,
  componentId: string,
  entries: AttendanceEntry[],
) {
  const component = course.components.find((c) => c.id === componentId)
  if (!component) return null

  const componentEntries = filterComponentEntries(entries, componentId)
  const { attended, missed, total } = computeComponentCounts(componentEntries)
  const percentage = computePercentage(attended, total)
  const threshold = course.threshold

  return {
    componentId,
    courseId: course.id,
    type: component.type,
    credits: component.credits,
    attended,
    missed,
    total,
    percentage,
    safeMisses: computeSafeMisses(attended, total, threshold),
    recoveryNeeded: computeRecoveryNeeded(attended, total, threshold),
    dangerLevel: getDangerLevel(percentage, threshold),
    threshold,
    graded: isGraded(component),
  }
}

/**
 * Rolls up all components into course-level stats.
 *
 * Overall % uses credit-weighted average of graded components only.
 * Course safe misses aggregate attended/total across graded components,
 * then apply the same safe-miss formula at the course threshold.
 */
export function computeCourseStats(course: Course, entries: AttendanceEntry[]) {
  const components = course.components
    .map((c) => computeComponentStats(course, c.id, entries))
    .filter((s): s is NonNullable<typeof s> => s !== null)

  if (components.length === 0) {
    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      icon: course.icon,
      color: course.color,
      percentage: 100,
      safeMisses: Infinity,
      recoveryNeeded: 0,
      dangerLevel: 'safe' as const,
      threshold: course.threshold,
      components,
    }
  }

  const rollup = pickGraded(components)
  const weightedPct = weightedAverageByCredits(rollup)

  const totalAttended = rollup.reduce((sum, c) => sum + c.attended, 0)
  const totalHeld = rollup.reduce((sum, c) => sum + c.total, 0)

  return {
    courseId: course.id,
    courseName: course.name,
    courseCode: course.code,
    icon: course.icon,
    color: course.color,
    percentage: weightedPct,
    safeMisses: computeSafeMisses(totalAttended, totalHeld, course.threshold),
    recoveryNeeded: computeRecoveryNeeded(totalAttended, totalHeld, course.threshold),
    dangerLevel: getDangerLevel(weightedPct, course.threshold),
    threshold: course.threshold,
    components,
  }
}

/** Semester-wide credit-weighted attendance % across all graded components. */
export function computeSemesterGPA(semester: Semester): number {
  const allStats = semester.courses.flatMap((course) => {
    const comps = pickGraded(
      course.components.map((c) => ({ ...c, graded: isGraded(c) })),
    )
    return comps.map((c) => {
      const entries = filterComponentEntries(entriesWithRescheduled(semester), c.id)
      const { attended, total } = computeComponentCounts(entries)
      return { pct: computePercentage(attended, total), credits: c.credits }
    })
  })

  if (allStats.length === 0) return 100

  return weightedAverageByCredits(
    allStats.map((s) => ({ percentage: s.pct, credits: s.credits })),
  )
}

/**
 * Frog mascot mood for a single course based on % vs threshold.
 * sleepy = below, nervous = within 5%, happy = 5–15% above, sparkly = 15%+ above.
 */
export function deriveCourseMascotMood(
  stats: Pick<import('@/types').CourseStats, 'percentage' | 'threshold'>,
): import('@/types').MascotMood {
  const delta = stats.percentage - stats.threshold
  if (delta < 0) return 'sleepy'
  if (delta < 5) return 'nervous'
  if (delta >= 15) return 'sparkly'
  return 'happy'
}

/** Worst mood across all courses — the frog reflects your weakest link. */
export function deriveMascotMood(semester: Semester): import('@/types').MascotMood {
  const courseStats = semester.courses.map((c) =>
    computeCourseStats(c, entriesWithRescheduled(semester)),
  )

  if (courseStats.length === 0) return 'happy'

  const moods = courseStats.map((c) => deriveCourseMascotMood(c))
  const rank: Record<import('@/types').MascotMood, number> = {
    sleepy: 0,
    nervous: 1,
    happy: 2,
    sparkly: 3,
  }

  return moods.reduce((worst, m) => (rank[m] < rank[worst] ? m : worst), 'sparkly' as import('@/types').MascotMood)
}

/** Fraction of countable classes attended on a given day (0–1), or null if no data. */
export function getDailyAttendanceScore(
  entries: AttendanceEntry[],
  date: string,
): number | null {
  const dayEntries = entries.filter(
    (e) => e.date === date && isCountableStatus(e.status),
  )
  if (dayEntries.length === 0) return null

  const attended = dayEntries.filter((e) => isAttendedStatus(e.status)).length
  return attended / dayEntries.length
}

/** Buckets countable entries into weekly or monthly attendance % for trend charts. */
export function getTrendData(
  semester: Semester,
  mode: 'weekly' | 'monthly',
): { label: string; percentage: number }[] {
  const allEntries = entriesWithRescheduled(semester)
  const dates = [...new Set(allEntries.map((e) => e.date))].sort()
  if (dates.length === 0) return []

  const buckets = new Map<string, { attended: number; total: number }>()

  for (const entry of allEntries) {
    if (!isCountableStatus(entry.status)) continue
    const d = new Date(entry.date + 'T00:00:00')
    const key =
      mode === 'weekly'
        ? `${d.getFullYear()}-W${getWeekNumber(d)}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    const bucket = buckets.get(key) ?? { attended: 0, total: 0 }
    bucket.total++
    if (isAttendedStatus(entry.status)) bucket.attended++
    buckets.set(key, bucket)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, { attended, total }]) => ({
      label,
      percentage: computePercentage(attended, total),
    }))
}

function getWeekNumber(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 604800000
  return String(Math.ceil((diff / oneWeek + start.getDay() + 1) / 7)).padStart(2, '0')
}
