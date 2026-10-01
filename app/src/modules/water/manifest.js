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
}
