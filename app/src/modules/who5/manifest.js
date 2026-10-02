// İyi oluş (WHO-5): 5 soru, 14 günde bir. Kayıt sessions'a (type 'who5'); Gelişim İyi oluş alanı ve veri merkezi
// (lib/dataHub.js) buradan okur. Haftalık hedefe ve seriye sayılmaz (anket, egzersiz değil).
import { WHO5_TYPE } from '../../lib/progress.js'

export default {
  id: 'who5',
  title: 'İyi oluş',
  label: 'iyi oluş soruları',
  ring: 'life',
  kind: 'measure',
  progress: { domain: 'wellbeing' }, // puan serisi progress.js who5Card'da (alan kartı özel okur)
  gates: {},
  sessions: {
    match: (s) => s?.type === WHO5_TYPE,
    countsTowardGoal: false,
    describe: (s) => ({ title: 'İyi oluş (WHO-5)', detail: Number.isFinite(s?.score) ? `${s.score} / 100` : '' }),
  },
}
