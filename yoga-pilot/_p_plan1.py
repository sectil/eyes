import pathlib
p = pathlib.Path('PLAN.v2.md')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:100])
    t = t.replace(old, new)
# Ders 2 kartı
rep('- **Söz:** "Uyanıkken derin bir dinlenme."',
    '- **Söz:** "Uyanıkken derin bir dinlenmeye davet." (pilot 4. tur, EV3-12: sonuç sözü değil davet; Türkçe editör onayı)')
rep('**sahne seçici** (Kıyı / Orman / Ders içinde seçerim; pilot 3. tur, H6, L2-04)',
    '**sahne seçici** (Kıyı / Orman / Ders içinde seçerim; ilk oturumda varsayılan Orman; pilot 3. tur H6, L2-04; 4. tur L3-05)')
rep('tanıklıkta yalnız alçak, uzun', 'sessiz dinlenmede yalnız alçak, uzun')
rep('yaylılar (pilot 3. tur, L2-13). Doğa katmanı', 'yaylılar (pilot 3. tur L2-13; 4. tur MT3-01: C5 "sessiz dinlenme"). Doğa katmanı')
rep('beden dolaşımında "Seni rahatsız eden bir yer olursa onu atla." (güvenlik §11.B-9); nefeste aynı klipte',
    'beden dolaşımında "Rahatsız eden bir bölge olursa atla." ve göğüs ile karından önce ikinci kapı "İstemediğin yeri '
    'yine atla." (güvenlik §11.B-9; pilot 4. tur TR3-13, S3-04); nefeste aynı klipte')
rep('kapanışta "yana dön, otur, bekle, kalk" ve kalkışta "başın dönerse yeniden\n  otur" (pilot 3. tur, G2-04)',
    'kapanışta "yana dön, otur, bekle, kalk" ve kalkışta "başın dönerse yeniden\n  otur ve bekle" (pilot 3. tur G2-04; '
    '4. tur MT3-04: son cümle "Buradasın ve uyanıksın." ayrı klipte ve tek başına; "Kapanışa geç" imge ya da zıtlık '
    'açıkken önce bırakma ön klibi çalar, S3-01)')
# A.2.1 satır 2 alıntıları
rep('"Hoş geldin; bu dakikalar senin." ardından "Yapman gereken hiçbir şey yok; yalnızca dinlenmek var." (iki dönüşümlü seçenekle; pilot 2. tur)',
    '"Hoş geldin. Bu dakikalar senin." ardından "Bir şey başarman gerekmiyor; yalnızca dinlenmek var." (iki dönüşümlü seçenekle; pilot 4. tur TR3-23, L3-12)')
rep('"Beden dinlenebilir; sen uyanıksın." (yalnız zıtlık ya da imgeleme varken)',
    '"Bedenin dinlenebilir; sen uyanıksın." (yalnız zıtlık ya da imgeleme varken; pilot 4. tur L3-14)')
# Benzersizlik + MT3-15
rep("doğa imzası iki kez geçmiyor.", "doğa imzası iki kez geçmiyor; doğa dokusunda ise iki yakınlık kayda alındı (aşağıda, MT3-15).")
rep("(C.1'deki genel örnekten\nçıkarıldı).",
    "(C.1'deki genel örnekten\nçıkarıldı).\n\n**Doğa imzası çakışması (pilot 4. tur, MT3-15):** Ders 2'nin Kıyı katmanı (\"uzak, yumuşak dalga\") ile Ders 9'un "
    "\"uzak okyanus dalgası\" ve Ders 2'nin varsayılanı \"uzak rüzgâr ve yaprak\" ile Ders 6'nın \"uzak orman ve yaprak sesi\" zemini "
    "aynı dokuya yakındır. Karar üretimden önce: Ders 2 kıyı katmanı ayrışık tanımlanır (çok uzak, alçak geçiren filtreli kıyı "
    "yıkanması; köpük ve dalga kırılması geçişi yok; kabarma periyodu 6–8 sn, ölçülüp Ders 9'unkiyle (istemde ≈ 10 sn) "
    "karşılaştırılarak belgelenir) ve kör dinlemede yan yana ayırt edilemezse üretilmez; Ders 6 zemini yapraksız (yalnız seyrek "
    "kuş çağrıları ve uzak sabah havası) önerilir, çünkü Ders 2'nin orman sahnesi metni yapraklara dayanır ve ilk oturumda "
    "varsayılandır (L3-05). İki çift de kör dinleme protokolündedir (`pilot/ders2.lesson.json` `panelChecks`, `music.nature.uniquenessConflicts`).")
# Ders 2, 5, 9 sınırı
rep('Ders 2\'nin tanıklığı bedene, zemine ve dinlenmeye bağlıdır ("Kendini baştan ayağa tek bir bütün olarak hissedebilirsin.", "Bedeninin ağırlığı ve onu taşıyan zemin: İkisi de burada."; pilot 3. tur, TR2-02, TR2-18)',
    'Ders 2\'nin C5 bloğu pilot 4. turda "sessiz dinlenme" oldu (MT3-01): tanık göstergesi ("Bütün bunları fark eden sensin."), '
    'açık izleme ("Dikkatin tek bir yere odaklanmak zorunda değil. Geniş ve açık kalabilir.") ve "sesler" çıkarıldı; blok dersin '
    'kendi motiflerine bağlıdır ("Yapacak bir şey yok; uzanmak yeter.", "Kendini baştan ayağa tek bir bütün olarak '
    'hissedebilirsin.", "Bedenin zeminde, sen buradasın."; pilot 3. tur TR2-18, 4. tur MT3-01)')
# B.4.1 Ders 2 notu
i0 = t.index('**Ders 2 notu (pilot 2. ve 3. tur, S12-hoca, T2):**')
end = 'klip süreleri ölçüldükten sonra düzeltilir.'
i1 = t.index(end, i0) + len(end)
note = ("**Ders 2 notu (pilot 2.–4. tur, S12-hoca, T2, Z3-01; sahibe görünür istisna):** Ders 2'nin tam metni pilot 4. turda 2.270\n"
        "hecedir (3. tur 2.371, 2. tur 2.388, ilk tur 2.194). 30 dakikadaki konuşma payı %22,5–%27,4'tür (konuşulan parçalara\n"
        "göre; cümle arası sessizlikler sessizliktir); yani yukarıdaki tablonun orta payına (≈ 650 sn, ≈ %36) bilinçli olarak\n"
        "ulaşmaz. Neden: yoga nidranın derin evresi sessizlikle çalışır (bu bölümün \"derin blok\" bandı %8–20) ve derste üç\n"
        "duyurulmuş pencere vardır; derin evredeki 60 sn'lik yoğunluk tavanı (<= 110 hece, VARSAYIM) ise bağlayıcı değildir:\n"
        "30 dk 6,6 düşükte yalnız Derin evredeki 60 sn pencerelerinin medyanı 64, %90'lık dilimi 80 hecedir; 107'ye yalnız C2\n"
        "başında çıkar. Seyreklik bir tasarım seçimidir: C2, C3 ve C4'ün blok konuşma payı (20 dk ve üstü: C2 %19–24, C3\n"
        "%20–25, C4 %17–24) bu bölümün rehberli çekirdek alt sınırının (%26–30) altındadır ve sahip onayı ister; payı sınıra\n"
        "çıkarmak 30 dakikada ≈ 120 sn (≈ 800 hece) ek Derin evre metni demektir (`pilot/timing.py` Z3-01 satırı,\n"
        "`pilot/ders2.script.md` §2.5 ve §7). Sessizlik doldurulmaz: içerik büyür (14–16. dakika çevresinde yapısal bir\n"
        "düzlük, 20. dakikadan sonra en çok bir ardışık düzlük; Z3-09) ve 30:00'da sessizlikler pref'ten max'a doğru en çok\n"
        "%1 esner. Öteki derslerin bütçesi bu tabloyla kalır; Ders 2'nin satırı gerçek klip süreleri ölçüldükten sonra\n"
        "düzeltilir.")
t = t[:i0] + note + t[i1:]
# B.5 Kapanışa geç satırı
lines = t.split('\n')
idx = [i for i, ln in enumerate(lines) if ln.startswith('| **Kapanışa geç** |')]
assert len(idx) == 1, idx
lines[idx[0]] = ('| **Kapanışa geç** | O anki **cümle** biter (birimler cümle sonlarından kesildiği için; pilot 4. tur MT3-02); motor '
    '4 sn\'lik bir ön sessizlik açar (dönüş tınısı ilk sözden 2 sn önce; ses kazancı o anki evre düzeyinden 0 dB\'e bu sessizlik '
    'boyunca rampayla, basamak yok; pilot 4. tur S3-02), müzik kapanış evresine geçer ve kısa kapanış çalar (gündüz 60–110 sn: '
    'nefes, parmaklar ve gerinme, gözler ve çevre, yana dön, otur, birkaç nefes bekle, kalk, son cümle; pilot 2. tur S10, B2, T1, '
    'E7: bekleme ve kalkış hızlı kapanışta da kısaltılmaz; pilot 3. tur G2-04, G2-07, Z2-05). **Düğmeye bir imgenin ya da zor '
    'bloğun içinde basılmışsa önce o bloğun bırakma ön klibi çalar** (Ders 2: imge açıkken "Görüntü usulca siliniyor. Zemin seni '
    'taşıyor.", zıtlıklar açıkken "Bu hisleri bırakmak yeterli. Beden kendi hâlinde."); duyurulmuş bir pencerenin sessizliğinde '
    'basılmışsa önce dönüş tınısı ve o pencerenin karşılama klibi çalar (üst uç 120 sn; pilot 4. tur S3-01, MT3-07; güvenlik '
    '§11.D-2, §11.B-14). Uyku dersinde bu düğmenin adı **"Uykuya geç"** olur ve uyku iznine geçer |')
t = '\n'.join(lines)
rep('Kapanışın içine sarılırsa kapanışın başından çalar.',
    'Kapanışın içine sarılırsa kapanışın başından çalar; bir imgenin ya da zor bloğun içinden, bırakma klibi çalmadan çıkan her '
    'sarmada (kapanışa ya da başka bir bloğa) önce o bloğun bırakma ön klibi çalar (pilot 4. tur S3-01).')
rep('"Birkaç nefes otur; başın dönerse biraz daha bekle."', '"Birkaç nefes böyle kal; başın dönerse biraz daha bekle."')
p.write_text(t, encoding='utf-8')
print('plan ok', len(t))
