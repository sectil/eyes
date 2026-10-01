// Su kaydı (BILDIRIM_PLANI.md §2 "Su"): "Birkaç yudum su?" → İçtim. Yalnız su hatırlatmasından açılır; Ana sayfada
// yok. Göz ya da sağlık iddiası yok, litre hedefi yok. Kayıt store.sessions'a YAZILMAZ (lib/habitLog.js): Nef'e,
// seriye ve haftalık hedefe girmez. Anahtarı (gozolcum:habit-log) mola modülünün storageKeys listesinde.
export default {
  id: 'water',
  routes: ['water'],
  title: 'Su',
  label: 'su kaydı',
  ring: 'life',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi). Ölçüm kartı
  // Gelişim'de bildirim günlüğünden gelir (lib/notifyLog.js evaluate), modül metriği değil.
  progress: { domain: 'body' },
  gates: {},
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Kayıt alışkanlık günlüğünde (lib/habitLog.js), sessions'ta değil: Nef oradan okur (records; sahip kararı 2026-10-01).
  nef: {
    name: { tr: { '': 'su kaydı', ABL: 'su kaydından', ACC: 'su kaydını', LOC: 'su kaydında', DAT: 'su kaydına', INS: 'su kaydıyla', POSS: 'su kaydın', 'POSS-ABL': 'su kaydından' } },
    records: { store: 'habits', match: (h) => h?.type === 'water' },
    moments: ['firstTime', 'returnAfterGap'],
    evidence: ['stout2022'],
    note: 'Su kaydı (İçtim); litre hedefi yok. Kayıt alışkanlık günlüğünde, oturum değil.',
  },
}
