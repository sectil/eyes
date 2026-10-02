const AREAS = ['goz', 'dikkat', 'nefes', 'ruh', 'hareket']
const NAME = { goz: 'Göz', dikkat: 'Dikkat', nefes: 'Nefes', ruh: 'Ruh hâli', hareket: 'Hareket' }
const WORD = { start: 'Başlangıç', up: 'Başlangıcından iyi', same: 'Değişim yok', unsure: 'Henüz belli değil', live: 'Şu an' }
const DAYS = {
  '30': { label: '30. gün', blinks: 5, nef: 'Üç alanda başlangıcından iyisin: dikkat, nefes ve ruh hâli.', a: {
    goz: { st: 'same', v: 'E testi 0,20 → 0,20', d: '<b>E testi</b> 6 ölçümde başlangıcınla aynı (küçük değer iyi). İlk Bakış: 20 saniyede 5 kırpma; gözlerin bu hızla kırpıyor.' },
    dikkat: { st: 'up', v: '4 → 6 harf', d: '<b>Tek Bakışta</b> kavradığın harf 14 ölçümde 4\'ten 6\'ya çıktı.' },
    nefes: { st: 'up', v: '+1,3 sakinlik', d: '<b>Nefesten sonra</b> sakinlik puanın 24 oturumda ortalama 1,3 yüksek (5 üzerinden).' },
    ruh: { st: 'up', v: 'İyi oluş 56 → 68', d: '<b>İyi oluş</b> (WHO-5) puanın 56\'dan 68\'e çıktı; 10 puandan büyük fark.' },
    hareket: { st: 'unsure', v: 'Bugün 7.080 adım', d: '<b>Apple Sağlık:</b> bugün 7.080 adım. Adım geçmişi henüz kaydedilmediği için karşılaştırma yok.' },
  } },
  '1': { label: '1. gün', blinks: 3, nef: 'Başlangıcın ölçüldü. Bundan sonraki her ölçüm buna göre yanacak.', a: {
    goz: { st: 'start', v: '20 sn\'de 3 kırpma', d: '<b>İlk Bakış</b> 20 saniyede 3 kırpma ölçtü; gözlerin bu hızla kırpıyor. E testi de alındı.' },
    dikkat: { st: 'start', v: '4 harf', d: '<b>Tek Bakışta</b> ilk ölçümün: 4 harf.' },
    nefes: { st: 'start', v: 'Sakinlik 2 → 4', d: '<b>İlk nefesinde</b> sakinlik puanın 2\'den 4\'e çıktı (5 üzerinden).' },
    ruh: { st: 'start', v: 'İyi oluş 56', d: '<b>İyi oluş</b> (WHO-5) ilk puanın: 56. Sonraki 14. gün.' },
    hareket: { st: 'start', v: 'Bugün 3.412 adım', d: '<b>Apple Sağlık:</b> bugün 3.412 adım.' },
  } },
}
DAYS.walk = JSON.parse(JSON.stringify(DAYS['30']))
Object.assign(DAYS.walk, { label: 'Şu an', nef: '<span class="live">Şu an yürüyorsun:</span> 14 dakikada 1,2 km, 1.690 adım.' })
DAYS.walk.a.hareket = { st: 'live', v: '1.690 adım · 14 dk', d: '<b>Yürüyüş sürüyor:</b> 1,2 km, 1.690 adım. Hareket bölgesi adım temponla akıyor.' }
