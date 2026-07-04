/** Safe/warning/danger badge for attendance threshold status. */
import clsx from 'clsx'
import type { DangerLevel } from '@/types'

interface BadgeProps {
  level: DangerLevel
  label?: string
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

export function DangerBadge({ level, label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-mono-body font-bold uppercase tracking-wider border-2',
        styles[level],
        className,
      )}
    >
      {label ?? defaultLabels[level]}
    </span>
  )
}
