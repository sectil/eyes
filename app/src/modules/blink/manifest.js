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
}
