/** Brief in-app guide — frog moods and core terms. */
import { Card } from '@/components/ui/Card'
import { PixelMascot } from '@/components/pixel/PixelMascot'
import { ICON_SIZES } from '@/assets/iconSizes'
import { MASCOT_MOOD_LABELS } from '@/utils/bunkLabels'
import type { MascotMood } from '@/types'

const MOODS: MascotMood[] = ['sparkly', 'happy', 'nervous', 'sleepy']

export function UserManual() {
  return (
    <Card padding="sm">
      <h2 className="heading-impact text-base text-[var(--color-text)] mb-3">Manual</h2>

      <p className="font-mono-body text-[11px] text-[var(--color-text-muted)] mb-3">
        Frogs mirror your attendance vs threshold. Mark daily — absent = bunk.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((mood) => (
          <div
            key={mood}
            className="pixel-box-inset p-2 flex flex-col items-center text-center gap-1"
          >
            <PixelMascot mood={mood} size={ICON_SIZES.mascotMini} />
            <p className="font-mono-body text-[9px] text-[var(--color-text)] leading-tight">
              {MASCOT_MOOD_LABELS[mood]}
            </p>
          </div>
        ))}
      </div>

      <ul className="font-mono-body text-[10px] text-[var(--color-text-muted)] mt-3 space-y-1.5 list-none p-0 m-0">
        <li>
          <strong className="text-[var(--color-text)]">L / T / P</strong> — lecture, tutorial, lab.
          Course % is credit-weighted (e.g. L×3 + T×1 counts more than T alone).
        </li>
        <li>
          <strong className="text-[var(--color-text)]">Cancelled</strong> — rescheduled classes can
          be marked on the new date.
        </li>
      </ul>

      <div className="mt-3 pt-3 border-t border-[var(--color-border)]/40">
        <h3 className="font-mono-body text-[11px] font-bold text-[var(--color-text)] mb-1.5">
          How bunks available works
        </h3>
        <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] leading-relaxed mb-2">
          A <strong className="text-[var(--color-text)]">bunk</strong> is one absent mark.{' '}
          <strong className="text-[var(--color-text)]">Bunks available</strong> is how many more
          you can skip before your course % drops below your threshold.
        </p>
        <ol className="font-mono-body text-[10px] text-[var(--color-text-muted)] space-y-1.5 list-decimal pl-4 m-0 mb-2">
          <li>
            We count only <strong className="text-[var(--color-text)]">Present</strong> and{' '}
            <strong className="text-[var(--color-text)]">Absent</strong>. Cancelled and holiday
            days don&apos;t affect %.
          </li>
          <li>
            Course % is the credit-weighted average of your graded L / T / P components.
          </li>
          <li>
            We ask: if you bunked that many more times, would you still stay at or above your
            threshold? The answer is your bunk count.
          </li>
        </ol>
        <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] leading-relaxed pixel-box-inset p-2 mb-2">
          <strong className="text-[var(--color-text)]">Example:</strong> threshold 75%, 18 present
          and 2 absent (20 classes) → 90%. You can bunk{' '}
          <strong className="text-[var(--color-text)]">4</strong> more times and still stay at 75%
          (18÷24).
        </p>
        <ul className="font-mono-body text-[10px] text-[var(--color-text-muted)] space-y-1 list-none p-0 m-0">
          <li>
            <strong className="text-[var(--color-text)]">Already below threshold?</strong> No bunk
            count — contact your professor.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Nothing marked yet?</strong> We show — until
            you log your first class.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">L · T · P chips</strong> on each card show
            that component&apos;s own % and absences separately.
          </li>
        </ul>
      </div>
    </Card>
  )
}
