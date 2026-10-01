// İlk Bakış (screens/FirstLook.jsx) yazıları — dil başına tek nesne. Uygulama başka dillere çevrildiğinde yeni dil
// buraya aynı anahtarlarla eklenir; ekran metni burada, görsele gömülü yazı yok. Sayılar ve süreler fonksiyonla
// verilir (her dil kendi sırasını/çoğulunu kurar); yön (ltr/rtl) dile göre.
// Okuma metni: Laeng ve Sulutvedt 2014 (Psychol Sci, DOI 10.1177/0956797613503556) — hayal edilen ışığa göz bebeği
// tepki verdi. Makalenin cümleleri değil, bulgunun kendi dilimizde anlatımı. Kırpmayı anlatan bir metin seçilmedi:
// okurken dikkati kişinin kendi kırpmasına çeker ve ölçümü bozar (VARSAYIM; sayıyı gizleme kararıyla aynı gerekçe).
// wpm: sarı işaretin hızı. VARSAYIM: Türkçe için dakikada 200 kelime (her dil kendi değerini alır).

const tr = {
  locale: 'tr-TR',
  dir: 'ltr',
  wpm: 200,
  text:
    'Şu an masmavi, güneşli bir gökyüzü düşün. Ekranın ışığı hiç değişmedi, ama göz bebeğin büyük olasılıkla biraz daraldı. ' +
    "Oslo'da araştırmacılar, boş gri bir ekrana bakan insanlardan güneşli bir gök ya da karanlık bir oda hayal etmelerini istedi. " +
    'Göz bebekleri hayal edilen ışığa gerçekmiş gibi tepki verdi: parlakta daraldı, karanlıkta büyüdü. Katılımcılar bunu isteyerek yapamıyordu. ' +
    'Yani beynin, hayal ettiğin ışığı gördüğün ışığa benzer biçimde işliyor. Şimdi karanlık bir oda düşün. ' +
    'Göz bebeğin, sen fark etmeden, büyümeye başlamış olabilir.',
  focus: 3, // başlangıç ekranındaki örnek cümlede altın köşeli kelime ("güneşli")
  textSource: 'Laeng ve Sulutvedt 2014',
  ui: {
    introEyebrow: '20 saniye',
    introTitle: 'Önce bir şey fark edelim',
    introSub: 'Kısa bir yazı okuyacaksın; okuduğun kelime sarıyla ilerler. Bu sırada kamera yalnız göz kapaklarını sayar.',
    privacy: 'Görüntü kaydedilmez, telefondan çıkmaz.',
    start: 'Başla',
    selfCount: 'Kamerasız, kendim sayayım',
    camPreparing: 'Kamera hazırlanıyor…',
    getReady: 'Birazdan başlıyor…',
    follow: 'Sarı kelimeyi izle.',
    pace: 'kelime/dk',
    hiddenNote: 'Sayıyı okurken göstermiyorum; görürsen kırpmaya dikkat edersin.',
    resultEyebrow: '20 saniyede',
    times: 'kez kırptın',
    selfTag: 'kendi sayımın',
    gap: (s) => `${s} sn kırpmadın`,
    noBlink: (s) => `${s} sn boyunca hiç kırpmadın`,
    quoteTitle: 'Bu satırları okurken hiç kırpmadın',
    wordsRead: 'kelime okudun',
    longest: 'en uzun ara',
    sec: (s) => `${s} sn`,
    pauseLine: (k) => `Kırpmalarından ${k} tanesi bir noktalama işaretinin hemen yanındaydı.`,
    source: (textSource, pause) =>
      `Okurken kırpma seyrekleşir; tablette dakikada ~20'den ~15'e düştü (Abusharha 2017).${pause ? ' Okurken kırpmalar noktalamalarda sıklaşır (Cornelis 2025).' : ''} Senin sayın bir yargı değil, bir başlangıç.${textSource ? ` Okuma metni: ${textSource}.` : ''}`,
    next: 'Devam',
    tapEyebrow: 'Kamera yok · 20 saniye',
    tapTitle: 'Her kırptığında ekrana dokun',
    tapLeft: (s) => `${s} sn kaldı`,
    tapFirst: 'İlk kırpışında dokun; süre başlar',
    tapNote: 'Sonuç "kendi sayımın" diye kaydedilir; kameradaki sayımla karıştırılmaz.',
    camError: 'Kameraya erişilemedi; kendin sayabilirsin.',
    camLate: 'Kamera hazır olmadı; kendin sayabilirsin.',
    noFace: 'Yüzünü göremedim; kendin sayabilirsin.',
  },
}

const CONTENT = { tr }

export function firstLookContent(lang = 'tr') {
  return CONTENT[lang] ?? tr
}
