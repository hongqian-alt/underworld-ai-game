// 尾声钩子（任务4）：第三案结案归档后触发的 90 秒序列——①号反转的媒介化部署。
// 铁律：不做任何 UI 解释（切片文档五节第3条）；本文件文案初稿全部标 // 待人工终审。
// 任务6埋点挂点（PostHog 接入时补）：进入本组件＝epilogue_dwell 起点；邮箱提交＝email_submit。
import { useEffect, useState } from 'react'

// —— 时序（毫秒）：整体约 60–90 秒，随空壳份数浮动 ——
const ANNOUNCE_MS = 9000 // 系统公告停留
const FLIP_HEAD_MS = 2600 // 清单出现到第一份翻转
const FLIP_STAGGER_MS = 1500 // 相邻两份翻转间隔（美术计划 §3.2：≥1.5s/条）
const FLIP_TAIL_MS = 7000 // 末份翻转后的停留
const BLACK_SILENCE_MS = 3200 // 黑屏静默后一行字才浮现
const BLACK_LINE_MS = 16000 // 一行字停留

const EMAIL_KEY = 'm0_email_subscribe'

// ——— 以下文案均为初稿 // 待人工终审 ———
const ANNOUNCE_TITLE = '幽冥信息管理总署 · 例行巡检公告'
const ANNOUNCE = [
  '本月度卷宗例行巡检现已启动。',
  '系统将对此前已办结卷宗逐份复查，复查期间部分卷宗状态将发生变动。',
  '状态变动属正常流程，无需申报，不予受理异议。',
  '—— 品控司 谨启',
]
const FLIP_TITLE = '卷宗状态变动清单'
const FIXED_TAG = '已修正'
const HOLLOW_TAG = '空壳'
const EMPTY_NOTE = '本次巡检未涉及改判卷宗。'
// 黑盒报告问题8：口径统一——totalHollow＝改判处数，量词用"处"（与结算屏/空壳名单一致），
// "起"是案件量词（全卷 10 案），原措辞造成三处口径不一致。
const blackLine = (n: number) => `本月，信息科共修正冤情 ${n} 处。` // 原文出自切片设计五节，仍待终审
const EMAIL_PROMPT = '第二部上线时通知你为什么。' // 出自切片设计五节第4条，待终审
const EMAIL_DONE = '已登记。'
const EMAIL_ERR = '这地址收不到信——请填一个有效邮箱。' // 黑盒报告问题10：无效提交要有反馈，待终审
const FIN_MARK = '全卷完' // 黑盒报告问题11：终点屏完结标识，待终审
const SKIP_LABEL = '跳过' // 黑盒报告问题12：尾声动画可跳过，待终审
// ——— 文案区结束 ———

// 卷宗编号：确定性生成（无随机，回放一致）
const dossierNo = (i: number) => `己-${String(1073 + i * 53).padStart(4, '0')}`

type Phase = 'announce' | 'flip' | 'black' | 'email'

export default function Epilogue({ totalHollow }: { totalHollow: number }) {
  const n = Math.max(0, totalHollow)
  const [phase, setPhase] = useState<Phase>('announce')
  const [flipped, setFlipped] = useState(0)
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(() => localStorage.getItem(EMAIL_KEY) !== null)

  useEffect(() => {
    if (phase !== 'announce') return
    const t = window.setTimeout(() => setPhase('flip'), ANNOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'flip') return
    const timers = Array.from({ length: n }, (_, i) =>
      window.setTimeout(() => setFlipped(i + 1), FLIP_HEAD_MS + (i + 1) * FLIP_STAGGER_MS),
    )
    timers.push(
      window.setTimeout(() => setPhase('black'), FLIP_HEAD_MS + n * FLIP_STAGGER_MS + FLIP_TAIL_MS),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [phase, n])

  useEffect(() => {
    if (phase !== 'black') return
    const t = window.setTimeout(() => setPhase('email'), BLACK_SILENCE_MS + BLACK_LINE_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  const submit = () => {
    // 黑盒报告问题10：无效邮箱给出明确反馈，不再静默吞掉提交
    if (!email.includes('@')) {
      setErr(EMAIL_ERR)
      return
    }
    setErr('')
    localStorage.setItem(EMAIL_KEY, JSON.stringify({ email, at: Date.now() }))
    setDone(true)
  }

  // 黑盒报告问题12：尾声动画全程可跳过（直接跳到订阅/终点屏，后续动画段含口径行一并略过）
  const skip = () => setPhase('email')

  if (phase === 'announce') {
    return (
      <div className="epi">
        <button type="button" className="epi-skip" onClick={skip}>
          {SKIP_LABEL}
        </button>
        <section className="epi-announce">
          <h3>{ANNOUNCE_TITLE}</h3>
          {ANNOUNCE.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      </div>
    )
  }

  if (phase === 'flip') {
    return (
      <div className="epi">
        <button type="button" className="epi-skip" onClick={skip}>
          {SKIP_LABEL}
        </button>
        <section className="epi-announce">
          <h3>{FLIP_TITLE}</h3>
          {n === 0 && <p className="epi-empty">{EMPTY_NOTE}</p>}
          <ul className="epi-list">
            {Array.from({ length: n }, (_, i) => {
              const isHollow = flipped > i
              return (
                <li key={i} className={`epi-row${isHollow ? ' hollow' : ''}`}>
                  <span>{dossierNo(i)}</span>
                  {/* 黑盒报告问题8：翻转留残影（已修正→空壳）——"刚修正即回滚"看得清，不再一闪而过 */}
                  <span className="epi-status">
                    {isHollow ? (
                      <>
                        <span className="epi-was">{FIXED_TAG}</span>
                        <span className="epi-sep">→</span>
                        <span className="epi-hollow">{HOLLOW_TAG}</span>
                      </>
                    ) : (
                      FIXED_TAG
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    )
  }

  // black / email：黑屏一行字 → 邮箱订阅（localStorage 暂存，不接真实邮件服务）
  return (
    <div className="epi epi-black">
      {phase === 'black' && (
        <button type="button" className="epi-skip" onClick={skip}>
          {SKIP_LABEL}
        </button>
      )}
      <p className="epi-line" style={{ animationDelay: `${BLACK_SILENCE_MS}ms` }}>
        {blackLine(n)}
      </p>
      {phase === 'email' &&
        (done ? (
          <p className="epi-line epi-done">{EMAIL_DONE}</p>
        ) : (
          <form
            className="epi-form"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <label htmlFor="epi-email">{EMAIL_PROMPT}</label>
            <div className="epi-formrow">
              <input
                id="epi-email"
                type="email"
                value={email}
                placeholder="邮箱"
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (err) setErr('')
                }}
              />
              <button type="submit" className="btn primary epi-btn">
                订阅
              </button>
            </div>
            {err && <p className="epi-err">{err}</p>}
          </form>
        ))}
      {/* 黑盒报告问题11：终点屏完结标识——通关与否一眼可辨 */}
      {phase === 'email' && <p className="epi-fin">{FIN_MARK}</p>}
    </div>
  )
}
