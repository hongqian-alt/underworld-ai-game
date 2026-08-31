import type { CaseData, GameState, Pair, SourceType } from './types'

export const COST = { fetch: 2, dive: 4, verify: 2, amend: 3, dismiss: 1, ask: 1 } as const

export const SOURCE_COST: Record<SourceType, number> = {
  document: COST.fetch,
  poread: COST.dive,
  greytrace: COST.verify,
}

export const SOURCE_ACTION: Record<SourceType, string> = {
  document: '调卷',
  poread: '魄读深潜',
  greytrace: '勘验灰迹',
}

const VIGILANCE_MAX = 100
export const VIGILANCE_WRONG = 10

export function initState(c: CaseData): GameState {
  return {
    caseId: c.id,
    day: 1,
    actionsToday: 0,
    ap: c.ap,
    vigilance: 10,
    reputation: 0,
    hollowCount: 0,
    revealed: c.statements.filter((s) => !s.hidden).map((s) => s.id),
    foundPairs: [],
    resolvedPairs: [],
    accusedWrong: 0,
    cuiyuAsked: 0,
    log: [`【受理】${c.title}`],
    phase: 'investigating',
  }
}

function clone(s: GameState): GameState {
  return { ...s, revealed: [...s.revealed], foundPairs: [...s.foundPairs], resolvedPairs: [...s.resolvedPairs], log: [...s.log] }
}

function spend(state: GameState, c: CaseData, cost: number): GameState | null {
  if (state.phase !== 'investigating') return null
  if (state.ap < cost) return null
  const next = clone(state)
  next.ap -= cost
  next.actionsToday += 1
  if (next.actionsToday >= c.actionsPerDay) {
    next.actionsToday = 0
    next.day += 1
    if (next.day > c.days && next.phase === 'investigating') {
      next.phase = 'resolved'
      next.ending = 'downgraded'
      next.log.push('【作七已尽】案卷超期，降级结算。')
    }
  }
  return next
}

export function reveal(state: GameState, c: CaseData, stmtId: string): { state: GameState; msg: string } {
  const stmt = c.statements.find((s) => s.id === stmtId)
  if (!stmt || !stmt.hidden || state.revealed.includes(stmtId)) return { state, msg: '该记录已在案卷堆中。' }
  const cost = SOURCE_COST[stmt.source]
  if (state.ap < cost) return { state, msg: `魂力不足，无法执行「${SOURCE_ACTION[stmt.source]}」。` }
  const next = spend(state, c, cost)
  if (!next) return { state, msg: '本案已结，无法再行动。' }
  next.revealed.push(stmtId)
  next.log.push(`【${SOURCE_ACTION[stmt.source]} -${cost}】取得：${stmt.label}`)
  return { state: next, msg: `取得「${stmt.label}」。` }
}

export function findPair(c: CaseData, a: string, b: string): Pair | undefined {
  return c.pairs.find(
    (p) => (p.a === a && p.b === b) || (p.a === b && p.b === a),
  )
}

export function accuse(state: GameState, c: CaseData, a: string, b: string): { state: GameState; correct: boolean; msg: string } {
  if (state.phase !== 'investigating') return { state, correct: false, msg: '本案已结。' }
  if (!state.revealed.includes(a) || !state.revealed.includes(b)) return { state, correct: false, msg: '所选陈述尚未入卷。' }
  const pair = findPair(c, a, b)
  if (pair && pair.kind !== 'fact_update' && !state.foundPairs.includes(pair.id)) {
    const next = clone(state)
    next.foundPairs.push(pair.id)
    next.log.push('【指错】两源互斥成立，矛盾入卷。')
    return { state: next, correct: true, msg: '指错成立：两处记录互斥。' }
  }
  const next = clone(state)
  next.vigilance = Math.min(VIGILANCE_MAX, next.vigilance + VIGILANCE_WRONG)
  next.accusedWrong += 1
  if (pair && pair.kind === 'fact_update') {
    next.log.push('【指错·误】两说各有所本，只是时间错位——系统记下了一次妄指。（警戒度+10）')
    return { state: next, correct: false, msg: '这不是矛盾：两边都对，只是时间错位。（警戒度+10）' }
  }
  next.log.push('【指错·误】两处陈述并不互斥。（警戒度+10）')
  // 黑盒报告问题3：失败反馈带错因，与 fact_update 分支粒度一致
  return { state: next, correct: false, msg: '指错不成立：两处陈述并不互斥。（警戒度+10）' }
}

export function isAmendable(_c: CaseData, state: GameState, pair: Pair): boolean {
  if (pair.kind === 'system_tamper') return true
  if (pair.kind === 'memory_bias') return !!pair.resolver && state.revealed.includes(pair.resolver)
  return false
}

export function amend(state: GameState, c: CaseData, pairId: string): { state: GameState; ok: boolean; msg: string } {
  if (state.phase !== 'investigating') return { state, ok: false, msg: '本案已结。' }
  const pair = c.pairs.find((p) => p.id === pairId)
  if (!pair || !state.foundPairs.includes(pairId)) return { state, ok: false, msg: '请先指出矛盾，再谈改判。' }
  if (pair.kind === 'fact_update') return { state, ok: false, msg: '此差异不构成冤情，无从改判。' }
  if (!isAmendable(c, state, pair)) return { state, ok: false, msg: '证据链不完整：记忆会被执念泡过，先找第三条能钉住事实的记录。' }
  if (state.ap < COST.amend) return { state, ok: false, msg: `魂力不足，改判需 ${COST.amend} 点。` }
  let next = spend(state, c, COST.amend)!
  next.hollowCount += 1
  next.resolvedPairs.push(pairId)
  next.reputation += 2
  next.vigilance = Math.max(0, next.vigilance - 15)
  next.log.push(`【改判 -${COST.amend}】记录修正，声望+2。（警戒度-15）`)
  const amendables = c.pairs.filter((p) => p.kind !== 'fact_update').map((p) => p.id)
  if (amendables.every((id) => next.resolvedPairs.includes(id))) {
    next.phase = 'resolved'
    next.ending = 'downgraded' === next.ending ? 'downgraded' : 'full'
    next.log.push('【结案】全案修正完毕。')
  }
  return { state: next, ok: true, msg: '改判完成，记录已修正。' }
}

export function dismiss(state: GameState, c: CaseData, pairId: string): { state: GameState; ok: boolean; msg: string } {
  if (state.phase !== 'investigating') return { state, ok: false, msg: '本案已结。' }
  const pair = c.pairs.find((p) => p.id === pairId)
  if (!pair || !state.foundPairs.includes(pairId)) return { state, ok: false, msg: '无矛盾可驳。' }
  if (state.ap < COST.dismiss) return { state, ok: false, msg: `魂力不足，驳回需 ${COST.dismiss} 点。` }
  let next = spend(state, c, COST.dismiss)!
  next.resolvedPairs.push(pairId)
  next.log.push('【驳回 -1】矛盾存档不究，执念滞留。')
  const amendables = c.pairs.filter((p) => p.kind !== 'fact_update').map((p) => p.id)
  if (amendables.every((id) => next.resolvedPairs.includes(id))) {
    next.phase = 'resolved'
    next.ending = next.ending ?? 'full'
    next.log.push('【结案】（有矛盾被驳回，未全部改判）')
  }
  return { state: next, ok: true, msg: '已驳回。' }
}

export function suspendDay(state: GameState, c: CaseData): GameState {
  if (state.phase !== 'investigating') return state
  const next = clone(state)
  next.day += 1
  next.actionsToday = 0
  if (next.day > c.days) {
    next.phase = 'resolved'
    next.ending = 'downgraded'
    next.log.push('【作七已尽】案卷超期，降级结算。')
  } else {
    next.log.push(`【挂起】退回队列，第 ${next.day} 日。`)
  }
  return next
}

export function askCuiyu(state: GameState, c: CaseData): { state: GameState; hint?: string; msg: string } {
  if (state.cuiyuAsked >= 2) return { state, msg: '崔钰今日不再见你。' }
  if (state.ap < COST.ask) return { state, hint: undefined, msg: `魂力不足，质询需 ${COST.ask} 点。` }
  const next = spend(state, c, COST.ask)!
  next.cuiyuAsked += 1
  const progress = next.foundPairs.length + Math.min(next.accusedWrong, 1)
  // 黑盒报告问题4：质询池剔除开局批注（trigger='start' 开局已展示），
  // 保证每次质询相对开局批注都有增量；progress 推进时给下一层提示。
  const pool = c.hints.filter((h) => h.trigger !== 'start')
  const list = pool.length > 0 ? pool : c.hints
  const hint = list[Math.min(progress, list.length - 1)]
  next.log.push(`【质询崔钰 -${COST.ask}】"${hint.text}"`)
  return { state: next, hint: hint.text, msg: '崔钰压低了声音。' }
}
