## Ders 1 ek notları

1. **Müzik (Re ailesi):** Varış `d1-varis` ve Kapanış `d1-kapanis` ElevenLabs Music; `d1-kapanis` **+1 yarım ses**
   kaydırıldı (`d1-kapanis.keyD`, uzunluk oranı 84/89; SPEC.v3 §7: ≤ 1 yarım ses, kulak kaydı gerekir). İkisinde de vokal
   denetimi boş metin verdi. Çekirdekteki bordun yerel sentez (Re2/La2/Re3/La3/Re4 kamış benzeri sesler, alışta
   parlaklaşan, nefes döngüsüne kilitli; `render/music/synth/synth_ib.py`): ElevenLabs bordun denemeleri
   (`d1-bordun-a/b/c`) kullanılmadı; ölçümde biri tritonlu, biri ≈ 15 sent akort dışı çıktı (üçüncünün ölçüm kaydı bu notta
   yok). Ders verisi bordunun sentezine izin veriyor.
2. **Nefes kilidi (sahip kararı, SAHIP_ISTEKLERI madde 15–16):** Nefona Hoca'nın sayıları ve "ver…" ipuçları kilide
   sığmıyordu (27 parça 0,02–0,33 sn fazla). Fazlalık konuşma değil, parçaların sonundaki ≈ 0,25 sn sessizlikti. Nefes
   kilitli 87 parçanın sessiz başı ve sonu atıldı (tepenin 40 dB altı; 20 ms baş payı, 40 ms kararma;
   `render/tools/kilit_kirp_ib.py`; özgünler `_kirpma_oncesi/`). Ders verisinde periyodu 1,2 sn olan 8 "ver…" klibinin
   sessizlik tabanı 0,6 → 0,5 sn. Sınıra en yakın parça `c1.s1.09` ("beş…", 0,71 sn; sınır 0,70, kilit toleransı 0,02).
   Üç noktasız yeniden seslendirme denendi (`car.say1`, noktalı ve virgüllü): sorunu çözmediği için kullanılmadı.
3. **Scribe'la tutmayan iki birim (SPEC.v3 §6.3 son adım, `kulak`):** `c3.ad`: altı çekimin (yeniden çekim dahil) hepsinde
   Scribe "Brahmari" yazıyor, metin "bramari": söyleyiş kulakla doğrulanmalı. `car.c1d`: tek heceli "Al…"; Scribe "All",
   "Av", "An" yazıyor (dil algısı İngilizce, olasılık 0,12).
4. **Yeniden çekim:** `c1.burun`'un ilk üç çekiminde virgül duraklamasında ağız tıkırtısı vardı; yeniden çekimden `t4`.
5. **15 dk yatak yükseliş sınırlayıcısı (VARSAYIM, Ders 5 ile aynı yöntem):** sentez bordun her "Al…"da parlaklaşıp
   kabarıyor (alış kilidi); C2 döngülerinde kabarma 1,18 dB/sn'ye çıkıyordu. Sınırlayıcı son yatakta 1 sn'deki artışı
   0,9 dB/sn'de tutuyor: kabarma kalıyor, en hızlı kısmı yumuşuyor (en çok 1,48 dB kısma; sonuç 0,92 dB/sn). 3 ve 5 dk'da
   devreye girmiyor (en büyük artış 0,76 ve 0,82 dB/sn).
