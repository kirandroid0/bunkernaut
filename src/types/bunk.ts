/** Bunk verdict and budget types. */
export type BunkVerdict = 'bunk' | 'dont_bunk' | 'risky'

export interface BunkBudgetLine {
  label: string
  safeMisses: number
  percentage: number
}

export interface SemesterBunkBudget {
  totalSafeMisses: number
  isUnlimited: boolean
  absencesThisMonth: number
  tightestLabel: string | null
  tightestSafeMisses: number
}

export interface BunkVerdictResult {
  verdict: BunkVerdict
  label: string
  pctBefore: number
  pctAfterProjected: number
  safeMissesBefore: number
  safeMissesAfter: number
}
