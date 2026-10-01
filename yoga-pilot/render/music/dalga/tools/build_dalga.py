"""Dalga basımlarından teslim dosyaları (SPEC §5). Girdi: work/raw/<ad>.ch{0,1}.f32 + .meta.json (render_dalga.mjs).
Çıktı: music/dalga/dalga_*.wav (44,1 kHz, 2 kanal, PCM_24) + work/build_out.json (make_manifest.py okur).
İşlem: bar ızgarasından kesim → aile DC'si düşülür → aile parçaları 8 sn eşit güçlü geçişle birleşir → tek aile
kazancı (−24 LUFS; PLAN §D.3) → gerçek tepe ≤ −1,5 dBTP → uçlarda 5 ms yükseltilmiş kosinüs. EQ yok.
Eşit güç: g = [cos θ, sin θ] / sqrt(1 + ρ(t)·sin 2θ), θ = π/2·u. ρ = iki parçanın geçişteki korelasyonu (1 sn
pencere, 0,25 sn adım, yumuşatılmış). ρ = 0'da tam sin/cos; toplam güç her ρ'da sabit. Neden: Dalga'da pad ve bas
notası tohumdan bağımsız ve aynı ızgarada → iki tohum geçişte faz uyumlu (ρ ≈ 0,9); düz sin/cos'un ölçülen tümseği
build_out.json'da (seamEvidence)."""
import json, os, sys, hashlib, collections
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
sys.path.insert(0, os.path.dirname(__file__))
from analyze_music import analyze, kweight, win_loudness

D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = os.path.join(D, 'work')
RAW = os.path.join(W, 'raw')
SR, BAR, XF = 44100, 4.0, 8.0
N = int(XF * SR)
TARGET, TPMAX = -24.0, -1.5
jobs = {j['name']: j for j in json.load(open(os.path.join(W, 'jobs.json')))}
meter = pyln.Meter(SR)

def load(name):
    m = json.load(open(os.path.join(RAW, f'{name}.meta.json')))
    x = np.stack([np.fromfile(os.path.join(RAW, f'{name}.ch{c}.f32'), dtype='<f4') for c in (0, 1)], 1).astype(np.float64)
    j = m['job']
    L = int(round((j['endBar'] - j['startBar']) * BAR * SR))
    s = m['outStartSample']
    seg = x[s:s + L]
    assert len(seg) == L, (name, len(seg), L)
    rest = x[s + L:]
    info = {'rawLufs': round(float(meter.integrated_loudness(seg)), 2),
            'last1sRmsDbfsRaw': round(float(20 * np.log10(np.sqrt((seg[-SR:] ** 2).mean()) + 1e-12)), 1)}
    if len(rest):
        info['cutResidualAfterEndRmsDbfsRaw'] = round(float(20 * np.log10(np.sqrt((rest ** 2).mean()) + 1e-12)), 1)
    return seg, m, info

def local_rho(a, b):
    W1, H = SR, SR // 4
    st = np.arange(0, len(a) - W1 + 1, H)
    r = np.array([(a[s:s + W1] * b[s:s + W1]).sum() / np.sqrt((a[s:s + W1] ** 2).sum() * (b[s:s + W1] ** 2).sum() + 1e-30) for s in st])
    tc = st + W1 // 2
    rho = np.interp(np.arange(len(a)), tc, r)
    k = np.hanning(SR // 2); k /= k.sum()
    rho = np.convolve(np.pad(rho, (len(k) // 2, len(k) - len(k) // 2 - 1), mode='edge'), k, mode='valid')
    return np.clip(rho, -0.99, 1.0), r

def gains(u, rho):
    th = np.pi / 2 * u
    c = 1 / np.sqrt(1 + rho * np.sin(2 * th))
    return np.cos(th) * c, np.sin(th) * c

def xfade_join(parts, law='cp'):
    out = parts[0].copy()
    u = (np.arange(N) + 0.5) / N
    seams, info = [], []
    for p in parts[1:]:
        A, B = out[-N:], p[:N]
        rho, rwin = local_rho(A.sum(1), B.sum(1))
        if law == 'sincos':
            rho = np.zeros(N)
        ga, gb = gains(u, rho)
        seams.append(round((len(out) - N) / SR, 4))
        info.append({'rhoGlobal': round(float((A * B).sum() / np.sqrt((A ** 2).sum() * (B ** 2).sum())), 3),
                     'rho1sMin': round(float(rwin.min()), 3), 'rho1sMax': round(float(rwin.max()), 3)})
        out[-N:] = A * ga[:, None] + B * gb[:, None]
        out = np.concatenate([out, p[N:]])
    return out, seams, info

def seam_bump(J, seams):
    """ek geçişinin 400 ms yüksekliği − önceki/sonraki 16 sn; aynı blok evresindeki (±24·k sn) konumların dağılımıyla"""
    yk = kweight(J, SR)
    tm, _, ms = win_loudness(yk, SR, 0.4, 0.1)
    def delta(a):
        i = (tm >= a) & (tm + 0.4 <= a + XF)
        pr = (tm >= a - 16) & (tm + 0.4 <= a)
        po = (tm >= a + XF) & (tm + 0.4 <= a + XF + 16)
        if not (i.sum() and pr.sum() and po.sum()):
            return None
        db = lambda m: 10 * np.log10(ms[m].mean() + 1e-20)
        return db(i) - 0.5 * (db(pr) + db(po))
    T = len(J) / SR
    cand = sorted({round(s + 24 * k, 4) for s in seams for k in range(-60, 60)})
    base = [d for d in (delta(c) for c in cand if 16 <= c <= T - XF - 16 and all(abs(c - s) > 1e-3 for s in seams)) if d is not None]
    med = float(np.median(base))
    return [{'xfadeStartSec': s, 'deltaDb': round(delta(s), 2), 'minusBaselineMedianDb': round(delta(s) - med, 2)} for s in seams], {'n': len(base), 'median': round(med, 2), 'p95': round(float(np.percentile(base, 95)), 2), 'max': round(float(max(base)), 2)}

def edge(x, ms=5):
    n = int(SR * ms / 1000)
    w = 0.5 * (1 - np.cos(np.pi * (np.arange(n) + 0.5) / n))
    y = x.copy()
    y[:n] *= w[:, None]
    y[-n:] *= w[::-1][:, None]
    return y

def tp(x):
    return float(20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12))

def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()

def ev_stats(meta):
    ev = meta['events']
    j = meta['job']
    dur_min = (j['endBar'] - j['startBar']) * BAR / 60
    inside = [e for e in ev if e['t'] >= 0]
    cnt = collections.Counter(e['r'] for e in inside)
    insts = collections.Counter(e['inst'] for e in ev)
    sig = collections.defaultdict(list)
    for e in inside:
        if e['r'] in ('up', 'mel', 'gtr'):
            sig[e['bar']].append((e['r'], e['i'] % 8, e['midi']))
    mids = [e['midi'] for e in ev if e['midi'] is not None] + [n for e in ev if e['notes'] for n in e['notes']]
    last = max([e['t'] for e in inside], default=None)
    ts = sorted({round(e['t'], 3) for e in inside})
    L = (j['endBar'] - j['startBar']) * BAR
    gaps = np.diff([0.0] + ts + [L]) if ts else np.array([L])
    return {'eventsInFile': len(inside), 'perMinuteByRole': {k: round(v / dur_min, 2) for k, v in sorted(cnt.items())},
            'instCountsAll': dict(insts), 'drumEvents': insts.get('kick', 0) + insts.get('shaker', 0) + insts.get('bass', 0),
            'bars': j['endBar'] - j['startBar'], 'silentBars': sum(1 for b in range(j['startBar'], j['endBar']) if b % 6 == 5),
            'midiRange': [min(mids), max(mids)], 'firstEventSec': ts[0] if ts else None, 'lastEventSec': last,
            'maxGapBetweenOnsetsSec': round(float(np.diff(ts).max()), 3) if len(ts) > 1 else None, 'maxGapInclEdgesSec': round(float(gaps.max()), 3), '_sig': {b: tuple(sorted(v)) for b, v in sig.items()}}

segs, metas, cut = {}, {}, {}
for n in jobs:
    if os.path.exists(os.path.join(RAW, f'{n}.meta.json')):
        segs[n], metas[n], cut[n] = load(n)

def seg_offsets(parts):
    off, t = [], 0.0
    for q in parts:
        off.append(t)
        j = jobs[q]
        t += (j['endBar'] - j['startBar']) * BAR - XF
    return off

files = []
def add(fid, rel, x, family, role, parts, gain_db, seams=(), note=None):
    y = edge(x * 10 ** (gain_db / 20))
    t = tp(y)
    p = os.path.join(D, rel)
    sf.write(p, y.astype(np.float32), SR, subtype='PCM_24')
    onsets, silent = [], []
    for q, o in zip(parts, seg_offsets(parts)):
        j = jobs[q]
        onsets += [o + e['t'] for e in metas[q]['events'] if e['t'] >= -0.05]
        silent += [(o + (b - j['startBar']) * BAR, o + (b - j['startBar'] + 1) * BAR) for b in range(j['startBar'], j['endBar']) if b % 6 == 5]
    a = analyze(p, seams, onsets=onsets, phase_period=24.0, exclude=silent)
    if 'excludingIntervals' in a['shortTerm3s']:
        a['shortTerm3s']['excludingIntervals']['what'] = "3 s windows overlapping the engine's designed silent bars (every 6th 4 s bar) excluded"
    j0, j1 = jobs[parts[0]], jobs[parts[-1]]
    ev = [ev_stats(metas[q]) for q in parts]
    rec = {'id': fid, 'path': p, 'family': family, 'role': role, 'parts': parts, 'seeds': [jobs[q]['seed'] for q in parts],
           'transposeSemitones': j0['transpose'], 'gridBar0': j0['startBar'], 'gridBarEnd': j1['endBar'],
           'harmonicPhaseAtStart': j0['startBar'] % 24, 'gainDb': round(gain_db, 2), 'truePeakDbtp': round(t, 2), 'analysis': a,
           'sha256': sha(p), 'events': [{k: v for k, v in e.items() if k != '_sig'} for e in ev], 'rawInfo': [cut[q] for q in parts]}
    if note:
        rec['note'] = note
    files.append(rec)
    print('yazıldı', rel, round(a['durationSec'], 1), 'sn', a['lufsIntegrated'], 'LUFS', flush=True)
    return rec

fam, evidence = {}, {}
for key, names, fid in (('varis-derinlesme', ['vd1', 'vd2', 'vd3'], 'vd'), ('derin', ['derin1', 'derin2', 'derin3'], 'derin')):
    names = [n for n in names if n in segs]
    if not names:
        continue
    dc = np.concatenate([segs[n] for n in names]).mean(0)
    for n in names:
        segs[n] = segs[n] - dc
    J, seams, sinfo = xfade_join([segs[n] for n in names], 'cp')
    Jsc, _, _ = xfade_join([segs[n] for n in names], 'sincos')
    b_cp, base_cp = seam_bump(J, seams)
    b_sc, base_sc = seam_bump(Jsc, seams)
    evidence[key] = {'usedLaw': {'rows': b_cp, 'baseline': base_cp}, 'plainSinCos': {'rows': b_sc, 'baseline': base_sc}, 'overlapCorrelation': sinfo}
    g = TARGET - meter.integrated_loudness(J)
    g = min(g, g + (TPMAX - 0.1 - tp(J * 10 ** (g / 20))))
    fam[key] = {'gainDb': g, 'seams': seams, 'dcRemoved': [float(f'{v:.2e}') for v in dc]}
    for n in names:
        add(f'dalga.{n}', f'dalga_{n}.wav', segs[n], key, 'segment', [n], g)
    add(f'dalga.{fid}_family', f'dalga_{fid}_family.wav', J, key, 'family-joined', names, g, seams)
for n, fk, role in (('varis_x', 'varis-aday', 'first-impression Varış candidate (starts on E-flat maj7; ends with bars 22,23 mod 24 so it crossfades into any vd segment)'),
                    ('kapanis', 'kapanis', 'closing: 8 s crossfade-in bars (phase 4,5), E-flat maj7 final chord at 176 s held 7 s, natural decay')):
    if n in segs:
        segs[n] = segs[n] - segs[n].mean(0)
        add(f'dalga.{n}', f'dalga_{n}.wav', segs[n], fk, role, [n], TARGET - meter.integrated_loudness(segs[n]))
if 'imge' in segs and 'derin' in fam:
    segs['imge'] = segs['imge'] - segs['imge'].mean(0)
    add('dalga.imge', 'dalga_imge.wav', segs['imge'], 'imge', 'layer: sparse engine piano, E-flat major pentatonic', ['imge'], fam['derin']['gainDb'],
        note='gain = Derin family gain (keeps the engine-native balance of melody vs. bed); its integrated LUFS is therefore below -24')

sigs = {n: ev_stats(metas[n])['_sig'] for n in segs if not n.startswith('imge')}
def uniq(names):
    allb = [(n, b, s) for n in names for b, s in sigs[n].items() if s]
    same = tot = 0
    for i in range(len(allb)):
        for k in range(i + 1, len(allb)):
            if allb[i][0] != allb[k][0] and allb[i][1] % 24 == allb[k][1] % 24:
                tot += 1
                same += allb[i][2] == allb[k][2]
    return {'soundingBarsWithRandomEvents': len(allb), 'distinctBarSignatures': len(set(s for _, _, s in allb)), 'crossSeedSamePhaseBarPairs': tot, 'identicalPairs': same}
uniq_rep = {'varis-derinlesme+varis_x': uniq([n for n in ('vd1', 'vd2', 'vd3', 'varis_x') if n in sigs]), 'derin': uniq([n for n in ('derin1', 'derin2', 'derin3') if n in sigs])}

if 'imge_alt_p25' in segs and 'derin' in fam:
    segs['imge_alt_p25'] = segs['imge_alt_p25'] - segs['imge_alt_p25'].mean(0)
    add('dalga.imge_alt_p25', 'dalga_imge_alt_p25.wav', segs['imge_alt_p25'], 'imge', 'ALTERNATIVE (not default): same notes one octave above the default imge (+25, E-flat6-B-flat7) = "one octave above the +13 bed" reading',
        ['imge_alt_p25'], fam['derin']['gainDb'], note='same seed and note sequence as dalga_imge.wav, only the octave differs')

json.dump({'files': files, 'families': fam, 'seamEvidence': evidence, 'uniqueness': uniq_rep}, open(os.path.join(W, 'build_out.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(files))
