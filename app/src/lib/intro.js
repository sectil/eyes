// Giriş filmi (components/IntroFilm.jsx): 15 sn, sessiz, yalnızca ilk açılışta. Yazı zamanlaması burada test edilir.
export const INTRO_MS = 15000
export const INTRO_END_MS = 14800 // logo ve düğmelerin belirdiği an
export const INTRO_SCRIPT = [
  [200, 'Bak.'], [1800, 'Çıkar.'], [3300, 'Koş.'], [4400, 'Fark et.'], [6500, 'Yine.'], [8900, 'Bir daha.'],
  [9900, 'Hatırla.'], [11000, 'Hayal et.'], [13300, 'Uç.'], [14600, ''],
]

// Hareket azaltma açıksa film oynamaz (yalnızca logo + düğme); daha önce izlendiyse oynamaz.
export function shouldPlayIntro(settings, reducedMotion = false) {
  if (reducedMotion) return false
  return !settings?.intro?.seen
}

export function captionAt(ms, script = INTRO_SCRIPT) {
  let cap = ''
  for (const [at, text] of script) if (ms >= at) cap = text
  return cap
}
