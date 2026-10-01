// 1 dakikalık mola (BILDIRIM_PLANI.md §2 "Mola", §5): kalk → uzağa yürü → uzağa bak → göz kırp. Bildirimden,
// çalışma oturumundan ve Ana sayfadan açılır. Yaşam halkası; sağlık iddiası yok ("uzağa bak" adımının dayanağı
// bir mola düzeni çalışması: Galinsky 2007).
// Kayıt store.sessions'a YAZILMAZ (lib/habitLog.js): Nef'e, seriye ve haftalık hedefe girmez; bu yüzden
// sessions ve coach yok. Bildirim sisteminin telefondaki anahtarları da burada durur: "Tüm verileri sil"
// onları bu listeden temizler (sözleşme §1).
import { HABIT_KEY } from '../../lib/habitLog.js'
import { NOTIFY_LOG_KEY, NOTIFY_SEED_KEY } from '../../lib/notifyLog.js'
import { FOCUS_KEY } from '../../lib/focus.js'

export default {
  id: 'mola',
  routes: ['mola'],
  title: 'Mola',
  label: '1 dakikalık mola',
  ring: 'life',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi). Ölçüm kartı
  // Gelişim'de bildirim günlüğünden gelir (lib/notifyLog.js evaluate), modül metriği değil.
  progress: { domain: 'body' },
  gates: {}, // mola dinlendirici; göz bütçesine sayılmaz, molada açık
  storageKeys: [HABIT_KEY, NOTIFY_LOG_KEY, NOTIFY_SEED_KEY, FOCUS_KEY],
  home: { section: 'practice', order: 5 },
}
