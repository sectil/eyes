import json, sys
sys.path.insert(0, '.')
import timing as T
L = T.load('ders2.lesson.json')
Ls = T.with_scene(L, 'orman')
meas = json.load(open('measured_durs.json'))
RATIO = {'nes': 1.109, 'hak': 1.055}
orig_sub_durs = T.sub_durs

def make_patch(v):
    def sd(c, rate, prof):
        m = meas[v].get(c['id'])
        base = orig_sub_durs(c, rate, prof)
        if m and len(m) == len(base) and not c.get('shortForm'):
            return m
        return [x * RATIO[v] for x in base]
    return sd

def blocks(p):
    out = {}
    for e in p['events']:
        b = e['block']
        out[b] = out.get(b, 0) + e['dur'] + e['gap']
    return out

def summary(p, label):
    sp = p['speech']
    syl = sum(s['syl'] for e in p['events'] for s in e['subs'])
    bd = blocks(p)
    print('%-22s T=%4d status=%-9s mode=%-8s f=%.2f clips=%3d syl=%4d speech=%.1f (%.0f%%) min=%.1f slack_min=%.1f sel=%s' % (
        label, p['T'], p['status'], p['mode'], p['f'], len(p['events']), syl, sp, 100 * sp / p['T'],
        sp + p['gaps']['min'], p['T'] - sp - p['gaps']['min'], p['sel']))
    print('    blocks:', ', '.join('%s %d:%02d' % (b, int(v // 60), round(v % 60)) for b, v in bd.items()))

for label, patch in (('model 5.6hi', None), ('olculen nes', make_patch('nes')), ('olculen hak', make_patch('hak'))):
    T.sub_durs = patch or orig_sub_durs
    T._SUB_CACHE.clear()
    for tgt in (180, 240, 300):
        p = T.plan(Ls, tgt, 5.6, 'hi')
        summary(p, label)
    # absolute minimum content: A + K required only (no core)
    A = next(b for b in Ls['blocks'] if b['kind'] == 'arrival')
    K = next(b for b in Ls['blocks'] if b['kind'] == 'closing')
    for sel in ([], ['C1'], ['N1', 'C1'], ['N1', 'C1', 'N2']):
        seq = T.assemble(Ls, 180, A, K, sel, set())
        S, g = T.totals(seq, Ls, 5.6, T.profile('hi', 5.6))
        print('    min toplam (T=180 kısa biçimler) sel=%-18s konuşma %.1f + min sessizlik %.1f = %.1f sn' % (sel, S, g['min'], S + g['min']))
T.sub_durs = orig_sub_durs
