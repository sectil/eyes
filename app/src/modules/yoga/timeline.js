// Ders dosyasının zaman çizelgesi (public/yoga/<ders>-<dk>.timeline.json; mix.py üretir) üstünde saf işlevler:
// altyazı, bölümler, klip başı, "Kapanışa geç" noktası, bırakma ön klibi, nefes formunun durumu (visualAt).
// Hepsi belirlenimci; konum (sn) motordan gelir (lessonStatus().time), duvar saatinden değil (PLAN.v3 §D.3).
//
// Çizelge alanları (okunanlar): T (sn), speech[{ clip, block, phase, start, end, screen_text, screen_equals_spoken,
// visual_state{ phase, image, dawn } }], visual[{ t, cue: 'phase:…'|'pulse'|'image:on'|'image:off'|'dawn'|'dawn:start'|'end',
// clip?, span_s? }], music_events[{ event: 'returnTone', t }].

const speech = (tl) => (Array.isArray(tl?.speech) ? tl.speech : [])
const visual = (tl) => (Array.isArray(tl?.visual) ? tl.visual : [])
export const durationOf = (tl) => (Number.isFinite(tl?.T) ? tl.T : null)
const isBridge = (block) => typeof block === 'string' && block.startsWith('BR.')

// O an söylenen parça (start ≤ t < end) ya da null
export function speechAt(tl, t) {
  return speech(tl).find((s) => t >= s.start && t < s.end) ?? null
}

// Altyazı: o anki cümle (ekrandaki cümle söylenen cümledir; screen_equals_spoken). Cümle bittikten sonra kısa bir süre
// (linger sn) ekranda kalır, sonra kaybolur; sessizlikte yazı yok.
export function captionAt(tl, t, linger = 0.8) {
  const s = speech(tl).find((x) => t >= x.start && t < x.end + linger)
  if (!s || s.screen_equals_spoken === false) return null
  return typeof s.screen_text === 'string' && s.screen_text ? s.screen_text : null
}

// Klibin (bir klip birden çok parçaya bölünebilir: a.hosgeldin#1, #2) ilk parçasının başı
function clipFirstStart(tl, clip) {
  return speech(tl).find((s) => s.clip === clip)?.start ?? null
}

// Duraklatılan ders o anki klibin başından sürer (modul.md §4). Sessizlikteyse bulunduğu yerden.
export function clipStartAt(tl, t) {
  const s = speechAt(tl, t)
  return s ? clipFirstStart(tl, s.clip) ?? s.start : t
}

// Bir klip başına oturmak için motorun başlayacağı yer: geçiş (1–2 sn) ilk heceyi yutmasın diye klipten biraz önce,
// ama önceki cümlenin içine düşmeden (VARSAYIM 1,2 sn).
export const LEAD_SEC = 1.2
export function seekPoint(tl, at) {
  if (!(at > 0)) return 0
  const prev = speech(tl).filter((s) => s.end <= at).at(-1)
  return Math.max(0, prev ? prev.end + 0.2 : 0, at - LEAD_SEC)
}

// Sürdürme noktası: klip başı (klipteyse) → seekPoint
export const resumePoint = (tl, t) => {
  const s = speechAt(tl, t)
  return s ? seekPoint(tl, clipStartAt(tl, t)) : t
}

// Yerel oynatıcının sürdürme aralıkları (lessonMeta resume; AlarmPlugin LessonPlayer.resumePoint): her konuşma parçası
// için [start, end) → o klibin sürdürme noktası. Kilit ekranından ya da kesintiden sürdürme de klibin başına oturur;
// resumePoint ile birebir aynı sonucu verir (sessizlikte aralık yok: kaldığı yerden).
export function resumeSpans(tl) {
  return speech(tl)
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
    .map((s) => ({ from: s.start, to: s.end, at: seekPoint(tl, clipFirstStart(tl, s.clip) ?? s.start) }))
}

// Klip başları (sarma en yakın klip başına oturur)
export function clipStarts(tl) {
  const seen = new Set()
  const out = []
  for (const s of speech(tl)) {
    if (seen.has(s.clip)) continue
    seen.add(s.clip)
    out.push(s.start)
  }
  return out
}
export function nearestClipStart(tl, t) {
  const starts = clipStarts(tl)
  if (!starts.length) return t
  return starts.reduce((best, x) => (Math.abs(x - t) < Math.abs(best - t) ? x : best), starts[0])
}

// Bölümler: çizelgedeki blok sırası (BR.* köprüleri öndeki bölüme sayılır). İlk bölüm 0'dan başlar.
// → [{ id, at }] (at: bölüme atlarken motorun başlayacağı yer)
export function sectionsOfTimeline(tl) {
  const out = []
  for (const s of speech(tl)) {
    if (isBridge(s.block) || out.some((x) => x.id === s.block)) continue
    out.push({ id: s.block, start: s.start })
  }
  return out.map((x, i) => ({ id: x.id, at: i === 0 ? 0 : seekPoint(tl, x.start) }))
}
// Sarma hedefi: bir bölümün başına yakın bırakılırsa (±%1,5, en az 6 sn) o bölümün başı (bölüme atlama); değilse en
// yakın klip başı (modul.md §4 "Sarma / bölüme atlama")
export function seekTarget(tl, sections = [], t) {
  const T = durationOf(tl) ?? 0
  const snap = Math.max(6, T * 0.015)
  const sec = sections.find((s) => Math.abs(t - s.at) <= snap)
  return sec ? sec.at : seekPoint(tl, nearestClipStart(tl, t))
}
// Sarma kapanışı kısaltamaz (modul.md §10.1 "kesilmeyen kapanış"; PLAN.v3 §D.3, §D.6): kapanıştan önceden kapanışın
// içine sarılırsa hedef kapanışın başıdır ("Kapanışa geç" ile aynı nokta). Kapanışın içinden ileri sarılamaz: hedef
// bulunduğu yerdir (iki sarmayla dışa dönüş atlanamaz). Geri sarma serbest.
export function guardClosing(target, from, closeAt) {
  if (!Number.isFinite(closeAt) || !(target > closeAt)) return target
  if (!(from >= closeAt)) return closeAt
  return target > from ? from : target
}
export function sectionAt(sections = [], t) {
  let cur = sections[0]?.id ?? null
  for (const s of sections) if (t >= s.at) cur = s.id
  return cur
}

// "Kapanışa geç" noktası: Kapanış'ın başı, dönüş tınısından önceki sessizlik (tınıdan 2 sn önce; PLAN.v3 §D.3).
// Tını yoksa kapanış evresinin ilk sözünden 4 sn önce; kapanış evresi yoksa (uyku dersi) K bloğunun başı.
// Önceki cümlenin içine düşmez. Çizelge yoksa null.
export function closingAt(tl) {
  const sp = speech(tl)
  if (!sp.length) return null
  const tone = (Array.isArray(tl?.music_events) ? tl.music_events : []).find((e) => e?.event === 'returnTone' && Number.isFinite(e.t))
  const firstClosing = sp.find((s) => s.phase === 'Kapanış') ?? sp.find((s) => s.block === 'K')
  if (!firstClosing && !tone) return null
  const target = tone ? tone.t - 2 : firstClosing.start - (firstClosing.phase === 'Kapanış' ? 4 : 2)
  const prev = sp.filter((s) => s.end <= target).at(-1)
  return Math.max(0, prev ? prev.end + 0.2 : 0, target)
}

// İmge pencereleri ve bırakma ön klibi: image:on → image:off; image:off'u taşıyan klip bırakma klibidir (ör. c4.solma)
export function imageWindows(tl) {
  const v = visual(tl)
  const sp = speech(tl)
  const out = []
  let on = null
  for (const e of v) {
    if (e.cue === 'image:on') on = e.t
    if (e.cue === 'image:off' && on != null) {
      const pieces = sp.filter((s) => s.clip === e.clip)
      const release = pieces.length ? { start: pieces[0].start, end: pieces.at(-1).end } : null
      out.push({ on, off: e.t, release })
      on = null
    }
  }
  return out
}

// Atlama planı (Kapanışa geç, sarma, bölüme atlama): imge bloğunun içinden dışarı çıkılıyorsa önce bırakma klibi çalar,
// sonra hedefe geçilir (modul.md §4). → [{ at, until? }]: her adım `at`'ten çalar; `until` varsa konum oraya varınca
// sonraki adıma geçilir.
export function jumpPlan(tl, from, target) {
  const w = imageWindows(tl).find((x) => from >= x.on && from < x.off)
  const inside = (t) => w && t >= w.on && t < (w.release?.end ?? w.off)
  if (w?.release && !inside(target)) {
    return [{ at: seekPoint(tl, w.release.start), until: w.release.end + 1 }, { at: target }]
  }
  return [{ at: target }]
}

// ---- Nefes formu (modul.md §3; PLAN.v2 §E.2) ----
// Evre ışığı: Varış en aydınlık, Derinleşme daha loş, Derin en loş; gündüz kapanışında "şafak" rampası (≥ 60 sn;
// 3 dk'da 45 sn). Nefes ipucu (pulse) yalnız flashSafe === true ve Hareketi Azalt kapalıyken formu büyütür; aksi hâlde
// form ölçeklenmez, yalnız opaklığı çok yavaş değişir. Yanıp sönme yok: en hızlı değişim birkaç saniyeye yayılır.
export const PHASE_LIGHT = { varis: 1, derinlesme: 0.8, derin: 0.62, kapanis: 0.8 }
export const DRIFT_PERIOD = 24 // sn (≥ 20 sn periyotlu ışık kayması)
const PULSE_RISE = 2.5
const PULSE_FALL = 3.5
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x)) // yumuşak rampa (0→1)

export const PHASE_RAMP = 8 // sn: evre ışığı bir evreden ötekine bu sürede kayar (ani geçiş yok)
export function visualAt(tl, t, { reduceMotion = false, flashSafe = null, night = false } = {}) {
  const v = visual(tl).filter((e) => Number.isFinite(e?.t))
  const sp = speech(tl)
  const T = durationOf(tl)
  // Evre: son başlamış konuşma parçasının visual_state'i (sessizlikte de o evre sürer)
  let phase = 'varis'
  let prevPhase = 'varis'
  let changeT = -Infinity
  for (const s of sp) {
    if (s.start > t) break
    const ph = s.visual_state?.phase
    if (ph && ph !== phase) {
      prevPhase = phase
      phase = ph
      changeT = s.start
    }
  }
  let image = false
  let dawnStart = null
  let dawnSpan = 60
  for (const e of v) {
    if (e.t > t) break
    if (e.cue === 'image:on') image = true
    if (e.cue === 'image:off') image = false
    if (e.cue === 'dawn:start') {
      dawnStart = e.t
      dawnSpan = Math.max(Number(e.span_s) || 60, 45)
    }
  }
  const light = (ph) => PHASE_LIGHT[ph] ?? 0.8
  let lum = light(prevPhase) + (light(phase) - light(prevPhase)) * ease((t - changeT) / PHASE_RAMP)
  const dawn = !night && dawnStart != null && t >= dawnStart ? ease((t - dawnStart) / dawnSpan) : 0
  lum += (1 - lum) * dawn
  // Çok yavaş ışık kayması (±%4, 24 sn); nefes değildir
  lum *= 1 + 0.04 * Math.sin((2 * Math.PI * t) / DRIFT_PERIOD)
  // Son sözden sonra karanlık: dosyanın sonuna doğru söner
  const lastEnd = sp.at(-1)?.end ?? null
  const end = v.some((e) => e.cue === 'end' && e.t <= t) && lastEnd != null && t >= lastEnd
  if (end && T != null) lum *= 1 - ease((t - lastEnd) / Math.max(1, T - lastEnd))
  // Gece dersi: uyku izninden sonra form kehribar bir köze dönüp söner (closingAt'ten sonra)
  const close = night ? closingAt(tl) : null
  const ember = night && close != null && t >= close
  if (ember && T != null) lum *= 1 - ease((t - close) / Math.max(1, T - close))
  // Nabız: yalnız söylenen nefes sayımına kilitli (pulse) ve yalnız izin varken
  let scale = 1
  if (flashSafe === true && !reduceMotion) {
    const p = v.filter((e) => e.cue === 'pulse' && e.t <= t).at(-1)
    if (p) {
      const dt = t - p.t
      const bump = dt < PULSE_RISE ? ease(dt / PULSE_RISE) : dt < PULSE_RISE + PULSE_FALL ? 1 - ease((dt - PULSE_RISE) / PULSE_FALL) : 0
      scale = 1 + 0.06 * bump
    }
  }
  return { phase, luminance: +clamp01(lum).toFixed(4), scale: +scale.toFixed(4), image, dawn: dawn > 0, ember, end }
}

// Timeline dosyasını yükler (uygulama paketinden; web'e yüklenmez). Hata olursa null: oynatıcı çizelgesiz de çalar.
export async function loadTimeline(path, fetcher = globalThis.fetch) {
  try {
    const r = await fetcher(path)
    if (!r?.ok) return null
    const j = await r.json()
    return Array.isArray(j?.speech) ? j : null
  } catch {
    return null
  }
}
