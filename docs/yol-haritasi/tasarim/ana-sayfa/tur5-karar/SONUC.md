# Ana sayfa · tur 5 (iris ilk 7 gün yok, hava satırı) · 2026-10-01

Değişiklikler: tur 4 yaması geri geldi; iris ilk 7 gün ilk ekranda yok; "ilk durağın …" cümlesi kartla aynı durağı
söylüyor; hava satırı (SkyLine, yalnız test derlemesi ve rıza varsa). Yedi senaryo, beş değerlendirici, çoğunluk (3/5),
iki tur.

| Senaryo | Tur 1 | Tur 2 |
|---|---|---|
| 1. gün | 0/5 | 1/5 |
| 2. gün | 0/5 | 0/5 |
| 9. gün | **5/5** | **5/5** |
| 30. gün | **5/5** | **5/5** |
| Eski kullanıcı | **4/5** | **4/5** |
| 9. gün akşam, yol bitmiş | **5/5** | **5/5** |
| 9. gün, hava satırı | 0/5 | 0/5 (geçersiz) |

Hava senaryosu geçersiz: ekran çekme düzeneği test derlemesi bayrağını (VITE_APP_BUILD=dev / VITE_TEST_UNLOCK=1)
açmadı, SKY_UI kapalı kaldı; görüntüler 9. günle bayt bayt aynı. Bu bir tasarım hükmü değil, düzenek hatası.

İlk iki gün yine kaldı. İris kalkınca ortak şikâyet: "imza görsel yok, sıradan liste"; 1. günde E testi kartta ve
yolun ilk durağında iki kez; 2. günde "Bu hafta 1/3 gün" neyi saydığı belli değil, dünkü emeğin karşılığı yok; mola
bandı alt menünün altında kesiliyor. Öteki notlar: "Yolun yenilendi" neyin değiştiğini söylemiyor; 30. gün tek gri
satır; akşam "yol tamam" derken iris yarı karanlık; koyu temada Dalga kartının Başla düğmesi soluk.

Kod depoya alınmadı. Değişiklik bu klasörde: `ana-sayfa-tur5.patch` ve `yeni-dosyalar/`.
Sahibe soru: ilk iki gün için iris yerine ne öne gelsin (ör. ilk günün tek kartı, ya da küçük bir iris başlangıcı)?
