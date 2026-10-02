"""b/ders2/units-v3.json: Ders 2'nin B adımında yeniden ya da yeni seslendirilecek TTS birimleri (Nefona Hoca)."""
import sys, json; sys.path.insert(0, '.')
import v3plan as V
from v3plan import T
import build_lesson as B
Y = V.Y
L0 = T.with_scene(T.load(Y + '/b/ders2/ders2.lesson.v3.json'), 'orman')
Lp = T.with_scene(T.load(Y + '/pilot/ders2.lesson.json'), 'orman')
cl = {c['id']: c for b in L0['blocks'] for c in b['clips']}
clp = {c['id']: c for b in Lp['blocks'] for c in b['clips']}
ex = {}
for e in L0['extras'].values():
    for c in e['clips']: ex[c['id']] = c
    for pre in (e.get('prefixByActiveBlock') or {}).values():
        for c in pre: ex[c['id']] = c
cars = {c['id']: c for c in L0['carriers']}
KR_PER_CHAR_TAKE = 0.99989   # hoc estimate_only (ledger.jsonl, hoc-1 satırları); gerçek fiyatla uzlaştırılmadı
TAKES = 3
units = []
def add(uid, clip, form, tts, phase, neden, need, extra=None):
    ss = T.split_keep(tts) if not uid.startswith('car.') else [tts]
    u = {'id': uid, 'clip': clip, 'kind': 'carrier' if uid.startswith('car.') else 'clip', 'form': form,
         'tts': tts, 'screen': tts, 'sentences': ss, 'phase': phase, 'syllables': T.syllables(tts),
         'chars': len(tts), 'neden': neden, 'gerekli': need}
    if extra: u.update(extra)
    units.append(u)
# (a) metni değişen tam birimler
for cid in ('n1.sec', 'n2.hatirla'):
    add(cid, cid, 'tam', cl[cid]['text'], cl[cid]['phase'],
        'metin-degisti: iki nokta kaldırıldı (SPEC.v3 §4.1, PLAN.v3 §A.3); anlam aynı; pilotta kesim kural dışıydı (SPEC v3.1)',
        [15, 20], {'onceki_tts': clp[cid]['text']})
# (b) 5 dk kısa biçimleri
for cid, why in (('a.gozler', '5dk-kisa: Varış kısa biçimi (PLAN.v3 §A.3, boş pay >= 15 sn)'),
                 ('a.kolay', '5dk-kisa: Varış kısa biçimi (PLAN.v3 §A.3, boş pay >= 15 sn)'),
                 ('n1.soyle', '5dk-kisa: pilotta okutulmadı; metin 4 hece kısaldı (H12 evre cümle uzunluğu, Varış kısalınca)'),
                 ('n2.hatirla', '5dk-kisa: pilotta okutulmadı; iki nokta kaldırıldı')):
    sh = cl[cid]['short']
    old = (clp[cid].get('short') or {}).get('text')
    add(cid + '.kisa', cid, 'kisa-5dk', sh['text'], cl[cid]['phase'], why, [5],
        {'belowSec': sh['belowSec'], 'gapAfter': sh['gapAfter'], 'tam_tts': cl[cid]['text'], 'onceki_kisa_tts': old})
# (c) 20 dk birimleri
need_hoc = ['car.agir', 'car.hafif', 'c3.agir', 'c3.gelmezse', 'c3.hafif', 'c3.birak', 'c4.yerles', 'c4.adim', 'c4.koku', 'c4.pencere', 'c4.donus1']
pay = ['c4.acele', 'c4.geride', 'c4.x.istemiyor']
for uid in need_hoc + pay:
    if uid.startswith('car.'):
        car = cars[uid]
        extra = {'items': car['items'], 'itemText': {i: cl[i]['text'] for i in car['items']},
                 'cut': 'üç nokta duraklarından; öğe sayısı tutmazsa çekim elenir'}
        add(uid, None, 'tasiyici', car['text'], 'Derin', '20dk: C3 zıtlık çiftleri (planlayıcı, Nefona Hoca ölçülmüş süreleri)', [20], extra)
    else:
        c = cl[uid]
        why = ('20dk: planlayıcı, Nefona Hoca ölçülmüş süreleriyle 20 dk planında' if uid in need_hoc else
               '20dk-kose-payi: Nefona Hoca planında yok; pilotun 5 köşe × 5..20 dk birleşiminde var (PLAN.v3 18 klip). Ölçülen süreler kaydırırsa gerekir')
        extra = {}
        if uid in ('c3.agir', 'c3.hafif'):
            why += '; metin önerisi: pilot metni yüklemsiz başlıktı ("%s")' % clp[uid]['text']
            extra['onceki_tts'] = clp[uid]['text']
        add(uid, uid, 'tam', c['text'], c['phase'], why, [20] if uid in need_hoc else ['20-yedek'], extra)
# (e) yardımcı klipler (PLAN.v3 §C.2, §D.3)
for uid, why in (('g.ilk', 'yardimci: ilk ders cümlesi (kişinin ilk yoga dersinden önce kısa giriş; PLAN.v3 §D.3); her derste aynı'),
                 ('k.hizli.imge', 'yardimci: "Kapanışa geç" imge açıkken bırakma ön klibi (15 ve 20 dk; C4)'),
                 ('k.hizli.his', 'yardimci: "Kapanışa geç" zıtlık açıkken bırakma ön klibi (20 dk; C3)'),
                 ('d.goz', 'yardimci: Durdur sonrası sesli dönüş 1/3 (PLAN.v2 §B.5); her derste aynı'),
                 ('d.kalk', 'yardimci: Durdur sonrası sesli dönüş 2/3'),
                 ('d.bekle', 'yardimci: Durdur sonrası sesli dönüş 3/3')):
    c = ex[uid]
    add(uid, uid, 'tam', c['text'], c['phase'], why, ['yardimci'])
# sayım ve kredi (tahmin)
def est_sec(u):
    return u['syllables'] / 5.6 * V.RATIO['hoc'] + 0.31 * len(u['sentences'])
groups = {}
for u in units:
    g = u['neden'].split(':')[0]
    a = groups.setdefault(g, {'birim': 0, 'karakter': 0, 'hece': 0})
    a['birim'] += 1; a['karakter'] += u['chars']; a['hece'] += u['syllables']
tot_chars = sum(u['chars'] for u in units)
tts_cr = tot_chars * TAKES * KR_PER_CHAR_TAKE
scribe_cr = sum(est_sec(u) for u in units) * 5.5 * 1.25   # en iyi çekim + %25 yeniden deneme payı (VARSAYIM)
doc = {
    'lesson': 'ders2', 'scene': 'orman', 'voice': {'name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm', 'sex_param': 'm', 'model': 'eleven_v4', 'generations_count': TAKES},
    'kaynak_ders_verisi': Y + '/b/ders2/ders2.lesson.v3.json',
    'kural': 'tts = screen (ekrandaki cümle = söylenen cümle); çok cümleli birim cümle sonlarından kesilir; taşıyıcı üç nokta duraklarından (SPEC.v3 §5). Metin E.1 incelemesinden (karar 2 yedeği: iki bağımsız model incelemesi) geçmeden seslendirilmez.',
    'yeni_ses_gerekmeyen': [
        {'id': 'c2.akis (kisa-5dk)', 'neden': 'kısa biçimin metni tam biçimle aynı; kayıtlı ses kullanılır, yalnız boşluk değişir'},
        {'id': 'a.izin', 'neden': 'kaldığın yerden açılış izni dosyası kayıtlı birimden kurulur'},
        {'id': 'soundCheck (c1.b01, c1.s16, c2.n03)', 'neden': 'kayıtlı taşıyıcı parçaları'},
        {'id': 'n1.sec seçenek 2 ve 3', 'neden': 'metinleri iki noktasız yazıldı (ders verisinde) ama ilk yayında dönüşümlü açılış yok (PLAN.v3 §C.1); seslendirilmez'}],
    'ozet': {'birim': len(units), 'karakter': tot_chars, 'hece': sum(u['syllables'] for u in units), 'gruplar': groups,
             'kredi_tahmini': {'tts_3_cekim': round(tts_cr), 'scribe_dogrulama': round(scribe_cr), 'toplam': round(tts_cr + scribe_cr),
                               'not': 'TTS 0,99989 kredi/karakter/çekim (hoc estimate_only; uzlaştırılmadı); Scribe 5,5 kredi/sn (gerçek), süre model × 1,127, %25 yeniden deneme payı VARSAYIM. Yeniden çekimler ve 20 dk müziği dahil değil.'}},
    'bes_dk_bos_pay': {'hedef_sn': 15.0, 'nefona_hoca_birim_kestirim': 17.9, 'nefona_hoca_kons_kestirim': 15.9,
                       'onceki_metinle': 9.8, 'varis_kisalmasi_hece': 17,
                       'not': 'PLAN.v3 §A.3 "≈ 16 hece" Neslihan içindi (boş pay 11,6). Nefona Hoca %12,7 yavaş okuduğu için yalnız Varış kısaltması yetmedi: n1.sec (2 hece ve iki nokta duraklaması) ve n1.soyle kısa biçimi (4 hece) de kısaldı. Ayrıntı b/ders2/timing.txt.'},
    'inceleme_notlari': [
        {'id': 'c4.ses', 'metin': 'Uzaktan gelip giden yaprak hışırtısı.', 'not': 'yüklemsiz; kayıtlı 15 dk birimi, bu listede yeniden seslendirilmiyor. E.1 incelemesine öneri: "Uzaktan yaprak hışırtısı gelip gidiyor." (+1 hece). Değişirse yeniden seslendirilir.'},
        {'id': 'k.oda.ayrinti', 'metin': 'Bir renk, bir biçim, bir doku.', 'not': 'yüklemsiz liste; k.goz\'un ("çevrende birkaç şeye bakabilirsin") açılımı. Liste istisnasına girip girmediği E.1 incelemesinin kararı.'},
        {'id': 'c1.gecis.arka, c1.gecis.on (1. cümle)', 'metin': 'Bedenin arka tarafı. / Yüzün ve bedenin ön tarafı.', 'not': 'beden dolaşımı bölüm başlığı; PLAN.v2 §C.1 liste biçimi (istisna). Bilgi için.'},
        {'id': 'H12 payı', 'metin': '5 dk: Varış 14,83 / Derinleşme 14,75 hece/cümle', 'not': 'E.1 incelemesinde Varış kısa biçimlerine ya da N1 birimlerine hece eklenir/çıkarılırsa H12 yeniden denetlenir.'}],
    'units': units}
json.dump(doc, open(Y + '/b/ders2/units-v3.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(doc['ozet'], ensure_ascii=False, indent=1))
for u in units: print('%-18s %-9s %3d hece %3d kar  %s' % (u['id'], u['form'], u['syllables'], u['chars'], u['tts']))
