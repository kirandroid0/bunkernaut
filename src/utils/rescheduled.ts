/** Helpers for one-off rescheduled classes after a cancellation. */
import type {
  AttendanceEntry,
  AttendanceStatus,
  RescheduledSession,
  ScheduledClass,
  Semester,
} from '@/types'
import { findCourseForComponent } from '@/utils/timetable'

export function rescheduledSessionsForComponent(
  semester: Semester,
  componentId: string,
): RescheduledSession[] {
  return (semester.rescheduledSessions ?? []).filter((s) => s.componentId === componentId)
}

export function findRescheduledSession(
  semester: Semester,
  componentId: string,
  originalDate: string,
): RescheduledSession | undefined {
  return (semester.rescheduledSessions ?? []).find(
    (s) => s.componentId === componentId && s.originalDate === originalDate,
  )
}

/** Merge rescheduled present/absent marks into the entry list used for stats. */
export function entriesWithRescheduled(semester: Semester): AttendanceEntry[] {
  const extra = (semester.rescheduledSessions ?? [])
    .filter((s): s is RescheduledSession & { status: AttendanceStatus } =>
      s.status === 'Present' || s.status === 'Absent',
    )
    .map((s) => ({
      id: s.id,
      componentId: s.componentId,
      date: s.rescheduledDate,
      status: s.status,
      durationMinutes: s.durationMinutes,
    }))

  return [...semester.entries, ...extra]
}

export function scheduledClassFromRescheduled(
  semester: Semester,
  session: RescheduledSession,
): ScheduledClass | null {
  const course = findCourseForComponent(semester, session.componentId)
  const component = course?.components.find((c) => c.id === session.componentId)
  if (!course || !component) return null

  const entry: AttendanceEntry | undefined =
    session.status === 'Present' || session.status === 'Absent'
      ? {
          id: session.id,
          componentId: session.componentId,
          date: session.rescheduledDate,
          status: session.status,
          durationMinutes: session.durationMinutes,
        }
      : undefined

  return {
    id: `rescheduled-${session.id}`,
    componentId: session.componentId,
    courseId: course.id,
    courseName: course.name,
    courseCode: course.code,
    courseColor: course.color,
    courseIcon: course.icon,
    componentType: component.type,
    date: session.rescheduledDate,
    startTime: session.startTime,
    durationMinutes: session.durationMinutes,
    professorName: course.professorName,
    professorContact: course.professorContact,
    personalityNotes: course.personalityNotes,
    entry,
    isHoliday: false,
    isRescheduled: true,
    originalDate: session.originalDate,
    rescheduledSessionId: session.id,
  }
}

export function getRescheduledClassesForDate(semester: Semester, date: string): ScheduledClass[] {
  return (semester.rescheduledSessions ?? [])
    .filter((s) => s.rescheduledDate === date)
    .map((s) => scheduledClassFromRescheduled(semester, s))
    .filter((c): c is ScheduledClass => c !== null)
}

export function enrichScheduledClass(
  semester: Semester,
  scheduledClass: ScheduledClass,
): ScheduledClass {
  const session = findRescheduledSession(
    semester,
    scheduledClass.componentId,
    scheduledClass.date,
  )
  if (!session) return scheduledClass

  return {
    ...scheduledClass,
    rescheduledToDate: session.rescheduledDate,
    rescheduledSessionId: session.id,
  }
}
