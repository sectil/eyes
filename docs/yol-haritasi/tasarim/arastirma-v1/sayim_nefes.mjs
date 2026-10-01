// Nefes çeşitleme üreteci: süre bileşimi sayımı (merdiven.md §4.5, plan §3.A.4). Tanım: alış 3–6 sn ve veriş alıştan
// 8 sn'ye 0,5 sn adımla; tutma (alıştan sonra) 0–2 sn ve bekleme (verişten sonra) 0–4 sn 1 sn adımla.
// B: tutma ve bekleme yok, 5–7,5 nefes/dk. C: + tutma, 5–7,5/dk. D: + tutma ve bekleme, 4–7,5/dk. Sayılar birikimlidir.
const r=(a,b,s)=>{const o=[];for(let x=a;x<=b+1e-9;x+=s)o.push(+x.toFixed(2));return o}
function say(holdMax,waitMax,rmin,rmax){let n=0,tut=0,bek=0
 for(const a of r(3,6,0.5))for(const e of r(a,8,0.5))for(const h of r(0,holdMax,1))for(const w of r(0,waitMax,1)){
  const rt=60/(a+e+h+w);if(rt>=rmin-1e-9&&rt<=rmax+1e-9){n++;if(h>0)tut++;if(w>0)bek++}}
 return {toplam:n,tutmali:tut,beklemeli:bek}}
console.log('B',say(0,0,5,7.5));console.log('C',say(2,0,5,7.5));console.log('D',say(2,4,4,7.5))
