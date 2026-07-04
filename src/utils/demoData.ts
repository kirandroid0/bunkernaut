import { eachDayOfInterval, format } from 'date-fns'
import type { Course, Semester, AttendanceEntry, WeeklySlot } from '@/types'
import { COURSE_COLORS } from '@/types'
import { generateId } from '@/utils/id'

const RANGE_START = '2026-06-02'
const RANGE_END = '2026-07-04'

/** Map slot day (0=Mon … 6=Sun) to JS getDay() */
function slotMatchesDate(date: Date, slotDay: WeeklySlot['day']): boolean {
  const jsDay = date.getDay()
  const want = slotDay === 6 ? 6 : slotDay + 1
  return jsDay === want
}

function datesForSlots(slots: WeeklySlot[], maxDays = 22): string[] {
  const start = new Date(`${RANGE_START}T12:00:00`)
  const end = new Date(`${RANGE_END}T12:00:00`)
  const out: string[] = []

  for (const d of eachDayOfInterval({ start, end })) {
    if (slots.some((s) => slotMatchesDate(d, s.day))) {
      out.push(format(d, 'yyyy-MM-dd'))
    }
    if (out.length >= maxDays) break
  }
  return out
}

function markComponent(
  componentId: string,
  slots: WeeklySlot[],
  absentOnIndices: number[],
  durationMinutes = 60,
): AttendanceEntry[] {
  const dates = datesForSlots(slots, 22)
  return dates.slice(0, 20).map((date, i) => ({
    id: generateId(),
    componentId,
    date,
    status: absentOnIndices.includes(i) ? 'Absent' : 'Present',
    durationMinutes,
  }))
}

export function createDemoSemester(): Semester {
  const ids = {
    dsL: 'demo-ds-lec',
    dsT: 'demo-ds-tut',
    osL: 'demo-os-lec',
    dbL: 'demo-db-lec',
    dbP: 'demo-db-prac',
    cnL: 'demo-cn-lec',
    cnT: 'demo-cn-tut',
    cnP: 'demo-cn-prac',
    dmL: 'demo-dm-lec',
  }

  const courses: Course[] = [
    {
      id: 'demo-ds',
      name: 'Data Structures',
      code: 'CS201',
      professorName: 'Dr. Sharma',
      professorContact: 'sharma@college.edu',
      personalityNotes: 'Strict but fair',
      threshold: 75,
      color: COURSE_COLORS[0],
      icon: '📚',
      components: [
        {
          id: ids.dsL,
          type: 'Lecture',
          credits: 3,
          weeklySlots: [
            { day: 0, startTime: '09:00', durationMinutes: 60 },
            { day: 2, startTime: '09:00', durationMinutes: 60 },
          ],
        },
        {
          id: ids.dsT,
          type: 'Tutorial',
          credits: 1,
          weeklySlots: [{ day: 3, startTime: '14:00', durationMinutes: 60 }],
        },
      ],
    },
    {
      id: 'demo-os',
      name: 'Operating Systems',
      code: 'CS301',
      professorName: 'Prof. Mehta',
      professorContact: 'mehta@college.edu',
      personalityNotes: 'Pop quizzes on Mondays',
      threshold: 75,
      color: COURSE_COLORS[1],
      icon: '💻',
      components: [
        {
          id: ids.osL,
          type: 'Lecture',
          credits: 3,
          weeklySlots: [
            { day: 0, startTime: '11:00', durationMinutes: 60 },
            { day: 4, startTime: '11:00', durationMinutes: 60 },
          ],
        },
      ],
    },
    {
      id: 'demo-db',
      name: 'Database Systems',
      code: 'CS302',
      professorName: 'Dr. Iyer',
      professorContact: 'iyer@college.edu',
      personalityNotes: 'Loves SQL puns',
      threshold: 75,
      color: COURSE_COLORS[2],
      icon: '🗄️',
      components: [
        {
          id: ids.dbL,
          type: 'Lecture',
          credits: 3,
          weeklySlots: [{ day: 1, startTime: '10:00', durationMinutes: 60 }],
        },
        {
          id: ids.dbP,
          type: 'Practical',
          credits: 1,
          weeklySlots: [{ day: 4, startTime: '15:00', durationMinutes: 120 }],
        },
      ],
    },
    {
      id: 'demo-cn',
      name: 'Computer Networks',
      code: 'CS401',
      professorName: 'Prof. Rao',
      professorContact: 'raao@college.edu',
      personalityNotes: 'Lab reports due weekly',
      threshold: 75,
      color: COURSE_COLORS[3],
      icon: '🌐',
      components: [
        {
          id: ids.cnL,
          type: 'Lecture',
          credits: 3,
          weeklySlots: [{ day: 2, startTime: '13:00', durationMinutes: 60 }],
        },
        {
          id: ids.cnT,
          type: 'Tutorial',
          credits: 1,
          weeklySlots: [{ day: 3, startTime: '11:00', durationMinutes: 60 }],
        },
        {
          id: ids.cnP,
          type: 'Practical',
          credits: 2,
          weeklySlots: [{ day: 4, startTime: '09:00', durationMinutes: 120 }],
        },
      ],
    },
    {
      id: 'demo-dm',
      name: 'Discrete Mathematics',
      code: 'MA201',
      professorName: 'Dr. Patel',
      professorContact: 'patel@college.edu',
      personalityNotes: 'Board-heavy lectures',
      threshold: 75,
      color: COURSE_COLORS[4],
      icon: '🧮',
      components: [
        {
          id: ids.dmL,
          type: 'Lecture',
          credits: 4,
          weeklySlots: [
            { day: 1, startTime: '08:00', durationMinutes: 60 },
            { day: 3, startTime: '08:00', durationMinutes: 60 },
          ],
        },
      ],
    },
  ]

  const entries: AttendanceEntry[] = [
    // DS — healthy (sparkly / happy)
    ...markComponent(ids.dsL, courses[0].components[0].weeklySlots, [5, 12, 17]),
    ...markComponent(ids.dsT, courses[0].components[1].weeklySlots, [4]),
    // OS — at the edge (nervous): 15/20 on lecture days
    ...markComponent(ids.osL, courses[1].components[0].weeklySlots, [2, 7, 11, 14, 18]),
    // DBMS — comfortable (happy)
    ...markComponent(ids.dbL, courses[2].components[0].weeklySlots, [3, 9]),
    ...markComponent(ids.dbP, courses[2].components[1].weeklySlots, [6]),
    // Networks — bad lab drags weighted % (L×3 + T×1 + lab×2)
    ...markComponent(ids.cnL, courses[3].components[0].weeklySlots, [1, 8]),
    ...markComponent(ids.cnT, courses[3].components[1].weeklySlots, [2, 10]),
    ...markComponent(ids.cnP, courses[3].components[2].weeklySlots, [0, 1, 2, 3, 4, 5, 6]),
    // Discrete Math — excellent (sparkly)
    ...markComponent(ids.dmL, courses[4].components[0].weeklySlots, [11]),
  ]

  return {
    id: generateId(),
    name: 'Demo — Semester 2026',
    startDate: '2026-06-01',
    endDate: '2026-11-30',
    courses,
    entries,
    holidays: [{ id: generateId(), date: '2026-06-20', label: 'Institute holiday' }],
    bunkDecisions: [],
    archived: false,
  }
}

export function describeDemoBunkBudget(): string {
  const semester = createDemoSemester()
  const uniqueDays = new Set(semester.entries.map((e) => e.date)).size
  return [
    `Demo: ${semester.courses.length} courses, ${semester.entries.length} marks, ${uniqueDays} days`,
    semester.courses.map((c) => `· ${c.name}`).join('\n'),
  ].join('\n')
}
