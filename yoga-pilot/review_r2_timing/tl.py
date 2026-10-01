import sys; sys.argv=['x']
exec(open('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/review_r2_timing/indep.py').read().split('random.seed')[0])
import sys
rate=float(sys.stdin.readline()); m=int(sys.stdin.readline()); prof=sys.stdin.readline().strip()
p=myplan(m*60,rate,prof)
def mmss(x): return '%d:%04.1f'%(x//60,x%60)
for e in p['ev']:
    print('%s %-5s %-14s %5.1fs gap %5.1f | %s'%(mmss(e['s']),e['b'],e['id'],e['e']-e['s'],e['gap'],e['c']['text'][:80]))
print('total',p['total'],'f',p['f'],p['mode'])
