// B1a: app/src/lib/sources.js SOURCES nesnesine eklenecek kayıtlar (uygulama dosyasına YAZILMADI; kod oturumu taşır).
// Doğrulama: kaynak-dogrulama.md (2026-09-30; PubMed get_article_metadata + E-utilities esummary; yalnız özet).
// Biçim mevcut kayıtlarla aynı: authors (ilk 4), year (ilk yayın yılı, mevcut kural), title (PubMed), titleTr (bizim
// çevirimiz), journal, cite, doi, pmid, design, n (yalnız özette yazdığı kadar). Plan §5.5 / §A'nın isteğe bağlı kart
// alanları: finding (bilim satırı, nef-bildirim.md §10.5), duration, limit.
// Basım yılı e-yayından farklıysa kayıt üstünde yorumda yazılı; alan adı kod oturumunda kararlaştırılır.
// GİRMEYENLER (tam metin gerekli, kişi sayısı özette yok): balban2023, klimek2022, cajochen2013, casiraghi2021.

export const SOURCES_EK = {
  // Bildirim · bilim kartı (B1a; docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/PLAN.v1.md §A kanıt kapısı)
  // basım 2021 Haz, e-yayın 2020-05-12
  kim2020: {
    authors: ['Kim AD', 'Muntz A', 'Lee J', 'Wang MTM'], year: 2020,
    title: 'Therapeutic benefits of blinking exercises in dry eye disease.',
    titleTr: 'Kuru göz hastalığında kırpma egzersizlerinin tedavi edici yararları.',
    journal: 'Cont Lens Anterior Eye', cite: '44(3):101329', doi: '10.1016/j.clae.2020.04.014', pmid: '32409236',
    design: 'prepost', n: '54 kişi başladı, 41 kişi bitirdi (kuru göz belirtili)',
    finding: "41 kişilik kontrolsüz bir çalışmada eksik kırpma oranı 4 haftada %54'ten %34'e indi.",
    duration: '4 hafta',
    limit: 'Kontrol grubu yok; katılımcılar kuru göz belirtili kişiler.',
  },
  // basım 2025 Eki, e-yayın 2025-06-03
  wolffsohn2025: {
    authors: ['Wolffsohn JS', 'Travé-Huarte S', 'Bahra I', 'Finch C'], year: 2025,
    title: 'Optimisation of blinking exercises for dry eye disease.',
    titleTr: 'Kuru göz hastalığında kırpma egzersizlerinin en uygun hâle getirilmesi.',
    journal: 'Cont Lens Anterior Eye', cite: '48(5):102453', doi: '10.1016/j.clae.2025.102453', pmid: '40467388',
    design: 'rct', n: '98 kişi (optimizasyon) + 28 kişi (etkinlik çalışması), kuru göz',
    finding: '98 kişilik bir denemede en uygun düzen günde 3 kez 15 tekrar çıktı.',
    duration: '2 hafta egzersiz + bıraktıktan 2 hafta sonra ölçüm',
    limit: 'Egzersiz bırakılınca ölçümler 2 haftada çoğunlukla başa döndü; kırpma hızı ve gözyaşı ölçümlerinin bir kısmı değişmedi.',
  },
  fincham2023: {
    authors: ['Fincham GW', 'Strauss C', 'Montero-Marin J', 'Cavanagh K'], year: 2023,
    title: 'Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials.',
    titleTr: 'Nefes çalışmasının stres ve ruh sağlığı üzerindeki etkisi: randomize kontrollü çalışmaların meta-analizi.',
    journal: 'Sci Rep', cite: '13(1):432', doi: '10.1038/s41598-022-27247-y', pmid: '36624160',
    design: 'meta', n: '12 randomize çalışma, 785 yetişkin',
    finding: '12 denemede (785 kişi) nefes çalışması, algılanan streste küçük–orta azalmayla ilişkiliydi.',
    limit: 'Çalışmaların çoğunda yanlılık riski orta; kapsam genel nefes çalışması, yalnız yavaş nefes değil.',
  },
  // basım 2022 Tem, e-yayın 2022-05-24. Kişi sayısı özette yok; plan gereği kartta çalışma sayısı yazar.
  laborde2022: {
    authors: ['Laborde S', 'Allen MS', 'Borges U', 'Dosseville F'], year: 2022,
    title: 'Effects of voluntary slow breathing on heart rate and heart rate variability: A systematic review and a meta-analysis.',
    titleTr: 'İstemli yavaş nefesin kalp hızı ve kalp atışı değişkenliği üzerindeki etkileri: sistematik derleme ve meta-analiz.',
    journal: 'Neurosci Biobehav Rev', cite: '138:104711', doi: '10.1016/j.neubiorev.2022.104711', pmid: '35623448',
    design: 'meta', n: '223 çalışma (kişi sayısı özette yazmıyor)',
    finding: '223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı.',
    limit: 'Etki büyüklüğü ve toplam kişi sayısı özette yok.',
  },
  // basım 2007 Ara, e-yayın 2007-10-24
  tucker2007: {
    authors: ['Tucker P', 'Gilliland J'], year: 2007,
    title: 'The effect of season and weather on physical activity: a systematic review.',
    titleTr: 'Mevsimin ve havanın fiziksel etkinlik üzerindeki etkisi: sistematik derleme.',
    journal: 'Public Health', cite: '121(12):909-22', doi: '10.1016/j.puhe.2007.04.009', pmid: '17920646',
    design: 'review', n: '37 çalışma, 291 883 katılımcı',
    finding: '37 çalışmalık bir derlemede kötü ya da aşırı hava, hareketin önünde bir engel olarak görüldü.',
    limit: 'Nicel birleştirme (meta-analiz) yapılmamış.',
  },
  denissen2008: {
    authors: ['Denissen JJ', 'Butalid L', 'Penke L', 'van Aken MA'], year: 2008,
    title: 'The effects of weather on daily mood: a multilevel approach.',
    titleTr: 'Havanın günlük ruh hâli üzerindeki etkileri: çok düzeyli bir yaklaşım.',
    journal: 'Emotion', cite: '8(5):662-7', doi: '10.1037/a0013497', pmid: '18837616',
    design: 'observational', n: '1233 kişi (çevrim içi günlük)',
    finding: '1233 kişilik günlük çalışmasında havanın ruh hâline ortalama etkisi küçüktü; kişiden kişiye değişti.',
    limit: 'Gözlemsel çalışma; kişiler arasındaki farkı kişilik, cinsiyet ve yaş açıklamadı.',
  },
  // basım 2022 Tem, e-yayın 2022-03-10
  stout2022: {
    authors: ['Stout TE', 'Lingeman JE', 'Krambeck AE', 'Humphreys MR'], year: 2022,
    title: 'A Randomized Trial Evaluating the Use of a Smart Water Bottle to Increase Fluid Intake in Stone Formers.',
    titleTr: 'Böbrek taşı olan kişilerde sıvı alımını artırmak için akıllı su şişesi kullanımını değerlendiren randomize deneme.',
    journal: 'J Ren Nutr', cite: '32(4):389-395', doi: '10.1053/j.jrn.2021.07.007', pmid: '35283036',
    design: 'rct', n: '85 kişi (44 + 41); izlemde 51 kişi',
    finding: '85 kişilik bir denemede az su içmenin başlıca nedeni unutmaktı (%60).',
    duration: '6 ve 12 hafta',
    limit: 'Katılımcılar böbrek taşı hastaları; ölçüt içilen su değil 24 saatlik idrar hacmi; izlemde kayıp yüksek.',
  },
  // Düzeltme (erratum): Lancet 2026 Aug 22;408(10556):698, PMID 42624152 — yayından önce açılmalı.
  desai2026: {
    authors: ['Desai AC', 'Maalouf NM', 'Harper JD', 'Sivalingam S'], year: 2026,
    title: 'Prevention of urinary stones with hydration: a randomised clinical trial of an adherence intervention.',
    titleTr: 'Sıvı alımıyla idrar yolu taşlarının önlenmesi: bir uyum programının randomize klinik denemesi.',
    journal: 'Lancet', cite: '407(10534):1171-1181', doi: '10.1016/S0140-6736(25)02637-6', pmid: '41864748',
    design: 'rct', n: '1658 kişi (826 + 832)',
    finding: '1658 kişilik bir denemede su programındakiler 6. ve 12. ayda gece daha sık tuvalete kalktı.',
    duration: 'Ortanca 738 gün izlem',
    limit: 'Katılımcılar taş hastaları; program çok bileşenli (yalnız hatırlatma değil); fark yalnız 6. ve 12. ayda.',
  },
  moszeik2025: {
    authors: ['Moszeik EN', 'Rohleder N', 'Renner KH'], year: 2025,
    title: 'The Effects of an Online Yoga Nidra Meditation on Subjective Well-Being and Diurnal Salivary Cortisol: A Randomised Controlled Trial.',
    titleTr: 'Çevrim içi yoga nidra meditasyonunun öznel iyi oluş ve gün içi tükürük kortizolü üzerindeki etkileri: randomize kontrollü çalışma.',
    journal: 'Stress Health', cite: '41(3):e70049', doi: '10.1002/smi.70049', pmid: '40373021',
    design: 'rct', n: '362 kişi, 4 kol (101 + 80 + 74 + 107)',
    finding: '362 kişilik 2 aylık bir denemede 11 dakikalık yoga nidranın bekleme grubuna göre etkisi küçüktü.',
    duration: '2 ay, ideal olarak her gün',
    limit: 'Etkiler küçük (d = 0,08–0,16).',
  },

  // KOŞULLU: yalnız meditasyon içeriğinde; yoga bildiriminde kullanılmaz.
  radin2025: {
    authors: ['Radin RM', 'Vacarro J', 'Fromer E', 'Ahmadi SE'], year: 2025,
    title: 'Digital Meditation to Target Employee Stress: A Randomized Clinical Trial.',
    titleTr: 'Çalışan stresine yönelik dijital meditasyon: randomize klinik deneme.',
    journal: 'JAMA Netw Open', cite: '8(1):e2454435', doi: '10.1001/jamanetworkopen.2024.54435', pmid: '39808431',
    design: 'rct', n: '1458 çalışan (728 + 730)',
    finding: '1458 çalışanla bir denemede günde 5–10 dk meditasyon yapanlarda stres, 5 dk altından çok düştü.',
    duration: '8 hafta, günde 10 dk; 4. ayda izlem',
    limit: 'Kullanım süresine göre karşılaştırma randomize değil; kontrol bekleme listesi.',
  },

  // KOŞULLU: ay kaynakları yalnız hava sayfasında "ay evresi" satırı kullanılırsa (dolunayın bilim satırı laborde2022).
  // Ortak satır: "Ayın uykuya etkisi tartışmalı: 5812 çocukta ~5 dk fark bulundu, 2125 yetişkinde bulunmadı."
  // basım 2015 Kas, e-yayın 2015-08-18
  habarubio2015: {
    authors: ['Haba-Rubio J', 'Marques-Vidal P', 'Tobback N', 'Andries D'], year: 2015,
    title: "Bad sleep? Don't blame the moon! A population-based study.",
    titleTr: 'Kötü uyku mu? Suçu aya atma! Toplum tabanlı bir çalışma.',
    journal: 'Sleep Med', cite: '16(11):1321-1326', doi: '10.1016/j.sleep.2015.08.002', pmid: '26498230',
    design: 'observational', n: '2125 kişi',
    limit: 'Uyku bozukluğu olmayan alt grupta dolunayda daha kısa uyku eğilimi var (anlamlı değil).',
  },
  chaput2016: {
    authors: ['Chaput JP', 'Weippert M', 'LeBlanc AG', 'Hjorth MF'], year: 2016,
    title: 'Are Children Like Werewolves? Full Moon and Its Association with Sleep and Activity Behaviors in an International Sample of Children.',
    titleTr: 'Çocuklar kurt adam gibi mi? Uluslararası bir çocuk örnekleminde dolunay ile uyku ve hareket davranışları arasındaki ilişki.',
    journal: 'Front Pediatr', cite: '4:24', doi: '10.3389/fped.2016.00024', pmid: '27047907',
    design: 'observational', n: '5812 çocuk (9–11 yaş), 12 ülke',
    duration: '7 gün ivmeölçer',
    limit: 'Yazarlar farkın klinik anlamını sorgulanabilir buluyor.',
  },
  // basım 2017 Haz, e-yayın 2016-12-08 (anahtar plandaki adla)
  smith2017: {
    authors: ['Smith MP', 'Standl M', 'Schulz H', 'Heinrich J'], year: 2016,
    title: 'Physical activity, subjective sleep quality and time in bed do not vary by moon phase in German adolescents.',
    titleTr: 'Almanyalı ergenlerde fiziksel etkinlik, öznel uyku kalitesi ve yatakta geçen süre ay evresine göre değişmiyor.',
    journal: 'J Sleep Res', cite: '26(3):371-376', doi: '10.1111/jsr.12472', pmid: '27928860',
    design: 'observational', n: '1411 genç (14–17 yaş)',
    limit: 'Uyku günlükle (öznel) ölçüldü.',
  },
}
