import { Link } from 'react-router-dom'
import type { Nudge } from '@/utils/nudges'
import { Button } from '@/components/ui/Button'

interface NudgeBannerProps {
  nudge: Nudge
  onDismiss: () => void
}

export function NudgeBanner({ nudge, onDismiss }: NudgeBannerProps) {
  return (
    <div className="pixel-box p-3 bg-[var(--color-bg-secondary)]">
      <p className="heading-impact text-base text-[var(--color-text)]">{nudge.title}</p>
      <p className="font-mono-body text-sm text-[var(--color-text-muted)] mt-1">{nudge.message}</p>
      <div className="flex gap-2 mt-3">
        <Link to={nudge.actionPath} className="flex-1" onClick={onDismiss}>
          <Button className="w-full" size="sm">
            {nudge.actionLabel}
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
