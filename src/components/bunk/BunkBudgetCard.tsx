import { useBunkBudget } from '@/hooks/useBunkBudget'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import { Card } from '@/components/ui/Card'

export function BunkBudgetCard() {
  const budget = useBunkBudget()

  if (!budget) return null

  const display =
    budget.isUnlimited ? '∞' : formatBunksAvailable(budget.totalSafeMisses)

  return (
    <Card padding="sm" className="bg-[var(--color-highlight)]/40">
      <div className="flex items-baseline gap-2">
        <span className="stat-number text-5xl">{display}</span>
        <span className="font-mono-body text-xs uppercase text-[var(--color-text-muted)]">
          {BUNKS_AVAILABLE}
        </span>
      </div>
      {budget.breakdown.length > 0 && (
        <ul className="mt-3 space-y-1 font-mono-body text-xs">
          {budget.breakdown.map((line) => (
            <li key={line.label} className="flex justify-between gap-2">
              <span className="truncate">{line.label}</span>
              <span className="shrink-0">
                {line.percentage}% ·{' '}
                {line.safeMisses === Infinity ? '—' : formatBunksAvailable(line.safeMisses)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
