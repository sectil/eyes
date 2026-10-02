// WHO-5 İyi Oluş İndeksi: metinler dil başına tek nesnede (yeni dil = yeni nesne; metin koda gömülmez).
// Türkçe: WHO (Beş) İyilik Durumu İndeksi, 1998 sürümü; Türkçe geçerlilik Eser ve ark. 2019
// (doi:10.1017/S1463423619000343). Metin WHO'nun yayımladığı Türkçe çeviriden birebir
// (cdn.who.int … who-5_turkish.pdf). Puanlama lib/progress.js (who5Score, makeWho5Record, who5Card).
export const WHO5_TEXT = {
  tr: {
    title: 'İyi oluş',
    intro: 'Son iki haftada kendini nasıl hissettiğine en yakın cevabı seç.',
    period: 'Son iki hafta boyunca',
    items: [
      'Kendimi neşeli ve keyifli hissettim',
      'Kendimi sakin ve gevşemiş hissettim',
      'Kendimi aktif ve dinç hissettim',
      'Sabahları kendimi taze ve dinlenmiş hissederek uyandım',
      'Günlük yaşantım beni ilgilendiren şeylerle dolu',
    ],
    options: [
      { value: 5, text: 'Her zaman' },
      { value: 4, text: 'Çoğu zaman' },
      { value: 3, text: 'Geçen zamanın yarısından çoğunda' },
      { value: 2, text: 'Geçen zamanın yarısından daha azında' },
      { value: 1, text: 'Bazen' },
      { value: 0, text: 'Hiçbir zaman' },
    ],
    source: 'WHO (Beş) İyilik Durumu İndeksi, 1998 sürümü; Türkçe geçerlilik: Eser ve ark. 2019. Tanı değil; yalnız kendinle karşılaştırılır.',
    meaningful: '10 puan ve üstü değişim anlamlı sayılır (WHO-5 yönergesi).',
    low: 'Bu bir tanı değil. İyi oluşun bir süredir düşükse bir sağlık uzmanıyla konuşmak iyi gelebilir.',
  },
}
export const who5Text = (lang = 'tr') => WHO5_TEXT[lang] ?? WHO5_TEXT.tr
