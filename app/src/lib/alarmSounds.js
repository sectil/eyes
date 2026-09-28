// Alarm sesleri (Artifact "Nefona Alarm" v3). Yeni ses = bu listeye bir satır + ios/App/App/Sounds/ içine dosya
// (uygulama paketinde, ≤ 30 sn; Library/Sounds'a yazılan dosya AlarmKit'te çalmadı — HATA_GUNLUGU Bug 20).
// iOS kendi alarm seslerini (Radar, Zil…) başka uygulamaya adla vermez: "Telefonun alarm sesi" yalnız varsayılandır.
//   file: paketteki dosya adı (AlarmKit .named, bildirimde sound, önizlemede AVAudioPlayer); null = iOS varsayılanı
import { MODES } from './dalga.js'

export const PHONE_SOUND = 'phone'
export const ALARM_SOUNDS = [
  { id: PHONE_SOUND, name: 'Telefonun alarm sesi', sub: 'iOS varsayılanı', file: null },
  { id: 'dalga-sakin', name: `Dalga · ${MODES.sakin.name}`, sub: 'yavaş piyano', file: 'nefona-dalga-sakin.wav' },
  { id: 'dalga-guc', name: `Dalga · ${MODES.guc.name}`, sub: 'yükselen akorlar', file: 'nefona-dalga-guc.wav' },
  { id: 'dalga-motive', name: `Dalga · ${MODES.motive.name}`, sub: 'hızlı tempo', file: 'nefona-dalga-motive.wav' },
]
// VARSAYIM (deneme 2 sonucu bekleniyor): paketteki Dalga sesi alarmda çalar. Çalmazsa bu satır PHONE_SOUND olur.
export const DEFAULT_SOUND = 'dalga-motive'

export const soundById = (id) => ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0]
