// Takvime eklenebilen tekrarlayan hatırlatma (RFC 5545 iCalendar).
// Web uygulaması telefonda sabit saatli bildirim zamanlayamadığı için (bkz. SENTEZ §11)
// hatırlatmayı telefonun kendi takvimi yapar. Saat "floating" yazılır: kullanıcının
// bulunduğu saat dilimindeki yerel saat.

import { WEEKDAYS, mondayIndex } from './calendar.js'

const CRLF = '\r\n'

const pad = (n) => String(n).padStart(2, '0')
const localStamp = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
const utcStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

// RFC 5545 §3.3.11: metinde \ ; , ve satır sonu kaçışlanır
export function escapeText(s) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

// İlk uygun gün: bugün veya sonrası, seçili günlerden biri, saat geçmemiş
export function firstOccurrence(days, time, now = new Date()) {
  const [hh, mm] = time.split(':').map(Number)
  for (let i = 0; i < 8; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    d.setHours(hh, mm, 0, 0)
    if (d > now && days.includes(WEEKDAYS[mondayIndex(d)].id)) return d
  }
  return null
}

// schedule: { days: ['MO','WE','FR'], time: '20:00' }
export function buildReminderIcs(schedule, now = new Date()) {
  const { days, time } = schedule
  if (!days?.length || !/^\d{2}:\d{2}$/.test(time)) throw new Error('geçersiz program')
  const ordered = WEEKDAYS.map((w) => w.id).filter((id) => days.includes(id))
  const start = firstOccurrence(ordered, time, now)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//eyelume//tr',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:goz-olcum-hatirlatma-${utcStamp(now)}@goz-olcum`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${localStamp(start)}`,
    'DURATION:PT15M',
    `RRULE:FREQ=WEEKLY;BYDAY=${ordered.join(',')}`,
    `SUMMARY:${escapeText('Göz testi ve egzersiz (Eyelume)')}`,
    `DESCRIPTION:${escapeText('Günlük kısa test: ~2 dakika. Uygulamayı açın.')}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText('Göz testi zamanı')}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join(CRLF) + CRLF
}

// Tarayıcıda dosyayı indirir / paylaşır. iOS'ta Ana Ekrana eklenmiş uygulamadan
// açılış davranışı cihazda test edilmelidir (bkz. ajan-raporlari/13_gunluk_takip.md).
export async function downloadIcs(text, filename = 'goz-olcum-hatirlatma.ics') {
  const file = new File([text], filename, { type: 'text/calendar' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Eyelume hatırlatma' })
      return 'shared'
    } catch {
      // kullanıcı iptal etti veya paylaşım başarısız → indirmeye düş
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'downloaded'
}
