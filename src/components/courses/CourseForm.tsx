import { useEffect, useState } from 'react'
import type { Course } from '@/types'
import { COURSE_COLORS } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { ComponentEditor } from './ComponentEditor'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface CourseFormProps {
  course?: Course
  open: boolean
  onClose: () => void
}

function getInitialState(course: Course | undefined, defaultThreshold: number) {
  return {
    name: course?.name ?? '',
    code: course?.code ?? '',
    professorName: course?.professorName ?? '',
    professorContact: course?.professorContact ?? '',
    personalityNotes: course?.personalityNotes ?? '',
    threshold: course?.threshold ?? defaultThreshold,
    color: course?.color ?? COURSE_COLORS[0],
    icon: course?.icon ?? '·',
    components: course?.components ?? [],
  }
}

const labelClass = 'font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide'

export function CourseForm({ course, open, onClose }: CourseFormProps) {
  const defaultThreshold = useAppStore((s) => s.settings.defaultThreshold)
  const addCourse = useAppStore((s) => s.addCourse)
  const updateCourse = useAppStore((s) => s.updateCourse)

  const [form, setForm] = useState(() => getInitialState(course, defaultThreshold))

  useEffect(() => {
    if (open) {
      setForm(getInitialState(course, defaultThreshold))
    }
  }, [open, course, defaultThreshold])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (course) {
      updateCourse(course.id, form)
    } else {
      addCourse(form)
    }
    onClose()
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={course ? 'Edit course' : 'Add course'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <span className={labelClass}>Course name</span>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="pixel-input mt-1"
              placeholder="Data Structures"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Code</span>
            <input
              required
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              className="pixel-input mt-1"
              placeholder="CS201"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Threshold %</span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.threshold}
              onChange={(e) => set('threshold', Number(e.target.value))}
              className="pixel-input mt-1"
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Professor</span>
          <input
            value={form.professorName}
            onChange={(e) => set('professorName', e.target.value)}
            className="pixel-input mt-1"
          />
        </label>

        <label className="block">
          <span className={labelClass}>Contact</span>
          <input
            value={form.professorContact}
            onChange={(e) => set('professorContact', e.target.value)}
            className="pixel-input mt-1"
          />
        </label>

        <label className="block">
          <span className={labelClass}>Personality notes</span>
          <textarea
            value={form.personalityNotes}
            onChange={(e) => set('personalityNotes', e.target.value)}
            rows={2}
            className="pixel-input mt-1 resize-none"
            placeholder="Strict about late entries..."
          />
        </label>

        <div>
          <p className={`${labelClass} mb-2`}>Course color</p>
          <div className="flex gap-2 flex-wrap">
            {COURSE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                className="w-10 h-10 pixel-art border-[3px] transition-transform"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? 'var(--color-border)' : 'transparent',
                  boxShadow: form.color === c ? '2px 2px 0 var(--color-border)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <ComponentEditor components={form.components} onChange={(c) => set('components', c)} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {course ? 'Save' : 'Add course'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
