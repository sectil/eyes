import sys; from bagimsiz import *
rate=float(sys.argv[1]); m=int(sys.argv[2]); prof=sys.argv[3]
p=myplan(m*60,rate,prof)
print('lead %.1f f=%.2f %s'%(p['lead'],p['f'],p['mode']))
for e in p['ev']:
    c=e['c']; mm=int(e['s']//60)
    print(f"{mm:2d}:{e['s']%60:04.1f} {e['b']:7} {e['id']:15} d={e['d']:5.1f} gap={e['gap']:5.1f} [{e['g']['min']:.1f}/{e['g']['pref']:.1f}/{e['g']['max']:.1f}] {c['text'][:70]}")
