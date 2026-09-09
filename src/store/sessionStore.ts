import { create } from 'zustand'
import type { CaseData } from '../engine/types'
import { playSealCase } from '../audio/sound'
import { PROLOGUE } from '../data/prologue'
import { CASE1 } from '../data/case1'
import { CASE2 } from '../data/case2'
import { CASE3 } from '../data/case3'
import { CASE4, CASE5, CASE6 } from '../data/m1_cases'
import { CASE7, CASE8, CASE9 } from '../data/m2_cases'
import { INTERLUDES, type ScreenData } from '../data/interludes'

// ——— 全幕流程表（骨架任务：游戏全貌骨架）———
// 案件（kind='case'，走现有引擎与调查 UI）与文本屏（kind='screen'，走 TextScreen）交替排布；
// Epilogue（含邮箱提交/90 秒时序等终局性逻辑）挂全游戏结尾（骨架规格：按组件内部逻辑决定挂载位）。
export type FlowItem =
  | { kind: 'case'; id: string; label: string; data: CaseData }
  | { kind: 'screen'; id: string; label: string; screen: ScreenData }
  | { kind: 'epilogue'; id: string; label: string }

const caseItem = (label: string, data: CaseData): FlowItem => ({ kind: 'case', id: data.id, label, data })
const screenItem = (screen: ScreenData): FlowItem => ({ kind: 'screen', id: screen.id, label: '过场', screen })

export const FLOW: FlowItem[] = [
  // ——— M0：序幕＋三案（原案件序列原样保留，案间插入过场三行屏）———
  caseItem('序幕 · 误捕复核', PROLOGUE),
  screenItem(INTERLUDES.after_prologue),
  caseItem('第一案 · 三十七口箱子', CASE1),
  screenItem(INTERLUDES.after_case1),
  caseItem('第二案 · 同名同姓', CASE2),
  screenItem(INTERLUDES.after_case2),
  caseItem('第三案 · 一间房两个人半箱竹简', CASE3),
  screenItem(INTERLUDES.after_case3), // M1 开场过场（铜牌授职）
  // ——— M1 三案：小鬼诞生（案4 后）＋三点燃屏（结案结算后、案间过场前）———
  caseItem('第四案 · 临时处的石匠', CASE4),
  screenItem(INTERLUDES.ghost_birth),
  screenItem(INTERLUDES.ignite_1),
  screenItem(INTERLUDES.after_laochen),
  caseItem('第五案 · 走魂', CASE5),
  screenItem(INTERLUDES.ignite_2),
  screenItem(INTERLUDES.after_zouhun),
  caseItem('第六案 · 二十年的一个签名', CASE6),
  screenItem(INTERLUDES.ignite_3),
  screenItem(INTERLUDES.after_qianming),
  // ——— M1 末：假胜利＋双爆（暂缓名单初显，⑤号反转初显）———
  screenItem(INTERLUDES.m1_victory),
  screenItem(INTERLUDES.m1_double),
  // ——— M2：系统摊牌（开场事件：对照表卷宗→黑屏一行字）→ 三案（每案结案→点燃屏→过场）→ ④号反转 → 问名收束 → 归零显影 ———
  screenItem(INTERLUDES.m2_showdown),
  screenItem(INTERLUDES.m2_showdown_black),
  caseItem('第七案 · 回饱', CASE7),
  screenItem(INTERLUDES.ignite_4), // 点燃：回饱（＋燃料效率表补全——摊牌论据的反杀）
  screenItem(INTERLUDES.after_huibao),
  caseItem('第八案 · 藏茶', CASE8),
  screenItem(INTERLUDES.ignite_5), // 点燃：藏茶（检测注入）
  screenItem(INTERLUDES.blood_affair), // 血食风波（事件带过场）
  screenItem(INTERLUDES.ghost_says), // ④号反转（小鬼说系统话）
  caseItem('第九案 · 问名', CASE9),
  screenItem(INTERLUDES.ignite_6), // 点燃：问名（定向检索）
  screenItem(INTERLUDES.m2_zero), // 归零轨显影（动态 stats："两台机器"并屏时刻——M2 终点状态）
  // ——— M3：事件带（③⑥/猎杀/盟友）→ ⑤号全揭 → 终局三幕（最后一餐/收束/结算）→ 口号 → Epilogue ———
  screenItem(INTERLUDES.m3_open),
  screenItem(INTERLUDES.m3_hunt),
  screenItem(INTERLUDES.m3_allies),
  screenItem(INTERLUDES.m3_reveal),
  screenItem(INTERLUDES.final_meal),
  screenItem(INTERLUDES.final_group),
  screenItem(INTERLUDES.final_settle),
  screenItem(INTERLUDES.slogan),
  { kind: 'epilogue', id: 'epilogue', label: '终局' },
]

interface SessionStore {
  index: number
  // 跨案累计的空壳计数（每案改判+1，尾声钩子读取）
  totalHollow: number
  finishedCases: number
  // 科技点燃计数（M1 埋机制：每点燃一项+1；归零轨总值＝totalHollow+igniteCount，M2 显影为压力。
  // 不并入 totalHollow——空壳名单口径＝"你经手改判的每一个鬼"（黑盒问题8），点燃不是改判）
  igniteCount: number
  // 温暖执念账本（M2 燃料经济层，设计 §二/§三）：性质转换结案 +1/案——每笔都可指出对应周渡源温暖证据
  warmFuel: number
  finishSession: (hollowGained: number) => void
  // 性质转换归档（M2 新动词，结案级二选一）：空壳不入账（执念换性质、种子保住），温暖执念 +1
  finishWarm: () => void
  // 文本屏推进：只走 index，不计案件数、不加空壳（finishedCases 保持"已归档案数"语义）
  advanceFlow: () => void
  // 点燃屏专用推进：index+1 且 igniteCount+1（ScreenData.ignite=true 的屏用）
  igniteFeed: () => void
}

// ——— localStorage 自动存档（任务5）———
// 只存会话层 store 全量（index/totalHollow/finishedCases/igniteCount/warmFuel）；案内进度不存，
// 刷新后回到当前案开头（执行文档任务5规格口径）。
const SAVE_KEY = 'm0_session_save'
const SCHEMA_VERSION = 5 // v4→v5：M2 流程插入 4 屏（ignite_4/5/6＋m2_zero）——老档按屏身份分段位移（见 MIGRATIONS[4]），不弃档
// v1→v2：案件序列扩为全幕 FLOW（案件+屏+Epilogue），v1 老档 index 语义错位，直接弃用

interface SaveData {
  version: number
  index: number
  totalHollow: number
  finishedCases: number
  igniteCount?: number
  warmFuel?: number
}

// 迁移链：存档结构升级时在此登记"版本 n → n+1"的转换函数，loadSave 自动逐级执行。
// v1→v2 无合理迁移（流程表重排，旧进度不可映射），留空＝老档静默弃用。
// v2→v3：igniteCount 缺省 0（M1 点燃机制上线，老档无此字段）
// v3→v4：warmFuel 缺省 0（M2 燃料经济层上线）＋摊牌黑屏屏插入位 21（index ≥21 老档 +1）
// v4→v5：M2 四屏插入（ignite_4 位 23／ignite_5 位 26／ignite_6+m2_zero 位 30-31）——
//        按屏身份分段位移：≤22 案7 前原样；23-24（过场/案8）+1；25-27（血食/④号/案9）+2；≥28（M3 起）+4。
//        弃用扁平 +4——会对中段老档（案8/案9 位）跳过整个案子。
const MIGRATIONS: Record<number, (s: SaveData) => SaveData> = {
  2: (s) => ({ ...s, igniteCount: 0 }),
  3: (s) => ({ ...s, warmFuel: 0, index: s.index >= 21 ? s.index + 1 : s.index }),
  4: (s) => {
    const i = s.index
    const shift = i <= 22 ? 0 : i <= 24 ? 1 : i <= 27 ? 2 : 4
    return { ...s, index: i + shift }
  },
}

// 读档：无档/损坏/版本不识别一律按新档处理（静默弃用，不阻断游玩）。
// localStorage 是外部边界，字段做类型与范围校验后才采信。
function loadSave(): { index: number; totalHollow: number; finishedCases: number; igniteCount: number; warmFuel: number } | null {
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
    const igniteCount = data.igniteCount ?? 0
    const warmFuel = data.warmFuel ?? 0
    const ok =
      Number.isInteger(index) &&
      index >= 0 &&
      index <= FLOW.length &&
      Number.isInteger(totalHollow) &&
      totalHollow >= 0 &&
      Number.isInteger(finishedCases) &&
      finishedCases >= 0 &&
      Number.isInteger(warmFuel) &&
      warmFuel >= 0
    return ok ? { index, totalHollow, finishedCases, igniteCount, warmFuel } : null
  } catch {
    return null
  }
}

const saved = loadSave()

export const useSessionStore = create<SessionStore>()((set) => ({
  index: saved?.index ?? 0,
  totalHollow: saved?.totalHollow ?? 0,
  finishedCases: saved?.finishedCases ?? 0,
  igniteCount: saved?.igniteCount ?? 0,
  warmFuel: saved?.warmFuel ?? 0,
  finishSession: (hollowGained) => {
    playSealCase()
    set((s) => ({
      index: s.index + 1,
      totalHollow: s.totalHollow + hollowGained,
      finishedCases: s.finishedCases + 1,
    }))
  },
  // 性质转换归档（燃料层设计 §三）：空壳不入账（执念换性质、灵魂保住种子），温暖执念 +1
  finishWarm: () => {
    playSealCase()
    set((s) => ({
      index: s.index + 1,
      totalHollow: s.totalHollow,
      finishedCases: s.finishedCases + 1,
      warmFuel: s.warmFuel + 1,
    }))
  },
  advanceFlow: () => set((s) => ({ index: s.index + 1 })),
  igniteFeed: () => set((s) => ({ index: s.index + 1, igniteCount: s.igniteCount + 1 })),
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
      igniteCount: s.igniteCount,
      warmFuel: s.warmFuel,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    /* 存储不可用时跳过 */
  }
})
