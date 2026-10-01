// progress.js metricTrend 'halves' (kopya) — tekrarlı bakışta yanlış 'worse' oranı
const T95=[[1,12.706],[2,4.303],[3,3.182],[4,2.776],[5,2.571],[6,2.447],[7,2.365],[8,2.306],[9,2.262],[10,2.228],[12,2.179],[15,2.131],[20,2.086],[30,2.042],[60,2.0],[120,1.98]]
const t95=(df)=>{let t=T95[0][1];for(const[d,v]of T95)if(df>=d)t=v;return df>120?1.96:t}
const mci=(v)=>{const n=v.length,m=v.reduce((a,b)=>a+b,0)/n;const sd=Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(n-1));return{n,m,sd}}
function status(vals){const n=vals.length;if(n<6)return 'unsure';const h=Math.floor(n/2);const A=mci(vals.slice(0,h)),B=mci(vals.slice(n-h));const va=A.sd**2/A.n,vb=B.sd**2/B.n,se=Math.sqrt(va+vb);const diff=B.m-A.m;const df=(va+vb)**2/(va**2/(A.n-1)+vb**2/(B.n-1));const half=t95(Math.max(1,Math.floor(df)))*se;const lo=diff-half,hi=diff+half;return lo>0?'better':hi<0?'worse':'noise'}
let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const P=5000,N=39 // 26 hafta x 3
function run(k,learn=0,persist=false){let anyW=0,anyB=0,finalW=0
 for(let p=0;p<P;p++){let w=false,b=false;const series=[];for(let m=0;m<k;m++)series.push([]);let lastW=Array(k).fill(false)
  for(let i=0;i<N;i++){for(let m=0;m<k;m++){series[m].push(gauss()+learn*(1-Math.exp(-i/6)))}
   if(persist && i%3!==2) continue // haftalık bakış
   for(let m=0;m<k;m++){const s=status(series[m]);if(s==='worse'){if(!persist||lastW[m])w=true;lastW[m]=true}else lastW[m]=false;if(s==='better')b=true}}
  if(w)anyW++;if(b)anyB++;if(k===1&&status(series[0])==='worse')finalW++}
 return {k,learn,persist,anyWorse:(anyW/P*100).toFixed(1)+'%',anyBetter:(anyB/P*100).toFixed(1)+'%',finalWorse1:(finalW/P*100).toFixed(1)+'%'}}
console.log(run(1));console.log(run(2));console.log(run(4));
console.log(run(1,0,true));console.log(run(4,0,true));
console.log(run(1,1));console.log(run(1,1,true))
