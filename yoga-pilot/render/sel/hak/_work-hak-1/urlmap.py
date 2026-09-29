import json,glob,hashlib,subprocess,os,sys
W='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/sel/hak/_work-hak-1'
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
idx=json.load(open(W+'/take_index.json'))
g2ut={}
for u,ts in idx.items():
    for t,v in ts.items(): g2ut[v['generation_id']]=(u,t)
m=json.load(open(W+'/urls.json')) if os.path.exists(W+'/urls.json') else {}
for f in sorted(glob.glob(W+'/status/s*.json')):
    d=json.load(open(f))
    for md in d.get('media',[]):
        gid=md['generation_id']
        if gid not in g2ut: continue
        u,t=g2ut[gid]
        key=u+'/'+t
        if key in m and m[key].get('verified'): 
            if m[key]['url']==md['url']: continue
        m[key]={'unit':u,'take':t,'generation_id':gid,'url':md['url'],'status_file':f}
# verify content = local file
for key,v in m.items():
    if v.get('verified') is not None and v.get('checked_url')==v['url']: continue
    tmp='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/sel/hak/_work-hak-1/dl.tmp'
    p=subprocess.run(['curl','-sS','-f','-o',tmp,v['url']],capture_output=True,text=True)
    loc=R+'/raw/hak/%s/%s.mp3'%(v['unit'],v['take'])
    if p.returncode!=0: v['verified']=False; v['err']=p.stderr[-200:]; print(key,'DL FAIL',p.stderr[-200:]); continue
    a=hashlib.sha256(open(tmp,'rb').read()).hexdigest(); b=hashlib.sha256(open(loc,'rb').read()).hexdigest()
    v['verified']=(a==b); v['sha256']=a; v['bytes']=os.path.getsize(tmp); v['checked_url']=v['url']
    print(key, 'SAME' if a==b else 'DIFF', v['bytes'])
json.dump(m,open(W+'/urls.json','w'),indent=1)
