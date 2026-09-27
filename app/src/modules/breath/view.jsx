import { Wind } from 'lucide-react'
import Breath from '../../screens/Breath.jsx'
import { programProgress, loadBreathOpts, PATTERNS, PROGRAM_DAY_SEC } from '../../lib/breath.js'
import { BREATH_DONE_SEC } from '../../lib/notifyLog.js'

// 'breath-1' (nefes hatırlatması): 1 dk, sakinlik puanı sorulmaz. Süre VARSAYIM (plan §2; Schwerdtfeger 2025'te 1 dk denendi).
// Seans en az BREATH_DONE_SEC sürer: tamamlanan 1 dk nefes Gelişim ölçümünde "yapıldı" sayılsın (düzenlenmiş kalıpta
// döngü yuvarlaması süreyi 60 sn'nin altına düşürüyordu).
const QUICK_SEC = 60

export default {
  icon: Wind,
  sub: (ctx) => {
    const p = programProgress(ctx.sessions)
    return p.days > 0 ? `${PATTERNS[loadBreathOpts().pattern].title} · program ${p.days}/${p.target} gün` : 'Yavaş nefes · 1, 3 ya da 5 dk'
  },
  badge: (ctx) => {
    const p = programProgress(ctx.sessions)
    return p.todayDone ? 'Bugün tamam' : null
  },
  render: (ctx, route) => (
    <Breath
      key={route}
      sessions={ctx.sessions}
      presetSec={route === 'breath-rest' ? PROGRAM_DAY_SEC : route === 'breath-1' ? QUICK_SEC : null}
      askCalm={route !== 'breath-1'}
      minSec={route === 'breath-1' ? BREATH_DONE_SEC : null}
      onBack={ctx.back}
      onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }}
    />
  ),
}
