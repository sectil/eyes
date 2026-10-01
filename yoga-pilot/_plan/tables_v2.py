# PLAN.v2 B.4 tabloları + zamanlama/boyut/maliyet hesabı. Her sayı buradan üretilir; hepsi VARSAYIM'dır,
# yalnız hız ölçümleri (hiz/*.mp3, 2026-09-28) ölçümdür.
import math, json
OUT = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/_plan/'
T = [300, 600, 900, 1200, 1800]
DAY_A = [45, 60, 75, 90, 90]
DAY_K = [75, 90, 105, 120, 150]
NIGHT_K = [40, 45, 60, 75, 90]
# tür: g = rehberli çekirdek, d = derin (sessiz pencereli, ≤90 sn), d45 = derin ama pencere ≤45 sn, n = niyet (tek yönerge)
L = {
 '1 Nefesin Ritmi': ('day', [
   ('C1 Doğal nefes → uzun veriş (≈6/dk, 4 al / 6 ver, tutma yok)', 'P1', [180, 270, 270, 300, 360], 'g'),
   ('C2 İç çekiş: iki kısa alış + uzun veriş', 'P2', [0, 180, 180, 180, 210], 'g'),
   ('C3 Bhramari: ağız kapalı vızıltılı veriş, döngü 12–14 sn (parmaklar yüze değmez)', 'P3', [0, 0, 270, 270, 330], 'g'),
   ('C4 Nadi shodhana, tutmasız', 'P4', [0, 0, 0, 240, 360], 'g'),
   ('C5 Sessiz nefes tanıklığı (pencere ≤ 90 sn)', 'P5', [0, 0, 0, 0, 300], 'd'),
 ], 'C1 → C2 → C4 → C3 → C5'),
 '2 Derin Dinlenme': ('day', [
   ('N1 Niyet (sankalpa), başta', 'P1', [20, 30, 30, 40, 45], 'n'),
   ('C1 Beden dolaşımı (sağ → sol → arka → ön → bütün)', 'P1', [85, 180, 240, 270, 360], 'g'),
   ('C2 Nefes farkındalığı + geri sayma', 'P1', [55, 90, 120, 150, 210], 'g'),
   ('C3 Zıtlık çiftleri (ağır/hafif, sıcak/serin)', 'P3', [0, 0, 120, 180, 270], 'g'),
   ('C4 İmgeleme (seçimli: kıyı ya da orman) + sessiz pencere', 'P2', [0, 120, 180, 300, 405], 'g'),
   ('C5 Tanıklık: sessiz farkındalık', 'P5', [0, 0, 0, 0, 210], 'd'),
   ('N2 Niyet, sonda', 'P1', [20, 30, 30, 50, 60], 'n'),
 ], 'N1 → C1 → C2 → C3 → C4 → C5 → N2'),
 '3 Uykuya Geçiş': ('night', [
   ('C1 Yavaş, uzun veriş (tutma yok)', 'P1', [60, 90, 105, 120, 150], 'g'),
   ('C2 Bedenin ağırlaşması (yavaş beden dolaşımı)', 'P1', [70, 150, 210, 270, 360], 'g'),
   ('C3 Tek sahneli, ayrıntılı imgeleme', 'P1', [85, 195, 300, 405, 540], 'g'),
   ('C4 Nefesle geri sayma', 'P2', [0, 60, 150, 240, 270], 'g'),
   ('C5 İmgede sessiz yürüyüş (seyrek ses)', 'P5', [0, 0, 0, 0, 300], 'd'),
 ], 'C1 → C2 → C4 → C3 → C5'),
 '4 Zor Anlar İçin': ('day', [
   ('C1 Dayanak (ayaklar, eller, sesler) + uzun veriş', 'P1', [90, 120, 150, 150, 210], 'g'),
   ('C2 Bedende bulmak, adlandırmak, kendine "sen" diye seslenmek', 'P1', [90, 150, 180, 210, 270], 'g'),
   ('C3 Derede yapraklar ya da geçen bulutlar (düşünceden ayrışma)', 'P2', [0, 180, 240, 270, 390], 'g'),
   ('C4 Duyguya nefesle yer açmak', 'P3', [0, 0, 150, 180, 270], 'g'),
   ('C5 Şefkatli el + dayanağa dönüş', 'P4', [0, 0, 0, 180, 240], 'g'),
   ('S Sessiz dayanak (pencere ≤ 45 sn)', 'P5', [0, 0, 0, 0, 180], 'd45'),
 ], 'C1 → C2 → C4 → C3 → C5 → S'),
 '5 Tek Nokta': ('day', [
   ('C1 Nefes çapası: dağıl, fark et, dön', 'P1', [180, 210, 240, 240, 270], 'g'),
   ('C2 Nefes sayma 1–10', 'P2', [0, 240, 240, 270, 300], 'g'),
   ('C3 Uzayan sessiz odak aralıkları (15→30→45→60 sn)', 'P3', [0, 0, 240, 300, 390], 'd'),
   ('C4 Ses çapası ya da yumuşak bakış (drishti, kırpmak serbest)', 'P4', [0, 0, 0, 180, 240], 'g'),
   ('C5 Açık izleme (sesler, düşünceler gelip gider)', 'P5', [0, 0, 0, 0, 360], 'd'),
 ], 'C1 → C2 → C4 → C3 → C5'),
 '6 Sabah Niyeti': ('day', [
   ('C1 Uyanış: doğal nefes + oturarak omurga hareketi', 'P1', [90, 120, 120, 150, 180], 'g'),
   ('C2 Niyet (sankalpa): bugün için tek kelime', 'P1', [90, 90, 90, 90, 120], 'g'),
   ('C3 Hafif akış, oturarak: boyun, omuz, yan esneme, kollar nefesle', 'P2', [0, 240, 300, 300, 360], 'g'),
   ('C4 Şükran üçlüsü (kişi, an, beden duyusu)', 'P3', [0, 0, 210, 210, 240], 'g'),
   ('C5 Günün provası + eğer-ise planı', 'P4', [0, 0, 0, 240, 270], 'g'),
   ('C6 İkinci akış, oturarak + oturarak dağ duruşunda durgunluk', 'P5', [0, 0, 0, 0, 390], 'g'),
 ], 'C1 → C3 → C6 → C4 → C2 → C5'),
 '7 Kendine Şefkat': ('day', [
   ('C1 Dayanak + şefkatli beden taraması (dolaylı yol)', 'P1', [60, 150, 180, 210, 270], 'g'),
   ('C2 Sevdiğin birine iyi dilek', 'P1', [55, 120, 150, 180, 210], 'g'),
   ('C3 Kendine dönüş: el kalpte, iyi dilek', 'P1', [65, 180, 210, 240, 300], 'g'),
   ('C4 Genişleyen çember: herkese', 'P3', [0, 0, 180, 180, 210], 'g'),
   ('C5 Tarafsız biri', 'P4', [0, 0, 0, 180, 210], 'g'),
   ('C6 Zorlandığın biri (isteğe bağlı, çıkış kapısıyla)', 'P5', [0, 0, 0, 0, 360], 'g'),
 ], 'C1 → C2 → C5 → C6 → C3 → C4'),
 '8 Sağlam Yer': ('day', [
   ('C1 Yere basmak: oturarak dağ duruşu, sabit ve rahat', 'P1', [90, 120, 150, 150, 210], 'g'),
   ('C2 İç ses: kendine adınla ya da "sen" diye seslenmek', 'P1', [90, 150, 150, 180, 210], 'g'),
   ('C3 Değer hatırlama + onu yaşadığın küçük an', 'P2', [0, 180, 210, 210, 270], 'g'),
   ('C4 Zorlanmaya şefkatli bakış + küçük sonraki adım', 'P3', [0, 0, 210, 210, 270], 'g'),
   ('C5 Dağ imgesi (hava değişir, dağ kalır)', 'P4', [0, 0, 0, 240, 360], 'g'),
   ('C6 Sessiz duruş + tek cümlelik niyet', 'P5', [0, 0, 0, 0, 240], 'd'),
 ], 'C1 → C5 → C3 → C4 → C2 → C6'),
 '9 Kendini Tanımak': ('day', [
   ('C1 Beden taraması, 30–60 sn arayla geri çağırma', 'P1', [180, 240, 270, 300, 390], 'g'),
   ('C2 "Şu an ne hissediyorum?": duyguyu bedende bulmak', 'P2', [0, 210, 240, 240, 270], 'g'),
   ('C3 Nefesin kendiliğinden akışını izlemek', 'P3', [0, 0, 210, 210, 270], 'g'),
   ('C4 "Bugün neyi önemsiyorum?": değerlere bakış', 'P4', [0, 0, 0, 240, 270], 'g'),
   ('C5 Tanıklık (sakshi): izleyen farkındalık', 'P5', [0, 0, 0, 0, 360], 'd'),
 ], 'C1 → C3 → C2 → C5 → C4'),
 '10 Gelecekteki Sen': ('day', [
   ('C1 Yerleşme nefesi + dayanak', 'P1', [20, 60, 60, 90, 120], 'g'),
   ('C2 En iyi olası gün: kişisel alan', 'P1', [85, 210, 240, 240, 330], 'g'),
   ('C3 İkinci alan: ilişkiler', 'P3', [0, 0, 210, 210, 270], 'g'),
   ('C4 Üçüncü alan: iş ya da uğraş', 'P4', [0, 0, 0, 210, 270], 'g'),
   ('C5 Engel + eğer-ise planı', 'P1', [75, 180, 210, 240, 270], 'g'),
   ('C6 Gelecekteki senden bugüne bir cümle + sessizlik', 'P5', [0, 0, 0, 0, 300], 'd'),
 ], 'C1 → C2 → C3 → C4 → C6 → C5'),
}
# En kısa blok kuralı (VARSAYIM): çekirdek blok 5 dk sürümde bile ≥ 55 sn (E.6 #1 "zaman verir"); tek yönergeli
# niyet blokları (n) ve 5 dk'daki "yerleşme nefesi" ≥ 20 sn.
MIN_G, MIN_N = 55, 20
fmt = lambda s: '—' if s == 0 else f'{s//60}:{s%60:02d}'
out, ok = [], True
for name, (kind, blocks, order) in L.items():
    A = DAY_A; K = DAY_K if kind == 'day' else NIGHT_K
    klab = 'K Kapanış: dışa dönüş (gündüz)' if kind == 'day' else 'K Uyku izni (dönüş yok) → müzik kuyruğu ayrı'
    out.append(f'\n**Ders {name}** (çalma sırası: A → {order} → K)\n')
    out.append('| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |')
    out.append('|---|---|---|---|---|---|---|')
    out.append('| A Varış (izin, duruş, gözler) | sabit | ' + ' | '.join(fmt(x) for x in A) + ' |')
    for b, p, d, k in blocks:
        out.append(f'| {b} | {p} | ' + ' | '.join(fmt(x) for x in d) + ' |')
    out.append(f'| {klab} | sabit | ' + ' | '.join(fmt(x) for x in K) + ' |')
    sums = [A[i] + K[i] + sum(d[i] for _, _, d, _ in blocks) for i in range(5)]
    out.append('| **Toplam** | | ' + ' | '.join(f'**{fmt(s)}**' for s in sums) + ' |')
    if sums != T: ok = False; print('HATA toplam', name, sums)
    for b, p, d, k in blocks:
        seen = False
        for x in d:
            if x: seen = True
            elif seen: ok = False; print('HATA süreklilik', name, b)
        nz = [x for x in d if x]
        if any(b2 < a2 for a2, b2 in zip(nz, nz[1:])): ok = False; print('HATA azalan', name, b)
        lim = MIN_N if (k == 'n' or b.startswith('C1 Yerleşme')) else MIN_G
        if any(0 < x < lim for x in d): ok = False; print('HATA kısa blok', name, b, d)
print('B.4 TABLOLARI', 'TAMAM' if ok else 'HATALI')
open(OUT + 'tables_v2.md', 'w').write('\n'.join(out) + '\n')

# ---------------- Konuşma payı, metin, boyut, maliyet ----------------
# Konuşma payı (duvar saatinde sesin duyulduğu oran), orta değer ve bant. VARSAYIM.
SHARE = {'cap': (0.45, 0.52, 0.60), 'g': (0.30, 0.37, 0.45), 'n': (0.30, 0.37, 0.45),
         'd': (0.08, 0.12, 0.20), 'd45': (0.16, 0.20, 0.28)}
NIGHT_G = 0.80  # uyku dersinde rehberli bloklar ×0,8 (daha seyrek; VARSAYIM)
# Klip brüt hızı g = hece / klip süresi (klip içindeki noktalama duraklamaları dahil).
# Ölçüm (76 heceli paragraf, dosya süresi, baş/son sessizlik dahil): Nes v2 12,35 sn → 6,15; Hak v2 17,65 → 4,31;
# Nes v2 "…" 15,00 → 5,07; Hak v2 "…" 22,01 → 3,45; Nes v4 15,76 → 4,82.
# Senaryolar (artikülasyon r, klip içi duraklama çarpanı q = 0,07 Nes ... 0,46 Hak; g = r/(1+q)):
SCEN = {'REST hız≈0,8 (r≈5,2, tahmin)': 5.2, 'MCP eleven_v4 (r≈5,6)': 5.6, 'v2 varsayılan (r≈6,6)': 6.6}
Q = (0.07, 0.46)
SYL_PER_WORD = 2.8          # VARSAYIM (PLAN D.5)
CH_PER_WORD = (7.19, 8.0)   # elevenlabs.md §6.2 (ölçülen 7,19; üst 8,0 varsayım)
res = {}
lines = []
for sname, r in SCEN.items():
    gf, gs = r / (1 + Q[0]), r / (1 + Q[1])
    tot_core = tot_max = tot_uniq = 0
    per = []
    for name, (kind, blocks, order) in L.items():
        A = DAY_A; K = DAY_K if kind == 'day' else NIGHT_K
        spk = A[4] * SHARE['cap'][1] + K[4] * SHARE['cap'][1] * (0.77 if kind == 'night' else 1)
        for b, p, d, k in blocks:
            s = SHARE[k][1] * (NIGHT_G if kind == 'night' and k in 'gn' else 1)
            spk += d[4] * s
        n_max = gf * spk            # hızlı ses orta paya ulaşsın
        n_core = gs * spk           # yavaş ses orta payı aşmasın
        # benzersiz metin: 30 dk tam içerik + kısa Varış/Kapanış (5 dk kapaklarının konuşması) + köprüler + ilk ders cümlesi
        short_caps = gf * (A[0] + K[0]) * SHARE['cap'][1]
        uniq = n_max + short_caps + 150 + 20
        per.append((name, round(spk), round(n_core), round(n_max), round(uniq)))
        tot_core += n_core; tot_max += n_max; tot_uniq += uniq
    res[sname] = dict(gf=gf, gs=gs, per=per, core=tot_core, max=tot_max, uniq=tot_uniq)

lines.append('| Senaryo | g hızlı / yavaş (hece/sn) | 30 dk konuşma (ders ort., sn) | Çekirdek metin / ders (hece) | Tam metin / ders (hece) | Genişletme payı | Benzersiz metin / ders (hece ≈ sözcük) |')
lines.append('|---|---|---|---|---|---|---|')
for sname, v in res.items():
    spk = sum(p[1] for p in v['per']) / 10
    core = v['core'] / 10; mx = v['max'] / 10; u = v['uniq'] / 10
    lines.append(f"| {sname} | {v['gf']:.1f} / {v['gs']:.1f} | {spk:.0f} | {core:,.0f} | {mx:,.0f} | %{100*(mx-core)/mx:.0f} | {u:,.0f} ≈ {u/SYL_PER_WORD:,.0f} |")
open(OUT + 'timing_v2.md', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
print()
for p in res['v2 varsayılan (r≈6,6)']['per']: print(p)

# Boyut: iki ses, her ses bütün klipleri okur. Ses başına konuşma süresi = benzersiz hece / g_ses.
print('\nBOYUT (konuşma, 10 ders × 2 ses)')
sz = []
for sname, v in res.items():
    U = v['uniq']
    sec = U / v['gf'] + U / v['gs']      # iki sesin toplamı (biri hızlı, biri yavaş uçta)
    mb = lambda kbps: sec * kbps * 1000 / 8 / 1e6
    sz.append((sname, sec / 60, mb(48), mb(64), mb(128)))
    print(f"{sname}: {sec/60:.0f} dk; AAC48 {mb(48):.0f} MB; AAC64 {mb(64):.0f} MB; MP3128 {mb(128):.0f} MB; chars {U/SYL_PER_WORD*CH_PER_WORD[0]:,.0f}–{U/SYL_PER_WORD*CH_PER_WORD[1]:,.0f}")
json.dump({k: {kk: vv for kk, vv in v.items() if kk != 'per'} for k, v in res.items()}, open(OUT + 'timing_v2.json', 'w'), indent=1)
# Müzik: ders başına Varış 1×120 sn + Kapanış 1×180 sn + çekirdek 4×180 sn; uyku dersine ek 4×180 sn (kuyruk)
mus = 10 * (120 + 180 + 4 * 180) + 4 * 180
print('\nMÜZİK sn', mus, 'AAC64 st', mus * 64 / 8 / 1000, 'MB; AAC80', mus * 80 / 8 / 1000, '; AAC96', mus * 96 / 8 / 1000)
nat = 5 * 4 * 30 + 12 * 4 + 2 * 30
print('DOĞA sn', nat, 'MP3128', nat * 128 / 8 / 1000, 'MB')
