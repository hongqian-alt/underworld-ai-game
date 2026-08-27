export type SourceType = 'poread' | 'greytrace' | 'document'

export interface Statement {
  id: string
  source: SourceType
  label: string
  text: string
  hidden?: boolean
}

export type InconsistencyKind = 'system_tamper' | 'memory_bias' | 'fact_update'

export interface Pair {
  id: string
  a: string
  b: string
  kind: InconsistencyKind
  resolver?: string
}

export interface Hint {
  trigger: string
  text: string
}

export interface CaseData {
  id: string
  title: string
  brief: string
  epilogue: string
  statements: Statement[]
  pairs: Pair[]
  hints: Hint[]
  ap: number
  days: number
  actionsPerDay: number
}

export type Ending = 'full' | 'downgraded'

export interface GameState {
  caseId: string
  day: number
  actionsToday: number
  ap: number
  vigilance: number
  reputation: number
  hollowCount: number
  revealed: string[]
  foundPairs: string[]
  resolvedPairs: string[]
  accusedWrong: number
  cuiyuAsked: number
  log: string[]
  phase: 'investigating' | 'resolved'
  ending?: Ending
}
