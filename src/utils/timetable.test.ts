import { describe, it, expect } from 'vitest'
import { getTodayClasses, getWeekSchedule } from './timetable'
import type { Semester } from '@/types'
import { startOfWeek } from 'date-fns'

const semester: Semester = {
  id: 's1',
  name: 'Test',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  courses: [
    {
      id: 'c1',
      name: 'Math',
      code: 'MA101',
      professorName: 'Dr. A',
      professorContact: '',
      personalityNotes: '',
      threshold: 75,
      color: '#FFB7C5',
      icon: '📚',
      components: [
        {
          id: 'comp1',
          type: 'Lecture',
          credits: 3,
          weeklySlots: [{ day: 0, startTime: '09:00', durationMinutes: 60 }],
        },
      ],
    },
  ],
  entries: [],
  holidays: [{ id: 'h1', date: '2026-07-06', label: 'Holiday' }],
  bunkDecisions: [],
  archived: false,
}

describe('timetable', () => {
  it('generates today classes from weekly slots', () => {
    // 2026-07-06 is a Monday (day 0)
    const date = new Date('2026-07-06T12:00:00')
    const classes = getTodayClasses(semester, date)
    expect(classes).toHaveLength(1)
    expect(classes[0].courseName).toBe('Math')
    expect(classes[0].isHoliday).toBe(true)
  })

  it('builds week schedule', () => {
    const weekStart = startOfWeek(new Date('2026-07-06'), { weekStartsOn: 1 })
    const schedule = getWeekSchedule(semester, weekStart)
    expect(schedule.length).toBeGreaterThan(0)
  })
})
