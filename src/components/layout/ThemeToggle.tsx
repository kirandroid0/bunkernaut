/** Sun/moon button to toggle light and dark theme. */
import { useAppStore } from '@/store/useAppStore'
import { PIXEL_ASSETS, assetCandidates } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import { PixelImage } from '@/components/pixel/PixelImage'
import clsx from 'clsx'

interface ThemeToggleProps {
  compact?: boolean
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const theme = useAppStore((s) => s.settings.theme)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const icon = theme === 'light' ? PIXEL_ASSETS.theme.sun : PIXEL_ASSETS.theme.moon
  const fallback = theme === 'light' ? 'S' : 'M'
  const iconSize = compact ? ICON_SIZES.theme / 2 : ICON_SIZES.theme

  return (
    <button
      type="button"
      className={clsx(
        'pixel-btn bg-[var(--color-bg)] shrink-0',
        compact ? '!p-0.5' : '!p-2',
      )}
      onClick={() => updateSettings({ theme: theme === 'light' ? 'dark' : 'light' })}
      aria-label="Toggle theme"
    >
      <PixelImage
        candidates={assetCandidates(icon)}
        alt="Toggle theme"
        fallbackLabel={fallback}
        size={iconSize}
      />
    </button>
  )
}
