import sys
sys.path.insert(0,'/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
import timing
L=timing.load()
for cc in (0.5,0.75):
    timing.COMPRESS_CAP_ON_ENTRY=cc
    res=timing.run_all(L); bad=[(k,pr,c[pr][1][:1]) for k,c in res.items() for pr in('lo','hi') if c[pr][1]]
    print(cc,'fails',len(bad),bad[:3])
    for r in timing.RATES:
        row=[]
        for pn in ('lo','hi'):
            for m in (11,12,13):
                p=timing.plan(L,m*60,r,pn); row.append('%s%d:%s%.2f%s'%(pn,m,'-' if p['mode']=='min→pref' else '+',(1-p['f']) if p['mode']=='min→pref' else p['f'],'C4' if 'C4' in p['sel'] else ''))
        print('  ',r,' '.join(row))
