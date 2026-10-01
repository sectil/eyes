import sys, os, json
P='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot'
sys.path.insert(0, P); os.chdir(P)
import timing
L = timing.load()
for a in sys.argv[1:]:
    T, rate, prof = a.split(',')
    p = timing.plan(L, int(T)*60, float(rate), prof)
    print('=== %s dk %s %s mode=%s f=%.2f speech=%.1f gaps min/pref/max=%.1f/%.1f/%.1f slack(min)=%.1f' % (
        T, rate, prof, p['mode'], p['f'], p['speech'], p['gaps']['min'], p['gaps']['pref'], p['gaps']['max'],
        int(T)*60 - p['speech'] - p['gaps']['min']))
    bd = timing.block_durations(p)
    print('   blocks:', ', '.join('%s %.1f' % kv for kv in bd.items()))
    print('   phase means:', {k: round(v,1) for k,v in timing.phase_sentence_means(p).items()})
    for ev in p['events']:
        s = ev['start']; m = int(s//60)
        print('%2d:%04.1f %-7s %-16s d=%4.1f g=%5.1f [%4.1f] ab=%d | %s' % (m, s-60*m, ev['block'], ev['clip']['id'], ev['dur'], ev['gap'], ev['gd']['min'], timing.n_abil(ev['clip']['text']), ev['clip']['text']))
