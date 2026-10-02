// Saate göre selam (Ana sayfa başlığı, uyku sesi sonu). Sahibi akşam 19:57'de uyku ekranında "Günaydın." gördü.
export function greeting(date = new Date()) {
  const h = new Date(date).getHours()
  if (h < 5) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  if (h < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}
