/** End-of-day and preemptive threshold nudge generation. */
import { addDays, format } from 'date-fns'
import type { Semester } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import { computeComponentStats } from './calculations'
import { getTodayClasses } from './timetable'

export type NudgeType = 'eod_unmarked' | 'tomorrow_threshold'

export interface Nudge {
  id: string
  type: NudgeType
  title: string
  message: string
  actionLabel: string
  actionPath: string
}

export function getActiveNudges(
  semester: Semester | null,
  settings: {
    dismissedNudgeIds: string[]
    lastEodNudgeDate?: string
    lastPreemptiveNudgeDate?: string
  },
  now: Date = new Date(),
): Nudge[] {
  if (!semester || semester.archived) return []

  const nudges: Nudge[] = []
  const todayStr = format(now, 'yyyy-MM-dd')
  const hour = now.getHours()

  if (hour >= 18 && settings.lastEodNudgeDate !== todayStr) {
    const todayClasses = getTodayClasses(semester, now)
    const unmarked = todayClasses.filter((c) => !c.entry && !c.isHoliday)
    if (unmarked.length > 0) {
      const id = `eod-${todayStr}`
      if (!settings.dismissedNudgeIds.includes(id)) {
        nudges.push({
          id,
          type: 'eod_unmarked',
          title: 'Forgot to log?',
          message: `You still have ${unmarked.length} class${unmarked.length !== 1 ? 'es' : ''} unmarked today.`,
          actionLabel: 'Mark now',
          actionPath: '/today',
        })
      }
    }
  }

  if (hour >= 20 && hour <= 22 && settings.lastPreemptiveNudgeDate !== todayStr) {
    const tomorrow = addDays(now, 1)
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')
    const tomorrowClasses = getTodayClasses(semester, tomorrow)

    for (const cls of tomorrowClasses) {
      const course = semester.courses.find((c) => c.id === cls.courseId)
      if (!course) continue
      const stats = computeComponentStats(course, cls.componentId, semester.entries)
      if (!stats) continue

      if (
        stats.dangerLevel === 'warning' ||
        stats.dangerLevel === 'danger' ||
        stats.safeMisses === 0
      ) {
        const id = `preempt-${tomorrowStr}-${cls.componentId}`
        if (!settings.dismissedNudgeIds.includes(id)) {
          nudges.push({
            id,
            type: 'tomorrow_threshold',
            title: 'Heads up for tomorrow',
            message: `${course.name} ${COMPONENT_TYPE_LABELS[cls.componentType]} — ${stats.percentage}%, ${formatBunksAvailable(stats.safeMisses)} ${BUNKS_AVAILABLE}.`,
            actionLabel: 'View courses',
            actionPath: '/courses',
          })
          break
        }
      }
    }
  }

  return nudges
}
