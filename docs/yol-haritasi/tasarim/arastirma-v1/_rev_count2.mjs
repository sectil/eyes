const r=(a,b,s=0.5)=>{const o=[];for(let x=a;x<=b+1e-9;x+=s)o.push(+x.toFixed(2));return o};
const res={};
for(const hs of [0.5,1])for(const hmin of [0,0.5,1])for(const rmin of [4,4.5,5,5.5,6])for(const rmax of [7,7.5,8]){
 let C=0,D=0,Donly=0;
 for(const a of r(3,6))for(const e of r(a,8)){
  for(const h of r(hmin,2,hs)){const c=a+e+h,rt=60/c;if(rt>=rmin-1e-9&&rt<=rmax+1e-9)C++}
  for(const h of r(0,2,hs))for(const w of r(0,4,hs)){const c=a+e+h+w,rt=60/c;if(rt>=rmin-1e-9&&rt<=rmax+1e-9){D++; if(w>0)Donly++}}
 }
 if([99,629].includes(C)||[99,629].includes(D)||[629,99].includes(Donly)) console.log({hs,hmin,rmin,rmax,C,D,Donly});
}
