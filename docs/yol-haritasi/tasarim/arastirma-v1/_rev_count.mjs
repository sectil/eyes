const r=(a,b)=>{const o=[];for(let x=a;x<=b+1e-9;x+=0.5)o.push(+x.toFixed(1));return o};
function cnt(holdMax,waitMax,rmin,rmax){let n=0;for(const a of r(3,6))for(const e of r(a,8))for(const h of r(0,holdMax))for(const w of r(0,waitMax)){const c=a+e+h+w;const rate=60/c;if(rate>=rmin-1e-9&&rate<=rmax+1e-9)n++}return n}
console.log('B 5-7.5',cnt(0,0,5,7.5));
for (const [rmin] of [[4],[5]]) {console.log('C',rmin,cnt(2,0,rmin,7.5));console.log('D',rmin,cnt(2,4,rmin,7.5));}
