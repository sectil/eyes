"""Independent round-4 reviewer checker. Uses timing.plan() ONLY to obtain the clip selection per case; every
duration/gap/total/density number is recomputed here from ders2.lesson.json's own timingModel values."""
import json, re, random, sys, statistics
sys.path.insert(0, '.')
import timing as TM

L = json.load(open('ders2.lesson.json', encoding='utf-8'))
TMD = L['timingModel']
V = set('aeıioöuüâîûAEIİOÖUÜÂÎÛ')
def syl(t): return sum(ch in V for ch in t)

# ---------- 1. syllable / sentence counts everywhere ----------
bad = []
def sents(t):
    return [s for s in re.split(r'[.!?]+(?:["”’])?\s+', t.strip()) if re.search(r'\w', s)]
def chk(cid, label, text, n):
    if syl(text) != n: bad.append('%s %s: json %s != code %s | %s' % (cid, label, n, syl(text), text[:60]))
allclips = {}
for b in L['blocks']:
    for c in b['clips']:
        allclips[c['id']] = (b['id'], c)
for ex in L['extras'].values():
    for c in ex['clips']: allclips.setdefault(c['id'], (ex['id'], c))
    for pre in (ex.get('prefixByActiveBlock') or {}).values():
        for c in pre: allclips.setdefault(c['id'], (ex['id'], c))
n_forms = 0
for cid, (bid, c) in allclips.items():
    chk(cid, 'text', c['text'], c['syllables']); n_forms += 1
    if not c.get('carrier') and c.get('sentences') is not None and len(sents(c['text'])) != c['sentences']:
        bad.append('%s sentences json %s != code %s' % (cid, c['sentences'], len(sents(c['text']))))
    for a in c.get('alternates') or []: chk(cid, 'alt', a['text'], a['syllables']); n_forms += 1
    for s in (c.get('scenes') or {}).values(): chk(cid, 'scene', s['text'], s['syllables']); n_forms += 1
    if c.get('short'):
        sh = c['short']; n_forms += 1
        if 'syllables' in sh: chk(cid, 'short', sh['text'], sh['syllables'])
    if c.get('panelFallback') and 'syllables' in c['panelFallback']:
        chk(cid, 'fallback', c['panelFallback']['text'], c['panelFallback']['syllables']); n_forms += 1
    for sc in c.get('subclips') or []:
        chk(cid, 'subclip%d' % sc['index'], sc['text'], sc['syllables']); n_forms += 1
    if c.get('subclips'):
        joined = ' '.join(sc['text'] for sc in c['subclips'])
        if c.get('breathPair'):
            joined = joined.replace(', ', ' ', 1)
        if joined.replace('… ', ' ') != c['text'].replace(', ', ' ') and joined != c['text']:
            bad.append('%s subclips joined != text: %r vs %r' % (cid, joined, c['text']))
for car in L['carriers']:
    chk(car['id'], 'carrier', car['text'], car['syllables']); n_forms += 1
    items = [allclips[i][1] for i in car['items']]
    if sum(c['syllables'] for c in items) + syl(car.get('lead', '')) != car['syllables']:
        bad.append('carrier %s items sum mismatch' % car['id'])
print('== syllable/sentence audit: %d text forms checked, %d mismatches' % (n_forms, len(bad)))
for x in bad: print('   ', x)

# ---------- 2. my own duration model from JSON timingModel ----------
EDGE, EDGEM, FLOOR = TMD['edgeSec'], TMD['edgeMicroSec'], TMD['gapFloorSec']
PROF = TMD['pauseProfilesSec']; SCALE = {float(k): v for k, v in TMD['pauseScaleAtRate'].items()}
SG = L['sentenceGapByPhase']; SGB = L['sentenceGapBreathPair']
def pauses(t, pr):
    t = re.sub(r'[\s"”’.!?…,;:]+$', '', t.strip()).replace('...', '…')
    ne = t.count('…'); t2 = t.replace('…', ' ')
    return ne * pr['ell'] + len(re.findall(r'[.!?]', t2)) * pr['sent'] + t2.count(',') * pr['comma'] + (t2.count(';') + t2.count(':') + t2.count('—')) * pr['semi']
def parts(c):
    if c.get('carrier'): return [c['text']]
    if c.get('breathPair') and ', ' in c['text']:
        a, b = c['text'].split(', ', 1); return [a + ',', b]
    out, s = [], 0
    for m in re.finditer(r'[.!?]+["”’]?(?=\s+\S)', c['text']):
        out.append(c['text'][s:m.end()].strip()); s = m.end()
    out.append(c['text'][s:].strip()); return [x for x in out if re.search(r'\w', x)]
def prof(name, rate): return {k: v * SCALE[rate] for k, v in PROF[name].items()}
def durs(c, rate, pr):
    if c.get('carrier'): return [c['syllables'] / rate + EDGEM + pauses(c['text'], pr)]
    return [syl(p) / rate + EDGE + pauses(p, pr) for p in parts(c)]
def sgaps(c):
    n = len(parts(c)) - 1
    if n <= 0: return []
    g = c.get('sentenceGap') or (SGB if c.get('breathPair') else SG[c['phase']])
    return [g] * n
def gapb(c, rate, pr):
    per = c.get('onsetPeriod')
    if not per: return c['gapAfter']
    d = sum(durs(c, rate, pr)); fl = c.get('gapFloor', FLOOR)
    return {k: max(fl, per[k] - d) for k in ('min', 'pref', 'max')}

def my_timeline(p):
    """Rebuild the timeline from p's clip sequence + p['mode'], p['f'] only (no other numbers reused)."""
    rate, pr = p['rate'], prof(p['prof'], p['rate'])
    mode, f = p['mode'], p['f']
    def gv(g):
        if mode == 'min→pref': return g['min'] + f * (g['pref'] - g['min'])
        return g['pref'] + f * (g['max'] - g['pref'])
    t = gv(L['leadIn']); rows = []
    for ev in p['events']:
        c = ev['clip']; ds = durs(c, rate, pr); sg = sgaps(c); spans = []
        for i, d in enumerate(ds):
            spans.append((t, t + d, c['syllables'] if c.get('carrier') else syl(parts(c)[i]))); t += d
            if i < len(sg):
                g = gv(sg[i]); spans[-1] = spans[-1] + (g,); t += g
        gb = gapb(c, rate, pr); g = gv(gb)
        rows.append({'id': c['id'], 'block': ev['block'], 'phase': c['phase'], 'spans': spans, 'speech': sum(ds), 'gap': g, 'gb': gb, 'start': spans[0][0], 'end': t})
        t += g
    return rows, t

def my_checks(p, T):
    rows, tot = my_timeline(p)
    fails = []
    if abs(tot - T) > 1.0: fails.append('my total %.2f != T %d' % (tot, T))
    if abs(tot - p['total']) > 0.05: fails.append('my total %.2f != timing.py total %.2f' % (tot, p['total']))
    # per-event agreement
    for r, ev in zip(rows, p['events']):
        if abs(r['gap'] - ev['gap']) > 0.02 or abs(r['speech'] - ev['speech']) > 0.02 or abs(r['start'] - ev['start']) > 0.05:
            fails.append('event %s disagrees: gap %.2f/%.2f speech %.2f/%.2f start %.1f/%.1f' % (r['id'], r['gap'], ev['gap'], r['speech'], ev['speech'], r['start'], ev['start']))
            break
    for r in rows:
        if not (r['gb']['min'] - 1e-6 <= r['gap'] <= r['gb']['max'] + 1e-6): fails.append('gap out of bounds %s %.2f' % (r['id'], r['gap']))
        if r['speech'] > 15.0: fails.append('unit speech > 15 s: %s %.1f' % (r['id'], r['speech']))
        for s in r['spans']:
            if len(s) == 4 and r['phase'] == 'Derin' and s[3] < 1.0 - 1e-6: fails.append('Derin sentence gap < 1 s: %s' % r['id'])
    # two long silences back to back (>= 60 s)
    gaps = [r['gap'] for r in rows]
    for a, b in zip(gaps, gaps[1:]):
        if a >= 60 and b >= 60: fails.append('two >= 60 s silences back to back')
    # any silence >= 60 s must be a declared window
    for r in rows:
        if r['gap'] >= 60 and not allclips[r['id']][1].get('window'): fails.append('undeclared >= 60 s silence after %s' % r['id'])
    # closing >= 45 s (K block from first K clip start to end)
    kst = next(r['start'] for r in rows if r['block'] == 'K')
    if tot - kst < 45: fails.append('closing %.0f s < 45' % (tot - kst))
    # density windows (1 s step) using my spans
    spans = [s for r in rows for s in r['spans']]
    worst_syl = worst_frac = 0; w = 0.0
    while w + 60 <= tot + 1e-6:
        sy = sp = 0
        for s in spans:
            ov = max(0, min(w + 60, s[1]) - max(w, s[0]))
            if ov > 0: sy += s[2] * ov / (s[1] - s[0]); sp += ov
        worst_syl, worst_frac = max(worst_syl, sy), max(worst_frac, sp / 60); w += 1
    if worst_syl > 150 or worst_frac > 0.60: fails.append('density %.0f syl / %.2f' % (worst_syl, worst_frac))
    # required/optional logic
    ids = [r['id'] for r in rows]
    for cid in ids:
        c = allclips[cid][1]
        for rq in c.get('requires', []):
            if rq not in ids: fails.append('%s plays without required %s' % (cid, rq))
    for bid in set(r['block'] for r in rows):
        blk = next(b for b in L['blocks'] if b['id'] == bid)
        for c in blk['clips']:
            if c['tier'] == 'required' and (c.get('minTarget') is None or T >= c['minTarget']) and c['id'] not in ids:
                fails.append('required %s missing from block %s' % (c['id'], bid))
        groups = {}
        for c in blk['clips']:
            if c['tier'] != 'required': groups.setdefault(c.get('fillGroup') or c['id'], []).append(c['id'] in ids)
        for g, v in groups.items():
            if any(v) and not all(v): fails.append('fillGroup %s/%s partially played' % (bid, g))
    # extension only after all optionals of the plan's blocks that are rank-lower?  (prefix closure over ranks)
    inc_items = []
    for b in L['blocks']:
        if b['kind'] == 'core' and b['priority'] > 1: inc_items.append((b['entryRank'], 0, 'B', b['id'], b['id'] in p['sel']))
        if b['kind'] in ('core', 'arrival', 'closing'):
            seen = {}
            for c in b['clips']:
                if c['tier'] in ('optional', 'extension'):
                    k = c.get('fillGroup') or c['id']; seen.setdefault(k, (c['fillRank'], c['id'] in ids, b['id']))
            for k, (rk, inn, bb) in seen.items(): inc_items.append((rk, 1, 'G', bb + '/' + k, inn))
    inc_items.sort(key=lambda x: (x[0], x[1]))
    first_out = next((i for i, x in enumerate(inc_items) if not x[4]), len(inc_items))
    later_in = [x for x in inc_items[first_out:] if x[4]]
    if later_in: fails.append('prefix closure broken: first excluded %s, later included %s' % (inc_items[first_out][3], [x[3] for x in later_in][:4]))
    # anchors
    bd = {}
    for r in rows: bd[r['block']] = bd.get(r['block'], 0) + (r['end'] - r['start']) + r['gap']
    sp = {}
    for r in rows: sp[r['block']] = sp.get(r['block'], 0) + r['speech']
    return fails, rows, tot, bd, sp, worst_syl, worst_frac

random.seed(20260929)
print('\n== independent timeline rebuild: 3 random minutes per rate, both profiles ==')
allfail = 0
for rate in TM.RATES:
    for m in sorted(random.sample(range(5, 31), 3)):
        for pn in ('lo', 'hi'):
            p = TM.plan(L, m * 60, rate, pn)
            fails, rows, tot, bd, sp, ws, wf = my_checks(p, m * 60)
            allfail += len(fails)
            speech = sum(r['speech'] for r in rows)
            print('  %.1f %2d %s: total %.1f mode %s f=%.2f speech %.1f%% densest60 %.0f syl/%.2f  K=%.0fs  %s' % (rate, m, pn, tot, p['mode'], p['f'], 100 * speech / tot, ws, wf, tot - next(r['start'] for r in rows if r['block'] == 'K'), 'OK' if not fails else fails))
print('  independent failures:', allfail)

# ---------- 3. subset principle + prefix closure over ALL minutes, all rates ----------
print('\n== subset (plan(T) ⊆ plan(T+1)) and prefix closure over all 78 cases ==')
sub_bad = 0; pc_bad = 0
for rate in TM.RATES:
    for pn in ('lo', 'hi'):
        prev = None
        for m in range(5, 31):
            p = TM.plan(L, m * 60, rate, pn)
            ids = [ev['clip']['id'] for ev in p['events']]
            if prev is not None and not set(prev) <= set(ids): sub_bad += 1; print('  subset broken', rate, pn, m, sorted(set(prev) - set(ids)))
            # order preserved too? (subset as a subsequence)
            if prev is not None:
                it = iter(ids)
                if not all(x in it for x in prev): print('  order changed', rate, pn, m)
            fails, *_ = my_checks(p, m * 60)
            pc = [f for f in fails if 'prefix' in f or 'fillGroup' in f or 'requires' in f or 'required' in f]
            if pc: pc_bad += 1; print('  ', rate, pn, m, pc)
            prev = ids
print('  subset violations:', sub_bad, ' logic violations:', pc_bad)

# ---------- 4. 30-min anchors: speech share per block, per phase ----------
print('\n== 30 min: block seconds / speech share (my arithmetic) ==')
for rate in TM.RATES:
    for pn in ('lo', 'hi'):
        p = TM.plan(L, 1800, rate, pn)
        fails, rows, tot, bd, sp, ws, wf = my_checks(p, 1800)
        ph = {}; phs = {}
        for r in rows:
            ph[r['phase']] = ph.get(r['phase'], 0) + (r['end'] - r['start']) + r['gap']; phs[r['phase']] = phs.get(r['phase'], 0) + r['speech']
        print('  %.1f %s: ' % (rate, pn) + ' '.join('%s %.0fs/%.0f%%' % (b, bd[b], 100 * sp[b] / bd[b]) for b in bd) )
        print('        phases: ' + ' '.join('%s %.0fs/%.0f%%' % (k, ph[k], 100 * phs[k] / ph[k]) for k in ph) + '  total speech %.1f%%' % (100 * sum(sp.values()) / tot))
        # longest run of consecutive low-speech minutes
        spans = [s for r in rows for s in r['spans']]
        mins = []
        for k in range(30):
            a, b = k * 60, (k + 1) * 60
            mins.append(sum(max(0, min(b, s[1]) - max(a, s[0])) for s in spans) / 60)
        print('        per-minute speech share: ' + ' '.join('%2.0f' % (100 * x) for x in mins))

# ---------- 5. unit speech durations at every rate (max) + unit incl. sentence gaps ----------
print('\n== longest units ==')
worst = []
for cid, (bid, c) in allclips.items():
    for rate in TM.RATES:
        for pn in ('lo', 'hi'):
            pr = prof(pn, rate); d = sum(durs(c, rate, pr)); u = d + sum(g['pref'] for g in sgaps(c))
            worst.append((d, u, cid, rate, pn))
worst.sort(reverse=True)
for d, u, cid, rate, pn in worst[:6]: print('  %s: speech %.1f s, with sentence gaps %.1f s (%.1f %s)' % (cid, d, u, rate, pn))
