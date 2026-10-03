// Bildirimler (B1a, D14) düzeneği: gerçek modül listesi (registry.reminders) ve uygulamanın ekranları.
// ?s=bos (hiç hatırlatma yok) | kurulu (iki modül, mola) | saat (kurulu + saat sayfası açık, Dalga)
// | dd (kurulu + Dik Dur aralıklı satırı) | ddsaat (dd + Dik Dur saat sayfası, aralıkla) · ?theme=dark
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '/src/styles.css'
import '/src/styles/home.css' // Nef simgesi (.iris-mark); uygulamada Ana sayfa ile zaten yüklü
import Notifications from '/src/screens/Notifications.jsx'
import RemindSheet from '/src/components/RemindSheet.jsx'
import { registry } from '/src/modules/registry.js'

const q = new URLSearchParams(location.search)
document.documentElement.dataset.theme = q.get('theme') || 'light'
const s = q.get('s') || 'kurulu'
const now = new Date(2026, 9, 3, 9, 0)
const modules = registry.reminders()
const kurulu = s !== 'bos'
const cok = s === 'cok' // gerçekçi dolu hâl: dört deney türü ve beş modül, biri birden çok saatli
const dd = s === 'dd' || s === 'ddsaat'
const moduleReminders = kurulu ? {
  blink: { on: true, mode: 'auto', times: ['16:30'], autoAt: now.toISOString() },
  yoga: { on: false, mode: 'manual', times: ['21:30'] },
  ...(dd ? { 'dik-dur': { on: false, mode: 'manual', times: [], interval: { on: true, every: 120, from: '09:00', to: '19:00', days: [1, 2, 3, 4, 5] } } } : {}),
} : undefined
if (cok) Object.assign(moduleReminders, {
  dalga: { on: true, mode: 'manual', times: ['08:00', '13:00', '22:00'] },
  gokyuzu: { on: true, mode: 'auto', times: ['11:00'], autoAt: now.toISOString() },
  'dik-dur': { on: false, mode: 'manual', times: [], interval: { on: true, every: 120, from: '09:00', to: '19:00', days: [0, 1, 2, 3, 4, 5, 6] } },
})
const reminders = cok
  ? { optIn: 'yes', types: { mola: { on: true, time: '12:30' }, walk: { on: true, time: '17:00' }, breath: { on: true, time: '21:30' }, water: { on: true, time: '10:00' } } }
  : { optIn: 'yes', types: { mola: { on: kurulu, time: '12:30' } } }
const entry = (id) => modules.find((m) => m.module === id)
createRoot(document.getElementById('root')).render(
  <>
    <Notifications modules={modules} moduleReminders={moduleReminders} reminders={reminders} quiet={null} next={kurulu ? { time: '12:30', label: 'Mola' } : null} slots={[]} now={now} />
    {s === 'saat' ? <RemindSheet moduleId="dalga" remind={entry('dalga')} moduleReminders={moduleReminders} reminders={reminders} now={now} onSave={() => {}} onClose={() => {}} /> : null}
    {s === 'ddsaat' ? <RemindSheet moduleId="dik-dur" remind={entry('dik-dur')} moduleReminders={moduleReminders} reminders={reminders} now={now} onSave={() => {}} onClose={() => {}} /> : null}
  </>,
)
