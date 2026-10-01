// Ders dosyasının zaman çizelgesi (public/yoga/<ders>-<dk>.timeline.json) üstünde saf işlevler: altyazı, bölümler,
// klip başı, "Kapanışa geç" noktası, bırakma klibi, nefes formunun durumu (visualAt).
// Hepsi belirlenimci; konum (sn) motordan gelir (lessonStatus().time), duvar saatinden değil (PLAN.v3 §D.3).
//
// İki biçim okunur:
//  - pilot biçimi (mix.py; eski Ders 2 · 15): T, speech[{ clip, block, phase, start, end, screen_text,
//    screen_equals_spoken, visual_state{ phase, image, dawn } }], visual[{ t, cue: 'phase:…'|'pulse'|'image:on'|
//    'image:off'|'dawn'|'dawn:start'|'end', clip?, span_s? }], music_events[{ event: 'returnTone', t }].
//  - "nefona.yoga.timeline/2" (render/tools/mixib.py; SPEC.v3 §11): yukarıdakilerin hepsi (konuşma alanları hem
//    screen_text hem screenText biçiminde) ve ayrıca closing{ jumpTo, returnToneAt, firstWordAt }, release{ blok:
//    { activeFrom, activeUntil } }, windows[{ announce, start, end, welcome }], blocks[], speech[].resumeAt.
//    Evre adları açıklamalı olabilir ('derin (kor)', 'varis (ışık noktası geniş ve soluk)'): ilk sözcük okunur.
//    Görsel ipuçları: Ders 1 'ring:…' (breath{ in, topUp?, out, count, silent? }), Ders 3 'kor: …' sayım ipuçları
//    (breath{ count }), 'kor kehribara döner', 'kor söner, ekran siyah'; Ders 5 ve Ders 2 · 20 'window'.
//    Tanınmayan ipucu (ör. yalnız açıklama taşıyan satır) yok sayılır; bilinmeyen alan da (SPEC.v3 §11).

const speech = (tl) => (Array.isArray(tl?.speech) ? tl.speech : [])
const visual = (tl) => (Array.isArray(tl?.visual) ? tl.visual : [])
export const durationOf = (tl) => (Number.isFinite(tl?.T) ? tl.T : null)
const isBridge = (block) => typeof block === 'string' && block.startsWith('BR.')
export const isV2 = (tl) => typeof tl?.schema === 'string' && tl.schema.startsWith('nefona.yoga.timeline/')

// Parçanın ekran metni ve "ekrandaki = söylenen" bayrağı (iki biçimde de)
const screenOf = (s) => {
  const x = s?.screen_text ?? s?.screenText
  return typeof x === 'string' && x ? x : null
}
const sameAsSpoken = (s) => {
  if (typeof s?.screen_equals_spoken === 'boolean') return s.screen_equals_spoken
  const spoken = s?.spoken_text ?? s?.spokenText
  return screenOf(s) != null && screenOf(s) === spoken
}
const stateOf = (s) => s?.visual_state ?? s?.visualState ?? null

// Evre adı → PHASE_LIGHT anahtarı: ilk sözcük, küçük harf, Türkçe harfler sadeleşir ('Varış' → 'varis',
// 'derin (kor)' → 'derin', 'kapanis(şafak)' → 'kapanis'). Ad yoksa null.
const TR_PLAIN = { ı: 'i', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u' }
export function phaseKey(name) {
  if (typeof name !== 'string') return null
  const word = name.trim().split(/[\s(:;,]/)[0].toLocaleLowerCase('tr')
  const key = word.replace(/[ışğüöçâîû]/g, (c) => TR_PLAIN[c]).replace(/[^a-z]/g, '')
  return key || null
}

// O an söylenen parça (start ≤ t < end) ya da null
export function speechAt(tl, t) {
  return speech(tl).find((s) => t >= s.start && t < s.end) ?? null
}

// Altyazının parçası (sıra no): o an söylenen parça; sessizlikteyse az önce biten parça (linger sn kalır). Söylenen
// parça önce gelir: Ders 1'in sayımında ("Al… iki… üç…") parçalar 1 sn arayla gelir, bir önceki sayı yenisinin üstünde
// kalmamalı. Yoksa -1.
function captionIndex(tl, t, linger) {
  const sp = speech(tl)
  const now = sp.findIndex((x) => t >= x.start && t < x.end)
  if (now >= 0) return now
  for (let i = sp.length - 1; i >= 0; i--) {
    if (sp[i].end <= t) return t < sp[i].end + linger ? i : -1
  }
  return -1
}

// Altyazı: o anki cümle (ekrandaki cümle söylenen cümledir; screen_equals_spoken). Cümle bittikten sonra kısa bir süre
// (linger sn) ekranda kalır, sonra kaybolur; sessizlikte yazı yok.
export function captionAt(tl, t, linger = 0.8) {
  const s = speech(tl)[captionIndex(tl, t, linger)]
  if (!s || !sameAsSpoken(s)) return null
  return screenOf(s)
}

// Altyazı açıkken o anki cümlenin bir öncekisi (sönük yazılır; kapı turu 2: "'Hissetmesen de her adı…' tek başına
// okununca 'hangi ad?'"): yalnız aynı bölümde (blok) ve araları kısaysa (≤ gap sn). Ekrandaki her cümle söylenmiş bir
// cümledir (screen_equals_spoken). Yoksa null.
export function captionBefore(tl, t, gap = 8, linger = 0.8) {
  const sp = speech(tl)
  const i = captionIndex(tl, t, linger)
  if (i < 1) return null
  const cur = sp[i]
  const prev = sp[i - 1]
  if (!prev || prev.block !== cur.block || cur.start - prev.end > gap || !sameAsSpoken(prev)) return null
  return screenOf(prev)
}

// Karşılama cümlesi: altyazı kapalıyken de dersin ilk klibi (Ders 2: "Hoş geldin." · "Bu dakikalar senin.") yazılır;
// sonrası yalnız altyazı açıkken (5 saniye turu, oynatıcının ilk 5 saniyesi: "yalnız 'Karşılama' var, çalışıyor mu?").
// Ekrandaki cümle yine söylenen cümledir (captionAt).
export function welcomeCaption(tl, t) {
  const first = speech(tl)[0]
  if (!first) return null
  const cur = speech(tl)[captionIndex(tl, t, 0.8)]
  return cur && cur.clip === first.clip ? captionAt(tl, t) : null
}

// Bölümlerin süreleri (sn): bölüm şeridi süreyle orantılı çizilir (ayrıntı ve bitiş). Çizelge yoksa null.
export function sectionSpans(tl) {
  const T = durationOf(tl)
  const secs = sectionsOfTimeline(tl)
  if (!T || !secs.length) return null
  return Object.fromEntries(secs.map((s, i) => [s.id, Math.max(1, (secs[i + 1]?.at ?? T) - s.at)]))
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

// "Kapanışa geç" noktası. Aynı nokta sarma korumasının (guardClosing) sınırı ve "kapanışa ulaştı" ölçütüdür
// (session.js reachedClosing, yogaRecord.js recordFromJournal).
//  - timeline/2: dosyanın kendi hedefi, closing.jumpTo (mixib.py: dersin hızlı kapanış dizisinin ilk klibinden ya da
//    onun dönüş tınısından 6 sn önce, önceki cümlenin bitişinden en az 0,5 sn sonra). Bu dosyalarda pencere dönüşleri de
//    returnTone olayıdır (Ders 5 · 15'te beş tını, Ders 2 · 20'de iki): ilk tını kapanış değildir. Ancak kapanış evresinin
//    ilk klibinden önceki son tını jumpTo'dan önceyse (Ders 2 · 5/15/20'de jumpTo k.donus'tan sonra; mixib.py
//    closing_event) kapanış = max(önceki konuşmanın bitişi + 0,2, tını − 2): dönüş tınısı ve cümlesi atlanmaz.
//  - pilot biçimi: Kapanış'ın başı, dönüş tınısından önceki sessizlik (tınıdan 2 sn önce; PLAN.v3 §D.3). Tını yoksa
//    kapanış evresinin ilk sözünden 4 sn önce; kapanış evresi yoksa (uyku dersi) K bloğunun başı.
// Önceki cümlenin içine düşmez. Çizelge yoksa null.
export function closingAt(tl) {
  const sp = speech(tl)
  if (!sp.length) return null
  const tones = (Array.isArray(tl?.music_events) ? tl.music_events : []).filter((e) => e?.event === 'returnTone' && Number.isFinite(e.t))
  const firstClosing = sp.find((s) => s.phase === 'Kapanış') ?? sp.find((s) => s.block === 'K')
  let jump = tl?.closing?.jumpTo
  if (Number.isFinite(jump)) {
    // Dönüş tınısı jumpTo'dan önceyse (Ders 2 · 5/15/20: mixib.py jumpTo'yu k.donus klibinden sonraya koymuş) kapanış
    // tınıdan önceki sessizliktir (SPEC.v3 §11; PLAN.v3 §D.3): tını ve "Artık dönüş zamanı." atlanmaz.
    // Kapanışın kendi tınısı: ilk kapanış klibinden önceki son tını (pencere dönüş tınıları değil; Ders 5 · 15)
    const tone = firstClosing ? tones.filter((e) => e.t <= firstClosing.start).at(-1) : null
    if (tone && tone.t < jump && (tone.before_clip == null || tone.before_clip === firstClosing.clip)) {
      const prev = sp.filter((s) => s.start < tone.t).reduce((a, s) => (a && a.end >= s.end ? a : s), null)
      jump = Math.max(prev ? prev.end + 0.2 : 0, tone.t - 2)
    }
    // Bozuk bir değer cümlenin ortasına düşmesin: o cümlenin bitişinden sonraya kayar
    const inside = sp.find((s) => jump >= s.start && jump < s.end)
    return Math.min(durationOf(tl) ?? Infinity, Math.max(0, inside ? inside.end + 0.2 : jump))
  }
  const tone = tones[0]
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

// Bir klibin bütün parçalarının aralığı ({ start, end }) ya da null
function clipSpan(tl, clip) {
  const pieces = speech(tl).filter((s) => s.clip === clip)
  return pieces.length ? { start: pieces[0].start, end: pieces.at(-1).end } : null
}

// Bırakma pencereleri: { on, off, release{ start, end } } — içinden dışarı çıkılırken önce bırakma klibi çalar.
//  - timeline/2: release{ blok: { activeFrom, activeUntil } } (imge C4 ve zor blok C3 · zıtlık); bırakma klibi
//    activeUntil'de başlayan klip (c4.solma, c3.birak). SPEC'teki ayrı ön klip dosyaları (prefixFile) pakette yok; klip
//    dosyanın içinden çalar.
//  - pilot biçimi (ya da release boşsa): imageWindows.
export function releaseWindows(tl) {
  const rel = tl?.release && typeof tl.release === 'object' ? Object.values(tl.release) : []
  const out = []
  for (const r of rel) {
    if (!Number.isFinite(r?.activeFrom) || !Number.isFinite(r?.activeUntil)) continue
    const first = speech(tl).find((s) => Math.abs(s.start - r.activeUntil) < 0.05)
    out.push({ on: r.activeFrom, off: r.activeUntil, release: first ? clipSpan(tl, first.clip) : null })
  }
  return out.length ? out.sort((a, b) => a.on - b.on) : imageWindows(tl)
}

// Duyurulmuş sessizlik pencereleri (timeline/2 windows; Ders 5 · 15, Ders 2 · 20): { start, end, back{ start, end } }.
// back: pencerenin dönüşü, dönüş tınısından (varsa) karşılama klibinin sonuna kadar.
export function silenceWindows(tl) {
  const ws = Array.isArray(tl?.windows) ? tl.windows : []
  const tones = (Array.isArray(tl?.music_events) ? tl.music_events : []).filter((e) => e?.event === 'returnTone' && Number.isFinite(e.t))
  const out = []
  for (const w of ws) {
    if (!Number.isFinite(w?.start) || !Number.isFinite(w?.end)) continue
    const welcome = clipSpan(tl, w.welcome)
    if (!welcome) continue
    const tone = tones.find((e) => e.before_clip === w.welcome && e.t <= welcome.start && e.t >= w.start)
    out.push({ start: w.start, end: w.end, back: { start: tone ? tone.t : welcome.start, end: welcome.end } })
  }
  return out
}

// Atlama planı (Kapanışa geç, sarma, bölüme atlama) (modul.md §4). → [{ at, until? }]: her adım `at`'ten çalar; `until`
// varsa konum oraya varınca sonraki adıma geçilir.
//  - imge ya da zor bloğun içinden dışarı çıkılıyorsa önce o bloğun bırakma klibi çalar, sonra hedefe geçilir;
//  - "Kapanışa geç" (hedef closingAt) duyurulmuş bir pencerenin sessizliğinden basılırsa önce dönüş tınısı ve karşılama
//    klibi çalar (modul.md §4 tablo "Kapanışa geç"); sarmada pencere dönüşü yoktur.
export function jumpPlan(tl, from, target) {
  const steps = []
  const closing = target === closingAt(tl)
  const quiet = closing ? silenceWindows(tl).find((x) => from >= x.start && from < x.back.start) : null
  if (quiet && !(target >= quiet.back.start && target < quiet.back.end)) {
    steps.push({ at: seekPoint(tl, quiet.back.start), until: quiet.back.end + 1 })
  }
  const w = releaseWindows(tl).find((x) => from >= x.on && from < x.off)
  const inside = (t) => w && t >= w.on && t < (w.release?.end ?? w.off)
  if (w?.release && !inside(target)) {
    steps.push({ at: seekPoint(tl, w.release.start), until: w.release.end + 1 })
  }
  steps.push({ at: target })
  return steps
}

// ---- Nefes formu (modul.md §3; PLAN.v2 §E.2) ----
// Evre ışığı: Varış en aydınlık, Derinleşme daha loş, Derin en loş; gündüz kapanışında "şafak" rampası (≥ 60 sn;
// 3 dk'da 45 sn). Nefes ipucu (sayımda pulse, Ders 1'de halka, Ders 3'te korun sayımla kararması) yalnız
// flashSafe === true ve Hareketi Azalt kapalıyken formu değiştirir; aksi hâlde form ölçeklenmez, yalnız opaklığı çok
// yavaş değişir. Yanıp sönme yok: en hızlı değişim birkaç saniyeye yayılır.
export const PHASE_LIGHT = { varis: 1, derinlesme: 0.8, derin: 0.62, kapanis: 0.8 }
export const DRIFT_PERIOD = 24 // sn (≥ 20 sn periyotlu ışık kayması)
const PULSE_RISE = 2.5
const PULSE_FALL = 3.5
export const PULSE_GROW = 0.06 // nabız (sayım): form en çok %6 büyür
export const RING_GROW = 0.1 // Ders 1 halkası alışta en çok %10 genişler (VARSAYIM; "genişleyen halka", modul.md §3)
export const COUNT_DIM = 0.12 // Ders 3 sayımı: kor her sayıda en çok %12 kararır, sonra geri gelir (VARSAYIM)
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x)) // yumuşak rampa (0→1)
const cueOf = (e) => (typeof e?.cue === 'string' ? e.cue : '')
const isRing = (e) => cueOf(e).startsWith('ring:')
// Sayım ipucu: Ders 2 'pulse' (form büyür), Ders 3 'kor: sayıyla bir soluk kararır' (kor kararır; ders3.lesson.json
// visual.pulse.counting). İkisi de söylenen sayıya kilitli ve yalnız izin varken.
const isPulse = (e) => cueOf(e) === 'pulse'
const isCountDim = (e) => cueOf(e).startsWith('kor') && Number.isFinite(e?.breath?.count)
// Gece dersinin kor ipuçları (timeline/2): kehribara dönüş ve sönüş
const isEmberOn = (e) => cueOf(e).startsWith('kor') && cueOf(e).includes('kehribar')
const isEmberOut = (e) => cueOf(e).startsWith('kor') && cueOf(e).includes('söner')

// Nabız eğrisi: 2,5 sn'de yükselir, 3,5 sn'de iner (0→1→0)
const bumpAt = (dt) => (dt < 0 ? 0 : dt < PULSE_RISE ? ease(dt / PULSE_RISE) : dt < PULSE_RISE + PULSE_FALL ? 1 - ease((dt - PULSE_RISE) / PULSE_FALL) : 0)

// Ders 1'in halkası (ders1.lesson.json visual.breathLock): halka yalnız söylenen nefes ipuçlarına kilitlenir. "Al…"
// (ring:in, breath{ in, topUp?, out }) ile `in` sn'de büyür, varsa "biraz daha…" ile topUp sn'de tamamlanır, "ver…" ile
// `out` sn'de küçülür. Sessiz döngü ipucu (breath.silent) cümleden sonra count döngü boyunca aynı ritmi sürdürür: son
// söylenen alıştan period (in + topUp + out) sonra başlar. İpucu yoksa halka nefes almaz.
// → [{ at, in, topUp, out, silent }] (alış başları, sıralı)
const CYCLES = new WeakMap()
export function breathCycles(tl) {
  if (tl && typeof tl === 'object' && CYCLES.has(tl)) return CYCLES.get(tl)
  const out = []
  let last = null
  for (const e of visual(tl)) {
    if (!isRing(e) || !Number.isFinite(e?.t) || !e.breath) continue
    const b = e.breath
    const cyc = { in: Number(b.in), topUp: Number(b.topUp) > 0 ? Number(b.topUp) : 0, out: Number(b.out) }
    if (!(cyc.in > 0) || !(cyc.out > 0)) continue
    const period = cyc.in + cyc.topUp + cyc.out
    if (b.silent) {
      if (!last) continue
      const n = Math.max(1, Math.round(Number(b.count) || 1))
      for (let k = 1; k <= n; k++) out.push({ at: +(last.at + k * last.period).toFixed(3), ...cyc, silent: true })
      continue
    }
    last = { at: e.t, period }
    out.push({ at: e.t, ...cyc, silent: false })
  }
  out.sort((a, b) => a.at - b.at)
  if (tl && typeof tl === 'object') CYCLES.set(tl, out)
  return out
}
// Halkanın o anki açıklığı (0 dinlenme · 1 alışın sonu); ipucu yoksa 0
export function breathAt(tl, t) {
  const c = breathCycles(tl).filter((x) => x.at <= t).at(-1)
  if (!c) return 0
  const d = t - c.at
  const a = c.topUp > 0 ? c.in / (c.in + c.topUp) : 1 // "biraz daha…" payı
  if (d < c.in) return a * ease(d / c.in)
  if (d < c.in + c.topUp) return a + (1 - a) * ease((d - c.in) / c.topUp)
  const o = d - c.in - c.topUp
  return o < c.out ? 1 - ease(o / c.out) : 0
}

// Gece dersinde korun kehribara dönüşü: 'kor kehribara döner' ipucu, yoksa "Kapanışa geç" noktası (uyku izni)
export function emberAt(tl) {
  const e = visual(tl).find((x) => isEmberOn(x) && Number.isFinite(x.t))
  return e ? e.t : closingAt(tl)
}

export const PHASE_RAMP = 8 // sn: evre ışığı bir evreden ötekine bu sürede kayar (ani geçiş yok)
export function visualAt(tl, t, { reduceMotion = false, flashSafe = null, night = false } = {}) {
  const v = visual(tl).filter((e) => Number.isFinite(e?.t))
  const sp = speech(tl)
  const T = durationOf(tl)
  // Evre: son başlamış konuşma parçasının visual_state'i (sessizlikte de o evre sürer); açıklamalı ad ilk sözcüğüne iner
  let phase = 'varis'
  let prevPhase = 'varis'
  let changeT = -Infinity
  for (const s of sp) {
    if (s.start > t) break
    const ph = phaseKey(stateOf(s)?.phase)
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
  // Gece dersi: uyku izninden sonra form kehribar bir köze dönüp söner. Başlangıç 'kor kehribara döner' ipucu (yoksa
  // closingAt); sönüş 'kor söner, ekran siyah' ipucunda tamamlanır (yoksa dosyanın sonunda).
  const close = night ? emberAt(tl) : null
  const ember = night && close != null && t >= close
  if (ember && T != null) {
    const out = v.find((e) => isEmberOut(e) && e.t > close)?.t ?? T
    lum *= 1 - ease((t - close) / Math.max(1, out - close))
  }
  // Nabız ve halka: yalnız söylenen nefes ipuçlarına kilitli ve yalnız izin varken (nöbet cevabı "Hayır", Hareketi
  // Azalt kapalı). İzin yoksa form ölçeklenmez, ışığı sayımla değişmez.
  const allowed = flashSafe === true && !reduceMotion
  const breath = breathAt(tl, t)
  let scale = 1
  if (allowed) {
    const p = v.filter((e) => isPulse(e) && e.t <= t).at(-1)
    if (p) scale += PULSE_GROW * bumpAt(t - p.t)
    scale += RING_GROW * breath
    const c = v.filter((e) => isCountDim(e) && e.t <= t).at(-1)
    if (c) lum *= 1 - COUNT_DIM * bumpAt(t - c.t)
  }
  return { phase, luminance: +clamp01(lum).toFixed(4), scale: +scale.toFixed(4), image, dawn: dawn > 0, ember, end, breath: +breath.toFixed(4) }
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

// Aynı dosya bir kez okunur (ayrıntının bölüm şeridi, oynatıcı, bitişin dolu şeridi). Okunamayan dosya önbelleğe
// girmez (sonra yeniden denenir).
const TL_CACHE = new Map()
export const cachedTimeline = (path) => TL_CACHE.get(path) ?? null
export async function loadTimelineCached(path, fetcher = globalThis.fetch) {
  if (!path) return null
  if (TL_CACHE.has(path)) return TL_CACHE.get(path)
  const tl = await loadTimeline(path, fetcher)
  if (tl) TL_CACHE.set(path, tl)
  return tl
}
