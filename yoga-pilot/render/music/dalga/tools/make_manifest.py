"""manifest.json (SPEC §5 alanları ve denetimleri) — work/build_out.json'dan."""
import json, os, datetime
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = os.path.join(D, 'work')
B = json.load(open(os.path.join(W, 'build_out.json')))
prov = [l.split() for l in open(os.path.join(W, 'provenance.sha256')) if l.strip()]
tests = json.load(open(os.path.join(W, 'register_test.json')))

def chk(f):
    a, c = f['analysis'], {}
    bed = f['family'] != 'imge'
    c['format44k1Stereo'] = {'pass': a['sampleRate'] == 44100 and a['channels'] == 2, 'subtype': a['subtype']}
    c['lufsIntegrated'] = {'value': a['lufsIntegrated'], 'target': -24.0 if bed else None, 'pass': (abs(a['lufsIntegrated'] + 24) <= 0.5) if bed else None,
                           'note': None if bed else 'layer: Derin family gain, no own target'}
    c['truePeak'] = {'valueDbtp': a['truePeakDbtp'], 'limit': -1.5, 'pass': a['truePeakDbtp'] <= -1.5}
    drums = sum(e['drumEvents'] for e in f['events'])
    c['noDrums'] = {'pass': drums == 0, 'drumEventsInRenderLog': drums, 'percussiveEnergyRatioHPSS': a['percussiveEnergyRatio'],
                    'basis': 'render log: 0 kick/shaker/bass events (sakin composer never emits them); HPSS ratio is informational'}
    c['noVocals'] = {'pass': None, 'basis': 'by construction only (oscillators, Karplus string, noise-impulse reverb; no voice source)',
                     'scribe': 'NOT RUN - not verified by transcription'}
    c['onsetStrength'] = {'fluxP50': a['onset']['fluxP50'], 'fluxP99': a['onset']['fluxP99'], 'peakRatePerMin': a['onset']['peakRatePerMin'], 'pass': None,
                          'basis': 'measured; SPEC has no numeric limit. The engine is a slow piano texture, so onsets are real note attacks. Compare with the ElevenLabs set using the same tool (tools/analyze_music.py).'}
    st = a['shortTerm3s']
    ex = st.get('excludingIntervals', {})
    c['loudnessSpread3s'] = {'fullSpreadP10P90': st['spreadP10P90'], 'fullSpreadMaxMin': st['spreadMaxMin'], 'p50': st['p50'],
                             'soundingOnlySpreadP10P90': ex.get('spreadP10P90'), 'soundingOnlySpreadMaxMin': ex.get('spreadMaxMin'),
                             'lastThirdMinusFirstThirdDb': st['lastThirdMinusFirstThirdDb'], 'pass': None,
                             'basis': 'SPEC: "dinamik düz (3 sn LUFS yayılımı dar)" without a number. Full-file spread is set by the engine\'s designed silent bar (every 6th 4 s bar, Bernardi 2005 in dalgaMusic.js); sounding-only spread = the texture itself.'}
    cl = a['clicks']
    rows = a.get('seams', {}).get('rows', [])
    su = sum(len(r['unattributedHfTransientsInXfade'] or []) for r in rows)
    c['noClicks'] = {'pass': cl.get('unattributed', 0) == 0 and su == 0, 'hfTransients': cl['hfTransients'], 'attributedToNoteOnsets': cl.get('attributedToNoteOnsets'),
                     'unattributed': cl.get('unattributed'), 'unattributedFirst10': cl.get('unattributedList', [])[:10], 'unattributedInSeams': su,
                     'fileEdgeAbs': a['edgeAbs'], 'rule': cl['rule'] + '; ' + cl.get('attributionRule', '')}
    if rows:
        c['seams'] = {'rows': rows, 'baselineSamePhase': a['seams']['baseline'], 'definition': a['seams']['deltaDefinition']}
    ss = a['spectralShare']
    c['speakerCriterionPlanD3'] = {'lt300': ss['lt300'], '500_4000': ss['500_4000'], 'lt300_le_0_10': ss['lt300'] <= 0.10, '500_4000_ge_0_40': ss['500_4000'] >= 0.40,
                                   'basis': 'PLAN.v2 §D.3 "Hoparlör dersi" (VARSAYIM)'}
    c['digitalSilence'] = {'longestRunSec': a['digitalSilence']['longestRunSec'], 'min1sRmsDbfs': a['digitalSilence']['min1sRmsDbfs'], 'pass': None,
                           'note': 'reported; room tone is added in the mix (SPEC §6)'}
    c['binaural'] = {'present': False}
    if not bed:
        ev = f['events'][0]
        note = 'sparse layer with gaps: 3 s spread and flux-based onset rate are not meaningful; use note statistics'
        c['loudnessSpread3s']['note'] = note
        c['onsetStrength']['note'] = note
        c['layerNotes'] = {'notesPerMin': ev['perMinuteByRole'].get('mel'), 'firstNoteSec': ev['firstEventSec'], 'lastNoteSec': ev['lastEventSec'],
                           'maxGapBetweenNotesSec': ev['maxGapBetweenOnsetsSec'], 'midiRange': ev['midiRange']}
    return c

files = []
for f in B['files']:
    a = f['analysis']
    files.append({'id': f['id'], 'path': f['path'], 'sha256': f['sha256'], 'family': f['family'], 'role': f['role'], 'note': f.get('note'),
                  'durationSec': a['durationSec'], 'sampleRate': a['sampleRate'], 'channels': a['channels'], 'subtype': a['subtype'],
                  'parts': f['parts'], 'seeds': f['seeds'], 'transposeSemitones': f['transposeSemitones'],
                  'grid': {'barSec': 4.0, 'gridBar0': f['gridBar0'], 'gridBarEnd': f['gridBarEnd'], 'harmonicPhaseAtStart(bar mod 24)': f['harmonicPhaseAtStart']},
                  'gainDb': f['gainDb'], 'lufsIntegrated': a['lufsIntegrated'], 'truePeakDbtp': a['truePeakDbtp'], 'rawInfo': f['rawInfo'],
                  'events': f['events'], 'checks': chk(f), 'analysis': a})

fam = {}
for k, v in B['families'].items():
    jf = [f for f in files if f['family'] == k and f['role'] == 'family-joined'][0]
    fam[k] = {'joinedFile': jf['path'], 'joinedDurationSec': jf['durationSec'], 'uniqueSec': jf['durationSec'],
              'segments': [{'path': f['path'], 'durationSec': f['durationSec'], 'seed': f['seeds'][0], 'gridBars': [f['grid']['gridBar0'], f['grid']['gridBarEnd']]} for f in files if f['family'] == k and f['role'] == 'segment'],
              'seamsXfadeStartSec': v['seams'], 'gainDb': round(v['gainDb'], 2), 'dcRemoved': v['dcRemoved'], 'seamEvidence': B['seamEvidence'][k]}

summary = []
for f in files:
    c = f['checks']
    summary.append({'id': f['id'], 'sec': f['durationSec'], 'lufs': f['lufsIntegrated'], 'tp': f['truePeakDbtp'], 'noDrums': c['noDrums']['pass'], 'noClicks': c['noClicks']['pass'],
                    'spreadFull': c['loudnessSpread3s']['fullSpreadP10P90'], 'spreadSounding': c['loudnessSpread3s']['soundingOnlySpreadP10P90'],
                    'onsetPerMin': c['onsetStrength']['peakRatePerMin'], 'percussive': c['noDrums']['percussiveEnergyRatioHPSS'],
                    'lt300': c['speakerCriterionPlanD3']['lt300'], 'b500_4k': c['speakerCriterionPlanD3']['500_4000']})

m = {
    'source': 'dalga (app engine, sakin)', 'abLabel': 'assigned by orchestrator (_ab_key.json)', 'created': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'costCents': 0, 'paidCalls': 0, 'ledgerLines': 0,
    'engine': {'filesSha256': {p[1]: p[0] for p in prov}, 'repoLastCommitTouchingDalgaFiles': 'ac5e143573a427659c0acabf25923f8d1e84bd26 (read-only git log)',
               'copiedVerbatimTo': os.path.join(W, 'src/lib'), 'repoWrites': 0,
               'method': 'app/design/dalga-uyku render.html pattern: OfflineAudioContext(2 ch, 44100 Hz) + buildGraph + makeVoices + makeComposer("sakin"), master gain 0.8 (renderLoop level), seeded mulberry32 replacing Math.random (render.html), transpose +12 (render.html, phone speaker) +1 (E-flat, music.key). Rendered on a bar grid instead of a 96 s loop, 2 bars of pre-roll discarded. Headless Chromium via Playwright page.route serving the scratch copy; no vite/dev server was started (modules have no bare imports).',
               'harness': [os.path.join(W, 'render.html'), os.path.join(W, 'render_dalga.mjs'), os.path.join(W, 'jobs.json')],
               'tools': [os.path.join(D, 'tools', n) for n in ('build_dalga.py', 'analyze_music.py', 'make_manifest.py')]},
    'decisions': [
        'Key/register: sakin is D major -> +1 = E-flat major; +12 as render.html (Bug 22). Measured on a 48 s test: +1 gives <300 Hz %.1f %%, 500-4000 Hz %.1f %%; +13 gives %.1f %% / %.1f %% (PLAN §D.3 wants <=10 %% / >=40 %%).' % (tests['p1']['lt300'] * 100, tests['p1']['500_4000'] * 100, tests['p13']['lt300'] * 100, tests['p13']['500_4000'] * 100),
        'Varış-Derinleşme: sakin events unchanged (pad, bass piano note, upper piano, pentatonic melody, Karplus guitar, silent 6th bar).',
        'Derin (VARSAYIM; the engine has no density or per-texture volume setting): event filter on the same composer output - guitar removed, upper piano only on steps 0 and 4, melody only on step 6; pad and bass note unchanged, same voices. Result: sparser (about half the note onsets, see events/onset) but NOT natively quieter - raw LUFS equals the VD raw LUFS within 0.4 dB because the pad dominates; the quieter Derin level comes from the mix (music.duckedBedLufs Derin -36 vs Varış -33).',
        'Kapanış (VARSAYIM): sakin events; the file starts with 2 crossfade-in bars at phase 4,5 (mod 24), resolves on E-flat maj7 (global bar 72, after a silent bar) at 176 s; in that bar only pad/bass/upper piano, pad held 7 s (engine pad dur), natural decay to 188 s (-95.6 dBFS raw in the last second).',
        'İmge (VARSAYIM): the engine\'s own sakin melody rule alone (steps 2/6, p = 0.38, walk -2..+2 over SAKIN_SCALE), engine piano voice, silent 6th bar kept, E-flat major pentatonic. Default dalga_imge.wav = SAKIN_SCALE + 13 (MIDI 75-94, E-flat5-B-flat6): "one octave up" read as one octave above the engine\'s own pentatonic line in E-flat. This is the same register as the +13 bed\'s melody. The other reading ("one octave above the bed") is delivered as dalga_imge_alt_p25.wav (same notes, +25). Measured: +13 has 1.5-4 kHz 33.3 %, >4 kHz 2.6 %; +25 has 66.7 % / 14.9 % (both 0 % below 300 Hz); integrated -38.0 vs -36.3 LUFS at the same gain. Choice is for the ear.',
        'Segments (vd*, derin*) all start with bars = 22,23 (mod 24) and end with bars = 22,23 (mod 24), length 24k+2 bars: the last 8 s of any segment overlaps the first 8 s of any other on the same chords, so they can be chained in any order (PLAN §D.3 variant logic). Seam = B-flat sus bar + silent bar; the next seed takes over on the E-flat maj7 home chord.',
        'Crossfade: 8 s equal-power. Dalga seeds share the deterministic pad + bass note on the same grid, so the two sides of a seam are phase-coherent (measured rho, seamEvidence). Plain sin/cos then adds a loudness bump (measured in seamEvidence.plainSinCos); the joined files use g = [cos, sin](theta) / sqrt(1 + rho(t) sin 2theta), which equals sin/cos at rho = 0 and keeps summed power constant. The mix must use this law (or linear) when it crossfades Dalga segments/families with each other.',
        'Binaural: not rendered. In the app sakin binaural is conditional (headphones only; experiment half off: dalga.js binauralPlan), the offline sleep path has none (dalgaSleep.js), PLAN §D.3 says "Binaural katman yok".',
        'No EQ (PLAN §D.3 150 Hz HPF and 1.5-4 kHz dip): measured <150 Hz and 1.5-4 kHz shares are ~0, so it would be nearly a no-op; left to the mix so A and B get identical processing.',
        'Level: one gain per family to -24 LUFS integrated (PLAN §D.3), family DC removed, true peak <= -1.5 dBTP checked, 5 ms raised-cosine at every file edge, PCM 24-bit.',
    ],
    'mixGuidance': {'crossfadeLawForDalga': 'g_a = cos(th)/sqrt(1+rho*sin(2th)), g_b = sin(th)/sqrt(1+rho*sin(2th)), th = pi/2*u, rho measured on the overlap (1 s windows); or linear. Not plain sin/cos.',
                    'harmonicAlignment': 'bar = 4 s; phase(t) = (gridBar0 + t/4) mod 24. Crossfade two Dalga files only where their phases are equal; best at bars = 4,5 (mod 6) (last sounding bar + silent bar).',
                    'opening': 'start with dalga_varis_x.wav (E-flat maj7 at t=0) or a vd segment from t = 8 s (skip its crossfade-in bars).',
                    'closing': 'dalga_kapanis.wav: crossfade in over its first 8 s from Derin/VD read at phase 4,5; final chord at 176 s.'},
    'summary': summary, 'families': fam, 'uniqueness': B['uniqueness'], 'registerTest': tests,
    'notVerified': ['No Scribe transcription on any Dalga file (vocal absence is by construction only).', 'No listening: every statement is measured; the blind A/B by ear is the owner\'s.'],
    'files': files,
}
json.dump(m, open(os.path.join(D, 'manifest.json'), 'w'), ensure_ascii=False, indent=1)
print('manifest', len(files))
