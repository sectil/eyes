// WAV kodlayıcı (16 bit PCM, iç içe kanallar). Saf; Uint8Array döndürür.
export function encodeWav(channels, sampleRate) {
  const nch = channels.length
  const n = channels[0].length
  const bytes = 44 + n * nch * 2
  const buf = new Uint8Array(bytes)
  const dv = new DataView(buf.buffer)
  const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)) }
  str(0, 'RIFF')
  dv.setUint32(4, bytes - 8, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true)
  dv.setUint16(22, nch, true)
  dv.setUint32(24, sampleRate, true)
  dv.setUint32(28, sampleRate * nch * 2, true)
  dv.setUint16(32, nch * 2, true)
  dv.setUint16(34, 16, true)
  str(36, 'data')
  dv.setUint32(40, n * nch * 2, true)
  let o = 44
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nch; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]))
      dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true)
      o += 2
    }
  }
  return buf
}
