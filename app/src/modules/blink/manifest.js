// Göz kırpma egzersizi (kuru göz konforu; kanıt: Kim 2020, Wolffsohn 2025). Kayıtları stats.js işler.
export default {
  id: 'blink',
  title: 'Göz kırpma egzersizi',
  label: 'göz kırpma egzersizi',
  ring: 'eye',
  kind: 'exercise',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' },
  // Veri merkezi (lib/dataHub.js) kaydı Göz alanına koyar. Gün listesi ve süre stats.js'te ayrıca işlenir.
  sessions: {
    match: (s) => s?.type === 'blink',
    countsTowardGoal: true,
    describe: (s) => ({ title: 'Göz kırpma egzersizi', detail: Number.isFinite(s?.detectedClosures) ? `${s.detectedClosures} kırpma algılandı` : '' }),
  },
  gates: {}, // göz kırpma dinlendirici; bütçeye sayılmaz, molada açık
  home: { section: 'exercise', order: 90 },
  // "Bana hatırlat" (bildirim PLAN.v1 §A.1 modül tablosu; metin lib/remindTexts.js, sahip onaylı metin-B1a-onay.md).
  // Kendi rotası, hareket penceresi (09.00–21.00). VARSAYIM: defaultTime yok (FALLBACK_TIME).
  remind: { route: 'blink', window: 'move', science: ['kim2020', 'wolffsohn2025'] },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  nef: {
    name: { tr: { '': 'göz kırpma egzersizi', ABL: 'göz kırpma egzersizinden', ACC: 'göz kırpma egzersizini', LOC: 'göz kırpma egzersizinde', DAT: 'göz kırpma egzersizine', INS: 'göz kırpma egzersiziyle', POSS: 'göz kırpma egzersizin', 'POSS-ABL': 'göz kırpma egzersizinden' } },
    moments: ['firstTime', 'returnAfterGap'],
    evidence: ['kim2020', 'wolffsohn2025'],
    note: 'Göz kırpma egzersizi; kayıt yalnız gün olarak okunur, sayı söylenmez.',
  },
}
