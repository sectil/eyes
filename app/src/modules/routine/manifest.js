// Egzersiz setleri (Hafif / Normal / Tam). Tek modül, üç ekran. Kayıtları stats.js işler.
import { SETS, DAILY_GOAL_MIN, setDurationSec, todaySeconds } from '../../lib/routines.js'

export default {
  id: 'routine',
  routes: SETS.map((s) => `routine-${s.id}`),
  title: 'Egzersiz setleri',
  label(route) {
    const set = SETS.find((s) => `routine-${s.id}` === route)
    return set ? `${set.title.toLocaleLowerCase('tr')} egzersiz seti` : 'egzersiz seti'
  },
  ring: 'eye',
  kind: 'exercise',
  gates: { gaze: true, active: true },
  home: { section: 'exercise', order: 10 },
  // Günlük egzersiz hedefi (DAILY_GOAL_MIN). Kalan süreyi kapatan en kısa set önerilir.
  // Nefesli Derin set isteğe bağlı: kullanıcı son egzersizinde onu seçmediyse plan önermez (VARSAYIM).
  today({ sessions, now }) {
    const done = todaySeconds(sessions.filter((s) => s.type !== 'game'), now)
    const left = DAILY_GOAL_MIN * 60 - done
    const lastSet = sessions.filter((s) => s.type === 'routine').at(-1)?.setId
    const pool = SETS.filter((s) => s.id !== 'deep' || s.id === lastSet)
    const set = pool.find((s) => setDurationSec(s) >= left) ?? pool.at(-1)
    if (left <= 0) return { title: 'Egzersiz', minutes: DAILY_GOAL_MIN, done: true }
    return { title: `${set.title} set`, minutes: Math.max(1, Math.round(setDurationSec(set) / 60)), done: false, route: `routine-${set.id}` }
  },
}
