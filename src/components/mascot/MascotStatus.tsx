import type { MascotMood } from '@/types'
import { ICON_SIZES } from '@/assets/iconSizes'
import { PixelMascot } from '@/components/pixel/PixelMascot'

const MOOD_COPY: Record<MascotMood, string> = {
  sparkly: "You're crushing it! Keep that streak going~",
  happy: 'Looking good! Your attendance is healthy~',
  nervous: 'Hmm... a course is getting close to the limit',
  sleepy: 'Zzz... we need to wake up that attendance!',
}

interface MascotStatusProps {
  mood: MascotMood
  semesterGPA?: number
  variant?: 'inline' | 'hero'
}

export function MascotStatus({ mood, semesterGPA, variant = 'inline' }: MascotStatusProps) {
  if (variant === 'hero') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <PixelMascot mood={mood} size={ICON_SIZES.mascotHero} />
        <div>
          <p className="font-mono-body text-sm text-[var(--color-text-muted)]">{MOOD_COPY[mood]}</p>
          {semesterGPA !== undefined && (
            <p className="stat-number text-3xl text-[var(--color-text)] mt-3">
              {semesterGPA}%
            </p>
          )}
          {semesterGPA !== undefined && (
            <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">
              Semester attendance
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <PixelMascot mood={mood} size={ICON_SIZES.mascotInline} className="shrink-0" />
      <div>
        <p className="heading-impact text-sm text-[var(--color-text-muted)] mb-1">Status</p>
        <p className="font-mono-body text-sm text-[var(--color-text)]">{MOOD_COPY[mood]}</p>
        {semesterGPA !== undefined && (
          <p className="stat-number text-xl text-[var(--color-text)] mt-2">{semesterGPA}%</p>
        )}
      </div>
    </div>
  )
}
