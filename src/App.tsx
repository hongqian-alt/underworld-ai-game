import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { COST, SOURCE_ACTION, SOURCE_COST } from './engine/rules'
import type { Pair, SourceType } from './engine/types'
import { useGameStore, type LogEntry } from './store/gameStore'
import { FLOW, useSessionStore } from './store/sessionStore'
import Epilogue from './Epilogue'
import TextScreen from './screens/TextScreen'
import type { SessionStats } from './data/interludes'

const SOURCE_LABEL: Record<SourceType, string> = {
  document: '公文',
  poread: '魄读·口述',
  greytrace: '灰迹·物证',
}

const ENDING_LABEL = {
  full: '结案 · 完整修正',
  downgraded: '结案 · 降级结算',
} as const

// 行为日志（用户动作/系统结果双流），带一键复制用于排障沟通
function GameLog({ entries }: { entries: LogEntry[] }) {
  const [copied, setCopied] = useState(false)

  const copyLog = async () => {
    const text = entries.map((e) => `【${e.who === 'user' ? '你' : '系统'}】${e.text}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="logbox" aria-label="行为日志">
      <div className="loghead">
        <span>行为日志（{entries.length}）</span>
        <button type="button" className="btn tiny" onClick={copyLog}>
          {copied ? '已复制' : '复制日志'}
        </button>
      </div>
      <div className="logscroll">
        {[...entries]
          .reverse()
          .map((e, i) => (
            <div key={`${i}-${e.text.slice(0, 10)}`} className={e.who === 'user' ? 'loguser' : 'logsys'}>
              {e.who === 'user' ? '【你】' : '【系统】'}
              {e.text}
            </div>
          ))}
      </div>
    </section>
  )
}

function App() {
  const caseData = useGameStore((s) => s.caseData)
  const state = useGameStore((s) => s.state)
  const msg = useGameStore((s) => s.msg)
  const hint = useGameStore((s) => s.hint)
  const startCase = useGameStore((s) => s.startCase)
  const reveal = useGameStore((s) => s.reveal)
  const accuse = useGameStore((s) => s.accuse)
  const amend = useGameStore((s) => s.amend)
  const dismiss = useGameStore((s) => s.dismiss)
  const suspendDay = useGameStore((s) => s.suspendDay)
  const askCuiyu = useGameStore((s) => s.askCuiyu)

  const index = useSessionStore((s) => s.index)
  const finishedCases = useSessionStore((s) => s.finishedCases)
  const finishSession = useSessionStore((s) => s.finishSession)
  const finishWarm = useSessionStore((s) => s.finishWarm)
  const advanceFlow = useSessionStore((s) => s.advanceFlow)
  const igniteFeed = useSessionStore((s) => s.igniteFeed)
  const totalHollow = useSessionStore((s) => s.totalHollow)
  const igniteCount = useSessionStore((s) => s.igniteCount)
  const warmFuel = useSessionStore((s) => s.warmFuel)
  const entries = useGameStore((s) => s.entries)

  // 会话层流转：当前槽位有数据但尚未装载时载入；无数据则显示"待续"占位
  const item = FLOW[index]
  const slot = item?.kind === 'case' ? item : undefined
  // 文本屏（结算/名单化）可读取的会话层数据汇总（现有 store 字段，不新增状态）
  const stats: SessionStats = { totalHollow, finishedCases, igniteCount, warmFuel }
  useEffect(() => {
    if (slot?.data && slot.data.id !== caseData.id) {
      startCase(slot.data)
    }
  }, [slot, slot?.data, caseData.id, startCase])

  // 美术计划 §二.2 三幕视觉递进：按 FLOW id 派生幕号，body[data-act] 切换纸色（纯挂载层，零引擎改动）
  const act = useMemo(() => {
    const a2 = FLOW.findIndex((f) => f.id === 'm2_showdown')
    const a3 = FLOW.findIndex((f) => f.id === 'm3_open')
    return index < a2 ? 1 : index < a3 ? 2 : 3
  }, [index])
  useEffect(() => {
    document.body.dataset.act = String(act)
    return () => {
      delete document.body.dataset.act
    }
  }, [act])

  const [selected, setSelected] = useState<string[]>([])
  const stmtMap = useMemo(() => new Map(caseData.statements.map((st) => [st.id, st])), [caseData])

  // 黑盒报告问题2：反馈自动跟随——指错/质询等操作出结果后，滚到消息处（不跟随焦点是原复现根因之一）
  // hook 必须无条件调用；早退分支（文本屏/尾声）无 desk-msg 挂载，ref 为 null 即无操作
  const msgRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (msg) msgRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [msg])

  // 开局批注：hints 里 trigger=start 的条目自动展示作教学引导（数据已有，仅展示层）
  const startHint = useMemo(
    () => caseData.hints.find((h) => h.trigger === 'start')?.text ?? '',
    [caseData],
  )

  const closed = state.phase === 'resolved'

  // M2 燃料层（燃料经济层设计_v0.1 §三）：性质转换前置——本案 fuel 配置存在且全部温暖证据已取证。
  // 没拿到温暖证据＝只有老动词（改判归档），UI 静默降级，不弹提示。
  const fuel = caseData.fuel
  const warmReady = fuel !== undefined && fuel.warmEvidence.every((id) => state.revealed.includes(id))

  // 取证成功后自动把新证据挂入对照台（纯 UI 便利：买来的线索默认就是要对照的对象）
  const revealAndSelect = (stmtId: string) => {
    reveal(stmtId)
    const ok = useGameStore.getState().state.revealed.includes(stmtId)
    if (ok) {
      setSelected((prev) =>
        prev.includes(stmtId)
          ? prev
          : prev.length >= 2
            ? [prev[1], stmtId]
            : [...prev, stmtId],
      )
    }
  }

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id],
    )

  const submitAccuse = () => {
    if (selected.length === 2) {
      accuse(selected[0], selected[1])
      setSelected([])
    }
  }

  // 流程分发（骨架任务）：文本屏走 TextScreen；Epilogue（含邮箱提交/90 秒时序等
  // 终局性逻辑）挂全游戏结尾；案件项走下方现有调查/结案 UI。
  // 点燃屏（ScreenData.ignite）推进走 igniteFeed：喂归零轨 +1（M1 埋机制，M2 显影）
  if (!slot) {
    if (item?.kind === 'screen') {
      return <TextScreen data={item.screen} stats={stats} onDone={() => (item.screen.ignite ? igniteFeed() : advanceFlow())} />
    }
    if (item?.kind === 'epilogue' || index >= FLOW.length) {
      return <Epilogue totalHollow={totalHollow} />
    }
    return (
      <div className="screen tbc">
        <main className="endpanel">
          <span className="endtag">卷宗待续</span>
          <ul className="orderlist">
            {FLOW.filter((f) => f.kind === 'case').map((f, ci) => (
              <li key={f.id} className={ci < finishedCases ? 'done' : ci === finishedCases ? 'now' : ''}>
                {ci < finishedCases ? '✓' : ci === finishedCases ? '▶' : '　'} {f.label}
              </li>
            ))}
          </ul>
          <p className="muted">已归档 {finishedCases} 案。（余下案卷数据未入库——任务3 数据骨架补齐后自动接上。）</p>
        </main>
      </div>
    )
  }

  if (closed) {
    // M2 燃料层结案级二选一（设计 §三）：温暖证据齐→改判归档 vs 性质转换归档；不齐→单按钮老形态
    return (
      <div className="screen">
        <header className="topbar">
          <span className="case-title">{caseData.title}</span>
        </header>
        <main className="endpanel">
          <span className="endtag">{ENDING_LABEL[state.ending ?? 'full']}</span>
          {/* 彩蛋位（切片文档二节）：序幕案卷编号与玩家档案同源，文案用户主笔 */}
          <div className="egg-slot" data-egg="prologue-dossier-link" />
          <p className="epilogue">{caseData.epilogue}</p>
          {fuel && warmReady ? (
            <div className="fuel-choice">
              <p className="fuel-line">{fuel.conversionLine}</p>
              <div className="fuel-buttons">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => finishSession(state.hollowCount)}
                >
                  改判归档 · 空壳 +{state.hollowCount}
                </button>
                <button type="button" className="btn primary" onClick={finishWarm}>
                  性质转换归档 · 温暖执念 +1
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn primary"
              onClick={() => finishSession(state.hollowCount)}
            >
              结案归档 · 继续
            </button>
          )}
          <GameLog entries={entries} />
        </main>
      </div>
    )
  }

  // 教学引导数据（只读引擎已有状态做展示，不参与判定）：
  // 处置进度＝已处置 / 待清矛盾总数（fact_update 陷阱不计入，不剧透）
  const amendableTotal = caseData.pairs.filter((p) => p.kind !== 'fact_update').length
  // 魂力不足以改判时的出路提示
  const apHint =
    state.ap === 0
      ? '魂力已尽——提交指错仍免费；或挂起，待作七走满自动结算。'
      : state.ap < COST.amend
        ? `魂力不足以改判（需 ${COST.amend}）——可驳回（−${COST.dismiss}）处置已入卷矛盾，或挂起等下一日。`
        : ''
  // 黑盒报告问题5：资源保底提示——余下必处置矛盾的处置成本事前可见，玩家可判断资源够不够走改判路径
  const remainingAmend = amendableTotal - state.resolvedPairs.length
  const amendBudget =
    remainingAmend > 0
      ? `余下待清 ${remainingAmend} 处：全改判需 ${remainingAmend * COST.amend} 点，驳回共需 ${remainingAmend} 点（当前魂力 ${state.ap}）。` +
        (state.ap < remainingAmend * COST.amend
          ? '魂力不够全部改判——驳回（每处 −1）也是处置，别把矛盾拖过作七。'
          : '')
      : ''
  // 黑盒报告问题3：连续指错失败的止损引导（不改引擎惩罚数值，只做引导）
  const wrongGuide =
    state.accusedWrong >= 3
      ? `已错 ${state.accusedWrong} 次指错——不互斥的两条未必是矛盾。质询崔钰（−${COST.ask}）换方向，或驳回已入卷矛盾止损。`
      : ''
  // 已入卷矛盾全部处置但尚未结案：明确告诉玩家"还要继续找"（只读状态做展示）
  const allFoundHandled =
    state.foundPairs.length > 0 && state.foundPairs.every((pid) => state.resolvedPairs.includes(pid))
  const nextHint =
    allFoundHandled && state.resolvedPairs.length < amendableTotal
      ? '已入卷的矛盾均已处置，但本案还有未清的矛盾——继续取证、或把两条陈述对照指错。'
      : ''

  const pairLabel = (p: Pair) =>
    `${stmtMap.get(p.a)?.label ?? p.a} ⇄ ${stmtMap.get(p.b)?.label ?? p.b}`

  return (
    <div className="screen">
      <header className="topbar">
        <span className="case-title">{caseData.title}</span>
        <span className="day">作七 · 第{state.day}天</span>
        <span className="vwrap">
          警戒度
          <span className="vbar">
            <span className="vbar-fill" style={{ width: `${state.vigilance}%` }} />
          </span>
          {state.vigilance}
        </span>
      </header>

      <main className="cols">
        <aside className="panel stack">
          <h2>案卷堆</h2>
          <p className="brief">{caseData.brief}</p>
          <div className="cards">
            {caseData.statements.map((st) =>
              state.revealed.includes(st.id) ? (
                <button
                  key={st.id}
                  type="button"
                  className={`card open${selected.includes(st.id) ? ' picked' : ''}`}
                  onClick={() => toggleSelect(st.id)}
                >
                  <span className="src-tag">[{SOURCE_LABEL[st.source]}]</span>
                  <strong>{st.label}</strong>
                  <p>{st.text}</p>
                </button>
              ) : (
                <div key={st.id} className="card sealed">
                  <span className="src-tag">[{SOURCE_LABEL[st.source]}]</span>
                  <strong>{st.label}</strong>
                  <button type="button" className="seal-btn" onClick={() => revealAndSelect(st.id)}>
                    {SOURCE_ACTION[st.source]}（−{SOURCE_COST[st.source]}）
                  </button>
                </div>
              ),
            )}
          </div>
        </aside>

        <section className="panel desk">
          <h2>证据对照台</h2>
          <div className="compare">
            {[0, 1].map((slot) => {
              const st = selected[slot] !== undefined ? stmtMap.get(selected[slot]) : undefined
              return st ? (
                <div key={slot} className="slot">
                  <div className="slot-head">
                    <span className="src-tag">[{SOURCE_LABEL[st.source]}]</span>
                    <strong>{st.label}</strong>
                  </div>
                  <p>{st.text}</p>
                </div>
              ) : (
                <div key={slot} className="slot empty">
                  在左侧案卷堆点选两条陈述对照（放入第三条会顶掉最早的一条）
                </div>
              )})}
          </div>
          <button
            type="button"
            className="btn primary"
            disabled={selected.length !== 2}
            onClick={submitAccuse}
          >
            提交指错
          </button>

          <h3>
            已入卷矛盾
            <span className="pair-progress">
              （已处置 {state.resolvedPairs.length} / 待清 {amendableTotal} 处，全部处置方可结案）
            </span>
          </h3>
          {/* 黑盒报告问题9：改判/驳回规则事前说明，不再等首次改判失败才告知 */}
          <p className="aphint">
            改判（−{COST.amend}）需证据链完整——记忆类矛盾要先取得第三条记录钉住事实；驳回（−{COST.dismiss}）即时处置，执念滞留。
          </p>
          {amendBudget && <p className="aphint">{amendBudget}</p>}
          {apHint && <p className="aphint">{apHint}</p>}
          {wrongGuide && <p className="aphint">{wrongGuide}</p>}
          {nextHint && <p className="aphint">{nextHint}</p>}
          {msg && (
            <p className="desk-msg" ref={msgRef}>
              {msg}
            </p>
          )}
          {state.foundPairs.length === 0 ? (
            <p className="muted">尚无入卷矛盾。</p>
          ) : (
            <ul className="pairlist">
              {state.foundPairs.map((pid) => {
                const pair = caseData.pairs.find((p) => p.id === pid)
                if (!pair) return null
                const handled = state.resolvedPairs.includes(pid)
                return (
                  <li key={pid} className={`pair${handled ? ' done' : ''}`}>
                    <span>{pairLabel(pair)}</span>
                    {handled ? (
                      <em className="done-tag">已处置</em>
                    ) : (
                      <span className="row-btns">
                        <button type="button" className="btn ghost" onClick={() => amend(pid)}>
                          改判（−{COST.amend}）
                        </button>
                        <button type="button" className="btn ghost" onClick={() => dismiss(pid)}>
                          驳回（−{COST.dismiss}）
                        </button>
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          <div className="actionrow">
            <button type="button" className="btn" onClick={suspendDay}>
              挂起
            </button>
            <button type="button" className="btn" onClick={askCuiyu}>
              质询崔钰（−{COST.ask}）
            </button>
          </div>
          {hint && <blockquote className="hintbox">崔钰压低声音："{hint}"</blockquote>}
          {!hint && startHint && <blockquote className="hintbox dim">卷宗批注：{startHint}</blockquote>}
        </section>
      </main>

      <footer className="apbar">
        <span>魂力</span>
        <span className="pips">
          {Array.from({ length: caseData.ap }, (_, i) => (i < state.ap ? '◆' : '◇')).join('')}
        </span>
        <span className="ap-num">
          {state.ap}/{caseData.ap}
        </span>
        {msg && <span className="msgline">{msg}</span>}
      </footer>

      <GameLog entries={entries} />
    </div>
  )
}

export default App
