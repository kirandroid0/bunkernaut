import { PIXEL_ASSETS, assetCandidates } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import { PixelImage } from './PixelImage'
import { Card } from '@/components/ui/Card'

type EmptyVariant = keyof typeof PIXEL_ASSETS.empty

interface EmptyStateProps {
  variant: EmptyVariant
  title: string
  message: string
  action?: React.ReactNode
}

const FALLBACK_LABELS: Record<EmptyVariant, string> = {
  courses: '0',
  today: '~',
  stats: '..',
}

export function EmptyState({ variant, title, message, action }: EmptyStateProps) {
  return (
    <Card className="text-center flex flex-col items-center gap-3 py-8">
      <PixelImage
        candidates={assetCandidates(PIXEL_ASSETS.empty[variant])}
        alt={title}
        fallbackLabel={FALLBACK_LABELS[variant]}
        size={ICON_SIZES.empty}
      />
      <h3 className="heading-impact text-lg text-[var(--color-text)]">{title}</h3>
      <p className="font-mono-body text-sm text-[var(--color-text-muted)] max-w-xs">{message}</p>
      {action}
    </Card>
  )
}
