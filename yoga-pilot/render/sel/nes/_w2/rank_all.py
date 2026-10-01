import json,subprocess,sys,os
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/nes/_w2'
u=json.load(open(R+'/units.json'))['units']
part=u[34:68]
print([x['id'] for x in part])
out={}
for x in part:
    uj=W+f'/unit_{x["id"]}.json'
    json.dump(x,open(uj,'w'),ensure_ascii=False)
    p=subprocess.run(['python3',R+'/tools/audio.py','rank',R+'/raw/nes/'+x['id'],'--unit-json',uj,'--sex','f'],capture_output=True,text=True)
    try: r=json.loads(p.stdout)
    except Exception: r={'error':p.stdout[-2000:]+p.stderr[-2000:]}
    r['_exit']=p.returncode
    out[x['id']]=r
    rk=r.get('ranking',[])
    print(x['id'],'exit',p.returncode,'order',[t['take'] for t in rk],'excl',r.get('excluded'),'| top:',rk[0]['soft_violations'] if rk else None, rk[0]['cut'].get('margin_ratio') if rk and rk[0].get('cut') else None, rk[0]['cut'].get('cut_suspect') if rk and rk[0].get('cut') else None, flush=True)
json.dump(out,open(W+'/rank.json','w'),ensure_ascii=False,indent=1)
