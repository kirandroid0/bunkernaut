/** Modal for marking Present/Absent/Cancelled/Holiday on a class. */
import { useState, useEffect, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import type { AttendanceStatus, ProfMood, RescheduledStatus, ScheduledClass } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { feedbackOnMark } from '@/utils/feedback'
import { findRescheduledSession, getRescheduledClassesForDate } from '@/utils/rescheduled'
import { getTodayClasses } from '@/utils/timetable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ProfMoodPicker } from '@/components/professor/ProfMoodPicker'
import { SparkleBurst } from '@/components/mascot/SparkleBurst'
import { PixelStatusIcon } from '@/components/pixel/PixelStatusIcon'
import { ICON_SIZES } from '@/assets/iconSizes'
import clsx from 'clsx'

const STATUSES: { status: AttendanceStatus; label: string; menuClass?: string }[] = [
  { status: 'Present', label: 'Present', menuClass: 'menu-btn--present' },
  { status: 'Absent', label: 'Absent', menuClass: 'menu-btn--absent' },
  { status: 'Cancelled', label: 'Cancelled' },
  { status: 'Holiday', label: 'Holiday' },
]

const RESCHEDULED_STATUSES: { status: RescheduledStatus; label: string; menuClass?: string }[] = [
  { status: 'Present', label: 'Present', menuClass: 'menu-btn--present' },
  { status: 'Absent', label: 'Absent', menuClass: 'menu-btn--absent' },
]

type Step = 'main' | 'cancelled-prompt' | 'reschedule-details' | 'reschedule-mark'

const WIZARD_STEPS: Step[] = ['cancelled-prompt', 'reschedule-details', 'reschedule-mark']

interface MarkAttendanceSheetProps {
  scheduledClass: ScheduledClass | null
  open: boolean
  onClose: () => void
  onMarked?: (status: AttendanceStatus | RescheduledStatus) => void
}

export function MarkAttendanceSheet({
  scheduledClass,
  open,
  onClose,
  onMarked,
}: MarkAttendanceSheetProps) {
  const semester = useAppStore((s) => s.getActiveSemester())
  const upsertAttendance = useAppStore((s) => s.upsertAttendance)
  const upsertRescheduledSession = useAppStore((s) => s.upsertRescheduledSession)
  const markRescheduledSession = useAppStore((s) => s.markRescheduledSession)
  const removeRescheduledSession = useAppStore((s) => s.removeRescheduledSession)
  const settings = useAppStore((s) => s.settings)

  const [step, setStep] = useState<Step>('main')
  const [duration, setDuration] = useState(60)
  const [profMood, setProfMood] = useState<ProfMood | undefined>()
  const [rescheduledDate, setRescheduledDate] = useState('')
  const [rescheduledTime, setRescheduledTime] = useState('09:00')
  const [showSparkle, setShowSparkle] = useState(false)
  const [shake, setShake] = useState(false)

  /** Fresh class row from store — parent keeps a stale snapshot from when the sheet opened. */
  const activeClass = useMemo(() => {
    if (!scheduledClass || !semester || !open) return scheduledClass

    if (scheduledClass.isRescheduled) {
      return (
        getRescheduledClassesForDate(semester, scheduledClass.date).find(
          (c) => c.id === scheduledClass.id,
        ) ?? scheduledClass
      )
    }

    return (
      getTodayClasses(semester, parseISO(scheduledClass.date)).find(
        (c) => c.id === scheduledClass.id,
      ) ?? scheduledClass
    )
  }, [scheduledClass, semester, open])

  // Init step only when the sheet opens or a different class is selected — not on store updates.
  useEffect(() => {
    if (!open) {
      setStep('main')
      return
    }
    if (!scheduledClass) return

    const sem = useAppStore.getState().getActiveSemester()
    if (!sem) return

    setDuration(scheduledClass.durationMinutes)
    setProfMood(scheduledClass.entry?.profMood)
    setRescheduledTime(scheduledClass.startTime)
    setRescheduledDate(scheduledClass.date)

    if (scheduledClass.isRescheduled) {
      setStep('reschedule-mark')
      return
    }

    const fresh =
      getTodayClasses(sem, parseISO(scheduledClass.date)).find(
        (c) => c.id === scheduledClass.id,
      ) ?? scheduledClass

    const linked = findRescheduledSession(
      sem,
      scheduledClass.componentId,
      scheduledClass.date,
    )

    if (linked) {
      setRescheduledDate(linked.rescheduledDate)
      setRescheduledTime(linked.startTime)
      setDuration(linked.durationMinutes)
      setStep('reschedule-mark')
      return
    }

    if (fresh.entry?.status === 'Cancelled') {
      setStep('cancelled-prompt')
      return
    }

    setStep('main')
  }, [open, scheduledClass?.id])

  if (!scheduledClass || !activeClass) return null

  const finishClose = (delay = 200) => {
    setTimeout(onClose, delay)
  }

  const runFeedback = (status: AttendanceStatus | RescheduledStatus) => {
    feedbackOnMark(status, settings)
    if (!settings.animationsEnabled) return
    if (status === 'Present') {
      setShowSparkle(true)
      setTimeout(() => setShowSparkle(false), 800)
    }
    if (status === 'Absent') {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleMark = (status: AttendanceStatus) => {
    if (status === 'Cancelled') {
      upsertAttendance(
        activeClass.componentId,
        activeClass.date,
        status,
        duration,
        profMood,
      )
      runFeedback(status)
      setStep('cancelled-prompt')
      return
    }

    upsertAttendance(
      activeClass.componentId,
      activeClass.date,
      status,
      duration,
      profMood,
    )
    runFeedback(status)
    onMarked?.(status)
    finishClose(status === 'Present' && settings.animationsEnabled ? 600 : 200)
  }

  const handleRescheduleMark = (status: RescheduledStatus) => {
    const originalDate = activeClass.isRescheduled
      ? (activeClass.originalDate ?? activeClass.date)
      : activeClass.date
    const sessionId =
      activeClass.rescheduledSessionId ??
      linkedSession?.id ??
      (semester
        ? findRescheduledSession(semester, activeClass.componentId, originalDate)?.id
        : undefined)

    if (!sessionId) return

    markRescheduledSession(sessionId, status, duration, profMood)
    runFeedback(status)
    onMarked?.(status)
    finishClose(status === 'Present' && settings.animationsEnabled ? 600 : 200)
  }

  const saveRescheduleDetails = () => {
    upsertRescheduledSession({
      componentId: activeClass.componentId,
      originalDate: activeClass.date,
      rescheduledDate,
      startTime: rescheduledTime,
      durationMinutes: duration,
    })
    setStep('reschedule-mark')
  }

  const linkedSession =
    semester && !activeClass.isRescheduled
      ? findRescheduledSession(semester, activeClass.componentId, activeClass.date)
      : semester && activeClass.isRescheduled && activeClass.originalDate
        ? findRescheduledSession(
            semester,
            activeClass.componentId,
            activeClass.originalDate,
          )
        : undefined

  const activeRescheduleId = activeClass.rescheduledSessionId ?? linkedSession?.id

  const currentStatus = activeClass.entry?.status

  const classHeader = (
    <>
      <p className="heading-impact text-base text-[var(--color-text)] mb-1">
        {activeClass.courseName}
      </p>
      <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
        {COMPONENT_TYPE_LABELS[activeClass.componentType]} · {activeClass.startTime} ·{' '}
        {activeClass.date}
      </p>
      {activeClass.isRescheduled && activeClass.originalDate && (
        <p className="font-mono-body text-[10px] text-[var(--color-accent)] mb-3">
          Rescheduled from {format(parseISO(activeClass.originalDate), 'MMM d')}
        </p>
      )}
      {activeClass.rescheduledToDate && (
        <p className="font-mono-body text-[10px] text-[var(--color-accent)] mb-3">
          Rescheduled to {format(parseISO(activeClass.rescheduledToDate), 'MMM d')}
        </p>
      )}
    </>
  )

  const handleModalClose = () => {
    if (WIZARD_STEPS.includes(step)) return
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      title={
        step === 'cancelled-prompt'
          ? 'Class cancelled'
          : step === 'reschedule-details'
            ? 'Reschedule class'
            : step === 'reschedule-mark'
              ? 'Mark rescheduled class'
              : 'Mark attendance'
      }
    >
      <motion.div animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}} className="relative">
        {showSparkle && settings.animationsEnabled && <SparkleBurst />}

        {step === 'main' && (
          <>
            {classHeader}

            {currentStatus && (
              <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                <PixelStatusIcon status={currentStatus} size={ICON_SIZES.status} />
                Currently marked {currentStatus.toLowerCase()} — pick a new status to change
              </p>
            )}

            <label className="block mb-4">
              <span className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                Duration (min)
              </span>
              <input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="pixel-input mt-1"
              />
            </label>

            <ProfMoodPicker value={profMood} onChange={setProfMood} />

            <div className="flex flex-col gap-2 mt-5">
              {STATUSES.map(({ status, label, menuClass }) => (
                <button
                  key={status}
                  type="button"
                  className={clsx('menu-btn', menuClass)}
                  onClick={() => handleMark(status)}
                >
                  <PixelStatusIcon status={status} size={ICON_SIZES.status} />
                  {label}
                </button>
              ))}
            </div>

            {activeClass.isHoliday && !activeClass.entry && (
              <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-4 text-center uppercase">
                Institute holiday
                {activeClass.holidayLabel ? `: ${activeClass.holidayLabel}` : ''}
              </p>
            )}
          </>
        )}

        {step === 'cancelled-prompt' && (
          <div className="space-y-4">
            {classHeader}
            <div className="pixel-box-inset p-3 flex items-center gap-2">
              <PixelStatusIcon status="Cancelled" size={ICON_SIZES.status} />
              <p className="font-mono-body text-sm text-[var(--color-text)]">
                Marked cancelled for this slot.
              </p>
            </div>
            <p className="font-mono-body text-sm text-[var(--color-text-muted)]">
              Is this class being rescheduled to another day?
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => setStep('reschedule-details')}>
                Yes — pick new date
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  removeRescheduledSession(activeClass.componentId, activeClass.date)
                  onMarked?.('Cancelled')
                  finishClose()
                }}
              >
                No — just cancelled
              </Button>
            </div>
          </div>
        )}

        {step === 'reschedule-details' && (
          <div className="space-y-4">
            {classHeader}
            <label className="block">
              <span className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                New date
              </span>
              <input
                type="date"
                value={rescheduledDate}
                onChange={(e) => setRescheduledDate(e.target.value)}
                className="pixel-input mt-1"
              />
            </label>
            <label className="block">
              <span className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                Time
              </span>
              <input
                type="time"
                value={rescheduledTime}
                onChange={(e) => setRescheduledTime(e.target.value)}
                className="pixel-input mt-1"
              />
            </label>
            <label className="block">
              <span className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                Duration (min)
              </span>
              <input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="pixel-input mt-1"
              />
            </label>
            <Button className="w-full" disabled={!rescheduledDate} onClick={saveRescheduleDetails}>
              Continue
            </Button>
          </div>
        )}

        {step === 'reschedule-mark' && activeRescheduleId && (
          <>
            {classHeader}
            <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-4">
              {activeClass.isRescheduled
                ? `Rescheduled class on ${format(parseISO(rescheduledDate || activeClass.date), 'MMM d')} — mark present or absent.`
                : `Rescheduled to ${format(parseISO(rescheduledDate), 'MMM d')} at ${rescheduledTime} — mark the makeup class now or later from that day.`}
            </p>

            {currentStatus && (currentStatus === 'Present' || currentStatus === 'Absent') && (
              <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                <PixelStatusIcon status={currentStatus} size={ICON_SIZES.status} />
                Currently {currentStatus.toLowerCase()}
              </p>
            )}

            <label className="block mb-4">
              <span className="font-mono-body text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                Duration (min)
              </span>
              <input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="pixel-input mt-1"
              />
            </label>

            <ProfMoodPicker value={profMood} onChange={setProfMood} />

            <div className="flex flex-col gap-2 mt-5">
              {RESCHEDULED_STATUSES.map(({ status, label, menuClass }) => (
                <button
                  key={status}
                  type="button"
                  className={clsx('menu-btn', menuClass)}
                  onClick={() => handleRescheduleMark(status)}
                >
                  <PixelStatusIcon status={status} size={ICON_SIZES.status} />
                  {label}
                </button>
              ))}
            </div>

            {!activeClass.isRescheduled && (
              <Button variant="ghost" className="w-full mt-3" onClick={() => finishClose()}>
                Mark later
              </Button>
            )}
          </>
        )}
      </motion.div>
    </Modal>
  )
}
