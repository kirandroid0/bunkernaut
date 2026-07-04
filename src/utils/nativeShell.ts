/** Native shell init — status bar, splash, and stale PWA cache cleanup on Android. */
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

async function clearStaleWebCaches(): Promise<void> {
  if (typeof window === 'undefined') return

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((r) => r.unregister()))
  }

  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
}

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  await clearStaleWebCaches()

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#EFF1ED' })
  } catch {
    // Status bar plugin may be unavailable on some devices
  }

  try {
    await SplashScreen.hide()
  } catch {
    // ignore
  }
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}
