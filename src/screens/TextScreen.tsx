// 通用文本屏（骨架任务：游戏全貌骨架）——数据化过场/节拍/终局文本的唯一渲染组件。
// 只做文本呈现，不做任何游戏逻辑：纸屏复用 endpanel 系样式，黑屏复用 epi-black/epi-line。
// 文案全部在 src/data/interludes.ts（数据与视图分离）。
import type { ScreenData, SessionStats } from '../data/interludes'

interface Props {
  data: ScreenData
  stats: SessionStats
  onDone: () => void
}

export default function TextScreen({ data, stats, onDone }: Props) {
  const lines = typeof data.lines === 'function' ? data.lines(stats) : data.lines
  const btn = data.btn ?? '继续'

  if (data.dark) {
    return (
      <div className="epi epi-black">
        <div className="ts-dark">
          {data.title && <p className="ts-dark-title">{data.title}</p>}
          <div className="ts-dark-lines">
            {lines.map((l, i) => (
              <p key={`${i}-${l.slice(0, 8)}`} className="epi-line" style={{ animationDelay: `${400 + i * 700}ms` }}>
                {l}
              </p>
            ))}
          </div>
          <button type="button" className="btn primary ts-btn" onClick={onDone}>
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
        <button type="button" className="btn primary" onClick={onDone}>
          {btn}
        </button>
      </main>
    </div>
  )
}
