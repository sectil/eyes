// Alarm sesleri (Artifact "Nefona Alarm" v3). Yeni ses = bu listeye bir satır + ios/App/App/Sounds/ içine dosya
// (uygulama paketinde, ≤ 30 sn, CAF 44100 Hz 2 kanal; Library/Sounds'taki ve paketteki 22050 Hz WAV AlarmKit'te çalmadı —
// HATA_GUNLUGU Bug 20; üretim design/alarm-sesleri ve design/uyanma-sesleri).
// Uyandırma sesleri (uyan-*): kanıta dayalı tasarım (design/uyanma-sesleri/README.md; PubMed): melodik (McFarlane 2020),
// ~520 Hz zengin ton melodinin içinde (Bruck 2009, Smith 2019), duyulur başlayıp ~6 sn'de tam sese çıkar (Kaida 2005, dolaylı). Hepsi telefon
// hoparlörü için ölçülerek denetlendi (analyze.py: 500 Hz–4 kHz ≥ %75, −12 LUFS, ≤ −1 dBTP, tık yok).
// iOS kendi alarm seslerini (Radar, Zil…) başka uygulamaya adla vermez: "Telefonun alarm sesi" yalnız varsayılandır.
//   file: paketteki dosya adı (AlarmKit .named, bildirimde sound, önizlemede AVAudioPlayer); null = iOS varsayılanı
import { MODES } from './dalga.js'

export const PHONE_SOUND = 'phone'
export const ALARM_SOUNDS = [
  { id: PHONE_SOUND, name: 'Telefonun alarm sesi', sub: 'iOS varsayılanı', file: null },
  { id: 'uyan-gunisigi', name: 'Gün Işığı', sub: 'melodik, önerilen', file: 'nefona-uyan-gunisigi.caf' },
  { id: 'uyan-kusbahcesi', name: 'Kuş Bahçesi', sub: 'yumuşak, kuş sesli', file: 'nefona-uyan-kusbahcesi.caf' },
  { id: 'uyan-marsi', name: 'Uyanış Marşı', sub: 'canlı, hızlı tempo', file: 'nefona-uyan-marsi.caf' },
  { id: 'dalga-sakin', name: `Dalga · ${MODES.sakin.name}`, sub: 'yavaş piyano, en yumuşak', file: 'nefona-dalga-sakin.caf' },
  { id: 'dalga-guc', name: `Dalga · ${MODES.guc.name}`, sub: 'yükselen akorlar', file: 'nefona-dalga-guc.caf' },
  { id: 'dalga-motive', name: `Dalga · ${MODES.motive.name}`, sub: 'hızlı tempo', file: 'nefona-dalga-motive.caf' },
]
// Yeni kurulumlarda kanıta en yakın ses (McFarlane 2020 uyaranı: 105 BPM, Do majör, vibrafon). Kurulu alarm kendi sesini korur.
export const DEFAULT_SOUND = 'uyan-gunisigi'

export const soundById = (id) => ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0]
