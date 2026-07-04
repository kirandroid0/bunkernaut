/** CRUD for courses and their L/T/P component schedules. */
import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { computeCourseStats } from '@/utils/calculations'
import { entriesWithRescheduled } from '@/utils/rescheduled'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseForm } from '@/components/courses/CourseForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/pixel/EmptyState'
import type { Course } from '@/types'

export function CoursesPage() {
  const semester = useAppStore((s) => s.getActiveSemester())
  const deleteCourse = useAppStore((s) => s.deleteCourse)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>()

  const filteredCourses = useMemo(() => {
    if (!semester) return []
    const q = search.toLowerCase()
    return semester.courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.professorName.toLowerCase().includes(q),
    )
  }, [semester, search])

  const courseStats = useMemo(() => {
    if (!semester) return []
    return filteredCourses.map((c) => computeCourseStats(c, entriesWithRescheduled(semester)))
  }, [semester, filteredCourses])

  const isArchived = semester?.archived

  return (
    <div className="page-stack">
      <header className="page-header flex items-center justify-between">
        <div>
          <h1 className="heading-impact text-xl text-[var(--color-text)]">Courses</h1>
          <p className="font-mono-body text-[11px] text-[var(--color-text-muted)]">
            {isArchived ? 'Archived — view only' : 'L / T / P setup'}
          </p>
        </div>
        {!isArchived && (
          <Button size="sm" onClick={() => { setEditingCourse(undefined); setFormOpen(true) }}>
            + Add
          </Button>
        )}
      </header>

      <input
        type="search"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pixel-input"
      />

      <div className="space-y-3">
        {courseStats.map((stats) => {
          const course = semester?.courses.find((c) => c.id === stats.courseId)
          return (
            <div key={stats.courseId}>
              <CourseCard
                stats={stats}
                onClick={() => {
                  if (!isArchived && course) {
                    setEditingCourse(course)
                    setFormOpen(true)
                  }
                }}
                onDelete={
                  !isArchived && course
                    ? () => {
                        if (confirm(`Delete ${course.name}?`)) deleteCourse(course.id)
                      }
                    : undefined
                }
              />
            </div>
          )
        })}
      </div>

      {courseStats.length === 0 && (
        <EmptyState
          variant="courses"
          title={search ? 'No matches' : 'No courses yet'}
          message={
            search ? 'Try a different search term~' : 'Add a course to get started!'
          }
          action={
            !search && !isArchived ? (
              <Button onClick={() => { setEditingCourse(undefined); setFormOpen(true) }}>
                Add course
              </Button>
            ) : undefined
          }
        />
      )}

      <CourseForm
        course={editingCourse}
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCourse(undefined)
        }}
      />
    </div>
  )
}
