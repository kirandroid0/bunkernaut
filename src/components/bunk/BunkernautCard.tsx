/** Per-course frog mascot card showing bunk budget and L/T/P breakdown. */
import { Card } from '@/components/ui/Card'
import { DangerBadge } from '@/components/ui/Badge'
import { PixelMascot } from '@/components/pixel/PixelMascot'
import { ICON_SIZES } from '@/assets/iconSizes'
import type { CourseStats } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { deriveCourseMascotMood } from '@/utils/calculations'
import { computeCourseBunkernaut } from '@/utils/bunkernaut'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import clsx from 'clsx'

interface BunkernautCardProps {
  stats: CourseStats
  onClick?: () => void
}

export function BunkernautCard({ stats, onClick }: BunkernautCardProps) {
  const mood = deriveCourseMascotMood(stats)
  const { bunksAvailable } = computeCourseBunkernaut(stats)

  return (
    <Card
      className={clsx(
        onClick && 'cursor-pointer hover:translate-x-px hover:translate-y-px transition-transform',
      )}
      padding="sm"
      onClick={onClick}
    >
      <div className="flex gap-3 items-center">
        <PixelMascot mood={mood} size={ICON_SIZES.mascotInline} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="heading-impact text-lg text-[var(--color-text)] truncate">
            {stats.courseName}
          </h3>
          <DangerBadge level={stats.dangerLevel} />
        </div>
        <div className="text-right shrink-0">
          <p className="stat-number text-4xl leading-none">{bunksAvailable}</p>
          <p className="font-mono-body text-[9px] uppercase text-[var(--color-text-muted)] max-w-[72px] leading-tight mt-0.5">
            {BUNKS_AVAILABLE}
          </p>
        </div>
      </div>

      {stats.components.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {stats.components.map((comp) => (
            <span
              key={comp.componentId}
              className={clsx(
                'font-mono-body text-[10px] px-2 py-1 border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]',
                !comp.graded && 'opacity-50',
              )}
              title={`${formatBunksAvailable(comp.safeMisses === Infinity ? 0 : comp.safeMisses)} ${BUNKS_AVAILABLE}`}
            >
              {COMPONENT_TYPE_LABELS[comp.type]} {comp.percentage}% ·{' '}
              {comp.safeMisses === Infinity ? '—' : formatBunksAvailable(comp.safeMisses)}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
