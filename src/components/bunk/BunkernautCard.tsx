/** Per-course frog card — fixed layout: mascot, footer, 3-row LTP strip. */
import { Card } from '@/components/ui/Card'
import { DangerBadge } from '@/components/ui/Badge'
import { PixelMascot } from '@/components/pixel/PixelMascot'
import { ICON_SIZES } from '@/assets/iconSizes'
import type { CourseStats } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { deriveCourseMascotMood } from '@/utils/calculations'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import clsx from 'clsx'

const LTP_SLOTS = 3
const LTP_ROW_H = 'h-[12px]'
const HERO_H = 215
const FOOTER_H = 56
const BOTTOM_H = 50

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

  return (
    <Card
      className={clsx(
        '!p-0 overflow-hidden flex flex-col min-w-0',
        onClick && 'cursor-pointer hover:translate-x-px hover:translate-y-px transition-transform',
      )}
      style={{ height: HERO_H + BOTTOM_H }}
      onClick={onClick}
    >
      <div
        className="hero-panel !border-0 !shadow-none flex flex-col shrink-0 overflow-hidden"
        style={{ height: HERO_H }}
      >
        <div
          className="w-full overflow-hidden flex items-end justify-center"
          style={{ height: HERO_H - FOOTER_H }}
        >
          <PixelMascot
            mood={mood}
            size={ICON_SIZES.mascotGridLg}
            fillContainer
            className="h-full w-full object-contain object-bottom"
          />
        </div>

        <footer
          className="shrink-0 w-full px-1.5 py-1 flex flex-col justify-center text-center leading-tight overflow-hidden"
          style={{ height: FOOTER_H }}
        >
          <p
            className="heading-impact text-[10px] uppercase text-[var(--color-text)] line-clamp-2 leading-tight break-words"
            title={stats.courseName}
          >
            {stats.courseName}
          </p>
          <p className="font-mono-body text-[9px] text-[var(--color-text-muted)] truncate mt-0.5">
            {stats.courseCode} ·{' '}
            <span className="font-bold text-[var(--color-text)]">{stats.percentage}%</span>
          </p>
          <div className="flex justify-center mt-0.5">
            <DangerBadge
              compact
              level={stats.dangerLevel}
              label={belowThreshold ? 'BELOW THRESHOLD' : undefined}
            />
          </div>
        </footer>
      </div>

      <div
        className="shrink-0 px-2 py-1.5 bg-[var(--color-surface)] flex gap-2 items-stretch min-w-0"
        style={{ height: BOTTOM_H }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-evenly">
          {Array.from({ length: LTP_SLOTS }, (_, i) => {
            const comp = ltpRows[i]
            if (!comp) {
              return <div key={`pad-${i}`} className={LTP_ROW_H} aria-hidden />
            }
            return (
              <p
                key={comp.componentId}
                className={clsx(
                  'font-mono-body text-[7px] leading-none text-[var(--color-text-muted)] truncate',
                  !comp.graded && 'opacity-40',
                )}
              >
                {COMPONENT_TYPE_LABELS[comp.type]} · {comp.percentage}% · {comp.missed} abs
              </p>
            )
          })}
        </div>

        <div className="w-[34px] shrink-0 flex flex-col items-center justify-center text-center">
          {belowThreshold ? (
            <p className="font-mono-body text-[6px] text-[var(--color-text)] leading-tight">
              Contact prof
            </p>
          ) : (
            <>
              <p className="stat-number text-sm leading-none">{bunks}</p>
              <p className="font-mono-body text-[5px] uppercase text-[var(--color-text-muted)] tracking-wide leading-tight mt-px">
                {BUNKS_AVAILABLE}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
