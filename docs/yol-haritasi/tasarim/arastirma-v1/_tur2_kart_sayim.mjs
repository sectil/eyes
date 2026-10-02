// Tur 2: 30 akşamda kaç kanıt kartı çıkar (hesap; kişi her akşam kartı açar, yolu her gün yapar, "Ekran çoktu" etiketini hiç seçmez)
import fs from 'fs'
const usno = JSON.parse(fs.readFileSync('usno2026.json','utf8')).phasedata.filter(p=>p.phase==='Full Moon').map(p=>Date.UTC(p.year,p.month-1,p.day)/864e5)
const DAY=864e5
function run(startISO, cards){
  const s=Date.parse(startISO)/DAY; const last={}; let n=0, by={}
  for(let i=0;i<30;i++){ const d=s+i, day=i+1
    const elig=[]
    if(cards.includes('dolunay') && usno.some(f=>Math.abs(f-d)<=2)) elig.push('dolunay')
    if(cards.includes('uzaga') && day>=5) elig.push('uzaga')
    if(cards.includes('kirpma')) elig.push('kirpma')
    if(cards.includes('nefes')) elig.push('nefes')
    const c=elig.find(k=> last[k]==null || d-last[k]>=7)
    if(c){last[c]=d;n++;by[c]=(by[c]??0)+1}
  }
  return {n,by}
}
const starts=['2026-10-01','2026-10-10','2026-10-20','2026-11-05','2026-12-15']
for(const set of [['dolunay'],['dolunay','nefes','kirpma','uzaga']]){
  const r=starts.map(s=>run(s,set)); console.log(set.join('+'), r.map(x=>x.n).join(' '), JSON.stringify(r[0].by))
}
