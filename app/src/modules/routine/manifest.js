// Egzersiz setleri (Hafif / Normal / Tam / Derin) ve Bugünün yolu egzersiz grupları. Tek modül, tek ekran.
// Kayıtları stats.js işler.
import { SETS, PATH_GROUPS } from '../../lib/routines.js'
import { isSameDay } from '../../lib/today.js'

// Yoldaki yerleri (lib/today.js ORDER): Isınma başta, Uzağa bakış ve Yakın–uzak 1. bölümde, Daire ve
// Göz kırpma 2. bölümde (molanın ardından). Daire yol uzarsa düşen son duraktır (R7).
const PATH_PLACE = {
  isinma: { slot: 'warmup', order: 10 },
  uzak: { slot: 'body', order: 30 },
  yakinuzak: { slot: 'body', order: 50 },
  daire: { slot: 'body', order: 70, dropRank: 3 },
  kirpma: { slot: 'body', order: 90 },
}

export default {
  id: 'routine',
  routes: [...SETS, ...PATH_GROUPS].map((s) => `routine-${s.id}`),
  title: 'Egzersiz setleri',
  label(route) {
    const set = [...SETS, ...PATH_GROUPS].find((s) => `routine-${s.id}` === route)
    if (!set) return 'egzersiz seti'
    return set.group ? `${set.title.toLocaleLowerCase('tr')} egzersizi` : `${set.title.toLocaleLowerCase('tr')} egzersiz seti`
  },
  ring: 'eye',
  kind: 'exercise',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' },
  gates: { gaze: true, eyeBudget: 'eye' },
  home: { section: 'exercise', order: 10 },
  // Yolun gövdesi: beş kısa grup, her biri ayrı durak; bugün o grubun kaydı varsa tamam.
  today({ sessions, now }) {
    const doneIds = new Set(sessions.filter((s) => s.type === 'routine' && isSameDay(s, now)).map((s) => s.setId))
    return PATH_GROUPS.map((g) => ({
      key: g.id,
      title: g.title,
      minutes: 1,
      glyph: g.glyph,
      route: `routine-${g.id}`,
      done: doneIds.has(g.id),
      ...PATH_PLACE[g.id],
    }))
  },
}
