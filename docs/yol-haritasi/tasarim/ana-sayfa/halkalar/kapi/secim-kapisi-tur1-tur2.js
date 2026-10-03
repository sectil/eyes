export const meta = {
  name: 'home-rings-select-gate',
  description: 'Ana sayfa yuvarlakları: iki turdan en iyisini seçme kapısı (5 kör değerlendirici) ve ad kapısı',
  phases: [{ title: 'Kapı', detail: '5 bağımsız değerlendirici, kör A/B, E/H ve adlar' }],
}
const K = '/tmp/claude-0/-home-user/48890ea0-ff18-534a-8c82-8916ea9f6368/scratchpad/halka-kapi'
const PEOPLE = [
  ['k1', '34 yaşında, telefonu çok kullanan bir grafik tasarımcı'],
  ['k2', '58 yaşında, gözlük kullanan, teknolojiyle arası orta bir öğretmen'],
  ['k1', "22 yaşında, Instagram'ı her gün kullanan bir üniversite öğrencisi"],
  ['k2', '45 yaşında, uygulamaları hızlı ve sabırsız kullanan bir esnaf'],
  ['k1', '39 yaşında, sade ve düzenli ekranları seven bir mobil uygulama geliştiricisi'],
]
const SCHEMA = {
  type: 'object',
  properties: {
    screens: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, e: { type: 'string', enum: ['E', 'H'] }, why: { type: 'string' } }, required: ['file', 'e', 'why'] } },
    prefer: { type: 'string', enum: ['A', 'B'] },
    preferWhy: { type: 'string' },
    understood: { type: 'string', description: 'yuvarlakların ne olduğunu ve dokununca ne olacağını kendi sözlerinle' },
    labels: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, e: { type: 'string', enum: ['E', 'H'] }, why: { type: 'string' } }, required: ['label', 'e', 'why'] } },
  },
  required: ['screens', 'prefer', 'preferWhy', 'understood', 'labels'],
}
phase('Kapı')
const out = await parallel(PEOPLE.map(([set, who], i) => () => agent(
`Sen ${who}. Bir iPhone sağlık ve göz alıştırması uygulamasının Ana sayfasını ilk kez görüyorsun. Dürüst ol; kibarlık için E verme, bahane için H verme. Hiçbir dosyayı değiştirme.

Klasör: ${K}/${set}/ . Önce yalnız G2-390x844-acik-yuvarlaksiz.png'ye bak: bu, sayfanın bugünkü hâli. Sonra A ve B dosyalarına bak (Read ile her birini aç). A ve B, "1. bölüm" yazısının üstüne eklenmiş dört yuvarlak kısayolun iki farklı tasarımı: Yoga, Dalga, Nefes, Tam set. Hangisinin hangisi olduğu sana söylenmiyor. "-iki-" dosyalarında bugün Dalga ve Nefes yapılmış; koyu dosyalar koyu tema; 320x640 küçük telefon.

1) Her A ve B dosyası için tek satır: 5 saniyelik ilk bakışta etkilendin mi? E ya da H ve somut neden. "İdare eder" = H. Ölçütler: yuvarlakların dokunulur kısayol olduğu anlaşılıyor mu, alttaki numaralı gün dairelerinden ayrışıyor mu, büyük "Başla" kartı hâlâ ana iş gibi duruyor mu, hizalar ve boşluklar özenli mi, "bugün yapıldı" hâli açık mı.
2) Hangisini tercih edersin, A mı B mi, ve neden.
3) Yuvarlakların ne olduğunu ve birine dokununca ne olacağını kendi sözlerinle yaz.
4) Yuvarlakların altındaki adlar: "Yoga", "Dalga", "Nefes", "Tam set". Her biri için E ya da H: 5 saniyede ne açacağını anlıyor musun, Türkçesi doğal mı? H ise daha iyi bir ad öner.`,
  { label: `kisi${i + 1}:${set}`, phase: 'Kapı', schema: SCHEMA }).then((r) => (r ? { set, who, ...r } : null))))
return out.filter(Boolean)
