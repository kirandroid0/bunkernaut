import { generateId } from '@/utils/id'
import type { CourseComponent, ComponentType, WeeklySlot } from '@/types'
import { DAY_LABELS } from '@/types'
import { Button } from '@/components/ui/Button'

interface ComponentEditorProps {
  components: CourseComponent[]
  onChange: (components: CourseComponent[]) => void
}

const TYPES: ComponentType[] = ['Lecture', 'Tutorial', 'Practical']

export function ComponentEditor({ components, onChange }: ComponentEditorProps) {
  const addComponent = (type: ComponentType) => {
    onChange([
      ...components,
      {
        id: generateId(),
        type,
        credits: type === 'Lecture' ? 3 : type === 'Tutorial' ? 1 : 2,
        graded: true,
        weeklySlots: [{ day: 0, startTime: '09:00', durationMinutes: 60 }],
      },
    ])
  }

  const updateComponent = (id: string, updates: Partial<CourseComponent>) => {
    onChange(components.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeComponent = (id: string) => {
    onChange(components.filter((c) => c.id !== id))
  }

  const addSlot = (componentId: string) => {
    onChange(
      components.map((c) =>
        c.id === componentId
          ? {
              ...c,
              weeklySlots: [
                ...c.weeklySlots,
                { day: 0, startTime: '09:00', durationMinutes: 60 },
              ],
            }
          : c,
      ),
    )
  }

  const updateSlot = (
    componentId: string,
    slotIndex: number,
    updates: Partial<WeeklySlot>,
  ) => {
    onChange(
      components.map((c) => {
        if (c.id !== componentId) return c
        const slots = [...c.weeklySlots]
        slots[slotIndex] = { ...slots[slotIndex], ...updates }
        return { ...c, weeklySlots: slots }
      }),
    )
  }

  const removeSlot = (componentId: string, slotIndex: number) => {
    onChange(
      components.map((c) => {
        if (c.id !== componentId) return c
        return {
          ...c,
          weeklySlots: c.weeklySlots.filter((_, i) => i !== slotIndex),
        }
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((type) => (
          <Button key={type} variant="secondary" size="sm" onClick={() => addComponent(type)}>
            + {type[0]}
          </Button>
        ))}
      </div>

      {components.map((comp) => (
        <div
          key={comp.id}
          className="p-3 pixel-box-inset space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--color-text)]">{comp.type}</span>
            <Button variant="ghost" size="sm" onClick={() => removeComponent(comp.id)}>
              Remove
            </Button>
          </div>

          <div className="flex items-end gap-4 flex-wrap">
            <label className="block text-sm flex-1 min-w-[80px]">
              <span className="text-[var(--color-text-muted)]">Credits</span>
              <input
                type="number"
                min={0}
                max={10}
                value={comp.credits}
                onChange={(e) =>
                  updateComponent(comp.id, { credits: Number(e.target.value) })
                }
                className="pixel-input mt-1"
              />
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer pb-1">
              <input
                type="checkbox"
                checked={comp.graded !== false}
                onChange={(e) => updateComponent(comp.id, { graded: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              <span className="text-[var(--color-text)]">Graded</span>
            </label>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] -mt-1">
            Credits weight course % — e.g. L:3, T:1, lab:2. Uncheck Graded if attendance here
            isn&apos;t part of your marks.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-muted)] font-semibold">Weekly slots</p>
            {comp.weeklySlots.map((slot, idx) => (
              <div key={idx} className="flex gap-2 items-center flex-wrap">
                <select
                  value={slot.day}
                  onChange={(e) =>
                    updateSlot(comp.id, idx, {
                      day: Number(e.target.value) as WeeklySlot['day'],
                    })
                  }
                  className="pixel-input !w-auto text-sm py-1"
                >
                  {DAY_LABELS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(comp.id, idx, { startTime: e.target.value })}
                  className="pixel-input !w-auto text-sm py-1"
                />
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={slot.durationMinutes}
                  onChange={(e) =>
                    updateSlot(comp.id, idx, { durationMinutes: Number(e.target.value) })
                  }
                  className="pixel-input w-16 text-sm py-1"
                  title="Duration (min)"
                />
                <span className="text-xs text-[var(--color-text-muted)]">min</span>
                {comp.weeklySlots.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeSlot(comp.id, idx)}>
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addSlot(comp.id)}>
              + Add slot
            </Button>
          </div>
        </div>
      ))}

      {components.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          Add L/T/P components to set up your timetable~
        </p>
      )}
    </div>
  )
}
