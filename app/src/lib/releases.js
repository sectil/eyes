// Sürüm notları: her güncellemede neler eklendi / düzeldi. Uygulama güncellenince ilk açılışta bir kez
// gösterilir (components/WhatsNew.jsx), Bilgi → "Yenilikler"de hepsi durur.
// KURAL: her yeni commit dizisi (TestFlight'a gidecek iş) buraya bir madde ekler. En yeni en üstte.
// id: ISO tarih + sıra; kind: 'new' | 'fix' | 'change'
export const RELEASES = [
  {
    id: '2026-09-26',
    title: '26 Eylül güncellemesi',
    items: [
      { kind: 'new', text: 'Hesap: Apple ile giriş ya da hesapsız devam. Hesabın varsa profilin yeni telefonda da seninle.' },
      { kind: 'new', text: '"Seni tanıyalım": ad, doğum tarihi (gün/ay/yıl kutucukları), şehir (81 il önerisi), gözlük/lens.' },
      { kind: 'new', text: '7 gün ücretsiz deneme artık kurulumun sonunda; 5. gün istersen bildirimle hatırlatırız.' },
      { kind: 'new', text: 'Profilim: şehir, hesap aç / çıkış yap / hesabımı sil.' },
      { kind: 'new', text: 'Yeni giriş filmi: iristen içeri dalış, siluetler, fark etme anlarında yavaşlayan zaman, takımyıldızı Pegasus.' },
      { kind: 'fix', text: 'Göz kalibrasyonu: baş duruşu hesaba katılıyor; "Ayırt edemedim" ekranı çok daha seyrek. Tekrar turu ortayı da yeniliyor.' },
      { kind: 'fix', text: 'Göz yönleri: kalibrasyonsuz kullanımda sağ–sol terslenmişti (ör. "Sola bak", saat yönünde daire). Düzeldi.' },
      { kind: 'change', text: 'Ödeme ekranında eski ad "Eyelume" yerine "EyeTrail".' },
    ],
  },
]

export const latestRelease = () => RELEASES[0] ?? null

// Görülmemiş sürümler (seenId'den yeniler). seenId yoksa yalnız en son sürüm.
export function unseenReleases(seenId) {
  if (!seenId) return RELEASES.slice(0, 1)
  return RELEASES.filter((r) => r.id > seenId)
}
