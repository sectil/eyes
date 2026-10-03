// Yakala Yaz mikrofonu (kelime-hafiza/PLAN.md §6): dinleme iki kelime duyulup oturunca ya da 4 sn sessizlikte biter; duyulan
// metin alana yazılır, kişi düzeltip kendisi gönderir (otomatik gönderme yok). Ses telefondan çıkmaz: başlatma
// lib/native.js startSpeech(…, { strictOnDevice: true }) ile; cihaz içi çalışamıyorsa başlamaz, klavyeye düşülür.
// Ses, konuşma metni ve mikrofon kullanımı Nef'e, sunucuya ve Gelişim'e gitmez; kayıtta yalnız denemenin mode alanı.

export const SILENCE_MS = 4000
// İki kelime duyulduktan sonra metnin değişmeden durması gereken süre. iOS ara sonucu harf harf büyütür ("zarf üz" →
// "zarf üzüm"); ikinci kelime görünür görünmez bitirmek onu yarım bırakıyordu (cihaz, sahip 2026-10-03: "Zarf üz")
export const SETTLE_MS = 1000

// Duyulan metnin ilk iki kelimesi (harf ve rakam dışı atılır; büyük harf korunur, denetim checkAnswer'da)
export function firstTwo(text = '') {
  return String(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 2).join(' ')
}

// start(onResult, onLevel) → Promise<stop>; onText(metin) her ara sonuçta; onLevel(0–1) ses seviyesi; onDone({ text, heard,
// failed }) bir kez.
// failed: başlatılamadı (izin yok, cihaz içi yok): mikrofon bu turda gizlenir, klavye sürer.
export function createListener({ start, onText, onLevel, onDone, silenceMs = SILENCE_MS, settleMs = SETTLE_MS, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let stopFn = null
  let timer = null
  let text = ''
  let ended = false

  const end = (failed = false) => {
    if (ended) return
    ended = true
    if (timer) clearTimer(timer)
    timer = null
    const s = stopFn
    stopFn = null
    Promise.resolve(s?.()).catch(() => {})
    onDone?.({ text, heard: text.length > 0, failed })
  }
  const arm = (ms = silenceMs) => {
    if (timer) clearTimer(timer)
    timer = setTimer(() => end(), ms)
  }
  // İki kelimeden önce her ara sonuç sessizlik süresini yeniler; iki kelimeden sonra yalnız metin değişince kısa bekleme
  // yeniden başlar (aynı metnin tekrarı beklemeyi uzatmaz). Son sonuç ya da hata hemen bitirir.
  const onResult = (r) => {
    if (ended) return
    const t = firstTwo(r?.text ?? '')
    const changed = Boolean(t) && t !== text
    if (changed) {
      text = t
      onText?.(text)
    }
    if (r?.isFinal || r?.error) end()
    else if (text.split(' ').length < 2) arm()
    else if (changed) arm(settleMs)
  }

  arm()
  Promise.resolve()
    .then(() => start(onResult, (l) => { if (!ended) onLevel?.(l) }))
    .then((s) => {
      if (ended) Promise.resolve(s?.()).catch(() => {})
      else stopFn = s
    })
    .catch(() => end(true))

  return { stop: () => end(), get ended() { return ended } }
}
