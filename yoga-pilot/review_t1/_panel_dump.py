import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
for T,rate,prof in [(900,5.6,'hi'),(1800,5.6,'hi'),(1800,6.6,'lo'),(1800,5.2,'hi')]:
    p=timing.plan(L,T,rate,prof)
    print('=====',T/60,rate,prof,p['mode'],round(p['f'],2),p['sel'])
    for e in p['events']:
        s=e['start'];print(f"{int(s//60)}:{s%60:04.1f} {e['block']:7} {e['clip']['id']:14} d={e['dur']:4.1f} gap={e['gap']:5.1f} | {e['clip']['text']}")
