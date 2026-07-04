/**
 * Timetable expansion and heatmap data.
 * Converts recurring weekly slots into concrete dated ScheduledClass instances.
 */
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns'
import type { Course, Semester, ScheduledClass, AttendanceEntry } from '@/types'
import { isAttendedStatus, isCountableStatus } from '@/utils/calculations'
import {
  enrichScheduledClass,
  entriesWithRescheduled,
  getRescheduledClassesForDate,
} from '@/utils/rescheduled'
import { generateId } from './id'

export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function isHolidayDate(semester: Semester, date: string): boolean {
  return semester.holidays.some((h) => h.date === date)
}

export function getHolidayLabel(semester: Semester, date: string): string | undefined {
  return semester.holidays.find((h) => h.date === date)?.label
}

export function findEntryForClass(
  entries: AttendanceEntry[],
  componentId: string,
  date: string,
): AttendanceEntry | undefined {
  return entries.find((e) => e.componentId === componentId && e.date === date)
}

/** Expands all weekly slots for one week into dated ScheduledClass objects. */
export function expandWeeklySlots(
  semester: Semester,
  weekStart: Date,
): ScheduledClass[] {
  const classes: ScheduledClass[] = []

  for (const course of semester.courses) {
    for (const component of course.components) {
      for (const slot of component.weeklySlots) {
        const classDate = addDays(weekStart, slot.day)
        const dateStr = formatDateISO(classDate)

        if (
          !isWithinInterval(classDate, {
            start: parseISO(semester.startDate),
            end: parseISO(semester.endDate),
          })
        ) {
          continue
        }

        const isHoliday = isHolidayDate(semester, dateStr)
        const entry = findEntryForClass(semester.entries, component.id, dateStr)

        classes.push(
          enrichScheduledClass(semester, {
            id: `${component.id}-${dateStr}`,
            componentId: component.id,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            courseColor: course.color,
            courseIcon: course.icon,
            componentType: component.type,
            date: dateStr,
            startTime: slot.startTime,
            durationMinutes: entry?.durationMinutes ?? slot.durationMinutes,
            professorName: course.professorName,
            professorContact: course.professorContact,
            personalityNotes: course.personalityNotes,
            entry,
            isHoliday,
            holidayLabel: isHoliday ? getHolidayLabel(semester, dateStr) : undefined,
          }),
        )
      }
    }
  }

  return classes.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })
}

export function getWeekSchedule(semester: Semester, weekStart: Date): ScheduledClass[] {
  return expandWeeklySlots(semester, weekStart)
}

/** All scheduled classes on a specific calendar date (timetable + rescheduled). */
export function getTodayClasses(semester: Semester, date: Date): ScheduledClass[] {
  const weekStart = getWeekStart(date)
  const dateStr = formatDateISO(date)
  const regular = expandWeeklySlots(semester, weekStart).filter((c) => c.date === dateStr)
  const rescheduled = getRescheduledClassesForDate(semester, dateStr)
  return [...regular, ...rescheduled].sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function createDefaultEntry(
  componentId: string,
  date: string,
  durationMinutes: number,
  status: import('@/types').AttendanceStatus = 'Present',
): AttendanceEntry {
  return {
    id: generateId(),
    componentId,
    date,
    status,
    durationMinutes,
  }
}

/** Daily attendance scores for heatmap cells (null = no data that day). */
export function getHeatmapData(
  semester: Semester,
  startDate: Date,
  weeks: number = 12,
): { date: string; score: number | null }[] {
  const result: { date: string; score: number | null }[] = []
  const totalDays = weeks * 7

  for (let i = 0; i < totalDays; i++) {
    const d = addDays(startDate, i)
    const dateStr = formatDateISO(d)
    const dayEntries = entriesWithRescheduled(semester).filter(
      (e) => e.date === dateStr && isCountableStatus(e.status),
    )

    if (dayEntries.length === 0) {
      result.push({ date: dateStr, score: null })
    } else {
      const attended = dayEntries.filter((e) => isAttendedStatus(e.status)).length
      result.push({ date: dateStr, score: attended / dayEntries.length })
    }
  }

  return result
}

export function findCourseForComponent(
  semester: Semester,
  componentId: string,
): Course | undefined {
  return semester.courses.find((c) => c.components.some((comp) => comp.id === componentId))
}
