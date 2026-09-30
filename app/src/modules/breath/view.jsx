import { Wind } from 'lucide-react'
import Breath from '../../screens/Breath.jsx'
import { programProgress, loadBreathOpts, safetySeen, PATTERNS, PROGRAM_DAY_SEC } from '../../lib/breath.js'
import { BREATH_DONE_SEC } from '../../lib/notifyLog.js'
import { pathCtx } from '../pathContext.js'
import { registry } from '../registry.js'
import { buildPath } from '../../lib/today.js'
import { loadLater } from '../../lib/pathLater.js'
import breath, { breathPathStage, breathMixFor } from './manifest.js'

// 'breath-1' (nefes hatırlatması): 1 dk, sakinlik puanı sorulmaz. Süre VARSAYIM (plan §2; Schwerdtfeger 2025'te 1 dk denendi).
// Seans en az BREATH_DONE_SEC sürer: tamamlanan 1 dk nefes Gelişim ölçümünde "yapıldı" sayılsın (düzenlenmiş kalıpta
// döngü yuvarlaması süreyi 60 sn'nin altına düşürüyordu).
const QUICK_SEC = 60
// Yoldaki 3 dk bitince "2 dk daha" (SONSUZ_YOL.PLAN.v1 §3.A.4): program günü 5 dk ister (lib/breath.js programProgress)
const MORE_SEC = PROGRAM_DAY_SEC - 180

// Yoldan açılan nefes ('breath-rest'): durağın basamağı (modules/breath/manifest.js breathPathStage). İlerleme yoksa
// null: ekran bugünkü gibi 5 dk ile açılır. Varsa süre basamaktan (1, 2, 3 dk; seans en az bu kadar sürer, böylece yol
// durağının 60 sn kuralı 1 dk'da da tutar), kalıp "Bugünün ritmi"nden (lib/breathMix.js); kişinin kendi kalıbı ekranda
// önce gelir (screens/Breath.jsx). Kayda stage ve (üretilen kalıp kullanıldıysa) mix yazılır. Yolun Nefes durağı bugün
// tamamsa (≥ 60 sn nefes) seans yolun durağı değildir ve bugünkü gibi 5 dk açılır.
// Ana sayfadaki göz molası önerisi ayrı rotadır ('breath-5'; screens/Home.jsx): her zaman 5 dk, basamaksız.
// day: bugünün yolu (bitiş ekranındaki günün zinciri için; Ana sayfadaki gibi "Sonra yaparım" kaydıyla, göz bütçesi ve
// abonelik kilidi olmadan: zincir yalnız durakları ve bitenleri gösterir). Kurulamazsa null (zincir çizilmez).
let dayMemo = null
function dayPlan(c) {
  try {
    const key = `${dayKeyOf(c.now)}|${c.sessions.length}|${c.tests.length}`
    if (dayMemo && dayMemo.tests === c.tests && dayMemo.sessions === c.sessions && dayMemo.key === key) return dayMemo.value
    const value = buildPath(registry.live, { ...c, later: loadLater(c.now), gate: { firstTestOnly: false } })
    dayMemo = { tests: c.tests, sessions: c.sessions, key, value }
    return value
  } catch {
    return null
  }
}
const dayKeyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
export function breathPath(ctx = {}, now = new Date()) {
  const c = pathCtx(ctx, now)
  if (!c.progression) return null
  try {
    const p = breathPathStage(c)
    if (!p || breath.today(c)?.done) return null
    const mix = p.tier === 'A' ? null : breathMixFor(c, p, { seen: safetySeen() })
    return { presetSec: p.minutes * 60, minSec: p.minutes * 60, moreSec: p.more ? MORE_SEC : null, mix, extra: { stage: p.stage.id ?? p.stage.index }, day: dayPlan(c) }
  } catch {
    return null // bozuk bağlam: bugünkü 5 dk
  }
}

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
  render: (ctx, route) => {
    const path = route === 'breath-rest' ? breathPath(ctx) : null
    return (
      <Breath
        key={route}
        sessions={ctx.sessions}
        presetSec={route === 'breath-rest' ? path?.presetSec ?? PROGRAM_DAY_SEC : route === 'breath-5' ? PROGRAM_DAY_SEC : route === 'breath-1' ? QUICK_SEC : null}
        askCalm={route !== 'breath-1'}
        minSec={route === 'breath-1' ? BREATH_DONE_SEC : path?.minSec ?? null}
        pathMix={path?.mix ?? null}
        moreSec={path?.moreSec ?? null}
        extra={path?.extra ?? null}
        day={path?.day ?? null}
        onBack={ctx.back}
        onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }}
      />
    )
  },
}
