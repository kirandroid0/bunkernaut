/** Loads pixel art with format fallback chain (.gif → .png → .svg → text label). */
import { useState } from 'react'
import clsx from 'clsx'

interface PixelImageProps {
  src?: string
  candidates?: string[]
  alt: string
  fallbackLabel?: string
  size?: number
  className?: string
}

function buildCandidates(src: string): string[] {
  if (src.endsWith('.png') || src.endsWith('.gif') || src.endsWith('.svg')) {
    const base = src.replace(/\.(png|gif|svg)$/i, '')
    return [`${base}.gif`, `${base}.png`, `${base}.svg`]
  }
  return [`${src}.gif`, `${src}.png`, `${src}.svg`]
}

export function PixelImage({
  src,
  candidates: candidatesProp,
  alt,
  fallbackLabel,
  size = 32,
  className,
}: PixelImageProps) {
  const allCandidates = candidatesProp ?? (src ? buildCandidates(src) : [])
  const [srcIndex, setSrcIndex] = useState(0)

  const handleError = () => {
    if (srcIndex < allCandidates.length - 1) {
      setSrcIndex((i) => i + 1)
    } else {
      setSrcIndex(allCandidates.length)
    }
  }

  if (allCandidates.length === 0 || srcIndex >= allCandidates.length) {
    return (
      <div
        className={clsx(
          'pixel-art inline-flex items-center justify-center shrink-0',
          'bg-[var(--color-highlight)] border-2 border-[var(--color-border)]',
          'font-mono-body text-[var(--color-text)]',
          className,
        )}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(9, size * 0.3),
        }}
        title={alt}
        aria-label={alt}
      >
        {fallbackLabel ?? '?'}
      </div>
    )
  }

  return (
    <img
      src={allCandidates[srcIndex]}
      alt={alt}
      width={size}
      height={size}
      className={clsx('pixel-art shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
      onError={handleError}
    />
  )
}
