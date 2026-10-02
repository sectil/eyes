import sys,os,statistics as st
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing as tm
L=tm.load()
for T in (5,12,30):
  p=tm.plan(L,T*60,5.6,'hi')
  ph={}
  for ev in p['events']:
    c=ev['clip']; t=c['text']

    if '…' in t: continue
    phase=c['phase']
    ph.setdefault(phase,[]).append((c['syllables']/max(1,c['sentences']), ev['gap']))
  print(T, {k:(len(v), round(st.mean(s for s,_ in v),1), round(st.mean(g for _,g in v),1)) for k,v in ph.items()})
