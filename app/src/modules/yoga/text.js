// Yoga ekranlarının bütün metinleri tek yerde (modul.md §2; güvenlik metinleri §2.2, §2.7, §2.8 ve §10.3 düzeltmeleriyle,
// kelimesi kelimesine). Ders başına metinler (ad, söz, açılış satırları, soru) lib/yogaLessons.js'te.
// Sağlık iddiası yok: "iyileştirir", "stresini azaltır", "kanıtlandı" gibi sözler hiçbir yerde geçmez (text.test.js).
import { NBSP } from '../../lib/format.js'

export const YT = {
  title: 'Yoga',
  libraryTitle: 'Yoga ve Meditasyon', // PLAN.v3 §D.2 (G8-b)
  webOnly: 'Yoga dersleri iPhone uygulamasında.', // PLAN.v3 §D.7
  back: 'Geri',
  filters: { day: 'Gündüz', night: 'Gece', three: '3 dakikalık' },
  // YENİ METİN (5 saniye yeniden tasarımı, C_5SN_RAPORU.md; Türkçe editör onayına): kütüphane kartının yazılı eylemi.
  // "Başla" değil: bu dokunuş dersi başlatmaz, ayrıntıyı açar ("Başla" ayrıntıdadır, ses orada başlar).
  library: { open: 'Derse git' },
  // Dersin sesinin adı; zaman çizelgesindeki voice_name ile aynı (ders2-15 "Nefona Hoca"). Kapı turu 2'den beri ekranda
  // YOK: ilk yayında ses seçimi yok (PLAN.v3 §D.2) ve iki değerlendirici adı "gerçek bir hoca mı?" diye okudu. Ses seçimi
  // gelirse ad yeniden sahip ve editör onayına.
  voices: { hoc: 'Nefona Hoca' },

  // Güvenlik kartı (modul.md §2.2): bir kez; ders ayrıntısındaki (i) ile yeniden
  safety: {
    title: 'Başlamadan önce',
    items: [
      { h: 'İstediğin an dersi bitirebilirsin.', p: 'Gözlerini açabilir, kıpırdayabilir, nefesini kendi hâline bırakabilirsin. Buradaki her şey bir davet. Bazen gevşerken huzursuz ya da tuhaf hissedebilirsin; bu olabilir. Dersi yarıda bırakmak da pratiğin bir parçası.' },
      { h: 'Araç kullanırken açma.', p: 'Bu dersler uyku getirebilir. Araç ya da makine kullanırken, suda ya da dikkat isteyen bir işteyken açma.' },
      { h: 'Bir sağlık durumun varsa önce danış.', p: 'Gebelik, epilepsi, kalp ya da akciğer rahatsızlığı, psikoz ya da bipolar bozukluk öyküsü ya da seni hâlâ zorlayan bir travma varsa başlamadan önce hekimine ya da terapistine sor.' },
      { h: 'Yavaşça kalk.', p: 'Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk. Başın dönerse otur ve bekle.' },
      { h: 'Sesi kısık tut.', p: 'Konuşmayı zorlanmadan duyacağın kadar yeter. Uyku dersleri kendiliğinden kısılıp biter. Uyurken kulak içi kulaklık yerine hoparlör daha iyi.' },
    ],
    // "Acil durumda 112." satırı: 112 kalın (Yon.jsx:362 ile aynı dil)
    footer: 'Nefona tedavi değildir. Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda',
    emergency: '112',
    ok: 'Anladım',
    open: 'Başlamadan önce', // ayrıntıda kartı yeniden açan satırın yazılı adı (kartın başlığıyla aynı söz; kart görüldükten sonra)
  },

  // Ses denetimi (PLAN.v3 §D.2): ilk derste "Başla"dan önce 10 sn. Dosya yokken adım hiç görünmez (Yoga.jsx
  // SOUND_CHECK_FILE): ekrandaki sözcükler söylenmeyecekse yazılmaz.
  soundCheck: {
    eyebrow: `Ses denetimi · 10${NBSP}sn`,
    screenText: 'Sağ kürek kemiği… diz… üç…',
    question: 'Sözcükleri rahatça seçebildin mi?',
    yes: 'Evet',
    no: 'Hayır',
    skip: 'Atla',
    onNo: 'Sesi biraz açıp yeniden dene; kulaklık da kullanabilirsin.',
    again: 'Yeniden dinle', // "Hayır"dan sonra (Türkçe editör onayına)
  },

  // Ders ayrıntısı (modul.md §2.4; PLAN.v3 §D.2)
  detail: {
    start: 'Başla',
    preparation: 'Hazırlık',
    musicTail: 'Ders bitince müzik',
    musicTailOff: 'Kapalı',
    sources: 'Kaynaklar',
    evening: 'Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir.', // §10.3-d; 20:00–04:59
    sleepStops: 'Çalan uyku sesi duracak.', // §D.3
    minutes: 'Süre',
    sections: 'Bölümler',
    added: (min, labels) => `${min}${NBSP}dakikada ${labels} eklendi`,
    later: 'Sonra yaparım', // yoldan açılan ders (PLAN.v3 §B.2-9)
    day: 'Gündüz', // gündüz/gece simgesinin VoiceOver adı (süzgeç çipleriyle aynı söz)
    night: 'Gece',
  },

  // Önce / sonra puanı (modul.md §2.5, §2.8): aynı soru, 1–10, "Atla"
  rate: {
    before: 'Önce',
    after: 'Sonra',
    next: 'Devam',
    skip: 'Atla',
    // YENİ METİNLER (5 saniye yeniden tasarımı; Türkçe editör onayına, sağlık iddiası yok):
    why: 'Ders bitince aynı soruyu yeniden soracağız.', // önce puanı: neden soruluyor
    again: 'Aynı soru, şimdi dersten sonra.', // sonra puanı: soru bilerek yineleniyor
    was: 'Dersten önce:', // sonra puanında yalnız seçimden sonra, ardından önceki puan (OZET.md §10)
  },

  // Oynatıcı (modul.md §2.6; §4)
  player: {
    pause: 'Duraklat',
    resume: 'Sürdür',
    toClosing: 'Kapanışa geç',
    toSleep: 'Uykuya geç',
    stop: 'Dersi bitir', // X düğmesinin VoiceOver etiketi
    captions: 'Altyazı',
    left: 'kaldı',
    audioError: 'Ses açılamadı. Telefonun sesini ve sessiz modunu kontrol edip yeniden dene.', // Dalga'nın metni (§4)
    audioErrorShort: 'Ses açılamadı.', // oynatıcı bu derlemede ya da dosya pakette yok: öneri ve "Yeniden dene" yok
    retry: 'Yeniden dene',
    sleepStopOnly: 'Durdur',
  },

  // Durdurma ekranı (modul.md §2.7)
  stopped: {
    text: 'Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur.',
    // Uyku dersinde (Ders 3) uyandırma yok (§10.1, §10.2): dersin onaylı gece satırı aynen (yogaLessons.js Ders 3 açılışı)
    night: 'Gece kalkman gerekirse önce yana dön, otur, sonra kalk.',
    voiceReturn: 'Sesli dönüşü dinle',
    ok: 'Tamam',
  },

  // Zorlanma sorusu (modul.md §2.8; güvenlik §11.F; §10.3-c iki biçim)
  hard: {
    question: 'Ders sırasında zorlandın mı?',
    options: [
      { id: 'no', label: 'Hayır' },
      { id: 'some', label: 'Biraz' },
      { id: 'much', label: 'Çok' },
    ],
    skip: 'Atla',
    next: 'Devam',
    muchStopped: 'Böyle anlar olabiliyor; durman doğruydu. Bir dahaki sefere daha kısa bir süre seçebilir, gözlerini açık tutabilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112.',
    muchFinished: 'Böyle anlar olabiliyor. Bir dahaki sefere daha kısa bir süre seçebilir, gözlerini açık tutabilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112.',
    // Dersin yayımlanmış daha kısa bir süresi yoksa aynı metinlerden yalnız "daha kısa bir süre seçebilir," çıkar
    // (yerine getirilemeyecek öneri verilmez; yeni söz yok, yine de Türkçe editör onayına)
    muchStoppedNoShorter: 'Böyle anlar olabiliyor; durman doğruydu. Bir dahaki sefere gözlerini açık tutabilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112.',
    muchFinishedNoShorter: 'Böyle anlar olabiliyor. Bir dahaki sefere gözlerini açık tutabilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112.',
  },

  // Bitiş ekranı (modul.md §2.9)
  done: {
    title: 'Ders bitti',
    why: 'Bu dersi neden böyle kurduk',
    next: 'Sıradaki',
    eyesOpen: 'Gözlerin açık kalabilir.',
    // PLAN.v3 §B.2 kural 11 (modul.md §2.9'daki "Sık tekrarlarsa…" öznesizdi; tek başına görününce neyin tekrarladığı
    // anlaşılmıyordu). Son biçim Türkçe editörün ve klinik psikoloğun onayıyla.
    lesson4: 'Zor anlar sık sık geliyorsa bir uzmanla konuşmak iyi olur. Acil durumda 112.',
    ok: 'Tamam',
  },
}

// Türkçe sıralama: "niyet, imgeleme ve niyete dönüş" (son öğeden önce "ve")
export const listTr = (items = []) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ve ${items.at(-1)}`)

// "Beden gerginliği" (ilk harf büyük; Türkçe yerel ayarıyla: "i" → "İ")
export const capFirst = (s) => (s ? s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1) : s)
