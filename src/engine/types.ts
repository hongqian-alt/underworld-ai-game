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

// ——— M2 燃料经济层扩展（燃料经济层设计_v0.1 §四）———
// 引擎红线：rules.ts 不读 fuel 字段——性质转换是结案级 UI/store 层选择，不进判定链。
// 不可降格条款 2 的执行：warmFuel 的每一笔都要能指出对应的周渡源温暖证据（阳间活人参与）。
export interface FuelConfig {
  warmEvidence: string[] // 温暖证据陈述 id（周渡源 greytrace——阳间思念抄录在案）；全部取证后性质转换归档才可用
  conversionLine?: string // 性质转换结案语（结案结算屏燃料行文案）
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
  fuel?: FuelConfig // M2 起燃料层案件（案 7 教学场）——引擎不读，结案级二选一走 UI 层
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
