/** Pixel art asset paths and format fallback chains for the PWA. */
import type { AttendanceStatus, MascotMood } from '@/types'

const BASE = '/assets/pixel'

export const PIXEL_ASSETS = {
  mascot: {
    sparkly: `${BASE}/mascot-sparkly`,
    happy: `${BASE}/mascot-happy`,
    nervous: `${BASE}/mascot-nervous`,
    sleepy: `${BASE}/mascot-sleepy`,
  } satisfies Record<MascotMood, string>,

  mascotFallback: `${BASE}/mascot.png`,

  nav: {
    home: `${BASE}/nav-home`,
    today: `${BASE}/nav-today`,
    courses: `${BASE}/nav-courses`,
    stats: `${BASE}/nav-stats`,
    settings: `${BASE}/nav-settings`,
  },

  status: {
    Present: `${BASE}/status-present`,
    Absent: `${BASE}/status-absent`,
    Cancelled: `${BASE}/status-cancelled`,
    Holiday: `${BASE}/status-holiday`,
    Makeup: `${BASE}/status-makeup`,
  } satisfies Record<AttendanceStatus, string>,

  empty: {
    courses: `${BASE}/empty-courses`,
    today: `${BASE}/empty-today`,
    stats: `${BASE}/empty-stats`,
  },

  brand: {
    appIcon: `${BASE}/app-icon.png`,
  },

  theme: {
    sun: `${BASE}/icon-sun`,
    moon: `${BASE}/icon-moon`,
  },

  fx: {
    sparkle: [`${BASE}/fx-sparkle-1`, `${BASE}/fx-sparkle-2`, `${BASE}/fx-sparkle-3`],
  },
} as const

export function assetCandidates(basePath: string): string[] {
  const base = basePath.replace(/\.(png|gif|svg)$/i, '')
  // User-drawn assets first (.gif / .png), SVG placeholders last
  return [`${base}.gif`, `${base}.png`, `${base}.svg`]
}

export function mascotCandidates(mood: MascotMood): string[] {
  const base = PIXEL_ASSETS.mascot[mood].replace(/\.(png|gif|svg)$/i, '')
  return [`${base}.gif`, `${base}.png`, PIXEL_ASSETS.mascotFallback]
}

export type NavIconKey = keyof typeof PIXEL_ASSETS.nav

export const MASCOT_PLACEHOLDER_LABELS: Record<MascotMood, string> = {
  sparkly: '*',
  happy: ':)',
  nervous: ':/',
  sleepy: 'zZ',
}

export const NAV_PLACEHOLDER_LABELS: Record<NavIconKey, string> = {
  home: 'H',
  today: 'T',
  courses: 'C',
  stats: 'S',
  settings: 'G',
}

export const STATUS_PLACEHOLDER_LABELS: Record<AttendanceStatus, string> = {
  Present: 'P',
  Absent: 'A',
  Cancelled: 'X',
  Holiday: 'H',
  Makeup: 'M',
}
