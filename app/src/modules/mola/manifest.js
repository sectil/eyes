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
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Kayıt alışkanlık günlüğünde (lib/habitLog.js), sessions'ta değil: Nef oradan okur (records; sahip kararı 2026-10-01).
  // Kanıt: mola ekranının kaynağı
  // (view.jsx galinsky2007) ve mola bildirim metinleri (lib/remindTexts.js nudge.mola).
  nef: {
    name: { tr: { '': '1 dakikalık mola', ABL: '1 dakikalık moladan', ACC: '1 dakikalık molayı', LOC: '1 dakikalık molada', DAT: '1 dakikalık molaya', INS: '1 dakikalık molayla', POSS: '1 dakikalık molan', 'POSS-ABL': '1 dakikalık molandan' } },
    records: { store: 'habits', match: (h) => h?.type === 'mola' },
    moments: ['firstTime', 'returnAfterGap'],
    evidence: ['galinsky2007', 'talens2022', 'morris2020'],
    note: '1 dakikalık mola: kalk, uzağa yürü, uzağa bak, göz kırp. Kayıt alışkanlık günlüğünde, oturum değil.',
  },
}
