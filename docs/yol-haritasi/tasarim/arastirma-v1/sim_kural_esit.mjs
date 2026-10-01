// Tur 1 düzeltmesi: bütün kurallar AYNI ufukta (13 ve 26 hafta), haftada 3 ölçüm, 5.000 yapay kişi, tek ve dört metrik.
// Bugünkü kural = lib/progress.js metricTrend 'ilk yarı / son yarı' (sim.mjs'teki kopya). v2 = sim2.mjs'teki kural.
// "Yanlış işaret": gerçek değişim yokken ufuk içinde EN AZ BİR KEZ 'worse' (ya da öğrenme senaryosunda 'better').
// "Yakalama": 13. haftadan sonra 1 SD düşüş varken 14–26. haftalarda işaret; yanında aynı dönemde değişim yokken işaret.
const T95=[[1,12.706],[2,4.303],[3,3.182],[4,2.776],[5,2.571],[6,2.447],[7,2.365],[8,2.306],[9,2.262],[10,2.228],[12,2.179],[15,2.131],[20,2.086],[30,2.042],[60,2.0],[120,1.98]]
const t95=(df)=>{let t=T95[0][1];for(const[d,v]of T95)if(df>=d)t=v;return df>120?1.96:t}
const mci=(v)=>{const n=v.length,m=v.reduce((a,b)=>a+b,0)/n;const sd=Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(n-1));return{n,m,sd}}
function halves(vals){const n=vals.length;if(n<6)return 'unsure';const h=Math.floor(n/2);const A=mci(vals.slice(0,h)),B=mci(vals.slice(n-h));const va=A.sd**2/A.n,vb=B.sd**2/B.n,se=Math.sqrt(va+vb);const diff=B.m-A.m;const df=(va+vb)**2/(va**2/(A.n-1)+vb**2/(B.n-1));const half=t95(Math.max(1,Math.floor(df)))*se;const lo=diff-half,hi=diff+half;return lo>0?'better':hi<0?'worse':'noise'}
const med=(a)=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
const sdv=(a)=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1))}
function v2(c,fam=1){return (vals)=>{if(vals.length<fam+6+3)return 'unsure';const b=vals.slice(fam,fam+6);const base=med(b),s=Math.max(sdv(b),0.5);const cur=med(vals.slice(-3));return cur-base< -c*s?'worse':cur-base>c*s?'better':'noise'}}
let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const P=5000
// rule: {name, st: status fn, weekly: bool, persist: n}
function run(rule,{k=1,weeks=26,drop=0,learn=0,side='worse'}={}){const N=weeks*3;let anyEarly=0,anyLate=0,anyAll=0
 for(let p=0;p<P;p++){const S=Array.from({length:k},()=>[]);const streak=Array(k).fill(0);let early=false,late=false
  for(let i=0;i<N;i++){for(let m=0;m<k;m++)S[m].push(gauss()-(i>=39?drop:0)+learn*(1-Math.exp(-i/6)))
   if(rule.weekly&&i%3!==2)continue
   for(let m=0;m<k;m++){const s=rule.st(S[m]);if(s===side)streak[m]++;else streak[m]=0
    if(streak[m]>=rule.persist){if(i<39)early=true;else late=true}}}
  if(early)anyEarly++;if(late)anyLate++;if(early||late)anyAll++}
 const f=(x)=>(x/P*100).toFixed(1);return {first13:f(anyEarly),wk14_26:f(anyLate),all:f(anyAll)}}
const RULES=[
 {name:'Bugünkü (her ölçümde bakış)',st:halves,weekly:false,persist:1},
 {name:'Bugünkü + haftalık bakış + iki hafta sürme',st:halves,weekly:true,persist:2},
 {name:'v2 c=1,5 persist 2 (seçilen)',st:v2(1.5),weekly:true,persist:2},
 {name:'v2 c=2 persist 2',st:v2(2),weekly:true,persist:2},
 {name:'v2 c=2 persist 3',st:v2(2),weekly:true,persist:3},
]
console.log('| Kural | Yanlış "geriliyor", 13 hf, 1 metrik | 26 hf, 1 metrik | 13 hf, 4 metrik | 26 hf, 4 metrik | 1 SD düşüşü 14–26. hf yakalama | Aynı dönemde değişim yokken işaret | Öğrenme etkisinde yanlış "iyileşiyor", 26 hf |')
console.log('|---|---|---|---|---|---|---|---|')
for(const r of RULES){seed=7;const a=run(r,{k:1});seed=7;const b=run(r,{k:4});seed=7;const d=run(r,{k:1,drop:1});seed=7;const l=run(r,{k:1,learn:1,side:'better'})
 console.log(`| ${r.name} | %${a.first13} | %${a.all} | %${b.first13} | %${b.all} | %${d.wk14_26} | %${a.wk14_26} | %${l.all} |`)}
seed=7;console.log('v2 c=1,5 alışma 2 gün, öğrenme:',run({st:v2(1.5,2),weekly:true,persist:2},{k:1,learn:1,side:'better'}).all)
