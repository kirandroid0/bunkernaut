import { useState } from 'react'
import type { ScheduledClass } from '@/types'
import type { BunkUserAction } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { computeBunkVerdict } from '@/utils/bunk'
import { computeCourseStats, deriveCourseMascotMood } from '@/utils/calculations'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { BUNKS_AVAILABLE, formatBunksAvailable } from '@/utils/bunkLabels'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PixelMascot } from '@/components/pixel/PixelMascot'
import { ICON_SIZES } from '@/assets/iconSizes'

type Step = 'verdict' | 'confirm'

interface BunkOrNotSheetProps {
  scheduledClass: ScheduledClass | null
  open: boolean
  onClose: () => void
  onFollowBunk?: () => void
}

const VERDICT_HEADLINE: Record<string, string> = {
  bunk: 'BUNK IT',
  dont_bunk: "DON'T BUNK",
  risky: 'RISKY',
}

export function BunkOrNotSheet({
  scheduledClass,
  open,
  onClose,
  onFollowBunk,
}: BunkOrNotSheetProps) {
  const semester = useAppStore((s) => s.getActiveSemester())
  const logBunkDecision = useAppStore((s) => s.logBunkDecision)
  const [step, setStep] = useState<Step>('verdict')
  const [acceptRisk, setAcceptRisk] = useState(false)

  if (!scheduledClass || !semester) return null

  const course = semester.courses.find((c) => c.id === scheduledClass.courseId)
  if (!course) return null

  const result = computeBunkVerdict(course, scheduledClass.componentId, semester.entries)
  const courseStats = computeCourseStats(course, semester.entries)
  const mascotMood = deriveCourseMascotMood(courseStats)

  const reset = () => {
    setStep('verdict')
    setAcceptRisk(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const logDecision = (userAction: BunkUserAction) => {
    logBunkDecision({
      componentId: scheduledClass.componentId,
      courseId: course.id,
      courseName: course.name,
      componentType: scheduledClass.componentType,
      classDate: scheduledClass.date,
      decidedAt: new Date().toISOString(),
      appVerdict: result.verdict,
      userAction,
      pctBefore: result.pctBefore,
      pctAfterProjected: result.pctAfterProjected,
      safeMissesBefore: result.safeMissesBefore,
    })
  }

  const handleFollow = () => {
    if (result.verdict === 'bunk') {
      logDecision('followed_bunk')
      handleClose()
      onFollowBunk?.()
    } else {
      logDecision('followed_stay')
      handleClose()
    }
  }

  const handleOverride = () => {
    if (result.verdict === 'bunk') {
      logDecision('overridden_stay')
    } else {
      logDecision('overridden_bunk')
      onFollowBunk?.()
    }
    handleClose()
  }

  const followLabel = result.verdict === 'bunk' ? 'Yeah, bunk' : "I'll go"

  return (
    <Modal open={open} onClose={handleClose} title="Bunkernaut">
      {step === 'verdict' && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <PixelMascot mood={mascotMood} size={ICON_SIZES.mascotInline} />
          </div>

          <p className="font-mono-body text-xs text-center text-[var(--color-text-muted)]">
            {scheduledClass.courseName} · {COMPONENT_TYPE_LABELS[scheduledClass.componentType]}
          </p>

          <div className="pixel-box-inset p-4 text-center">
            <p className="heading-impact text-3xl text-[var(--color-text)]">
              {VERDICT_HEADLINE[result.verdict]}
            </p>
            <p className="font-mono-body text-sm text-[var(--color-text-muted)] mt-2">
              {result.pctBefore}% now → {result.pctAfterProjected}% if you bunk
            </p>
            <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-2">
              {formatBunksAvailable(result.safeMissesBefore)} {BUNKS_AVAILABLE}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleFollow}>
              {followLabel}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep('confirm')}>
              Go against it
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="heading-impact text-xl text-center">Sure?</p>
          <p className="font-mono-body text-sm text-center text-[var(--color-text-muted)]">
            App said {VERDICT_HEADLINE[result.verdict]}. You&apos;re doing the opposite.
          </p>
          <label className="flex items-start gap-2 font-mono-body text-xs p-3 pixel-box-inset cursor-pointer">
            <input
              type="checkbox"
              checked={acceptRisk}
              onChange={(e) => setAcceptRisk(e.target.checked)}
              className="mt-0.5"
            />
            <span>I know what I&apos;m doing</span>
          </label>
          <Button className="w-full" disabled={!acceptRisk} onClick={handleOverride}>
            Confirm
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep('verdict')}>
            Back
          </Button>
        </div>
      )}
    </Modal>
  )
}
