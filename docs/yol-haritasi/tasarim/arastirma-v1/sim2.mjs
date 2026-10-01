// Önerilen kural: alışma (1. ölçüm) → başlangıç = 2.–7. ölçümlerin ortancası ve SD'si → haftalık bakış:
// son 3 ölçümün ortancası başlangıçtan c*SD kötüyse işaret; art arda 2 haftalık bakışta sürerse 'worse'.
let seed=11;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648}
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
const med=(a)=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
const sd=(a)=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1))}
const P=5000,N=78
function run(k,c,drop=0,persist=2){let anyW=0,detect=0
 for(let p=0;p<P;p++){let w=false,det=false;const S=Array.from({length:k},()=>[]);const streak=Array(k).fill(0)
  for(let i=0;i<N;i++){for(let m=0;m<k;m++)S[m].push(gauss()-(i>=39?drop:0))
   if(i<9||i%3!==2)continue
   for(let m=0;m<k;m++){const b=S[m].slice(1,7);const base=med(b),s=Math.max(sd(b),0.5);const cur=med(S[m].slice(-3))
    if(cur-base< -c*s){streak[m]++}else streak[m]=0
    if(streak[m]>=persist){if(i<39)w=true;else det=true}}}
  if(w)anyW++;if(det)detect++}
 return {k,c,drop,persist,falseWorseBeforeWk13:(anyW/P*100).toFixed(1)+'%',flagAfterWk13:(detect/P*100).toFixed(1)+'%'}}
for(const c of [1.5,2]){console.log(run(1,c));console.log(run(4,c));console.log(run(1,c,1));console.log(run(1,c,0));}
console.log(run(1,2,0,3),run(4,2,0,3),run(1,2,1,3))
