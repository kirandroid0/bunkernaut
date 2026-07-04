/** Settings explainer for course %, frog mood, and bunk budget terminology. */
import { Card } from '@/components/ui/Card'
import { BUNKS_AVAILABLE } from '@/utils/bunkLabels'

export function BunkernautGuide() {
  return (
    <Card padding="sm">
      <h2 className="heading-impact text-base text-[var(--color-text)] mb-2">Bunkernaut</h2>
      <div className="font-mono-body text-xs text-[var(--color-text-muted)] space-y-2">
        <p>
          <strong className="text-[var(--color-text)]">Course %</strong> — credit-weighted L/T/P.
          Example: lecture×3 + tutorial×1 + lab×2, divided by 6.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Frog mood</strong> — that % vs cutoff
          (sparkly · happy · nervous · sleepy).
        </p>
        <p>
          <strong className="text-[var(--color-text)]">{BUNKS_AVAILABLE}</strong> — safe skips left
          across graded parts before you drop below cutoff.
        </p>
        <p className="text-[var(--color-text)]">
          Don&apos;t burn bunks just because you have them~
        </p>
      </div>
    </Card>
  )
}
