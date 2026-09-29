// Kısa E testi ("E hangi yönde", sağ + sol göz; eski adı "Günlük test"). Kayıtları tests deposuna gider (tür
// 'va-daily', eski kayıtlarla aynı); Gelişim'de stats.js ve trend.js işler.
// Karar 2026-09-29 (sahibi: "E testi haftada bir olacak, her gün değil"; YAPILACAKLAR "Sonsuz yol ve ilk 5 saniye",
// karar 1): E testi ilk günden haftada bir (modules/weekly). Bu test Bugün'ün yolundan çıktı; Ana sayfa → Ölçüm
// listesinde isteğe bağlı kalır. Kimlik, rota ve kayıt türü değişmedi (eski kayıtlar, Nef'in eski cevapları).
export default {
  id: 'daily',
  title: 'Kısa E testi',
  label: 'kısa E testi',
  ring: 'eye',
  kind: 'measure',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' }, // görme keskinliği lib/progress.js eyeCard (trend.js) ile
  gates: { eyeBudget: 'test' },
  ask: { after: ['lastExam'] }, // ilk E testinden sonra son muayene
  home: { section: 'measure', order: 20 },
  // Bugünün yolunda yok (karar 2026-09-29): yolun ölçüm adımı yalnız haftalık E testi. Her göz yine bittiği an
  // kaydedilir (S4); yarım kalırsa Ana sayfa satırı "Kalan: Sol göz" der (view.jsx), Bugün kartı değil.
  today() {
    return null
  },
}
