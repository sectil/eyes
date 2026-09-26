// Göz kırpma egzersizi (kuru göz konforu; kanıt: Kim 2020, Wolffsohn 2025). Kayıtları stats.js işler.
export default {
  id: 'blink',
  title: 'Göz kırpma egzersizi',
  label: 'göz kırpma egzersizi',
  ring: 'eye',
  kind: 'exercise',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' },
  gates: {}, // göz kırpma dinlendirici; bütçeye sayılmaz, molada açık
  home: { section: 'exercise', order: 90 },
}
