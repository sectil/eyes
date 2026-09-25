// iPhone sessiz modda Web Audio'yu kısar; çalan bir HTML <audio> öğesi varken WebKit ses oturumunu "medya"ya alır
// ve Web Audio da duyulur. Burada duyulmayan (tamamen sessiz) kısa bir WAV döngüde çalınır. Kullanıcı dokunuşu
// içinde çağrılmalı (iOS kuralı). VARSAYIM: WKWebView'de de geçerli; cihazda doğrulanacak.
let tag = null
let url = null

// 0,5 sn, 8 kHz, 8 bit, tek kanal sessizlik (örnek değeri 128 = sıfır)
export function silentWav(seconds = 0.5, rate = 8000) {
  const n = Math.floor(seconds * rate)
  const buf = new Uint8Array(44 + n)
  const dv = new DataView(buf.buffer)
  const str = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  dv.setUint32(4, 36 + n, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true) // PCM
  dv.setUint16(22, 1, true) // mono
  dv.setUint32(24, rate, true)
  dv.setUint32(28, rate, true) // bayt hızı
  dv.setUint16(32, 1, true) // blok
  dv.setUint16(34, 8, true) // bit
  str(36, 'data')
  dv.setUint32(40, n, true)
  buf.fill(128, 44)
  return buf
}

export function mediaKeepAlive(on) {
  try {
    if (on) {
      if (!tag) {
        if (typeof document === 'undefined' || typeof Blob === 'undefined') return
        url = url ?? URL.createObjectURL(new Blob([silentWav()], { type: 'audio/wav' }))
        tag = document.createElement('audio')
        tag.setAttribute('playsinline', '')
        tag.setAttribute('x-webkit-airplay', 'deny')
        tag.preload = 'auto'
        tag.loop = true
        tag.src = url
      }
      tag.play()?.catch?.(() => {})
    } else {
      tag?.pause()
    }
  } catch {
    // desteklenmiyor: Web Audio yine çalar, yalnız sessiz modda susabilir
  }
}
