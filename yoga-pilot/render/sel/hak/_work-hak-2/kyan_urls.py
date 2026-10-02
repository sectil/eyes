import json,hashlib,subprocess,sys
R='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render'
W=R+'/sel/hak/_work-hak-2'
m=json.load(open(W+'/urls.json'))
for take,url in [('t2',sys.argv[1]),('t3',sys.argv[2])]:
    p=subprocess.run(['curl','-sS','-f','-o',W+'/dl.tmp',url],capture_output=True,text=True)
    a=hashlib.sha256(open(W+'/dl.tmp','rb').read()).hexdigest(); b=hashlib.sha256(open(R+'/raw/hak/k.yan/%s.mp3'%take,'rb').read()).hexdigest()
    m['k.yan/'+take]={'unit':'k.yan','take':take,'url':url,'verified':a==b,'sha256':a,'checked_url':url}
    print(take,p.returncode,'SAME' if a==b else 'DIFF')
json.dump(m,open(W+'/urls.json','w'),indent=1)
