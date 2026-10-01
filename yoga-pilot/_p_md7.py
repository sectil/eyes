import pathlib
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
reps = [
(r"""    a('Okuma: ölçülen sayılar "#" ile gösterildi; parantez içinde düşen vaka sayısı ve ilk üç vaka. En hassas yerler: '
      '6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik yoğunluk sınırı (süreler %5–10 kısa çıkarsa), 5 dakikanın boş payı '
      've 15. dakika çevresindeki C4 girişi (süreler %5–10 uzun çıkarsa). Tasarlanacak hoca sesi Neslihan v2\'den ≈ %10 '
      'hızlıysa 5 ve 14. dakikanın yoğunluk sınırı aşılır; bu yüzden aday ses ölçülmeden kör panele girmez (Z3-04, §6). '
      'Gerçek `voice.sec` değerleri gelince `timing.py` aynı denetimlerle yeniden koşar; düşen vaka olursa önce '
      'sessizlik sınırları ve sıralar ayarlanır (§7).')""",
 r"""    a('Okuma: ölçülen sayılar "#" ile gösterildi; parantez içinde düşen vaka sayısı ve ilk üç vaka. Süreler %5–10 kısa '
      'çıkarsa (daha hızlı bir ses) 78 vaka geçmeyi sürdürür: 4. turda kısalan metin ve cümle arası boşluklar yoğunluk '
      'sınırlarına pay bıraktı. Hassas yön uzamadır: süreler %5–10 uzun çıkarsa (daha yavaş ya da daha uzun duraklayan '
      'bir ses) 5 dakikanın zarf köşesi (5,2 hi: 60 sn\'lik konuşma payı penceresi, H3 anahtar cümle aralığı, C2 '
      'bloğunun sığmaması), üretim köşesinde T6 boş payı (5,6 hi) ve 15–16. dakikada T5 esneme sınırı düşer. Bu yüzden '
      'eklemleme hızı 5,2 hece/sn\'nin altında kalan ya da Neslihan\'dan uzun duraklayan bir aday ses zarfın dışındadır '
      've ölçülmeden kör panele girmez (Z3-04, §6). Gerçek `voice.sec` değerleri gelince `timing.py` aynı denetimlerle '
      'yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar ayarlanır (§7).')"""),
(r"""      'geçmeyen aday elenir ya da metin ayarlanır. Neslihan v2\'den ≈ %10 hızlı bir ses 5 ve 14. dakikanın yoğunluk '
      'sınırını aşar (§2.5). Aday ses ölçülmeden hiçbir klip onunla üretilmez.')""",
 r"""      'geçmeyen aday elenir ya da metin ayarlanır. Sarsıntı taraması (§2.5) süreler %5–10 uzun çıkınca üç vakayı '
      'düşürür (5 dakikanın zarf köşesi, üretim köşesinde T6, 15–16. dakikada T5); eklemleme hızı 5,2 hece/sn\'nin '
      'altında ya da duraklamaları Neslihan\'dan uzun bir aday bu yüzden zarfın dışındadır. Aday ses ölçülmeden hiçbir '
      'klip onunla üretilmez.')"""),
(r"""    a('- **Sarsıntı payı (Z2-04):** bütün klip süreleri %10 kısa çıkarsa 6,6 hece/sn\'de 5 ve 14. dakikanın 60 sn\'lik '
      'yoğunluk sınırı aşılır; %5–10 uzun çıkarsa 5 dakikanın boş payı 15 sn\'nin altına iner. Gerçek süreler gelince '
      '`timing.py` yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar ayarlanır.')""",
 r"""    a('- **Sarsıntı payı (Z2-04):** bütün klip süreleri %5–10 kısa çıkarsa 78 vaka geçer; %5–10 uzun çıkarsa 75/78: '
      '5 dakikanın zarf köşesi (5,2 hi: konuşma payı penceresi, H3, C2 bloğu), üretim köşesinde T6 (5,6 hi; §2.5 '
      'tablosundaki boş pay %5 uzamada 15 sn tabanının altına iner) ve 15–16. dakikada T5. Gerçek süreler gelince '
      '`timing.py` yeniden koşar; düşen vaka olursa önce sessizlik sınırları ve sıralar ayarlanır.')"""),
(r"""'(VARSAYIM); bütün süreler %%5–10 saparsa birkaç vaka düşer (sarsıntı taraması, §2.5). Henüz hiçbir cümle '""",
 r"""'(VARSAYIM); bütün süreler %%5–10 uzun çıkarsa üç vaka düşer, kısa çıkarsa hiçbiri (sarsıntı taraması, §2.5). Henüz '
      'hiçbir cümle '"""),
]
for old, new in reps:
    assert t.count(old) == 1, old[:60]
    t = t.replace(old, new, 1)
p.write_text(t, encoding='utf-8')
print('patched', len(reps))
