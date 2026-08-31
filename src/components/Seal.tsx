// 美术计划阶段 B：印章图标（结构版 SVG）——结案/归档/暂缓/复核/空壳/辛字号（＋全卷完）
// 正式印泥质感资产后补（用户 Seedream 生成替换）；本版用 SVG 框＋楷体字＋残边达到印章结构。
// 朱砂纪律：空壳/辛字号是系统标记非朱批语义，用灰墨不用红。

type SealShape = 'square' | 'circle' | 'rect'

const PRESETS: Record<string, { label: string; shape: SealShape; color: string }> = {
  jiean: { label: '结案', shape: 'square', color: 'var(--vermil)' },
  guidang: { label: '归档', shape: 'square', color: 'var(--vermil)' },
  zanhuan: { label: '暂缓', shape: 'rect', color: 'var(--vermil)' },
  fuhe: { label: '复核', shape: 'circle', color: 'var(--vermil)' },
  kongke: { label: '空壳', shape: 'square', color: 'var(--muted)' },
  xin: { label: '辛字号', shape: 'rect', color: 'var(--muted)' },
  quanjuan: { label: '全卷完', shape: 'square', color: 'var(--vermil)' },
}

interface Props {
  kind?: keyof typeof PRESETS
  label?: string
  shape?: SealShape
  color?: string
  size?: number
  className?: string
}

// 残边：dasharray 模拟印泥断续
const ROUGH = '30 2.5 46 1.5 21 3'

export default function Seal({ kind, label, shape, color, size = 72, className }: Props) {
  const p = kind ? PRESETS[kind] : undefined
  const text = label ?? p?.label ?? ''
  const s = shape ?? p?.shape ?? 'square'
  const c = color ?? p?.color ?? 'var(--vermil)'
  const rot = kind === 'kongke' ? -6 : kind === 'xin' ? 4 : -2

  if (s === 'rect') {
    return (
      <svg className={className} width={size * 1.6} height={size} viewBox="0 0 120 75" aria-label={`印章：${text}`}>
        <g transform={`rotate(${rot} 60 37.5)`} fill="none" stroke={c}>
          <rect x="5" y="7" width="110" height="61" strokeWidth="4.5" strokeDasharray={ROUGH} opacity="0.92" />
          <rect x="11" y="12.5" width="98" height="50" strokeWidth="1.2" opacity="0.7" />
          <text
            x="60"
            y="49"
            textAnchor="middle"
            fill={c}
            stroke="none"
            fontSize="30"
            fontWeight="700"
            fontFamily="STKaiti, KaiTi, 'Songti SC', serif"
            letterSpacing="4"
          >
            {text}
          </text>
        </g>
      </svg>
    )
  }

  if (s === 'circle') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 80 80" aria-label={`印章：${text}`}>
        <g transform={`rotate(${rot} 40 40)`} fill="none" stroke={c}>
          <circle cx="40" cy="40" r="34" strokeWidth="4.5" strokeDasharray={ROUGH} opacity="0.92" />
          <circle cx="40" cy="40" r="29" strokeWidth="1.2" opacity="0.7" />
          <text
            x="40"
            y="51"
            textAnchor="middle"
            fill={c}
            stroke="none"
            fontSize="26"
            fontWeight="700"
            fontFamily="STKaiti, KaiTi, 'Songti SC', serif"
          >
            {text}
          </text>
        </g>
      </svg>
    )
  }

  // square：两字竖排
  const chars = [...text]
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 80 80" aria-label={`印章：${text}`}>
      <g transform={`rotate(${rot} 40 40)`} fill="none" stroke={c}>
        <rect x="7" y="7" width="66" height="66" strokeWidth="4.5" strokeDasharray={ROUGH} opacity="0.92" />
        <rect x="13" y="13" width="54" height="54" strokeWidth="1.2" opacity="0.7" />
        {chars.map((ch, i) => (
          <text
            key={i}
            x="40"
            y={chars.length > 1 ? 35 + i * 26 : 51}
            textAnchor="middle"
            fill={c}
            stroke="none"
            fontSize="26"
            fontWeight="700"
            fontFamily="STKaiti, KaiTi, 'Songti SC', serif"
          >
            {ch}
          </text>
        ))}
      </g>
    </svg>
  )
}
