import type { BunkDecision } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { Card } from '@/components/ui/Card'
import { format, parseISO } from 'date-fns'

interface BunkDecisionLogProps {
  decisions: BunkDecision[]
}

function describeDecision(d: BunkDecision): string {
  const verdict =
    d.appVerdict === 'bunk' ? 'BUNK' : d.appVerdict === 'dont_bunk' ? "DON'T" : 'RISKY'

  switch (d.userAction) {
    case 'followed_bunk':
      return `App said ${verdict} · You bunked`
    case 'followed_stay':
      return `App said ${verdict} · You went`
    case 'overridden_bunk':
      return `App said ${verdict} · You bunked anyway`
    case 'overridden_stay':
      return `App said ${verdict} · You went anyway`
  }
}

export function BunkDecisionLog({ decisions }: BunkDecisionLogProps) {
  const sorted = [...decisions].sort(
    (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <Card className="text-center py-6">
        <p className="font-mono-body text-sm text-[var(--color-text-muted)]">
          No bunk decisions logged yet — try &quot;Bunk or Not?&quot; on a class.
        </p>
      </Card>
    )
  }

  const overrideCount = sorted.filter(
    (d) => d.userAction === 'overridden_bunk' || d.userAction === 'overridden_stay',
  ).length

  return (
    <div className="space-y-3">
      {overrideCount > 0 && (
        <p className="font-mono-body text-xs text-[var(--color-text-muted)]">
          You&apos;ve overridden the app {overrideCount} time{overrideCount !== 1 ? 's' : ''} — just
          for your own pattern awareness.
        </p>
      )}
      {sorted.map((d) => (
        <Card key={d.id} padding="sm">
          <div className="flex justify-between gap-2 items-start">
            <div>
              <p className="heading-impact text-sm">{d.courseName}</p>
              <p className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase mt-0.5">
                {COMPONENT_TYPE_LABELS[d.componentType]} · {d.classDate}
              </p>
            </div>
            <p className="font-mono-body text-[10px] text-[var(--color-text-muted)] shrink-0">
              {format(parseISO(d.decidedAt), 'MMM d, h:mm a')}
            </p>
          </div>
          <p className="font-mono-body text-sm mt-2">{describeDecision(d)}</p>
          <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-1">
            {d.pctBefore}% → projected {d.pctAfterProjected}%
          </p>
        </Card>
      ))}
    </div>
  )
}
