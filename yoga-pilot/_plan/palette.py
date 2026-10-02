import colorsys
def lum(h):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
def darken(h, target_bg, need):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    hh,l,s=colorsys.rgb_to_hls(r,g,b)
    while l>0:
        rr,gg,bb=colorsys.hls_to_rgb(hh,l,s); x='#%02X%02X%02X'%(round(rr*255),round(gg*255),round(bb*255))
        if cr(x,target_bg)>=need and cr(x,'#F3F6F8')>=need: return x
        l-=0.005
P={1:('Nefesin Ritmi','adaçayı yeşili','#8CCB9E'),2:('Derin Dinlenme','soluk deniz mavisi','#7EB2DD'),
   3:('Uykuya Geçiş','kehribar','#E3A857'),4:('Zor Anlar İçin','dere camgöbeği','#6FC7C1'),
   5:('Tek Nokta','soğuk ışık beyazı','#D6E4F2'),6:('Sabah Niyeti','şafak turuncusu','#F0916A'),
   7:('Kendine Şefkat','sıcak gül','#E59AB0'),8:('Sağlam Yer','taş rengi','#BCA88A'),
   9:('Kendini Tanımak','leylak','#B59BE0'),10:('Gelecekteki Sen','yol altını','#D9C76A')}
for k,(n,ad,c) in P.items():
    lt=darken(c,'#FFFFFF',4.5)
    print(f"| {k} | {n} | {ad} | `{c}` | {cr(c,'#050A12'):.1f} | {cr(c,'#0F171F'):.1f} | `{lt}` | {cr(lt,'#FFFFFF'):.1f} | {cr(lt,'#F3F6F8'):.1f} |")
