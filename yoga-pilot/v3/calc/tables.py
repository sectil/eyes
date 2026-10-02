# 3/5/15 dk çapa tabloları + hece bütçesi (VARSAYIM modeli; ölçülen brüt hızlarla)
def s(t):
    m, x = t.split(':'); return int(m) * 60 + int(x)
def f(x):
    return '%d:%02d' % (x // 60, x % 60)
# brüt hız (hece/sn; uç payı + klip içi duraklama dahil) — Ders 2 15 dk pilotu, Neslihan (yavaş ses)
BR = {'cap': 4.62, 'guided': 4.29, 'list': 3.80, 'deep': 4.49}
SHARE = {'guided': 0.37, 'list': 0.37, 'deep': 0.20, 'deep45': 0.20, 'sleep': 0.37 * 0.8}
# kapak metinleri (hece) içerikten: Ders 2 ölçümünden türetildi (oturarak: yatış adımları yok)
CAP = {3: (75, 98), 5: (105, 120), 15: (150, 170)}           # (Varış, Kapanış) oturarak
CAP_SLEEP = {5: (105, 45), 15: (150, 60)}                     # uyku izni kısa
# ders: {T: [(blok, tür, 'dk:sn'), ...]}
D = {
 1: {3: [('A','cap','0:34'),('C1','list','1:38'),('K','cap','0:48')],
     5: [('A','cap','0:45'),('C1','list','3:00'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','list','4:30'),('C2','guided','3:00'),('C3','guided','4:30'),('K','cap','1:45')]},
 3: {5: [('A','cap','0:45'),('C1','sleep','1:00'),('C2','sleep','1:10'),('C3','sleep','1:25'),('K','cap','0:40')],
     15:[('A','cap','1:15'),('C1','sleep','1:45'),('C2','sleep','3:30'),('C3','sleep','5:00'),('C4','sleep','2:30'),('K','cap','1:00')]},
 4: {3: [('A','cap','0:35'),('C1','guided','1:30'),('K','cap','0:55')],
     5: [('A','cap','0:45'),('C1','guided','1:30'),('C2','guided','1:30'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','guided','2:30'),('C2','guided','3:00'),('C3','guided','4:00'),('C4','guided','2:30'),('K','cap','1:45')]},
 5: {3: [('A','cap','0:34'),('C1','guided','1:38'),('K','cap','0:48')],
     5: [('A','cap','0:45'),('C1','guided','3:00'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','guided','4:00'),('C2','list','4:00'),('C3','deep','4:00'),('K','cap','1:45')]},
 6: {3: [('A','cap','0:34'),('C1','guided','0:58'),('C2','guided','0:40'),('K','cap','0:48')],
     5: [('A','cap','0:45'),('C1','guided','1:30'),('C2','guided','1:30'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','guided','2:00'),('C3','guided','5:00'),('C4','guided','3:30'),('C2','guided','1:30'),('K','cap','1:45')]},
 7: {5: [('A','cap','0:45'),('C1','guided','1:00'),('C2','guided','0:55'),('C3','guided','1:05'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','guided','3:00'),('C2','guided','2:30'),('C3','guided','3:30'),('C4','guided','3:00'),('K','cap','1:45')]},
 8: {3: [('A','cap','0:34'),('C1','guided','0:38'),('C2','guided','1:00'),('K','cap','0:48')],
     5: [('A','cap','0:45'),('C1','guided','1:30'),('C2','guided','1:30'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','guided','2:30'),('C3','guided','3:30'),('C4','guided','3:30'),('C2','guided','2:30'),('K','cap','1:45')]},
 9: {3: [('A','cap','0:34'),('C1','list','1:38'),('K','cap','0:48')],
     5: [('A','cap','0:45'),('C1','list','3:00'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','list','4:30'),('C3','guided','3:30'),('C2','guided','4:00'),('K','cap','1:45')]},
 10:{3: [('A','cap','0:34'),('C2','guided','0:55'),('C5','guided','0:43'),('K','cap','0:48')],
     5: [('A','cap','0:45'),('C1','guided','0:20'),('C2','guided','1:25'),('C5','guided','1:15'),('K','cap','1:15')],
     15:[('A','cap','1:15'),('C1','guided','1:00'),('C2','guided','4:00'),('C3','guided','3:30'),('C5','guided','3:30'),('K','cap','1:45')]},
}
for les, byT in D.items():
    for T, rows in byT.items():
        tot = sum(s(d) for _, _, d in rows)
        assert tot == T * 60, (les, T, tot)
        cap = (CAP_SLEEP if les == 3 else CAP)[T]
        syl = 0; sp = 0.0
        for b, ty, d in rows:
            if b == 'A': syl += cap[0]; sp += cap[0] / BR['cap']
            elif b == 'K': syl += cap[1]; sp += cap[1] / BR['cap']
            else:
                sec = s(d) * SHARE[ty]
                sp += sec
                syl += sec * BR['list' if ty == 'list' else ('deep' if ty.startswith('deep') else 'guided')]
        cores = [s(d) for b, ty, d in rows if b not in ('A', 'K')]
        print('Ders %2d %2d dk: %s | hece ≈ %d | konuşma ≈ %d sn (%%%d) | en kısa çekirdek %s' % (
            les, T, ' + '.join('%s %s' % (b, d) for b, _, d in rows), round(syl, -1), round(sp), round(100 * sp / (T * 60)), f(min(cores))))
# monotonluk: her blok 3 <= 5 <= 15
for les, byT in D.items():
    Ts = sorted(byT)
    for a, b in zip(Ts, Ts[1:]):
        da = {x[0]: s(x[2]) for x in byT[a]}; db = {x[0]: s(x[2]) for x in byT[b]}
        for k, v in da.items():
            assert db.get(k, 0) >= v, (les, k, a, b)
print('MONOTON TAMAM')
