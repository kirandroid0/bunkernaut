import { PIXEL_ASSETS, assetCandidates } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import { PixelImage } from './PixelImage'

interface PixelNavIconProps {
  icon: keyof typeof PIXEL_ASSETS.nav
  size?: number
}

export function PixelNavIcon({ icon, size = ICON_SIZES.nav }: PixelNavIconProps) {
  return (
    <PixelImage
      candidates={assetCandidates(PIXEL_ASSETS.nav[icon])}
      alt={icon}
      fallbackLabel={icon[0].toUpperCase()}
      size={size}
    />
  )
}
