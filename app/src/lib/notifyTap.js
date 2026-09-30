// Bildirim dokunma sözlüğü (PLAN.v1 §5.5 madde 4). Saf: hangi ekranın açılacağını ve yan işleri (günlükte
// "dokunuldu", bilim kartı) söyler; App.jsx onNotifyTap dinleyicisinde bunu uygular (createTapHandler).
//
// | Kimlik    | extra.kind                | Açılan ekran                                             |
// | 7301      | —                         | Ana sayfa (mola kilidi kalkar)                           |
// | 7302      | —                         | İlk rapor                                                |
// | 7400–7509 | bugünkü (nudge/focus)     | bugünkü (türün ekranı + markTapped / mola)               |
// | 7600–7607 | alarm                     | uyanma işareti                                           |
// | 7800–7859 | remind / remindMerged     | modül ya da Ana sayfa (birleşik), üstte bilim kartı      |
// | 7860–7867 | nudge                     | bugünkü deney yönlendirmesi + markTapped (günü dokunulmuş sayar) |
// 7700–7701 hava, 7710–7719 yürüyüş sorusu / fark et teklifi: ekranları B2/B3'te; bu turda yönlendirme yok (VARSAYIM).
//
// actionId: yalnız dokunma (notifyApply 'tap'ı actionId'siz iletir) yönlendirir. Bildirim eylemleri (walkLater,
// detectNo, sciOpen …) bu turda hiçbir yöne götürmez (VARSAYIM: eylemlerin ekranları B2/B3 ile gelir).
import { REST_NOTIFY_ID, TRIAL_NOTIFY_ID } from './restNotify.js'
import { NUDGE_TYPES } from './reminders.js'
import { sourceOf } from './sources.js'

// Deney türünün dokununca açılan ekranı (App.jsx'ten taşındı; değer aynı)
export const TAP_ROUTE = Object.freeze({ mola: 'mola', walk: 'home', breath: 'breath-1', water: 'water', study: 'home' })
export const REMIND_IDS = Object.freeze([7800, 7859])
export const EXTRA_IDS = Object.freeze([7860, 7867])

const inRange = ([a, b], id) => Number.isInteger(id) && id >= a && id <= b
const scienceOf = (evidence) => (typeof evidence === 'string' && sourceOf(evidence) ? evidence : null)

// ev: { id, extra, actionId? } → eylem | null
//   { kind: 'rest' } · { kind: 'trial', route } · { kind: 'focus', route } · { kind: 'alarm' }
//   { kind: 'nudge', route, mark: { date, type } | null }
//   { kind: 'remind', route, science: sources.js anahtarı | null }
// routeOk(route): uygulamanın açabildiği ekran mı (App: registry.forRoute ya da 'home'); değilse Ana sayfa.
export function tapAction(ev, { routeOk = () => true } = {}) {
  if (!ev || typeof ev !== 'object') return null
  if (ev.actionId != null && ev.actionId !== 'tap') return null
  const id = Number(ev.id)
  const extra = ev.extra && typeof ev.extra === 'object' ? ev.extra : null
  if (id === REST_NOTIFY_ID) return { kind: 'rest' }
  if (id === TRIAL_NOTIFY_ID) return { kind: 'trial', route: 'first-report' }
  if (extra?.kind === 'focus') return { kind: 'focus', route: 'mola' }
  if (extra?.kind === 'alarm') return { kind: 'alarm' }
  if (extra?.kind === 'nudge') {
    // 74xx ve ek saatler (7860–7867) aynı yol: ek saate dokunmak o günü dokunulmuş sayar (§5.5 madde 1)
    const mark = NUDGE_TYPES.includes(extra.type) && extra.date ? { date: extra.date, type: extra.type } : null
    return { kind: 'nudge', route: TAP_ROUTE[extra.type] ?? 'home', mark }
  }
  if ((extra?.kind === 'remind' || extra?.kind === 'remindMerged') && inRange(REMIND_IDS, id)) {
    // Birleşik bildirim bugünkü Ana sayfayı açar (özel ekran yok); tekil hatırlatma modülün remind.route'unu
    const route = extra.kind === 'remindMerged' ? 'home' : typeof extra.route === 'string' && extra.route && routeOk(extra.route) ? extra.route : 'home'
    return { kind: 'remind', route, science: scienceOf(extra.evidence) }
  }
  return null
}

// App'in dinleyicisi. Bağımlılıklar çağrı anında okunur (App'te ref'ler):
//   go(route), onRest(), onTrial() (yoksa go), onAlarm(), mark(date, type), replan(), showScience({ evidence, route }), routeOk(route)
export function createTapHandler(deps = {}) {
  return (ev) => {
    const a = tapAction(ev, { routeOk: deps.routeOk })
    if (!a) return
    if (a.kind === 'rest') return deps.onRest?.()
    if (a.kind === 'alarm') return deps.onAlarm?.()
    if (a.kind === 'trial') return deps.onTrial ? deps.onTrial() : deps.go?.(a.route)
    if (a.kind === 'nudge') {
      if (a.mark) deps.mark?.(a.mark.date, a.mark.type)
      deps.replan?.()
      return deps.go?.(a.route)
    }
    if (a.kind === 'remind') {
      deps.go?.(a.route)
      if (a.science) deps.showScience?.({ evidence: a.science, route: a.route })
      return undefined
    }
    return deps.go?.(a.route)
  }
}
