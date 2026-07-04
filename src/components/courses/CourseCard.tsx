/** Summary card for a course — brief abs chips + frog-free list view. */
import { Card } from '@/components/ui/Card'
import { DangerBadge } from '@/components/ui/Badge'
import { formatBunkStatusLine, formatLtpChip } from '@/utils/bunkLabels'
import type { CourseStats } from '@/types'

interface CourseCardProps {
  stats: CourseStats
  onClick?: () => void
  onDelete?: () => void
  compact?: boolean
}

export function CourseCard({ stats, onClick, onDelete, compact }: CourseCardProps) {
  return (
    <Card
      className="cursor-pointer hover:translate-x-px hover:translate-y-px transition-transform"
      padding={compact ? 'sm' : 'md'}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono-body text-[10px] text-[var(--color-text-muted)]">{stats.courseCode}</p>
          <h3 className="heading-impact text-base text-[var(--color-text)] truncate">
            {stats.courseName}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="stat-number text-2xl text-[var(--color-text)]">{stats.percentage}%</p>
          <div className="mt-1">
            <DangerBadge level={stats.dangerLevel} />
          </div>
        </div>
      </div>

      {!compact && (
        <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] mt-2">
          {formatBunkStatusLine(stats)}
        </p>
      )}

      {!compact && stats.components.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {stats.components.map((c) => (
            <span
              key={c.componentId}
              className="font-mono-body text-[9px] px-1.5 py-1 border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            >
              {formatLtpChip(c.type, c.percentage, c.missed)}
            </span>
          ))}
        </div>
      )}

      {onDelete && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border)]/40 flex justify-end">
          <button
            type="button"
            className="font-mono-body text-[10px] text-[var(--color-danger)] px-1 py-0.5 hover:underline"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </button>
        </div>
      )}
    </Card>
  )
}
