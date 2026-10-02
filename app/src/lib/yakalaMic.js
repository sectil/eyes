// Yakala Yaz mikrofonu (kelime-hafiza/PLAN.md §6): dinleme iki kelime duyulunca ya da 4 sn sessizlikte biter; duyulan
// metin alana yazılır, kişi düzeltip kendisi gönderir (otomatik gönderme yok). Ses telefondan çıkmaz: başlatma
// lib/native.js startSpeech(…, { strictOnDevice: true }) ile; cihaz içi çalışamıyorsa başlamaz, klavyeye düşülür.
// Ses, konuşma metni ve mikrofon kullanımı Nef'e, sunucuya ve Gelişim'e gitmez; kayıtta yalnız denemenin mode alanı.

export const SILENCE_MS = 4000

// Duyulan metnin ilk iki kelimesi (harf ve rakam dışı atılır; büyük harf korunur, denetim checkAnswer'da)
export function firstTwo(text = '') {
  return String(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 2).join(' ')
}

// start(onResult) → Promise<stop>; onText(metin) her ara sonuçta; onDone({ text, heard, failed }) bir kez.
// failed: başlatılamadı (izin yok, cihaz içi yok): mikrofon bu turda gizlenir, klavye sürer.
export function createListener({ start, onText, onDone, silenceMs = SILENCE_MS, setTimer = setTimeout, clearTimer = clearTimeout }) {
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
  const arm = () => {
    if (timer) clearTimer(timer)
    timer = setTimer(() => end(), silenceMs)
  }
  const onResult = (r) => {
    if (ended) return
    const t = firstTwo(r?.text ?? '')
    if (t && t !== text) {
      text = t
      onText?.(text)
    }
    if (text.split(' ').length >= 2 || r?.isFinal || r?.error) end()
    else arm()
  }

  arm()
  Promise.resolve()
    .then(() => start(onResult))
    .then((s) => {
      if (ended) Promise.resolve(s?.()).catch(() => {})
      else stopFn = s
    })
    .catch(() => end(true))

  return { stop: () => end(), get ended() { return ended } }
}
