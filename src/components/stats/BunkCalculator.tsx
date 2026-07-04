import type { ComponentStats } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import { Card } from '@/components/ui/Card'

interface BunkCalculatorProps {
  stats: ComponentStats | { percentage: number; safeMisses: number; recoveryNeeded: number; threshold: number; type?: string }
  label?: string
}

export function BunkCalculator({ stats, label }: BunkCalculatorProps) {
  const typeLabel = 'type' in stats && stats.type
    ? COMPONENT_TYPE_LABELS[stats.type as keyof typeof COMPONENT_TYPE_LABELS]
    : null

  return (
    <Card padding="sm" className="bg-[var(--color-bg-secondary)]/50">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-[var(--color-text)]">
          {label ?? (typeLabel ? `${typeLabel} Bunk Calc` : 'Bunk Calculator')}
        </span>
        <span className="text-sm font-extrabold text-[var(--color-success)]">
          {stats.percentage}%
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        {stats.safeMisses === Infinity || stats.safeMisses > 99
          ? 'No classes marked yet — you\'re free as a bird~'
          : stats.safeMisses > 0
            ? `${formatBunksAvailable(stats.safeMisses)} ${BUNKS_AVAILABLE} (cutoff ${stats.threshold}%)`
            : stats.recoveryNeeded > 0
              ? `Need ${stats.recoveryNeeded} presents to recover`
              : `0 ${BUNKS_AVAILABLE}`}
      </p>
    </Card>
  )
}
