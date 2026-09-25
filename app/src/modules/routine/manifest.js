// Egzersiz setleri (Hafif / Normal / Tam). Tek modül, üç ekran. Kayıtları stats.js işler.
import { SETS } from '../../lib/routines.js'

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
}
