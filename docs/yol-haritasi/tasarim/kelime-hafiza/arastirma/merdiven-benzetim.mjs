const F=[30,27,24,21,19,17,15,13,12,11,10,9,8,7,6,5,4,3]; const ms=F.map(f=>f*1000/60)
// psychometric: p(correct)= g+(1-g-l)/(1+exp(-(log10(ms)-log10(T))/s)); g=0 (typing), lapse .03
function p(d,T,s=0.08){return 0.0+(0.97)/(1+Math.exp(-(Math.log10(d)-Math.log10(T))/s))}
function run(rule,T,start,N,rnd){let i=start,streak=0,res=[];for(let t=0;t<N;t++){const d=ms[i];const c=rnd()<p(d,T);res.push({i,d,c});
 if(rule==='A'){ if(c) i=Math.min(F.length-1,i+1); else i=Math.max(0,i-3)}
 if(rule==='B'){ if(c){streak++; if(streak===2){i=Math.min(F.length-1,i+1);streak=0}} else {i=Math.max(0,i-2);streak=0}}
 if(rule==='A4'){ if(c) i=Math.min(F.length-1,i+1); else i=Math.max(0,i-4)}
 }return res}
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647}
const med=a=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
for(const T of [120,200,300]) for(const rule of ['A','A4','B']) for (const N of [20,24]) {
 let pc=0,n=0,est=[];const startIdx=ms.findIndex(x=>x<=T*1.6)
 for(let k=0;k<4000;k++){const r=run(rule,T,Math.max(0,startIdx),N,rnd);pc+=r.filter(x=>x.c).length;n+=r.length;est.push(med(r.slice(-10).map(x=>x.d)))}
 const e=est.sort((a,b)=>a-b);const sd=Math.sqrt(est.reduce((a,b)=>a+(Math.log10(b)-Math.log10(med(est)))**2,0)/est.length)
 // true 80% point: solve p=.8
 let lo=10,hi=1000;for(let j=0;j<60;j++){const m=(lo+hi)/2; if(p(m,T)<.8) lo=m; else hi=m}
 console.log(`T=${T} rule=${rule} N=${N} pc=${(pc/n).toFixed(3)} est median=${med(est).toFixed(0)} ms, logSD=${sd.toFixed(3)}, true80=${lo.toFixed(0)}`)
}
