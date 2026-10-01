Görev: Nefona'nın Gelişim merkezini, onaylı "ışıktan baş" tasarımıyla eksiksiz ve kusursuz biçimde uygulamaya kodla.

## 1. Önce oku (hepsini, baştan sona)
Tasarım belgeleri `claude/gelisim-merkezi-plan` dalında. Önce `git fetch origin claude/gelisim-merkezi-plan`, sonra
`git checkout origin/claude/gelisim-merkezi-plan -- docs/yol-haritasi/tasarim/gelisim-merkezi` ile bu klasörü kendi
dalına al. Okuma sırası:
1. `docs/yol-haritasi/tasarim/gelisim-merkezi/DEVIR.md`: bağlayıcı devir; her maddesi uygulanır.
2. `PLAN.v1.md`: §3 veri, §6 bildirim, §7 rıza, §8 kod sözleşmesi, §9 kalite, §10 sıra. Ekran bölümleri DEVIR ile
   değişti.
3. `VERI.md`: ölçümlerin kaynakları.
4. `DENETIM.md`: K1–K4, Ö-1…Ö-12, Kü-1…Kü-14; hepsi G1'de kapanır.
5. `SAHIP_ISTEKLERI.md`: sahibin sözleri kelimesi kelimesine.
6. `maket/ordu/parcacik/v6.html` ve `maket/ordu/parcacik/v6-kaynak/`: onaylı maket ve kaynağı. Görüntüler
   `goruntu6/` klasöründe.
7. `maket/ordu/model/`: yüz modeli (Apache 2.0) ve `KAYNAK.md`.
Bunların yanında depo kökündeki CLAUDE.md, `YAPILACAKLAR.md` ve `HATA_GUNLUGU.md`. Daha önce düzeltilmiş bir hatayı
yeniden "düzeltmeden" önce git log'a ve HATA_GUNLUGU'na bak.

## 2. Sıra (aşama aşama; bir aşama bitmeden ötekine geçme)
1. **G1 veri:** `growthCenter` ve `areas[k].value`, ölçü kuralı v2, denetim düzeltmeleri, eşdeğerlik düzeneği.
   Kapı: tohumlu 20.000 depoda izinli liste dışında 0 fark, tek hesap testi yeşil.
2. **G2 ekran:** `components/GrowthHead.jsx`; `v6-kaynak` uygulamaya aktarılır.
   - `mini3.js` → `lib/head/gl.js`, `yuz.js` ve `kafa.js` → `lib/head/`.
   - Pişmiş noktalar derleme zamanında `assets/head/` altına konur.
   - Dış betik ve dış yazı tipi yok.
   - Görünüm maketle birebir olmalı; maketten sapma gerekiyorsa önce sahibe sor.
3. **G2b kendi yüzün:** Sahip DEVIR §6 soru 1'e "evet" demeden **kodlama**. Evet derse DEVIR §3'teki gizlilik
   kurallarının hepsini uygula: ayrı rıza, yalnız 468 sayı, telefondan çıkmaz, dışa aktarıma ve Nef paketine girmez,
   "Yüzümü sil" düğmesi.
4. **G3 bildirim:** B1'den sonra. Metinler DEVIR §5'e göre; aylık metin için önce sahibin cevabını al.
5. **G4 canlı yürüyüş:** B3'ün içinde.

## 3. Bağlayıcı kurallar
- **Ekran metni:**
  - "beyin" ve "tanıma" sözcükleri geçmez.
  - Sağlık iddiası yok.
  - Değişim sözcükleri yalnız "başlangıcından iyi", "değişim yok", "henüz belli değil", "başlangıç".
- **Bölge parlaklığı:** Yalnız `verdict === 'better'` tam parlar. Görsel hiçbir zaman veriden daha iyi bir durum
  anlatmaz. Aynı anda parlayan bölgeler eşit parlaklıktadır.
- **Kamera ve gizlilik:**
  - Kamera görüntüsü telefondan çıkmaz.
  - Gelişim ekranı kamerayı açmaz.
  - Gizli anahtar yok; ücretli çağrı yok.
- **Mevcut sistem bozulmaz.** PLAN §8.3'teki testler değişmeden yeşil kalır. Değişebilecek test beklentileri yalnız
  PLAN §8.2'deki listede; listede olmayan bir beklenti değişmek zorunda kalırsa dur ve sahibe sor.
- **İki tema, 320 pt, Hareketi Azalt, VoiceOver:** her bölge ve her çip bir düğme. Dokunma alanları en az 44 pt.
- **Performans:**
  - Çizim yalnız ekran görünürken yapılır.
  - WebGL bağlam kaybında durağan bir kare gösterilir.
  - Hedef iPhone 11'de ≥ 50 fps ve açılış ≤ 300 ms. Tutmazsa nokta sayısını düşür ve DEVIR §6 soru 3'e göre davran.
- **Her aşamada kayıt:** `app/src/lib/releases.js` sürüm notu, `HATA_GUNLUGU.md`, `YAPILACAKLAR.md`. Cihazda
  doğrulanmayan iş `[x]` olmaz, `[~]` olur.
- **Dürüstlük:**
  - Doğrulamadan "bitti" ya da "çalışıyor" deme.
  - Bilmediğin API, dosya ya da komutu uydurma; bilmiyorsan ara ya da sor.
  - Varsayımları "VARSAYIM:" diye işaretle.
  - Aynı yöntem iki kez başarısız olursa üçüncüyü deneme; yöntemi değiştir ya da sor.
  - İstenmeyen refactor ya da ek değişiklik yapma.

## 4. Her aşamanın "bitti" tanımı (PLAN §9)
1. Bütün takım yeşil.
2. G1'de eşdeğerlik 0 fark.
3. Yeni kod için birim testleri (DEVIR §7).
4. Vite önizlemesinde 3 durum × 2 tema × 390/320 ekran görüntüsü ve maketle yan yana karşılaştırma. Görüntülere
   gerçekten bak.
5. İki bağımsız inceleme: kod ve dil.
6. TestFlight yapısı.
7. DEVIR §8'deki cihaz listesi. Ölçülen fps, açılış ve pil değerleri sayıyla yazılır.
8. Sahibin cihazda bakışı. Son kabul sahibindir.

## 5. Sahibe sorulacaklar (kodlamaya başlamadan önce, tek mesajda)
DEVIR §6'daki üç soru: kendi yüzün ilk sürüme girsin mi; aylık bildirim metni; performans tutmazsa ne yapılacak.
Cevaplar gelene kadar G1 ve G2'ye başlayabilirsin; G2b'ye ve aylık bildirim metnine başlayamazsın.

## 6. Raporlama
Her aşama sonunda sahibe kısa bir rapor ver:
- Ne yapıldı.
- Hangi testler geçti (komut ve çıktı özeti).
- Ekran görüntüleri.
- Cihazda ne doğrulandı, ne doğrulanmadı.
- Açık riskler.

Bir sorun çıkarsa saklama; açıkça yaz.
