/**
 * Central app state persisted to localStorage (key: attendance-tracker-v1).
 * Manages semesters, courses, attendance entries, holidays, and settings.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppSettings,
  AttendanceEntry,
  AttendanceStatus,
  BunkDecision,
  Course,
  Holiday,
  ProfMood,
  Semester,
} from '@/types'
import { generateId } from '@/utils/id'
import { formatDateISO } from '@/utils/timetable'
import { createDemoSemester } from '@/utils/demoData'

const defaultSettings: AppSettings = {
  defaultThreshold: 75,
  soundsEnabled: true,
  animationsEnabled: true,
  hapticsEnabled: true,
  theme: 'light',
  notificationsEnabled: false,
  dismissedNudgeIds: [],
}

/** Creates an empty semester with sensible default date range. */
function createDefaultSemester(name?: string): Semester {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const startMonth = month >= 6 ? 7 : 1
  const startYear = month >= 6 ? year : year
  const endYear = month >= 6 ? year + 1 : year

  return {
    id: generateId(),
    name: name ?? `Semester ${startYear}-${String(startMonth).padStart(2, '0')}`,
    startDate: `${startYear}-${String(startMonth).padStart(2, '0')}-01`,
    endDate: `${endYear}-${String(startMonth + 5).padStart(2, '0')}-30`,
    courses: [],
    entries: [],
    holidays: [],
    bunkDecisions: [],
    archived: false,
  }
}

interface AppStore {
  semesters: Semester[]
  activeSemesterId: string | null
  settings: AppSettings

  getActiveSemester: () => Semester | null

  addSemester: (name?: string) => void
  archiveSemester: (id: string) => void
  deleteSemester: (id: string) => void
  setActiveSemester: (id: string) => void
  updateSemester: (id: string, updates: Partial<Pick<Semester, 'name' | 'startDate' | 'endDate'>>) => void

  addCourse: (course: Omit<Course, 'id'>) => void
  updateCourse: (courseId: string, updates: Partial<Course>) => void
  deleteCourse: (courseId: string) => void

  upsertAttendance: (
    componentId: string,
    date: string,
    status: AttendanceStatus,
    durationMinutes: number,
    profMood?: ProfMood,
  ) => void
  deleteAttendance: (entryId: string) => void

  addHoliday: (date: string, label: string) => void
  removeHoliday: (id: string) => void

  updateSettings: (updates: Partial<AppSettings>) => void
  logBunkDecision: (decision: Omit<BunkDecision, 'id'>) => void
  dismissNudge: (nudgeId: string) => void
  markEodNudgeShown: () => void
  markPreemptiveNudgeShown: () => void
  importState: (semesters: Semester[], activeSemesterId: string | null, settings: AppSettings) => void
  loadDemoData: () => void
  resetAll: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      semesters: [createDefaultSemester()],
      activeSemesterId: null,
      settings: defaultSettings,

      getActiveSemester: () => {
        const { semesters, activeSemesterId } = get()
        if (activeSemesterId) {
          return semesters.find((s) => s.id === activeSemesterId) ?? null
        }
        return semesters.find((s) => !s.archived) ?? semesters[0] ?? null
      },

      addSemester: (name) => {
        const semester = createDefaultSemester(name)
        set((state) => ({
          semesters: [...state.semesters, semester],
          activeSemesterId: semester.id,
        }))
      },

      archiveSemester: (id) => {
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, archived: true } : s,
          ),
          activeSemesterId:
            state.activeSemesterId === id
              ? state.semesters.find((s) => s.id !== id && !s.archived)?.id ?? null
              : state.activeSemesterId,
        }))
      },

      deleteSemester: (id) => {
        set((state) => {
          if (state.semesters.length <= 1) return state
          const remaining = state.semesters.filter((s) => s.id !== id)
          const activeSemesterId =
            state.activeSemesterId === id
              ? remaining.find((s) => !s.archived)?.id ?? remaining[0]?.id ?? null
              : state.activeSemesterId
          return { semesters: remaining, activeSemesterId }
        })
      },

      setActiveSemester: (id) => set({ activeSemesterId: id }),

      updateSemester: (id, updates) => {
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        }))
      },

      addCourse: (courseData) => {
        const course: Course = { ...courseData, id: generateId() }
        set((state) => {
          const activeId =
            state.activeSemesterId ??
            state.semesters.find((s) => !s.archived)?.id ??
            state.semesters[0]?.id
          if (!activeId) return state

          return {
            semesters: state.semesters.map((s) =>
              s.id === activeId ? { ...s, courses: [...s.courses, course] } : s,
            ),
            activeSemesterId: activeId,
          }
        })
      },

      updateCourse: (courseId, updates) => {
        set((state) => ({
          semesters: state.semesters.map((s) => ({
            ...s,
            courses: s.courses.map((c) =>
              c.id === courseId ? { ...c, ...updates } : c,
            ),
          })),
        }))
      },

      deleteCourse: (courseId) => {
        set((state) => ({
          semesters: state.semesters.map((s) => ({
            ...s,
            courses: s.courses.filter((c) => c.id !== courseId),
            entries: s.entries.filter((e) => {
              const course = s.courses.find((c) => c.id === courseId)
              return !course?.components.some((comp) => comp.id === e.componentId)
            }),
          })),
        }))
      },

      upsertAttendance: (componentId, date, status, durationMinutes, profMood) => {
        set((state) => ({
          semesters: state.semesters.map((s) => {
            const existing = s.entries.find(
              (e) => e.componentId === componentId && e.date === date,
            )
            if (existing) {
              return {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === existing.id
                    ? { ...e, status, durationMinutes, profMood }
                    : e,
                ),
              }
            }
            const entry: AttendanceEntry = {
              id: generateId(),
              componentId,
              date,
              status,
              durationMinutes,
              profMood,
            }
            return { ...s, entries: [...s.entries, entry] }
          }),
        }))
      },

      deleteAttendance: (entryId) => {
        set((state) => ({
          semesters: state.semesters.map((s) => ({
            ...s,
            entries: s.entries.filter((e) => e.id !== entryId),
          })),
        }))
      },

      addHoliday: (date, label) => {
        const holiday: Holiday = { id: generateId(), date, label }
        set((state) => ({
          semesters: state.semesters.map((s) => {
            if (s.holidays.some((h) => h.date === date)) return s
            return { ...s, holidays: [...s.holidays, holiday] }
          }),
        }))
      },

      removeHoliday: (id) => {
        set((state) => ({
          semesters: state.semesters.map((s) => ({
            ...s,
            holidays: s.holidays.filter((h) => h.id !== id),
          })),
        }))
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
      },

      logBunkDecision: (decision) => {
        const entry: BunkDecision = { ...decision, id: generateId() }
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === state.activeSemesterId
              ? { ...s, bunkDecisions: [...(s.bunkDecisions ?? []), entry] }
              : s,
          ),
        }))
      },

      dismissNudge: (nudgeId) => {
        set((state) => ({
          settings: {
            ...state.settings,
            dismissedNudgeIds: [...new Set([...state.settings.dismissedNudgeIds, nudgeId])],
          },
        }))
      },

      markEodNudgeShown: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            lastEodNudgeDate: formatDateISO(new Date()),
          },
        }))
      },

      markPreemptiveNudgeShown: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            lastPreemptiveNudgeDate: formatDateISO(new Date()),
          },
        }))
      },

      importState: (semesters, activeSemesterId, settings) => {
        set({ semesters, activeSemesterId, settings })
      },

      /** Replaces any prior demo semester and sets it active. */
      loadDemoData: () => {
        const demo = createDemoSemester()
        set((state) => ({
          semesters: [
            ...state.semesters.filter((s) => !s.name.startsWith('Demo —')),
            demo,
          ],
          activeSemesterId: demo.id,
        }))
      },

      resetAll: () => {
        const semester = createDefaultSemester()
        set({
          semesters: [semester],
          activeSemesterId: semester.id,
          settings: defaultSettings,
        })
      },
    }),
    {
      name: 'attendance-tracker-v1',
      onRehydrateStorage: () => (state) => {
        if (state && !state.activeSemesterId && state.semesters.length > 0) {
          const active = state.semesters.find((s) => !s.archived)
          if (active) state.activeSemesterId = active.id
        }
        if (state) {
          state.semesters = state.semesters.map((s) => ({
            ...s,
            bunkDecisions: s.bunkDecisions ?? [],
            courses: s.courses.map((c) => ({
              ...c,
              components: c.components.map((comp) => {
                const legacy = comp as typeof comp & { mandatory?: boolean }
                return {
                  ...comp,
                  graded: legacy.graded ?? legacy.mandatory !== false,
                }
              }),
            })),
          }))
          state.settings = {
            ...defaultSettings,
            ...state.settings,
            dismissedNudgeIds: state.settings.dismissedNudgeIds ?? [],
          }
        }
      },
    },
  ),
)

export function getTodayISO(): string {
  return formatDateISO(new Date())
}
