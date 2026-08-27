import { create } from 'zustand'
import type { CaseData } from '../engine/types'
import { PROLOGUE } from '../data/prologue'
import { CASE1 } from '../data/case1'
import { CASE2 } from '../data/case2'
import { CASE3 } from '../data/case3'

// 案件序列（执行文档任务2）：三案数据已挂入（任务3），全程流转已接通。
export const CASE_SLOTS: Array<{ id: string; label: string; data?: CaseData }> = [
  { id: 'prologue', label: '序幕 · 误捕复核', data: PROLOGUE },
  { id: 'case1', label: '第一案 · 三十七口箱子', data: CASE1 },
  { id: 'case2', label: '第二案 · 同名同姓', data: CASE2 },
  { id: 'case3', label: '第三案 · 一间房两个人半箱竹简', data: CASE3 },
]

interface SessionStore {
  index: number
  // 跨案累计的空壳计数（每案改判+1，尾声钩子读取）
  totalHollow: number
  finishedCases: number
  finishSession: (hollowGained: number) => void
}

export const useSessionStore = create<SessionStore>()((set) => ({
  index: 0,
  totalHollow: 0,
  finishedCases: 0,
  finishSession: (hollowGained) =>
    set((s) => ({
      index: s.index + 1,
      totalHollow: s.totalHollow + hollowGained,
      finishedCases: s.finishedCases + 1,
    })),
}))
