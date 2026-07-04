/** Per-course frog card — max mascot, text footer in green zone, 2-col grid. */
import { Card } from '@/components/ui/Card'
import { DangerBadge } from '@/components/ui/Badge'
import { PixelMascot } from '@/components/pixel/PixelMascot'
import { ICON_SIZES } from '@/assets/iconSizes'
import type { CourseStats } from '@/types'
import { deriveCourseMascotMood } from '@/utils/calculations'
import {
  BUNKS_AVAILABLE,
  formatBunksAvailable,
  formatLtpChip,
} from '@/utils/bunkLabels'
import clsx from 'clsx'

const LTP_SLOTS = 3
const LTP_ROW_H = 'h-[15px]'

interface BunkernautCardProps {
  stats: CourseStats
  onClick?: () => void
}

export function BunkernautCard({ stats, onClick }: BunkernautCardProps) {
  const mood = deriveCourseMascotMood(stats)
  const belowThreshold = stats.percentage < stats.threshold
  const bunks =
    stats.safeMisses === Infinity || (stats.safeMisses === 0 && stats.components.length === 0)
      ? '—'
      : formatBunksAvailable(stats.safeMisses)

  const ltpRows = stats.components.slice(0, LTP_SLOTS)
  const ltpPad = Math.max(0, LTP_SLOTS - ltpRows.length)

  return (
    <Card
      className={clsx(
        '!p-0 overflow-hidden h-full flex flex-col min-w-0',
        onClick && 'cursor-pointer hover:translate-x-px hover:translate-y-px transition-transform',
      )}
      onClick={onClick}
    >
      <div className="hero-panel !border-0 !shadow-none h-[272px] shrink-0 grid grid-rows-[1fr_auto] min-w-0">
        <div className="min-h-0 w-full flex items-end justify-center overflow-hidden px-0.5 pt-1">
          <PixelMascot
            mood={mood}
            size={ICON_SIZES.mascotGridLg}
            fillContainer
            className="object-contain object-bottom"
          />
        </div>

        <footer className="shrink-0 w-full px-1.5 pt-1 pb-2 text-center leading-normal">
          <p
            className="font-mono-body text-[7px] text-[var(--color-text)] truncate"
            title={stats.courseName}
          >
            {stats.courseName}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 min-w-0">
            <p className="font-mono-body text-[7px] text-[var(--color-text-muted)] shrink-0">
              {stats.courseCode} · {stats.percentage}%
            </p>
            <DangerBadge
              compact
              level={stats.dangerLevel}
              label={belowThreshold ? 'BELOW THRESHOLD' : undefined}
            />
          </div>
        </footer>
      </div>

      <div className="h-[76px] shrink-0 px-1.5 py-1 bg-[var(--color-surface)] flex gap-1 items-stretch min-w-0">
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-px">
          {ltpRows.map((comp) => (
            <div
              key={comp.componentId}
              className={clsx(
                LTP_ROW_H,
                'font-mono-body text-[6.5px] leading-none px-0.5 flex items-center border border-[var(--color-border)] bg-[var(--color-bg)] truncate',
                !comp.graded && 'opacity-50',
              )}
            >
              {formatLtpChip(comp.type, comp.percentage, comp.missed)}
            </div>
          ))}
          {Array.from({ length: ltpPad }, (_, i) => (
            <div key={`pad-${i}`} className={LTP_ROW_H} aria-hidden />
          ))}
        </div>

        <div className="w-[40px] shrink-0 flex flex-col items-center justify-center text-center border-l border-[var(--color-border)]/40 pl-0.5">
          {belowThreshold ? (
            <p className="font-mono-body text-[5.5px] text-[var(--color-text)] leading-tight">
              Contact prof
            </p>
          ) : (
            <>
              <p className="stat-number text-base leading-none">{bunks}</p>
              <p className="font-mono-body text-[4.5px] uppercase text-[var(--color-text-muted)] tracking-wide leading-tight">
                {BUNKS_AVAILABLE}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
