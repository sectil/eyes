// İnceleyici: sim2 kuralı, değişim yok, 26 hafta boyunca herhangi bir 'worse' (sim.mjs ile aynı ufuk)
let seed=11;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const med=(a)=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
const sd=(a)=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1))}
const P=5000
for (const N of [39,78]) for (const k of [1,4]) {let anyW=0
 for(let p=0;p<P;p++){let w=false;const S=Array.from({length:k},()=>[]);const st=Array(k).fill(0)
  for(let i=0;i<N;i++){for(let m=0;m<k;m++)S[m].push(gauss())
   if(i<9||i%3!==2)continue
   for(let m=0;m<k;m++){const b=S[m].slice(1,7);const base=med(b),s=Math.max(sd(b),0.5);const cur=med(S[m].slice(-3))
    if(cur-base< -1.5*s)st[m]++;else st[m]=0
    if(st[m]>=2)w=true}}
  if(w)anyW++}
 console.log('N',N,'k',k,'v2 c1.5 p2 yanlış worse', (anyW/P*100).toFixed(1)+'%')}
