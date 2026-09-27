// Giriş ekranı (components/IntroFilm.jsx, lib/introStill.js): hareketsiz tek kare, ilk açılışta bir kez.
// Sürüm: yeni giriş gelince güncelleyen kullanıcı da bir kez görsün. Eski kayıtta version yok → 1 sayılır.
// 2: "Oscar" filmi (2026-09-26; Bug 11). 3: film kaldırıldı, hareketsiz giriş ekranı (2026-09-27).
export const INTRO_VERSION = 3
// Hareket olmadığı için "hareketi azalt" tercihinden bağımsız gösterilir.
export function shouldPlayIntro(settings) {
  const i = settings?.intro
  return !i?.seen || (i.version ?? 1) < INTRO_VERSION
}
