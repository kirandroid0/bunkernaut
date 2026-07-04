/** Professor contact and personality notes shown before marking a class. */
import type { ScheduledClass } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProfessorCheatSheetProps {
  scheduledClass: ScheduledClass
  onMark?: () => void
}

export function ProfessorCheatSheet({ scheduledClass, onMark }: ProfessorCheatSheetProps) {
  return (
    <Card className="border-2 border-[var(--color-accent)]/40">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-lg pixel-art shrink-0"
          style={{ backgroundColor: scheduledClass.courseColor }}
        />
        <div>
          <h3 className="font-bold text-[var(--color-text)]">{scheduledClass.courseName}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {COMPONENT_TYPE_LABELS[scheduledClass.componentType]} · {scheduledClass.startTime}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <p className="text-[var(--color-text-muted)] text-xs font-semibold">Professor</p>
          <p className="font-bold">{scheduledClass.professorName || '—'}</p>
        </div>
        {scheduledClass.professorContact && (
          <div>
            <p className="text-[var(--color-text-muted)] text-xs font-semibold">Contact</p>
            <a
              href={
                scheduledClass.professorContact.includes('@')
                  ? `mailto:${scheduledClass.professorContact}`
                  : `tel:${scheduledClass.professorContact}`
              }
              className="font-semibold text-[var(--color-accent-strong)]"
            >
              {scheduledClass.professorContact}
            </a>
          </div>
        )}
        {scheduledClass.personalityNotes && (
          <div className="p-2 pixel-box-inset">
            <p className="text-[var(--color-text-muted)] text-xs font-semibold">Remember~</p>
            <p className="text-[var(--color-text)]">{scheduledClass.personalityNotes}</p>
          </div>
        )}
      </div>

      {onMark && (
        <Button className="w-full mt-4" onClick={onMark}>
          Mark attendance
        </Button>
      )}
    </Card>
  )
}
