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

// Dalga döngüsünün başından tek kanallı, sonu kısılan, tepe 0,9'a yükseltilmiş kısa bir parça (saf).
// Yükseltme: ham Dalga tepe ~0,3–0,45; alarm için kısık kalıyordu (Bug 20 HİP-3).
export const SPIKE_PEAK = 0.9
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
  let peak = 0
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]))
  if (peak > 0) { const g = SPIKE_PEAK / peak; for (let i = 0; i < n; i++) out[i] *= g }
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
  // Bug 20 DENEME-1: uygulama paketine gömülü parça (ios/App/App/Sounds, derleme anında _harness ile basıldı)
  const bundled = (m) => run(`paketteki Dalga (${m}), 2 dk`, () => AlarmSpike.schedule({ seconds: 120, sound: `nefona-dalga-${m}.caf` }))
  const copy = () => { navigator.clipboard?.writeText(log.join('\n')).catch(() => {}) }
  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Alarm denemesi">
      <b>Alarm denemesi (yalnız test)</b>
      <p className="muted small">Her seferinde TEK alarm kur. Telefonu sessize al, kilitle, 2 dakika bekle. Çalınca hangi sesin geldiğini not et (Dalga müziği mi, telefonun alarm sesi mi) ve "Nefona'yı aç"a dokun. Sonra "Kopyala" ile sonucu gönder.</p>
      <button className="btn btn-secondary" disabled={busy} onClick={auth}>İzin ve durum</button>
      <button className="btn btn-secondary" disabled={busy} onClick={plain}>Varsayılan sesle 2 dk sonra</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => bundled('sakin')}>Paketteki Sakin sesiyle 2 dk</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => bundled('guc')}>Paketteki Güç sesiyle 2 dk</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => bundled('motive')}>Paketteki Motivasyon sesiyle 2 dk</button>
      <button className="btn btn-secondary" disabled={busy} onClick={dalga}>Library/Sounds Dalga sesiyle 2 dk (1. deneme)</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => run('alarmlar', () => AlarmSpike.list())}>Kurulu alarmlar</button>
      <button className="btn btn-secondary" disabled={busy} onClick={() => run('iptal', () => AlarmSpike.cancelAll())}>Hepsini iptal et</button>
      {log.length > 0 && <pre className="small" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{log.join('\n')}</pre>}
      {log.length > 0 && <button className="btn btn-secondary" onClick={copy}>Kopyala</button>}
    </section>
  )
}
