export type BunkVerdict = 'bunk' | 'dont_bunk' | 'risky'

export type BunkUserAction =
  | 'followed_bunk'
  | 'followed_stay'
  | 'overridden_bunk'
  | 'overridden_stay'

export interface BunkDecision {
  id: string
  componentId: string
  courseId: string
  courseName: string
  componentType: import('./index').ComponentType
  classDate: string
  decidedAt: string
  appVerdict: BunkVerdict
  userAction: BunkUserAction
  pctBefore: number
  pctAfterProjected: number
  safeMissesBefore: number
}

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
