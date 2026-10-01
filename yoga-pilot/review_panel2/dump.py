import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing as tm
L=tm.load()
T=int(sys.argv[1]); rate=float(sys.argv[2]); prof=sys.argv[3]
p=tm.plan(L,T*60,rate,prof)
print(T,rate,prof,p['mode'],round(p['f'],2),'total',round(p['total'],1))
for ev in p['events']:
    s=ev['start']; c=ev['clip']
    print(f"{int(s//60)}:{s%60:05.2f} {ev['block']:7s} {c['id']:16s} d={ev['dur']:4.1f} gap={ev['gap']:5.1f} | {c['text']}")
