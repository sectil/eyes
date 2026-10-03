// Sonsuz yolun merdivenleri (SONSUZ_YOL.PLAN.v1 §3.A.3–A.7; arastirma-v1/merdiven.md §4.2, §5). Saf veri ve küçük
// yardımcılar; depoya ve ekrana dokunmaz. Basamak seçimi lib/progression.js stageOf'tadır.
//
// Biçim:
//   LADDERS[id] = { steps: [basamak, …], variants?: [çeşitleme, …], … }
//   basamak    = { from: D eşiği, id, …içerik }        D ≥ from olan son basamak geçerlidir (D: modülün yapıldığı ayrı
//                                                       gün sayısı, bugün sayılmaz)
//   çeşitleme  = { from: Dvar eşiği, id, …içerik }     Dvar = min(D, Dstage + VAR_LAG); eski kullanıcıda çeşitlemeler
//                                                       güncellemeden sonra 7, 14, 28 ve 42 çalışma gününde açılır (§A.10)
// Merdiven bitince sonsuzluğu çeşitlemeler ve döndürme (rotate) taşır. Bütün eşikler VARSAYIM'dır (plan §3.J).
// Ekrandaki metinler etki söylemez; başlıklar yalnız hareketin adıdır.

export const VAR_LAG = 14 // Dvar = min(D, Dstage + 14) (§A.2, §A.10)
export const SOFT_GAP = 14 // son yapılan günden ≥ 14 takvim günü sonra o gün bir basamak aşağı (§A.8-1)
export const GROUP_CAP_SEC = 75 // bir göz grubunun en uzun içeriği (yol payı 1 dk; VARSAYIM, cihazda ölçülecek)

// Nefes: yolun arası (§A.4). Süre basamakları D ile, kalıp katmanları Dvar ile. Yolda en çok 3 dk (onaylı yoga planı
// karar 5.1); mola yine 5 dk'dır, kalanı "2 dk daha" ya da gözler kapalı dinlenme. Kalıbı lib/breathMix.js üretir.
//   tier 'A': yalnız Sakin ritim (ilk 3 seansta kademe, lib/breath.js RAMP_SESSIONS)
//   tier 'B': "Günün ritmi", tutmasız aileler · 'C': + Vızıltı, Burun değiştir, kısa tutma · 'D': + yumuşak kutu
const breath = {
  pathCapMin: 3,
  steps: [
    { from: 0, id: 'N1', minutes: 1 },
    { from: 1, id: 'N2', minutes: 2 },
    { from: 2, id: 'N3', minutes: 3 },
  ],
  variants: [
    { from: 7, id: 'B', tier: 'B' },
    { from: 21, id: 'C', tier: 'C' },
    { from: 42, id: 'D', tier: 'D' },
  ],
}

// Göz egzersizleri (§A.6). Grup: { key, title, glyph, steps: [EXERCISES kimliği, …], rotate? }. `isinma` anahtarı
// basamakla büyür (K2'de "Sağ–sol", K3'ten "Isınma"): yeni kimlik gerekmez, kayıt eşlemesi (setId) değişmez. Tek yeni
// grup `dikey`'dir (Yukarı–aşağı). K7'den başlayarak Daire ile Yukarı–aşağı gün aşırı gelir (rotate 'donus').
// Yollardaki yerleri (slot, order) modules/routine/manifest.js'tedir; dikey 2. bölümde, Daire'nin yerinde (order 70).
const G = {
  sagsol: { key: 'isinma', title: 'Sağ–sol', glyph: 'arrows', steps: ['lookRight', 'lookLeft', 'rest'] },
  isinma: { key: 'isinma', title: 'Isınma', glyph: 'arrows', steps: ['blink', 'lookRight', 'lookLeft'] },
  uzak: { key: 'uzak', title: 'Uzağa bakış', glyph: 'far', steps: ['farLook', 'rest'] },
  yakinuzak: { key: 'yakinuzak', title: 'Yakın–uzak', glyph: 'nearfar', steps: ['nearFar', 'farLook'] },
  dikey: { key: 'dikey', title: 'Yukarı–aşağı', glyph: 'updown', steps: ['lookUp', 'lookDown', 'rest'] },
  daire: { key: 'daire', title: 'Daire', glyph: 'circle', steps: ['circleCw', 'circleCcw', 'rest'] },
  kirpma: { key: 'kirpma', title: 'Göz kırpma', glyph: 'lid', steps: ['blink', 'rest'] },
}
const donus = (g) => ({ ...g, rotate: 'donus' })
const routine = {
  groupCapSec: GROUP_CAP_SEC,
  steps: [
    { from: 0, id: 'K1', groups: [G.kirpma] },
    { from: 1, id: 'K2', groups: [G.sagsol, G.kirpma] },
    { from: 2, id: 'K3', groups: [G.isinma, G.kirpma] },
    { from: 3, id: 'K4', groups: [G.isinma, G.dikey, G.kirpma] },
    { from: 4, id: 'K5', groups: [G.isinma, G.uzak, G.dikey, G.kirpma] },
    { from: 6, id: 'K6', groups: [G.isinma, G.uzak, G.yakinuzak, G.dikey, G.kirpma] },
    { from: 8, id: 'K7', groups: [G.isinma, G.uzak, G.yakinuzak, donus(G.daire), donus(G.dikey), G.kirpma] },
  ],
  // Çeşitleme yaması grup grup: { [grup]: { [adım]: EXERCISES alanlarının üstüne } }. Çeşitlemeler birikir (V3, V1'in
  // kırpmasını 15'e çıkarır). seconds, TrueDepth olmayan cihazda adımın süresidir; tekrar sayısıyla birlikte büyür
  // (kırpma 4 sn/tekrar, yakın–uzak 3 sn/geçiş, daire 5 sn/tur: lib/routines.js'teki oranlar).
  // weekly: haftada bir gün (tohumla seçilir) 'mixDay' Isınma adımlarının sırası değişir; 'fullSetDay' tam set günü.
  variants: [
    { from: 21, id: 'V1', patch: { kirpma: { blink: { blinks: 10, seconds: 40 } } } },
    {
      from: 28,
      id: 'V2',
      patch: {
        isinma: { lookRight: { seconds: 8 }, lookLeft: { seconds: 8 } },
        dikey: { lookUp: { seconds: 8 }, lookDown: { seconds: 8 } },
        uzak: { farLook: { seconds: 30 } },
        yakinuzak: { farLook: { seconds: 30 } },
      },
      weekly: 'mixDay',
    },
    {
      from: 42,
      id: 'V3',
      patch: {
        kirpma: { blink: { blinks: 15, seconds: 60 } },
        yakinuzak: { nearFar: { switches: 10, seconds: 30 } },
        daire: { circleCw: { laps: 3, seconds: 15 }, circleCcw: { laps: 3, seconds: 15 } },
      },
    },
    { from: 56, id: 'V4', weekly: 'fullSetDay' },
  ],
}

// Fark Ettin mi? sahne merdiveni (fark-ettin-mi/PLAN.md §2). Basamak sahne açar ve "Ne değişti?" kare sayısını belirler;
// çeşitleme V1 yağmurlu caddeyi, V2 tabela değişikliğini ekler. Basamağı lib/street.js sceneStage seçer (stageOf ile).
// badge: false → yol "Yeni" rozeti ve güncelleme günü bu merdivene bakmaz (açılma günü rozeti UNLOCK ile aynen kalır;
// yeni sahne yol durağının alt satırında görünür: PLAN §4, METINLER Y2). Eşikler VARSAYIM (PLAN §2).
const farkEttin = {
  badge: false,
  steps: [
    { from: 0, id: 'F1', scenes: ['cadde'], frames: 3 },
    { from: 2, id: 'F2', scenes: ['cadde'], frames: 4 },
    { from: 4, id: 'F3', scenes: ['cadde', 'pazar'], frames: 4 },
    { from: 7, id: 'F4', scenes: ['cadde', 'pazar', 'park'], frames: 4 },
    { from: 10, id: 'F5', scenes: ['cadde', 'pazar', 'park', 'aksam'], frames: 4 },
  ],
  variants: [
    { from: 14, id: 'V1', scene: 'yagmur' },
    { from: 21, id: 'V2', kind: 'tabela' },
  ],
}

export const LADDERS = { breath, routine, 'fark-ettin': farkEttin }

// Açılma eşikleri: pathDay (yola ait kaydı olan ayrı gün sayısı, bugün sayılmaz) en az bu kadar olmalı (§A.3, §A.7).
// Her gün açan yeni kullanıcıda Yılan ve Bugünün görevi 2., Fark Ettin mi? 6., Tek Bakışta 8. gün gelir. VARSAYIM.
export const UNLOCK = { snake: 1, notice: 1, 'okuma-anlama': 2, 'fark-ettin': 5, 'tek-bakis': 7, 'yakala-yaz': 9 }

// "Yeni" rozeti (lib/progression.js newStopKeys). DAY_ONE: 1. günden yolda olan duraklar hiç "Yeni" olmaz (1. günde
// rozet yok; 1. gün atlanıp ertesi gün yine gelince de yeni değil). UPDATE_NEW: eski kullanıcının güncelleme gününde Y1
// öncesi yolda olmayanlar: göz egzersizlerinde Yukarı–aşağı grubu, nefesin "Günün ritmi" (null: durağın tamamı, kalıp
// katmanı varsa) ve hiç yapılmamışsa Bugünün görevi (Y1 öncesi yalnız bir kez yapılmışsa yoldaydı).
export const DAY_ONE = ['weekly', 'track']
export const UPDATE_NEW = { routine: ['dikey'], breath: null, notice: null }

// Güvenli sınırlar (§A.5): ladders.test.js ve breathMix.test.js bunlarla denetler.
export const LIMITS = {
  breathPathMaxMin: 3,
  blinksMax: 15, // Wolffsohn 2025: 15 tekrar en iyi; üstü denenmedi
  lapsMax: 3, // VARSAYIM; baş oynamadan
}

// Birikmiş çeşitleme yaması (0..index): { [grup]: { [adım]: alanlar } }
export function mergePatches(variants = [], index = -1) {
  const out = {}
  for (const v of variants.slice(0, index + 1)) {
    for (const [g, steps] of Object.entries(v.patch ?? {})) {
      out[g] ??= {}
      for (const [id, fields] of Object.entries(steps)) out[g][id] = { ...(out[g][id] ?? {}), ...fields }
    }
  }
  return out
}

// Grubun adımları, yama uygulanmış: [{ id, ...EXERCISES[id], ...yama }]. exercises: lib/routines.js EXERCISES.
export function groupSteps(group, exercises = {}, patch = {}) {
  return (group?.steps ?? []).map((id) => ({ id, ...(exercises[id] ?? {}), ...(patch?.[group.key]?.[id] ?? {}) }))
}

// Grubun içerik süresi (sn): adım süreleri toplamı
export const groupSeconds = (group, exercises = {}, patch = {}) => groupSteps(group, exercises, patch).reduce((a, s) => a + (Number(s.seconds) || 0), 0)
