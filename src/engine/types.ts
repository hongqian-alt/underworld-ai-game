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

// ——— M1 扩展字段（案件设计规范_v1 §四）———
// 引擎红线：rules.ts 不读这两个字段——点燃动作的解锁走 UI 层开关，不进引擎判定。
export interface Ignition {
  techId: string // 续弦胶/走魂/断链…
  symbolNote: string // 符号墙文案（陈序笔记体一行）
  unlockInNext: string // 下一案哪个环节用它（自检用，不入 UI）
  zeroFeed: 1 // 点燃喂归零轨（固定+1）
}

export interface PressureEvents {
  redline?: 1 | 2 | 3 // 本案触碰的红线（警戒度事件文案分支）
  costOn?: 'cuiyu' | 'tool' | 'permit' // 代价落点
  listShift?: number // 冷处理名单挪动（Q8 定显影强度；骨架已由过场公告承载，此为数据标注位）
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
  ignition?: Ignition // M0 案无此字段；M1 起每案必有
  pressureEvents?: PressureEvents
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
