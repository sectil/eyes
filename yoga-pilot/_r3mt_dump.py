import sys; sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing as t
L=t.load()
T=int(sys.argv[1]); rate=float(sys.argv[2]); prof=sys.argv[3]
p=t.plan(L,T*60,rate,prof)
for e in p['events']:
    c=e['clip']
    s=int(e['start']); print(f"{s//60:2d}:{s%60:02d} {e['block']:7s} {c['id']:16s} d={e['dur']:4.1f} g={e['gap']:5.1f} | {c['text']}")
print(p['total'], p['mode'], p['f'])
