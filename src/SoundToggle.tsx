import { useState } from 'react'
import { isMuted, toggleMute } from './audio/sound'

// 美术计划 §4.4：静音开关常驻顶栏角标，状态入 localStorage
export default function SoundToggle() {
  const [muted, setMuted] = useState(isMuted())
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-label={muted ? '开启声音' : '静音'}
      onClick={() => setMuted(toggleMute())}
    >
      {muted ? '静' : '声'}
    </button>
  )
}
