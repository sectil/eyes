// Uyku sesi oturumu (Bug 22): alarm kurulumundaki "Kur" dokunuşunda başlar, uyku ekranı (Dalga) ona bağlanır.
// iOS sesi yalnız dokunuşun İÇİNDE başlatır; alarmı kurmak (AlarmKit) beklemeli olduğundan müzik alarmdan ÖNCE,
// aynı dokunuşta başlatılır. Alarm kurulamazsa durdurulur.
import { createSleepPlayer } from './dalgaSleep.js'
import { setAudioSessionType } from './audioUnmute.js'

let cur = null

// seconds: çalma süresi (sn). minutes: uyku ekranı ve günlük için (kesirli olabilir)
export function startSleepSession({ seconds, auto = false }) {
  stopSleepSession()
  setAudioSessionType('playback') // sessiz tuşunda da çalsın (Dalga motoru da böyle yapar)
  const player = createSleepPlayer()
  const run = player.start({ mode: 'sakin', totalSec: seconds })
  cur = { player, minutes: seconds / 60, auto, run }
  return cur
}
// Uyku ekranı oturumu devralır (bir kez)
export function takeSleepSession() {
  const c = cur && cur.player.phase !== 'stopped' ? cur : null
  cur = null
  return c
}
export function stopSleepSession() {
  cur?.player.stop()
  cur = null
}
