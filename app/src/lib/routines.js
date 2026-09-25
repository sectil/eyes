// Egzersiz setleri — basit, tek komutlu adımlar.
// kind 'evidence': kontrollü çalışmada yakınmaları azalttığı gösterilmiş (göz kırpma).
// kind 'comfort'  : göz konforu / aktif mola; kanıt karışık veya zayıf, iddia yok.
// kind 'relax'    : rahatlama hareketi; görmeyi iyileştirdiğine dair kanıt YOK, iddia yok.
// Kaynaklar: docs/arastirma/SENTEZ_RAPORU.md §2, §12, §14.
// iPhone'da (TrueDepth) bakış, daire, kırpma ve göz kapalı adımları kamerayla takip edilir:
// blinks = hedef kırpma sayısı, laps = hedef tur, switches = yakın↔uzak geçiş (odak mesafesinden). VARSAYIM: 5 kırpma ≈ 20 sn ritim (4 sn/kırpma),
// 2 tur ≈ 10 sn. TrueDepth varken adımlar süreyle İLERLEMEZ: yüz görünmüyorsa sayaç durur ve beklenir.
// TrueDepth yoksa (web / eski iPhone) adım seconds kadar süreyle ilerler.
// subTracked: TrueDepth modunda sub yerine gösterilir (kamera yüzü/kapalı gözü görmeli).
//   Daire adımlarında bakış telefonun dışına taşmalı: ekrandaki küçük halkayı izlemek gözü
//   25–40 cm'de yalnızca ~2–3° döndürür; takip çeyrek saymak için en az CIRCLE_MIN_DEG (6°) ister.
//   VARSAYIM: "telefonun çevresinde" çizilen daire 30 cm'de ≥7° (telefon kenarı ≈ 7–14°); cihazda doğrulanacak.
// say: adım başında seslendirilen metin (yoksa title).

export const EXERCISES = {
  lookRight: { title: 'Sağa bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'right', kind: 'relax' },
  lookLeft: { title: 'Sola bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'left', kind: 'relax' },
  lookUp: { title: 'Yukarı bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'up', kind: 'relax' },
  lookDown: { title: 'Aşağı bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'down', kind: 'relax' },
  circleCw: { title: 'Gözlerini saat yönünde çevir', sub: 'Havada yavaşça bir daire çiz', subTracked: 'Başını oynatmadan gözünle telefonun çevresinde büyük, yavaş bir daire çiz', seconds: 10, visual: 'circle', dir: 'cw', kind: 'relax', laps: 2 },
  circleCcw: { title: 'Şimdi ters yöne çevir', sub: 'Yavaş ve rahat', subTracked: 'Başını oynatmadan gözünle ters yönde büyük, yavaş bir daire çiz', seconds: 10, visual: 'circle', dir: 'ccw', kind: 'relax', laps: 2 },
  farLook: { title: 'Uzağa bak', sub: 'Pencereden 6 metreden uzak bir noktaya', subTracked: 'Telefonu yüzüne dönük tut, üstünden 6 metreden uzağa bak', seconds: 20, visual: 'far', kind: 'comfort' }, // sensör: gözler uzağa odaklıyken süre işler
  nearFar: { title: 'Yakın – uzak', sub: 'Ekrandaki daireye 3 sn, uzağa 3 sn; tekrarla', seconds: 18, visual: 'nearfar', kind: 'comfort', switches: 6 }, // sensör: yakın↔uzak geçiş sayısı
  blink: { title: 'Tam göz kırp', sub: 'Kapat · hafifçe sık · aç — ritimle', seconds: 20, visual: 'blink', kind: 'evidence', closed: true, blinks: 5 },
  // Nefes adımları: süreyle sayar (sensör yok). Ritim 4 sn al / 6 sn ver (lib/breath.js Sakin ritim);
  // görsel ve sesli aşamalar Routine.jsx'te. Kanıt/sınırlar: docs/yol-haritasi/NEFES_FARKINDALIK.md.
  breathCalm: { title: 'Sakin nefes', sub: '4 sn al · 6 sn ver · burnundan', say: 'Sakin nefes. Nefes al, yavaşça ver.', seconds: 60, visual: 'breath', kind: 'calm' },
  breathReset: { title: 'Üç nefes', sub: 'Gözlerini dinlendir: al, ver — üç kez', say: 'Üç nefes.', seconds: 30, visual: 'breath', kind: 'calm' },
  rest: { title: 'Gözlerini kapat', sub: 'Avuçlarını hafifçe üstüne koyabilirsin', subTracked: 'Telefonu yüzüne dönük tut; kamera kapalı gözlerini görmeli', say: 'Gözlerini kapat. Bitince sesle haber vereceğim.', seconds: 10, visual: 'rest', kind: 'relax', closed: true },
}

export const SETS = [
  {
    id: 'lite',
    title: 'Hafif',
    icon: 'leaf',
    color: '#f5c542',
    steps: ['blink', 'farLook', 'lookRight', 'lookLeft', 'rest'],
  },
  {
    id: 'normal',
    title: 'Normal',
    icon: 'thumbs',
    color: '#4f9cf5',
    steps: ['blink', 'lookRight', 'lookLeft', 'lookUp', 'lookDown', 'circleCw', 'farLook', 'nearFar', 'rest'],
  },
  {
    id: 'full',
    title: 'Tam',
    icon: 'dumbbell',
    color: '#ee6b6b',
    steps: ['blink', 'lookRight', 'lookLeft', 'lookUp', 'lookDown', 'circleCw', 'circleCcw', 'farLook', 'nearFar', 'blink', 'lookRight', 'lookLeft', 'farLook', 'nearFar', 'rest'],
  },
  {
    // Derin: göz adımlarının başında/sonunda 1 dk sakin nefes, aralarda üç nefeslik molalar (~4,5 dk).
    // VARSAYIM: mola sayısı ve yeri; nefesin göz egzersizine katkısı kanıtlanmış değil, mola ve
    // farkındalık anı olarak konumlanır (16b raporu).
    id: 'deep',
    title: 'Derin',
    icon: 'wind',
    color: '#19c2d1',
    steps: ['breathCalm', 'blink', 'lookRight', 'lookLeft', 'breathReset', 'lookUp', 'lookDown', 'circleCw', 'breathReset', 'farLook', 'nearFar', 'breathCalm', 'rest'],
  },
]

// Bugünün yolu durakları (lib/today.js): SETS'in yanında 2–3 adımlık kısa gruplar. Her grup yolda ayrı bir
// durak; tamamlanınca { type: 'routine', setId: <grup id> } kaydı düşer. Adımlar yalnızca EXERCISES'ten.
// VARSAYIM: yolda "1 dk" gösterilir (30–38 sn içerik + açılış/bitiş); TrueDepth adımları yüzü bekler.
// glyph: yol durağındaki çizim (components/TodayPath.jsx).
export const PATH_GROUPS = [
  { id: 'isinma', title: 'Isınma', glyph: 'arrows', steps: ['blink', 'lookRight', 'lookLeft'] },
  { id: 'uzak', title: 'Uzağa bakış', glyph: 'far', steps: ['farLook', 'rest'] },
  { id: 'yakinuzak', title: 'Yakın–uzak', glyph: 'nearfar', steps: ['nearFar', 'farLook'] },
  { id: 'daire', title: 'Daire', glyph: 'circle', steps: ['circleCw', 'circleCcw', 'rest'] },
  { id: 'kirpma', title: 'Göz kırpma', glyph: 'lid', steps: ['blink', 'rest'] },
].map((g) => ({ ...g, group: true }))

// setId → set ya da yol grubu (Gelişim, rota)
export const findRoutine = (id) => SETS.find((s) => s.id === id) ?? PATH_GROUPS.find((g) => g.id === id) ?? null

// Günlük antrenman süresi hedefi (dakika). VARSAYIM: rakip uygulamalardaki
// 1–3 dk setlere göre seçildi; bilimsel bir doz değildir.
export const DAILY_GOAL_MIN = 3

export function setDurationSec(set) {
  return set.steps.reduce((a, id) => a + EXERCISES[id].seconds, 0)
}

export function formatMin(sec) {
  if (!sec) return '0 dk'
  const m = Math.round(sec / 60)
  return m < 1 ? '<1 dk' : `${m} dk`
}

// Bugünkü toplam egzersiz süresi (saniye). sessions: { date, type, seconds }
export function todaySeconds(sessions, now = new Date()) {
  const d = now.toDateString()
  return sessions
    .filter((s) => new Date(s.date).toDateString() === d)
    .reduce((a, s) => a + (s.seconds ?? (s.type === 'blink' ? 150 : 0)), 0)
}
