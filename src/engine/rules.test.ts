import { describe, expect, it } from 'vitest'
import { accuse, amend, askCuiyu, dismiss, initState, reveal, suspendDay } from './rules'
import type { CaseData } from './types'

const CASE: CaseData = {
  id: 't',
  title: '测试案',
  brief: '',
  epilogue: '',
  ap: 12,
  days: 7,
  actionsPerDay: 4,
  statements: [
    { id: 'doc1', source: 'document', label: '判文', text: '' },
    { id: 'grey1', source: 'greytrace', label: '坟砖', text: '' },
    { id: 'po1', source: 'poread', label: '口述一', text: '', hidden: true },
    { id: 'po2', source: 'poread', label: '口述二', text: '', hidden: true },
    { id: 'grey2', source: 'greytrace', label: '水志', text: '', hidden: true },
  ],
  pairs: [
    { id: 'p_tamper', a: 'doc1', b: 'grey1', kind: 'system_tamper' },
    { id: 'p_bias', a: 'doc1', b: 'po1', kind: 'memory_bias', resolver: 'po2' },
    { id: 'p_decoy', a: 'po2', b: 'grey1', kind: 'fact_update' },
  ],
  hints: [{ trigger: 'default', text: '先看明处的两份。' }],
}

describe('initState', () => {
  it('只揭示非隐藏陈述，初始警戒度10', () => {
    const s = initState(CASE)
    expect(s.revealed).toEqual(['doc1', 'grey1'])
    expect(s.vigilance).toBe(10)
    expect(s.ap).toBe(12)
  })
})

describe('reveal', () => {
  it('按来源扣魂力：调卷2/勘验2/深潜4', () => {
    let s = initState(CASE)
    s = reveal(s, CASE, 'grey2').state
    expect(s.ap).toBe(10)
    s = reveal(s, CASE, 'po1').state
    expect(s.ap).toBe(6)
  })
  it('魂力不足时拒绝', () => {
    const s = initState(CASE)
    s.ap = 1
    const r = reveal(s, CASE, 'po1')
    expect(r.state.ap).toBe(1)
    expect(r.msg).toContain('魂力不足')
  })
})

describe('accuse', () => {
  it('正确的篡改指错：入卷且不加警戒度', () => {
    const s = initState(CASE)
    const r = accuse(s, CASE, 'doc1', 'grey1')
    expect(r.correct).toBe(true)
    expect(r.state.foundPairs).toEqual(['p_tamper'])
    expect(r.state.vigilance).toBe(10)
  })
  it('事实更新型误指：警戒度+10', () => {
    let s = initState(CASE)
    s = reveal(s, CASE, 'po1').state
    s = reveal(s, CASE, 'po2').state
    const r = accuse(s, CASE, 'po2', 'grey1')
    expect(r.correct).toBe(false)
    expect(r.state.vigilance).toBe(20)
    expect(r.msg).toContain('时间错位')
  })
  it('无关联指错：警戒度+10', () => {
    const s = initState(CASE)
    const r = accuse(s, CASE, 'grey1', 'grey1')
    expect(r.correct).toBe(false)
    expect(r.state.vigilance).toBe(20)
  })
})

describe('amend', () => {
  it('记忆偏差对在补链前禁止改判', () => {
    let s = initState(CASE)
    s = reveal(s, CASE, 'po1').state
    s = accuse(s, CASE, 'doc1', 'po1').state
    const r = amend(s, CASE, 'p_bias')
    expect(r.ok).toBe(false)
    expect(r.msg).toContain('证据链不完整')
  })
  it('补链后允许改判；改判+空壳计数、声望、警戒度回落', () => {
    let s = initState(CASE)
    s = reveal(s, CASE, 'po1').state
    s = reveal(s, CASE, 'po2').state
    s = accuse(s, CASE, 'doc1', 'po1').state
    s.vigilance = 40
    const r = amend(s, CASE, 'p_bias')
    expect(r.ok).toBe(true)
    expect(r.state.hollowCount).toBe(1)
    expect(r.state.reputation).toBe(2)
    expect(r.state.vigilance).toBe(25)
  })
  it('全部可改判矛盾解决后结案（full）', () => {
    // 深潜×2 + 改判×2 共需 AP 14，初始 12 不够，单独给本案放宽
    const c = { ...CASE, ap: 20 }
    let s = initState(c)
    s = accuse(s, c, 'doc1', 'grey1').state
    s = reveal(s, c, 'po1').state
    s = reveal(s, c, 'po2').state
    s = accuse(s, c, 'doc1', 'po1').state
    s = amend(s, c, 'p_tamper').state
    s = amend(s, c, 'p_bias').state
    expect(s.phase).toBe('resolved')
    expect(s.ending).toBe('full')
  })
})

describe('dismiss 与挂起', () => {
  it('驳回已发现的矛盾并计入resolved', () => {
    let s = initState(CASE)
    s = accuse(s, CASE, 'doc1', 'grey1').state
    const r = dismiss(s, CASE, 'p_tamper')
    expect(r.ok).toBe(true)
    expect(r.state.resolvedPairs).toContain('p_tamper')
    expect(r.state.hollowCount).toBe(0)
  })
  it('作七超期强制降级结算', () => {
    let s = initState(CASE)
    for (let i = 0; i < 7; i++) s = suspendDay(s, CASE)
    expect(s.phase).toBe('resolved')
    expect(s.ending).toBe('downgraded')
  })
})

describe('时钟与每日动作上限', () => {
  it('每日第4个消耗性动作后进入下一日', () => {
    let s = initState(CASE)
    s = reveal(s, CASE, 'grey2').state
    s = reveal(s, CASE, 'po1').state
    s = reveal(s, CASE, 'po2').state
    s = askCuiyu(s, CASE).state
    expect(s.day).toBe(2)
    expect(s.actionsToday).toBe(0)
  })
})

describe('质询崔钰', () => {
  it('每案限两次', () => {
    const c = { ...CASE, ap: 99 }
    let s = initState(c)
    s = askCuiyu(s, c).state
    s = askCuiyu(s, c).state
    const r3 = askCuiyu(s, c)
    expect(r3.msg).toContain('不再见你')
    expect(r3.state.cuiyuAsked).toBe(2)
  })

  // 黑盒报告问题4：质询不重复开局批注（trigger='start'），首次质询即有增量
  it('质询池剔除开局批注，进展推进换下一层提示', () => {
    const c: CaseData = {
      ...CASE,
      ap: 99,
      hints: [
        { trigger: 'start', text: '开局批注' },
        { trigger: 'found1', text: '第一条线索' },
        { trigger: 'found2', text: '第二条线索' },
      ],
    }
    const s0 = initState(c)
    const r1 = askCuiyu(s0, c)
    expect(r1.hint).toBe('第一条线索')
    // 错一次指错推进质询深度
    const s1 = accuse(s0, c, 'grey1', 'grey1').state
    const r2 = askCuiyu(s1, c)
    expect(r2.hint).toBe('第二条线索')
  })
})

// 黑盒报告问题3：失败反馈粒度一致——普通失败也说明错因
describe('指错失败反馈粒度', () => {
  it('无关联指错的反馈带错因与惩罚', () => {
    const s = initState(CASE)
    const r = accuse(s, CASE, 'grey1', 'grey1')
    expect(r.msg).toContain('并不互斥')
    expect(r.msg).toContain('警戒度+10')
  })
})
