// 美术计划 §四 声音升级：零依赖 Web Audio API 程序化合成
// 调性：阴间办公室的声音——纸、墨、印、殿鸣。禁止游戏化 UI 音（电子提示/胜利号角/错误蜂鸣）。
// 三轨红线：警告信息不用蜂鸣/警报音（warn-thud 留阶段 C，仅剧情事件显影）。

const MUTE_KEY = 'm0_sound_muted'

let ctx: AudioContext | null = null
let muted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1'

// 美术计划 §4.4：默认开低音量（~30%）＋首次交互后启用（浏览器 autoplay 策略）
const VOLUME = 0.3

function ensureCtx(): AudioContext | null {
  if (muted) return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

// brush-ok：朱笔落纸（改判成立）——短促摩擦＋落笔顿挫
export function playBrushOk(): void {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  // 摩擦声：带通噪声短促衰减
  const len = Math.floor(c.sampleRate * 0.09)
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.025))
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1800
  const ng = c.createGain()
  ng.gain.value = VOLUME * 0.4
  noise.connect(bp).connect(ng).connect(c.destination)
  noise.start(t)
  // 落笔顿挫：低频短促
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, t)
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.06)
  const og = c.createGain()
  og.gain.setValueAtTime(VOLUME * 0.5, t)
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
  osc.connect(og).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.12)
}

// seal-case：印章钤下（结案归档）——低沉"咚"，仪式感最强的一枚
export function playSealCase(): void {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(130, t)
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.18)
  const g = c.createGain()
  g.gain.setValueAtTime(VOLUME, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.45)
}

// ink-dull：闷墨滴（指错失败）——失败也在调性内，不用错误音
export function playInkDull(): void {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, t)
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.1)
  const g = c.createGain()
  g.gain.setValueAtTime(VOLUME * 0.55, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.3)
}

// ui-turn：翻页/调卷（阶段 B 音效补齐）——轻纸声，短噪声扫频
export function playUiTurn(): void {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  const len = Math.floor(c.sampleRate * 0.14)
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.045))
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(900, t)
  bp.frequency.exponentialRampToValueAtTime(2400, t + 0.12)
  bp.Q.value = 0.8
  const g = c.createGain()
  g.gain.setValueAtTime(VOLUME * 0.28, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
  noise.connect(bp).connect(g).connect(c.destination)
  noise.start(t)
}

// ignite-tech：科技点燃（阶段 B）——极轻火苗＋一丝电流，"阴间科技"的声音身份
export function playIgniteTech(): void {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  // 火苗：低频软噗
  const puff = c.createOscillator()
  puff.type = 'sine'
  puff.frequency.setValueAtTime(140, t)
  puff.frequency.exponentialRampToValueAtTime(60, t + 0.2)
  const pg = c.createGain()
  pg.gain.setValueAtTime(VOLUME * 0.4, t)
  pg.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
  puff.connect(pg).connect(c.destination)
  puff.start(t)
  puff.stop(t + 0.35)
  // 电流：高频细噪声，延迟一点进来
  const len = Math.floor(c.sampleRate * 0.3)
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-Math.abs(i - c.sampleRate * 0.12) / (c.sampleRate * 0.05))
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 3200
  const ng = c.createGain()
  ng.gain.value = VOLUME * 0.06
  noise.connect(hp).connect(ng).connect(c.destination)
  noise.start(t + 0.18)
}

// ghost-breath：小鬼在场提示（阶段 B）——极轻气声，M1 违和台词位
export function playGhostBreath(): void {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime
  const len = Math.floor(c.sampleRate * 0.9)
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len) ** 2
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 700
  bp.Q.value = 0.6
  const g = c.createGain()
  g.gain.value = VOLUME * 0.14
  noise.connect(bp).connect(g).connect(c.destination)
  noise.start(t)
}

// 静音控制（美术计划 §4.4：静音开关常驻，状态入 localStorage）
export function isMuted(): boolean {
  return muted
}
export function setMuted(v: boolean): void {
  muted = v
  try {
    localStorage.setItem(MUTE_KEY, v ? '1' : '0')
  } catch {
    /* localStorage 不可用时静默 */
  }
}
export function toggleMute(): boolean {
  setMuted(!muted)
  return muted
}
