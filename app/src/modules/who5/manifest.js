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
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Yalnız ilk kayıt (taslak §8); 14 günde bir dolduğu için uzun ara anı yok. VARSAYIM: kanıt Gelişim'in İyi oluş alanı
  // kaynaklarından (components/ProgressOverview.jsx SOURCES_OF.wellbeing).
  nef: {
    name: { tr: { '': 'iyi oluş soruları', ABL: 'iyi oluş sorularından', ACC: 'iyi oluş sorularını', LOC: 'iyi oluş sorularında', DAT: 'iyi oluş sorularına', INS: 'iyi oluş sorularıyla', POSS: 'iyi oluş soruların', 'POSS-ABL': 'iyi oluş sorularından' } },
    moments: ['firstTime'],
    evidence: ['topp2015', 'eser2019'],
    note: 'İyi oluş soruları (WHO-5), 14 günde bir. Düşük puanda Nef yalnız sabit satırı gösterir.',
  },
}
