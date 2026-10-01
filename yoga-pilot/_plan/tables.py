# Ders zaman çizelgesi tabloları: toplamları doğrular ve markdown üretir.
T = [300, 600, 900, 1200, 1800]
DAY_A = [45, 60, 75, 90, 90]
DAY_K = [75, 90, 105, 120, 150]
NIGHT_K = [40, 45, 60, 75, 90]
L = {
 '1 Nefesin Ritmi': ('day', [
   ('C1 Doğal nefes → uzun veriş (≈6/dk, 4 al / 6 ver, tutma yok)', 'P1', [180, 270, 270, 300, 360]),
   ('C2 İç çekiş: iki kısa alış + uzun veriş', 'P2', [0, 180, 180, 180, 210]),
   ('C3 Bhramari: vızıltılı veriş, döngü 12–14 sn', 'P3', [0, 0, 270, 270, 330]),
   ('C4 Nadi shodhana, tutmasız', 'P4', [0, 0, 0, 240, 360]),
   ('C5 Sessiz nefes tanıklığı (müzik penceresi ≤90 sn)', 'P5', [0, 0, 0, 0, 300]),
 ], 'C1 → C2 → C4 → C3 → C5'),
 '2 Derin Dinlenme': ('day', [
   ('N1 Niyet (sankalpa), başta', 'P1', [20, 30, 30, 40, 45]),
   ('C1 Beden dolaşımı (sağ → sol → arka → ön → bütün)', 'P1', [100, 180, 240, 270, 360]),
   ('C2 Nefes farkındalığı + geri sayma', 'P1', [40, 90, 120, 150, 210]),
   ('C3 Zıtlık çiftleri (ağır/hafif, sıcak/serin)', 'P3', [0, 0, 120, 180, 270]),
   ('C4 İmgeleme (seçimli: kıyı ya da orman) + sessiz pencere', 'P2', [0, 120, 180, 300, 405]),
   ('C5 Tanıklık: sessiz farkındalık', 'P5', [0, 0, 0, 0, 210]),
   ('N2 Niyet, sonda', 'P1', [20, 30, 30, 50, 60]),
 ], 'N1 → C1 → C2 → C3 → C4 → C5 → N2'),
 '3 Uykuya Geçiş': ('night', [
   ('C1 Yavaş, uzun veriş (tutma yok)', 'P1', [60, 90, 105, 120, 150]),
   ('C2 Bedenin ağırlaşması (yavaş beden dolaşımı)', 'P1', [70, 150, 210, 270, 360]),
   ('C3 Tek sahneli, ayrıntılı imgeleme', 'P1', [85, 195, 300, 405, 540]),
   ('C4 Nefesle geri sayma', 'P2', [0, 60, 150, 240, 270]),
   ('C5 İmgede sessiz yürüyüş (seyrek ses)', 'P5', [0, 0, 0, 0, 300]),
 ], 'C1 → C2 → C4 → C3 → C5'),
 '4 Zor Anlar İçin': ('day', [
   ('C1 Dayanak (ayaklar, eller, sesler) + uzun veriş', 'P1', [90, 120, 150, 150, 210]),
   ('C2 Bedende bulmak, adlandırmak, kendine "sen" diye seslenmek', 'P1', [90, 150, 180, 210, 270]),
   ('C3 Derede yapraklar (düşünceden ayrışma)', 'P2', [0, 180, 240, 270, 390]),
   ('C4 Duyguya nefesle yer açmak', 'P3', [0, 0, 150, 180, 270]),
   ('C5 Şefkatli el + dayanağa dönüş', 'P4', [0, 0, 0, 180, 240]),
   ('S Sessiz dayanak (pencere ≤45 sn)', 'P5', [0, 0, 0, 0, 180]),
 ], 'C1 → C2 → C4 → C3 → C5 → S'),
 '5 Tek Nokta': ('day', [
   ('C1 Nefes çapası: dağıl, fark et, dön', 'P1', [180, 210, 240, 240, 270]),
   ('C2 Nefes sayma 1–10', 'P2', [0, 240, 240, 270, 300]),
   ('C3 Uzayan sessiz odak aralıkları (15→30→45→60 sn)', 'P3', [0, 0, 240, 300, 390]),
   ('C4 Ses çapası ya da yumuşak bakış (drishti, kırpmak serbest)', 'P4', [0, 0, 0, 180, 240]),
   ('C5 Açık izleme (sesler, düşünceler gelip gider)', 'P5', [0, 0, 0, 0, 360]),
 ], 'C1 → C2 → C4 → C3 → C5'),
 '6 Sabah Niyeti': ('day', [
   ('C1 Uyanış: doğal nefes + oturarak omurga hareketi', 'P1', [90, 120, 120, 150, 180]),
   ('C2 Niyet (sankalpa): bugün için tek kelime', 'P1', [90, 90, 90, 90, 120]),
   ('C3 Hafif akış: boyun, omuz, yan esneme, kollar nefesle', 'P2', [0, 240, 300, 300, 360]),
   ('C4 Şükran üçlüsü (kişi, an, beden duyusu)', 'P3', [0, 0, 210, 210, 240]),
   ('C5 Günün provası + eğer-ise planı', 'P4', [0, 0, 0, 240, 270]),
   ('C6 İkinci akış + dağ duruşunda durgunluk', 'P5', [0, 0, 0, 0, 390]),
 ], 'C1 → C3 → C6 → C4 → C2 → C5'),
 '7 Kendine Şefkat': ('day', [
   ('C1 Dayanak + şefkatli beden taraması (dolaylı yol)', 'P1', [90, 150, 180, 210, 270]),
   ('C2 Sevdiğin birine iyi dilek', 'P1', [45, 120, 150, 180, 210]),
   ('C3 Kendine dönüş: el kalpte, iyi dilek', 'P1', [45, 180, 210, 240, 300]),
   ('C4 Genişleyen çember: herkese', 'P3', [0, 0, 180, 180, 210]),
   ('C5 Tarafsız biri', 'P4', [0, 0, 0, 180, 210]),
   ('C6 Zorlandığın biri (isteğe bağlı, çıkış kapısıyla)', 'P5', [0, 0, 0, 0, 360]),
 ], 'C1 → C2 → C5 → C6 → C3 → C4'),
 '8 Sağlam Yer': ('day', [
   ('C1 Yere basmak: oturarak dağ duruşu, sabit ve rahat', 'P1', [90, 120, 150, 150, 210]),
   ('C2 İç ses: kendine adınla ya da "sen" diye seslenmek', 'P1', [90, 150, 150, 180, 210]),
   ('C3 Değer hatırlama + onu yaşadığın küçük an', 'P2', [0, 180, 210, 210, 270]),
   ('C4 Zorlanmaya şefkatli bakış + küçük sonraki adım', 'P3', [0, 0, 210, 210, 270]),
   ('C5 Dağ imgesi (hava değişir, dağ kalır)', 'P4', [0, 0, 0, 240, 360]),
   ('C6 Sessiz duruş + tek cümlelik niyet', 'P5', [0, 0, 0, 0, 240]),
 ], 'C1 → C5 → C3 → C4 → C2 → C6'),
 '9 Kendini Tanımak': ('day', [
   ('C1 Beden taraması, 30–60 sn arayla geri çağırma', 'P1', [180, 240, 270, 300, 390]),
   ('C2 "Şu an ne hissediyorum?": duyguyu bedende bulmak', 'P2', [0, 210, 240, 240, 270]),
   ('C3 Nefesin kendiliğinden akışını izlemek', 'P3', [0, 0, 210, 210, 270]),
   ('C4 "Bugün neyi önemsiyorum?": değerlere bakış', 'P4', [0, 0, 0, 240, 270]),
   ('C5 Tanıklık (sakshi): izleyen farkındalık', 'P5', [0, 0, 0, 0, 360]),
 ], 'C1 → C3 → C2 → C5 → C4'),
 '10 Gelecekteki Sen': ('day', [
   ('C1 Yerleşme nefesi + dayanak', 'P1', [30, 60, 60, 90, 120]),
   ('C2 En iyi olası gün: kişisel alan', 'P1', [105, 210, 240, 240, 330]),
   ('C3 İkinci alan: ilişkiler', 'P3', [0, 0, 210, 210, 270]),
   ('C4 Üçüncü alan: iş ya da uğraş', 'P4', [0, 0, 0, 210, 270]),
   ('C5 Engel + eğer-ise planı', 'P1', [45, 180, 210, 240, 270]),
   ('C6 Gelecekteki senden bugüne bir cümle + sessizlik', 'P5', [0, 0, 0, 0, 300]),
 ], 'C1 → C2 → C3 → C4 → C6 → C5'),
}
fmt = lambda s: '—' if s == 0 else f'{s//60}:{s%60:02d}'
out = []
ok = True
for name, (kind, blocks, order) in L.items():
    A = DAY_A; K = DAY_K if kind == 'day' else NIGHT_K
    klab = 'K Kapanış: dışa dönüş (gündüz)' if kind == 'day' else 'K Uyku izni (dönüş yok) → müzik kuyruğu ayrı'
    out.append(f'\n**Ders {name}** (çalma sırası: A → {order} → K)\n')
    out.append('| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |')
    out.append('|---|---|---|---|---|---|---|')
    out.append('| A Varış (izin, duruş, gözler) | sabit | ' + ' | '.join(fmt(x) for x in A) + ' |')
    for b, p, d in blocks:
        out.append(f'| {b} | {p} | ' + ' | '.join(fmt(x) for x in d) + ' |')
    out.append(f'| {klab} | sabit | ' + ' | '.join(fmt(x) for x in K) + ' |')
    sums = [A[i] + K[i] + sum(d[i] for _, _, d in blocks) for i in range(5)]
    out.append('| **Toplam** | | ' + ' | '.join(f'**{fmt(s)}**' for s in sums) + ' |')
    if sums != T:
        ok = False; print('HATA', name, sums)
    # öncelik tutarlılığı: bir sürede olan blok, daha uzun sürelerde de olmalı
    for b, p, d in blocks:
        seen = False
        for x in d:
            if x: seen = True
            elif seen: ok = False; print('HATA süreklilik', name, b)
        nz=[x for x in d if x]
        if any(b2 < a2 for a2, b2 in zip(nz, nz[1:])): ok = False; print('HATA azalan', name, b)
print('TOPLAMLAR', 'TAMAM' if ok else 'HATALI')
open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/_plan/tables.md', 'w').write('\n'.join(out) + '\n')
