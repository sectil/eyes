// Yakın E testi ekranının saf yardımcıları (lib/acuityFlow.js): göz sırası, çıkış sayfası (E10), duraklama kartı (E6),
// sonuç satırları (E7/E9), gözlük sayfası (E3), kayıt biçimi (S4–S8) ve sesli yönlendirme zamanlaması (S13).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  ALGORITHM, eyesFor, startIndex, COVER_PHRASE, setupSubtitle, wearLabel, glassesOutcome, PICK_CLOSE_MS, NOTE_CLOSE_MS,
  exitSheet, pauseCard, PAUSE_SUB, remainingLabel, coverMethodText, resultFacts, valueText, rangeNote, rulerPos, rulerLabel,
  summaryTitle, restNext, progressSegments, atGateOf, rawLines, buildEyeRecord, setupPhraseId, createVoiceCoach, PHRASE_MS,
  phraseMs, PHRASE_MARGIN_MS, nextEyeIndex, methodAfterCameraStop, REST_PHRASE, REST_TITLE, NO_FACE_OFFER_MS, phraseText,
  PHRASE_PRIORITY, coverHint, REJECT_HINT_MS, waitCard, MOVED_TEXT, distancePill, SKIPPED_TEXT,
} from './acuityFlow.js'
import { inCountBand } from './trialGate.js'
import { PHRASES } from './voicePack.js'
import { acuityReadiness, occFromSnapshot, BOTH_OPEN } from './acuityReadiness.js'
import { methodEra, DISTANCE_ASSUMED_NOTE } from './trend.js'

describe('göz sırası ve yarım gün (E0, S3)', () => {
  it('günlük sağ + sol; haftalık sağ, sol, iki göz', () => {
    expect(eyesFor('daily')).toEqual(['R', 'L'])
    expect(eyesFor('weekly')).toEqual(['R', 'L', 'OU'])
  })
  it('test ilk eksik gözden başlar', () => {
    const w = eyesFor('weekly')
    expect(startIndex(w, [])).toBe(0)
    expect(startIndex(w, ['R'])).toBe(1)
    expect(startIndex(w, ['R', 'L'])).toBe(2)
    expect(startIndex(w, ['L'])).toBe(0)
    expect(startIndex(w, ['R', 'L', 'OU'])).toBe(0)
  })
})

describe('ekrandaki cümle = sesli cümle (S13)', () => {
  it('hazırlık alt satırı ses paketindeki cümlenin kendisi', () => {
    expect(setupSubtitle('R')).toBe('Sol gözünü avucunla ört, bastırma.')
    expect(setupSubtitle('L')).toBe('Sağ gözünü avucunla ört, bastırma.')
    expect(setupSubtitle('OU')).toBe('İki gözünü de açık tut.')
    for (const e of ['R', 'L', 'OU']) expect(setupSubtitle(e)).toBe(PHRASES.tr[COVER_PHRASE[e]])
  })
  it('testte söylenen her cümlenin bir süresi var; harf en az bu süre + pay kadar bekler', () => {
    const acu = [...Object.keys(PHRASES.tr).filter((id) => id.startsWith('acu')), REST_PHRASE]
    expect(acu.length).toBe(9)
    expect(Object.keys(PHRASE_MS).sort()).toEqual([...acu].sort())
    for (const id of acu) {
      expect(PHRASE_MS[id]).toBeGreaterThan(900)
      expect(phraseMs(id)).toBe(PHRASE_MS[id] + PHRASE_MARGIN_MS)
    }
  })

  // İnceleme bulgusu V-N2: tablo ses dosyalarından ölçülür (kısaltılmış değer cümleyi keser, harf cümle bitmeden gelir).
  // MPEG-1 Layer III çerçeveleri sayılır (ID3 etiketi ve Xing/Info çerçevesi atlanır); süre = çerçeve × 1152 / örnekleme.
  // Kodlayıcı gecikmesi ve dolgu kırpılmaz: çözücü kırpsa da kırpmasa da ses bundan uzun olamaz.
  const KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
  const RATE = [44100, 48000, 32000, 0]
  function mp3DurationMs(buf) {
    let i = 0
    if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
      const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f)
      i = 10 + size + (buf[5] & 0x10 ? 10 : 0)
    }
    while (i + 4 <= buf.length && !(buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0)) i++
    let frames = 0
    let rate = null
    let first = true
    while (i + 4 <= buf.length && buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      const kbps = KBPS[buf[i + 2] >> 4]
      const sr = RATE[(buf[i + 2] >> 2) & 3]
      if (((buf[i + 1] >> 3) & 3) !== 3 || ((buf[i + 1] >> 1) & 3) !== 1 || !kbps || !sr) break
      const side = buf[i + 3] >> 6 === 3 ? 17 : 32
      const tag = buf.toString('latin1', i + 4 + side, i + 8 + side)
      if (!(first && (tag === 'Xing' || tag === 'Info'))) frames += 1
      first = false
      rate = sr
      i += Math.floor((144000 * kbps) / sr) + ((buf[i + 2] >> 1) & 1)
    }
    return rate ? (frames * 1152 * 1000) / rate : null
  }
  it('süre tablosu ses dosyalarının ölçümü: her cümlede iki sesin uzun olanı, 10 ms\'ye yukarı yuvarlanmış', () => {
    const dir = new URL('../../public/voice/tr/', import.meta.url)
    for (const id of Object.keys(PHRASE_MS)) {
      const ms = ['female', 'male'].map((v) => mp3DurationMs(readFileSync(new URL(`${v}/${id}.mp3`, dir))))
      for (const d of ms) expect(d, id).toBeGreaterThan(500)
      const longest = Math.max(...ms)
      expect(PHRASE_MS[id], `${id}: ölçülen ${longest.toFixed(1)} ms`).toBeGreaterThanOrEqual(longest)
      expect(PHRASE_MS[id], `${id}: ölçülen ${longest.toFixed(1)} ms`).toBe(Math.ceil(longest / 10) * 10)
    }
    // inceleme: kod çözücüyle ölçülen (kırpılmış) süreler 3,344 sn ve 1,254 sn idi; tablo bunların altında kalmaz
    expect(PHRASE_MS.acuCoverR).toBeGreaterThanOrEqual(3350)
    expect(PHRASE_MS.acuFarther).toBeGreaterThanOrEqual(1260)
  })

  // Sahibin kuralı: söylenen cümle, söylendiği anda ekranda aynen yazılıdır (yalnız sondaki nokta farklı olabilir).
  // Hazırlıkta ekran = alt satır + üç satırın değerleri + ana düğme (acuityReadiness); duraklamada kart; molada başlık.
  const bare = (t) => String(t ?? '').replace(/\.$/, '')
  const setupScreen = (eye, r) => [setupSubtitle(eye), ...r.rows.map((x) => x.value), r.button.text].map(bare)
  const occ = (o) => ({ ...occFromSnapshot({ state: 'uncovered' }), ...o })
  const STATES = {
    face: { occ: occ({ status: 'no-face' }), distance: { mm: null, tracked: true } },
    'wrong-eye': { occ: occ({ status: 'wrong-eye' }) },
    cover: { occ: occ({ status: 'uncovered', sinceFaceMs: 500 }) },
    'too-far': { occ: occ({ status: 'ok', holdMs: 2000, gateReady: true }), distance: { mm: 470, tracked: true } },
    'too-close': { occ: occ({ status: 'ok', holdMs: 2000, gateReady: true }), distance: { mm: 330, tracked: true } },
    self: { cam: { error: 'load' } },
  }
  it('hazırlık: her durumun cümlesi o anki ekranda (alt satır, satır ya da düğme) aynen yazılı', () => {
    const seen = new Set()
    for (const eye of ['R', 'L', 'OU']) {
      for (const [name, st] of Object.entries({ ...STATES, open: { occ: occ({ status: 'closed' }) } })) {
        const r = acuityReadiness({ eye, eyeIdx: 0, correction: 'reading', cam: { error: null, face: true }, distance: { mm: 400, tracked: true }, selfConfirm: {}, ...st })
        const id = setupPhraseId(r.button, eye)
        if (!id) continue
        seen.add(id)
        expect(setupScreen(eye, r), `${eye} ${name} → ${id}`).toContain(bare(PHRASES.tr[id]))
      }
    }
    expect([...seen].sort()).toEqual(['acuBoth', 'acuCloser', 'acuCoverL', 'acuCoverR', 'acuFace', 'acuFarther', 'acuWrong'])
  })
  // İnceleme bulgusu V-N7: alt satır "İki gözünü de açık tut." iken satır ve düğme "İki gözünü de aç" diyordu
  it('iki göz hazırlığı: alt satır, örtme satırı ve düğme aynı emri aynı sözlerle yazar (ses dosyasının metni)', () => {
    expect(PHRASES.tr.acuBoth).toBe('İki gözünü de açık tut.') // ses dosyaları bu metinle üretildi (voicePack.test.js)
    expect(BOTH_OPEN).toBe(bare(PHRASES.tr.acuBoth))
    const other = /İki gözünü de aç(?!ık tut)/
    for (const status of ['closed', 'unclear', 'no-face', 'ok']) {
      for (const holdMs of [0, 500, 2000]) {
        const r = acuityReadiness({ eye: 'OU', eyeIdx: 2, correction: 'reading', cam: { error: null, face: true }, occ: occ({ status, holdMs, gateReady: holdMs >= 1000 }), distance: { mm: 400, tracked: true }, selfConfirm: {} })
        const screen = setupScreen('OU', r)
        for (const t of screen) expect(t, `${status} ${holdMs}`).not.toMatch(other)
        if (r.button.reason === 'open') {
          expect(r.button.text).toBe(BOTH_OPEN)
          expect(r.rows.find((x) => x.key === 'cover').value).toBe(BOTH_OPEN)
        }
      }
    }
    const nocam = acuityReadiness({ eye: 'OU', eyeIdx: 2, correction: 'reading', cam: { error: 'load' }, distance: { tracked: false }, selfConfirm: {} })
    expect(nocam.rows.find((x) => x.key === 'cover').value).toBe(BOTH_OPEN)
  })
  it('"Başla" hazırken sessiz: ekranda karşılığı olmayan cümle yok, ilk harf beklemez', () => {
    const r = acuityReadiness({ eye: 'R', correction: 'reading', cam: { error: 'load' }, distance: { tracked: false }, selfConfirm: { cover: true, distance: true } })
    expect(r.button.ready).toBe(true)
    expect(setupPhraseId(r.button, 'R')).toBeNull()
  })
  it('duraklama: söylenen "Test durdu. Düzelince sürer." kartın alt satırı; mola: "Uzağa bak." mola başlığı', () => {
    expect(PAUSE_SUB).toBe(PHRASES.tr.acuPaused)
    for (const reason of ['too-far', 'too-close', 'no-face', 'uncovered', 'wrong-eye', 'closed']) expect(pauseCard({ reason, need: 'L' }).sub).toBe(PHRASES.tr.acuPaused)
    expect(pauseCard({ camStopped: true }).sub).toBe(PHRASES.tr.acuPaused)
    expect(REST_PHRASE).toBe('exFarShort')
    expect(REST_TITLE).toBe(bare(phraseText(REST_PHRASE)))
    expect(REST_TITLE).toBe('Uzağa bak')
  })
})

describe('sıradaki göz (yarım gün, gece yarısını geçen koşu)', () => {
  it('atlanan ve biten gözler geçilir; kalmadıysa −1 (özet)', () => {
    const w = eyesFor('weekly')
    expect(nextEyeIndex(w, 0, [])).toBe(1)
    expect(nextEyeIndex(w, 0, ['R', 'L'])).toBe(2)
    // gece yarısı: yalnız L bugün kayıtlı → R'den sonra L atlanır, OU gelir
    expect(nextEyeIndex(w, 0, ['L', 'R'])).toBe(2)
    expect(nextEyeIndex(w, 1, ['L', 'OU'])).toBe(-1)
    expect(nextEyeIndex(w, 2, [])).toBe(-1)
    expect(nextEyeIndex(eyesFor('daily'), 0, ['R'])).toBe(1)
  })
})

describe('kamera test ortasında durunca yöntem (S8)', () => {
  it('kameranın doğruladığı yöntemler kayıtta self-report\'a iner; kişinin onayıyla başlayanlar ve iki göz aynı kalır', () => {
    expect(methodAfterCameraStop('camera-depth')).toBe('self-report')
    expect(methodAfterCameraStop('camera-lid+self')).toBe('self-report')
    expect(methodAfterCameraStop('camera-self')).toBe('camera-self')
    expect(methodAfterCameraStop('self-report')).toBe('self-report')
    expect(methodAfterCameraStop('none')).toBe('none')
  })
  // İnceleme bulgusu R-N4a: kişi hiç onaylamadı; E7 "senin onayın" dememeli
  it('E7: kamera durup "Kamerasız devam" seçildiyse "Örtme: kamera durdu, doğrulanmadı"; kayıttaki yöntem self-report kalır', () => {
    const est = { logMAR: 0.1, sd: 0.04, trials: 20, descentTrials: 5, fineTrials: 15 }
    for (const gate of ['camera-depth', 'camera-lid+self']) {
      const run = { method: methodAfterCameraStop(gate), gateMethod: gate, atGate: null, tracked: false, samples: [400], cantSee: 0, camFailedMidTest: true }
      const rec = buildEyeRecord({ plan: 'daily', eye: 'R', est, fin: { logMAR: 0.1, outOfRange: null }, correction: 'reading', run, trialsMax: 20 })
      expect(rec.occlusion).toMatchObject({ method: 'self-report', gateMethod: gate })
      const f = resultFacts(rec)
      expect(f).toEqual(['Okuma gözlüğü', 'Örtme: kamera durdu, doğrulanmadı', DISTANCE_ASSUMED_NOTE])
      expect(f.join(' ')).not.toMatch(/senin onayın|kamera doğruladı/)
    }
    // "Örttüm" ile kişi onayladıysa (camera-self) kamera dursa da "senin onayın" doğru
    const self = { method: 'camera-self', atGate: null, tracked: false, samples: [], cantSee: 0, camFailedMidTest: true }
    const rec = buildEyeRecord({ plan: 'daily', eye: 'R', est, fin: { logMAR: 0.1, outOfRange: null }, correction: 'reading', run: { ...self, gateMethod: 'camera-self' }, trialsMax: 20 })
    expect(resultFacts(rec)[1]).toBe('Örtme: senin onayın')
    // kamerasız başlanan ölçüm (kişinin iki onayı) değişmez
    expect(resultFacts({ correction: 'reading', distanceTracked: false, occlusion: { method: 'self-report' } })[1]).toBe('Örtme: senin onayın')
  })
})

describe('E3 · gözlük sayfası', () => {
  it('ilk seçim: 250 ms sonra kapanır, soru ve not yok', () => {
    expect(glassesOutcome({ choice: 'reading', last: null })).toEqual({ ask: false, note: null, closeMs: PICK_CLOSE_MS })
    expect(PICK_CLOSE_MS).toBe(250)
  })
  it('gözlük/lens geçen seferkiyle aynıysa numara sorulur (kapanma cevapla)', () => {
    expect(glassesOutcome({ choice: 'reading', last: 'reading' })).toEqual({ ask: true, note: null, closeMs: null })
    expect(glassesOutcome({ choice: 'contacts', last: 'contacts' }).ask).toBe(true)
    // eski "glasses" kaydı gözlük türleriyle aynı seri (trend.js sameCondition)
    expect(glassesOutcome({ choice: 'progressive', last: 'glasses' }).ask).toBe(true)
    // gözlüksüzde numara sorulmaz
    expect(glassesOutcome({ choice: 'none', last: 'none' })).toEqual({ ask: false, note: null, closeMs: PICK_CLOSE_MS })
  })
  it('geçen seferden farklıysa kapanmadan önce tek satır: yeni seri', () => {
    const o = glassesOutcome({ choice: 'reading', last: 'none' })
    expect(o).toEqual({ ask: false, note: 'Geçen sefer: Gözlüksüz. Bu seçim yeni seri başlatır.', closeMs: NOTE_CLOSE_MS })
    expect(glassesOutcome({ choice: 'contacts', last: 'glasses' }).note).toBe('Geçen sefer: Gözlüklü. Bu seçim yeni seri başlatır.')
    expect(NOTE_CLOSE_MS).toBeGreaterThan(PICK_CLOSE_MS)
  })
  it('gözlük adları', () => {
    expect(wearLabel('reading')).toBe('Okuma gözlüğü')
    expect(wearLabel('glasses')).toBe('Gözlüklü')
    expect(wearLabel('x')).toBeNull()
  })
})

describe('E10 · çıkış sayfası (biten gözler silinmez)', () => {
  it('kaybolacak veri yoksa sayfasız çıkılır', () => {
    expect(exitSheet({ saved: [], started: false }).direct).toBe(true)
  })
  it('deneme başladıysa: yarım göz kaydedilmez', () => {
    expect(exitSheet({ saved: [], started: true })).toMatchObject({ direct: false, title: 'Testten çıkılsın mı?', body: 'Bu gözün yarım ölçümü kaydedilmez.' })
  })
  it('biten göz varsa hep sorulur ve kaydedildiği söylenir', () => {
    expect(exitSheet({ saved: ['R'], started: false })).toMatchObject({ direct: false, body: "Sağ göz kaydedildi. Kalanlar Bugün'de bekler." })
    expect(exitSheet({ saved: ['R', 'L'], started: true }).body).toBe("Sağ ve sol göz kaydedildi. Kalanlar Bugün'de bekler.")
    expect(exitSheet({ saved: ['L'] }).body).toBe("Sol göz kaydedildi. Kalanlar Bugün'de bekler.")
  })
  it('kalanlar Bugün\'de görünmeyecekse (haftalık yoldayken günlük) bu söz verilmez', () => {
    expect(exitSheet({ saved: ['R'], todayHolds: false }).body).toBe('Sağ göz kaydedildi.')
    expect(exitSheet({ saved: [], started: true, todayHolds: false }).body).toBe('Bu gözün yarım ölçümü kaydedilmez.')
  })
  // İnceleme bulgusu V-N3: "Sağ ve sol gözün kaydedildi" (iyelik eki iki göze uymuyor). Her birleşim tek tek.
  it('her kaydedilen göz birleşiminin cümlesi doğru ve aynı kalıpta ("… göz kaydedildi.")', () => {
    const all = [['R'], ['L'], ['OU'], ['R', 'L'], ['R', 'OU'], ['L', 'OU'], ['R', 'L', 'OU']]
    const want = {
      R: 'Sağ göz kaydedildi.',
      L: 'Sol göz kaydedildi.',
      OU: 'İki göz ölçümü kaydedildi.',
      'R,L': 'Sağ ve sol göz kaydedildi.',
      'R,OU': '2 ölçüm kaydedildi.',
      'L,OU': '2 ölçüm kaydedildi.',
      'R,L,OU': '3 ölçüm kaydedildi.',
    }
    for (const saved of all) {
      for (const todayHolds of [true, false]) {
        const body = exitSheet({ saved, todayHolds }).body
        expect(body, saved.join()).toBe(todayHolds ? `${want[saved.join()]} Kalanlar Bugün'de bekler.` : want[saved.join()])
        expect(body, saved.join()).not.toMatch(/gözün kaydedildi|ölçümün kaydedildi/)
      }
    }
  })
})

describe('E6 · duraklama kartı: tek emir', () => {
  it('mesafe, yüz, örtme, iki göz ve kamera', () => {
    expect(pauseCard({ reason: 'too-far', need: 'L' })).toMatchObject({ icon: 'distance', text: 'Biraz yaklaştır · 40 cm', sub: PAUSE_SUB, action: null })
    expect(pauseCard({ reason: 'too-close', need: 'L' }).text).toBe('Biraz uzaklaştır · 40 cm')
    expect(pauseCard({ reason: 'no-face', need: 'L' })).toMatchObject({ icon: 'face', text: 'Yüzünü kameraya göster' })
    expect(pauseCard({ reason: 'uncovered', need: 'L' })).toMatchObject({ icon: 'cover', text: 'Sol gözünü avucunla ört' })
    expect(pauseCard({ reason: 'wrong-eye', need: 'L' }).text).toBe('Yanlış göz · solu ört')
    expect(pauseCard({ reason: 'wrong-eye', need: 'R' }).text).toBe('Yanlış göz · sağı ört')
    expect(pauseCard({ reason: 'closed', need: 'none' })).toMatchObject({ icon: 'open', text: 'İki gözünü de aç' })
    expect(pauseCard({ reason: 'no-face', camStopped: true })).toMatchObject({ icon: 'camera', text: 'Kamera durdu', action: 'no-camera' })
    expect(PAUSE_SUB).toBe('Test durdu. Düzelince sürer.')
  })
  it('örtme yüzünden sayılmayan cevabın nedeni: duraklama kartının emri; "Test durdu" alt satırı yok (R-S2)', () => {
    expect(coverHint('wrong-eye', 'L')).toEqual({ icon: 'cover', text: 'Yanlış göz · solu ört', sub: null, action: null })
    expect(coverHint('uncovered', 'R')).toEqual({ icon: 'cover', text: 'Sağ gözünü avucunla ört', sub: null, action: null })
    for (const s of ['wrong-eye', 'uncovered']) expect(coverHint(s, 'L').text).toBe(pauseCard({ reason: s, need: 'L' }).text)
    for (const s of ['ok', 'unclear', 'no-face', 'closed', 'lid-ask', null]) expect(coverHint(s, 'L')).toBeNull()
    expect(REJECT_HINT_MS).toBeGreaterThanOrEqual(1000)
  })
  // Üçüncü inceleme R-S1-reject-silent / R-S1-followup: mesafe yüzünden sayılmayan cevap ve açılamayan harf de nedenini
  // söyler. Metin duraklama kartının emri; "Test durdu" satırı yok, eylem ("Kamerasız devam") yok.
  it('harf yuvasındaki neden kartı: her sayılmama nedeni duraklama kartının emrini yazar; alt satır ve eylem yok', () => {
    const want = {
      'too-far': ['distance', 'Biraz yaklaştır · 40 cm'],
      'too-close': ['distance', 'Biraz uzaklaştır · 40 cm'],
      'no-face': ['face', 'Yüzünü kameraya göster'],
      'wrong-eye': ['cover', 'Yanlış göz · solu ört'],
      uncovered: ['cover', 'Sol gözünü avucunla ört'],
      moved: ['distance', 'Telefonu sabit tut'],
    }
    for (const [why, [icon, text]] of Object.entries(want)) {
      expect(waitCard(why, 'L'), why).toEqual({ icon, text, sub: null, action: null })
      if (why !== 'moved') expect(text, why).toBe(pauseCard({ reason: why, need: 'L', offerNoCamera: true }).text)
    }
    expect(MOVED_TEXT).toBe('Telefonu sabit tut')
    expect(waitCard('wrong-eye', 'R').text).toBe('Yanlış göz · sağı ört')
    for (const why of [null, undefined, 'closed', 'unclear', 'paused', 'out-of-band']) expect(waitCard(why, 'L'), String(why)).toBeNull()
  })
})

// Üçüncü inceleme (R-S1-followup; 2. doğrulayıcı: cm yuvarlaması): 441–444 mm "44 cm", 355–359 mm "36 cm" sarı yazılıyordu; ekrandaki metin 36–44 cm
// diyor. Sayı bant dışındayken bandın dışındaki en yakın tam cm; VoiceOver adı yönü de söyler.
describe('canlı cm hapı', () => {
  it('bant içi: en yakın tam cm; bant dışı: bandın dışındaki en yakın tam cm ve ne yapılacağı', () => {
    expect(distancePill(400)).toEqual({ text: '40 cm', label: '40 santimetre', out: false })
    expect(distancePill(440)).toEqual({ text: '44 cm', label: '44 santimetre', out: false })
    expect(distancePill(360)).toEqual({ text: '36 cm', label: '36 santimetre', out: false })
    expect(distancePill(443)).toEqual({ text: '45 cm', label: '45 santimetre, biraz yaklaştır', out: true })
    expect(distancePill(440.1)).toMatchObject({ text: '45 cm', out: true })
    expect(distancePill(452)).toMatchObject({ text: '45 cm', out: true })
    expect(distancePill(466)).toMatchObject({ text: '47 cm', out: true })
    expect(distancePill(357)).toEqual({ text: '35 cm', label: '35 santimetre, biraz uzaklaştır', out: true })
    expect(distancePill(359.9)).toMatchObject({ text: '35 cm', out: true })
    expect(distancePill(331)).toMatchObject({ text: '33 cm', out: true })
    expect(distancePill(null)).toEqual({ text: '— cm', label: 'Mesafe ölçülemiyor', out: true })
  })
  it('sarı hap hiçbir mesafede 36–44 cm yazmaz; yeşil hap hep 36–44 cm yazar', () => {
    for (let mm = 300; mm <= 500; mm += 0.25) {
      const p = distancePill(mm)
      const cm = Number(p.text.split(' ')[0])
      expect(cm >= 36 && cm <= 44, `${mm} mm → ${p.text}`).toBe(!p.out)
      expect(p.out, `${mm} mm`).toBe(!inCountBand(mm))
      expect(Math.abs(cm * 10 - mm), `${mm} mm → ${p.text}`).toBeLessThan(10) // en çok 1 cm kayma
    }
  })
})

describe('E6 · duraklama kartı: kamerasız devam', () => {
  it('yüz uzun süre görünmezse "Yüzünü kameraya göster" kartında da "Kamerasız devam"', () => {
    expect(pauseCard({ reason: 'no-face', need: 'L', offerNoCamera: true })).toMatchObject({ icon: 'face', text: 'Yüzünü kameraya göster', action: 'no-camera' })
    expect(pauseCard({ reason: 'no-face', need: 'L' }).action).toBeNull()
    expect(NO_FACE_OFFER_MS).toBe(5000)
  })
})

describe('E7 / E9 · sonuç satırları', () => {
  const base = { eye: 'R', logMAR: 0.1, correction: 'reading', distanceTracked: true, meanDistanceMm: 398, outOfRange: null }
  it('koşul satırı ve dürüst örtme yöntemi (S8)', () => {
    expect(resultFacts({ ...base, occlusion: { method: 'camera-depth' } })).toEqual(['Okuma gözlüğü · ort. 40 cm', 'Örtme: kamera doğruladı'])
    expect(resultFacts({ ...base, occlusion: { method: 'camera-lid+self' } })[1]).toBe('Örtme: kamera + senin onayın')
    expect(resultFacts({ ...base, occlusion: { method: 'camera-self' } })[1]).toBe('Örtme: senin onayın')
  })
  it('kamerasız: "Mesafe ölçülmedi · 40 cm varsayıldı", ortalama mesafe yazılmaz (S5)', () => {
    const f = resultFacts({ ...base, distanceTracked: false, meanDistanceMm: null, occlusion: { method: 'self-report' } })
    expect(f).toEqual(['Okuma gözlüğü', 'Örtme: senin onayın', DISTANCE_ASSUMED_NOTE])
    expect(DISTANCE_ASSUMED_NOTE).toBe('Mesafe ölçülmedi · 40 cm varsayıldı')
  })
  it('iki göz sonucunda örtme satırı yok; "Tek göz" hiçbir yerde yazmaz', () => {
    for (const method of ['none', 'open', 'lid', null]) {
      const lines = resultFacts({ ...base, eye: 'OU', occlusion: { method } })
      expect(lines).toEqual(['Okuma gözlüğü · ort. 40 cm'])
      expect(lines.join(' ')).not.toMatch(/Tek göz|Örtme/)
    }
    expect(coverMethodText('none')).toBeNull()
  })
  it('taban ve tavan işareti', () => {
    expect(valueText({ logMAR: 0.1 })).toBe('0,10')
    expect(valueText({ logMAR: -0.12, outOfRange: 'floor' })).toBe('≤−0,12')
    expect(valueText({ logMAR: 1.3, outOfRange: 'ceiling' })).toBe('≥1,30')
    expect(rangeNote({ outOfRange: 'floor' })).toBe('Ekranın gösterebildiği en küçük harf')
    expect(rangeNote({ outOfRange: null })).toBeNull()
  })
  it('cetvel: solda küçük harf (iyi), sağda büyük harf; etiketler virgüllü', () => {
    expect(rulerPos(-0.3)).toBe(4)
    expect(rulerPos(1.0)).toBe(96)
    expect(rulerPos(-0.2)).toBeLessThan(rulerPos(0))
    expect([-0.2, 0, 0.3, 1].map(rulerLabel)).toEqual(['−0,2', '0,0', '0,3', '1,0'])
  })
  it('özet başlığı ve mola önizlemesi', () => {
    expect(summaryTitle('weekly')).toBe('Haftalık test bitti')
    expect(summaryTitle('daily')).toBe('Günlük test bitti')
    // koşudan önce kaydedilmiş göz: "Bugün" denmez (gece yarısını geçen koşuda dün kaydedilmiş olabilir)
    expect(SKIPPED_TEXT).toBe('Daha önce kaydedildi')
    expect(restNext('R')).toEqual({ eye: 'R', text: 'Sağ göz · sol gözünü ört' })
    expect(restNext('L')).toEqual({ eye: 'L', text: 'Sol göz · sağ gözünü ört' })
    expect(restNext('OU')).toEqual({ eye: 'OU', text: 'İki göz · iki gözünü de açık tut' })
    expect(restNext(undefined)).toBeNull()
  })
  // Üçüncü doğrulama (2. doğrulayıcı, NIT 1): iki göz önizlemesi "iki gözünü de aç" diyordu; sıradaki ekran (alt satır,
  // örtme satırı, düğme, ses) "İki gözünü de açık tut" diyor
  it('mola önizlemesinin iki göz emri sıradaki hazırlık ekranının emriyle aynı', () => {
    const lower = (s) => s[0].toLocaleLowerCase('tr-TR') + s.slice(1)
    expect(restNext('OU').text).toBe(`İki göz · ${lower(BOTH_OPEN)}`)
    expect(restNext('OU').text.endsWith(lower(setupSubtitle('OU').replace(/\.$/, '')))).toBe(true)
    expect(restNext('OU').text).not.toMatch(/gözünü de aç(?!ık tut)/)
  })
  it('ilerleme parçaları', () => {
    expect(progressSegments(['R', 'L', 'OU'], 1, ['R'])).toEqual(['done', 'on', ''])
    expect(progressSegments(['R', 'L'], 0, [])).toEqual(['on', ''])
  })
  it('kalan harf yazısı', () => {
    expect(remainingLabel({ kind: 'approx', count: 8 })).toBe('~8 harf kaldı')
    expect(remainingLabel({ kind: 'few' })).toBe('az kaldı')
    expect(remainingLabel({ kind: 'last', count: 2 })).toBe('son harfler')
    expect(remainingLabel({ kind: 'last', count: 1 })).toBe('son harf')
  })
})

describe('ham kapak / derinlik satırları yalnız geliştirici derlemesinde', () => {
  const snap = { l: 0.1, r: 0.2345, dl: 360.4, dr: 385.6 }
  it('VITE_APP_BUILD dev değilse hiç yok', () => {
    for (const b of [undefined, null, 'web', '31', 'DEV', 'development']) expect(rawLines(snap, b)).toEqual([])
  })
  it('dev derlemesinde iki satır', () => {
    expect(rawLines(snap, 'dev')).toEqual(['kapak · sağ 0,23 · sol 0,10 (0 açık, 1 kapalı)', 'derinlik · sağ 386 mm · sol 360 mm (avuç tarafı yakın)'])
  })
})

describe('kayıt (S4–S8)', () => {
  const est = { logMAR: 0.1234, sd: 0.0456, trials: 28, descentTrials: 6, fineTrials: 22 }
  const fin = { logMAR: 0.1234, outOfRange: null }
  const run = { method: 'camera-depth', atGate: atGateOf({ l: 0.123, r: 0.456, dl: 360.4, dr: 385.5, state: 'ok' }), tracked: true, samples: [390, 402, 410], cantSee: 3, camFailedMidTest: false }
  it('v4, Göremiyorum sayısı, parlaklık, yöntem ve kapıdaki ham değerler', () => {
    const r = buildEyeRecord({ plan: 'weekly', eye: 'R', est, fin, correction: 'reading', run, brightness: { from: 0.4321, forced: true }, trialsMax: 28, gateStats: { pauses: 1, pausedMs: 1200, reshows: { moved: 1, band: 0, noDistance: 0, paused: 1 } } })
    expect(r).toMatchObject({
      type: 'va-weekly', eye: 'R', logMAR: 0.123, correction: 'reading', sd: 0.046, trials: 28, algorithm: 'descent-zest-v4',
      distanceTracked: true, meanDistanceMm: 401, cantSee: 3, brightness: { from: 0.432, forced: true }, trialsMax: 28,
      occlusion: { method: 'camera-depth', atGate: { l: 0.12, r: 0.46, dl: 360, dr: 386, state: 'ok' } },
      pauses: { count: 1, ms: 1200, reshows: { moved: 1, band: 0, noDistance: 0, paused: 1 } },
    })
    expect(r.newBaseline).toBeUndefined()
    expect(r.camFailedMidTest).toBeUndefined()
    expect(ALGORITHM).toBe('descent-zest-v4')
    expect(methodEra(r.algorithm)).toBe(4) // yeni seri (S6)
  })
  it('gözün gerçek süresi (sn), "lid-ask" süresi ve kapıdaki yöntem kayda', () => {
    const r = buildEyeRecord({ plan: 'weekly', eye: 'R', est, fin, correction: 'reading', run: { ...run, method: 'self-report', gateMethod: 'camera-depth' }, trialsMax: 28, seconds: 151.6, gateStats: { pauses: 0, pausedMs: 0, lidAskMs: 900, reshows: {} } })
    expect(r).toMatchObject({ seconds: 152, pauses: { lidAskMs: 900 }, occlusion: { method: 'self-report', gateMethod: 'camera-depth' } })
    expect(buildEyeRecord({ plan: 'daily', eye: 'R', est, fin, correction: 'none', run, trialsMax: 20 })).not.toHaveProperty('seconds')
    expect(buildEyeRecord({ plan: 'daily', eye: 'R', est, fin, correction: 'none', run, trialsMax: 20 }).occlusion).not.toHaveProperty('gateMethod')
  })
  it('kamera test ortasında durduysa kamerasız seriye girer (S5)', () => {
    const r = buildEyeRecord({ plan: 'daily', eye: 'L', est, fin, correction: 'none', run: { ...run, camFailedMidTest: true }, trialsMax: 20 })
    expect(r).toMatchObject({ type: 'va-daily', distanceTracked: false, meanDistanceMm: null, camFailedMidTest: true })
  })
  it('kamerasız ölçüm: mesafe izlenmedi; parlaklık okunamadıysa null', () => {
    const r = buildEyeRecord({ plan: 'daily', eye: 'R', est, fin, correction: 'reading', run: { ...run, tracked: false, samples: [], method: 'self-report', atGate: null }, trialsMax: 20 })
    expect(r).toMatchObject({ distanceTracked: false, meanDistanceMm: null, occlusion: { method: 'self-report', atGate: null }, brightness: { from: null, forced: false } })
  })
  it('numaram değişti yalnız gözlük/lensle', () => {
    expect(buildEyeRecord({ plan: 'weekly', eye: 'R', est, fin, correction: 'reading', changed: true, run, trialsMax: 28 }).newBaseline).toBe(true)
    expect(buildEyeRecord({ plan: 'weekly', eye: 'R', est, fin, correction: 'none', changed: true, run, trialsMax: 28 }).newBaseline).toBeUndefined()
  })
  it('kamera izlemiyorsa kapıdaki ham değer yok', () => {
    expect(atGateOf(null)).toBeNull()
  })
})

describe('sesli yönlendirme (S13)', () => {
  it('hazırlıkta düğmenin ilk eksiği → cümle; gözlük, ters renk, tutma ve kapak onayı sessiz', () => {
    expect(setupPhraseId({ ready: true }, 'R')).toBeNull()
    expect(setupPhraseId({ ready: false, reason: 'face' }, 'R')).toBe('acuFace')
    expect(setupPhraseId({ ready: false, reason: 'wrong-eye' }, 'R')).toBe('acuWrong')
    expect(setupPhraseId({ ready: false, reason: 'too-far' }, 'R')).toBe('acuCloser')
    expect(setupPhraseId({ ready: false, reason: 'too-close' }, 'R')).toBe('acuFarther')
    expect(setupPhraseId({ ready: false, reason: 'cover' }, 'L')).toBe('acuCoverR')
    expect(setupPhraseId({ ready: false, reason: 'open' }, 'OU')).toBe('acuBoth')
    for (const reason of ['glasses', 'inverted', 'hold', 'lid']) expect(setupPhraseId({ ready: false, reason }, 'R')).toBeNull()
    expect(setupPhraseId(null, 'R')).toBeNull()
  })
  it('koç: durum oturmadan konuşmaz, arada en az 2,5 sn, aynı cümleyi arka arkaya söylemez', () => {
    const c = createVoiceCoach({ settleMs: 900, minGapMs: 2500 })
    expect(c.next('acuCloser', 0)).toBeNull()
    expect(c.next('acuCloser', 800)).toBeNull()
    expect(c.next('acuCloser', 950)).toBe('acuCloser')
    expect(c.next('acuCloser', 5000)).toBeNull() // tekrar yok
    expect(c.next('acuFarther', 5100)).toBeNull() // oturmadı
    expect(c.next('acuFarther', 6100)).toBe('acuFarther')
    expect(c.next('acuFace', 6200)).toBeNull()
    expect(c.next('acuFace', 7200)).toBeNull() // 2,5 sn dolmadı
    expect(c.next('acuFace', 8700)).toBe('acuFace')
    expect(c.force('acuCoverL', 12000)).toBe(true)
    expect(c.next('acuCoverL', 20000)).toBeNull() // zorla söylenen de tekrar edilmez
    c.reset()
    expect(c.next('acuCoverL', 20000)).toBeNull()
    expect(c.next('acuCoverL', 21000)).toBe('acuCoverL')
  })

  // İnceleme bulgusu V-S1: minGapMs (2,5 sn) cümlelerden kısa; playPhrase yeni cümleye geçerken çalanı durdurur.
  // Süreler modülün kendi tablosundan (PHRASE_MS: ses dosyalarından ölçülen en uzun süre; phraseMs = + pay).
  const SETUP = ['acuCoverL', 'acuCoverR', 'acuBoth', 'acuWrong', 'acuCloser', 'acuFarther', 'acuFace']
  it('hazırlık cümlesi çalan cümleyi kesmez: yenisi ancak çalan cümle bitince (gerçek sürelerle)', () => {
    for (const first of SETUP) {
      for (const then of SETUP) {
        if (then === first) continue
        // açılış cümlesi (zorla) ya da koçun kendi cümlesi; hemen ardından durum değişir
        for (const how of ['force', 'next']) {
          const c = createVoiceCoach()
          let t0 = 0
          if (how === 'force') expect(c.force(first, 0)).toBe(true)
          else {
            for (let t = 0; c.next(first, t) == null; t += 100) t0 = t + 100
          }
          let said = null
          for (let t = t0 + 100; t <= t0 + 10000 && said == null; t += 100) if (c.next(then, t)) said = t
          const end = t0 + phraseMs(first)
          expect(said, `${how} ${first} → ${then}`).toBeGreaterThanOrEqual(end)
          expect(said, `${how} ${first} → ${then}`).toBeLessThan(Math.max(end, t0 + 2500) + 1000) // bitince fazla bekletmez
          expect(c.busyUntil()).toBe(said + phraseMs(then))
        }
      }
    }
    // En uzun cümleler 2,5 sn'den uzun: eski kural (yalnız minGapMs) bunları keserdi
    expect(['acuCoverL', 'acuCoverR', 'acuWrong', 'acuPaused'].every((id) => phraseMs(id) > 2500)).toBe(true)
  })

  it('zorla söylenen cümle yalnız farklı ve daha düşük öncelikli cümleyi keser; aynı cümle baştan başlamaz', () => {
    const c = createVoiceCoach()
    expect(c.force('acuCoverL', 0)).toBe(true)
    expect(c.force('acuPaused', 1000)).toBe(true) // duraklama hazırlık cümlesini keser
    expect(c.busyUntil()).toBe(1000 + phraseMs('acuPaused'))
    expect(c.force('acuPaused', 1500)).toBe(false) // çalan "Test durdu" yarıda kesilip baştan başlamaz
    expect(c.force('acuCoverR', 2000)).toBe(false) // daha düşük öncelikli: duraklama cümlesini kesmez
    expect(c.next('acuCoverR', 3500)).toBeNull() // koç da beklemede
    const end = 1000 + phraseMs('acuPaused')
    expect(c.force('acuCoverR', end)).toBe(true) // bitince söylenir
    expect(c.force('acuCoverL', end + 1000)).toBe(false) // eşit öncelik: çalan örtme cümlesi bitmeden diğeri gelmez
    const m = createVoiceCoach()
    expect(m.force(REST_PHRASE, 0)).toBe(true)
    expect(m.force('acuCoverR', 300)).toBe(true) // mola atlandı: sıradaki gözün cümlesi "Uzağa bak"ı keser
    expect(PHRASE_PRIORITY.acuPaused).toBeGreaterThan(PHRASE_PRIORITY.acuCoverL)
    expect(PHRASE_PRIORITY.acuCoverL).toBeGreaterThan(PHRASE_PRIORITY[REST_PHRASE])
    for (const id of Object.keys(PHRASE_MS)) expect(PHRASE_PRIORITY[id], id).toBeGreaterThan(0)
  })
})
