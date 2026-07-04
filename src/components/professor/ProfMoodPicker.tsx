import type { ProfMood } from '@/types'
import clsx from 'clsx'

const MOODS: { mood: ProfMood; label: string }[] = [
  { mood: 'good', label: 'Good' },
  { mood: 'neutral', label: 'Neutral' },
  { mood: 'grumpy', label: 'Grumpy' },
]

interface ProfMoodPickerProps {
  value?: ProfMood
  onChange: (mood: ProfMood | undefined) => void
}

export function ProfMoodPicker({ value, onChange }: ProfMoodPickerProps) {
  return (
    <div>
      <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
        Prof mood (just for fun)
      </p>
      <div className="flex gap-2">
        {MOODS.map(({ mood, label }) => (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(value === mood ? undefined : mood)}
            className={clsx(
              'flex-1 py-2 font-mono-body text-xs uppercase tracking-wide border-[3px] border-[var(--color-border)]',
              value === mood
                ? 'bg-[var(--color-highlight)] shadow-[2px_2px_0_var(--color-border)]'
                : 'bg-[var(--color-bg)]',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
