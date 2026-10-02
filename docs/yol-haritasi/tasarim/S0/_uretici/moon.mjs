// Meeus ch.47/48 düşük hassasiyet: evre açısı ve aydınlanma
const R = Math.PI/180
function illum(date){
  const jd = date.getTime()/86400000 + 2440587.5
  const T = (jd - 2451545)/36525
  const D = (297.8501921 + 445267.1114034*T) % 360
  const M = (357.5291092 + 35999.0502909*T) % 360
  const Mp = (134.9633964 + 477198.8675055*T) % 360
  const i = 180 - D - 6.289*Math.sin(Mp*R) + 2.100*Math.sin(M*R) - 1.274*Math.sin((2*D-Mp)*R) - 0.658*Math.sin(2*D*R) - 0.214*Math.sin(2*Mp*R) - 0.110*Math.sin(D*R)
  const k = (1+Math.cos(i*R))/2
  const elong = ((D % 360)+360)%360
  return { k, waxing: elong < 180, D: elong }
}
const tr = (y,m,d,h,mi=0)=> new Date(Date.UTC(y,m-1,d,h-3,mi))
for (const [lbl,dt] of [['29 Eyl 12:00',tr(2026,9,29,12)],['1 Eki 10',tr(2026,10,1,10)],['2 Eki 10',tr(2026,10,2,10)],['3 Eki 10',tr(2026,10,3,10)],['5 Eki 10',tr(2026,10,5,10)],['6 Eki 10',tr(2026,10,6,10)],['7 Eki 10',tr(2026,10,7,10)],['8 Eki 20:30',tr(2026,10,8,20,30)],['9 Eki 10',tr(2026,10,9,10)],['14 Eki 07:30',tr(2026,10,14,7,30)],['14 Eki 12:40',tr(2026,10,14,12,40)],['26 Eki 10',tr(2026,10,26,10)],['29 Eki 10',tr(2026,10,29,10)],['30 Eki 10',tr(2026,10,30,10)],['3 Kas 10',tr(2026,11,3,10)]]){
  const r = illum(dt); console.log(lbl, (r.k*100).toFixed(1)+'%', r.waxing?'büyüyen':'küçülen', r.D.toFixed(1))
}
