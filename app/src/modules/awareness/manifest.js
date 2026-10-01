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
}
