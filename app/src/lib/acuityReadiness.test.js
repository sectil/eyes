import { describe, it, expect } from 'vitest'
import { acuityReadiness, occFromSnapshot, FALLBACK_MS, WEAR_OPTIONS, COVER_METHODS } from './acuityReadiness.js'
import { createOcclusionMonitor, GATE_MS } from './occlusion.js'
import { inCountBand } from './trialGate.js'

// Onaylı tasarımın (nefona-e-testi.html) varsayılan sahnesi: sağ göz, okuma gözlüğü geçen seferki, kamera,
// avuç derinlikle doğrulandı, 39 cm.
const OK_OCC = { status: 'ok', method: 'depth', holdMs: 1500, lidAsk: false, sinceFaceMs: 0 }
function base(over = {}) {
  return {
    eye: 'R',
    eyeIdx: 0,
    correction: 'reading',
    correctionFrom: 'last',
    inverted: false,
    cam: { error: null, face: true },
    occ: OK_OCC,
    distance: { mm: 390, tracked: true },
    selfConfirm: { distance: false, cover: false },
    ...over,
  }
}
const occ = (o) => ({ ...OK_OCC, ...o })
const row = (r, key) => r.rows.find((x) => x.key === key)
const texts = (r) => [
  r.button.text,
  ...r.rows.flatMap((x) => [x.label, x.value, x.trailing?.text].filter(Boolean)),
  ...(r.notice ? [r.notice.title, r.notice.body] : []),
]

describe('onaylı tasarımın durumları (G, C, D satırları ve düğme metni birebir)', () => {
  it('p-ready: üç satır yeşil, tek düğme "Başla"', () => {
    const r = acuityReadiness(base())
    expect(r.rows).toEqual([
      { key: 'glasses', status: 'ok', label: 'Gözlük · geçen seferki', value: 'Okuma gözlüğü', trailing: { type: 'action', text: 'Değiştir', action: 'glasses' } },
      { key: 'cover', status: 'ok', label: 'Örtme · kamera doğruladı', value: 'Sol göz örtülü' },
      { key: 'distance', status: 'ok', label: 'Mesafe · hedef 40 cm', value: 'Tam yerinde', trailing: { type: 'value', text: '39 cm' } },
    ])
    expect(r.button).toEqual({ ready: true, kind: 'go', reason: null, text: 'Başla', targetRow: null, action: 'start' })
    expect(r.method).toBe('camera-depth')
    expect(r.mode).toBe('camera')
    expect(r.notice).toBeNull()
  })
  it('p-none: gözlük seçilmedi + örtme tamam → "Önce gözlüğünü seç" (şikâyet: Başla sessizce kapalıydı)', () => {
    const r = acuityReadiness(base({ correction: null, correctionFrom: null }))
    expect(row(r, 'glasses')).toEqual({ key: 'glasses', status: 'bad', label: 'Gözlük', value: 'Seçilmedi', trailing: { type: 'action', text: 'Seç ›', action: 'glasses' } })
    expect(row(r, 'cover')).toMatchObject({ status: 'ok', value: 'Sol göz örtülü' })
    expect(r.button).toMatchObject({ ready: false, kind: 'need', text: 'Önce gözlüğünü seç', targetRow: 'glasses', action: 'glasses' })
    expect(r.method).toBeNull()
    for (const t of texts(r)) expect(t).not.toMatch(/başlayabilirsin/i)
  })
  it('p-legacy: eski "gözlüklü" kaydı ön seçilmez, "Hangisi?" diye sorulur', () => {
    const r = acuityReadiness(base({ correction: 'glasses', correctionFrom: 'legacy' }))
    expect(row(r, 'glasses')).toEqual({ key: 'glasses', status: 'bad', label: 'Gözlük · geçen sefer gözlüklüydün', value: 'Hangisi?', trailing: { type: 'action', text: 'Seç ›', action: 'glasses' } })
    expect(r.button.text).toBe('Önce gözlüğünü seç')
  })
  it('p-face: yüz yok → örtme "Yüzün aranıyor", düğme "Yüzünü kameraya göster"', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'no-face', method: null, holdMs: 0 }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'wait', label: 'Örtme', value: 'Yüzün aranıyor' })
    expect(r.button).toMatchObject({ ready: false, kind: 'need', text: 'Yüzünü kameraya göster', targetRow: 'cover' })
  })
  it('p-cover: örtülmedi → "Sol gözünü avucunla ört" (satır ve düğme aynı emir)', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'uncovered', method: null, holdMs: 0, sinceFaceMs: 1200 }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'wait', label: 'Örtme', value: 'Sol gözünü avucunla ört' })
    expect(r.button).toMatchObject({ kind: 'need', text: 'Sol gözünü avucunla ört', targetRow: 'cover' })
  })
  it('p-wrong: yanlış göz → satır sesli cümlenin aynısı "Yanlış göz. Diğer gözünü ört", düğme yalnız işi söyler "Sol gözünü ört"', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'wrong-eye', method: null, holdMs: 0 }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'bad', label: 'Örtme', value: 'Yanlış göz. Diğer gözünü ört' })
    expect(r.button).toMatchObject({ kind: 'need', text: 'Sol gözünü ört', targetRow: 'cover' })
    // İnceleme bulgusu V-N8: ekranda "Yanlış göz" bir kez (satırda); düğme tekrar etmez
    const all = texts(r).join(' | ')
    expect(all.match(/Yanlış göz/g)).toHaveLength(1)
  })
  it('p-lid: kapak yolu → "Örtme · bir gözün kapalı" / "Sol mu?", düğme "Evet, sol gözüm kapalı" (dokunmak onay)', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'lid-ask', method: null, holdMs: 0, lidAsk: true }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'wait', label: 'Örtme · bir gözün kapalı', value: 'Sol mu?' })
    expect(r.button).toEqual({ ready: false, kind: 'confirm', reason: 'lid', text: 'Evet, sol gözüm kapalı', targetRow: 'cover', action: 'confirm-lid' })
    expect(r.method).toBeNull()
  })
  it('p-hold: örtme tamam ama 1 sn dolmadı → "Böyle kal…" ve dolan halka', () => {
    const r = acuityReadiness(base({ occ: occ({ holdMs: 400 }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'wait', label: 'Örtme', value: 'Böyle kal…', trailing: { type: 'ring', progress: 0.4 } })
    expect(r.button).toMatchObject({ ready: false, kind: 'hold', text: 'Böyle kal…', targetRow: 'cover', progress: 0.4 })
  })
  it('p-far: 52 cm → satır "Biraz yaklaştır" + "52 cm", düğme "Biraz yaklaştır · 40 cm"', () => {
    const r = acuityReadiness(base({ distance: { mm: 520, tracked: true } }))
    expect(row(r, 'distance')).toEqual({ key: 'distance', status: 'bad', label: 'Mesafe · hedef 40 cm', value: 'Biraz yaklaştır', trailing: { type: 'value', text: '52 cm' } })
    expect(r.button).toMatchObject({ kind: 'need', text: 'Biraz yaklaştır · 40 cm', targetRow: 'distance' })
  })
  it('p-fb (S8): yüz 4 sn görünür ama doğrulanmadı → "Örttüysen onayla" ve "Örttüm"; düğme emri söyler', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'uncovered', method: null, holdMs: 0, sinceFaceMs: FALLBACK_MS }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'wait', label: 'Örtme · kamera doğrulayamadı', value: 'Örttüysen onayla', trailing: { type: 'action', text: 'Örttüm', action: 'self-cover' } })
    expect(r.button.text).toBe('Sol gözünü avucunla ört')
  })
  it('p-left (2/3): gözlük kilitli, "Sağ göz örtülü"', () => {
    const r = acuityReadiness(base({ eye: 'L', eyeIdx: 1 }))
    expect(row(r, 'glasses')).toEqual({ key: 'glasses', status: 'ok', label: 'Gözlük · test boyunca aynı', value: 'Okuma gözlüğü' })
    expect(row(r, 'cover')).toMatchObject({ status: 'ok', label: 'Örtme · kamera doğruladı', value: 'Sağ göz örtülü' })
    expect(r.button.text).toBe('Başla')
  })
  it('p-both (3/3): "İki gözün açık", Başla; yöntem none (iki göz testinde örtme yok)', () => {
    const r = acuityReadiness(base({ eye: 'OU', eyeIdx: 2, occ: occ({ method: 'open' }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'ok', label: 'Örtme', value: 'İki gözün açık' })
    expect(r.button.text).toBe('Başla')
    expect(r.method).toBe('none')
  })
  it('p-nocam: kamera açılamadı → kendin-onay satırları; örtme onaylı, mesafe değil → "Telefonu 40 cm tuttuğunu onayla"', () => {
    const r = acuityReadiness(base({ cam: { error: 'load', face: false }, occ: null, distance: { mm: null, tracked: true }, selfConfirm: { cover: true, distance: false } }))
    expect(r.mode).toBe('self')
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'ok', label: 'Örtme · senin onayın', value: 'Sol gözüm örtülü', trailing: { type: 'toggle', on: true, action: 'self-cover' } })
    expect(row(r, 'distance')).toEqual({ key: 'distance', status: 'wait', label: 'Mesafe · kitap okur gibi', value: '40 cm tutuyorum', trailing: { type: 'toggle', on: false, action: 'self-distance' } })
    expect(r.button).toMatchObject({ ready: false, kind: 'need', text: 'Telefonu 40 cm tuttuğunu onayla', targetRow: 'distance' })
    expect(r.notice).toEqual({ key: 'camera', title: 'Kamera açılamadı', body: 'Kamera izni kapalıysa: Ayarlar → Nefona → Kamera.' })
  })
})

describe('düğme öncelik sırası (PLAN 4 E2)', () => {
  // Her şey eksik: öncelik sırasıyla birer birer düzeltilir, düğme her adımda bir sonraki eksiği söyler
  it('1 ters renk → 2 gözlük → 3 yüz → 4 yanlış göz → 5 örtme → 6 kapak onayı → 7 tutma → 8 mesafe → 10 Başla', () => {
    const s = base({ inverted: true, correction: null, correctionFrom: null, occ: occ({ status: 'no-face', holdMs: 0, method: null }), distance: { mm: null, tracked: true } })
    const step = (o) => acuityReadiness({ ...s, ...o }).button.text
    expect(step({})).toBe('Renkleri ters çevirmeyi kapat')
    Object.assign(s, { inverted: false })
    expect(step({})).toBe('Önce gözlüğünü seç')
    Object.assign(s, { correction: 'reading' })
    expect(step({})).toBe('Yüzünü kameraya göster')
    Object.assign(s, { occ: occ({ status: 'wrong-eye', holdMs: 0, method: null }), distance: { mm: 300, tracked: true } })
    expect(step({})).toBe('Sol gözünü ört')
    Object.assign(s, { occ: occ({ status: 'uncovered', holdMs: 0, method: null }) })
    expect(step({})).toBe('Sol gözünü avucunla ört')
    Object.assign(s, { occ: occ({ status: 'lid-ask', holdMs: 0, method: null, lidAsk: true }) })
    expect(step({})).toBe('Evet, sol gözüm kapalı')
    Object.assign(s, { occ: occ({ status: 'ok', method: 'lid', holdMs: 200 }) })
    expect(step({})).toBe('Böyle kal…')
    Object.assign(s, { occ: occ({ status: 'ok', method: 'lid', holdMs: GATE_MS }) })
    expect(step({})).toBe('Biraz uzaklaştır · 40 cm')
    Object.assign(s, { distance: { mm: 400, tracked: true } })
    expect(step({})).toBe('Başla')
  })
  it('iki göz testi: 8 mesafe → 9 "İki gözünü de açık tut" → tutma → Başla', () => {
    const s = base({ eye: 'OU', eyeIdx: 2, occ: occ({ status: 'closed', method: null, holdMs: 0 }), distance: { mm: 470, tracked: true } })
    expect(acuityReadiness(s).button.text).toBe('Biraz yaklaştır · 40 cm')
    s.distance = { mm: 400, tracked: true }
    const closed = acuityReadiness(s)
    expect(closed.button).toMatchObject({ text: 'İki gözünü de açık tut', targetRow: 'cover' })
    expect(row(closed, 'cover')).toEqual({ key: 'cover', status: 'bad', label: 'Örtme', value: 'İki gözünü de açık tut' })
    s.occ = occ({ status: 'ok', method: 'open', holdMs: 500 })
    expect(acuityReadiness(s).button).toMatchObject({ kind: 'hold', text: 'Böyle kal…', progress: 0.5 })
    s.occ = occ({ status: 'ok', method: 'open', holdMs: GATE_MS })
    expect(acuityReadiness(s).button.text).toBe('Başla')
  })
  it('ters renk açıkken hiçbir durumda başlamaz (S12) ve nedeni yazar', () => {
    const r = acuityReadiness(base({ inverted: true }))
    expect(r.button).toMatchObject({ ready: false, kind: 'need', text: 'Renkleri ters çevirmeyi kapat' })
    expect(r.notice).toEqual({ key: 'inverted', title: 'Renkleri ters çevirme açık.', body: 'Ölçüm için kapat: Ayarlar → Erişilebilirlik.' })
    expect(acuityReadiness(base({ inverted: true, cam: { error: 'load' }, selfConfirm: { cover: true, distance: true } })).button.ready).toBe(false)
  })
  it('sol göz testi: sağ örtülür → "Sağ gözünü avucunla ört", "Sağ gözünü ört", "Evet, sağ gözüm kapalı", "Sağ mı?"', () => {
    const L = (o) => acuityReadiness(base({ eye: 'L', eyeIdx: 1, occ: occ(o) }))
    expect(L({ status: 'uncovered', holdMs: 0 }).button.text).toBe('Sağ gözünü avucunla ört')
    expect(L({ status: 'wrong-eye', holdMs: 0 }).button.text).toBe('Sağ gözünü ört')
    expect(row(L({ status: 'wrong-eye', holdMs: 0 }), 'cover').value).toBe('Yanlış göz. Diğer gözünü ört')
    const lid = L({ status: 'lid-ask', holdMs: 0 })
    expect(lid.button.text).toBe('Evet, sağ gözüm kapalı')
    expect(row(lid, 'cover').value).toBe('Sağ mı?')
  })
  it('mesafe bandı 36–44 cm (S1): 360 ve 440 içeride; 359 uzaklaştır, 441 yaklaştır', () => {
    const at = (mm) => acuityReadiness(base({ distance: { mm, tracked: true } })).button.text
    expect(at(360)).toBe('Başla')
    expect(at(440)).toBe('Başla')
    expect(at(359)).toBe('Biraz uzaklaştır · 40 cm')
    expect(at(441)).toBe('Biraz yaklaştır · 40 cm')
    expect(row(acuityReadiness(base({ distance: { mm: 331, tracked: true } })), 'distance')).toMatchObject({ status: 'bad', value: 'Biraz uzaklaştır', trailing: { type: 'value', text: '33 cm' } })
  })
  // Üçüncü inceleme (2. doğrulayıcı, cm yuvarlaması): 441–444 mm'de satır "Biraz yaklaştır" yanında "44 cm", 355–359 mm'de "36 cm" yazıyordu
  it('mesafe satırının sayısı durumla çelişmez: bant dışındayken 36–44 cm yazmaz', () => {
    const r = (mm) => row(acuityReadiness(base({ distance: { mm, tracked: true } })), 'distance')
    expect(r(441)).toMatchObject({ status: 'bad', value: 'Biraz yaklaştır', trailing: { text: '45 cm' } })
    expect(r(444.9)).toMatchObject({ status: 'bad', value: 'Biraz yaklaştır', trailing: { text: '45 cm' } })
    expect(r(355)).toMatchObject({ status: 'bad', value: 'Biraz uzaklaştır', trailing: { text: '35 cm' } })
    expect(r(359.9)).toMatchObject({ status: 'bad', value: 'Biraz uzaklaştır', trailing: { text: '35 cm' } })
    expect(r(440)).toMatchObject({ status: 'ok', value: 'Tam yerinde', trailing: { text: '44 cm' } })
    expect(r(360)).toMatchObject({ status: 'ok', value: 'Tam yerinde', trailing: { text: '36 cm' } })
    for (let mm = 300; mm <= 500; mm += 0.5) {
      const x = r(mm)
      const cm = Number(x.trailing.text.split(' ')[0])
      expect(cm >= 36 && cm <= 44, `${mm} mm → ${x.value} ${x.trailing.text}`).toBe(x.status === 'ok')
    }
    // hazırlık denemedeki kapının bandını kullanır (lib/trialGate.js inCountBand): sınırın bir ulp dışı da bant dışı
    // (400 × 1,1 = 440,00000000000006 olduğu için eski ±%10 hesabı bunu bant içi sayıyordu)
    for (const mm of [360 - 2 ** -44, 360, 440, 440 + 2 ** -44]) {
      expect(r(mm).status === 'ok', `${mm}`).toBe(inCountBand(mm))
      expect(acuityReadiness(base({ distance: { mm, tracked: true } })).button.ready, `${mm}`).toBe(inCountBand(mm))
    }
  })
  it('avuçla ARKit yüzü düşse de (cam.face false) derinlik mesafesi ve tarafı varsa yüz istenmez', () => {
    const r = acuityReadiness(base({ cam: { error: null, face: false } }))
    expect(r.button.text).toBe('Başla')
  })
  it('mesafe ölçülemiyorsa yüz istenir; satır "Bekleniyor" / "— cm"', () => {
    const r = acuityReadiness(base({ distance: { mm: null, tracked: true } }))
    expect(r.button).toMatchObject({ text: 'Yüzünü kameraya göster', targetRow: 'distance' })
    expect(row(r, 'distance')).toEqual({ key: 'distance', status: 'wait', label: 'Mesafe · hedef 40 cm', value: 'Bekleniyor', trailing: { type: 'value', text: '— cm' } })
  })
})

describe('kapak yolu: taraf gerçek gibi yazılmaz, onay dürüst kaydedilir (S8)', () => {
  it('onay + 1 sn → satır "Örtme · senin onayın / Sol gözüm kapalı" (kamera doğruladı DEMEZ), yöntem camera-lid+self', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'ok', method: 'lid', holdMs: GATE_MS }) }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'ok', label: 'Örtme · senin onayın', value: 'Sol gözüm kapalı' })
    expect(r.button.text).toBe('Başla')
    expect(r.method).toBe('camera-lid+self')
  })
  it('onay beklerken hiçbir metin tarafı gerçek gibi söylemez', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'lid-ask', method: null, holdMs: 0 }) }))
    for (const t of texts(r)) expect(t).not.toMatch(/(sol|sağ) göz (örtülü|kapalı)/i)
  })
})

describe('"Örttüm" yedeği (S8)', () => {
  const unc = (ms, o = {}) => base({ occ: occ({ status: 'uncovered', method: null, holdMs: 0, sinceFaceMs: ms }), ...o })
  it('4 sn dolmadan çıkmaz; tam 4 sn\'de çıkar', () => {
    expect(row(acuityReadiness(unc(FALLBACK_MS - 1)), 'cover').value).toBe('Sol gözünü avucunla ört')
    expect(row(acuityReadiness(unc(FALLBACK_MS)), 'cover').trailing).toEqual({ type: 'action', text: 'Örttüm', action: 'self-cover' })
    expect(FALLBACK_MS).toBe(4000)
  })
  it('belirsiz durumda da çıkar; yanlış gözde ve kapak sorusunda çıkmaz', () => {
    expect(row(acuityReadiness(base({ occ: occ({ status: 'unclear', holdMs: 0, sinceFaceMs: 5000 }) })), 'cover').value).toBe('Örttüysen onayla')
    expect(row(acuityReadiness(base({ occ: occ({ status: 'wrong-eye', holdMs: 0, sinceFaceMs: 9000 }) })), 'cover').value).toBe('Yanlış göz. Diğer gözünü ört')
    expect(row(acuityReadiness(base({ occ: occ({ status: 'lid-ask', holdMs: 0, sinceFaceMs: 9000 }) })), 'cover').value).toBe('Sol mu?')
  })
  it('"Örttüm" sonrası: satır senin onayın, tutma yok, Başla; yöntem camera-self', () => {
    const r = acuityReadiness(unc(6000, { selfConfirm: { cover: true, distance: false } }))
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'ok', label: 'Örtme · senin onayın', value: 'Sol gözüm örtülü', trailing: { type: 'toggle', on: true, action: 'self-cover' } })
    expect(r.button.text).toBe('Başla')
    expect(r.method).toBe('camera-self')
  })
  it('onay yanlış gözü geçemez: derinlik yanlış tarafı görürse düğme yine örtülecek gözü söyler', () => {
    const r = acuityReadiness(base({ occ: occ({ status: 'wrong-eye', holdMs: 0 }), selfConfirm: { cover: true, distance: false } }))
    expect(r.button.text).toBe('Sol gözünü ört')
    expect(r.method).toBeNull()
  })
  it('onaydan sonra kamera derinlikle doğrularsa yöntem camera-depth (daha güçlü kanıt)', () => {
    const r = acuityReadiness(base({ selfConfirm: { cover: true, distance: false } }))
    expect(r.method).toBe('camera-depth')
  })
})

describe('kamerasız (cam.error ya da mesafe izlenmiyor): kendin-onay (E4, S5)', () => {
  const nocam = (sc, o = {}) => base({ cam: { error: 'permission', face: false }, occ: occ({ status: 'no-face' }), distance: { mm: null, tracked: true }, selfConfirm: sc, ...o })
  it('iki madde eksik → "2 maddeyi onayla"; örtme eksik → "Sol gözünün örtülü olduğunu onayla"; ikisi de → Başla, self-report', () => {
    expect(acuityReadiness(nocam({ cover: false, distance: false })).button).toMatchObject({ text: '2 maddeyi onayla', targetRow: 'cover', ready: false })
    expect(acuityReadiness(nocam({ cover: false, distance: true })).button.text).toBe('Sol gözünün örtülü olduğunu onayla')
    expect(acuityReadiness(nocam({ cover: true, distance: false })).button.text).toBe('Telefonu 40 cm tuttuğunu onayla')
    const ok = acuityReadiness(nocam({ cover: true, distance: true }))
    expect(ok.button).toMatchObject({ ready: true, text: 'Başla' })
    expect(ok.method).toBe('self-report')
  })
  it('kamera hatası varken örtme izleyicisinin "yüz yok" durumu testi kilitlemez (PLAN 1.7)', () => {
    const r = acuityReadiness(nocam({ cover: true, distance: true }))
    expect(texts(r)).not.toContain('Yüzünü kameraya göster')
    expect(row(r, 'cover').value).toBe('Sol gözüm örtülü')
  })
  it('kamerasız devam seçilmiş (tracked false, hata yok): aynı kendin-onay', () => {
    const r = acuityReadiness(base({ occ: null, distance: { mm: null, tracked: false }, selfConfirm: { cover: false, distance: false } }))
    expect(r.mode).toBe('self')
    expect(r.button.text).toBe('2 maddeyi onayla')
    expect(r.notice).toBeNull()
  })
  it('kamerasız iki göz: yalnız mesafe onayı; örtme satırı alt satırla aynı "İki gözünü de açık tut"', () => {
    const r = acuityReadiness(nocam({ cover: false, distance: false }, { eye: 'OU', eyeIdx: 2 }))
    expect(r.button.text).toBe('Telefonu 40 cm tuttuğunu onayla')
    expect(row(r, 'cover')).toEqual({ key: 'cover', status: 'ok', label: 'Örtme', value: 'İki gözünü de açık tut' })
    const go = acuityReadiness(nocam({ cover: false, distance: true }, { eye: 'OU', eyeIdx: 2 }))
    expect(go.button.text).toBe('Başla')
    expect(go.method).toBe('none')
  })
  it('kamera var ama örtme izlenmiyor (web): mesafe kamerayla, örtme onayla; yöntem self-report', () => {
    const s = base({ occ: null, selfConfirm: { cover: false, distance: false } })
    expect(acuityReadiness(s).button.text).toBe('Sol gözünün örtülü olduğunu onayla')
    s.selfConfirm = { cover: true, distance: false }
    const r = acuityReadiness(s)
    expect(r.button.text).toBe('Başla')
    expect(r.method).toBe('self-report')
    expect(row(r, 'distance').label).toBe('Mesafe · hedef 40 cm')
  })
})

describe('gözlük satırı (S10 ön seçim kaynağı)', () => {
  it('profil cevabından gelen seçim "profilinden", bu oturumda seçilen düz "Gözlük"', () => {
    expect(row(acuityReadiness(base({ correction: 'progressive', correctionFrom: 'profile' })), 'glasses')).toMatchObject({ label: 'Gözlük · profilinden', value: 'Progresif / bifokal' })
    expect(row(acuityReadiness(base({ correction: 'none', correctionFrom: null })), 'glasses')).toMatchObject({ label: 'Gözlük', value: 'Gözlüksüz', trailing: { text: 'Değiştir' } })
  })
  it('seçenekler E3 sayfasıyla aynı 5 metin', () => {
    expect(WEAR_OPTIONS.map((w) => w.text)).toEqual(['Gözlüksüz', 'Okuma gözlüğü', 'Progresif / bifokal', 'Yalnız uzak gözlüğü', 'Lens'])
  })
})

// Geniş tarama: her durum bileşiminde değişmezler (hatalar toplanır, sonda tek karşılaştırma: hızlı)
describe('değişmezler (tarama)', () => {
  const STATUSES = ['ok', 'no-face', 'closed', 'uncovered', 'wrong-eye', 'lid-ask', 'unclear']
  const OCCS = [null, ...STATUSES.flatMap((status) => ['depth', 'lid', 'open'].flatMap((method) => [0, 600, GATE_MS].flatMap((holdMs) => [0, FALLBACK_MS].map((sinceFaceMs) => ({ status, method, holdMs, sinceFaceMs })))))]
  const CAMS = [{ error: null, tracked: true }, { error: 'permission', tracked: true }, { error: null, tracked: false }]
  function* all() {
    for (const eye of ['R', 'L', 'OU']) {
      for (const correction of [null, 'reading', 'glasses']) {
        for (const inverted of [false, true]) {
          for (const c of CAMS) {
            for (const o of OCCS) {
              for (const mm of [null, 300, 400, 500]) {
                for (const cover of [false, true]) {
                  for (const distance of [false, true]) {
                    yield { eye, eyeIdx: eye === 'R' ? 0 : eye === 'L' ? 1 : 2, correction, inverted, cam: { error: c.error, face: mm != null }, occ: o, distance: { mm, tracked: c.tracked }, selfConfirm: { cover, distance } }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  function violations(s, r) {
    const v = []
    const keys = r.rows.map((x) => x.key).join(',')
    if (keys !== 'glasses,cover,distance') v.push('satır sırası ' + keys)
    for (const t of texts(r)) if (/başlayabilirsin/i.test(t)) v.push('başlayabilirsin: ' + t)
    if (r.button.ready !== (r.button.text === 'Başla')) v.push('hazır ⇎ Başla')
    if (r.button.ready !== (r.button.kind === 'go')) v.push('hazır ⇎ go')
    if (r.button.ready) {
      if (s.inverted) v.push('ters renkte hazır')
      if (s.correction !== 'reading') v.push('gözlüksüz hazır')
      if (s.eye === 'OU' ? r.method !== 'none' : !COVER_METHODS.includes(r.method)) v.push('yöntem ' + r.method)
      if (r.mode === 'self' && !s.selfConfirm.distance) v.push('kamerasız, mesafe onaysız hazır')
      if (r.mode === 'camera' && !(s.distance.mm >= 360 && s.distance.mm <= 440)) v.push('bant dışında hazır')
      if (r.mode === 'camera' && s.eye !== 'OU' && s.occ && s.occ.status === 'wrong-eye') v.push('yanlış gözde hazır')
    } else {
      if (r.method !== null) v.push('hazır değil ama yöntem ' + r.method)
      if (!r.button.text) v.push('boş düğme')
      if (r.button.targetRow != null ? !keys.split(',').includes(r.button.targetRow) : r.button.text !== 'Renkleri ters çevirmeyi kapat') v.push('hedef satır ' + r.button.targetRow)
    }
    return v
  }
  it('hiçbir metin "başlayabilirsin" demez; hazır ⇔ "Başla"; hazırsa yöntem dürüst ve dolu; hazır değilse düğme eksik satırı gösterir', () => {
    let n = 0
    const bad = []
    for (const s of all()) {
      n += 1
      const v = violations(s, acuityReadiness(s))
      if (v.length && bad.length < 5) bad.push({ s, v })
    }
    expect(bad).toEqual([])
    expect(n).toBeGreaterThan(10000)
  })
})

describe('gerçek örtme izleyicisiyle (lib/occlusion.js) uçtan uca', () => {
  const frame = (l, r) => ({ face: true, blinkLeft: l, blinkRight: r })
  const ready = (snap) => acuityReadiness(base({ occ: occFromSnapshot(snap) }))
  it('kapak yolu: onaysız Başla açılmaz; onay → Böyle kal… → Başla, camera-lid+self', () => {
    const m = createOcclusionMonitor('L')
    let s = null
    for (let t = 0; t <= 3000; t += 33) s = m.push(frame(0.05, 0.92), t) // sağ kapalı (sol örtülmeliydi): taraf bilinmez
    expect(ready(s).button).toMatchObject({ kind: 'confirm', text: 'Evet, sol gözüm kapalı' })
    s = m.confirmLid(3010)
    expect(ready(s).button.text).toBe('Böyle kal…')
    for (let t = 3043; t <= 3010 + GATE_MS + 50; t += 33) s = m.push(frame(0.05, 0.92), t)
    const r = ready(s)
    expect(r.button.text).toBe('Başla')
    expect(r.method).toBe('camera-lid+self')
  })
  it('avuç yolu (derinlik): kamera doğruladı, camera-depth', () => {
    const m = createOcclusionMonitor('L')
    let s = null
    for (let t = 0; t <= 1200; t += 100) s = m.pushDepth({ eyesKnown: true, leftMm: 370, rightMm: 400 }, t)
    const r = ready(s)
    expect(row(r, 'cover').label).toBe('Örtme · kamera doğruladı')
    expect(r.method).toBe('camera-depth')
  })
  it('iki göz açık 4 sn → "Örttüm" yedeği', () => {
    const m = createOcclusionMonitor('L')
    let s = null
    for (let t = 0; t <= 4100; t += 33) s = m.push(frame(0.05, 0.05), t)
    expect(row(ready(s), 'cover').trailing?.text).toBe('Örttüm')
  })
  it('izleniyor ama henüz kare yok (snapshot null) → yüz aranıyor', () => {
    expect(occFromSnapshot(null)).toMatchObject({ status: 'no-face' })
    expect(ready(null).button.text).toBe('Yüzünü kameraya göster')
  })
})
