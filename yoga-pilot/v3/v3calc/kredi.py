# PLAN.v3 kapsamı: 1 ses; 3 dk yalnız 1,4,5,6,8,9,10; 5 ve 15 her derste; Ders 2'ye 20 dk (onaylanırsa)
lo_pc, hi_pc = 3.467, 3.618          # kredi/karakter (TTS 3 çekim + yeniden çekim + Scribe), defterden (calc.py)
C15, short5 = 4042, 194
syl30_B = {1:3281,3:2667,4:3514,5:2693,6:3674,7:3674,8:3360,9:3203,10:3281}
ratio, cps = 1405/2270, C15/1405
has3 = {1,4,5,6,8,9,10}
lessons = [1,3,4,5,6,7,8,9,10]
lo_ch = {L: C15 + short5 + (430 if L in has3 else 0) for L in lessons}
hi_ch = {L: max(C15, syl30_B[L]*ratio*cps) + short5*1.5 + (720 if L in has3 else 0) for L in lessons}
sp_lo = sum(lo_ch.values())*lo_pc; sp_hi = sum(hi_ch.values())*hi_pc
d2_20 = 653
d2_lo = (short5 + d2_20)*lo_pc; d2_hi = (short5*1.5 + d2_20)*hi_pc
m_lo, m_hi = 1200*14.997 + 1200*5.5, 33887
nature = 2160
dv_lo, dv_hi = C15*lo_pc, C15*hi_pc
def k(x): return round(x/1000,1)
def usd(x): return round(x/5500,1)
print('konuşma 9 ders', k(sp_lo), k(sp_hi), '| Ders 2 eki (5 dk kısa + 20 dk)', k(d2_lo), k(d2_hi))
print('karakter/ders lo', lo_ch, '\n hi', {L: round(v) for L,v in hi_ch.items()})
reserve_lo, reserve_hi = 0.15*(sp_lo+d2_lo), 0.15*(sp_hi+d2_hi)
for name, nmus in (('EL müzik (9 ders)', 9), ('karma (5 ders EL: 3,6,7,9,10)', 5), ('Dalga', 0)):
    lo = sp_lo + d2_lo + nmus*m_lo + nature
    hi = sp_hi + d2_hi + nmus*m_hi + nature
    print(name, 'çekirdek', k(lo), '-', k(hi), 'USD', usd(lo), '-', usd(hi),
          '| + tasarlanan ses adayı + %15 yedek', k(lo+dv_lo+reserve_lo), '-', k(hi+dv_hi+reserve_hi), 'USD', usd(lo+dv_lo+reserve_lo), '-', usd(hi+dv_hi+reserve_hi))
print('müzik/ders', k(m_lo), k(m_hi), 'müzik 9 ders', k(9*m_lo), k(9*m_hi))
print('tasarlanan ses adayı (Ders 2, 15 dk)', k(dv_lo), k(dv_hi), 'yedek', k(reserve_lo), k(reserve_hi))
# partiler: P1 = 1,3,5 ; P2 = 4,7,8 ; P3 = 6,9,10
for name, grp in (('P1 (1,3,5)', [1,3,5]), ('P2 (4,7,8)', [4,7,8]), ('P3 (6,9,10)', [6,9,10])):
    lo = sum(lo_ch[L] for L in grp)*lo_pc + 3*m_lo
    hi = sum(hi_ch[L] for L in grp)*hi_pc + 3*m_hi
    print(name, k(lo), '-', k(hi), 'USD', usd(lo), '-', usd(hi))
# boyut (1 ses): dakikalar
mins = 7*3 + 10*5 + 10*15
for label, mb in (('AAC 64', .48), ('AAC 96', .72), ('MP3 pilot', .84)):
    print(label, 'toplam dk', mins, round(mins*mb), 'MB; +20 dk Ders 2:', round((mins+20)*mb), 'MB; yalnız 3+5:', round((21+50)*mb), 'MB')
