// 美术计划阶段 B：角色立绘剪影（结构版 SVG）——崔钰/冤鬼/小鬼
// 浓墨剪影＋米白留白，正式笔触资产后补（用户 Seedream 生成替换）。

export type SilhouetteKind = 'cuiyu' | 'yuangui' | 'xiaogui'

interface Props {
  kind: SilhouetteKind
  width?: number
  className?: string
}

export default function Silhouette({ kind, width = 140, className }: Props) {
  return (
    <svg
      className={className}
      width={width}
      height={width * 1.5}
      viewBox="0 0 200 300"
      role="img"
      aria-label={kind === 'cuiyu' ? '崔钰' : kind === 'yuangui' ? '冤鬼' : '小鬼'}
    >
      {kind === 'cuiyu' && (
        <g fill="var(--ink)">
          {/* 乌纱帽：帽体＋双翅 */}
          <path d="M100 38 Q78 36 74 16 Q96 4 124 10 Q126 30 100 38 Z" />
          <ellipse cx="52" cy="20" rx="22" ry="6" transform="rotate(-12 52 20)" />
          <ellipse cx="148" cy="16" rx="22" ry="6" transform="rotate(10 148 16)" />
          {/* 头颈 */}
          <circle cx="100" cy="52" r="20" />
          <rect x="92" y="66" width="16" height="14" />
          {/* 官袍：宽肩梯形＋下摆 */}
          <path d="M100 80 Q64 86 54 110 L40 236 Q46 252 66 248 L74 258 L126 258 L134 248 Q154 252 160 236 L146 110 Q136 86 100 80 Z" />
          {/* 持笔手袖：前伸 */}
          <path d="M126 128 Q158 136 166 160 Q168 172 156 172 Q138 168 122 152 Z" />
          {/* 笔杆＋笔锋 */}
          <rect x="158" y="128" width="5" height="34" transform="rotate(24 160 145)" />
          <path d="M168 122 Q176 128 172 138 Q166 134 168 122 Z" />
        </g>
      )}
      {kind === 'yuangui' && (
        <g fill="var(--ink)">
          {/* 散乱发髻 */}
          <circle cx="98" cy="34" r="9" />
          <circle cx="112" cy="28" r="6" />
          <circle cx="86" cy="26" r="5" />
          {/* 低垂头（躬身） */}
          <circle cx="102" cy="52" r="19" />
          {/* 弓背躬身：整体前倾 */}
          <path d="M118 66 Q146 82 150 116 L158 210 Q160 232 142 238 L64 246 Q48 244 50 224 L72 118 Q80 84 104 68 Z" />
          {/* 垂落双袖（无力下垂） */}
          <path d="M146 120 Q166 140 164 176 Q158 186 148 180 Q142 152 138 132 Z" />
          <path d="M76 120 Q60 146 62 184 Q68 194 78 188 Q84 152 88 132 Z" />
        </g>
      )}
      {kind === 'xiaogui' && (
        <g>
          <g fill="var(--ink)">
            {/* 大头：歪（好奇） */}
            <circle cx="94" cy="76" r="40" transform="rotate(-10 94 76)" />
            {/* 两只小角 */}
            <path d="M68 44 Q60 28 70 18 Q76 32 80 40 Z" />
            <path d="M116 40 Q126 26 122 14 Q112 26 106 36 Z" />
            {/* 小身 */}
            <path d="M94 112 Q66 118 62 148 L56 224 Q58 240 76 240 L116 240 Q132 238 132 222 L124 146 Q120 118 94 112 Z" />
            {/* 短腿 */}
            <rect x="72" y="238" width="16" height="26" rx="7" />
            <rect x="106" y="238" width="16" height="26" rx="7" />
          </g>
          {/* 一点朱批红：肚上小印（小鬼是被系统标记的存在） */}
          <circle cx="95" cy="170" r="9" fill="var(--vermil)" opacity="0.85" />
        </g>
      )}
    </svg>
  )
}
