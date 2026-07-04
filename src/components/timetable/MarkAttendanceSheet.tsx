import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { AttendanceStatus, ProfMood, ScheduledClass } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { feedbackOnMark } from '@/utils/feedback'
import { Modal } from '@/components/ui/Modal'
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
  { status: 'Makeup', label: 'Makeup' },
]

interface MarkAttendanceSheetProps {
  scheduledClass: ScheduledClass | null
  open: boolean
  onClose: () => void
  onMarked?: (status: AttendanceStatus) => void
}

export function MarkAttendanceSheet({
  scheduledClass,
  open,
  onClose,
  onMarked,
}: MarkAttendanceSheetProps) {
  const upsertAttendance = useAppStore((s) => s.upsertAttendance)
  const settings = useAppStore((s) => s.settings)
  const [duration, setDuration] = useState(60)
  const [profMood, setProfMood] = useState<ProfMood | undefined>()
  const [showSparkle, setShowSparkle] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (scheduledClass) {
      setDuration(scheduledClass.durationMinutes)
      setProfMood(scheduledClass.entry?.profMood)
    }
  }, [scheduledClass])

  if (!scheduledClass) return null

  const handleMark = (status: AttendanceStatus) => {
    upsertAttendance(
      scheduledClass.componentId,
      scheduledClass.date,
      status,
      duration,
      profMood,
    )
    feedbackOnMark(status, settings)

    if (settings.animationsEnabled) {
      if (status === 'Present') {
        setShowSparkle(true)
        setTimeout(() => setShowSparkle(false), 800)
      }
      if (status === 'Absent') {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    }

    onMarked?.(status)
    setTimeout(onClose, status === 'Present' && settings.animationsEnabled ? 600 : 200)
  }

  return (
    <Modal open={open} onClose={onClose} title={scheduledClass.courseName}>
      <motion.div animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}} className="relative">
        {showSparkle && settings.animationsEnabled && <SparkleBurst />}
        <p className="font-mono-body text-xs text-[var(--color-text-muted)] mb-4 uppercase tracking-wide">
          {COMPONENT_TYPE_LABELS[scheduledClass.componentType]} · {scheduledClass.startTime} ·{' '}
          {scheduledClass.date}
        </p>

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

        {scheduledClass.isHoliday && !scheduledClass.entry && (
          <p className="font-mono-body text-xs text-[var(--color-text-muted)] mt-4 text-center uppercase">
            Institute holiday
            {scheduledClass.holidayLabel ? `: ${scheduledClass.holidayLabel}` : ''}
          </p>
        )}
      </motion.div>
    </Modal>
  )
}
