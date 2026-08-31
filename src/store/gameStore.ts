import { create } from 'zustand'
import { PROLOGUE } from '../data/prologue'
import * as rules from '../engine/rules'
import type { CaseData, GameState } from '../engine/types'
import { playBrushOk, playInkDull } from '../audio/sound'

// 行为日志条目：who='user' 为玩家动作（点了什么按钮），who='sys' 为引擎结果
export interface LogEntry {
  who: 'user' | 'sys'
  text: string
}

const MAX_ENTRIES = 200

interface GameStore {
  caseData: CaseData
  state: GameState
  msg: string
  hint: string
  entries: LogEntry[]
  startCase: (c: CaseData) => void
  reveal: (stmtId: string) => void
  accuse: (a: string, b: string) => void
  amend: (pairId: string) => void
  dismiss: (pairId: string) => void
  suspendDay: () => void
  askCuiyu: () => void
}

// 本 store 只做"转发 + 记录"，所有规则判定都在 rules.ts，UI 不写任何游戏逻辑。
const stmtLabel = (c: CaseData, id: string) => c.statements.find((s) => s.id === id)?.label ?? id

// 追加一对日志：user 动作 + 引擎新增的 sys 行（无新增时用反馈 msg 兜底，捕获被拒的操作）
function pushEntries(
  entries: LogEntry[],
  user: string,
  prevLen: number,
  next: GameState,
  msg: string,
): LogEntry[] {
  const sys: LogEntry[] = next.log.slice(prevLen).map((text) => ({ who: 'sys', text }))
  const out: LogEntry[] = [...entries, { who: 'user', text: user }, ...sys]
  if (sys.length === 0 && msg) out.push({ who: 'sys', text: msg })
  return out.slice(-MAX_ENTRIES)
}

const initial = rules.initState(PROLOGUE)

export const useGameStore = create<GameStore>()((set, get) => ({
  caseData: PROLOGUE,
  state: initial,
  msg: '',
  hint: '',
  entries: [{ who: 'sys', text: initial.log[0] }],

  startCase: (c) => {
    const s = rules.initState(c)
    set({ caseData: c, state: s, msg: '', hint: '', entries: [{ who: 'sys', text: s.log[0] }] })
  },

  reveal: (stmtId) => {
    const { caseData, state, entries } = get()
    const st = caseData.statements.find((s) => s.id === stmtId)
    const user = st
      ? `执行「${rules.SOURCE_ACTION[st.source]}」取得「${st.label}」`
      : `尝试揭示未知陈述 ${stmtId}`
    const prevLen = state.log.length
    const r = rules.reveal(state, caseData, stmtId)
    set({ state: r.state, msg: r.msg, entries: pushEntries(entries, user, prevLen, r.state, r.msg) })
  },

  accuse: (a, b) => {
    const { caseData, state, entries } = get()
    const user = `提交指错：「${stmtLabel(caseData, a)}」+「${stmtLabel(caseData, b)}」`
    const prevLen = state.log.length
    const r = rules.accuse(state, caseData, a, b)
    if (!r.correct) playInkDull()
    set({ state: r.state, msg: r.msg, entries: pushEntries(entries, user, prevLen, r.state, r.msg) })
  },

  amend: (pairId) => {
    const { caseData, state, entries } = get()
    const pair = caseData.pairs.find((p) => p.id === pairId)
    const user = pair
      ? `处理矛盾（「${stmtLabel(caseData, pair.a)}」⇄「${stmtLabel(caseData, pair.b)}」）→ 改判`
      : `处理未知矛盾 ${pairId} → 改判`
    const prevLen = state.log.length
    const r = rules.amend(state, caseData, pairId)
    if (r.ok) playBrushOk()
    set({ state: r.state, msg: r.msg, entries: pushEntries(entries, user, prevLen, r.state, r.msg) })
  },

  dismiss: (pairId) => {
    const { caseData, state, entries } = get()
    const pair = caseData.pairs.find((p) => p.id === pairId)
    const user = pair
      ? `处理矛盾（「${stmtLabel(caseData, pair.a)}」⇄「${stmtLabel(caseData, pair.b)}」）→ 驳回`
      : `处理未知矛盾 ${pairId} → 驳回`
    const prevLen = state.log.length
    const r = rules.dismiss(state, caseData, pairId)
    set({ state: r.state, msg: r.msg, entries: pushEntries(entries, user, prevLen, r.state, r.msg) })
  },

  suspendDay: () => {
    const { caseData, state, entries } = get()
    const user = '挂起本案一日'
    const prevLen = state.log.length
    const next = rules.suspendDay(state, caseData)
    set({ state: next, entries: pushEntries(entries, user, prevLen, next, '') })
  },

  askCuiyu: () => {
    const { caseData, state, entries, hint: prevHint } = get()
    const user = '质询崔钰'
    const prevLen = state.log.length
    const r = rules.askCuiyu(state, caseData)
    // 黑盒报告问题4：进展不变时重复质询给同一句——明确告知"无新增"，玩家不再白花魂力
    const repeat = r.hint !== undefined && r.hint === prevHint
    const msg = repeat ? '崔钰还是上次那句话——没有新的。' : r.msg
    if (r.hint !== undefined) {
      set({ state: r.state, hint: r.hint, msg, entries: pushEntries(entries, user, prevLen, r.state, msg) })
    } else {
      set({ state: r.state, msg, entries: pushEntries(entries, user, prevLen, r.state, msg) })
    }
  },
}))
