/** Celebration sparkle animation shown when marking Present. */
import { motion } from 'framer-motion'
import { PIXEL_ASSETS, assetCandidates } from '@/assets/pixelManifest'
import { ICON_SIZES } from '@/assets/iconSizes'
import { PixelImage } from '@/components/pixel/PixelImage'

export function SparkleBurst() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    candidates: assetCandidates(PIXEL_ASSETS.fx.sparkle[i % 3]),
  }))

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      {particles.map(({ angle, candidates }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: Math.cos(angle) * 50,
            y: Math.sin(angle) * 50,
          }}
          transition={{ duration: 0.7 }}
          className="absolute"
        >
          <PixelImage candidates={candidates} alt="" fallbackLabel="+" size={ICON_SIZES.sparkle} />
        </motion.div>
      ))}
    </div>
  )
}
