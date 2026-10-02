# B adımı · düzeltme turu · iki model incelemesinin işlenmesi

Tarih 2026-09-30. PLAN.v3 §E.1, karar 2 yedeği: Türkçe editör ve usta hoca yerine iki bağımsız model incelemesi
yapıldı. Bu kararlar insan onayı değildir. Ses üretilmedi ve ücretli çağrı yapılmadı. `/home/user/eyes` ile pilot
dosyalarına dokunulmadı.

Değişiklikten önceki bütün dosyalar `b/_yedek_duzeltme/` altında duruyor (ders1, ders2, ders3, ders5, work, SPEC.v3.md).
Yedeklemeden önce dört dersin üretim hattının aynı çıktıyı yeniden verdiği sınandı: dosyalar byte byte aynı, ders2
sha256 değeri de aynı çıktı.

Çelişkilerde öncelik sırası şuydu: güvenlik, sonra Türkçe doğruluk, sonra süre.

Her bulgu önce doğrulandı. Sonuç sütunundaki terimler şöyle okunur:
- **DÜZELTİLDİ:** önerinin kendisi uygulandı.
- **DÜZELTİLDİ (başka biçim):** sorun giderildi ama önerilen metinden farklı bir metinle. Gerekçesi satırda yazar.
- **DEĞİŞMEDİ:** bulgu işlenmedi. Gerekçesi satırda yazar.

Kısaltmalar: TE Türkçe editör incelemesi, UH usta hoca incelemesi.

## Bulgular (her bulgu bir satır)

| # | Kim · önem | Nerede | Ne | Sonuç |
|---|---|---|---|---|
| TE1 | TE · BLOCKER | ders3 `extras.stopReturn` | Durdurma ekranında ortak metin görünüyordu, sesli dönüş ise başka üç cümle okuyordu. Ekran söyleneni göstermiyordu. | DÜZELTİLDİ: `screenText` artık söylenen üç cümle ("Ders burada bitti; şu an yatağındasın. Gözlerini açıp çevrene bakmak iyi olur; acele yok. Kalkacaksan önce yana dön, otur ve bekle; başın dönerse biraz daha otur."). Ortak metin `screenTextCommon` alanında duruyor. Bu, PLAN.v2 §B.5'teki "ekran metni ortak" kuralından Ders 3'e özgü bir sapma; plana not düşülmeli (açık 4). |
| TE2 | TE · BLOCKER | ders2 `c4.ses`, orman ve kıyı sahneleri | Cümlelerde yüklem yoktu. | DÜZELTİLDİ: "Uzaktan yaprak hışırtısı gelip gidiyor." ve "Uzaktan dalgaların sesi gelip gidiyor." (`work/build_lesson.py` SCENE_TEXT). `units-v3.json` listesine iki yeni birim eklendi: `c4.ses.orman` ve `c4.ses.kiyi`. 15 dk check_plan GEÇTİ. H12 (15 dk): Varış 18,2 > Derinleşme 14,9 > Derin 14,3. |
| TE3 | TE · SHOULD | ders2 `n1.sec` | "olsun" fiilinin öznesi yoktu; seste "veriyorum olsun" tek öbek gibi duyuluyordu. | DÜZELTİLDİ: editörün en az değişiklikli biçimi seçildi: "…gelmezse niyetin "Kendime dinlenmeye izin veriyorum" olsun." (+3 hece). Seçenek 2 ve 3 de bu kalıba çevrildi. Editörün ilk önerisi (üç cümlelik biçim) denendi, sığmadı: 5 dk boş payı 14,5 sn'ye düştü (Nefona Hoca kons, taban 15) ve H12 denetimi kaldı. |
| TE4 | TE · SHOULD | ders2 `n2.hatirla` ve kısa biçimi | "Ya da yine … olsun" cümlesi ilk cümleye bağlanmıyordu. | DÜZELTİLDİ (başka biçim). Uzun biçimde usta hocanın cümlesi kullanıldı: "Hatırlamazsan "Kendime dinlenmeye izin veriyorum" demen de olur." (UH5 ile aynı birim). İki inceleyici ayrı cümle önermişti. İkisi de güvenlik ve Türkçe yönünden doğru olduğu için süre belirledi: bu cümle en kısası, "yeterli" tekrarı ve "-(y)abil-" yok. 5 dk kısa biçimi tek cümleye indi: "Niyetini içinden bir kez daha söylemek yeterli." Nedeni: iki öneri de kısa biçimde 5 dk boş payını 13,6–14,4 sn'ye indiriyordu (taban 15) ve H12 kalıyordu. N1'de hazır niyet zaten dinleyicinin niyeti olarak veriliyor, bu yüzden "Niyetini" iki durumu da kapsıyor. N2 bloğunun 15 sn tabanı için sessizlik 11,5 / 13 / 15 sn oldu. İçerikten bir cümle eksildi; bu karar sahibin ya da insan editörün onayını bekliyor. |
| TE5 | TE · SHOULD | ders1 `c1.guven`, `openingScreen[2]` | Koşul eki yalnız ikinci yüklemdeydi. | DÜZELTİLDİ: "Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön." (iki yerde). |
| TE6 | TE · SHOULD | ders1 `c2.nasil` | "almak" fiilinin nesnesi yoktu. | DÜZELTİLDİ: "Burnundan bir nefes alıyorsun, ardından üstüne küçük bir alış daha ekliyorsun." |
| TE7 | TE · SHOULD | ders1 `c1.ritim` 3 dk | "tutmak" fiilinin nesnesi yoktu. | DÜZELTİLDİ (başka biçim): "Alış dört, veriş altı sayı sürecek; nefesi tutmak yok." Hece sayısı değişmedi. Önerilen "arada nefes tutmak yok" (+2 hece) 3 dk boş payını 9,7 sn'ye düşürüyordu (taban 10) ve D1-boş-pay denetimi kalıyordu. |
| TE8 | TE · SHOULD | ders1 `c2.tur2`, `c3.el` | Çifte izin ("İstersen … -ebilirsin"). | DÜZELTİLDİ: `c2.tur2` için editörün biçimi "Bir tur daha iç çekişle devam etmek sana kalmış." (bir "-(y)abil-" eksildi); `c3.el` "Bir elini göğsüne koyup titreşimi avucunda da hissedebilirsin." Usta hoca (UH14) `c2.tur2`'de "-ebilirsin"i koruyordu; editörünki seçildi. |
| TE9 | TE · SHOULD | ders5 `k.avuc1` | Çifte izin. | DÜZELTİLDİ: "Gözlerin kapalıysa, avuçlarını birbirine sürtüp ısıtabilirsin." |
| TE10 | TE · SHOULD | ders5 `c2.bas` | "Ona" sözcüğü seste zamir gibi duyulabiliyordu. | DÜZELTİLDİ: "On olunca yeniden birden başlıyorsun; …" `c2.nasil`'deki "ona kadar" bırakıldı: bağlam anlamı açıyor, inceleyici de böyle yazdı. |
| TE11 | TE · SHOULD | ders3 `c1.zorlanirsan` | "Nefes zor gelirse" nefes darlığı gibi anlaşılabiliyordu. | DÜZELTİLDİ: "Uzun veriş zor gelirse kendi ritmine dön." |
| TE12 | TE · SHOULD | ders3 `c1.dudak` | Eşdizim ve iyelik eki yanlıştı. | DÜZELTİLDİ: "Verişte nefes burnundan ya da hafif aralık dudaklarından çıkabilir." |
| TE13 | TE · SHOULD (UH2 ile aynı) | ders3 `c2.topuk`, `c2.bel`, `c2.omurga`, `c2.boyun` | Cümleler yan yatan dinleyiciye uymuyordu. | DÜZELTİLDİ. İki önerinin birleşimi kullanıldı: `c2.topuk` "Ayaklarının yatağa değdiği yerleri fark ediyorsun." (TE); `c2.bel` "Gövden bütün ağırlığıyla yatakta." (UH; editörün cümlesi de yan yatana tam uymuyor ve "da" üst üste geliyordu); `c2.omurga` "Omurgan boydan boya uzanıyor." (UH; editörün "Bedenin…" cümlesi `c2.butun`'la yinelenirdi); `c2.boyun` "Boynun yastığa yaslanıyor." İki öneri de "Başın ve boynun…" diyordu; "baş" sözcüğü `c2.bas`'ta ayrıca geçtiği için başka biçim seçildi. |
| TE14 | TE · SHOULD (UH3 ile aynı) | ders3 `c3.su` ve yağmur cümleleri | Seçim sunuluyordu ama ardından gelen metin seçimi yok sayıyordu. | DÜZELTİLDİ. Editör son kararı usta hocaya bırakmıştı; hocanın cümlesi alındı: "Yağmur sesi sana iyi gelmezse onu çok uzakta düşünmen de olur." Sahne değişmediği için sonraki yağmur cümleleri doğru kalıyor. Aynı cümleye bağlı notlar da güncellendi: scenePicker, music.nature.imageSync, imageArc, script ve iskelet. |
| TE15 | TE · SHOULD | ders1 ve ders5 `afterCheck.onCok` | "durman doğruydu" sözü, dersi sonuna kadar yapan kişiye söyleniyordu. | DÜZELTİLDİ: "Bu olabiliyor; zorlandığında durmak her zaman doğru bir seçim. …" Aynı kaynak metin ders2 v3'te de vardı; ders2 de düzeltildi. Ders 3'e dokunulmadı, çünkü orada soru yalnız X ile durdurunca çıkıyor. |
| TE16 | TE · SHOULD | ders3 `evidenceLine` | Sıfat öbeği yanlış yere bağlıydı; iyelik ve bağlaç sorunları vardı. | DÜZELTİLDİ: önerilen metin. |
| TE17 | TE · SHOULD | ders1 `evidenceLine` | "tersine göre" çeviri gibi duruyordu. | DÜZELTİLDİ: "…uzun alış ve kısa verişe göre…". Aynı kalıp ders1.script.md'de (Van Diest satırı) ve ders3 kaynak ayrıntısında da vardı; ikisi de düzeltildi. |
| TE18 | TE · SHOULD | ders5 `evidenceLine` | Çeviri kokusu vardı; karşılaştırılan gruplar belirsizdi. | DÜZELTİLDİ: önerilen metin. |
| TE19 | TE · NIT | ders2 `k.oda.ayrinti` | Cümle yüklemsiz bir liste. | DEĞİŞMEDİ. İnceleyicinin kendi kararı: liste istisnasına girer. `units-v3.json` inceleme_notlari alanına işlendi. Kayıtlı birim, yeniden ses gerekmiyor. |
| TE20 | TE · NIT | ders2 `n1.soyle.kisa` | Nesne düşmüştü. | DEĞİŞMEDİ. Eski biçime (+4 hece) dönülünce 5 dk boş payı 13,7 sn'ye iniyordu (kons, taban 15). İnceleyici bu durumda mevcut biçimi kabul ediyor. |
| TE21 | TE · NIT | `g.ilk` (ders2), `i.ilk` (ders1, ders5) | "kapanışa geçmen" sözü ilk kez gelen dinleyici için belirsizdi. | DÜZELTİLDİ (başka biçim): "Bugün yalnızca tanışıyoruz; zorlanırsan ekrandaki "Kapanışa geç" düğmesine dokunman yeterli." Önerilen ""Kapanışa geç"e" biçimi seste "geçe" diye duyulur ve saat söyleyişine karışır. Yeni cümlede "-(y)abil-" yok. PLAN.v3 §D.3'teki metinden farklı; plana not düşülmeli (açık 4). |
| TE22 | TE · NIT | ders1 `c1.burun` | "oradan" dolaylı kalıyordu. | DÜZELTİLDİ: "…alış da veriş de burnundan olsun." Hece sayısı aynı. |
| TE23 | TE · NIT | ders1 ve ders5 `a.gozler` | "açıksa" sözünün öznesi yoktu. | DÜZELTİLDİ: "…sana kalmış; gözlerin açıksa bakışın yere insin." Ders 1'de "yumuşakça" çıkarıldı. Nedeni: tam öneri (+3 hece) Varış'ın 60 sn konuşma payını sarsıntı taramasında (×1,10) 0,61'e çıkarıyordu (tavan 0,60) ve 6 dakika kalıyordu; bu biçimle tarama eski durumuna döndü. |
| TE24 | TE · NIT | ders5 `c1.kac` | Özne kaymıştı. | DÜZELTİLDİ: "Dikkatinin kaç kez dağıldığı hiç önemli değil; her dönüş değerli." |
| TE25 | TE · NIT | ders5 `c1.yer` (ana ve 3 dk biçimi) | "en açık" zarf olarak eğreti duruyordu. | DÜZELTİLDİ: "Nefesi en çok burnunda mı, …" |
| TE26 | TE · NIT | ders5 `preparationCard[1]` | Özne yanlıştı; "birkaç dakika" 15 dk sürüme uymuyordu. | DÜZELTİLDİ (başka biçim): "Bildirimleri sessize aldığın sakin bir yer". Önerideki "sessize … sessiz" yinelemesi alınmadı. |
| TE27 | TE · NIT | ders3 `c3.yer` | "örtülü" ile ardından gelen "örtü" yankılanıyordu. | DÜZELTİLDİ: "Belki üstü kapalı bir verandadasın." panelChecks yedeği ve imgesel yay notu da güncellendi. |
| TE28 | TE · NIT | ders3 `c3.cam` | "izler süzülüyor" anlamca yanlıştı. | DÜZELTİLDİ: "Yakındaki camdan yağmur damlaları ağır ağır süzülüyor." |
| UH1 | UH · BLOCKER | ders3 `c4.giris` | Sayma 10–13 dk'da beşten başlıyor, ama giriş cümlesi "Ondan bire" diyordu. | DOĞRULANDI: planlayıcıda üç köşede de 10–13 dk sırası giris → n05 çıktı (`work/_d3c4.py`). DÜZELTİLDİ (başka biçim): "Bire kadar geri sayacağım. Her sayıda nefesini bırakıyorsun." Hece sayısı aynı. Hocanın "Bire doğru" önerisi yerine, daha yaygın söyleyiş olduğu için "Bire kadar" seçildi. Ders 2'nin "Geriye doğru sayacağım." cümlesinden de ayrı kalıyor. Blok başlığı güncellendi. |
| UH2 | UH · SHOULD | ders3 C2 ↔ `a.durus` | TE13 ile aynı bulgu. | DÜZELTİLDİ (TE13 satırı). |
| UH3 | UH · SHOULD | ders3 `c3.su` | TE14 ile aynı bulgu. | DÜZELTİLDİ (TE14 satırı; hocanın cümlesi). |
| UH4 | UH · SHOULD | ders2 `c4.koku` orman ↔ ders3 `c3.toprak` | İki derste neredeyse aynı cümle vardı; benzersizlik kuralı bozuluyordu. | DÜZELTİLDİ: ders2 orman biçimi "Havada çam ve yosun kokusu var." Birim zaten 20 dk için yeni seslendirme listesindeydi; ek maliyet yok. |
| UH5 | UH · SHOULD | ders2 `n2.hatirla` | TE4 ile aynı bulgu. | DÜZELTİLDİ (TE4 satırı). |
| UH6 | UH · SHOULD | ders1 `c3.eller` | "gözlerini kapatman gerekmiyor" sözü "gözlerini aç" diye anlaşılabiliyordu. | DÜZELTİLDİ (kısmen başka biçim): "Parmaklarınla kulaklarını ya da yüzünü kapatman gerekmiyor." Önerinin ikinci yarısı ("ellerin kucağında kalsın") alınmadı, çünkü `a.eller` ("dizlerinde ya da kucağında") ve `c3.el` ("elini göğsüne koyup") ile çelişirdi. |
| UH7 | UH · SHOULD | ders1 C3 sırası | İlk vızıltıdan önce yaklaşık 63 sn yalnız anlatım vardı. | DÜZELTİLDİ: `c3.agiz` ve `c3.kisa` artık `c3.d2`'den sonra (fillRank değişmedi). 15 dk'da ilk "Al…" `c3.ad`'dan 46 sn sonra geliyor (önce 63 sn). D1-kilit, D1-döngü ve önek denetimleri GEÇTİ. |
| UH8 | UH · SHOULD | ders1 `c2.sonra` | Zaman kayıyordu; imgesel yayın 3. adımı erken harcanıyordu. | DÜZELTİLDİ: klip çıkarıldı (hocanın ikinci yolu). Birinci yol, yani `c2.d5`'e sessizlik cümlesi eklemek, yayın 3. adımını yine C2'de harcardı. Yay artık yalnız C3 sonunda `c3.sessizlik` ile kapanıyor. |
| UH9 | UH · SHOULD | ders5 `k.avuc2` ve `k.avuc3` | Güvenlik kuralı eylemden sonra geliyordu. | DÜZELTİLDİ: önce "Avuçların gözlerine değmeyecek; kenarları alnına ve elmacık kemiklerine yaslanacak.", sonra "Şimdi onları bastırmadan gözlerinin üstüne getiriyorsun." Sessizlikler de eylem sırasına göre yer değiştirdi (4 / 6 sn). |
| UH10 | UH · SHOULD | ders3 30 dk iskeleti, C5 | Yürüyüş uyarılmayı artırıyordu. | DÜZELTİLDİ: C5 artık "İmgede sessiz kalış: yağmurun sesiyle" (lesson.json `skeleton30` alanı, iskelet30.md, script §8). PLAN.v2 §A.2.2'nin 23:30 satırına not düşülmeli (açık 4). |
| UH11 | UH · SHOULD | ders3 30 dk pencere dönüşleri | Dönüş tınısı ve karşılama cümlesi uyuyan dinleyiciyi uyandırabilirdi. | DÜZELTİLDİ: pencere en çok 45 sn (`limits.silenceWindowMaxSec` 90'dan 45'e; bu değer ≤ 15 dk planlarını etkilemiyor). Tını ve karşılama cümlesi yok; dönüşte imgeden tek cümle ("Yağmur sürüyor."), evre düzeyinin 3 dB altında; duyuruda "Uyanık kalırsan da olur." Kural `skeleton30.windowRule30` alanında. Düzeyler VARSAYIM. |
| UH12 | UH · NIT | ders5 `c3.d18`, `c3.d30` | "geri getiriyorsun" üç kez yineleniyordu. | DÜZELTİLDİ: "Işık yine nefeste." ve "Buradayım. Işık kaydıysa, onu usulca noktaya çağırıyorsun." |
| UH13 | UH · NIT | ders3 `c3.agirlik`, `c2.bas` | "üstünde" yankılanıyordu; motif Ders 2'ye kayıyordu. | DÜZELTİLDİ: "Örtünün tatlı ağırlığı seni sarıyor." ve "Başının ağırlığını yastığa bırakıyorsun." soundCheck ekran metni de güncellendi. |
| UH14 | UH · NIT | ders1 `c2.tur2`, `c3.el`; ders5 `k.avuc1` | Çifte izin. | DÜZELTİLDİ (TE8 ve TE9 satırları). |
| UH15 | UH · NIT | ders5 `a.dagink`, `c2.seyrek` | Kulakta yanlış okuma riski vardı. | DÜZELTİLDİ (a.dagink başka biçim): "Önce ışık geniş ve dağınık; …" Önerilen "İlk anda", cümledeki "aynı anda" ile yankılanıyordu ve ×1,10 taramasında Varış'ın 60 sn payını 0,601'e çıkarıyordu. `c2.seyrek`: "…aralarında nefes var, bir de ışığın noktası." |
| UH16 | UH · NIT | ders3 ilk ders cümlesi | Birimin adı ayrılmamıştı. | DÜZELTİLDİ: kimlik `g.ilk.uyku` oldu, metin kabul edildi. PLAN.v3 §D.3'e not düşülmeli (açık 4). |
| UH17 | UH · NIT | ders3 beden dolaşımının yönü | Hangi sıranın bağlayıcı olduğuna karar gerekiyordu. | KARAR KAYDEDİLDİ: yön ayaklardan başa kalıyor (iskelet30.md §8, script §8). PLAN.v2 §E.6 #5'e not düşülmeli (açık 4). |
| UH18 | UH · NIT | (a) ders1 3 dk boş payı; (b) ders5 `a.izin` 3 dk | (a) Pay dar. (b) Kapak sıkıştırılmıştı. | (a) DOĞRULANDI, ama önerilen düzeltme işe yaramıyor. `c1.d2` yerine `c1.d1` konunca boş pay değişmiyor (10,09 → 10,09 sn; döngüler nefes kilidinde, döngü başına 10 sn sabit). Hazırlanan başka yol: `c1.d3` için minTarget 240. Denendi: × 1,05'te 17,2 sn, × 1,10'da 14,3 sn; 3/4/5 dk GEÇTİ. Uygulanmadı; yazılı olarak lesson_meta.json → `timingModel.contingency3min` alanında duruyor. Güvenlik önceliği yüzünden 3 dk'da `c1.d2`'nin "Altı uzun gelirse beş de olur." izni korunuyor. (b) DÜZELTİLDİ: `a.izin` 3 dk sessizliği en az 3 sn; `c1.izle` 3 dk üst sınırı 17'den 16,5 sn'ye indi. |
| UH19 | UH · NIT | ders2 (a) `a.gozler.kisa`; (b) `c4.x.yaklas` | (a) Gözleri açık tutma seçeneği sözle söylenmiyordu. (b) Ekran metni ile TTS metni farklıydı. | (a) DÜZELTİLDİ: "Gözlerini kapatıp kapatmamak sana kalmış." (+2 hece). Bu değişiklik ayrıca n1.sec düzeltmesinden sonra H12'yi geçirmek için de gerekli oldu (Varış 15,50 > Derinleşme 15,12). (b) DÜZELTİLDİ: `ttsText = text` (virgüllü biçim, üç sahnede de); nefes çifti ilk virgülden kesiliyor. |
| UH20 | UH · bilgi | Özet | Denetim kaydı. | Bu turda bütün denetimler yeniden üretildi; sonuçlar aşağıda. Bu satırda istenen iş yoktu. |

## Yeniden üretilen denetimler (düzeltmeden sonra)

Aşağıdaki sonuçların hepsi yeniden üretildi. Kaynaktan veri, veriden timing.txt, script.md ve iskelet30.md
çıkarıldı; ders3 iskelet30.md elle yazılmış bir dosya olduğu için elle güncellendi.

| Ders | check_plan sonucu | Boş pay (üretim köşesi) | Sarsıntı taraması (bilgi) |
|---|---|---|---|
| Ders 1 (`ders1/timing.txt`) | 3 köşe × 13 dakika GEÇTİ; metin denetimi GEÇTİ | 3 dk 10,1 sn (taban 10; önce 10,3); 5 dk 23,1 sn | ×1,05 ve ×1,10'da yalnız 3 dk kalıyor (önceki turla aynı durum) |
| Ders 3 (`ders3/timing.txt`) | 3 köşe × 11 dakika GEÇTİ; metin denetimi GEÇTİ | 5 dk 19,4 sn | Hepsi GEÇTİ |
| Ders 5 (`ders5/timing.txt`) | 3 köşe × 13 dakika GEÇTİ; metin denetimi GEÇTİ | 3 dk 19,5 sn; 5 dk 43,3 sn | ×1,10'da yalnız 4 dk şafağı kalıyor (önceden de böyleydi) |
| Ders 2 (`ders2/timing.txt`) | hoc, nes ve hak × birim/kons: 5–20 dk her dakika GEÇTİ; önek, T5 ve "Kapanışa geç" GEÇTİ; lint temiz | 5 dk birim 17,0 / kons 15,3 sn (taban 15; önce 17,9 / 15,9) | Model köşeleri 77/78 (pilotla aynı; kalan tek vaka 6,6 · 13 dk · T5, yayında yok) |

Ders 2 için ek bilgiler:
- 5 dk'da H12: Varış 15,50 > Derinleşme 15,12 > Derin 12,88. N2 bloğu 16 sn.
- Ara denemede bir gerileme oldu: 6,6 hece/sn köşesinde 5 dk'da N2 bloğu 14,9 sn'ye düştü. Kısa biçimin tercih edilen
  ve en uzun sessizliği artırılarak (13 / 15 sn) giderildi.

Ek denetimler:
- `work/_ed_check.py` dört dosyanın hepsinde temiz: ekran = TTS, alt klipler birleşince birimin metnini veriyor ve
  bütün metinler script.md'de var.
- Çok cümleli birimlerde iki nokta yok.
- "İstersen … -(y)abil-" kalıbı dört derste de kalmadı.
- Ders 3'te C4 sırası şimdi şöyle: 10–13 dk "Bire kadar…" → beş…bir; 14–15 dk → on…bir.

Seslendirme listesi (`ders2/units-v3.json`): 28 birim, 1.495 karakter (önce 26 birim, 1.422 karakter). Kredi tahmini
yaklaşık 5.299 (önce 5.039); uzlaştırılmış bir değer değil, VARSAYIM.

## Kalan açıklar

1. **Ses yok.** Bütün süreler hece modelinden tahmin. Seslendirme bu oturumda yapılmadı.
   - Ders 1'in 3 dk boş payı 10,1 sn, taban 10; payın bitmesine çok az kaldı. Ölçülen süre daha uzun çıkarsa
     `contingency3min` uygulanmalı.
   - Ders 2'nin 5 dk boş payı kons kestirimde 15,3 sn, taban 15.
   - Ders 2'nin 5 dk H12 payı 0,38 hece/cümle. Varış ya da N1 kısa biçimlerine dokunulursa bu denetim yeniden
     koşulmalı.
2. **Ders 2'de 5 dk N2 kısa biçimi.** Önceki ikinci cümle ("… olsun") çıktı. Bu bir içerik kararı; sahibin kulağı ya
   da insan editör isterse geri alınabilir. Ancak iki cümlelik hiçbir öneri 5 dk tabanına sığmadı.
3. **Yeniden seslendirilecek birimler.** Seslendirme bu adımda yapılmadı; aşağıdakiler bekliyor.
   - `c4.ses.orman` ve `c4.ses.kiyi` kayıtlı birimlerdi, artık yeniden seslendirilecek listede.
   - n1.sec, n2.hatirla, a.gozler.kisa, n2.hatirla.kisa, c4.koku ve g.ilk'in metinleri değişti. Bunlar zaten
     seslendirilmemiş birimlerdi.
   - Ders 1, 3 ve 5'in hiçbir birimi daha seslendirilmedi.
4. **Plan dosyalarına düşülecek notlar.** `/home/user/eyes` bu adımda değiştirilmedi; orkestratör ya da sahip
   işlemeli.
   - PLAN.v2 §B.5: Ders 3'ün durdurma ekranı ortak metinden ayrılıyor (TE1).
   - PLAN.v2 §A.2.2, 23:30 satırı: "imgede sessiz kalış" (UH10).
   - PLAN.v2 §E.6 #5: uyku dersinde yön ayaklardan başa (UH17).
   - PLAN.v3 §D.3: ilk ders cümlesinin yeni metni ve Ders 3 için `g.ilk.uyku` birimi (TE21, UH16).
   - Ders 3'te pencereler en çok 45 sn, dönüşte tını yok (UH11).
5. **Önerilenden farklı yazılan metinler.** Aşağıdakiler önerilenden farklı yazıldı; hepsinin gerekçesi yukarıdaki
   tabloda. Bu turda başka bir inceleyici bunlara bakmadı.
   - TE7, TE21, TE23, TE26: önerilen metin kurala ya da süreye takıldı.
   - UH1: "Bire kadar" seçildi.
   - UH6: önerinin yalnız ilk yarısı alındı.
   - UH15: "Önce" seçildi.
   - TE13 ve UH2: iki önerinin birleşimi kullanıldı.
6. **İnsan onayı yok.** Bu tur karar 2 yedeğidir. Sahibin kulağı, Scribe geri çevirisi ve dinleme paneli bekliyor.
   Usta hoca ölçütlerinden 14–16 (hız, ses ile müzik dengesi, Türkçenin geri çevrilmesi) ses üretilmeden
   denetlenemez.
7. **Pilotta kalan, yayında olmayan açık.** Ders 2 model köşesinde 6,6 · 13 dk vakası T5 denetiminden kalıyor. Pilotta
   da aynıydı, bu turda dokunulmadı.
8. **Doğrulama betikleri.** Tabloda sözü geçen denemeler yeniden koşulabilir: `work/_d3c4.py`, `work/_d1swap.py`,
   `work/_d1sweep.py`, `work/_d1dense.py`, `work/_d3sum.py`. Kullanım: `TD=timing_d5` ortam değişkeniyle Ders 5
   için de koşar.
