import io,sys
p='dossier-benlik.dogrulanmis.md'
s=open(p,encoding='utf-8').read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        sys.exit(f'MATCH {n}!={count}: {old[:80]}')
    s=s.replace(old,new)

# header
rep("# Nefona Yoga — Kanıt dosyası: BENLİK / GELİŞİM / ZİHİN kümesi\n",
"""# Nefona Yoga — Kanıt dosyası: BENLİK / GELİŞİM / ZİHİN kümesi (DOĞRULANMIŞ KOPYA)

> **Doğrulama notu (2026-09-28, çekişmeli denetim):** Aşağıdaki 50 iddia (C01–C50) PubMed'den `get_article_metadata` ile tek tek yeniden getirildi; PMID, DOI, başlık, tasarım, n ve sayılar özetle karşılaştırıldı. Kirschner 2019 (PMC7324152) ve Radin 2025 (PMC11733700) tam metinleri ayrıca okundu. Sonuç: 50 iddianın 50'sinde PMID ve DOI eşleşiyor. 43'ü olduğu gibi doğrulandı; 7'si düzeltildi (C01, C05, C09, C13, C23, C37, C38). Hiçbir iddia tamamen çıkarılmadı; ancak bazı **alt-iddialar** çıkarıldı ya da daraltıldı (bkz. §19 "Doğrulanamadı / çıkarıldı"). Düzeltilen yerler metinde **[DÜZELTİLDİ]** ile işaretli.
> **Bu turda denetlenmeyenler:** C01–C50 listesinde olmayan kaynaklar (ör. Mrazek 2013, Torous 2019, Gu 2022, Lv 2020, Luberto 2018, Wang 2023, Toole 2016, Liu 2023, Kahraman 2026, Dawson 2019, Gerdes 2022, Abdolalipour 2023, Heinen 2024, Bruhns 2021, Pehlivan 2024, Emirza 2024, Mukherjee 2026, Levallius 2026, Ranehill 2015, Moser 2017, Epton 2014, Sweeney 2014, Escobar-Soler 2023, Schubert 2019, Hoult 2025, Renner 2013, Bartha 2025, Diniz 2023, Kyeong 2017, Thompson 2020, Han & Kim 2022, Macri 2024, Loucks, Sharp 2024, Estey 2022, Zuo 2023, Racy 2024, Pascoe 2017, Colzato 2012, Fox 2016, Baten 2026, Killingsworth 2010, Chu 2023, Lieberman 2007, Gothe 2012, Matko 2022, Peña 2026, Staiano 2025, Sasaki 2026, Strohmaier & Goldberg 2024) bu denetimde yeniden getirilmedi: **bu turda doğrulanmadı**. Yalnız ilk yazarın beyanına dayanıyorlar.
""")

# C01 Kirschner
rep("- **Kirschner ve ark. 2019** (Clin Psychol Sci; RCT, n=135, 5 ses koşulu). İki öz-şefkat kaydında (sevgi-şefkat \"kendine\" ve şefkatli beden taraması) kalp atışı ve deri iletkenliği düştü, kalp atış değişkenliği yükseldi. Bu fizyolojik örüntü yalnız öz-şefkat koşullarında görüldü. Öz-bildirimdeki artış ise \"olumlu heyecan\" kontrolünde de vardı.",
"- **Kirschner ve ark. 2019** (Clin Psychol Sci; RCT, n=135 sağlıklı İngiliz üniversite öğrencisi, koşul başına 27, 5 ses koşulu). **[DÜZELTİLDİ]** Özete göre düşük uyarılma (kalp atışı ve deri iletkenliği düşük) ve KAD artışı örüntüsü yalnız öz-şefkat koşullarına özgüydü. Tam metindeki büyüme modellerinde ise ayrıntı farklı: KAD iki öz-şefkat koşulunda da 11 dakika boyunca nötr koşuldan yüksekti. Deri iletkenliğinde ise anlamlı etki **yalnız sevgi-şefkat \"kendine\" (LKM-S)** koşulunda görüldü (1–7. dakikada daha dik düşüş; 2–5. dakikalarda anlamlı). Şefkatli beden taraması için deri iletkenliği etkisi modelde anlamlı değildi. Öz-bildirim: öncesi-sonrası artış \"olumlu heyecan\" kontrolünde de vardı (özet). Ancak başlangıç puanı kontrol edilince (ANCOVA) nötr koşuldan daha yüksek öz-şefkati yalnız iki öz-şefkat koşulu bildirdi (tam metin).")

# C05 Norris
rep("Etki nevrotizme göre değişti: nevrotizmi düşük olanlarda görüldü, yüksek olanlarda görülmedi. — PMID 30127731",
"Her iki davranışsal etki de nevrotizme göre değişti. **[DÜZELTİLDİ]** \"Nevrotizmi düşük olanlarda görüldü, yüksek olanlarda görülmedi\" ayrımı özette açıkça yalnız ERP (N2) bulgusu için yazıyor. Davranışsal etkilerin nevrotizme göre yönü özette yok: doğrulanmadı. Yazarlar sonucu \"bazı acemilerde\" diye sınırlıyor. — PMID 30127731")

# C09 Radin
rep("- **Radin ve ark. 2025** (JAMA Netw Open; RCT, n=1458 çalışan). Günde 10 dakika istenen dijital meditasyon, bekleme listesine göre algılanan streste 8. haftada d=0,85, 4. ayda d=0,71 fark gösterdi. **Günde 5–9,9 dakika kullananlar, 5 dakikanın altında kalanlardan daha fazla stres azalması** bildirdi. — PMID 39808431",
"- **Radin ve ark. 2025** (JAMA Netw Open; RCT, n=1458 çalışan, %80,8 kadın; uygulama tam metinde **Headspace**). Günde 10 dakika istenen dijital meditasyon, bekleme listesine göre algılanan streste (PSS) 8. haftada d=0,85, 4. ayda d=0,71 fark gösterdi. **[DÜZELTİLDİ]** Keşif amaçlı, randomize olmayan kullanım analizinde günde 5–9,9 dakika kullananların PSS düşüşü ortalama −6,58 puandı; 5 dakikanın altında kalanlarınki −5,42 puandı (≥10 dk/gün: −7,80). Yani −6,58 iki grup arasındaki fark **değil**, orta grubun kendi değişimidir; özetteki ifade yanıltıcı. Orta ve yüksek grup birbirinden farklı değildi; bu kullanım farkları 4. ayda anlamlı değildi. Gerçek kullanım düşüktü: uygulamada ortalama 5,20 dk/gün, meditasyona özgü 3,36 dk/gün; kullanıcıların %69,7'si günde 5 dakikanın altında kaldı, yalnız %4,26'sı 10 dk/gün talimatına tam uydu (tam metin, PMC11733700). — PMID 39808431")

# C13 Stecher
rep("Pratiği sabit bir günlük alışkanlığa bağlayanlarda (\"çapa\") süreklilik daha iyiydi. En sadık çapalayıcıların neredeyse hepsi **sabah** çapası kullanıyordu. — PMID 34941558",
"Sabit çapa grubunda günlük meditasyon olasılığı daha yüksekti (OR 1,14) ve izlem döneminde düşüş daha yavaştı. **[DÜZELTİLDİ]** Sabah bulgusu gözlemseldir: çapaya en sık uyanların (sabit ya da kişisel çapa grubundan) süreklilği en iyiydi ve bu kişilerin neredeyse hepsi sabah çapası kullanıyordu. Sabah çapası randomize edilmedi. Özetteki n'ler kendi içinde tutarsız (toplam 101, alt gruplar 56+49+62): doğrulanmadı. — PMID 34941558")

# C37 Bornemann (two places)
rep("- Beden farkındalığında pratik süresi değişimi zayıf yordadı. **Pratiği sevmek ve günlük hayata katmak** güçlü yordadı. — Bornemann 2015",
"- Beden farkındalığında pratik süresi değişimi yalnız zayıf yordadı. **Pratiği sevmek ve günlük hayata katmak** ise ölçeklerin çoğunda değişimi yordadı **[DÜZELTİLDİ: özette \"güçlü\" yok]**. — Bornemann 2015")
rep("**Pratik süresi değişimi zayıf yordadı; pratiği sevmek ve günlük hayata katmak güçlü yordadı.**",
"**Pratik süresi değişimi yalnız zayıf yordadı; pratiği sevmek ve günlük hayata katmak ölçeklerin çoğunda değişimi yordadı.** [DÜZELTİLDİ: özette \"güçlü\" kelimesi yok]")

# C38 Taylor
rep("- Uygulama üzerinden farkındalık programında **\"beden ve duygularından habersiz\"** kümesindeki kişiler kontrole göre yanıt vermedi; diğer iki küme verdi. — Taylor 2023",
"- Kaygı için tedavi arayan kişilerde (n=63, 2 aylık uygulama üzerinden farkındalık programı ya da olağan bakım; sonuç ölçüsü kaygı) **\"beden ve duygularından habersiz\"** kümesindeki kişiler kontrole göre yanıt vermedi; diğer iki küme verdi. Kümeler ayrıca toplum örnekleminde (n=14.010) de bulundu. **[DÜZELTİLDİ: nüfus ve sonuç ölçüsü eklendi]** — Taylor 2023")

# C23 bounded absence
rep("**Durum: ZAYIF / YOK.** \"Özgüven\" (self-confidence) sonucunu doğrudan ölçen bir meditasyon ya da farkındalık meta-analizini PubMed'de **bulamadım**.",
"**Durum: ZAYIF / YOK.** \"Özgüven\" (self-confidence) sonucunu doğrudan ölçen bir meditasyon ya da farkındalık meta-analizini aşağıdaki sorguda **bulamadım**. **[DÜZELTİLDİ: \"PubMed'de yok\" yerine \"bu sorgularda bulunamadı\"]** Denetimde sorgu yeniden çalıştırıldı, yine yalnız aynı iki sonuç çıktı. İkinci bir başlık sorgusu (`(mindfulness[ti] OR meditation[ti] OR compassion[ti]) AND (\"self-esteem\"[ti] OR \"self-confidence\"[ti]) AND meta-analysis`) yalnız Thomason 2020 ile korelasyonel bir meta-analizi getirdi (Muris & Otgaar 2023, PMID 37554304 · DOI 10.2147/PRBM.S402455; öz-saygı ile öz-şefkat r=0,65, müdahale çalışması değil). Daha geniş aramalar yapılmadı; \"hiç yok\" demek için yetmez.")

# design item with 5–9,9
rep("5–9,9 dk/gün, 5 dakikanın altından daha iyiydi (Radin 2025).",
"Radin 2025'te 5–9,9 dk/gün kullananların stres düşüşü, 5 dakikanın altındakilerden büyüktü (keşif amaçlı, randomize değil, 4. ayda kayboldu); aynı çalışmada kullanıcıların çoğu gerçekte günde 5 dakikanın altında kaldı. Bu, 5 dakikalık sürümün \"tam ders\" olarak tasarlanması gerektiğini destekler.")

# Laird add duration
rep("  - Laird 2022 (orta yaş, n=83). Calm,",
"  - Laird 2022 (orta yaş, n=83, 4 hafta; Calm kullanıcıları haftada ortalama 103 dk, uyum %71). Calm,")

# measurement caveat line 370
rep("Kirschner 2019'da öz-şefkat öz-bildirimi \"olumlu heyecan\" kontrol kaydından sonra da arttı;",
"Kirschner 2019'da öz-şefkat öz-bildirimi \"olumlu heyecan\" kontrol kaydından sonra da öncesine göre arttı (başlangıç puanı kontrol edilince nötre göre fark yalnız öz-şefkat koşullarında kaldı);")

open(p,'w',encoding='utf-8').write(s)
print('ok')
