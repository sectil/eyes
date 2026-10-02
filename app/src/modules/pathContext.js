// Yoldan açılan modül ekranlarının ilerleme bağlamı (SONSUZ_YOL.PLAN.v1 §3.A.2, §3.G.1). Ekran, yoldaki durağın
// basamağını yeniden hesaplar (onaylı yoga planındaki gibi: modules/yoga/view.jsx pathMinutesFor). Sayaçlar kayıtlardan
// türer ve bugünü saymaz; bu yüzden aynı kayıtlarla Ana sayfadaki durakla aynı basamak çıkar.
//   ctx.progression App'ten gelirse o kullanılır (null: ilerleme kapalı, ekran bugünkü gibi açılır);
//   gelmezse lib/progression.js progressionCtx ile kayıt defterinin canlı listesinden kurulur.
// Önbellek: App göz bütçesini saniyede bir yenileyip ekranı yeniden çizer (egzersiz sırasında); kayıt dizileri, gün ve
// modül listesi aynıysa bağlam yeniden hesaplanmaz (progressionCtx bütün kayıtları × modülleri tarar).
import { progressionCtx } from '../lib/progression.js'
import { dayKey } from '../lib/calendar.js'
import { registry } from './registry.js'

let memo = null

export function pathCtx(ctx = {}, now = new Date()) {
  const base = { tests: ctx.tests ?? [], sessions: ctx.sessions ?? [], now, profile: ctx.settings?.profile }
  if (ctx.progression !== undefined) return { ...base, progression: ctx.progression }
  try {
    const day = dayKey(now)
    const mods = registry.live
    if (memo && memo.tests === ctx.tests && memo.sessions === ctx.sessions && memo.day === day && memo.mods === mods) return { ...base, progression: memo.value }
    const value = progressionCtx({ tests: base.tests, sessions: base.sessions, now, modules: mods })
    memo = { tests: ctx.tests, sessions: ctx.sessions, day, mods, value }
    return { ...base, progression: value }
  } catch {
    return { ...base, progression: null } // bozuk bağlam ekranı düşürmez: bugünkü içerik
  }
}
