# PLAN.md eleştirisi: kusursuzluğun önündeki eksikler

Kontrol kapsamı:
- PLAN.md'deki 66 PMID'nin hepsi bir `*.dogrulanmis.md` dosyasının ikinci tur doğrulama tablosunda var: sakin §13, benlik §19, teslim başlık notu, güvenlik §14.
- PubMed'den yalnız 2 kaydı kendim yeniden çektim: 41743305 ve 34350544. Kalan 64 PMID yalnız dosyalardaki tablolarla karşılaştırıldı; bu turda yeniden çekilmedi.
- Kod için yalnız `app/src/lib/breath.js:350-354` satırlarını okudum.

## BLOCKER

**1. A.2 Ders 6 ("Teknik", "Zaman ve duruş") ve B.4 Ders 6 (C3, C6): ayakta nefes çalışması var.**
- `breath.js:354` "Araç kullanırken, suda ya da ayaktayken yapma" diyor. Güvenlik §0-5 ve §11.C de "ayaktayken nefes pratiği hariç" diyor.
- PLAN'da ise "ayakta ya da oturarak dağ duruşu", "kollar nefesle" ve "isteyen ayağa kalkar" geçiyor.
- Düzeltme: bütün akış oturarak yapılsın, dağ duruşu yalnız oturarak olsun. "Ayakta" ve "isteyen ayağa kalkar" ifadeleri silinsin.

**2. A.2 Ders 2 "Kanıt", Gibbs 2026: ayrıntılar doğrulanmamış kopyadan alınmış.**
- "Tek 45 dk, n=23" doğrulanmış dosyada yok. Doğrulanmış kopyanın 79. satırından çıkarılmış, yalnız doğrulanmamış `dossier-sakin.md:72` dosyasında duruyor.
- Çalışmanın kronik ağrılı kişilerde yapıldığı da PLAN'da yazmıyor.
- PubMed'e göre (bugün yeniden çekildi): yarı deneysel, kronik ağrılı 23 yetişkin; 45 dk YN (n=12) ile beden taraması (n=11); iyi oluş hemen sonrasında YN'de daha fazla arttı (p=0,01). [DOI 10.4103/ijoy.ijoy_2_25](https://doi.org/10.4103/ijoy.ijoy_2_25)
- Düzeltme: cümleye "kronik ağrılı yetişkinlerde" eklensin, satır sakin §13'e yeniden çekilmiş olarak işlensin.

**3. B.3 madde 3–4 ile madde 6(d) ve B.2 çelişiyor.**
- Planlayıcı artan süreyi "iniş sessizliğine" veriyor; bu sessizlik 90 sn (Ders 4'te 45 sn) sınırını aşabilir. Test (d) ise "hiçbir sessizlik sınırını aşmıyor" diyor.
- Düzeltme: her bloğa isteğe bağlı "genişletme" klipleri yazılsın (ek tur, ek beden noktası, ek imge ayrıntısı). Böylece her ders için içeriğin en uzun hali sessizlik sınırlarını aşmadan 30:00'a ulaşır.
- Şu test eklensin: "her ders × iki ses, 30:00'a sınır aşılmadan ulaşılıyor". Hedefe ulaşılamıyorsa bu içerik hatasıdır; planlayıcı sessizliği uzatarak kapatmaz.

**4. B.5 tablosu ve E.3: ses motorunun yeniden kurulması eksik.**
- AVAudioEngine; AirPods bağlanınca, araç Bluetooth'una geçince ya da örnekleme hızı değişince yapılandırma değişikliği olayıyla durur. `mediaServicesWereReset` durumunda da ses bir daha gelmez. Bu, "ses kesilmeyecek" isteğini doğrudan bozar. Bu uygulamadaki davranışı doğrulanmadı.
- Düzeltme: B.5'e "AVAudioEngineConfigurationChange" ve "mediaServicesWereReset" satırları eklensin. Davranış: ses grafiği yeniden kurulur, klibin başından sürdürülür.
- E.7 madde 7'ye şu cihaz testleri eklensin: ders ortasında AirPods takma ve çıkarma, araç Bluetooth'una geçiş, Denetim Merkezi'nden çıkış değiştirme.

**5. F.2 "Aşama 0": pbxproj çakışması için yalnız "çözülür" yazıyor.**
Sahibin terminali şu an stash pop çakışmasında. Aşama 0'a somut adımlar eklensin:
1. `git diff app/ios/App/App.xcodeproj/project.pbxproj` ile işaretler görülür. Stash pop'ta "Updated upstream" = ours (HEAD), "Stashed changes" = theirs.
2. İki taraf farklı girdiler eklediyse işaretler silinip ikisi de korunur. Stash'teki değişiklik yalnız Xcode'un kendiliğinden yaptığı SwiftPM değişikliğiyse `git checkout --ours <yol>` kullanılır.
3. `plutil -lint app/ios/App/App.xcodeproj/project.pbxproj` çalıştırılır, ardından `git add <yol>`.
4. `npx cap sync ios` ve Xcode derlemesi başarılı olduktan sonra `git stash drop`.
5. `app/build-dev/` ve `…/xcshareddata/swiftpm/` için izlensin mi, yok sayılsın mı kararı sahibe bırakılır.

## SHOULD

**6. §0 "Paket boyutu" ve D.5: aralık hesabı yanlış.**
- PLAN'daki kendi tablosuyla hesaplanınca AAC 48 için 145–202 MB, AAC 64 için 177–250 MB çıkıyor.
- Yazılması gereken aralık: ≈ 145–250 MB (şu an "125–215"). G2 de buna göre güncellensin.

**7. D.4 ve D.3: ses düzeyleri birbirine bağlanmamış.**
- Konuşma −18 LUFS, yatak −24 LUFS; konuşma sırasında yatak "≥15 dB aşağıda" yani ≤ −33 olmalı. "+6 dB kabarma"nın neye göre olduğu yazmıyor.
- Düzeltme: üç mutlak düzey tanımlansın: kısılmış yatak ≈ −33, sessiz pencerede yatak ≈ −27, konuşma −18 (VARSAYIM).

**8. D.4 "Kısma" satırı: müzik her cümlede inip kalkabilir.**
- Klip arası boşluklar çoğunlukla 4–12 sn; 1,5 sn / 2,5 sn rampalarla müzik neredeyse her cümlede iner ve kalkar. Bu, içine çeken deneyimi bozar.
- Düzeltme: konuşmanın yoğun olduğu bloklarda yatak kısık kalsın, yalnız duyurulan ve ≥ 20 sn süren pencerelerde kalksın. qa.py'ye "dakikada en çok N kazanç değişimi" ölçütü eklensin.

**9. D.3 ve D.5: döngüler 30 dk içinde duyulur biçimde tekrarlanıyor.**
- 30 sn'lik doğa döngüleri ve 120–180 sn'lik yataklar 30 dk'da 10 ile 60 kez tekrarlanır. Bu, "kimse sıkılmayacak" isteğine aykırı.
- Düzeltme: katman başına 3–4 varyant üretilsin; çevrimdışı birleştirilerek tekrarsız, 5 dk'yı aşan yataklar kurulsun ya da varyantlar rastgele sırayla çalsın. Kuş sesinde tanınır motif tekrarlanmasın. qa.py'ye özilinti ölçütü eklensin. Boyut ve maliyet buna göre yeniden hesaplansın.

**10. A.2 Ders 1 "Müzik" ve E.2 "Nefes formu": müzikle nefes eşleşmesi sağlanamaz.**
- ElevenLabs Music'te tempo ve ton parametresi yok (elevenlabs.md §3). Bu yüzden "60 BPM 5/4 = bir nefes döngüsü" iddiası ve formun yatağın ~10 sn'lik cümlesiyle nefes alması garanti edilemez.
- Düzeltme: nefes blokları için bordun, uygulamanın kendi motoruyla basılsın (`design/dalga-uyku/render.mjs` hattı); orada periyot tam olur. Görsel yalnız nefes ipuçlarına kilitlensin. Üretilen yatakların temposu ölçülsün.

**11. D.2 "Oda sesi eklenmez" ve "Sessizlik" arka plan seçeneği.**
- Sessizlik seçilince 90 sn tam dijital sessizlik oluşur. Bazı Bluetooth kulaklıklar bu sürede kapanıp geri gelen ilk heceyi yutabilir (doğrulanmadı). Dinleyen de uygulamanın durduğunu sanabilir.
- Düzeltme: Sessizlik kipinde −55 ile −60 dBFS arası bir oda sesi taban olarak çalsın. AirPods'ta "90 sn sessizlikten sonra ilk hece" testi yapılsın.

**12. B.2 mikro-klipler ve D.2 seviye kuralı.**
- Tek sözcüklük "al", "ver" ve sayılar tek başına üretilince prozodisi bozuk çıkar. Bunlar bir taşıyıcı cümle içinde (`previous_text` / `next_text` ile) üretilip kesilsin.
- 1 sn'den kısa kliplerde LUFS ölçümü geçersiz (400 ms kapılama). Bu klipler evre referansına göre RMS ile eşitlensin.

**13. D.6 "harf harf" eşleşme ve klipler arası süreklilik.**
- Normalleştirme kuralı tanımlanmamış: sayılar, düzeltme işareti, kesme işareti, üç nokta. Tanımlanmazsa yanlış alarm yüzünden gereksiz yeniden üretim olur ve maliyet şişer. Uyuşmazlıklara insan karar versin.
- Klipler ayrı isteklerle üretildiği için ardışık klipler arasında tını ve F0 farkı ölçütü de eklensin.

**14. E.3 ses grafiği eksik tanımlanmış.**
- Döngü ve evre geçişleri en az 5 oynatıcı düğüm ister: konuşma, yatak A/B, doğa A/B. Her birinin kendi karıştırıcısı olmalı.
- Kısma rampaları yerel zamanlayıcıyla yürütülsün, JS ile değil. AVAudioMixerNode'un örnek hassasiyetinde rampası yok (doğrulanmadı). Aday B (AVMutableComposition + AVAudioMix) yeniden değerlendirilsin.
- Arka plandayken 20 Hz'lik konum olayları seyreltilsin.

**15. B.5 "Kilitli ekran" ve E.1 oynatıcı: ekranın açık kalıp kalmayacağı yazmıyor.**
- Düzeltme: oynatıcı Wake Lock tutmasın (Dalga.jsx:134-152'nin tersine); otomatik kilide izin versin. Uyku dersi ekranı hiçbir durumda gece boyu açık tutmasın.

**16. E.4 "Tamamlandı" kuralı: sarma ile kapanışa atlanıp ders tamamlanmış sayılabilir.**
- Düzeltme: tamamlandı = kapanışa ulaşıldı **ve** planlanan sürenin en az %60'ı dinlendi (VARSAYIM).

**17. A.2 Ders 3 "Gelişim" ve E.4: iki ölçü eksik tanımlı.**
- "Zihnin ne kadar meşgul" önce puanı ne `effects` ne `metrics` içinde; ya bir etki anahtarı eklensin ya da soru kaldırılsın.
- Ertesi sabah sorusunun ne zamana kadar sorulacağı yazmıyor (öneri: ertesi gün 12:00'ye kadar). Bu soru için E.1'de bir ekran maddesi de yok.

**18. A.1, E.1 madde 3 ve E.4: ölçek ve alanlar doğrulanmadı.**
- PLAN 0–10 kullanıyor ama Dalga'nın puan bileşeni 1–10 (kod-haritasi §1.2).
- `better` alanının varsayılanı ve `best: 'gün sayısı'` alanının tipi doğrulanmadı. Kod yazmadan önce registry.js ile doğrulansın.

**19. Güvenlik eksikleri (A.1, E.1, A.2 Ders 5 ve Ders 1).**
- İlk dersin ek cümlesi eksik: "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt." (güvenlik §11.A)
- Araç uyarısı yalnız onboarding kartında ve Ders 3'te var; güvenlik §11.E her dersin açılış ekranında istiyor.
- Uygulamanın göz kökeni nedeniyle: avuçlamada "gözlere bastırmadan" denmeli; bhramari parmaklar göze değmeden (shanmukhi olmadan) yapılmalı.

**20. G tablosu: sahibe sorulacak üç karar eksik.**
- **Yaş sınırı:** şu an §H'de; G tablosuna taşınsın.
- **Seslerin "eğitilmesi":** sahip bunu istedi (SAHIP_ISTEKLERI #4); PLAN bunu "ayar ızgarası" olarak yorumluyor. Bu yorumun sahipçe onaylanması gerek.
- **Adlandırma ve kapsam:** 10 dersin 9'u meditasyon, nefes ya da YN; asana çok az. Yalnız sesle, gözetimsiz dinlenen bir formatta bunun gerekçesi Cramer 2019. Sahibe "Yoga ve Meditasyon" adı mı, yoksa hafif, oturarak ya da uzanarak yapılan bir hareket dersi mi sorulsun.

**21. A.2 ders kartları: benzersizliği ve 30 dk'yı taşıyacak bilgiler eksik.**
- Her ders için şunlar yazılsın: benzersiz açılış cümlesi, anahtar cümle (C.4), imge yayı (C.4) ve 30 dk dikkat eğrisi (her 3–5 dk'da doku, teknik ya da sessizlik değişimi; VARSAYIM).
- Şu an imge yayı yalnız Ders 2'de var. Bunlar olmadan E.6 #8/#17 ve sahibin 4. isteği ("benzersiz", "sıkılmadan") üretimden önce denetlenemez.

**22. C ve E.6: incelemeyi kimin yapacağı belirsiz.**
- "Türkçe editör" ve "usta hoca" incelemesini kimin yapacağı yazmıyor. Anadili Türkçe insan bir editörün ve yoga nidra/meditasyon eğitimi almış bir hocanın onayı eklensin; Ders 4 ve 7 için bir psikolog da.
- Kör dinleme panelinin kimlerden oluşacağı tanımlansın; en az bir kişi 65 yaş üstü olsun.

**23. F.1 maliyet hesabı gerçekçi değil.**
- "5.500 kredi/USD" MCP çalışma alanının oranı. Üretim REST API ile yapılacak, yani abonelik katmanının kredisinden düşecek; katman ve aylık kota doğrulanmadı.
- `pcm_44100` Pro katman ister. REST ile müziğin süreye göre maliyeti ve Scribe maliyeti bilinmiyor.
- "Sormadan yinele" kuralı için bir yeniden üretim tavanı konsun (öneri: klip başına 2 deneme, sonra metin yeniden yazılır).
- Toplam, G5'teki ~100 USD tavanıyla uzlaştırılsın; kota yetmezse üretim fatura aylarına bölünsün.

**24. D.1: Neslihan ve Hakan kütüphane ("professional") sesleri.**
- Ticari uygulamada kullanım lisansı ve sesin kütüphanede kalıp kalmayacağı doğrulanmadı. Pilottan önce doğrulansın; 10 ders sınırlı bir zaman penceresinde üretilsin ve WAV arşivi tutulsun.

**25. G2: seçeneklere bir (c) eklensin.**
- iOS On-Demand Resources / Background Assets; yeni sunucu gerektirmez (bu projede doğrulanmadı). Ya da yalnız varsayılan ses pakette olur, ikinci ses indirilir.

**26. A.2 Ders 7 "Kanıt", Kirschner: tam metin notu eklensin.**
- Deri iletkenliği etkisi yalnız "kendine sevgi-şefkat" (LKM-S) koşulunda anlamlıydı (benlik C01).

**27. B.1 Moszeik: ifade abartılı.**
- "tek başına bir pratik olarak işlev gördü" yerine: "11 dk YN'de bekleme listesine göre küçük iyileşmeler görüldü (d=0,08–0,16)".

**28. E.8 sürüm notu: vaat ve jargon.**
- "hiçbir cümle yarıda kesilmez" yerine: "süre dolduğunda hiçbir cümle yarıda kalmaz". Arama ya da durdurma zaten cümleyi keser.
- Kullanıcıya dönük metinde "varışla" yerine "karşılamayla".

**29. B.4 Ders 10 ve Ders 7, 5 dk sürümü: bloklar çok kısa.**
- Ders 10'da C5 (engel + eğer-ise) 0:45, Ders 7'de C3 0:45. Bu süreye E.6 #1'deki "zaman verir" kuralı sığmaz; süreler yeniden dağıtılsın.

**30. E.1 "Kaldığın yerden" ve B.3: yarım kalan ders aynı biçimde kurulmalı.**
- Kaydedilecekler: ders, hedef saniye, ses, arka plan, plan sürümü ve konum. Plan belirlenimci olmalı. İçerik güncellendiyse ders baştan başlasın.

## NIT

**31. Türkçe düzeltmeleri.**

Ders sözleri:
| Ders | Şimdiki | Önerilen |
|---|---|---|
| 1 | "verişini uzatmayı öğren" (emir kipi) | "…nefes verişini uzatmak" |
| 2 | "Uyumadan, uyanık kalarak" (gereksiz sözcük) | "Uyanık kalarak derin bir dinlenme." |
| 6 | "uyandırarak ve tek bir niyetle" (yapıca farklı öğeler bağlanmış) | "Güne bedenini uyandırıp tek bir niyet seçerek başlamak." |
| 9 | "Bedeninden … kendine bakmak" | "Bedenine, nefesine ve duygularına bakarak kendini tanımak." |
| 10 | "kişiyi … bir gün olarak görmek" (anlam bozukluğu) | "Olmak istediğin kişinin bir gününü canlı biçimde görmek…" |

C.8 örneği kendi davet kuralını (C.1, E.6 #9) çiğniyor:
- "Niyet seç" yerine "İstersen kendine kısa bir niyet seçebilirsin."
- "İçinden söyle" yerine "…söyleyebilirsin."

Diğerleri:
- E.1 süzgeç çipi: "5 dakikada" yerine "5 dakikalık".
- Uyku dersi düğmesi: "Uykuya bırak" yerine "Uykuya geç".
- Ders 5 ölçüsü: "ne kadar toplu" yerine "Dikkatin şu an ne kadar toplanmış?". Etiket "toplanmışlık" yerine "odak".
- D.2: "sızıltı" yerine "ıslıklı sesler (sibilans)".
- Kısaltmalar tek biçimde olsun: HRV ile KAD karışık kullanılıyor.

**32. Kanıt etiketleri ve künye ayrıntıları.**
- Luu 2024 → gözler açık açılış cümlesi: "tasarım çıkarımı" diye etiketlensin (güvenlik C10).
- Wang 2021 (kulaklık) → hoparlör önerisi: "tasarım çıkarımı" diye etiketlensin (güvenlik C27).
- Huberty 2022'nin örneklemi yazılsın: kanser hastaları, görüşme n=6.
- Tran 2021: "sürekli ölçümle havuzlanmış %29".
- Fischer 2017: "8 hafta" eklensin.
- İki farklı "Wang 2021" metin içinde de birbirinden ayrılsın.

**33. Kod atıfları.**
- `Yon.jsx:362` ve `Safety.jsx:7-9` güvenlik dosyasından geliyor (HEAD `c7566a1`) ve orada §15'te "doğrulanmadı" diye işaretli. `d515702`'de yeniden okunsun ya da PLAN'da da öyle işaretlensin.

**34. A.3 ve A.2 Ders 1: Nefes modülüyle çakışma.**
- Ders 1 mevcut Nefes modülüyle örtüşüyor; kartta aradaki fark bir cümleyle anlatılsın.

**35. E.2 "Paleti".**
- 10 dersin vurgu renginden yalnız 3'ü tanımlı. Hepsi tanımlansın ve iki temada kontrast denetlensin.

PubMed'den yeniden çekilen ikinci kayıt Whitfield 2021: [DOI 10.1007/s11065-021-09519-y](https://doi.org/10.1007/s11065-021-09519-y). Özetine göre randomize çalışmalar alınmış (56 çalışma, 45'i meta-analizde), yani PLAN'daki "45 RKÇ" ifadesi doğru; bu konuda değişiklik gerekmiyor.

İlgili dosyalar:
- /tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/PLAN.md
- /tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/dossier-sakin.dogrulanmis.md (satır 79 ve 288, §13)
- /tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/dossier-guvenlik.dogrulanmis.md (§0-5, §11.A–E)
- /tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/_plan/critic_pmids.txt (çıkarılan 66 PMID; tek yazdığım dosya)
- /home/user/eyes/app/src/lib/breath.js:354 (salt okundu)
