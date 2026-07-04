import type { ComponentType, MascotMood } from '@/types'
import { COMPONENT_TYPE_LABELS } from '@/types'
import { formatSafeMisses } from '@/utils/bunk'

export const BUNKS_AVAILABLE = 'BUNKS AVAILABLE'
export const BELOW_THRESHOLD_MESSAGE = 'Contact your professor.'

export const MASCOT_MOOD_LABELS: Record<MascotMood, string> = {
  sparkly: 'Sparkly — crushing it',
  happy: 'Happy — safe margin',
  nervous: 'Nervous — close to threshold',
  sleepy: 'Dead — below threshold',
}

/** L/T/P row: "L · 89% · 1 abs" — no course code (shown once on card). */
export function formatLtpChip(type: ComponentType, percentage: number, missed: number): string {
  const label = COMPONENT_TYPE_LABELS[type]
  const abs = missed === 1 ? '1 abs' : `${missed} abs`
  return `${label} · ${percentage}% · ${abs}`
}

/** @deprecated use formatLtpChip — course code belongs on card header only */
export function formatComponentChip(
  _courseCode: string,
  type: ComponentType,
  percentage: number,
  missed?: number,
): string {
  if (missed !== undefined) return formatLtpChip(type, percentage, missed)
  return `${COMPONENT_TYPE_LABELS[type]} · ${percentage}%`
}

export function formatBunksAvailable(n: number): string {
  return formatSafeMisses(n)
}

/** Course-level bunk line — no recovery counts. */
export function formatBunkStatusLine(stats: {
  percentage: number
  safeMisses: number
  threshold: number
}): string {
  if (stats.safeMisses === Infinity || stats.safeMisses > 99) {
    return 'No marks yet'
  }
  if (stats.percentage < stats.threshold) {
    return BELOW_THRESHOLD_MESSAGE
  }
  if (stats.safeMisses > 0) {
    return `${formatBunksAvailable(stats.safeMisses)} ${BUNKS_AVAILABLE}`
  }
  return `0 ${BUNKS_AVAILABLE}`
}
