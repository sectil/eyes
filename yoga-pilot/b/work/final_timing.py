"""Ders 2 v3: 5, 15 ve 20 dk planları, seçilen sesin (Nefona Hoca, hoc) ölçülmüş süreleriyle; check_plan ve ek denetimler.
Çıktı: b/ders2/timing.txt. Pilot planlayıcısı (pilot/timing.py) salt okunur içe aktarılır; hiçbir pilot dosyası yazılmaz."""
import sys, json, io, hashlib, datetime; sys.path.insert(0, '.')
import v3plan as V
from v3plan import T
OUT = io.StringIO()
def P(*a): print(*a, file=OUT)
LP = V.Y + '/b/ders2/ders2.lesson.v3.json'
L0 = T.load(LP); L = T.with_scene(L0, 'orman')
P('# Ders 2 · v3 zamanlama denetimi (B adımı, sessiz; ücretli çağrı yok)')
P('tarih: %s UTC' % datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M'))
P('ders verisi: %s (sha256 %s)' % (LP, hashlib.sha256(open(LP, 'rb').read()).hexdigest()[:16]))
P('planlayıcı: %s (salt okunur; sha256 %s)' % (V.Y + '/pilot/timing.py', hashlib.sha256(open(V.Y + '/pilot/timing.py', 'rb').read()).hexdigest()[:16]))
P('sahne: orman · köşe: 5,6 hece/sn, yüksek duraklama (üretim köşesi) · süreler: ölçülmüş (render/out/plan-<ses>.json)')
P('ölçülmemiş ya da metni değişen birim: model süresi × oran. "birim" = o birimin pilotta ölçülen/model oranı (yoksa sesin')
P('genel oranı); "kons" = max(genel oran, birim oranı). Genel oranlar (ölçülen/model, 15 dk ortak birimler): hoc 1,127 ·')
P('nes 1,109 · hak 1,055 (b/work/measure_hoc.py). Karar ölçütü: iki kestirimde de bütün denetimler geçer.')
P('')
fails_total = 0
summary = {}
for v in ('hoc', 'nes', 'hak'):
    for cons in (False, True):
        V.MODE['conservative'] = cons; V.use(v)
        tag = '%s/%s' % (v, 'kons' if cons else 'birim')
        plans = {m: T.plan(L, m * 60, 5.6, 'hi') for m in range(5, 21)}
        # dakikalar arası: önek kuralı ve T5
        extra = []
        ids = {m: [e['clip']['id'] for e in plans[m]['events']] for m in plans}
        for m in range(6, 21):
            lost = sorted(set(ids[m - 1]) - set(ids[m]))
            if lost: extra.append('alt küme bozuk %d→%d: %s' % (m - 1, m, lost))
        for m, p in plans.items():
            if p['stop'] is not None and T.stretch(p) > T.STRETCH_MAX_UNSATURATED + 1e-9:
                extra.append('T5 %d dk f=%.2f' % (m, T.stretch(p)))
        allmin_fail = {m: T.check_plan(L, plans[m])[0] for m in plans}
        bad_min = {m: f for m, f in allmin_fail.items() if f}
        qp = T.quick_prefix_checks(L, [plans[5], plans[15], plans[20]])
        for m in (5, 15, 20):
            p = plans[m]
            f, d, runs = T.check_plan(L, p)
            sl = p['T'] - p['speech'] - p['gaps']['min']
            t6 = (m == 5 and sl < T.T6_FLOOR - 1e-6)
            if t6: f = f + ['T6: boş pay %.1f < 15' % sl]
            summary[(tag, m)] = (p, f, d, sl)
            if v == 'hoc': fails_total += len(f)
        s3 = set(ids[5]); s15 = set(ids[15]); s20 = set(ids[20])
        P('## %s' % tag)
        for m in (5, 15, 20):
            p, f, d, sl = summary[(tag, m)]
            mi = V.measured_ids(v, p)
            syl = sum(s['syl'] for e in p['events'] for s in e['subs'])
            P('%2d dk: durum %s · toplam %.2f sn · konuşma %.1f sn (%%%.0f) · esneme f=%.3f · boş pay (min sessizlik) %.1f sn · birim %d (ölçülmüş %d, kestirim %d) · hece %d · bloklar %s' % (
                m, p['status'], p['total'], p['speech'], 100 * p['speech'] / p['T'], p['f'], sl, len(p['events']), sum(mi), len(mi) - sum(mi), syl, ' '.join(p['sel'])))
            P('       yoğunluk: en yoğun 60 sn %.1f hece (tavan 150), konuşma payı %.2f (tavan 0,60); Derin %.1f hece / %.2f; ortalama %.1f hece/dk · check_plan: %s' % (
                d['syll'], d['frac'], d['deep_syll'], d['deep_frac'], d['avg'], 'GEÇTİ' if not f else 'HATA ' + '; '.join(f)))
            P('       evre cümle uzunluğu (H12, hece/cümle): %s' % ', '.join('%s %.1f' % (k, x) for k, x in T.phase_sentence_means(p).items()))
            P('       blok süreleri: %s' % ', '.join('%s %d:%02d' % (b, int(x // 60), round(x % 60)) for b, x in T.block_durations(p).items()))
        P('   5..20 dk her dakika check_plan: %s' % ('hepsi GEÇTİ' if not bad_min else 'HATA ' + json.dumps({k: v_[:2] for k, v_ in bad_min.items()}, ensure_ascii=False)))
        P('   alt küme 5 ⊂ 6 ⊂ … ⊂ 20 ve T5: %s · 5 ⊂ 15: %s · 15 ⊂ 20: %s' % ('GEÇTİ' if not extra else 'HATA ' + '; '.join(extra), s3 <= s15, s15 <= s20))
        P('   "Kapanışa geç" ön klipleri (S3-01, 5/15/20): %s' % ('GEÇTİ' if not qp else 'HATA ' + '; '.join(qp)))
        P('')
V.MODE['conservative'] = False; V.use('hoc')
P('## Nefona Hoca, birim kestirimi: planların klip listesi')
for m in (5, 15, 20):
    p = T.plan(L, m * 60, 5.6, 'hi'); mi = V.measured_ids('hoc', p)
    P('### %d dk' % m)
    for e, ms in zip(p['events'], mi):
        c = e['clip']
        P('  %7.1f  %-5s %-16s %s%s  konuşma %4.1f  sonra %5.1f sn  %s' % (e['start'], e['block'], c['id'], 'Ö' if ms else 'K', ' kısa' if c.get('shortForm') else '     ', e['speech'], e['gap'], c['text']))
V.MODE['conservative'] = True; V.use('model')
P('')
P('## Model köşeleri (pilot yöntemi, 5..30 dk × 3 hız × 2 profil = 78 vaka; ölçülmüş süre yok)')
f, o = T.lint_text(L0)
P('lint_text: %s' % ('temiz' if not f else f))
for sc in ('orman', 'kiyi'):
    res = T.run_all(T.with_scene(L0, sc))
    nf = [k for k, c in res.items() if not T.case_ok(c)]
    P('sahne %s: %d/78 vaka geçti; geçmeyen %s (%s); T6 5 dk üretim köşesi boş pay %.1f sn' % (
        sc, 78 - len(nf), ['%.1f %d dk' % k for k in nf], '; '.join(T.failure_kinds(res)), T.slack5(res, T.PRODUCTION)))
P('karşılaştırma: pilot ders2.lesson.json aynı koşuda 77/78 (6,6 · 13 dk · T5), pilot/timing.out.txt:231-234 ile aynı; bu vaka yayında yok (13 dk ve 6,6 hızı kullanılmıyor).')
P('')
P('Nefona Hoca için karar satırları (birim/kons): 5 dk boş pay %.1f / %.1f sn (taban 15); hata sayısı (hoc, 5/15/20, iki kestirim) %d.' % (
    summary[('hoc/birim', 5)][3], summary[('hoc/kons', 5)][3], fails_total))
open(V.Y + '/b/ders2/timing.txt', 'w').write(OUT.getvalue())
print(OUT.getvalue()[:6000])
