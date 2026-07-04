import { formatSafeMisses } from '@/utils/bunk'

/** User-facing label — use instead of "skips" */
export const BUNKS_AVAILABLE = 'BUNKS AVAILABLE'

export function formatBunksAvailable(n: number): string {
  return formatSafeMisses(n)
}
