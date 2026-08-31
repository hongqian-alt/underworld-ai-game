// 通用文本屏（骨架任务：游戏全貌骨架）——数据化过场/节拍/终局文本的唯一渲染组件。
// 只做文本呈现，不做任何游戏逻辑：纸屏复用 endpanel 系样式，黑屏复用 epi-black/epi-line。
// 文案全部在 src/data/interludes.ts（数据与视图分离）。
import { useEffect } from 'react'
import type { ScreenData, SessionStats } from '../data/interludes'
import { playGhostBreath, playIgniteTech, playUiTurn } from '../audio/sound'

interface Props {
  data: ScreenData
  stats: SessionStats
  onDone: () => void
}

export default function TextScreen({ data, stats, onDone }: Props) {
  const lines = typeof data.lines === 'function' ? data.lines(stats) : data.lines
  const btn = data.btn ?? '继续'

  // 美术计划阶段 B：屏幕挂载声音节拍——小鬼诞生＝气声，科技点燃＝火苗＋电流
  useEffect(() => {
    if (data.id === 'ghost_birth') playGhostBreath()
    if (data.id.startsWith('ignite_')) playIgniteTech()
  }, [data.id])

  // 翻页/调卷纸声（阶段 B 音效补齐）
  const advance = () => {
    playUiTurn()
    onDone()
  }

  if (data.dark) {
    return (
      <div className="epi epi-black">
        <div className={`ts-dark${data.id.startsWith('ignite_') ? ' ignite-bg' : ''}`}>
          {data.title && <p className="ts-dark-title">{data.title}</p>}
          <div className="ts-dark-lines">
            {lines.map((l, i) => (
              <p key={`${i}-${l.slice(0, 8)}`} className="epi-line" style={{ animationDelay: `${400 + i * 700}ms` }}>
                {l}
              </p>
            ))}
          </div>
          <button type="button" className="btn primary ts-btn" onClick={advance}>
            {btn}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <main className="endpanel">
        {data.title && <span className="endtag">{data.title}</span>}
        <p className="epilogue ts-lines">{lines.join('\n\n')}</p>
        {data.note && <p className="ts-note">{data.note}</p>}
        <button type="button" className="btn primary" onClick={advance}>
          {btn}
        </button>
      </main>
    </div>
  )
}
