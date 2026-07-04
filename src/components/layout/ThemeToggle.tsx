/** Sun/moon button to toggle light and dark theme. */
import { useAppStore } from '@/store/useAppStore'
import { PIXEL_ASSETS, assetCandidates } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import { PixelImage } from '@/components/pixel/PixelImage'

export function ThemeToggle() {
  const theme = useAppStore((s) => s.settings.theme)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const icon = theme === 'light' ? PIXEL_ASSETS.theme.sun : PIXEL_ASSETS.theme.moon
  const fallback = theme === 'light' ? 'S' : 'M'

  return (
    <button
      type="button"
      className="pixel-btn !p-2 bg-[var(--color-bg)]"
      onClick={() => updateSettings({ theme: theme === 'light' ? 'dark' : 'light' })}
      aria-label="Toggle theme"
    >
      <PixelImage candidates={assetCandidates(icon)} alt="Toggle theme" fallbackLabel={fallback} size={ICON_SIZES.theme} />
    </button>
  )
}
