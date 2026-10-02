import json,sys,subprocess
W='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/sel/hak/_work-hak-2'
idx=json.load(open(W+'/take_index.json'))
for a in sys.argv[1:]:
    u,t=a.split('/')
    v=idx[u][t]
    p=subprocess.run([sys.executable,W+'/ledger_hak2.py','scribe',u,t,str(v['duration_secs']),v['generation_id']],capture_output=True,text=True)
    print(a,p.returncode,p.stdout.strip())
    if p.returncode!=0: sys.exit(p.returncode)
