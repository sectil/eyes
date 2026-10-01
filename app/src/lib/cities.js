// Şehir kutucuğu için öneri listesi: Türkiye'nin 81 ili (alfabetik, Türkçe sıralama).
// Kutucuk serbest metin de kabul eder (yurt dışı vb.); liste yalnız öneridir.
export const TR_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın',
  'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde',
  'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
]
export const CITY_MAX = 60

// Yazılan metne göre öneriler (Türkçe büyük/küçük harf duyarsız; baştan eşleşenler önce)
export function suggestCities(q, list = TR_CITIES, max = 6) {
  const t = (q ?? '').trim().toLocaleLowerCase('tr-TR')
  if (!t) return []
  const low = (s) => s.toLocaleLowerCase('tr-TR')
  const starts = list.filter((c) => low(c).startsWith(t))
  const has = list.filter((c) => !low(c).startsWith(t) && low(c).includes(t))
  return [...starts, ...has].slice(0, max)
}

export function normalizeCity(s) {
  if (typeof s !== 'string') return ''
  const t = s.trim().replace(/\s+/g, ' ').slice(0, CITY_MAX)
  const hit = TR_CITIES.find((c) => c.toLocaleLowerCase('tr-TR') === t.toLocaleLowerCase('tr-TR'))
  return hit ?? t
}
