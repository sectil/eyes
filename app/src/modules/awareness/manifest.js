// Farkındalık merkezi: dikkat halkasındaki modülleri (ring 'attention') toplar. Kendi kaydı yok.
// Yeni bir dikkat modülü takılınca burada kendiliğinden görünür.
export default {
  id: 'awareness',
  title: 'Farkındalık',
  label: 'Farkındalık merkezi',
  ring: 'attention',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'awareness' },
  gates: {},
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Sahip kararı 2026-10-01: Nef Farkındalık merkezini anmaz (kendi kaydı yok). Genel an ve kanıt yok;
  // modules/nef.contract.test.js NEF_SILENT istisnası.
  nef: {
    name: { tr: { '': 'Farkındalık merkezi', ABL: 'Farkındalık merkezinden', ACC: 'Farkındalık merkezini', LOC: 'Farkındalık merkezinde', DAT: 'Farkındalık merkezine', INS: 'Farkındalık merkeziyle' } },
    moments: [],
    evidence: [],
    note: 'Dikkat halkasındaki modülleri toplayan merkez; kendi kaydı yok.',
  },
}
