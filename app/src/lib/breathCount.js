// Nefes sayma ölçümü — Levinson 2014'ün kısaltılmış uyarlaması (Front Psychol, DOI 10.3389/fpsyg.2014.01202).
// Protokol (tam metinden): nefesler 1'den 9'a sayılır; 1–8'de bir tuşa, 9'da başka tuşa basılır. Sayı
// kaybedilirse "kaybettim" tuşu → birden başlanır. ~90 sn'de bir (60–120) "az önce dikkatin neredeydi?"
// sorgusu (1 = tamamen nefeste … 6 = tamamen başka yerde), ardından sayı sorgusu.
// Doğruluk = 100 − (yanlış 9'lar + yanlış sayı cevapları + kaybettim) / (9'lar + sayı cevapları + kaybettim).
// Hata türü bilgi taşır (Wong 2018, DOI 10.1007/s12671-017-0880-1): fark edilmeden kaçırılan sayım
// dikkat kopması, kişinin yakaladığı hata zihin gezinmesi. Dokunuş zamanlamasındaki düzensizlik dikkat
// kopmasını öngörür (Treves 2026, DOI 10.3758/s13415-026-01467-5).
// VARSAYIM: orijinal 15–18 dk; burada 3 dk (ilk hafta) / 5 dk. Kısaltma güvenirliği düşürebilir; tek
// seansa karar bağlanmaz, haftalık trend izlenir (görme testindeki alışma/başlangıç mantığı).
// Saf fonksiyonlar; React ve depolama yok.

export const BC_VERSION = 1
export const SET_SIZE = 9
export const SESSION_TYPE = 'breath-count'
export const DURATIONS_SEC = { short: 180, standard: 300 }
export const INTRO_SESSIONS = 3 // ilk 3 seans kısa süre ve "alışma dönemi"
export const BASELINE_SESSIONS = 7 // sonraki 7 seansın ortancası referans
export const PROBE_GAP_MS = { min: 60000, max: 120000 } // Levinson: ~90 sn (60–120)
export const LONG_PRESS_MS = 450 // 9. nefes: basılı tut (VARSAYIM)
export const PAUSE_GAP_MS = 15000 // bu kadar uzun dokunuş aralığı "ara" sayılır, düzensizliğe girmez (VARSAYIM)
export const MW_SCALE = [1, 2, 3, 4, 5, 6]

const finite = (v) => (Number.isFinite(v) ? v : null)
const r1 = (v) => (Number.isFinite(v) ? +v.toFixed(1) : null)

export function median(values) {
  const s = values.filter(Number.isFinite).sort((a, b) => a - b)
  const n = s.length
  if (!n) return null
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

// Sonraki sorgu zamanı: son sorgudan (ya da başlangıçtan) 60–120 sn sonra
export function nextProbeAt(fromTs, rnd = Math.random, gap = PROBE_GAP_MS) {
  return fromTs + gap.min + rnd() * (gap.max - gap.min)
}

// Sayım makinesi. Hepsi zaman damgası alır (ms). Sorgu açıkken dokunuşlar yok sayılır.
// Olaylar: tap(ts) 1–8 için; nine(ts) 9 için (basılı tutma); reset(ts) kaybettim; probe açma/kapatma.
export function createBreathCounter() {
  let count = 0 // son sayılan nefes (0 = set başı)
  let probing = false
  const sets = [] // { kind: 'ok' | 'miss9' | 'early9' | 'reset', ts }
  const probes = [] // { ts, mw, said, actual, correct }
  const taps = [] // { ts, kind: 'tap' | 'nine' }
  const push = (kind, ts) => sets.push({ kind, ts })
  return {
    tap(ts) {
      if (probing) return this.state
      taps.push({ ts, kind: 'tap' })
      if (count >= SET_SIZE - 1) {
        // 9. nefeste normal dokunuş: fark edilmeden kaçırılan 9 → set yanlış, yeni set
        push('miss9', ts)
        count = 0
      } else count += 1
      return this.state
    },
    nine(ts) {
      if (probing) return this.state
      taps.push({ ts, kind: 'nine' })
      push(count === SET_SIZE - 1 ? 'ok' : 'early9', ts)
      count = 0
      return this.state
    },
    reset(ts) {
      if (probing) return this.state
      push('reset', ts)
      count = 0
      return this.state
    },
    openProbe() {
      probing = true
      return this.state
    },
    // mw: 1–6 (1 = tamamen nefeste), said: kullanıcının söylediği sayı (1–9; 0 = "bilmiyorum")
    answerProbe(ts, { mw, said }) {
      const m = MW_SCALE.includes(mw) ? mw : null
      const s = finite(said)
      const correct = s != null && s === count
      probes.push({ ts, mw: m, said: s, actual: count, correct })
      probing = false
      return this.state
    },
    get state() {
      return { count, probing, sets: sets.length, probes: probes.length }
    },
    summary(seconds) {
      return summarize({ sets, probes, taps, seconds })
    },
  }
}

// Dokunuş aralıklarının değişim katsayısı (sd / ortalama); uzun aralar (sorgu, mola) atılır.
export function tapIrregularity(taps, pauseGap = PAUSE_GAP_MS) {
  const ts = taps.map((t) => t.ts).filter(Number.isFinite).sort((a, b) => a - b)
  const gaps = []
  for (let i = 1; i < ts.length; i++) {
    const g = ts[i] - ts[i - 1]
    if (g > 0 && g < pauseGap) gaps.push(g)
  }
  if (gaps.length < 4) return null
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length)
  return mean > 0 ? +(sd / mean).toFixed(3) : null
}

// Levinson formülü + hata dökümü
export function summarize({ sets = [], probes = [], taps = [], seconds = 0 }) {
  const n = (k) => sets.filter((s) => s.kind === k).length
  const ok = n('ok')
  const miss9 = n('miss9')
  const early9 = n('early9')
  const resets = n('reset')
  const probeWrong = probes.filter((p) => !p.correct).length
  const total = ok + miss9 + early9 + probes.length + resets
  const wrong = miss9 + early9 + probeWrong + resets
  const accuracy = total > 0 ? +((100 * (total - wrong)) / total).toFixed(1) : null
  const mwVals = probes.map((p) => p.mw).filter(Number.isFinite)
  const mw = mwVals.length ? r1(mwVals.reduce((a, b) => a + b, 0) / mwVals.length) : null
  const minutes = seconds > 0 ? seconds / 60 : null
  const bpm = minutes && taps.length ? r1(taps.length / minutes) : null
  return {
    version: BC_VERSION,
    seconds,
    sets: ok + miss9 + early9, // tamamlanan setler (doğru + yanlış 9)
    ok,
    miss9, // fark edilmeden kaçırılan (dikkat kopması)
    early9,
    resets, // kendi yakaladığı (zihin gezinmesi)
    probes: probes.length,
    probeWrong,
    accuracy,
    selfCaught: wrong > 0 ? +((100 * resets) / wrong).toFixed(0) : null, // hataların yüzde kaçı fark edildi
    mw, // 1–6 ortalama
    tapCv: tapIrregularity(taps),
    bpm, // dokunuş/dk ≈ nefes/dk (Levinson: r = 0,99)
  }
}

// Kayıt: sessions deposuna (type 'breath-count'). Günlük hedefe sayılır.
export function makeRecord(sum, date = new Date()) {
  return { type: SESSION_TYPE, date: new Date(date).toISOString(), ...sum }
}

export const isBreathCount = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.accuracy)

// Kaçıncı seans → süre: ilk INTRO_SESSIONS seans kısa
export function durationFor(sessions = []) {
  const n = sessions.filter(isBreathCount).length
  return n < INTRO_SESSIONS ? DURATIONS_SEC.short : DURATIONS_SEC.standard
}

// Eğilim: alışma (ilk 3) → başlangıç (sonraki 7'nin ortancası oluşuyor) → izleme.
// VARSAYIM: eşik yok; yalnızca referansa göre fark gösterilir. Görme testi trend.js'ten ayrı tutuldu
// (o logMAR'a ve gün aralıklarına özel).
export function bcTrend(sessions = []) {
  const recs = sessions.filter(isBreathCount).sort((a, b) => new Date(a.date) - new Date(b.date))
  const n = recs.length
  const latest = recs.at(-1) ?? null
  if (n === 0) return { phase: 'empty', n, latest: null, reference: null, delta: null }
  if (n <= INTRO_SESSIONS) return { phase: 'familiarization', n, latest, reference: null, delta: null }
  const base = recs.slice(INTRO_SESSIONS, INTRO_SESSIONS + BASELINE_SESSIONS)
  const reference = median(base.map((r) => r.accuracy))
  if (n < INTRO_SESSIONS + BASELINE_SESSIONS) return { phase: 'baseline', n, latest, reference, delta: null }
  const recent = median(recs.slice(-3).map((r) => r.accuracy))
  return { phase: 'tracking', n, latest, reference, delta: reference != null && recent != null ? +(recent - reference).toFixed(1) : null }
}

// Sonuç cümlesi: sayı + tek yorum, iddiasız. Levinson: ortalama hata %16–22, hataların %29–35'i fark edilir.
export function resultText(sum) {
  if (sum.accuracy == null) return 'Bu seansta yeterli veri toplanmadı.'
  const parts = [`Doğruluk %${sum.accuracy}.`]
  if (sum.miss9 + sum.early9 + sum.resets + sum.probeWrong === 0) parts.push('Hiç hata yok.')
  else if (sum.selfCaught != null) parts.push(`Hataların %${sum.selfCaught} kadarını kendin fark ettin.`)
  if (sum.mw != null) parts.push(sum.mw <= 2.5 ? 'Dikkatin çoğunlukla nefesteydi.' : sum.mw >= 4.5 ? 'Dikkatin sık sık başka yere gitti; bu normal, fark etmek pratiğin kendisi.' : 'Dikkatin ara sıra kaydı.')
  return parts.join(' ')
}
