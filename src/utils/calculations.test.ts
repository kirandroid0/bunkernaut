import { describe, it, expect } from 'vitest'
import {
  computeComponentCounts,
  computePercentage,
  computeSafeMisses,
  computeRecoveryNeeded,
  computeCourseStats,
  computeSemesterGPA,
  getDangerLevel,
  deriveMascotMood,
  deriveCourseMascotMood,
  weightedAverageByCredits,
} from './calculations'
import type { Course, Semester, AttendanceEntry } from '@/types'

const mockCourse: Course = {
  id: 'c1',
  name: 'Data Structures',
  code: 'CS201',
  professorName: 'Dr. Smith',
  professorContact: 'smith@college.edu',
  personalityNotes: 'Strict',
  threshold: 75,
  color: '#FFB7C5',
  icon: '📚',
  components: [
    { id: 'comp-l', type: 'Lecture', credits: 3, weeklySlots: [] },
    { id: 'comp-t', type: 'Tutorial', credits: 1, weeklySlots: [] },
  ],
}

function entry(
  componentId: string,
  status: AttendanceEntry['status'],
  date = '2026-07-01',
): AttendanceEntry {
  return { id: Math.random().toString(), componentId, date, status, durationMinutes: 60 }
}

describe('computeComponentCounts', () => {
  it('counts present and absent, excludes cancelled/holiday', () => {
    const entries = [
      entry('comp-l', 'Present'),
      entry('comp-l', 'Present', '2026-07-02'),
      entry('comp-l', 'Absent', '2026-07-03'),
      entry('comp-l', 'Cancelled', '2026-07-04'),
      entry('comp-l', 'Holiday', '2026-07-05'),
    ]
    const result = computeComponentCounts(entries)
    expect(result.attended).toBe(2)
    expect(result.missed).toBe(1)
    expect(result.total).toBe(3)
  })
})

describe('computePercentage', () => {
  it('returns 100 when total is 0', () => {
    expect(computePercentage(0, 0)).toBe(100)
  })

  it('calculates correctly', () => {
    expect(computePercentage(3, 4)).toBe(75)
  })
})

describe('computeSafeMisses', () => {
  it('returns safe misses at 75% threshold', () => {
    // 9/12 = 75%, at threshold can't miss any
    expect(computeSafeMisses(9, 12, 75)).toBe(0)
    // 10/12 = 83%, can miss 1: 10/(12+1) = 76.9%
    expect(computeSafeMisses(10, 12, 75)).toBe(1)
  })

  it('returns infinity-safe for empty total', () => {
    expect(computeSafeMisses(0, 0, 75)).toBe(Infinity)
  })
})

describe('computeRecoveryNeeded', () => {
  it('returns 0 when above threshold', () => {
    expect(computeRecoveryNeeded(8, 10, 75)).toBe(0)
  })

  it('calculates recovery when below threshold', () => {
    // 6/10 = 60%, need x: (6+x)/(10+x) >= 0.75 => x >= 6
    expect(computeRecoveryNeeded(6, 10, 75)).toBe(6)
  })
})

describe('getDangerLevel', () => {
  it('classifies danger/warning/safe', () => {
    expect(getDangerLevel(70, 75)).toBe('danger')
    expect(getDangerLevel(78, 75)).toBe('warning')
    expect(getDangerLevel(85, 75)).toBe('safe')
  })
})

describe('computeCourseStats', () => {
  it('credit-weights component percentages', () => {
    const entries = [
      entry('comp-l', 'Present'),
      entry('comp-l', 'Present', '2026-07-02'),
      entry('comp-l', 'Absent', '2026-07-03'),
      entry('comp-t', 'Present'),
      entry('comp-t', 'Present', '2026-07-02'),
    ]
    const stats = computeCourseStats(mockCourse, entries)
    // L: 2/3 = 66.7%, T: 2/2 = 100%, weighted: (66.7*3 + 100*1)/4 = 75
    expect(stats.percentage).toBeCloseTo(75, 0)
  })
})

describe('computeSemesterGPA', () => {
  it('computes across all courses', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [mockCourse],
      entries: [
        entry('comp-l', 'Present'),
        entry('comp-l', 'Present', '2026-07-02'),
      ],
      holidays: [],
      archived: false,
    }
    expect(computeSemesterGPA(semester)).toBe(100)
  })
})

describe('weightedAverageByCredits', () => {
  it('weights L×3 + T×1 + lab×2', () => {
    const pct = weightedAverageByCredits([
      { percentage: 80, credits: 3 },
      { percentage: 90, credits: 1 },
      { percentage: 60, credits: 2 },
    ])
    expect(pct).toBe(75)
  })
})

describe('deriveMascotMood', () => {
  it('returns sparkly when well above threshold', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [{ ...mockCourse, threshold: 75 }],
      entries: Array.from({ length: 10 }, (_, i) =>
        entry('comp-l', 'Present', `2026-07-${String(i + 1).padStart(2, '0')}`),
      ),
      holidays: [],
      archived: false,
    }
    expect(deriveMascotMood(semester)).toBe('sparkly')
  })
})

describe('deriveCourseMascotMood', () => {
  it('sparkly when well above threshold on all components', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [{ ...mockCourse, threshold: 75 }],
      entries: Array.from({ length: 12 }, (_, i) =>
        entry('comp-l', 'Present', `2026-07-${String(i + 1).padStart(2, '0')}`),
      ),
      holidays: [],
      archived: false,
    }
    const stats = computeCourseStats(semester.courses[0], semester.entries)
    expect(deriveCourseMascotMood(stats)).toBe('sparkly')
  })

  it('happy when comfortably above threshold', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [
        {
          ...mockCourse,
          threshold: 75,
          components: [{ id: 'comp-l', type: 'Lecture', credits: 3, weeklySlots: [] }],
        },
      ],
      entries: Array.from({ length: 8 }, (_, i) =>
        entry('comp-l', i < 7 ? 'Present' : 'Absent', `2026-07-0${i + 1}`),
      ),
      holidays: [],
      archived: false,
    }
    const stats = computeCourseStats(semester.courses[0], semester.entries)
    expect(stats.percentage).toBe(87.5)
    expect(deriveCourseMascotMood(stats)).toBe('happy')
  })

  it('uses weighted average not worst component for mood', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [
        {
          ...mockCourse,
          components: [
            { id: 'comp-l', type: 'Lecture', credits: 3, weeklySlots: [] },
            { id: 'comp-t', type: 'Tutorial', credits: 1, weeklySlots: [], graded: false },
          ],
        },
      ],
      entries: [
        ...Array.from({ length: 10 }, (_, i) =>
          entry('comp-l', 'Present', `2026-07-${String(i + 1).padStart(2, '0')}`),
        ),
        entry('comp-t', 'Absent', '2026-07-01'),
        entry('comp-t', 'Absent', '2026-07-02'),
      ],
      holidays: [],
      archived: false,
    }
    const stats = computeCourseStats(semester.courses[0], semester.entries)
    expect(stats.percentage).toBe(100)
    expect(deriveCourseMascotMood(stats)).toBe('sparkly')
  })

  it('sleepy when weighted average below threshold', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [{ ...mockCourse, threshold: 75 }],
      entries: [
        entry('comp-l', 'Present'),
        entry('comp-l', 'Absent', '2026-07-02'),
        entry('comp-l', 'Absent', '2026-07-03'),
      ],
      holidays: [],
      archived: false,
    }
    const stats = computeCourseStats(semester.courses[0], semester.entries)
    expect(deriveCourseMascotMood(stats)).toBe('sleepy')
  })

  it('nervous when zero skips but still passing', () => {
    const semester: Semester = {
      id: 's1',
      name: 'Test',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      courses: [
        {
          ...mockCourse,
          components: [{ id: 'comp-l', type: 'Lecture', credits: 3, weeklySlots: [] }],
        },
      ],
      entries: Array.from({ length: 4 }, (_, i) =>
        entry('comp-l', i < 3 ? 'Present' : 'Absent', `2026-07-0${i + 1}`),
      ),
      holidays: [],
      archived: false,
    }
    const stats = computeCourseStats(semester.courses[0], semester.entries)
    expect(stats.percentage).toBe(75)
    expect(stats.components[0].safeMisses).toBe(0)
    expect(deriveCourseMascotMood(stats)).toBe('nervous')
  })
})
