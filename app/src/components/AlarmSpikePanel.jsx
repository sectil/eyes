import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { AlarmSpike } from '../lib/native.js'
import { renderLoop } from '../lib/dalgaSleep.js'
import { encodeWav } from '../lib/wav.js'
import { testUnlock } from '../lib/subscription.js'

// Alarm DENEMESİ (spike, 2026-09-28): yalnız test derlemesinde (VITE_TEST_UNLOCK) ve iOS'ta görünür. Soru: AlarmKit
// sessiz modda çalıyor mu, Dalga sesi (WAV, Library/Sounds) çalınıyor mu, "Nefona'yı aç" uygulamayı açıyor mu.
// Asıl alarm özelliği değil; sonuçlar YAPILACAKLAR "Nefona alarmı"na yazılır, sonra bu panel kaldırılır.
export const SPIKE_SOUND = 'nefona-dalga.wav'
export const SPIKE_SECONDS = 25 // VARSAYIM: AlarmKit ses süresi sınırı belgede yok; bildirimde 30 sn

// Dalga döngüsünün başından tek kanallı, sonu kısılan kısa bir parça (saf)
export function spikeClip(channels, sampleRate, seconds = SPIKE_SECONDS) {
  const n = Math.min(channels[0].length, Math.round(seconds * sampleRate))
  const fade = Math.round(1.5 * sampleRate)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let v = 0
    for (const ch of channels) v += ch[i]
    v /= channels.length
    const k = n - i < fade ? (n - i) / fade : 1
    out[i] = v * k
  }
  return out
}

export function toBase64(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

export default function AlarmSpikePanel({ mode = 'sakin' }) {
  const [log, setLog] = useState([])
  const [busy, setBusy] = useState(false)
  if (!testUnlock() || Capacitor.getPlatform() !== 'ios') return null
  const add = (line) => setLog((l) => [...l, `${new Date().toLocaleTimeString('tr-TR')} ${line}`])
  const run = async (label, fn) => {
    setBusy(true)
    try { add(`${label}: ${JSON.stringify(await fn())}`) } catch (e) { add(`${label} HATA: ${e?.message ?? e}`) }
    setBusy(false)
  }
  const auth = () => run('izin', async () => ({ ...(await AlarmSpike.status()), ...(await AlarmSpike.requestAuth()) }))
  const plain = () => run('varsayılan ses, 2 dk', () => AlarmSpike.schedule({ seconds: 120 }))
  const dalga = () => run(`Dalga (${mode}) sesi, 2 dk`, async () => {
    const { sampleRate, channels } = await renderLoop(mode)
    const wav = encodeWav([spikeClip(channels, sampleRate)], sampleRate)
    const w = await AlarmSpike.writeSound({ name: SPIKE_SOUND, data: toBase64(wav) })
    const s = await AlarmSpike.schedule({ seconds: 120, sound: SPIKE_SOUND })
    return { yazıldı: w.bytes, ...s }
  })
  const copy = () => { navigator.clipboard?.writeText(log.join('\n')).catch(() => {}) }
  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Alarm denemesi">
      <b>Alarm denemesi (yalnız test)</b>
      <p className="muted small">1) İzin ver. 2) Bir alarm kur. 3) Telefonu sessize al, kilitle, 2 dakika bekle. Çalınca "Nefona'yı aç"a dokun. Sonra "Kopyala" ile sonucu gönder.</p>
      <button className="btn btn-secondary" disabled={busy} onClick={auth}>İzin ve durum</button>
      <button className="btn btn-secondary" disabled={busy} onClick={plain}>Varsayılan sesle 2 dk sonra</button>
      <button className="btn btn-secondary" disabled={busy} onClick={dalga}>Dalga sesiyle 2 dk sonra</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => run('alarmlar', () => AlarmSpike.list())}>Kurulu alarmlar</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => run('iptal', () => AlarmSpike.cancelAll())}>Hepsini iptal et</button>
      {log.length > 0 && <pre className="small" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{log.join('\n')}</pre>}
      {log.length > 0 && <button className="btn btn-secondary" onClick={copy}>Kopyala</button>}
    </section>
  )
}
