// Günlük fark etme görevi: her gün değişen tek bir dış dünya görevi ("3 kırmızı şey fark et"), akşam kaç tane
// fark ettiğini kaydedersin. Kanıt (rapor 20 §5): bu göreve doğrudan kanıt yok; dolaylı: yaşla fark edememe
// (inattentional blindness) artıyor (Horwood 2016, Graham 2011), kısa bir farkındalık çalışması azalttı
// (Schofield 2015). Aktarım iddiası YOK; dikkatini dışarıya yönelten küçük bir alıştırma.
// Not metni yalnızca bu telefonda kalır; Nef'e yalnızca sayılar gider.
export const SESSION_TYPE = 'notice'
export const COUNTS = ['0', '1', '2', '3+']
export const NOTE_MAX = 140

export const PROMPTS = [
  { id: 'red', text: 'Dışarıda 3 kırmızı şey fark et', ex: 'Yaya lambası, bir posta kutusu, bir tabela.' },
  { id: 'ground', text: 'Yürürken yerdeki 3 engeli fark et', ex: 'Bir tümsek, gevşek bir taş, bir çukur.' },
  { id: 'signs', text: 'Daha önce görmediğin 3 tabela fark et', ex: 'Her gün geçtiğin yolda bile.' },
  { id: 'green', text: 'Üç farklı yeşil tonu fark et', ex: 'Yaprak, çimen, bir kapı.' },
  { id: 'sky', text: 'Göğe bak, bir bulut şekli fark et', ex: 'Neye benziyor?' },
  { id: 'sounds', text: 'Sokakta 3 farklı ses fark et', ex: 'Bir kuş, bir kapı, uzakta bir motor.' },
  { id: 'change', text: 'Her gün geçtiğin yolda değişen bir şey fark et', ex: 'Yeni bir vitrin, budanmış bir ağaç.' },
]

export const dayNumber = (d) => {
  const x = new Date(d)
  return Math.floor(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 86400000)
}
export const promptFor = (date = new Date()) => PROMPTS[((dayNumber(date) % PROMPTS.length) + PROMPTS.length) % PROMPTS.length]

export function makeRecord({ prompt, count, note = '' }) {
  const c = COUNTS.indexOf(count)
  const n = typeof note === 'string' ? note.trim().slice(0, NOTE_MAX) : ''
  return { type: SESSION_TYPE, prompt: prompt.id, count: c < 0 ? 0 : c, ...(n ? { note: n } : {}), seconds: 0 }
}
export const isNotice = (s) => s?.type === SESSION_TYPE
export function weekDays(sessions = [], now = new Date()) {
  const since = dayNumber(now) - 6
  return new Set(sessions.filter(isNotice).map((s) => dayNumber(s.date)).filter((d) => d >= since && d <= dayNumber(now))).size
}
