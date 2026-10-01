import fs from 'fs'
const src=fs.readFileSync('./sim_kural_esit.mjs','utf8').split('const RULES=')[0].replace(/function v2\(c,fam=1\)\{[^\n]*\n/,'')
eval(src.replace(/^\/\/.*$/mg,'')+`
function v2(c,fam=1,win=3){return (vals)=>{if(vals.length<fam+6+win)return 'unsure';const b=vals.slice(fam,fam+6);const base=med(b),s=Math.max(sdv(b),0.5);const cur=med(vals.slice(-win));return cur-base< -c*s?'worse':cur-base>c*s?'better':'noise'}}
function runLate(rule,{k=1,drop=1}={}){const N=52*3;let hit=0,falseAny=0
 for(let p=0;p<P;p++){const S=Array.from({length:k},()=>[]);const st=Array(k).fill(0);let h=false
  for(let i=0;i<N;i++){for(let m=0;m<k;m++)S[m].push(gauss()-(i>=144?drop:0))
   if(rule.weekly&&i%3!==2)continue
   for(let m=0;m<k;m++){const s=rule.st(S[m]);if(s==='worse')st[m]++;else st[m]=0;if(st[m]>=rule.persist&&i>=144)h=true}}
  if(h)hit++}
 return (hit/P*100).toFixed(1)}
const R=[
 ['Bugünkü',{st:halves,weekly:false,persist:1}],
 ['Bugünkü+haftalık+2',{st:halves,weekly:true,persist:2}],
 ['v2 1.5 p2 w3',{st:v2(1.5),weekly:true,persist:2}],
 ['v2 1.0 p2 w6',{st:v2(1.0,1,6),weekly:true,persist:2}],
 ['v2 1.5 p2 w6',{st:v2(1.5,1,6),weekly:true,persist:2}],
 ['v2 1.25 p2 w6',{st:v2(1.25,1,6),weekly:true,persist:2}],
]
for(const [n,r] of R){seed=7;const a=run(r,{k:1});seed=7;const b=run(r,{k:4});seed=7;const d=run(r,{k:1,drop:1});seed=7;const l=run(r,{k:1,learn:1,side:'better'});seed=7;const late=runLate(r);seed=7;const late0=runLate(r,{drop:0})
 console.log(n,'| 26hf 1m',a.all,'| 26hf 4m',b.all,'| yakala',d.wk14_26,'(yokken',a.wk14_26+')','| öğrenme',l.all,'| 48.hf düşüşü 4 hf içinde',late,'(yokken',late0+')')}
`)
