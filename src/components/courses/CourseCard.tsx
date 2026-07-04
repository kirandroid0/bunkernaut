import { Card } from '@/components/ui/Card'
import { DangerBadge } from '@/components/ui/Badge'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import type { CourseStats } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'

interface CourseCardProps {
  stats: CourseStats
  onClick?: () => void
  compact?: boolean
}

export function CourseCard({ stats, onClick, compact }: CourseCardProps) {
  return (
    <Card
      className="cursor-pointer hover:translate-x-px hover:translate-y-px transition-transform"
      padding={compact ? 'sm' : 'md'}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="heading-impact text-base sm:text-lg text-[var(--color-text)] truncate">
            {stats.courseName}
          </h3>
          {!compact && (
            <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-1 uppercase">
              {stats.components.length} component{stats.components.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="stat-number text-3xl sm:text-4xl text-[var(--color-text)]">
            {stats.percentage}%
          </p>
          <div className="mt-1">
            <DangerBadge level={stats.dangerLevel} />
          </div>
        </div>
      </div>

      {!compact && stats.safeMisses < Infinity && (
        <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-3">
          {stats.safeMisses > 0
            ? `${formatBunksAvailable(stats.safeMisses)} ${BUNKS_AVAILABLE}`
            : stats.recoveryNeeded > 0
              ? `Need ${stats.recoveryNeeded} presents to recover`
              : `0 ${BUNKS_AVAILABLE}`}
        </p>
      )}

      {!compact && stats.components.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {stats.components.map((c) => (
            <span
              key={c.componentId}
              className="font-mono-body text-[10px] px-2 py-1 uppercase tracking-wide border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            >
              {COMPONENT_TYPE_LABELS[c.type]}: {c.percentage}%
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
