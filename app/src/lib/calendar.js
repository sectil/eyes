// Takvim yardımcıları. Hafta Pazartesi başlar. Tarihler yerel saatle değerlendirilir.

export const WEEKDAYS = [
  { id: 'MO', short: 'Pzt' },
  { id: 'TU', short: 'Sal' },
  { id: 'WE', short: 'Çar' },
  { id: 'TH', short: 'Per' },
  { id: 'FR', short: 'Cum' },
  { id: 'SA', short: 'Cmt' },
  { id: 'SU', short: 'Paz' },
]
export const DEFAULT_WEEKLY_TARGET = 3

// Date → 'YYYY-MM-DD' (yerel)
export function dayKey(d) {
  const x = new Date(d)
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${x.getFullYear()}-${m}-${day}`
}

// JS getDay (0=Paz) → WEEKDAYS indeksi (0=Pzt)
export const mondayIndex = (d) => (new Date(d).getDay() + 6) % 7

export function startOfWeek(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - mondayIndex(x))
  return x
}

// Test veya seans yapılan günler
export function activeDays(records) {
  return new Set(records.map((r) => dayKey(r.date)))
}

export function weekProgress(active, now = new Date(), target = DEFAULT_WEEKLY_TARGET) {
  const start = startOfWeek(now)
  let done = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (active.has(dayKey(d))) done++
  }
  return { done, target, met: done >= target }
}

// Ay ızgarası: haftalar × 7 gün; ay dışındaki günler null
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(mondayIndex(first)).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function isPlanned(date, plannedDays = []) {
  return plannedDays.includes(WEEKDAYS[mondayIndex(date)].id)
}
