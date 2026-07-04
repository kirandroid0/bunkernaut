import clsx from 'clsx'
import type { ScheduledClass } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { PixelStatusIcon } from '@/components/pixel/PixelStatusIcon'
import { EmptyState } from '@/components/pixel/EmptyState'
import { ICON_SIZES } from '@/assets/iconSizes'

interface DailyLogListProps {
  classes: ScheduledClass[]
  onSelect: (cls: ScheduledClass) => void
  onBunkOrNot?: (cls: ScheduledClass) => void
  emptyMessage?: string
  compact?: boolean
}

export function DailyLogList({
  classes,
  onSelect,
  onBunkOrNot,
  emptyMessage = 'No classes today — enjoy your free time~',
  compact,
}: DailyLogListProps) {
  if (classes.length === 0) {
    return (
      <EmptyState
        variant="today"
        title="Nothing scheduled"
        message={emptyMessage}
      />
    )
  }

  return (
    <div className={clsx('space-y-2', compact && 'space-y-1.5')}>
      {classes.map((cls) => (
        <div
          key={cls.id}
          className={clsx(
            'menu-btn w-full !justify-between !px-3 !py-2.5 !cursor-default',
            compact && '!py-2',
          )}
        >
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() => onSelect(cls)}
          >
            <p className="heading-impact text-sm truncate">{cls.courseName}</p>
            <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] uppercase mt-0.5 normal-case tracking-normal">
              {COMPONENT_TYPE_LABELS[cls.componentType]} · {cls.startTime} · {cls.durationMinutes}min
            </p>
          </button>
          <div className="shrink-0 ml-2 flex items-center gap-2">
            {!cls.entry && !cls.isHoliday && (
              <button
                type="button"
                className="pixel-btn !px-2 !py-1 heading-impact text-[10px] bg-[var(--color-accent)] text-[var(--color-primary-btn-text)]"
                onClick={() => onSelect(cls)}
              >
                MARK
              </button>
            )}
            {onBunkOrNot && !cls.isHoliday && (
              <button
                type="button"
                className="pixel-btn !px-2 !py-1 heading-impact text-[10px] bg-[var(--color-highlight)]/60"
                onClick={(e) => {
                  e.stopPropagation()
                  onBunkOrNot(cls)
                }}
              >
                BUNK?
              </button>
            )}
            <button type="button" onClick={() => onSelect(cls)} aria-label="Mark attendance">
              {cls.entry ? (
                <PixelStatusIcon status={cls.entry.status} size={ICON_SIZES.status} />
              ) : cls.isHoliday ? (
                <PixelStatusIcon status="Holiday" size={ICON_SIZES.status} />
              ) : (
                <PixelStatusIcon status="pending" size={ICON_SIZES.status} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
