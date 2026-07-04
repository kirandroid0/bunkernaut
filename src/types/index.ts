/** Domain types for courses, attendance entries, semesters, and stats. */
export type ComponentType = 'Lecture' | 'Tutorial' | 'Practical'

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Cancelled'
  | 'Holiday'

/** Present/absent mark for a class moved to a new date after cancellation. */
export type RescheduledStatus = 'Present' | 'Absent'

export interface RescheduledSession {
  id: string
  componentId: string
  /** Original timetable date that was cancelled. */
  originalDate: string
  rescheduledDate: string
  startTime: string
  durationMinutes: number
  status?: RescheduledStatus
}

export type MascotMood = 'sparkly' | 'happy' | 'nervous' | 'sleepy'

export type DangerLevel = 'safe' | 'warning' | 'danger'

export interface WeeklySlot {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6
  startTime: string
  durationMinutes: number
}

export interface CourseComponent {
  id: string
  type: ComponentType
  credits: number
  weeklySlots: WeeklySlot[]
  /** Counts in credit-weighted course % (frog, bunks). Default: true. */
  graded?: boolean
}

export interface Course {
  id: string
  name: string
  code: string
  professorName: string
  professorContact: string
  personalityNotes: string
  threshold: number
  color: string
  icon: string
  components: CourseComponent[]
}

export interface AttendanceEntry {
  id: string
  componentId: string
  date: string
  status: AttendanceStatus
  durationMinutes: number
}

export interface Holiday {
  id: string
  date: string
  label: string
}

export interface Semester {
  id: string
  name: string
  startDate: string
  endDate: string
  courses: Course[]
  entries: AttendanceEntry[]
  /** One-off classes moved after cancellation — optional for older saved data. */
  rescheduledSessions?: RescheduledSession[]
  holidays: Holiday[]
  archived: boolean
}

export interface AppSettings {
  defaultThreshold: number
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
  lastEodNudgeDate?: string
  lastPreemptiveNudgeDate?: string
  dismissedNudgeIds: string[]
}

export interface ComponentStats {
  componentId: string
  courseId: string
  type: ComponentType
  credits: number
  attended: number
  missed: number
  total: number
  percentage: number
  safeMisses: number
  recoveryNeeded: number
  dangerLevel: DangerLevel
  threshold: number
  graded: boolean
}

export interface CourseStats {
  courseId: string
  courseName: string
  courseCode: string
  icon: string
  color: string
  percentage: number
  safeMisses: number
  recoveryNeeded: number
  dangerLevel: DangerLevel
  threshold: number
  components: ComponentStats[]
}

export interface ScheduledClass {
  id: string
  componentId: string
  courseId: string
  courseName: string
  courseCode: string
  courseColor: string
  courseIcon: string
  componentType: ComponentType
  date: string
  startTime: string
  durationMinutes: number
  professorName: string
  professorContact: string
  personalityNotes: string
  entry?: AttendanceEntry
  isHoliday: boolean
  holidayLabel?: string
  /** One-off class moved from originalDate after cancellation. */
  isRescheduled?: boolean
  originalDate?: string
  rescheduledSessionId?: string
  /** Set on the cancelled original when a reschedule exists. */
  rescheduledToDate?: string
}

export interface AppState {
  semesters: Semester[]
  activeSemesterId: string | null
  settings: AppSettings
}

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  Lecture: 'L',
  Tutorial: 'T',
  Practical: 'P',
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export const COURSE_COLORS = [
  '#717744',
  '#373D20',
  '#BCBD8B',
  '#766153',
  '#EFF1ED',
]

export type { BunkVerdict } from './bunk'
