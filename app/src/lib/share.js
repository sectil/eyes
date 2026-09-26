// Metni paylaşım sayfasıyla gönderir; yoksa panoya kopyalar. Döner 'shared' | 'copied' | 'failed'.
// İptal edilen paylaşım da panoya kopyalamaya düşer (kullanıcı eli boş kalmasın).
export async function shareText(title, text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text })
      return 'shared'
    }
  } catch {
    // iptal / desteklenmiyor → kopyala
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
