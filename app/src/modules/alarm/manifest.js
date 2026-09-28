// Nefona alarmı (Artifact "Nefona Alarm" v3): akşam Ana sayfa kartı → kurulum → uyku sesi → sabah. Ana sayfa
// listelerinde satırı yok (kart kendisi). Kayıtları sessions'a değil alarm günlüğüne (lib/alarmLog.js); veri merkezi
// uyanma ve sabah cevabı günlerini "İyi oluş" alanına koyar (alarmHabits). Sağlık iddiası yok.
import { ALARM_KEY, ALARM_LOG_KEY } from '../../lib/alarmLog.js'

export default {
  id: 'alarm',
  // alarm: kurulum · alarm-sleep: uyku sesi (Dalga uyku ekranı) · alarm-morning: "Nefona'yı aç" sonrası
  routes: ['alarm', 'alarm-sleep', 'alarm-morning'],
  title: 'Alarm',
  label: 'alarm',
  ring: 'life',
  kind: 'practice',
  progress: { domain: 'wellbeing' },
  gates: {},
  storageKeys: [ALARM_KEY, ALARM_LOG_KEY],
}
