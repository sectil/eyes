import * as A from 'astronomy-engine'
import { createRequire } from 'module'; const SunCalc = createRequire(import.meta.url)('suncalc')
import fs from 'fs'
const usno = JSON.parse(fs.readFileSync('usno2026.json')).phasedata
const R = Math.PI/180, s = (x)=>Math.sin(x*R), c=(x)=>Math.cos(x*R)
// Meeus Astronomical Algorithms ch.49 (planetary A1..A14 terimleri olmadan)
function meeus(k){ // k: .0 yeni, .25 ilk dördün, .5 dolunay, .75 son dördün
  const T=k/1236.85
  let jde=2451550.09766+29.530588861*k+0.00015437*T*T-0.000000150*T**3+0.00000000073*T**4
  const E=1-0.002516*T-0.0000074*T*T
  const M=2.5534+29.10535670*k-0.0000014*T*T-0.00000011*T**3
  const Mp=201.5643+385.81693528*k+0.0107582*T*T+0.00001238*T**3-0.000000058*T**4
  const F=160.7108+390.67050284*k-0.0016118*T*T-0.00000227*T**3+0.000000011*T**4
  const O=124.7746-1.56375588*k+0.0020672*T*T+0.00000215*T**3
  const f=((k%1)+1)%1
  let d
  const tail = 0.00004*s(2*Mp-2*F)+0.00004*s(3*M)+0.00003*s(Mp+M-2*F)+0.00003*s(2*Mp+2*F)-0.00003*s(Mp+M+2*F)+0.00003*s(Mp-M+2*F)-0.00002*s(Mp-M-2*F)-0.00002*s(3*Mp+M)+0.00002*s(4*Mp)
  if (f<0.01){ d=-0.40720*s(Mp)+0.17241*E*s(M)+0.01608*s(2*Mp)+0.01039*s(2*F)+0.00739*E*s(Mp-M)-0.00514*E*s(Mp+M)+0.00208*E*E*s(2*M)-0.00111*s(Mp-2*F)-0.00057*s(Mp+2*F)+0.00056*E*s(2*Mp+M)-0.00042*s(3*Mp)+0.00042*E*s(M+2*F)+0.00038*E*s(M-2*F)-0.00024*E*s(2*Mp-M)-0.00017*s(O)-0.00007*s(Mp+2*M)+tail }
  else if (Math.abs(f-0.5)<0.01){ d=-0.40614*s(Mp)+0.17302*E*s(M)+0.01614*s(2*Mp)+0.01043*s(2*F)+0.00734*E*s(Mp-M)-0.00515*E*s(Mp+M)+0.00209*E*E*s(2*M)-0.00111*s(Mp-2*F)-0.00057*s(Mp+2*F)+0.00056*E*s(2*Mp+M)-0.00042*s(3*Mp)+0.00042*E*s(M+2*F)+0.00038*E*s(M-2*F)-0.00024*E*s(2*Mp-M)-0.00017*s(O)-0.00007*s(Mp+2*M)+tail }
  else { d=-0.62801*s(Mp)+0.17172*E*s(M)-0.01183*E*s(Mp+M)+0.00862*s(2*Mp)+0.00804*s(2*F)+0.00454*E*s(Mp-M)+0.00204*E*E*s(2*M)-0.00180*s(Mp-2*F)-0.00070*s(Mp+2*F)-0.00040*s(3*Mp)-0.00034*E*s(2*Mp-M)+0.00032*E*s(M+2*F)+0.00032*E*s(M-2*F)-0.00028*E*E*s(Mp+2*M)+0.00027*E*s(2*Mp+M)-0.00017*s(O)-0.00005*s(Mp-M-2*F)+0.00004*s(2*Mp+2*F)-0.00004*s(Mp+M+2*F)+0.00004*s(Mp-2*M)+0.00003*s(Mp+M-2*F)+0.00003*s(3*M)+0.00002*s(2*Mp-2*F)+0.00002*s(Mp-M+2*F)-0.00002*s(3*Mp+M)
    const W=0.00306-0.00038*E*c(M)+0.00026*c(Mp)-0.00002*c(Mp-M)+0.00002*c(Mp+M)+0.00002*c(2*F)
    d += f<0.5 ? W : -W }
  jde+=d
  const ms=(jde-2440587.5)*86400000 - 69000 // TT→UT (ΔT≈69 s, VARSAYIM)
  return new Date(ms)
}
const phaseK={'New Moon':0,'First Quarter':0.25,'Full Moon':0.5,'Last Quarter':0.75}
const NAIVE_REF=Date.UTC(2000,0,6,18,14), SYN=29.530588853*86400000
let maxM=0,maxA=0,maxN=0, dayFlipM=0, dayFlipN=0
const trDay=(d)=>new Date(d.getTime()+3*3600000).toISOString().slice(0,10) // Türkiye UTC+3
for (const p of usno){
  const t=Date.UTC(p.year,p.month-1,p.day,...p.time.split(':').map(Number))
  const approxK=Math.round(((t-Date.UTC(2000,0,6,18,14))/SYN - phaseK[p.phase])) + phaseK[p.phase]
  const m=meeus(approxK)
  const q=A.SearchMoonPhase(phaseK[p.phase]*360, new Date(t-3*86400000), 6).date
  const n=new Date(NAIVE_REF+approxK*SYN)
  const em=Math.abs(m-t)/60000, ea=Math.abs(q-t)/60000, en=Math.abs(n-t)/60000
  maxM=Math.max(maxM,em); maxA=Math.max(maxA,ea); maxN=Math.max(maxN,en)
  const truth=trDay(new Date(t))
  if (trDay(m)!==truth) dayFlipM++
  if (trDay(n)!==truth) dayFlipN++
}
console.log('USNO 2026 evre sayısı',usno.length)
console.log('Meeus49 (A-terimsiz) en büyük hata dk:',maxM.toFixed(1),' TR günü kayan:',dayFlipM)
console.log('astronomy-engine en büyük hata dk:',maxA.toFixed(1))
console.log('Ortalama çevrim (naif) en büyük hata dk:',maxN.toFixed(0),'(saat',(maxN/60).toFixed(1),') TR günü kayan:',dayFlipN)
// Aydınlanma: Meeus ch.48 düşük hassasiyet vs astronomy-engine vs suncalc
function illumMeeus(date){
  const jd=date.getTime()/86400000+2440587.5, T=(jd-2451545)/36525
  const D=297.8501921+445267.1114034*T, M=357.5291092+35999.0502909*T, Mp=134.9633964+477198.8675055*T
  const i=180-D-6.289*s(Mp)+2.1*s(M)-1.274*s(2*D-Mp)-0.658*s(2*D)-0.214*s(2*Mp)-0.11*s(D)
  return (1+c(i))/2
}
let mx1=0,mx2=0
for(let h=0;h<24*365;h+=7){const d=new Date(Date.UTC(2026,0,1)+h*3600000)
  const ae=A.Illumination(A.Body.Moon,d).phase_fraction
  mx1=Math.max(mx1,Math.abs(illumMeeus(d)-ae)); mx2=Math.max(mx2,Math.abs(SunCalc.getMoonIllumination(d).fraction-ae))}
console.log('Aydınlanma farkı (yüzde puan) Meeus48 vs AE:',(mx1*100).toFixed(2),' SunCalc vs AE:',(mx2*100).toFixed(2))
// Bugün (29 Eylül 2026, 12:00 TR)
const now=new Date(Date.UTC(2026,8,29,9,0))
console.log('29.09.2026 12:00 TR aydınlanma AE %',(A.Illumination(A.Body.Moon,now).phase_fraction*100).toFixed(1),' Meeus48 %',(illumMeeus(now)*100).toFixed(1),' evre açısı',A.MoonPhase(now).toFixed(1))
console.log('Sonraki yeniay', A.SearchMoonPhase(0,now,40).date.toISOString(), ' dolunay', A.SearchMoonPhase(180,now,40).date.toISOString())
const fm=usno.filter(p=>p.phase==='Full Moon'&&p.month>=9).map(p=>`${p.day}.${p.month} ${p.time}UT`);console.log('USNO dolunaylar Eyl+',fm.join(', '))
