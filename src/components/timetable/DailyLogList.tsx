/** List of scheduled classes for a day — one Mark action opens status picker. */
import clsx from 'clsx'
import { format, parseISO } from 'date-fns'
import type { ScheduledClass } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { PixelStatusIcon } from '@/components/pixel/PixelStatusIcon'
import { EmptyState } from '@/components/pixel/EmptyState'
import { ICON_SIZES } from '@/assets/iconSizes'

interface DailyLogListProps {
  classes: ScheduledClass[]
  onMark: (cls: ScheduledClass) => void
  emptyMessage?: string
  compact?: boolean
}

export function DailyLogList({
  classes,
  onMark,
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
      {classes.map((cls) => {
        const marked = Boolean(cls.entry)
        const status = cls.entry?.status ?? (cls.isHoliday ? 'Holiday' : 'pending')
        const needsRescheduleMark =
          cls.isRescheduled && cls.entry?.status !== 'Present' && cls.entry?.status !== 'Absent'

        return (
          <div
            key={cls.id}
            className={clsx(
              'menu-btn w-full !justify-between !px-3 !py-2.5 !cursor-default',
              compact && '!py-2',
              cls.isRescheduled && 'border-[var(--color-accent)]/40',
            )}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onMark(cls)}
            >
              <p className="heading-impact text-sm truncate">{cls.courseName}</p>
              <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] mt-0.5 normal-case tracking-normal">
                {cls.isRescheduled && (
                  <span className="text-[var(--color-accent)] font-semibold">Rescheduled · </span>
                )}
                {COMPONENT_TYPE_LABELS[cls.componentType]} · {cls.startTime} · {cls.durationMinutes}
                min
              </p>
              {cls.isRescheduled && cls.originalDate && (
                <p className="font-mono-body text-[9px] text-[var(--color-text-muted)] mt-0.5">
                  Was {format(parseISO(cls.originalDate), 'MMM d')}
                </p>
              )}
              {cls.rescheduledToDate && (
                <p className="font-mono-body text-[9px] text-[var(--color-accent)] mt-0.5">
                  Makeup on {format(parseISO(cls.rescheduledToDate), 'MMM d')}
                </p>
              )}
            </button>
            <div className="shrink-0 ml-2 flex items-center gap-2">
              {(!marked || needsRescheduleMark) && !cls.isHoliday && cls.entry?.status !== 'Cancelled' && (
                <button
                  type="button"
                  className="pixel-btn !px-2 !py-1 heading-impact text-[10px] bg-[var(--color-accent)] text-[var(--color-primary-btn-text)]"
                  onClick={() => onMark(cls)}
                >
                  Mark
                </button>
              )}
              <button
                type="button"
                onClick={() => onMark(cls)}
                aria-label={marked ? 'Change attendance' : 'Mark attendance'}
              >
                <PixelStatusIcon status={status} size={ICON_SIZES.status} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
