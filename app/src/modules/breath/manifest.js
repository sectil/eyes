// Nefes pratiği: yavaş nefes kalıpları (Sakin ritim varsayılan). Yaşam halkası; günlük hedefe sayılır.
// Kanıt ve sınırlar: docs/yol-haritasi/NEFES_FARKINDALIK.md. Sağlık iddiası yok.
import { SESSION_TYPE, PATTERNS, BREATH_OPTS_KEY, BREATH_SAFETY_KEY, PROGRAM_DAY_SEC, isBreath } from '../../lib/breath.js'
import { isSameDay } from '../../lib/today.js'
import { NBSP, join, durationPart, mean } from '../../lib/format.js'
import { withinDays } from '../../lib/today.js'
import { stageOf } from '../../lib/progression.js'
import { breathOfDay, breathSafety, mixHistory, pathBreathMinutes } from '../../lib/breathMix.js'
const calmDelta = (s) => (Number.isFinite(s.calmBefore) && Number.isFinite(s.calmAfter) ? s.calmAfter - s.calmBefore : null)
const minutesOf = (list) => Math.round(list.reduce((m, s) => m + (Number.isFinite(s.seconds) ? s.seconds : 0), 0) / 60)
// "Yapıldı": en az 60 sn nefes (yol durağının tamam kuralıyla aynı; VARSAYIM)
const breathDone = (s) => isBreath(s) && s.seconds >= 60

// Sonsuz yol (SONSUZ_YOL.PLAN.v1 §3.A.4, §3.A.5): yoldaki nefesin bugünkü basamağı. ctx.progression yoksa null (yolda
// bugünkü 5 dk). Süre basamağı D ile (1 → 2 → 3 dk), kalıp katmanı Dvar ile (lib/ladders.js); dün "Zorlandım" denmişse
// bugün bir basamak kısa (lib/breathMix.js pathBreathMinutes). Yolda en çok 3 dk; mola yine 5 dk. more: yoldaki 3 dk
// bitince "2 dk daha" düğmesi (program günü 5 dk ister, lib/breath.js programProgress); kısaltılmış günde yok.
export function breathPathStage(ctx = {}) {
  const stage = stageOf(ctx, 'breath')
  if (!stage) return null
  const safety = breathSafety(ctx.sessions ?? [], ctx.now ?? new Date())
  const minutes = pathBreathMinutes(stage, safety)
  return { stage, minutes, tier: stage.variant?.tier ?? 'A', stepDown: Boolean(safety.stepDown) && minutes < stage.minutes, more: minutes === 3 }
}

// Günün kalıbı (lib/breathMix.js breathOfDay): tohum günün kendisi, geçmiş kayıtlardaki `mix` alanı, tutmanın ön koşulu
// güvenlik kartının görülmesi ve son 7 günde "Zorlandım" olmaması (§3.A.5). İlk haftada (A katmanı) Sakin ritim.
export function breathMixFor(ctx = {}, pathStage = breathPathStage(ctx), { seen = false } = {}) {
  if (!pathStage) return null
  const now = ctx.now ?? new Date()
  const sessions = ctx.sessions ?? []
  return breathOfDay(pathStage.stage, { seedDay: ctx.progression?.seedDay ?? '', history: mixHistory(sessions, now), safety: breathSafety(sessions, now, { seen }) })
}

export default {
  id: 'breath',
  // 'breath-1': nefes hatırlatmasından açılan 1 dk nefes (sakinlik puanı sorulmaz; kayıt aynı biçimde).
  // 'breath-5': Ana sayfadaki göz molası önerisi ("Nefes · 5 dk", "5 dk mola"; lib/homeSuggest.js): her zaman 5 dk, yolun
  // basamağı değil (onaylı yoga planı §B.2 kural 10: 5 dakikalık nefes Ana sayfada kalır). 'breath-rest' yalnız yolun
  // Nefes durağıdır.
  routes: ['breath', 'breath-rest', 'breath-1', 'breath-5'],
  title: 'Nefes',
  label: 'nefes pratiği',
  ring: 'life',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'calm',
    effects: [{ key: 'breath-calm', label: 'Nefes', measure: 'sakinlik', max: 5, pick: (s) => (s?.type === SESSION_TYPE ? [s.calmBefore, s.calmAfter] : null) }],
  },
  gates: {},
  storageKeys: [BREATH_OPTS_KEY, BREATH_SAFETY_KEY],
  home: { section: 'practice', order: 30 },
  sessions: {
    match: (s) => s.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      const calm = s.calmBefore != null && s.calmAfter != null ? `sakinlik ${s.calmBefore}→${s.calmAfter}` : null
      return {
        title: 'Nefes pratiği',
        detail: join([PATTERNS[s.pattern]?.title ?? null, Number.isFinite(s.cycles) ? `${s.cycles}${NBSP}döngü` : null, calm, durationPart(seconds, false)]),
      }
    },
  },
  // İlerleme (SONSUZ_YOL.PLAN.v1 §3.G.1): en az 60 sn'lik nefes kaydı o günü "yapıldı" sayar. Merdiven lib/ladders.js.
  progression: { match: breathDone },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isBreath), now)
    const d = mean(week.map(calmDelta))
    return { sessions7: week.length, minutes7: minutesOf(week), calmDelta7: d == null ? null : +d.toFixed(1) }
  },
  stats(sessions, now) {
    const week = withinDays(sessions.filter(isBreath), now)
    if (!week.length) return []
    const d = mean(week.map(calmDelta))
    return [
      { label: 'Nefes · 7 gün', value: `${minutesOf(week)}${NBSP}dk`, sub: `${week.length}${NBSP}seans` },
      { label: 'Sakinlik değişimi', value: d == null ? '—' : `${d > 0 ? '+' : ''}${d.toFixed(1)}`, sub: d == null ? null : 'seans başı, 1–5' },
    ]
  },
  // Bugünün yolunda iki bölüm arasındaki mola durağı (yol planı §3.2). Yoldan açılınca 'breath-rest' ekranı durağın
  // süresiyle başlar ve Ana sayfa 5 dk göz molasını başlatır (Home.jsx).
  //  - ctx.progression yok: her gün 5 dk (bugünkü kural, değişmez).
  //  - ctx.progression var: 1. gün 1, 2. gün 2, 3. günden 3 dk (SONSUZ_YOL.PLAN.v1 §3.A.4; onaylı yoga planı karar 5.1:
  //    yolda en çok 3 dk). Durağın `stage` alanı: { id, index, soft, minutes, tier, stepDown }.
  // VARSAYIM: bugün en az 60 sn nefes kaydı varsa tamam. Eski kural (yalnızca başlamış ya da uyku/stres
  // sinyali olan kullanıcı) kullanıcı isteğiyle kalktı: nefes yolda her gün var.
  today(ctx = {}) {
    const { sessions = [], now = new Date() } = ctx
    const done = sessions.some((s) => breathDone(s) && isSameDay(s, now))
    const stop = { title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: PROGRAM_DAY_SEC / 60, route: 'breath-rest', slot: 'rest', glyph: 'moon', done }
    const p = ctx.progression ? breathPathStage(ctx) : null
    if (!p) return stop
    const st = p.stage
    return { ...stop, minutes: p.minutes, stage: { id: st.id ?? null, index: st.index, soft: Boolean(st.soft), minutes: p.minutes, tier: p.tier, stepDown: p.stepDown } }
  },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Kanıt: nefes bildirim metinlerinin kaynakları (lib/remindTexts.js nudge.breath)
  nef: {
    name: { tr: { '': 'nefes pratiği', ABL: 'nefes pratiğinden', ACC: 'nefes pratiğini', LOC: 'nefes pratiğinde', DAT: 'nefes pratiğine', INS: 'nefes pratiğiyle', POSS: 'nefes pratiğin', 'POSS-ABL': 'nefes pratiğinden' } },
    moments: ['recallEffect', 'effectPattern', 'firstTime', 'returnAfterGap'],
    evidence: ['laborde2022', 'fincham2023'],
    note: 'Nefes pratiği: yavaş nefes kalıpları; seans öncesi ve sonrası sakinlik puanı (1–5).',
  },
}
