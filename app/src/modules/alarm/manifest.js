// Nefona alarmı (Artifact "Nefona Alarm" v3): akşam Ana sayfa kartı → kurulum → uyku sesi → sabah. Ana sayfa
// listelerinde satırı yok (kart kendisi). Kayıtları sessions'a değil alarm günlüğüne (lib/alarmLog.js); veri merkezi
// uyanma ve sabah cevabı günlerini "İyi oluş" alanına koyar (alarmHabits). Sağlık iddiası yok.
import { ALARM_KEY, ALARM_LOG_KEY } from '../../lib/alarmLog.js'

export default {
  id: 'alarm',
  // alarm: kurulum (Ana sayfadan) · alarm-pro: aynı kurulum Profil → Alarm'dan · alarm-sleep / alarm-sleep-pro: uyku sesi (Dalga uyku ekranı; -pro Profil'e döner) · alarm-morning: "Nefona'yı aç" sonrası
  routes: ['alarm', 'alarm-pro', 'alarm-sleep', 'alarm-sleep-pro', 'alarm-morning'],
  title: 'Alarm',
  label: 'alarm',
  ring: 'life',
  kind: 'practice',
  progress: { domain: 'wellbeing' },
  gates: {},
  storageKeys: [ALARM_KEY, ALARM_LOG_KEY],
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // Sahip kararı 2026-10-01: Nef alarmı anmaz (kayıt Nef'in okuduğu yerde değil). Genel an ve kanıt yok;
  // modules/nef.contract.test.js NEF_SILENT istisnası.
  nef: {
    name: { tr: { '': 'alarm', ABL: 'alarmdan', ACC: 'alarmı', LOC: 'alarmda', DAT: 'alarma', INS: 'alarmla' } },
    moments: [],
    evidence: [],
    note: 'Sabah alarmı ve uyku sesi; kayıt alarm günlüğünde. Nef uyku hakkında yorum yapmaz.',
  },
}
