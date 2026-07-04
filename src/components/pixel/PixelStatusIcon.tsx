import { PIXEL_ASSETS, assetCandidates, STATUS_PLACEHOLDER_LABELS } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import type { AttendanceStatus } from '@/types'
import { PixelImage } from './PixelImage'

interface PixelStatusIconProps {
  status: AttendanceStatus | 'unmarked' | 'pending'
  size?: number
}

export function PixelStatusIcon({ status, size = ICON_SIZES.status }: PixelStatusIconProps) {
  if (status === 'unmarked' || status === 'pending') {
    return (
      <PixelImage
        candidates={assetCandidates(PIXEL_ASSETS.status.Present.replace(/\.png$/, ''))}
        alt="Unmarked"
        fallbackLabel="?"
        size={size}
        className="opacity-40"
      />
    )
  }

  const base = PIXEL_ASSETS.status[status].replace(/\.png$/, '')

  return (
    <PixelImage
      candidates={assetCandidates(base)}
      alt={status}
      fallbackLabel={STATUS_PLACEHOLDER_LABELS[status]}
      size={size}
    />
  )
}
