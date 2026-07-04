import { describe, it, expect } from 'vitest'
import {
  computeBunkVerdict,
  computeSemesterBunkBudget,
  countAbsencesInMonth,
  formatSafeMisses,
  projectPctIfAbsent,
} from './bunk'
import { createDemoSemester } from './demoData'
import type { Course, Semester } from '@/types'

const mockCourse: Course = {
  id: 'c1',
  name: 'Data Structures',
  code: 'CS201',
  professorName: 'Dr. Smith',
  professorContact: 'smith@college.edu',
  personalityNotes: 'Strict',
  threshold: 75,
  color: '#717744',
  icon: '📚',
  components: [{ id: 'comp-l', type: 'Lecture', credits: 3, weeklySlots: [] }],
}

function makeSemester(entries: Semester['entries']): Semester {
  return {
    id: 's1',
    name: 'Sem 1',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    courses: [mockCourse],
    entries,
    holidays: [],
    archived: false,
  }
}

describe('formatSafeMisses', () => {
  it('formats finite and infinite values', () => {
    expect(formatSafeMisses(3)).toBe('3')
    expect(formatSafeMisses(Infinity)).toBe('∞')
  })
})

describe('countAbsencesInMonth', () => {
  it('counts absences in a given month', () => {
    const entries = [
      { id: '1', componentId: 'comp-l', date: '2026-07-01', status: 'Absent' as const, durationMinutes: 60 },
      { id: '2', componentId: 'comp-l', date: '2026-07-15', status: 'Absent' as const, durationMinutes: 60 },
      { id: '3', componentId: 'comp-l', date: '2026-06-30', status: 'Absent' as const, durationMinutes: 60 },
    ]
    expect(countAbsencesInMonth(entries, 2026, 6)).toBe(2)
  })
})

describe('computeBunkVerdict', () => {
  it('says dont_bunk when below threshold', () => {
    const semester = makeSemester([
      { id: '1', componentId: 'comp-l', date: '2026-07-01', status: 'Absent', durationMinutes: 60 },
      { id: '2', componentId: 'comp-l', date: '2026-07-02', status: 'Absent', durationMinutes: 60 },
      { id: '3', componentId: 'comp-l', date: '2026-07-03', status: 'Present', durationMinutes: 60 },
    ])
    const result = computeBunkVerdict(mockCourse, 'comp-l', semester.entries)
    expect(result.verdict).toBe('dont_bunk')
  })

  it('says bunk or risky when margin exists', () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      componentId: 'comp-l',
      date: `2026-07-${String(i + 1).padStart(2, '0')}`,
      status: 'Present' as const,
      durationMinutes: 60,
    }))
    const result = computeBunkVerdict(mockCourse, 'comp-l', entries)
    expect(['bunk', 'risky']).toContain(result.verdict)
    expect(result.safeMissesBefore).toBeGreaterThan(0)
  })
})

describe('projectPctIfAbsent', () => {
  it('lowers projected percentage after absent', () => {
    const entries = Array.from({ length: 4 }, (_, i) => ({
      id: String(i),
      componentId: 'comp-l',
      date: `2026-07-0${i + 1}`,
      status: 'Present' as const,
      durationMinutes: 60,
    }))
    const { pctBefore, pctAfter } = projectPctIfAbsent(mockCourse, 'comp-l', entries)
    expect(pctAfter).toBeLessThan(pctBefore)
  })
})

describe('computeSemesterBunkBudget', () => {
  it('aggregates safe misses across components', () => {
    const entries = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      componentId: 'comp-l',
      date: `2026-07-0${i + 1}`,
      status: 'Present' as const,
      durationMinutes: 60,
    }))
    const budget = computeSemesterBunkBudget(makeSemester(entries))
    expect(budget.totalSafeMisses).toBeGreaterThan(0)
    expect(budget.absencesThisMonth).toBeGreaterThanOrEqual(0)
  })
})

describe('demo semester', () => {
  it('has 5 courses and 20 days of attendance', () => {
    const semester = createDemoSemester()
    const uniqueDays = new Set(semester.entries.map((e) => e.date)).size

    expect(semester.courses.length).toBeGreaterThanOrEqual(5)
    expect(uniqueDays).toBeGreaterThanOrEqual(20)
    expect(semester.entries.length).toBeGreaterThan(50)
  })
})
