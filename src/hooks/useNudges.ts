import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getActiveNudges } from '@/utils/nudges'
import { scheduleInAppNotifications } from '@/utils/notifications'

export function useNudges() {
  const semester = useAppStore((s) => s.getActiveSemester())
  const settings = useAppStore((s) => s.settings)
  const dismissNudge = useAppStore((s) => s.dismissNudge)
  const markEodNudgeShown = useAppStore((s) => s.markEodNudgeShown)
  const markPreemptiveNudgeShown = useAppStore((s) => s.markPreemptiveNudgeShown)

  const nudges = useMemo(
    () =>
      getActiveNudges(semester, {
        dismissedNudgeIds: settings.dismissedNudgeIds,
        lastEodNudgeDate: settings.lastEodNudgeDate,
        lastPreemptiveNudgeDate: settings.lastPreemptiveNudgeDate,
      }),
    [semester, settings],
  )

  useEffect(() => {
    if (!settings.notificationsEnabled) return

    return scheduleInAppNotifications(
      settings.notificationsEnabled,
      markEodNudgeShown,
      markPreemptiveNudgeShown,
    )
  }, [settings.notificationsEnabled, markEodNudgeShown, markPreemptiveNudgeShown])

  const dismiss = (id: string, type: 'eod_unmarked' | 'tomorrow_threshold') => {
    dismissNudge(id)
    if (type === 'eod_unmarked') markEodNudgeShown()
    if (type === 'tomorrow_threshold') markPreemptiveNudgeShown()
  }

  return { nudges, dismiss }
}
