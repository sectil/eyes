import json, subprocess, sys
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-1'
# args: sol_unit sag_unit sag_take
sol,sag,st=sys.argv[1:4]
rk=json.load(open(W+'/rank/%s.json'%sag))
x=[r for r in rk['ranking'] if r['take']==st+'.mp3'][0]
f0=x['metrics']['f0_geo_hz']; rate=x['metrics']['articulation']
uj=W+'/rank/%s.unit.json'%sol
p=subprocess.run([sys.executable,R+'/tools/audio.py','rank',R+'/raw/hak/'+sol,'--unit-json','@'+uj,'--sex','m','--match-f0',str(f0),'--match-rate',str(rate)],capture_output=True,text=True)
open(W+'/rank/%s.match.json'%sol,'w').write(p.stdout)
d=json.loads(p.stdout)
d['match_to']={'unit':sag,'take':st,'f0_geo_hz':f0,'articulation':rate}
json.dump(d,open(W+'/rank/%s.match.json'%sol,'w'),ensure_ascii=False,indent=1)
print(sol,'match',sag,st,f0,rate,'rc',p.returncode)
for r in d['ranking']: print('  ',r['rank'],r['take'],'match_pen',r['penalties'].get('match'),'score',r['score'],'f0',r['metrics']['f0_geo_hz'],'art',r['metrics']['articulation'],r['soft_violations'])
