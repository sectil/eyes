# Sabah havası: önerilen cümleler (onayına)

Her hücreye tek cümle; hepsi yürüyüş önerisi taşımıyor, o yüzden deneyde yürüyüşün sessiz gününde de aynı cümle gider. Başlık hepsinde aynı: "Gaziemir 17° · en çok 26°". Gövdenin son satırı "Kaynak: Apple Weather". Uzunluk bu satır dâhil, 110 sınırı; en kötü değerlerle (eksi 12°, 45°) ölçüldü. İki incelemenin düzelttiği her şey işlendi; reddedilen aday yok.

| Hücre | Önerilen gövde (örnek) | En kötü |
|---|---|---|
| yağmur × soğuk | 21.00–22.00 arası yağmur bekleniyor; hissedilen 3°. Şemsiyeyle montu hatırlatayım. | 110 |
| yağmur × serin | 21.00–22.00 arası yağmur bekleniyor; hissedilen 15°. Şemsiyeyle hırkayı hatırlatayım. | 107 |
| yağmur × ılık | 21.00–22.00 arası yağmur bekleniyor; hissedilen 22°. Şemsiyeyi hatırlatayım. | 98 |
| yağmur × sıcak | 21.00–22.00 arası yağmur bekleniyor; hissedilen 27°. Şemsiyeyle suyu hatırlatayım. | 104 |
| yağmur × çok sıcak | 21.00–22.00 arası yağmur bekleniyor; hissedilen 34°. Şemsiyeyle suyu hatırlatayım. | 104 |
| kuru × soğuk | Kuru bir gün bekleniyor; hissedilen 3°, soğuk. Kalın giyinmeni hatırlatayım. | 104 |
| kuru × serin | Kuru bir gün bekleniyor; hissedilen 15°, serin. İnce bir hırkayı hatırlatayım. | 100 |
| kuru × ılık | Kuru bir gün bekleniyor; hissedilen 22°, ılık. Dışarıda biraz vakit geçirirdim. | 101 |
| kuru × sıcak | Kuru bir gün bekleniyor; hissedilen 27°, sıcak. Suyunu yanına almanı hatırlatayım. | 104 |
| kuru × çok sıcak | Kuru bir gün bekleniyor; hissedilen 34°, çok sıcak. Suyunu yanına almanı hatırlatayım. | 108 |

- Yağmurlu hücrelerde "soğuk / serin …" sözcüğü yok: "arası" eklenince 110'a sığmıyordu. Sıcaklık rakamla ve notta duruyor.
- Tahmin 1 saatten eskiyse başa "Dün 22.40 tahminine göre" ya da "Sabah 05.40 tahminine göre" gelir. O zaman not düşer; en uzun hâl 104 karakter. 18 saatten eski tahminle bildirim hiç gelmez.
- "Şemsiyeyle montu" incelemeden sonra eklendi. Soğuk hücresinde giysi hatırlatması yoktu.

## Karar gereken

1. **Kaç yüzde olasılıkla "yağmur bekleniyor" diyelim?** Kod bugün saatlik olasılık %50 ve üstündeyse yağmur var sayıyor. %30 olasılıkta "Kuru bir gün bekleniyor" yanlış güvence verir. Öneri: %60 ve üstü "bekleniyor"; %30–59 arası "yağmur olasılığı %40" gibi ayrı bir cümle; %30'un altı "kuru".
2. **"Hissedilen" hangi anın sıcaklığı olsun?** Taslak gün içindeki en yüksek hissedileni yazıyor, bu da soğuk sabahı olduğundan ılık gösterir. Kod hücreyi ise günün en yüksek gerçek sıcaklığına göre seçiyor ve sınırları farklı: taslakta soğuk ≤ 11, kodda < 10. Öneri: rakam bildirim saatindeki hissedilen olsun, hücre de aynı rakamdan seçilsin.
3. **Uzun ilçe adı:** plana göre ad 14 harften uzunsa başlıkta yalnız sıcaklık kalır. Ama 14 harfli ad eksi derecelerle 32 karakter tutuyor ve 30 sınırını aşıyor. Öneri: sınır 12 harf olsun.
