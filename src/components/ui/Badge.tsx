/** Safe/warning/danger badge for attendance threshold status. */
import clsx from 'clsx'
import type { DangerLevel } from '@/types'

interface BadgeProps {
  level: DangerLevel
  label?: string
  compact?: boolean
  className?: string
}

const styles: Record<DangerLevel, string> = {
  safe: 'bg-[var(--color-highlight)] text-[var(--color-text)] border-[var(--color-border)]',
  warning: 'bg-[var(--color-accent)] text-[var(--color-primary-btn-text)] border-[var(--color-border)]',
  danger: 'bg-[var(--color-text-muted)] text-[var(--color-primary-btn-text)] border-[var(--color-border)]',
}

const defaultLabels: Record<DangerLevel, string> = {
  safe: 'ALL GOOD',
  warning: 'GETTING CLOSE',
  danger: 'DANGER ZONE',
}

export function DangerBadge({ level, label, compact, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono-body font-bold uppercase border-2',
        compact
          ? 'px-1 py-px text-[6px] tracking-wide leading-none'
          : 'px-2 py-0.5 text-[10px] tracking-wider',
        styles[level],
        className,
      )}
    >
      {label ?? defaultLabels[level]}
    </span>
  )
}
