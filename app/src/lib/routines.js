// Egzersiz setleri — basit, tek komutlu adımlar.
// kind 'evidence': kontrollü çalışmada yakınmaları azalttığı gösterilmiş (göz kırpma).
// kind 'comfort'  : göz konforu / aktif mola; kanıt karışık veya zayıf, iddia yok.
// kind 'relax'    : rahatlama hareketi; görmeyi iyileştirdiğine dair kanıt YOK, iddia yok.
// Kaynaklar: docs/arastirma/SENTEZ_RAPORU.md §2, §12, §14.

export const EXERCISES = {
  lookRight: { title: 'Sağa bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'right', kind: 'relax' },
  lookLeft: { title: 'Sola bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'left', kind: 'relax' },
  lookUp: { title: 'Yukarı bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'up', kind: 'relax' },
  lookDown: { title: 'Aşağı bak', sub: 'Başını çevirmeden', seconds: 5, visual: 'arrow', dir: 'down', kind: 'relax' },
  circleCw: { title: 'Gözlerini saat yönünde çevir', sub: 'Havada yavaşça bir daire çiz', seconds: 10, visual: 'circle', dir: 'cw', kind: 'relax' },
  circleCcw: { title: 'Şimdi ters yöne çevir', sub: 'Yavaş ve rahat', seconds: 10, visual: 'circle', dir: 'ccw', kind: 'relax' },
  farLook: { title: 'Uzağa bak', sub: 'Pencereden 6 metreden uzak bir noktaya', seconds: 20, visual: 'far', kind: 'comfort' },
  nearFar: { title: 'Yakın – uzak', sub: 'Başparmağına 3 sn, uzağa 3 sn; tekrarla', seconds: 18, visual: 'nearfar', kind: 'comfort' },
  blink: { title: 'Tam göz kırp', sub: 'Kapat · hafifçe sık · aç — ritimle', seconds: 20, visual: 'blink', kind: 'evidence', closed: true },
  rest: { title: 'Gözlerini kapat', sub: 'Avuçlarını hafifçe üstüne koyabilirsin', seconds: 10, visual: 'rest', kind: 'relax', closed: true },
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
]

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
