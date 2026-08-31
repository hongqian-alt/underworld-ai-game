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

// ——— localStorage 自动存档（任务5）———
// 只存会话层 store 全量（index/totalHollow/finishedCases）；案内进度不存，
// 刷新后回到当前案开头（执行文档任务5规格口径）。
const SAVE_KEY = 'm0_session_save'
const SCHEMA_VERSION = 1

interface SaveData {
  version: number
  index: number
  totalHollow: number
  finishedCases: number
}

// 迁移链：存档结构升级时在此登记"版本 n → n+1"的转换函数，loadSave 自动逐级执行。
// 例：升级 v2 时加 `2: (s) => ({ ...s, 新字段: 默认值 })`。
const MIGRATIONS: Record<number, (s: SaveData) => SaveData> = {}

// 读档：无档/损坏/版本不识别一律按新档处理（静默弃用，不阻断游玩）。
// localStorage 是外部边界，字段做类型与范围校验后才采信。
function loadSave(): { index: number; totalHollow: number; finishedCases: number } | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    let data = JSON.parse(raw) as SaveData
    let v = data.version
    if (typeof v !== 'number' || v > SCHEMA_VERSION) return null
    while (v < SCHEMA_VERSION) {
      const step = MIGRATIONS[v]
      if (!step) return null
      data = step(data)
      v += 1
    }
    const { index, totalHollow, finishedCases } = data
    const ok =
      Number.isInteger(index) &&
      index >= 0 &&
      index <= CASE_SLOTS.length &&
      Number.isInteger(totalHollow) &&
      totalHollow >= 0 &&
      Number.isInteger(finishedCases) &&
      finishedCases >= 0
    return ok ? { index, totalHollow, finishedCases } : null
  } catch {
    return null
  }
}

const saved = loadSave()

export const useSessionStore = create<SessionStore>()((set) => ({
  index: saved?.index ?? 0,
  totalHollow: saved?.totalHollow ?? 0,
  finishedCases: saved?.finishedCases ?? 0,
  finishSession: (hollowGained) =>
    set((s) => ({
      index: s.index + 1,
      totalHollow: s.totalHollow + hollowGained,
      finishedCases: s.finishedCases + 1,
    })),
}))

// 状态一变即自动写档（写档失败静默跳过：隐私模式/配额满不影响游玩）
useSessionStore.subscribe((s) => {
  try {
    if (typeof localStorage === 'undefined') return
    const data: SaveData = {
      version: SCHEMA_VERSION,
      index: s.index,
      totalHollow: s.totalHollow,
      finishedCases: s.finishedCases,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    /* 存储不可用时跳过 */
  }
})
