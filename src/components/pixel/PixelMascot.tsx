/** Renders the frog mascot image for a given mood (sparkly/happy/nervous/sleepy). */
import { mascotCandidates, MASCOT_PLACEHOLDER_LABELS } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import type { MascotMood } from '@/types'
import { PixelImage } from './PixelImage'
import clsx from 'clsx'

interface PixelMascotProps {
  mood: MascotMood
  size?: number
  className?: string
}

const MOOD_CLASS: Record<MascotMood, string> = {
  sparkly: '',
  happy: '',
  nervous: 'mascot-mood-nervous',
  sleepy: 'mascot-mood-sleepy',
}

export function PixelMascot({ mood, size = ICON_SIZES.mascotInline, className }: PixelMascotProps) {
  return (
    <PixelImage
      key={mood}
      candidates={mascotCandidates(mood)}
      alt={`Mascot — ${mood}`}
      fallbackLabel={MASCOT_PLACEHOLDER_LABELS[mood]}
      size={size}
      className={clsx(MOOD_CLASS[mood], className)}
    />
  )
}
