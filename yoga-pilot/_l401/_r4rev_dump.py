import sys, timing
L = timing.load()
def mmss(s):
    s=int(round(s)); return '%d:%02d'%(s//60,s%60)
for T in [int(a) for a in sys.argv[1:]]:
    p = timing.plan(L, T, 5.6, 'hi')
    print('=== %d dk 5.6 hi  mode=%s f=%.2f total=%.1f' % (T, p['mode'], p['f'], p['total']))
    for ev in p['events']:
        c=ev['clip']
        txt = c.get('text','')
        subs = ev['subs']
        s = ' | '.join('%s(%.1f)'%(x['text'][:60], x.get('sgap',0)) for x in subs) if len(subs)>1 else txt
        print('%s %-8s %-14s %-4s %5.1fs +%5.1f  %s' % (mmss(ev['start']), ev['block'], c['id'], c.get('phase','')[:4], ev['speech'], ev['gap'], s))
