# DEVİR · Nef süper zekâ (ana oturuma)

Plan: `PLAN.md`, **onaylandı** (sahip, 2026-10-01: "onaylıyorum sen mükemmel diyorsan"). Tek kaynak plandır; bu belge
yalnız özetler ve sıralar.

Bu oturum `app/` altında hiçbir dosyaya dokunmadı ve ücretli çağrı yapmadı. Satır numarası verilmez; dosya ve işlev
adıyla aranır.

## Onaylı kararlar (soruların önerilen seçenekleri; plan §10)
1. Ana sayfa "Bugün · Nef" kartının günlük model çağrısı kalkar; an motoru yerini alır. Model haftalık mektuba geçer.
2. Nef'in kendi bildirimi günde en çok 1, haftada en çok 4. Kişinin kurduğu hatırlatmalar bu sınıra sayılmaz.
3. İlk sürüm (N1): F1 yağmur ve kişinin yürüyüş saati (F3 sıcaklık yan cümlesiyle), F2 seni hatırlayan Nef, F4 susan
   Nef, genel an türleri ve modül sözleşme testi (§4.8).
4. "Evden çıktın" anı: **açık soru**; N4'e kadar gerekmez.
5. Sonraki dil önce İngilizce. Şimdilik yalnız Türkçe yazılır ama yapı baştan dile göre kurulur (§4.7).

## Sıra
N1 → N2 (bilgi bankası `claims`, mektup, `coach` v2 rızası, model sınavı) → N3 → N4 → N5.

N1, B1b ve sabah havasıyla birlikte gelir. Onaylı B1–B3 sırası bozulmaz (`bildirim-hava-yuruyus/DEVIR.md`).

## Kod öncesi sahip onayı gerekenler
- **Kullanıcıya görünen her cümle.** Plandaki cümleler taslaktır. 5 saniye kapısından geçenler `ornekler/` altında:
  M2, M1C, M4A, M5C.
- **Ücretli işler:** banka üretimi (≈ 1 USD), model sınavı (≈ 1 USD), yürüyüş sesleri (≈ 0,42 USD).
- **`coach` v2 rıza metni** (N2): sahip ve hukukçu onayı.

## Dokunulmazlar
- 74xx deney bildirimlerinin kimliği, metni ve saati değişmez.
- Doktor ve WHO-5 cümleleri sabit kalır, an motoruna girmez.
- Kamera görüntüsü, Apple Sağlık verisi, konum ve hava sunucuya gitmez.
- Sağlık iddiası yok.
- Gelişim ekranlarında "beyin" ve "tanıma" sözcükleri geçmez.

## Yeni kimlikler ve anahtarlar
- Bildirim kimlikleri 7900–7919 (`planNef`; boş olduğu bu oturumda doğrulandı).
- `gozolcum:nef-said` (söz hafızası) ve `gozolcum:nef-letter` (mektup önbelleği). İkisi de "Tüm verileri sil" ve dışa
  aktarıma eklenir.

## Kapı
Her yeni kart ve bildirim görünümü gerçek veriyle yeniden 5 saniye kapısına girer: beş değerlendirici, 4/5, iki tema,
390 ve 320. Rekor kartı (M5A, 3/5) kapıdan geçmeden Nef kartı olmaz.
