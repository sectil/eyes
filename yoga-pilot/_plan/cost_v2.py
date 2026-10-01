import json
R=json.load(open('timing_v2.json'))
CPW=(7.19,8.0); SPW=2.8; USD=5500
def chars(syl): return (syl/SPW*CPW[0], syl/SPW*CPW[1])
# ders 2 benzersiz hece (v2 senaryosu) = 4561; senaryoya göre g_hızlı oranıyla ölçeklenir
L2_v2=4561; gf_v2=R['v2 varsayılan (r≈6,6)']['gf']
music_pilot=(12*1650,18*1650); music_full=(128*1650,192*1650)
nat_pilot=4*30*40*2; nat_full=708*40*2
rows=[]
for path,scen,fac,train in [('A · REST (hız≈0,8)','REST hız≈0,8 (r≈5,2, tahmin)',(1.3,1.6),34000),
                            ('B · MCP eleven_v4, en iyi 3 (pilot) / 2–3 (üretim)','MCP eleven_v4 (r≈5,6)',None,22000)]:
    v=R[scen]
    l2=L2_v2*v['gf']/gf_v2
    c2=chars(l2); cf=chars(v['uniq'])
    if fac:
        tp=(2*c2[0]*fac[0],2*c2[1]*fac[1]); tf=(2*cf[0]*fac[0],2*cf[1]*fac[1])
    else:
        tp=(2*c2[0]*3.6,2*c2[1]*3.6); tf=(2*cf[0]*2.4,2*cf[1]*3.6)
    pil=(tp[0]+train+music_pilot[0]+nat_pilot, tp[1]+train+music_pilot[1]+nat_pilot)
    ful=(tf[0]+train+music_full[0]+nat_full, tf[1]+train+music_full[1]+nat_full)
    fnm=(tf[0]+train+nat_full, tf[1]+train+nat_full)
    k=lambda x: f"{x/1000:,.0f}k"
    print(path)
    print(' pilot TTS', k(tp[0]),'–',k(tp[1]),' pilot total',k(pil[0]),'–',k(pil[1]), f"= {pil[0]/USD:.0f}–{pil[1]/USD:.0f} USD")
    print(' full chars/voice', k(cf[0]),'–',k(cf[1]),' full TTS',k(tf[0]),'–',k(tf[1]),' full total',k(ful[0]),'–',k(ful[1]), f"= {ful[0]/USD:.0f}–{ful[1]/USD:.0f} USD", ' müziksiz',k(fnm[0]),'–',k(fnm[1]),f"= {fnm[0]/USD:.0f}–{fnm[1]/USD:.0f} USD")
    print(' L2 chars/voice',k(c2[0]),'–',k(c2[1]))
print('music pilot',music_pilot,'full',music_full,'nat',nat_pilot,nat_full)
