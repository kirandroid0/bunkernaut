/** Haptic and sound feedback when marking attendance. */
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export function playMarkSound(type: 'present' | 'absent') {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  if (type === 'present') {
    osc.frequency.setValueAtTime(523, ctx.currentTime)
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } else {
    osc.frequency.setValueAtTime(330, ctx.currentTime)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  }
}

export function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export function feedbackOnMark(
  status: import('@/types').AttendanceStatus,
  settings: { soundsEnabled: boolean; hapticsEnabled: boolean },
) {
  if (settings.hapticsEnabled) triggerHaptic()
  if (!settings.soundsEnabled) return
  if (status === 'Present') playMarkSound('present')
  if (status === 'Absent') playMarkSound('absent')
}
