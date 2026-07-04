export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showAppNotification(title: string, body: string, tag?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      body,
      tag: tag ?? 'bunkernaut',
      icon: '/assets/pixel/app-icon.png',
    })
  } catch {
    // ignore — some browsers block without service worker
  }
}

export function scheduleInAppNotifications(
  enabled: boolean,
  onEod: () => void,
  onPreemptive: () => void,
) {
  if (!enabled) return () => {}

  const timers: ReturnType<typeof setTimeout>[] = []

  const scheduleForToday = () => {
    const now = new Date()
    const eod = new Date(now)
    eod.setHours(20, 0, 0, 0)
    if (eod > now) {
      timers.push(
        setTimeout(
          () => {
            onEod()
            showAppNotification(
              'Bunkernaut',
              'Did you forget to mark today\'s classes?',
              'eod-reminder',
            )
          },
          eod.getTime() - now.getTime(),
        ),
      )
    }

    const preempt = new Date(now)
    preempt.setHours(21, 0, 0, 0)
    if (preempt > now) {
      timers.push(
        setTimeout(
          () => {
            onPreemptive()
            showAppNotification(
              'Bunkernaut',
              'Heads up — a class tomorrow is close to the threshold.',
              'preempt-reminder',
            )
          },
          preempt.getTime() - now.getTime(),
        ),
      )
    }
  }

  scheduleForToday()

  return () => timers.forEach(clearTimeout)
}
