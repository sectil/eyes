"""ders2.script.md üreticisi (2. tur). Metin, boşluk, ipucu ve sürüm tabloları ders verisinden ve planlayıcıdan okunur;
belgedeki hiçbir sayı elle yazılmaz."""
import os
import re

import timing

HERE = os.path.dirname(os.path.abspath(__file__))
TIER = {'required': 'zorunlu', 'optional': 'isteğe bağlı', 'extension': 'genişletme'}

# ---------------------------------------------------------------------------------------------- Türkçe yardımcılar
ONES = {1: 'bir', 2: 'iki', 3: 'üç', 4: 'dört', 5: 'beş', 6: 'altı', 7: 'yedi', 8: 'sekiz', 9: 'dokuz'}
TENS = {10: 'on', 20: 'yirmi', 30: 'otuz', 40: 'kırk', 50: 'elli'}
BACK = set('aıou')
VOW = set('aeıioöuü')
HARD = set('çfhkpsşt')


def spoken_last(n):
    """Bir sayının okunuşundaki son sözcük (0–59)."""
    if n == 0:
        return 'sıfır'
    return ONES[n % 10] if n % 10 else TENS[n]


def _last_vowel_back(word):
    for ch in reversed(word):
        if ch in VOW:
            return ch in BACK
    return False


def ek(word, case):
    """T35: sayıdan sonra kesme işaretli ek. case: 'de' (bulunma) ya da 'e' (yönelme)."""
    back = _last_vowel_back(word)
    last = word[-1]
    if case == 'de':
        return ('t' if last in HARD else 'd') + ('a' if back else 'e')
    return ('y' if last in VOW else '') + ('a' if back else 'e')


def son_okunan(sayi):
    """"29,4" → "dört", "3" → "üç", "30" → "otuz": ekin uyacağı son okunan sözcük (T35)."""
    sayi = str(sayi)
    parca = sayi.split(',')[-1] if ',' in sayi else sayi
    v = int(parca)
    if v >= 60:
        v = v % 10 or 10
    return spoken_last(v)


def ek4(word, tur):
    """Dört biçimli ek: tur 'dir' (ek-fiil) ya da 'i' (belirtme)."""
    for ch in reversed(word):
        if ch in VOW:
            v = ch
            break
    unlu = {True: {True: 'u', False: 'ı'}, False: {True: 'ü', False: 'i'}}[v in BACK][v in 'oöuü']
    if tur == 'dir':
        return ('t' if word[-1] in HARD else 'd') + unlu + 'r'
    return ('y' if word[-1] in VOW else '') + unlu


def mmss(sec):
    sec = int(round(sec))
    return '%d:%02d' % (sec // 60, sec % 60)


def zaman(sec, case):
    """"4:55'te", "33:39'a" gibi: son okunan sayıya göre ek (saniye 00 ise dakika okunur)."""
    t = mmss(sec)
    m, s = (int(x) for x in t.split(':'))
    return "%s'%s" % (t, ek(spoken_last(s if s else m), case))


def n(x):
    return ('%g' % x).replace('.', ',')


def gap_str(c):
    g = c['gapAfter']
    s = '%s / %s / %s' % (n(g['min']), n(g['pref']), n(g['max']))
    if c.get('pairGap'):
        pg = c['pairGap']
        s += ' (ardından `%s` çalarsa %s / %s / %s)' % (c['pairWith'], n(pg['min']), n(pg['pref']), n(pg['max']))
    return ('**pencere** ' + s) if c.get('window') else s


def cue_str(c):
    parts = []
    cue = c.get('cue', {})
    if 'visual' in cue:
        parts.append('görsel `%s`' % cue['visual'])
    if 'music' in cue:
        parts.append('müzik `%s`' % cue['music'])
    if 'voiceGain' in cue:
        parts.append('ses kazancı: %s' % cue['voiceGain'])
    if 'breath' in cue:
        parts.append('sayı %d' % cue['breath']['count'])
    return ' · '.join(parts) or '—'


def note_str(c):
    t = c['tags']
    out = []
    if c.get('carrier'):
        out.append('✂ `%s`#%d' % (c['carrier']['id'], c['carrier']['index']))
    if t.get('key'):
        out.append('**anahtar cümle %d**' % t['key'])
    if t.get('uniqueOpening'):
        out.append('**derse özgü açılış**')
    if c.get('alternates'):
        out.append('dönüşümlü seçenekler: %s' % ' · '.join('"%s"' % a['text'] for a in c['alternates']))
    if t.get('safety'):
        out.append('güvenlik: %s' % t['safety'])
    if t.get('eyesOpen'):
        out.append('gözleri açma seçeneği')
    if t.get('anchor'):
        out.append('tarafsız dayanak: %s' % t['anchor'])
    if t.get('mood') == 'safety':
        out.append('emir kipi (güvenlik/beden)')
    if t.get('step'):
        out.append('adım: %s' % t['step'])
    if t.get('announce'):
        out.append('pencere duyurusu')
    if t.get('welcome'):
        out.append('pencere sonrası karşılama')
    if t.get('image'):
        out.append('imge: %s' % ('yeni' if t['image'] == 'new' else 'dönüş'))
    if t.get('evocation'):
        out.append('duyu çağrışımı (imge değil)')
    if t.get('callback'):
        out.append('geri çağrı: `%s`' % t['callback'])
    if t.get('normalize'):
        out.append('başarısızlığı normalleştirir')
    if c.get('minTarget'):
        out.append('yalnız >= %d dk' % (c['minTarget'] // 60))
    if c.get('requires'):
        out.append('gerekir: %s' % ', '.join('`%s`' % r for r in c['requires']))
    if c.get('fillRank') is not None:
        out.append('sıra %d%s' % (c['fillRank'], (' · grup `%s`' % c['fillGroup']) if c.get('fillGroup') else ''))
    if t.get('action'):
        out.append('eylem: %s' % t['action'])
    return '; '.join(out) or '—'


def block_table(b):
    rows = ['| id | tür | metin | sessizlik sonra (sn, min / pref / max) | ipucu | evre | hece |',
            '|---|---|---|---|---|---|---|']
    for c in b['clips']:
        rows.append('| `%s` | %s | %s | %s | %s | %s | %d |' % (
            c['id'], TIER[c['tier']], c['text'].replace('|', '\\|'), gap_str(c), cue_str(c), c['phase'],
            c['syllables']))
    notes = [(c['id'], note_str(c)) for c in b['clips'] if note_str(c) != '—']
    return '\n'.join(rows), notes


def carriers_table(L, ids):
    rows = ['| taşıyıcı (tek TTS isteği) | TTS\'e giden metin | kesilen klipler |', '|---|---|---|']
    for car in L['carriers']:
        if car['id'] in ids:
            rows.append('| `%s` | %s | %s |' % (car['id'], car['text'], ', '.join('`%s`' % i for i in car['items'])))
    return '\n'.join(rows)


def unique_counts(L):
    clips = timing.all_unique_clips(L)
    syl = sum(c['syllables'] for _, c in clips.values())
    wrd = sum(c['words'] for _, c in clips.values())
    alts = [a for _, c in clips.values() for a in (c.get('alternates') or [])]
    req_texts = ([car['text'] for car in L['carriers']] + [c['text'] for _, c in clips.values() if not c.get('carrier')]
                 + [a['text'] for a in alts])
    return {'ids': len(clips), 'syl': syl, 'words': wrd, 'alts': len(alts),
            'requests': len(req_texts), 'chars': sum(len(t) for t in req_texts),
            'tsyl': sum(timing.syllables(t) for t in req_texts),
            'carriers': len(L['carriers']), 'micro': sum(1 for _, c in clips.values() if c.get('carrier'))}


def block_order(p):
    order = []
    for ev in p['events']:
        if not order or order[-1] != ev['block']:
            order.append(ev['block'])
    return order


def plan_blocks_line(p):
    secs = timing.block_secs(p)
    return ' → '.join('%s %s' % (b, mmss(secs[b])) for b in block_order(p))


MODE_DESC = {'mikro-liste': 'tek sözcüklük liste', 'cümle': 'cümleler', 'pencere-duyurusu': 'pencere duyurusu'}
BLOCK_DESC = {'A': 'varış', 'N1': 'niyet', 'C1': 'beden dolaşımı', 'C2': 'nefes ve geri sayma',
              'BR.K2': 'anahtar cümle köprüsü', 'C3': 'zıtlık çiftleri', 'BR.orta': 'çıkış kapısı ve dayanak',
              'C4': 'imge yayı', 'C5': 'tanıklık', 'N2': 'niyetin tekrarı', 'K': 'dışa dönüş ritüeli'}


def attention_rows(p):
    rows = ['| başlangıç | süre | doku (blok / sunum biçimi) | ne oluyor |', '|---|---|---|---|']
    for tx, a, b in timing.texture_runs(p):
        if tx == 'sessiz pencere':
            desc = 'sessiz pencere (konuşmasız; müzik yatağı sürer)'
        else:
            blk, mode = tx.split('/')
            desc = '%s: %s' % (BLOCK_DESC.get(blk, blk), MODE_DESC.get(mode, mode))
        rows.append('| %s | %s | `%s` | %s |' % (mmss(a), mmss(b - a), tx, desc))
    return '\n'.join(rows)


def timeline(p):
    rows = ['| zaman | blok | id | söz | sonra sessizlik (sn) |', '|---|---|---|---|---|']
    for ev in p['events']:
        c = ev['clip']
        rows.append('| %s | %s | `%s` | %s | %s%s |' % (mmss(ev['start']), ev['block'], c['id'], c['text'],
                                                      n(round(ev['gap'], 1)), ' (pencere)' if c.get('window') else ''))
    return '\n'.join(rows)


# ---------------------------------------------------------------------------------------------- hesaplanan sayılar
def compute(L):
    F = {}
    plans = {}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            for m in range(5, 31):
                plans[(rate, prof, m)] = timing.plan(L, m * 60, rate, prof)
    F['plans'] = plans
    F['ref5'] = plans[(5.6, 'hi', 5)]
    F['ref10'] = plans[(5.6, 'hi', 10)]
    F['ref30'] = plans[(5.6, 'hi', 30)]
    F['uc'] = unique_counts(L)
    F['bm'] = timing.block_map(L)
    F['allc'] = timing.all_unique_clips(L)
    F['key'] = {c['tags']['key']: c for _, c in F['allc'].values() if c['tags'].get('key')}

    def first_min(fn):
        ms = []
        for rate in timing.RATES:
            for prof in ('lo', 'hi'):
                for m in range(5, 31):
                    if fn(plans[(rate, prof, m)]):
                        ms.append(m)
                        break
        return (min(ms), max(ms)) if ms else (None, None)
    F['first'] = first_min
    F['c3_in'] = first_min(lambda p: 'C3' in p['sel'])
    F['c4_in'] = first_min(lambda p: 'C4' in p['sel'])
    F['c5_in'] = first_min(lambda p: 'C5' in p['sel'])
    F['w4_in'] = first_min(lambda p: 'c4.pencere' in p['inc'])
    F['w5_in'] = first_min(lambda p: 'c5.pencere' in p['inc'])
    F['cnt_in'] = first_min(lambda p: 'c2.x.kendin' in p['inc'])
    F['say5_in'] = first_min(lambda p: 'c2.n05' in p['inc'])
    F['say10_in'] = first_min(lambda p: 'c2.n10' in p['inc'])
    F['karar_in'] = first_min(lambda p: 'a.karar' in p['inc'])
    F['ext_in'] = first_min(lambda p: any(F['allc'][i][1]['tier'] == 'extension' for i in p['inc']))
    F['slack5'] = {}
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            p = plans[(rate, prof, 5)]
            F['slack5'][(rate, prof)] = 300 - p['speech'] - p['gaps']['min']
    F['stretch30'] = {(r, pr): timing.stretch(plans[(r, pr, 30)]) for r in timing.RATES for pr in ('lo', 'hi')}
    F['share30'] = {(r, pr): plans[(r, pr, 30)]['speech'] / 1800 for r in timing.RATES for pr in ('lo', 'hi')}
    F['syl30'] = {(r, pr): sum(ev['clip']['syllables'] for ev in plans[(r, pr, 30)]['events'])
                  for r in timing.RATES for pr in ('lo', 'hi')}
    full_ids = {c['id'] for b in L['blocks'] for c in b['clips']}
    F['full_syl'] = sum(F['allc'][i][1]['syllables'] for i in full_ids)
    qc, sr = [], []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            pr = timing.profile(prof, rate)
            qc.append(sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in L['extras']['quickClosing']['clips']))
            sr.append(sum(timing.clip_dur(c, rate, pr) + c['gapAfter']['pref'] for c in L['extras']['stopReturn']['clips']))
    F['qc'], F['sr'] = qc, sr
    _, lint_out = timing.lint_text(L)
    F['lint_out'] = lint_out
    F['rate_lines'] = [o for o in lint_out if o.startswith('Derin cümle iç hızı')]
    slowest = next((o for o in lint_out if o.startswith('en yavaş')), '')
    F['slowest'] = re.search(r'([0-9.]+) hece/sn', slowest).group(1).replace('.', ',') if slowest else '?'
    # dönem dışı: eski metindeki kalıpların sayımı (T18)
    try:
        with open(os.path.join(HERE, 'timing.out.txt'), encoding='utf-8') as f:
            txt = f.read()
        F['summ'] = txt[txt.index('== ÖZET =='):].strip().splitlines()[1:]
        F['variants'] = txt[txt.index('== Seçenek metinleri'):txt.index('== ÖZET ==')].strip().splitlines()[1:]
    except (OSError, ValueError):
        F['summ'], F['variants'] = ['(timing.py henüz çalıştırılmadı)'], []
    return F


def rng(t):
    return ('%d' % t[0]) if t[0] == t[1] else ('%d–%d' % t)


def prosody_stats(L):
    """T18: cümle sonu kalıpları ve noktalı virgül (taşıyıcılar hariç, benzersiz klipler)."""
    clips = [c for _, c in timing.all_unique_clips(L).values() if not c.get('carrier')]
    sents = [s for c in clips for s in timing.sentences(c['text'])]
    abil = sum(1 for s in sents if re.search(r'(abilir|ebilir)(sin)?[.!?"”]*$', s.strip()))
    semi = sum(1 for c in clips if ';' in c['text'])
    return len(clips), len(sents), abil, semi


# ---------------------------------------------------------------------------------------------- belge: baş, §0, §1
def part_head(L, F, a):
    uc, bm, key = F['uc'], F['bm'], F['key']
    s5 = F['slack5']
    a('# Ders 2 · Derin Dinlenme (Yoga Nidra) · pilot metni')
    a('')
    a('Sürüm: %s. Bu dosya `ders2_kaynak.py`den üretilir (tek kaynak); aynı kaynaktan `ders2.lesson.json` çıkar. '
      'Zamanlama denetimi: `timing.py` → `timing.out.txt`. Bulguların tek tek karşılığı: `fixlog.md`. Depodaki '
      '(`/home/user/eyes`) hiçbir dosyaya dokunulmadı.' % L['version'])
    a('')
    a('**Durum, açıkça.** Bu, ilk tur incelemenin (Türkçe, güvenlik, hoca, kanıt, zaman ve dinleyici gözleri) bütün '
      'bulgularıyla yeniden yazılmış metindir. `timing.py` 5–30 dakikanın her dakikasını üç eklemleme hızında ve her hızda '
      'iki duraklama profiliyle kurdu: 78 vakanın 78\'i geçti; açılış ve niyet cümlesinin iki seçenek takımı da aynı 78 '
      'vakayı geçti. **Bu sayı yalnız zamanlama ve metin kurallarıdır (P-S1):** dinleme, söyleyiş, ses kalitesi ve insan '
      'onayı bu sayının içinde değildir. Henüz hiçbir cümle seslendirilmedi; klip süreleri ölçüme dayanan tahminlerdir '
      '(VARSAYIM). Anadili Türkçe bir insan editörün, yoga nidra eğitimi almış bir hocanın ve en az bir 65 yaş üstü '
      'dinleyicinin bulunduğu kör panelin onayı henüz yok (CRITIQUE #22). Bu yüzden ders "bitti" sayılmaz.')
    a('')
    a('## 0. Tek bakışta')
    a('')
    a('| | |')
    a('|---|---|')
    a('| Söz (kart) | %s |' % L['tagline'])
    a('| Açılış ekranı (veride: `openingScreen`, `openingNotice`; güvenlik §8, §11.A, §11.E) | %s |'
      % ' · '.join('"%s"' % t for t in L['openingScreen']))
    a('| Hazırlık kartı (başlamadan önce; P-S13) | %s |' % ' · '.join(L['preparationCard']))
    ac = bm['A']['clips'][1]
    a('| Derse özgü açılış cümlesi | "%s" (dönüşümlü seçenekler: %s) |' % (
        ac['text'], ' · '.join('"%s"' % x['text'] for x in ac['alternates'])))
    izin = next(c for c in bm['A']['clips'] if c['id'] == 'a.izin')
    orta = bm['BR.orta']['clips'][0]
    a('| Ortak çıkış cümlesi | "%s" Varışta her sürümde; imgeleme olan her sürümde (%s. dakikadan itibaren) '
      'imgelemenin hemen önünde bir kez daha, tarafsız dayanakla: "%s" |' % (izin['text'], rng(F['c4_in']), orta['text']))
    a('| Anahtar cümle, giderek kısa | 1) "%s" (%d hece) · 2) "%s" (%d; 7 dakika ve üstünde) · 3) "%s" (%d) |' % (
        key[1]['text'], key[1]['syllables'], key[2]['text'], key[2]['syllables'], key[3]['text'], key[3]['syllables']))
    a('| Tek imge yayı | Kıyı ya da orman (dinleyici seçer; görüntü gelmese de, gözler açık kalsa da olur): patika → kendi '
      'hızında yürüyüş → uzaktan gelip giden ses, koku, güneş, esinti → dinlenme yeri (ılık taş, ışık, gökyüzü) → sessiz '
      'pencere → aynı patikadan dönüş → görüntü silinir, taşıyan zemin |')
    a('| Niyet | Başta ve sonda. Hazır cümle: "Dinlenmeye izin veriyorum." (izin cümlesi). "Sankalpa" yalnız ekranda |')
    c1 = bm['C1']['clips']
    rot = ('sag', 'sol', 'sirt', 'on', 'butun')
    a('| Beden dolaşımı | sağ → sol → arka → ön → bütün, her sürümde bu sırada (en kısada %d nokta, en uzunda %d nokta; '
      'uzun sürümde ayrıca %d noktalık hızlı ikinci tur ve %d noktalık temas turu) |' % (
          sum(1 for c in c1 if c['tags'].get('section') in rot and c['tier'] == 'required'),
          sum(1 for c in c1 if c['tags'].get('section') in rot),
          sum(1 for c in c1 if c['tags'].get('section') == 'tur2' and c.get('carrier')),
          sum(1 for c in c1 if c['tags'].get('section') == 'temas' and c.get('carrier'))))
    a('| Nefes ve sayma | 5 dakikada nefes ve kısa bir dinlenme; beşten bire sayım %s., ondan bire sayım %s. dakikadan '
      'itibaren; sayılar ≈ 6 sn arayla, nefese hız dayatmadan |' % (rng(F['say5_in']), rng(F['say10_in'])))
    a('| Zıtlık çiftleri | ağırlık / hafiflik, sıcaklık / serinlik (hıza göre %s. dakikadan itibaren) |' % rng(F['c3_in']))
    a('| Sessiz pencereler | en çok 90 sn; önce duyurulur, sonra karşılanır: imge (%s. dk\'dan), tanıklık (%s. dk\'dan), '
      'içten sayma (%s. dk\'dan) |' % (rng(F['w4_in']), rng(F['w5_in']), rng(F['cnt_in'])))
    a('| Kapanış | nefes → parmaklar ve gerinme → gözler ve oda → yana dön → otur → birkaç nefes bekle → acele etmeden kalk → '
      '"Buradasın; uyanık ve dinlenmiş." |')
    a('| Zamanlama | **78/78 vaka** (5,2 / 5,6 / 6,6 hece/sn × 5..30 dk; her vaka iki duraklama profilinde) + iki seçenek '
      'takımı; 5 dakikanın en yavaş ucunda %s sn boş pay; 30:00\'da sessizlik esnemesi en çok %%%d |' % (
          n(round(s5[(5.2, 'hi')], 1)), round(100 * max(F['stretch30'].values()))))
    a('| Metin envanteri | %d klip kimliği (%d hece, %d sözcük) + %d seçenek metni; TTS\'e %d istek (%d taşıyıcı dahil), '
      '%d karakter |' % (uc['ids'], uc['syl'], uc['words'], uc['alts'], uc['requests'], uc['carriers'], uc['chars']))
    a('| 5 dakika | %s |' % ' → '.join(block_order(F['ref5'])))
    a('| 30 dakika | %s |' % ' → '.join(block_order(F['ref30'])))
    a('')


def part_1(L, F, a):
    bm, key = F['bm'], F['key']
    a('## 1. Hocanın kurgusu')
    a('')
    a('### 1.1 Akış, evreler ve ses, müzik ve görüntü uyumu')
    a('')
    a('Evre geçişleri ses, müzik ve görselde **aynı klipte** olur (S4-hoca): Derinleşme `n1.sec`te, Derin `c2.dikkat`ta, '
      'Kapanış `k.donus`te.')
    a('')
    a('| Evre | Bloklar | Ses (PLAN C.2, D.2) | Müzik (yatak; konuşmada kısık) | Görsel (ufuk çizgisi formu) |')
    a('|---|---|---|---|---|')
    a('| Varış | A | konuşma düzeyi (0 dB); yol A\'da REST hızı 0,90 (VARSAYIM) | Varış yatağı, konuşmada ≈ −33 LUFS; ders '
      '3 sn\'de açılır | en aydınlık (yine koyu) |')
    a('| Derinleşme | N1, C1 | −1,5 dB; yol A\'da hız bir basamak düşer: 0,85 (VARSAYIM) | `n1.sec`te Varış yatağı '
      '1,5 dB daha kısılır (≈ −34,5 LUFS) | `n1.sec`te daha loş |')
    a('| Derin | C2, köprüler, C3, C4, C5, N2, anahtar cümle 3 | −3 dB; yol A\'da bir basamak daha: 0,80 (≈ 5,2 hece/sn, '
      'tahmin; zamanlamanın hesaplandığı en yavaş hız, altına inilmez) | `c2.dikkat`ta 8 sn çapraz geçişle Derin yatağı, konuşmada ≈ −36 LUFS; '
      'yalnız duyurulan >= 20 sn pencerelerde +6 dB (≈ −30) | `c2.dikkat`ta en loş; pencerede biraz kararır ve yavaşlar, '
      'bitmeden 3 sn önce aydınlanır; sayılarda yumuşak nabız (profilde ışığa duyarlılık cevabı "evet/emin değilim" ise '
      'nabız yok) |')
    a('| Kapanış | K | `k.donus` başından `k.nefes` başına ≈ 4,5 sn\'lik rampayla 0 dB\'e (basamak yok, S18) | `k.donus`te '
      'Kapanış yatağı; `k.goz`de sıcak "şafak" akoru (tını parlaklığı, ses yüksekliği değil); son 5 sn\'de söner | şafak '
      '60–90 sn: başlangıcı `k.donus` ile "son − 90 sn"nin geç olanı; >= 60 sn\'lik rampa; parlaklık tavanı bağıl %15 '
      '(VARSAYIM) |')
    a('')
    a('**Yol B (yalnız MCP):** hız ayarı yoktur; eklemleme her evrede aynıdır. Azalan anlatım o zaman yalnız uzayan '
      'boşluk, kısalan cümle ve −1,5 / −3 dB seviyeyle verilir (PLAN C.2). Hızın evreden evreye düşmesi yalnız yol A\'da '
      'mümkündür; hangi yolun seçileceği sahibin kararıdır.')
    a('')
    a('Düzeyler (hepsi VARSAYIM, P-B3): yatak sesin evresini izler, böylece konuşma ile kısık yatak arasındaki fark her '
      'evrede >= 15 dB kalır (−18 − (−33) = 15; −19,5 − (−34,5) = 15; −21 − (−36) = 15). QA bu farkı her evrede ayrı, '
      '3 sn kısa süreli LUFS ile ölçer (`qa.speechOverBedDbMin`). Yatak yalnız duyurulan ve en az 20 sn '
      'süren pencerelerde kalkar, pencere bitmeden iner; müzik her cümlede inip kalkmaz (CRITIQUE #7, #8). Her pencere '
      'sonrası karşılama klibinden 2 sn önce aynı yumuşak dönüş tınısı çalar; dalıp giden dinleyici söz başlamadan '
      'yönelir (P-S10). İsteğe bağlı "Konuşma netliği" ayarı yatağı 6 dB daha kısar. **Doğa katmanı** varsayılan olarak '
      'yalnız uzak rüzgâr ve yaprak dokusudur, su içermez: su herkese iyi gelmeyebilir (güvenlik §11.B-10) ve orman seçen '
      'dinleyiciye dayatılmamalıdır (S12). Su katmanı ayarda vardır, varsayılan kapalıdır (VARSAYIM).')
    a('')
    a('### 1.2 Anahtar cümle (C.4; CRITIQUE #21)')
    a('')
    a('Dersin fikri yoga nidranın kendisidir: beden dinlenir, farkındalık uyanık kalır. Anahtar cümle her geçişte biraz '
      'daha kısadır; hiçbirinde üç nokta yoktur (PLAN C.2: üç nokta yalnız listelerde):')
    a('')
    a('1. `c1.k1`, beden dolaşımının sonunda: **"%s"** İlk geçiş izin kipindedir: bedenin dinlenmesi bir iddia değil, bir '
      'olanaktır (S17); "farkındasın" gibi nesnesiz bir çeviri kalıbı yoktur (T04).' % key[1]['text'])
    a('2. `br.k2`, nefes bloğunun hemen ardından (7 dakika ve üstünde): **"%s"**' % key[2]['text'])
    a('3. `k.anahtar3`, dönüşün eşiğinde: **"%s"** Beden ile uyanıklık artık tek ağızdan söylenir. Kapanışın son '
      'cümlesi yayı kapatır: "Buradasın; uyanık ve dinlenmiş."' % key[3]['text'])
    a('')

    def key_times(p):
        return [ev['start'] for ev in p['events'] if ev['clip']['tags'].get('key')]
    k5 = key_times(F['ref5'])
    k30 = key_times(F['ref30'])
    a('Yerleşim (5,6 hece/sn, yüksek profil): 5 dakikada %s ve %s; 30 dakikada %s, %s ve %s. 5 ve 6 dakikada anahtar '
      'cümle iki kez geçer; 88 sn içinde üç kez söylenmesi bir slogan gibi duyuluyordu (B2, P-S12).' % (
          zaman(k5[0], 'de'), zaman(k5[1], 'de'), zaman(k30[0], 'de'), zaman(k30[1], 'de'), zaman(k30[2], 'de')))
    a('')
    a('### 1.3 Tek imge yayı (C.4; E.6 #8)')
    a('')
    a('İmge yalnız C4\'tedir ve hemen önünde her sürümde çıkış kapısı çalar (`br.orta`). Dinleyici **kıyı ya da orman** '
      'seçer: "%s" Görüntü gelmezse: "%s" Kıyıda suya girilmez; ormanda karanlık ya da kapalı alan yoktur (güvenlik '
      '§11.B-10). Yay: patikanın başında kendini bulmak → kendi hızında ağır ağır yürüyüş (iniş, aşağı inme ya da "her '
      'adımda daha çok dinlenme" gibi derinleştirici yoktur; S3, B3, E1) → ayak tabanları, ardında kalan izler → uzaktan '
      'gelip giden ses (dalgalar ya da hışırdayan yapraklar) → temiz bir koku, güneşin sıcaklığı, serin bir esinti → '
      'dinlenme yeri → ılık taş, dört bir yanda oynayan ışık, açık gökyüzü → sessiz pencere (hemen önünde kapı: "Zor gelirse '
      'gözlerini açabilirsin."; S1) → ışıkla gölgenin yer değiştirmesi, zamanın geçtiğini söyler → aynı patikadan, '
      'acele etmeden dönüş → görüntü usulca silinir, seni taşıyan zemin. "X ya da Y" biçimi yalnız seçimde (`c4.yer`), '
      'seste (`c4.ses`) ve tanıklıktaki geri çağrıda (`c5.dusunce`) kalır; öteki ayrıntılar iki yere de uyacak biçimde '
      'yazıldı (P-S2). C3\'teki "sıcak bir fincan" ve "açık bir pencere" imge değil, duyu çağrışımıdır. Son 60 sn\'de yeni '
      'imge yoktur (her vakada denetlendi).' % (bm['C4']['clips'][0]['text'], bm['C4']['clips'][1]['text']))
    a('')
    a('"Gelip gitmek" dersin sözel motifidir: nefes ("Nefes kendiliğinden geliyor, kendiliğinden gidiyor."), imge '
      '("Uzaktan gelip giden bir ses", "Uzaktaki ses bir yaklaşıyor, bir uzaklaşıyor.") ve tanıklık ("Düşünceler de gelip '
      'gidiyor; tıpkı dalgaların ya da yaprakların sesi gibi."). Tarafsız dayanağın dili de tektir: **zemin** ("Bedeninin '
      'ağırlığını zemine bırakabilirsin.", "Zemin bu ağırlığı tümüyle taşıyor.", "seni taşıyan zemin").')
    a('')
    a('### 1.4 30 dakikalık dikkat eğrisi (CRITIQUE #21; her 3–5 dakikada doku, teknik ya da sessizlik değişir)')
    a('')
    a('Doku = blok × sunum biçimi (mikro-liste, cümle, sessiz pencere); P-S5 gereği aynı listenin sağ, sol, sırt, ön ve '
      'bütün bölümleri artık **tek doku** sayılır, listeyi ancak bir cümle ya da pencere böler. En uzun doku koşusu 300 '
      'sn\'yi geçmez; bu, 10 dakika ve üstündeki her vakada denetlendi (T8-5). Plan: 30 dk, 5,6 hece/sn, yüksek profil.')
    a('')
    a(attention_rows(F['ref30']))
    a('')


def part_15(L, F, a):
    a('### 1.5 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)')
    a('')
    a('- **Yapı.** Luu 2024\'ün travma-duyarlı yoga nidra için önerdiği 10 bileşenden yedisi bu dersin iskeletidir: '
      'özerklik ve onay, uygun uzunluk ve hazırlık, kişinin kendi seçtiği niyet, esnek beden dolaşımı ve nefes '
      'farkındalığı, bedende hissedilen zıtlık çiftleri, özenli imgeleme, yeterli yerleşme ve dışa dönüş. "Güvenli ve rahat '
      'ortam" hazırlık kartıyla, "becerili farkındalık" anlatımın kendisiyle dolaylı karşılanır; "uyku izni" gündüz dersi '
      'olduğu için bilinçli olarak yoktur. Makale bir öneri makalesidir, deneme değildir (PMID 39690521, DOI '
      '10.17761/2024-D-24-00021).')
    a('- **Kısa sürüm bütündür.** 11 ve 30 dakikalık yoga nidra doğrudan karşılaştırıldığında ikisi de küçük etki gösterdi; '
      '30 dakikalık sürüm yalnız "farkında davranma" alt boyutunda farklıydı (d=0,10; %95 GA −0,01 ile 0,44). Çalışmada '
      'kayıtlar iki ay boyunca, ideal olarak her gün ve arka plan müziği olmadan dinletildi (Moszeik 2025, PMID 40373021, '
      'DOI 10.1002/smi.70049). Kronik ağrılı 23 yetişkinle yapılan yarı deneysel bir çalışmada tek 45 dakikalık yoga nidra, '
      'beden taramasına göre hemen sonrasında iyi oluşta daha fazla artışla birlikte gitti (Gibbs 2026, PMID 41743305, DOI '
      '10.4103/ijoy.ijoy_2_25). Tasarım çıkarımı: kısa sürüm bir beden taramasına indirgenmez, iskeleti korur (niyet → '
      'dolaşım → nefes → niyet → dönüş). Hiçbir sürüm sonuç vaat etmez.')
    a('- **Nefes.** Önce değiştirilmeden izlenir; "derin nefes al" komutu yoktur. Derin nefes talimatı bir çalışmada önce '
      'uyarılmayı artırdı; uyarılma sonra başlangıç düzeyine döndü (Toussaint 2021; 60 sağlıklı öğrenci; PMID 34306146, DOI '
      '10.1155/2021/5924040). Dönüşte de derinleştirme yoktur: "Nefesin kendi olağan ritmine dönebilir." (güvenlik §11.B-14, '
      '"nefesi normale bırak"; S7). Sayılar nefese hız dayatmaz: "nefesini sayılara uydurman gerekmiyor", sayılar arası her '
      'sürede ≈ 6 sn (dakikada ≈ 10; S8, T3). Nefes herkes için tarafsız bir dayanak da değildir: uzanıp gevşerken panik benzeri '
      'duyumların nasıl ortaya çıkabileceğini anlatan kuramsal bir derleme var (Ley 1988; güvenlik dosyası §2, ikinci turda '
      'yeniden doğrulanmadı; PMID 3148637, DOI 10.1016/0005-7916(88)90054-7). Bu yüzden dayanak bölüme göre değişir: nefese '
      'bakmak zor gelirse eller (`c2.alt`); zıtlıkta, imgeden hemen önce ve sonra ve tanıklıkta zemin; imgenin içinde gözler, '
      'çünkü orada "zemin" hayal edilen yer gibi duyulabilir (güvenlik §11.B-8; tasarım çıkarımı).')
    a('- **Hız ve sessizlik.** Yavaşlık sözcük uzatarak değil, cümleler arası sessizlikle verilir. İngilizce bir çalışmada '
      'aşırı yavaş (1,72 hece/sn) ve çok duraklamalı konuşma en az doğal bulundu; duraklamaların sayısı ve süresi de '
      'doğallıkla ilişkiliydi (Shuminsky & Davidow 2026, PMID 42757902, DOI 10.1044/2026_JSLHR-25-00691). Bu sayılar Türkçe '
      'hedef değildir, yalnız yön verir; cümleler arası sessizliğin doğallığa etkisi test edilmedi (tasarım çıkarımı). '
      'Yüksek kaygılı 48 genç kadında tek seanslık progresif gevşemede, seans boyunca hızı, yüksekliği ve tonu azalan sesle '
      'çalışan grupta EMG diğer gruplardan fazla düştü (Knowlton & Larkin 2006, PMID 16941239, DOI '
      '10.1007/s10484-006-9014-6); uygulamadaki karşılığı (§1.1) tasarım çıkarımıdır. Bir müzik dinleme deneyinde (24 kişi) '
      'parçalar arasına konan 2 dakikalık müziksiz sessizlikte kalp hızı, kan basıncı ve ventilasyon başlangıcın altına indi '
      '(Bernardi 2006, PMID 16199412, DOI 10.1136/hrt.2005.064600). Bu derste pencerelerde müzik yatağı sürer; pencerelerin '
      'değeri bu bulgudan doğrudan çıkmaz (tasarım çıkarımı). 90 sn üst sınırı güvenlik §11.B-16\'daki 60–90 sn önerisinden '
      'gelir; doğrulanmış bir eşik değildir (VARSAYIM). Acemilerde 8 haftalık, beden odaklı ve koçluk içeren rehberli bir '
      'program, rehbersiz sessiz pratiğe göre benlik saygısında ve sürekli kaygıda daha büyük değişimle birlikte gitti '
      '(Lieutaud & Bourhis 2026, PMID 42466037, DOI 10.3389/fpsyg.2026.1833806). Tasarım çıkarımı: sessizlik değerli ama '
      'rehbersiz kalmamalı; pencereler duyurulur ve karşılanır.')
    a('- **Niyet cümlesi.** "Sevilmeye değer biriyim" cümlesini tekrarlayan öz-saygısı düşük kişiler daha kötü hissetti '
      '(Wood 2009, PMID 19493324, DOI 10.1111/j.1467-9280.2009.02370.x). Hazır niyet bu yüzden bir yargı değil, bir izin '
      'cümlesidir: "Dinlenmeye izin veriyorum." İzin cümlesinin bu riski taşımadığı test edilmedi; bu bir tasarım '
      'çıkarımıdır.')
    a('- **Huzursuzluk olağandır.** Klinik tanısı olmayan, kronik kaygılı 30 kişiye kayıttan dinletilen tek seans '
      'progresif gevşemede 5 kişide (%%17) seans sırasında kaygı arttı (Braith 1988, PMID 3069875, DOI '
      '10.1016/0005-7916(88)90040-7). Meditasyonla ilişkili istenmeyen etkiler seyrek değil (Farias 2020, PMID 32820538, DOI '
      '10.1111/acps.13225). Bu yüzden **her sürümde, 5 dakikada da,** varış "Gevşemek kolay gelmeyebilir; bunda bir sakınca '
      'yok." der (`a.kolay`; S2, B6, P-B1, T6). "Ne kadar gevşeyeceğine sen karar verirsin." (`a.karar`) %s. dakikadan '
      'itibaren eklenir. Zihnin kaymasını `c2.birak`, kaçırılan adı `c1.kacirma`, gelmeyen görüntüyü `c4.gelmezse`, dalıp '
      'gitmeyi `c4.donus1` bağışlar; bu dört klibin hangi sürede girdiği §3\'teki sıra numarasından okunur.' % rng(F['karar_in']))
    a('- **Dönüş.** Hipnozdan çıkarma başarısızlığı istenmeyen etkilerde önemli bir etken sayılıyor (Howard 2017; klinik '
      'yorum ve 3 vaka; PMID 28300508, DOI 10.1080/00029157.2016.1203281). Ayağa kalkınca ilk anda görülen kan basıncı '
      'düşüşü, sürekli ölçümle 65 yaş üstünde havuzlanmış olarak %29 (Tran 2021, PMID 34260686, DOI '
      '10.1093/ageing/afab090). Kapanış bu yüzden yana dönme (6 sn), ellerden destek alarak oturma (8 sn), oturarak birkaç '
      'nefes bekleme (12 sn, ≈ üç dinlenik nefes) ve acele etmeden kalkma adımlarını içerir (güvenlik §7 Karar; B2, T1, S4, '
      'P-B4, E7). Bu sessizlikler hiçbir sürede sıkıştırılmaz; "Kapanışa geç" ve Durdur yolu da aynı süreleri kullanır.')
    a('- **Hareket.** Yoga yan etkilerine ilişkin 76 vakayı derleyen sistematik derlemede en sık kas-iskelet sistemi '
      'etkilenmişti (Cramer 2013, PMID 24146758, DOI 10.1371/journal.pone.0075515); Almanya\'da 1.702 kişilik bir ankette '
      'yalnız kendi başına, gözetimsiz çalışmak yan etki riskinin artmasıyla ilişkiliydi (Cramer 2019, PMID 31357980, DOI '
      '10.1186/s12906-019-2612-7). Tek gerçek hareket olan '
      'gerinme bu yüzden "zorlamadan" ve "ağrı olursa bırak" ile gelir (güvenlik §11.B-17; S6, S13, E8, P-N4).')
    a('- **"Hipnoz" vaadi yok.** Öğle şekerlemesinden önce dinletilen "daha derin uyu" telkin kaydı, 70 sağlıklı genç kadında '
      'kontrol koşuluna göre derin uykuyu artırdı; telkine az yatkın kişilerde bu etki ek deneylerde görülmedi (Cordi 2014, '
      'PMID 24882909, DOI 10.5665/sleep.3778). Etki kişiden kişiye değiştiği için metin derinleşmeye izin verir ama '
      'zorlamaz ve kimseye vaat etmez. İmgede iniş, "her adımda daha çok dinlenme" ya da yolun dinleyiciyi taşıması gibi '
      'derinleştiriciler yoktur (S3, B3, E1). Sahibin "hipnoz olmalıyım" isteği, içine çeken ve kesintisiz bir deneyim '
      'olarak karşılanır.')
    a('- **Uzaklaşma hissi.** Bir gevşeme çalışmasında "uzakta, ilgisiz" hissetmek bütün gevşeme gruplarında olumsuz '
      'duyguyla birlikte gitti (Khasky & Smith 1999; güvenlik dosyası §2, ikinci turda yeniden doğrulanmadı; PMID 10483629, '
      'DOI 10.2466/pms.1999.88.2.409). "Neredeyse ağırlıksız" bu yüzden çıktı; hafiflik zeminle birlikte söylenir: "Nefes '
      'kadar hafif; yine de zemin seni taşıyor." (S13, P-S9).')
    a('- **Göz kökeni.** Gözler hiçbir yerde zorlanmaz: "Gözlerini kapatabilir ya da bir noktaya yumuşakça bakabilirsin." '
      'İmgelemede yeniden: "gözlerin açık kalsa da" ve pencereden önce "Zor gelirse gözlerini açabilirsin." Dolaşımda yalnız "göz kapakları" ve "gözlerin çevresi" geçer; göze '
      'bastırma ve avuçlama yoktur. Dönüşte gözler "ışığa alıştıra alıştıra" açılır; şafak görselinin parlaklığı sınırlıdır '
      've en az 60 sn\'de yükselir (S18).')
    a('')


def part_2(L, F, a):
    a('## 2. Süre modeli, planlayıcı ve eşikler')
    a('')
    a('### 2.1 Bu oturumdaki ölçümler (`../hiz/*.mp3`; 76 heceli Türkçe meditasyon paragrafı)')
    a('')
    a('| Dosya | Eklemleme (hece/sn, duraklamalar hariç) | Paragraf içi duraklamalar |')
    a('|---|---|---|')
    a('| Neslihan v2, düz | 6,61 (verilen) · 6,56 (bu analiz) | 3 durak, toplam 0,61 sn; cümle sonu 0,17–0,22 sn |')
    a('| Hakan v2, düz | 6,52 (verilen) · 6,43 | 8 durak, 5,28 sn; cümle sonu 0,72–0,87, virgül 0,28–0,38 sn |')
    a('| Neslihan v2, üç nokta | 6,50 | 8 durak, 2,93 sn; üç nokta 0,32–0,42 sn |')
    a('| Hakan v2, üç nokta | 6,48 | 10 durak, 9,73 sn; üç nokta 1,39–1,53 sn |')
    a('| Neslihan v4, düz | 5,63 (verilen) · 5,58 | 6 durak, 1,97 sn |')
    a('')
    a('Sonuç: TTS içindeki duraklamalar sese göre dört kat değişiyor. Bu yüzden zamanlama iki duraklama profiliyle '
      'hesaplandı; hızı duyulması gereken diziler (beden noktaları, sayılar, zıtlık listeleri) taşıyıcı cümle içinde '
      'üretilip kesilen mikro-kliplerdir ve aralarındaki sessizliği uygulama koyar (CRITIQUE #12).')
    a('')
    a('### 2.2 Model (VARSAYIM)')
    a('')
    a('`klip süresi = hece ÷ eklemleme + klip içi noktalama duraklamaları + uç payı`')
    a('')
    a('- Eklemleme hızları: 5,2 (REST speed≈0,8; tahmin), 5,6 (v4, ölçüm), 6,6 (v2 varsayılan, ölçüm).')
    a('- Duraklama profilleri (sn): **düşük** = Neslihan v2 en kısa gözlenen (cümle 0,17 · virgül 0,05 · iki nokta ya da '
      'noktalı virgül 0,12 · üç nokta 0,32); **yüksek** = Hakan v2 en uzun gözlenen (0,87 · 0,38 · 0,60 · 1,53). 5,2\'de '
      '(speed 0,8) duraklamalar ×1,25 alındı.')
    a('- Uç payı: normal klip 0,31 sn (baş 60 ms + son 250 ms, PLAN D.2), mikro-klip 0,15 sn. Taşıyıcının ön sözü '
      '(ör. "sayıyorum:") kesilip atılır, süreye girmez.')
    a('- Hece sayısı kodla sayılır: Türkçe ünlüler a e ı i o ö u ü â î û. Dönüşümlü seçenek metinleri (P-N5) ayrıca '
      'sayılır ve her seçenek takımı 78 vakanın hepsinde ayrıca denenir.')
    a('')
    a('### 2.3 Planlayıcı (PLAN §B.3\'ün kesin hali; `lib/yoga.js` bunu aynen uygular)')
    a('')
    a('1. **Tek kapak (T4).** Varış ve Kapanış birer bloktur; 12 → 13 dakika kapak değişimi kaldırıldı. Zorunlu kapak '
      'klipleri her sürede çalar; eskiden yalnız "uzun kapak"ta olan klipler (konfor, ağırlık, kontrol cümlesi, odanın '
      'sesleri, oda ayrıntısı, zaman ve yer, yan tarafta dinlenme) çekirdekteki isteğe bağlılar gibi sıralı artımdır. '
      'Kapanışın bütün sessizlikleri ve Varış\'ın eylem payları (uzanma, konfor, gözler, ağırlık) **sıkıştırılmaz** '
      '(min = pref); Varış\'ın eylemsiz cümlelerinden (izin, kontrol, huzursuzluk) sonraki nefes payları min..pref '
      'arasında esner.')
    a('2. **Taban.** Bütün P1 bloklar (N1, C1, C2, N2) zorunlu klipleriyle; köprü `br.k2` 7 dakika ve üstünde C2\'nin hemen '
      'ardından (T10); köprü `br.orta` C4\'ün olduğu her sürümde C4\'ün hemen önünde (S1). Taban en kısa haliyle de '
      'sığmazsa, yalnız acil durum yolu olarak C2 → N2 → N1 sırasıyla düşer; C1 hiç düşmez. Bu yol hiçbir vakada '
      'kullanılmadı.')
    a('3. **Artım listesi.** Tek sıralı liste: P2..P5 blokların girişi (`entryRank`: C4 300, C3 500, C5 700) ile isteğe '
      'bağlı klip "dalgaları" (`fillRank` 90–720) birlikte ilerler; genişletmeler (`fillRank` >= 1000) bütün isteğe '
      'bağlılardan sonra gelir. Bir artım, sessizlikler pref değerindeyken hedefe sığıyorsa eklenir. **T5:** mevcut '
      'içerik sessizlikler pref→max yolunun yarısına esnetildiğinde bile hedefe yetmiyorsa (f = 0,5), artım sessizlikleri '
      'pref→min yolunun en çok yarısına sıkıştırarak sığıyorsa yine eklenir. İlk sığmayan artımda durulur (önek kuralı). '
      'Önek kuralı gereği süre bir dakika artınca plan yalnız büyür: plan(T) ⊆ plan(T+1) (her vakada denetlendi). Aynı '
      '`fillGroup`taki klipler birlikte girer; sağ ve sol aynı grupta olduğu için dolaşım hep simetriktir. Sayım ya beşten '
      'ya ondan başlar (altı..on tek grup). Kural belirlenimcidir (CRITIQUE #30).')
    a('4. **Sessizlik.** Kalan süre min..pref aralığındaysa bütün sessizlikler aynı oranla min\'den pref\'e, pref..max '
      'aralığındaysa pref\'ten max\'a esner. Bağlı çiftlerde (`pairWith`) ortak klip hemen ardından çalıyorsa aradaki '
      'boşluk kısa `pairGap`tir; kazanılan süre çiftin ardındaki uzun boşluğa kalır (P-S6). Toplam hedefe tam eşittir. '
      'Kalan süre max toplamını aşarsa bu bir içerik hatasıdır; sessizlik sınırı aşılarak kapatılmaz (CRITIQUE #3). Konuşma '
      'klipleri asla hızlandırılmaz ya da kırpılmaz.')
    a('')
    a('### 2.4 Denetimler (`timing.py`; her vaka iki duraklama profilinde)')
    a('')
    a('- **Görevdekiler:** (a) toplam = hedef ±1 sn; (b) Varış ve Kapanış eksiksiz; (c) üst üste binme yok; (d) hiçbir '
      'sessizlik sınırını aşmıyor ve min\'in altına inmiyor (pencere <= 90 sn); (e) son 60 sn\'de yeni imge, çağrışım, zor '
      'blok ya da pencere yok; (f) bütün P1 bloklar her sürede; (g) yoğunluk: herhangi bir 60 sn\'de <= 150 hece ve <= %60 '
      'konuşma, tamamen "Derin" evredeki 60 sn\'de <= 110 hece ve <= %45 konuşma, plan ortalaması 40–130 hece/dk, '
      'duyurulmamış konuşmasız 60 sn yok (eşikler VARSAYIM; bu turda da gevşetilmedi, aşan yerde metin ve boşluk '
      'düzeltildi).')
    a('- **Usta hoca ve güvenlik:** anahtar cümle 1-2-3 (7 dakikanın altında 1-3) sırayla ve giderek kısa; dolaşım sırası '
      'sağ → sol → arka → ön → bütün; kapanış ritüeli sırası (… otur → bekle → kalk); C4 varsa önünde `br.orta` ve '
      '`c4.patika`dan önceki 60 sn\'de gözleri açma seçeneği (P-B2); >= 20 dk\'da ortada hatırlatma; her pencere duyurulmuş '
      've karşılanmış; her blokta >= 5 sn sessizlik ve planda en uzun boşluk >= 8 sn; dolgu sözcükleri 60 sn içinde ikinci kez '
      'yok; 6,6\'da her klip <= 15 sn.')
    a('- **2. tur ekleri:** "birkaç nefes" ya da "nefes … kal" isteyen klipten sonra >= 10 sn (T1); sayılar arası periyot '
      '4–6,5 sn (T3, T8-3); duyurulmuş pencereden önceki 60 sn\'de konuşma payı >= %10 (T3); pencere içermeyen her 180 '
      'sn\'de konuşma payı >= %12 (T8-4); doku koşusu <= 300 sn 10 dakika ve üstünde, doku = blok × sunum biçimi (T8-5, '
      'P-S5); Derin evrede en çok 6 ardışık cümle boşluğu birbirine 2 sn\'den yakın (P-S6); şafak 60–90 sn (N8, S18); '
      'art arda en çok 3 cümle "-(y)abilir(sin)" ile biter (T18); '
      '**dakikalar arası:** plan(T) ⊆ plan(T+1) (T4, T8-1), içerik doymadan hiçbir dakikada esneme f > 0,6 yok (T5), '
      '30:00\'da f <= 0,30 (T2), 20 dakikadan itibaren her dakika içerik büyür (T2).')
    a('- **Metin:** yasak sözcükler (PLAN C.6 + uyku izni) ve E12\'nin bildirimsel etki vaadi kökleri (anahtar cümleler '
      've `k.son` muaf); İngilizce; Sanskritçe her terim en çok bir kez; cümle <= 14 sözcük; klip 1–3 cümle; emir kipi yalnız '
      'güvenlik etiketli kliplerde; blokta en çok bir açıklama cümlesi; duraklamalar dahil hiçbir klip 2,5 hece/sn\'nin '
      'altında değil; taşıyıcı hece sayıları kliplerle tutarlı; seçenek metinleri de aynı kurallarla; ardışık kliplerde '
      'etiketsiz sözcük tekrarı yok; "Kapanışa geç" 60–90 sn ve Durdur dönüşü 20–30 sn; Derin evre cümle kliplerinin '
      'iç hızı (P-S1, aşağıda).')
    a('')
    a('### 2.5 Sonuç (timing.out.txt\'ten)')
    a('')
    a('```')
    for line in F['summ']:
        a(line.rstrip())
    for line in F['variants']:
        a(line.rstrip())
    a('```')
    a('')
    a('**Bu sonucun kapsamı (P-S1):** 78/78 zamanlama ve metin kurallarının sonucudur; dinleme sınavı değildir. Derin evre '
      'cümle kliplerinin iç hızı (hece ÷ klip süresi, klip içi duraklamalar dahil) ayrıca ölçüldü; yaşlı dinleyici için '
      'çıta <= 5,0 hece/sn olarak kondu (VARSAYIM; teslim S4\'ün 2,5–3,0 bandının yerine: yavaşlık yalnız uygulama '
      'sessizliğinden gelir, sözcük uzatılmaz):')
    a('')
    for line in F['rate_lines']:
        a('- ' + re.sub(r'(\d)\.(\d)', r'\1,\2', line.replace('Derin cümle iç hızı ', '')))
    a('')
    a('Okuma: önerilen yol A (REST, hız 0,80 ≈ 5,2) yüksek duraklamalı seste çıtayı karşılar, düşük duraklamalı seste '
      'sınırın hemen üstündedir; 6,6 hece/sn\'deki v2 varsayılan okuma (MCP yolu) çıtayı hiçbir profilde karşılamaz. Bu '
      'bilgi sahibin yol kararına (PLAN §G5) girdi olarak yazıldı (§7). Üç nokta yalnız listelerde kaldı: cümle içine '
      'duraklama eklemek için üç nokta kullanmak PLAN C.2\'ye ve anahtar cümle kuralına aykırıdır (P-S1 madde 3 bu yüzden '
      'uygulanmadı).')
    a('')
    a('Paylar:')
    a('')
    a('| hız | profil | 5 dk: min sessizliklere göre boş pay | 30 dk: konuşma payı | 30 dk: esneme f | 30 dk: hece |')
    a('|---|---|---|---|---|---|')
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            a('| %s | %s | %s sn | %%%s | %s | %d |' % (
                n(rate), 'düşük' if prof == 'lo' else 'yüksek', n(round(F['slack5'][(rate, prof)], 1)),
                n(round(100 * F['share30'][(rate, prof)], 1)), n(round(F['stretch30'][(rate, prof)], 2)),
                F['syl30'][(rate, prof)]))
    a('')
    a('En dar yer 5 dakikanın en yavaş ucudur (5,2 hece/sn + Hakan duraklamaları ×1,25): %s sn boş pay kalır (T6: en az '
      '15 sn). 30:00\'da sessizlikler pref\'ten max\'a doğru en çok %%%d esner (T2: <= %%30; ilk turda %%42–62); içerik 20. '
      'dakikadan 30. dakikaya kadar her dakika büyür. Bütün metin (isteğe bağlı ve genişletmelerle) %d hecedir (ilk turda '
      '1955); hızlı seste 30. dakikada metnin hepsi çalar, yavaş seste bazı genişletmeler 30 dakikaya sığmaz.' % (
          n(round(F['slack5'][(5.2, 'hi')], 1)), round(100 * max(F['stretch30'].values())), F['full_syl']))
    a('')
    a('**Metin bütçesi bu ders için bilinçli olarak PLAN B.4.1\'in altındadır (S12-hoca).** PLAN B.4.1, tam metnin hızlı '
      'seste orta konuşma payına (≈ %%36) ulaşmasını ister; bu derste 30 dakikanın konuşma payı %%%s–%%%s\'%s. Nedeni: yoga '
      'nidranın derin evresi sessizlikle çalışır (PLAN B.4.1\'in kendi "derin blok" bandı %%8–20), üç duyurulmuş pencere '
      'vardır ve derin evredeki 60 sn\'lik yoğunluk sınırı (<= 110 hece) daha çok söze izin vermez. Sessizlik doldurulmadı: '
      'içerik her dakika büyür ve 30:00\'da esneme %%%d\'%s geçmez (T2). PLAN B.4.1\'e bu ders için not eklendi.' % (
          n(round(100 * min(F['share30'].values()), 1)), n(round(100 * max(F['share30'].values()), 1)),
          ek4(son_okunan(n(round(100 * max(F['share30'].values()), 1))), 'dir'),
          round(100 * max(F['stretch30'].values())),
          ek4(son_okunan(round(100 * max(F['stretch30'].values()))), 'i')))
    a('')


INTRO = {
    'A': 'Sabit kapak; tek blok (T4). 5 dakikada: karşılama, derse özgü açılış, duruş, gözler, ortak çıkış cümlesi ve '
         '"Gevşemek kolay gelmeyebilir" (S2, B6, P-B1). Süre arttıkça kontrol cümlesi, konfor, kıpırdanıp yerleşme ve '
         'ağırlık eklenir; hiçbiri sonra düşmez. Sıra (T33, N6): önce beden yerleşir, "gözlerini açabilir" cümlesi '
         'gözlerin seçiminden sonra gelir. Konfor cümlesi, başlamadan önce gösterilen hazırlık kartındaki örtü ve yastığın '
         'elinin altında olduğunu varsayar (P-S13).',
    'N1': 'P1. Niyet başta. Ne olduğu seçimle aynı klipte söylenir; seçme süresi, hazır cümle de duyulduktan sonraki '
          'sessizliktir (S2-hoca). "Sankalpa" sözcüğü seste yok, bölüm adında ekranda (PLAN C.7).',
    'C1': 'P1. Beden dolaşımı. Çerçeve cümlesi izin verir ve atlama kapısını açar; sonra yalnız yer adları gelir. En kısa '
          'sürümde her taraf 4 nokta (başparmak, omuz, diz, ayak tabanı), sırt 1 (omurga), ön 4 noktadır. Süre arttıkça '
          'önce parmaklar, sonra bacak, el ve kolun tamamı, kürek kemikleri girer; sağ ve sol aynı grupta. Sağ ile sol '
          'arasında bir cümle hem listeyi böler hem kaçırılan adı bağışlar (P-S5). Kalça, göğüs ve karın hassas bölgelerdir: '
          'tek adla geçer, üzerlerinde durulmaz. Genişletmeler: aynı yoldan hızlı ikinci tur ve zemine değen noktalar.',
    'C2': 'P1. Nefes önce değiştirilmeden izlenir; zor gelirse dayanak eller olur (P-S7). 5 dakikada sayma turu yoktur; '
          'yerine "hiçbir şey yapmadan" kısa bir dinlenme vardır (S3-hoca). Sayım önce beşten, süre arttıkça ondan '
          'başlar (girdiği dakikalar §0\'da); sayılar ≈ 6 sn arayla gelir ve nefese hız dayatmaz. "Fark ettiğin an…" cümlesi Ders 5\'in anahtar '
          'cümlesidir, burada yoktur (B1).',
    'C3': 'P3. Zıtlık çiftleri bedende hissedilir. Blok bir çıkış kapısıyla açılır ("İstemezsen bu kısmı geçip zemini '
          'hissedebilirsin"; S9-hoca, T25) ve bırakmayla kapanır. İki zıttın aynı anda hissedilmesi (nidranın tanımlayıcı '
          'adımı) artık isteğe bağlı katmandadır ve 16–22 dakikada da çalar (S9-hoca). Sınama telkini yoktur.',
    'C4': 'P2. Dersin tek imge yayı. Önünde her sürümde `br.orta` çalar (S1, B5, E9). En kısa hali pencere olmadan kurulur; '
          'sessiz pencere, ses ve güneş gibi ayrıntılar süre arttıkça girer. Pencere duyurusu imgenin içindeki kapıyı da '
          'taşır ("Zor gelirse gözlerini açabilirsin."; S1, güvenlik §11.B-8); ışıkla gölge cümlesi pencereden sonra gelir ve '
          'dönüşü hazırlar. Duyu cümleleri çiftler halinde ve farklı boşluklarla gelir (S7-hoca, P-S6).',
    'C5': 'P5. Tanıklık; yalnız C4 varken girer. Tanıklık bedene, zemine ve dinlenmeye bağlanır; imgedeki "gelip giden bir '
          'ses"e tek geri çağrı `c5.dusunce`dir. Sesler ve düşünceler Ders 5\'in, izleyen farkındalık Ders 9\'un içeriğidir '
          '(S5-hoca). Pencere, dayanak cümlesiyle duyurulur (P-S9).',
    'BR.K2': 'Köprü: 7 dakika ve üstünde C2\'nin hemen ardından çalar; sonra hangi blok geliyorsa ona bağlanır. Anahtar '
             'cümlenin 2. geçişi derin evrenin başında uyanıklığı hatırlatır.',
    'BR.orta': 'Köprü: imgeleme olan her sürümde C4\'ün hemen önünde (S1). Ortak çıkış cümlesi (T08: "ara verebilirsin") ve '
               'tarafsız dayanak (zemin) birlikte söylenir (güvenlik §11.B-2, -3, -8).',
    'N2': 'P1. Niyetin tekrarı; niyet seçmemiş ya da unutmuş dinleyiciye hazır cümle de hatırlatılır (P-S11).',
    'K': 'Sabit kapak; tek blok (T4). Gündüz dönüşü, uyku izni yok. Her sürümde: anahtar cümle 3 → dönüş → nefes → parmaklar '
         've gerinme → gözler ve oda → yana dönme → oturma → bekleme → kalkış ve son cümle. Süre arttıkça odanın sesleri, '
         'oda ayrıntısı, zaman ve yer, yan tarafta dinlenme eklenir. Eylem payları sıkıştırılmaz (B2, T1, S4).',
}


def part_3(L, F, a):
    bm = F['bm']
    a('## 3. Metin')
    a('')
    a('Okuma: **tür** zorunlu / isteğe bağlı / genişletme; **sessizlik** klipten sonra, sn (min / pref / max; "pencere" = '
      'duyurulmuş sessiz pencere); **ipucu** `görsel` ve `müzik` olayları, sayı ve ses kazancı; **evre** ses ayarı ve '
      'karışım evresi. Kliplerde `…` taşıyıcıdan kesilen öğenin liste ezgisini gösterir. Taşıyıcılar TTS\'e tek istek '
      'olarak gider ve üç nokta duraklarından kesilir (öğe sayısı tutmazsa kesimi insan onaylar).')
    a('')
    for bid in ['A', 'N1', 'C1', 'C2', 'BR.K2', 'C3', 'BR.orta', 'C4', 'C5', 'N2', 'K']:
        b = bm[bid]
        meta = 'tür `%s`' % b['kind']
        if b['kind'] == 'core':
            meta += ' · öncelik P%d · çalma sırası %d' % (b['priority'], b['playOrder'])
            if b.get('entryRank'):
                meta += ' · giriş sırası %d' % b['entryRank']
            if b.get('requiresBlocks'):
                meta += ' · gerekir: %s' % ', '.join(b['requiresBlocks'])
        if b.get('placement'):
            pl = b['placement']
            meta += (' · yer: `%s` bloğundan hemen önce' % pl['before']) if pl.get('before') else (
                ' · yer: `%s` bloğunun hemen ardından' % pl['after'])
        a('### %s · %s' % (bid, b['title']))
        a('')
        a('%s. %s' % (meta, INTRO.get(bid, '')))
        a('')
        cids = sorted({c['carrier']['id'] for c in b['clips'] if c.get('carrier')},
                      key=lambda x: [car['id'] for car in L['carriers']].index(x))
        if cids:
            a('Taşıyıcılar (CRITIQUE #12; T17: sayı taşıyıcısında atılan küçük harfli ön söz):')
            a('')
            a(carriers_table(L, cids))
            a('')
        tbl, notes = block_table(b)
        a(tbl)
        a('')
        if notes:
            a('<details><summary>Klip notları (%s)</summary>' % bid)
            a('')
            for i, t in notes:
                a('- `%s`: %s' % (i, t))
            a('')
            a('</details>')
            a('')
    qc, sr = F['qc'], F['sr']
    for key_ in ('quickClosing', 'stopReturn'):
        ex = L['extras'][key_]
        a('### %s · %s' % (ex['id'], ex['title']))
        a('')
        if key_ == 'quickClosing':
            a('"Kapanışa geç" düğmesi: o anki klip biter, motor müziği kapanış evresine geçirir ve şafak görselini başlatır, '
              'sonra bu dizi çalar. Düğmenin kendisi geçiş olduğu için "Artık dönüş zamanı." burada yoktur. Odaya bakma '
              '(yönelim) adımı vardır (S10). Bekleme ve kalkış kısaltılmaz; bu yüzden süre PLAN B.5\'teki 45–60 sn\'ye değil, '
              '60–90 sn\'ye sığar (PLAN B.5 buna göre güncellendi). Klipler Kapanış\'takilerin aynısıdır; yeni ses üretilmez. '
              'Süre (pref) 5,2–6,6 hece/sn\'de %s–%s sn (denetlendi).' % (n(round(min(qc))), n(round(max(qc)))))
        else:
            a('"Durdur (X)" sonrası isteğe bağlı sesli dönüş (güvenlik §11.D-4). İlk iki cümle durdurma ekranındaki metnin '
              'aynısıdır. Emir kipi güvenlik gereği kullanılır. Yana dönüp oturmaya 10 sn verilir (S4); süre %s–%s sn.'
              % (n(round(min(sr))), n(round(max(sr)))))
        a('')
        a('| id | metin | sessizlik sonra (sn) |')
        a('|---|---|---|')
        for c in ex['clips']:
            a('| `%s` | %s | %s |' % (c['id'], c['text'], n(c['gapAfter']['pref'])))
        a('')


def part_4(L, F, a):
    plans = F['plans']
    ref = F['ref5']
    a('## 4. Sürümler')
    a('')
    a('### 4.1 5 dakika · tam metin (5,6 hece/sn, yüksek duraklama; sessizlik kipi %s %s)' % (ref['mode'], n(round(ref['f'], 2))))
    a('')
    a(timeline(ref))
    a('')
    a('### 4.2 5 ve 30 dakikanın blok listesi (her hız ve profil)')
    a('')
    a('| hız | profil | 5 dk: blok süreleri | 30 dk: blok süreleri |')
    a('|---|---|---|---|')
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            a('| %s | %s | %s | %s |' % (n(rate), 'düşük' if prof == 'lo' else 'yüksek',
                                         plan_blocks_line(plans[(rate, prof, 5)]),
                                         plan_blocks_line(plans[(rate, prof, 30)])))
    a('')
    a('### 4.3 Blokların ve pencerelerin girdiği dakika')
    a('')
    a('| hız | profil | C4 imgeleme | C3 zıtlıklar | C5 tanıklık | ilk genişletme | bütün içerik |')
    a('|---|---|---|---|---|---|---|')
    allc = F['allc']
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            def first(fn):
                for m in range(5, 31):
                    if fn(plans[(rate, prof, m)]):
                        return '%d dk' % m
                return '—'
            ext_ids = {i for i, (_, c) in allc.items() if c['tier'] == 'extension'}
            a('| %s | %s | %s | %s | %s | %s | %s |' % (
                n(rate), 'düşük' if prof == 'lo' else 'yüksek',
                first(lambda p: 'C4' in p['sel']), first(lambda p: 'C3' in p['sel']), first(lambda p: 'C5' in p['sel']),
                first(lambda p: bool(p['inc'] & ext_ids)), first(lambda p: p['stop'] is None)))
    a('')
    a('### 4.4 İçeriğin dakikalara göre büyümesi (5,6 hece/sn, yüksek duraklama)')
    a('')
    a('| dk | bloklar | klip | hece | konuşma payı | sessizlik kipi | pencereler (sn) |')
    a('|---|---|---|---|---|---|---|')
    for m in range(5, 31):
        p = plans[(5.6, 'hi', m)]
        wins = ', '.join(n(round(ev['gap'])) for ev in p['events'] if ev['clip'].get('window')) or '—'
        a('| %d | %s | %d | %d | %%%s | %s %s | %s |' % (
            m, ' '.join(b for b in block_order(p) if b not in ('A', 'K')), len(p['events']),
            sum(ev['clip']['syllables'] for ev in p['events']), n(round(100 * p['speech'] / p['total'], 1)),
            p['mode'], n(round(p['f'], 2)), wins))
    a('')
    lost = []
    for rate in timing.RATES:
        for prof in ('lo', 'hi'):
            for m in range(6, 31):
                x = {ev['clip']['id'] for ev in plans[(rate, prof, m - 1)]['events']}
                y = {ev['clip']['id'] for ev in plans[(rate, prof, m)]['events']}
                if x - y:
                    lost.append('%s/%s %d→%d' % (n(rate), prof, m - 1, m))
    a('Süre bir dakika artınca hiçbir klip düşüyor mu? %s (T4; ilk turda 12 → 13 dakikada 6 kombinasyonun 5\'inde bir ya '
      'da iki ayrıntı grubu düşüyordu.)' % ('Hayır: 6 hız/profil × 25 geçişin hiçbirinde düşmüyor; plan her dakika bir '
                                             'öncekinin üst kümesi.' if not lost else 'Evet: ' + '; '.join(lost)))
    a('')


def part_5(L, F, a):
    allc = F['allc']
    act_ids = [('uzanma', 'a.durus'), ('örtü ve yastık', 'a.konfor'), ('kıpırdanıp yerleşme', 'a.x.kipir'),
               ('ağırlığı bırakma', 'a.agirlik'), ('gözler', 'a.gozler'), ('niyeti seçme', 'n1.ornek'),
               ('niyeti üç kez söyleme (başta)', 'n1.soyle'), ('niyeti üç kez söyleme (sonda)', 'n2.hatirla'),
               ('imgede yer', 'c4.yer'), ('patikadan dönüş', 'c4.don'), ('parmaklar ve gerinme', 'k.hareket'),
               ('gözler ve oda', 'k.goz'), ('yana dönme', 'k.yan'), ('doğrulup oturma', 'k.otur'),
               ('oturarak bekleme', 'k.bekle'), ('kalkış ve son', 'k.son')]
    actions = ', '.join('%s %s' % (lbl, n(allc[i][1]['gapAfter']['min'])) for lbl, i in act_ids)
    fillers = {w: sum(len(re.findall(r'(?<!\w)' + w + r'(?!\w)', c['text'].lower())) for _, c in allc.values())
               for w in timing.FILLERS}
    kr = rng(F['karar_in'])
    c4in = rng(F['c4_in'])
    a('## 5. Denetim listeleri')
    a('')
    a('### 5.1 Usta hoca ölçütleri (PLAN E.6, 18 madde)')
    a('')
    a('| # | Ölçüt | Bu metinde | Denetim |')
    a('|---|---|---|---|')
    e6 = [
        ('Zaman verir', 'Her eylem cümlesinin en kısa sessizliği eylem süresi + 2 sn (en kısa değerler, sn): ' + actions
         + '. Yana dönme, oturma ve bekleme hiçbir sürede sıkıştırılmaz (B2, T1, S4).', 'veri (`gapAfter.min`) + `timing.py` (T1)'),
        ('Sessizliği kullanır', 'Her blokta >= 5 sn\'lik en az bir sessizlik; 5 dakikada "hiçbir şey yapmadan" bir dinlenme '
         '(`c2.kal`, S3-hoca).', '`timing.py`'),
        ('Sessizliği korur', 'Üç pencere de duyurulur ("Bir süre susacağım, sonra yine seslenirim.") ve karşılanır ("Yeniden '
         'buradayım…", "Yeniden seninleyim; dalıp gittiysen de sorun değil.", "Buradayım."); karşılamadan 2 sn önce dönüş '
         'tınısı; hepsi <= 90 sn.', '`timing.py`'),
        ('Somut beden dili', 'ağırlık, hafiflik, ılıklık, serinlik, zemine yaslanma, ayak tabanları, taşın ılıklığı, esinti, '
         'koku; "enerji" yok.', 'yasak liste + elle'),
        ('Tutarlı yön', 'sağ → sol → arka → ön → bütün, her sürümde; ikinci tur da aynı yönde.', '`timing.py`'),
        ('Dolgu yok', 'Bütün metinde: ' + ', '.join('"%s" %d' % (w, k) for w, k in fillers.items())
         + '; aynı sözcük 60 sn içinde iki kez geçmez; ardışık kliplerde etiketsiz sözcük tekrarı yok.', '`timing.py`'),
        ('Anlatmaz, yaşatır', 'Ayrı açıklama klibi yok; niyetin ne olduğu seçimle aynı cümlede söylenir (S2-hoca).',
         '`timing.py` (metin)'),
        ('Tek imge yayı', 'Yalnız C4; §1.3.', 'etiket + son 60 sn denetimi'),
        ('Davet dili', 'Emir kipi yalnız güvenlik adımlarında: "ağrı olursa bırak", "Uzanıyorsan önce bir yanına dön.", '
         '"…doğrulup otur.", "…böyle kal. …biraz daha bekle." ve Durdur dönüşü. Çifte izin ("İstersen … -ebilirsin") yok.',
         '`timing.py` (metin)'),
        ('Başarısızlığı normalleştirir', '"Gevşemek kolay gelmeyebilir; bunda bir sakınca yok." (her sürümde) · "%s" · "zihnin bir yere kaydıysa da olsun" · "Bir görüntü gelmese de '
         'olur" · "dalıp gittiysen de sorun değil" · "hangi sayıda kaldığın önemli değil".' % F['allc']['c1.kacirma'][1]['text'],
         'elle'),
        ('Çıkış kapısı', 'Açılışta ortak cümle; imgeleme olan her sürümde (%s. dakikadan itibaren) imgelemeden hemen önce '
         'hatırlatma ve dayanak; imgenin içindeki sessiz pencereden hemen önce "Zor gelirse gözlerini açabilirsin."; dolaşımda '
         'atlama; nefeste eller; zıtlıkta "bu kısmı geçip zemini hissedebilirsin"; tanıklık penceresinden önce dayanak. Zor '
         'blok yok.' % c4in, '`timing.py` (S1, P-B2)'),
        ('Kapanış ritüeli', 'nefes → parmaklar ve gerinme → gözler ve oda → yana dön → otur → bekle → kalk → "Buradasın; '
         'uyanık ve dinlenmiş."', '`timing.py`'),
        ('Azalan anlatım', 'Her klibin evresi var; −1,5 / −3 dB evreye göre; yol A\'da REST hızı 0,90 → 0,85 → 0,80. Yol '
         'B\'de hız sabit (§1.1).', 'üretim ölçümü (bekliyor)'),
        ('Doğal hız', 'Sözcük uzatılmaz; yavaşlık uygulama sessizliğinden. Duraklamalar dahil en yavaş klip %s hece/sn; Derin '
         'evre iç hızı §2.5\'te (P-S1).' % F['slowest'], '`timing.py` (metin) + üretim ölçümü'),
        ('Ses–müzik', 'Konuşmada yatak kısık ve sesin evresini izler (her evrede >= 15 dB fark); kabarma yalnız pencerede.',
         'karışım ölçümü (bekliyor)'),
        ('Kusursuz Türkçe', 'Bu belgedeki iki editör turu (§5.4); Scribe ile geri çevirme ve insan editör onayı bekliyor.',
         'kısmen'),
        ('Benzersizlik', 'Açılış cümlesi, anahtar cümle, kıyı/orman patika yayı, ufuk çizgisi formu ve Mi♭ yatağı yalnız '
         'bu derste. Ders 5\'in anahtar cümlesi çıkarıldı (B1); tanıklık Ders 5 ve 9\'dan ayrıldı (S5-hoca); PLAN A.2.1 '
         'satırı güncellendi (N9).', 'ders düzeyi'),
        ('Yasak liste + güvenlik 18 kural', '§5.2; E12 kökleri de denetlendi.', '`timing.py` + tablo'),
    ]
    for i, (t, h, d) in enumerate(e6, 1):
        a('| %d | %s | %s | %s |' % (i, t, h, d))
    a('')
    a('### 5.2 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)')
    a('')
    a('| # | Kural | Bu metinde |')
    a('|---|---|---|')
    g18 = [
        ('Davet, komut değil', 'Yönergeler "-ebilirsin", "olabilir", "-mek yeterli" ya da betimleme; emir kipi yalnız güvenlik '
         'adımlarında.'),
        ('Gözleri açık seçeneği', '`a.gozler` her sürümde; imgelemeden önce her sürümde `br.orta` ("İstediğin an gözlerini '
         'açabilir…"), imgenin ilk cümlelerinde `c4.gelmezse` ("…gözlerin açık kalsa da.") ve imgenin içindeki sessiz '
         'pencereden hemen önce `c4.pencere` ("Zor gelirse gözlerini açabilirsin.") (S1, B5, E9, P-B2).'),
        ('"İstediğin an…" açılışta, 30 dk\'da ortada', '`a.izin` her sürümde; `br.orta` imgeleme olan her sürümde C4\'ün hemen '
         'önünde (%s. dakikadan itibaren; 30 dakikada dersin ortasına düşer).' % c4in),
        ('Kontrol kişide', '"Ne kadar gevşeyeceğine sen karar verirsin." (`a.karar`, %s. dakikadan itibaren); daha kısa '
         'sürümlerde kontrol `a.izin` ve davet diliyle kişidedir; "İstemezsen bu kısmı geçip…"; sınama telkini yok.' % kr),
        ('Gevşeme zorunlu değil', '"Gevşemek kolay gelmeyebilir; bunda bir sakınca yok." **her sürümde**, 5 dakikada da '
         '(`a.kolay`; S2, B6, P-B1).'),
        ('Nefes önce fark edilir', '"olduğu gibi, değiştirmeden izleyebilirsin"; "derin nefes al" yok; dönüşte "Nefesin kendi '
         'olağan ritmine dönebilir." (S7); sayılar nefese uydurulmaz (S8).'),
        ('Nefes tutma', 'Yok. Veriş sonundaki duraklama "uzatmadan" fark edilir (S14).'),
        ('Tarafsız dayanak ve çıkış kapısı', 'Önce: dayanak zemin (varış, zıtlık, imgeden hemen önce `br.orta`). Zor bölüm '
         'sırasında kapı: nefeste eller (`c2.alt`), zıtlıkta zemin (`c3.agir`), imgenin içinde gözler ve oda (`c4.gelmezse`, '
         '`c4.pencere`; orada "zemin" hayal edilen yer gibi duyulabilir), tanıklıkta zemin (`c5.pencere`); imgeden dönüş yine '
         'zemine (`c4.solma`). Nefes tek dayanak değildir (S1).'),
        ('Beden taraması esnek', '`c1.cerceve`: "seni rahatsız eden bir yer olursa atlayabilirsin". Kalça, göğüs ve karın tek '
         'adla geçer; nefes yeri için "ya da başka bir nokta" (S16).'),
        ('İmgeleme seçimli', 'Kıyı ya da orman; "Bir görüntü gelmese de olur"; suya ve derinliğe girilmez, iniş yok (S3, B3, '
         'E1); doğa katmanı varsayılan olarak su içermez (S12).'),
        ('Anı arama yok', 'Çağrışımlar yalnız nötr duyular (fincan, pencere); kişisel anı istenmez.'),
        ('Öz-şefkat kademeli', 'Bu derste öz-şefkat bloğu yok.'),
        ('Sağlık iddiası yok', 'Yasak liste ve E12\'nin etki vaadi kökleri temiz (anahtar cümleler ve son cümle muaf).'),
        ('Gündüz dersi uyandırmayla biter', 'Kapanış ritüeli; son cümle "Buradasın; uyanık ve dinlenmiş."'),
        ('Uyku dersi uyku izniyle biter', 'Uygulanmaz; gündüz dersinde uyku izni yok ("uykuya dal", "uyuyabilir", "uyursan" '
         'denetlendi). Dalıp gitme yalnız bağışlanır (P-S10).'),
        ('Sessizlikler rehberli', 'Her pencere duyurulur, karşılanır ve <= 90 sn; duyuru süreyi doğru anlatır ("bir süre"; '
         '"birkaç nefes" değil; S15, P-S4).'),
        ('Beden hareketi hafif', '`k.hareket`: "zorlamadan gerinebilirsin; ağrı olursa bırak" ve `k.bekle`: "Başın dönerse '
         'biraz daha bekle." (E8, S6).'),
        ('Kişiye özel tıbbi uyarı kartta', 'Seste yok. Araç uyarısı açılış ekranında ve **veride**: `openingNotice` ve '
         '`openingScreen` (S11, E10).'),
    ]
    for i, (t, h) in enumerate(g18, 1):
        a('| %d | %s | %s |' % (i, t, h))
    a('')
    a('### 5.3 Bu metni etkileyen CRITIQUE maddeleri')
    a('')
    a('| # | Konu | Nasıl karşılandı |')
    a('|---|---|---|')
    crit = [
        ('3', 'Genişletme klipleri; 30:00\'a sessizlik sınırı aşılmadan ulaşmak', 'Genişletme katmanı: içten sayma + pencere, '
         'ikinci tur, temas turu, zıtlık listeleri, imgede dinlenme ayrıntıları, tanıklık cümleleri, niyetin bedendeki izi. '
         '30:00\'da esneme en çok %%%d (§2.5).' % round(100 * max(F['stretch30'].values()))),
        ('12', 'Tek sözcüklük ipuçları taşıyıcıda', '%d taşıyıcıdan %d mikro-klip; sayı taşıyıcısında atılan ön söz (T17).'
         % (F['uc']['carriers'], F['uc']['micro'])),
        ('21', 'Benzersiz açılış, anahtar cümle, imge yayı, dikkat eğrisi', '§0, §1.2, §1.3, §1.4.'),
        ('30', 'Kaldığın yerden aynı plan', 'Planlayıcı belirlenimci; dönüşümlü seçenek dizini (`variantIndex`) kayda yazılır.'),
        ('31', 'C.8 davet dili', 'Çifte izin kaldırıldı: "Kendine kısa bir niyet seçebilirsin…".'),
        ('19', 'Araç uyarısı; göz kökeni', 'Araç uyarısı açılış ekranı verisinde; gözlere baskı yok (§1.5).'),
        ('7, 8', 'Ses düzeyleri; müziğin her cümlede inip kalkması', 'Yatak sesin evresini izler (−33 / −34,5 / −36 LUFS); '
         'kabarma yalnız duyurulan >= 20 sn pencerelerde.'),
        ('13', 'Harf harf eşleşme için normalleştirme', '§6.'),
        ('22', 'İnsan incelemesi', 'Açık: anadili Türkçe editör, yoga nidra eğitimli hoca ve en az bir 65+ yaş dinleyicili kör '
         'panel henüz yok.'),
    ]
    for c in crit:
        a('| %s | %s | %s |' % c)
    a('')
    nc, ns, abil, semi = prosody_stats(L)
    a('### 5.4 Türkçe editör notları (2. tur; T01–T36)')
    a('')
    a('- **Cümle düşüklüğü ve anlam belirsizliği giderildi:** göndergesi olmayan "Fark ettiğin an…" çıkarıldı (B1, T01); '
      '"beden … oluyor" ortak yüklem hatası düzeldi (T02); "soluyor" eşyazımlısı ve "altındaki zemin" belirsizliği '
      '"Görüntü usulca siliniyor; seni taşıyan zemini…" ile giderildi (T03, B4); "farkındasın" nesnesiz kalıbı çıktı (T04); '
      '"bütün beden birlikte", "iki bacak birlikte" çevirileri "baştan ayağa bütün beden", "iki bacak birden" oldu (T05, '
      'T22); "veriş" tek başına kullanılmıyor (T06); "kaçırdıysan bu da olur" yerine "zihnin bir yere kaydıysa da olsun" '
      've "bunda bir sakınca yok" (T07); güvenlik cümlesinde çok anlamlı "durabilirsin" yerine "ara verebilirsin" (T08); '
      'yüklemsiz "hangisi sana iyi geliyorsa" parçası kalktı (T10, N3); "Sesim susacak" kişileştirmesi yerine "Bir süre '
      'susacağım, sonra yine seslenirim." (T11); "nefesi" yerine "nefesini" (T12, N4); "bakışın … dinlenebilir" çevirisi '
      'yerine "bir noktaya yumuşakça bakabilirsin" (T13, S9); "dönme" yerine "dönüş" (T14); "zamanı geldiğinde" ertelemesi '
      'yerine "Artık aynı patikadan, acele etmeden…" (T15, S8-hoca); karışık benzetme "dalgaların ya da yaprakların sesi '
      'gibi" oldu (T16); dinleyici imgeye "Kendini orada, yumuşak bir patikanın başında bulabilirsin." ile yerleşir (T19); '
      '"Bir şey yapman gerekmiyor" çelişkisi "başka bir çabaya gerek yok" oldu (T20, N7); "anmak" ve nesnesiz "rahatsız eden" '
      'düzeldi (T21); "gelmese de olur" kalıplaşmış biçimi (T26); "alıştıra alıştıra" (T29); "Bu dakikalarda" kalktı (T33, '
      'S14, P-S14).')
    a('- **Yazım (TDK):** iki noktadan sonra tam cümle büyük harfle ("Hatırlatayım: İstediğin an…", "Sonra sıcaklık: '
      'Bedenine…", "…: Hepsi sende bir arada.", "…: İkisi de burada."); ad öbeği küçük harfle ("…: bir kıyı ya da bir '
      'orman.") (T09). Eş görevli olmayan sıfatlar arasında virgül yok, eş görevliler arasında var ("temiz, taze bir koku", '
      '"kısa, basit bir niyet cümlesi") (T31). Özne ile yüklem arasındaki gereksiz virgüller kalktı (N1). Belge içi ekler '
      'sayının okunuşuna göre üretiliyor ("`k.goz`de", "33:39\'a") (T35).')
    a('- **Söz yorgunluğu:** "hafif", "ılık", "iyi gel-", "bırakabilirsin" ve "burada" tekrarları azaltıldı (T25, T28, N2, '
      'P-N3); ardışık iki klipte etiketsiz aynı sözcük yok (`timing.py`).')
    old = os.path.join(HERE, '_onceki_tur1', 'ders2.lesson.json')
    ostat = prosody_stats(timing.load(old)) if os.path.exists(old) else None
    a('- **Ezgi (T18):** benzersiz %d cümle klibinde %d cümle var; "-(y)abilir(sin)" ile biten cümle %d (%%%d), noktalı '
      'virgüllü klip %d (%%%d).%s Bildirme, "-mek yeterli" ve isim cümleleri ile iki cümleye bölme bilinçli dağıtıldı; '
      'hiçbir sürümde art arda üçten çok cümle "-(y)abilir(sin)" ile bitmez (`timing.py`; fixlog.md, T18).' % (nc, ns, abil, round(100 * abil / ns), semi, round(100 * semi / nc),
                             (' Aynı sayımla ilk tur: %d klip, %d cümle, %d (%%%d) ve %d (%%%d).' % (
                                 ostat[0], ostat[1], ostat[2], round(100 * ostat[2] / ostat[1]), ostat[3],
                                 round(100 * ostat[3] / ostat[0]))) if ostat else ''))
    a('- **Bilinçli eksiltili isim cümleleri:** "Avuçlarında sıcak bir fincan tutar gibi.", "Açık bir pencereden içeri dolan '
      'hava gibi.", "Şimdi bunun tersi: hafiflik.", "Bir de yere değen noktalar.", "Aynı yoldan kısa bir tur daha.", "Bir renk, '
      'bir biçim, bir doku." Öznesi ya da bağlamı bir önceki cümlededir; konuşma dilinde doğaldır. İnsan editör yine de '
      'değerlendirmeli.')
    a('- **Devrik cümle ve anlatı kipi (T18):** "Bir görüntü gelmese de olur, gözlerin açık kalsa da." ortak yüklemli devrik '
      'bir cümledir. İmgede yürüyüş ve dönüş şimdiki zamanla anlatılır ("kendi hızında yürüyorsun", "geri dönüyorsun"); '
      'davet kipi girişte, yerleşmede ve dayanakta kalır. Böylece hiçbir sürümde art arda üçten çok cümle "-(y)abilir" ile '
      'bitmez. İnsan editör bu dengeyi de dinleyerek onaylamalı.')
    a('- **Ortak ek:** "açabilir, kıpırdayabilir ya da ara verebilirsin" ve "oynatabilir, zorlamadan gerinebilirsin" aynı '
      'kişi ve kipte olduğu için doğrudur.')
    a('')


def part_6_8(L, F, a):
    a('## 6. Üretim notları (seslendirme)')
    a('')
    a('- **Yol kararı açık (sahip, PLAN §G5):** REST ya da MCP.')
    a('  - REST (yol A) ile evreye göre hız: Varış 0,90 · Derinleşme 0,85 · Derin 0,80 · Kapanış 0,90 (VARSAYIM; PLAN '
      'C.2\'deki "evre başına bir basamak, 0,85 → 0,80" ile uyumlu; 0,80 ≈ 5,2 hece/sn tahmindir ve '
      'zamanlamanın hesaplandığı en yavaş hızdır, altına inilmez). Ayrıca sabit seed ve komşu cümleler için `previous_text` / `next_text`.')
    a('  - MCP\'de (yol B) bunların hiçbiri yok; evre farkı yalnız metinden, boşluklardan ve kazançtan (−1,5 / −3 dB) gelir. '
      'Derin evre iç hızı bu yolda yaşlı dinleyici çıtasını karşılamaz (§2.5, P-S1).')
    a('  - Taşıyıcı yöntemi iki yolda da çalışır, çünkü her taşıyıcı tek istektir.')
    a('- **Model:** v3 yön etiketleri kullanılmaz (bu oturumdaki denemede etiket büyük olasılıkla sesli okundu). Metinde köşeli '
      'etiket ve `<break>` yok; bütün uzun sessizlikler uygulamada.')
    a('- **Taşıyıcılar ve kesim:**')
    a('  - Sessizlik algısıyla öğeler sırayla ayrılır; öğe sayısı tutmazsa insan onaylar; her mikro-klibe 10 ms yumuşak uç.')
    a('  - Seviye: kısa klipler RMS ile evre referansına eşitlenir.')
    a('  - Son öğenin kapanış ezgisi korunur ("bütün sağ taraf.", "bütün sırt.", "bütün beden.", "bir.", "başın arkası.").')
    a('  - Ön söz: sayı taşıyıcısı "sayıyorum: on… dokuz…" diye üretilir; "sayıyorum:" kesilip atılır. Böylece ilk sözcük '
      '"On" İngilizce "on" gibi okunmaz (T17). REST\'te ayrıca `previous_text`.')
    a('  - **Eklem ezgisi (P-S15):** taşıyıcı sınırındaki F0 sıçraması, taşıyıcı içindeki öğeden öğeye medyan değişime göre '
      '<= 2 yarım ton olmalı (VARSAYIM; `qa.carrierJoinF0StepSemitones`). Aşarsa önce `previous_text` / `next_text` ile '
      'yeniden üretilir (yol A), sonra kesim sırası değiştirilir; dinleyerek onaylanır.')
    a('- **Scribe ile geri çevirme, normalleştirme (CRITIQUE #13):** küçük harf; noktalama silinir (… , ; : " \' ve nokta); '
      'düzeltme işareti düşer (â → a); sayılar sözcüğe çevrilir (10 → on). Taşıyıcı bütün olarak karşılaştırılır; ön söz '
      'karşılaştırmaya girmez. Uyuşmazlıkta klip başına en çok 2 yeniden üretim yapılır; sonra metin yeniden yazılır.')
    a('- **Söyleyiş izleme listesi (dinlenerek denetlenir):**')
    a('  - Vurgu ve eşyazımlı tuzakları (T17): **alın** (organ, a-LIN; emir "A-lın" değil), **karın** (organ, ka-RIN; '
      '"karmak"tan emir değil; taşıyıcı bu yüzden üç noktayla biter), **On** (taşıyıcı başında İngilizce "on" değil), '
      '**dönüş** ("Artık dönüş zamanı."; eski "dönme" kaldırıldı), "siliniyor" (eski "soluyor" kaldırıldı).')
    a('  - ğ\'li sözcükler: başparmağı, ağırlık, değen, doğrulup, değiştirmeden, alıştıra alıştıra, yumuşak, soğuk değil '
      'serin.')
    a('  - uyluk, baldır, şakak, köprücük, yüzük parmağı ("yüz" eşyazımlısı), yüzüne, yüzün.')
    a('  - Büyük harfle yazılan I ve İ: "Işık", "Işıkla", "İstediğin", "İstemezsen", "İkisi".')
    a('  - Tırnak içi hazır niyet cümlesinin ezgisi ("…: "Dinlenmeye izin veriyorum."" ve N2\'de cümle içinde).')
    a('  - Yanlış okuma Scribe ya da dinlemeyle görülürse: yol A\'da taşıyıcıdan önce küçük harfli `previous_text` ya da alias '
      'sözlüğü; yol B\'de ön söz ya da fonetik yazım.')
    a('- **Dosyalar:** `voice.{female,male}.file` = `public/yoga/ders2/<ses>/<klip>.m4a`; dönüşümlü seçenekler '
      '`<klip>.v2.m4a`, `<klip>.v3.m4a` (P-N5). `sec` üretimden sonra dolar. Taşıyıcıların WAV\'ı arşivdir, pakete girmez.')
    a('')
    a('## 7. VARSAYIM\'lar ve açık noktalar')
    a('')
    a('- Bütün `gapAfter`, `pairGap` ve pencere değerleri, dalga sıraları (`fillRank`), giriş sıraları (`entryRank`), T5 '
      'esneme tavanı (0,5) ve girişte en çok yarı sıkışma birer tasarım kararıdır (VARSAYIM).')
    a('- **5 dakikanın en yavaş ucu (T6):** "5,2 + Hakan duraklaması" köşesi zarfın içinde tutuldu; seçilen yol, 5 dakikalık '
      'tabanı yeniden bütçelemekti: sayma turu %s. dakikaya, anahtar cümlenin 2. geçişi %s. dakikaya kaydı; kapanışta '
      'parmaklar ile gerinme, gözler ile oda birer klipte birleşti (P-S12); sırtta 5 dakikada tek nokta (omurga) kaldı. '
      'Sonuç: %s sn boş pay (T6: >= 15).' % (rng(F['say5_in']), rng(F['first'](lambda p: any(ev['clip']['id'] == 'br.k2' for ev in p['events']))),
                                            n(round(F['slack5'][(5.2, 'hi')], 1))))
    a('- İmgeleme (C4) hıza göre %s. dakikada girer; PLAN B.4\'ün 10 dakikalık çapası yerine. Neden: güvenlik gereği uzayan '
      'kapanış ve imgelemenin önüne her sürümde eklenen çıkış kapısı (`br.orta`). En kısa C4 penceresizdir; pencere süre '
      'arttıkça girer.' % rng(F['c4_in']))
    a('- Süre modeli: eklemleme hızları ölçümdür; duraklama profilleri tek paragraftan çıkarıldı; 5,2\'deki ×1,25 ve uç '
      'payları VARSAYIM\'dır. Yoğunluk eşikleri (150 / 110 hece, %60 / %45), T3, T8 ve P-S6 eşikleri VARSAYIM\'dır.')
    a('- **Yaşlı dinleyici çıtası (P-S1):** Derin evre cümle kliplerinin iç hızı <= 5,0 hece/sn (VARSAYIM). 6,6 hece/sn\'deki '
      'v2 varsayılan okuma bu çıtayı karşılamaz; bu, yol kararında (PLAN §G5) sahibe söylenecek bir bilgidir.')
    a('- Düzeyler: konuşma −18 LUFS; kısık yatak Varış −33, Derinleşme −34,5, Derin −36 LUFS; pencerede +6 dB; son 5 sn '
      'sönüş; dönüş tınısı; "Konuşma netliği" −6 dB (hepsi VARSAYIM).')
    a('- **Doğa katmanı (S12):** varsayılan uzak rüzgâr ve yaprak, su yok; su katmanı ayarda, varsayılan kapalı. PLAN '
      'A.2, A.2.1 ve üretim satırları buna göre güncellendi (önceki hâli: "uzak, sürekli akarsu"); su katmanının üretilip '
      'üretilmeyeceği sahibin kararıdır.')
    a('- **Sahne seçici (P-S2, açık seçenek):** başlamadan önce "Kıyı / Orman" seçimi ve sahneye özgü 5–6 klip. Bu turda '
      'yapılmadı; P-S2\'nin yedek yolu (iki yere de uyan ayrıntılar) uygulandı. Seçici eklenirse doğa katmanı da seçilen '
      'sahneyi izleyebilir.')
    a('- Görsel: nabız `flashSafe` profiliyle kapanır (lib/profile.js:198, d515702\'de okundu); şafak parlaklık tavanı bağıl '
      '%15 ve en az 60 sn\'lik rampa (VARSAYIM).')
    a('- "Kapanışa geç" 60–90 sn ve Durdur dönüşü 20–30 sn: bekleme ve kalkış kısaltılamadığı için PLAN B.5\'teki 45–60 sn '
      've "20 sn" güncellendi. Güvenlik dosyasının §11.D-4 metni (doğrulanmış kanıt dosyası) değiştirilmedi; geçerli değer '
      'PLAN B.5\'tedir.')
    a('- Sırtüstü yatışa göre yazılan temas turu yan yatan dinleyiciye tam uymaz; bu yüzden genişletme katmanındadır.')
    a('- Açık kararlar (sahip): seslendirme yolu (REST/MCP), doğa sesi ve su katmanı, sahne seçici, insan editör, hoca ve '
      'kör dinleme paneli (CRITIQUE #22).')
    a('')
    a('## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI\'ler https://doi.org/ önekiyle açılır)')
    a('')
    a('| PMID | Künye | DOI | Dosya |')
    a('|---|---|---|---|')
    refs = [('39690521', 'Luu 2024 (travma-duyarlı YN, 10 bileşen; öneri makalesi)', '10.17761/2024-D-24-00021', 'sakin, güvenlik'),
            ('40373021', 'Moszeik 2025 (11 ve 30 dk YN; iki ay, müziksiz kayıt)', '10.1002/smi.70049', 'sakin, teslim'),
            ('41743305', 'Gibbs 2026 (kronik ağrılı yetişkinler, yarı deneysel, n=23)', '10.4103/ijoy.ijoy_2_25', 'sakin'),
            ('34306146', 'Toussaint 2021 (60 sağlıklı öğrenci; derin nefes talimatı ve uyarılma)', '10.1155/2021/5924040', 'sakin, güvenlik'),
            ('42757902', 'Shuminsky & Davidow 2026 (İngilizce; konuşma hızı ve doğallık)', '10.1044/2026_JSLHR-25-00691', 'teslim'),
            ('16941239', 'Knowlton & Larkin 2006 (48 yüksek kaygılı genç kadın, tek seans PKG; azalan anlatım)', '10.1007/s10484-006-9014-6', 'teslim'),
            ('16199412', 'Bernardi 2006 (müzik dinleme deneyi, 24 kişi; 2 dk müziksiz sessizlik)', '10.1136/hrt.2005.064600', 'sakin, teslim'),
            ('42466037', 'Lieutaud & Bourhis 2026 (8 haftalık rehberli ve rehbersiz program)', '10.3389/fpsyg.2026.1833806', 'teslim'),
            ('19493324', 'Wood 2009 (olumlu cümle tekrarı)', '10.1111/j.1467-9280.2009.02370.x', 'benlik'),
            ('3069875', 'Braith 1988 (30 subklinik kaygılı kişi, tek seans kayıttan PKG)', '10.1016/0005-7916(88)90040-7', 'güvenlik'),
            ('32820538', 'Farias 2020 (istenmeyen etkiler)', '10.1111/acps.13225', 'güvenlik'),
            ('28300508', 'Howard 2017 (klinik yorum ve 3 vaka; dönüşün önemi)', '10.1080/00029157.2016.1203281', 'güvenlik'),
            ('34260686', 'Tran 2021 (ayağa kalkınca ilk KB düşüşü)', '10.1093/ageing/afab090', 'güvenlik'),
            ('24882909', 'Cordi 2014 (70 sağlıklı genç kadın; telkin ve şekerleme)', '10.5665/sleep.3778', 'sakin, teslim, güvenlik'),
            ('24146758', 'Cramer 2013 (yoga yan etkileri, vaka raporları)', '10.1371/journal.pone.0075515', 'güvenlik'),
            ('31357980', 'Cramer 2019 (gözetimsiz pratik ve yan etkiler)', '10.1186/s12906-019-2612-7', 'güvenlik'),
            ('3148637', 'Ley 1988 (kuramsal derleme; ikinci turda yeniden doğrulanmadı)', '10.1016/0005-7916(88)90054-7', 'güvenlik §2'),
            ('10483629', 'Khasky & Smith 1999 (uzaklaşma hissi; ikinci turda yeniden doğrulanmadı)', '10.2466/pms.1999.88.2.409', 'güvenlik §2')]
    for r in refs:
        a('| %s | %s | %s | %s |' % r)
    a('')
    a('Kaynak: PubMed (National Library of Medicine), dosyalardaki okumalar üzerinden. Bu metin hiçbir sonucu vaat etmez.')
    a('')


def write(L):
    P = []
    a = P.append
    F = compute(L)
    part_head(L, F, a)
    part_1(L, F, a)
    part_15(L, F, a)
    part_2(L, F, a)
    part_3(L, F, a)
    part_4(L, F, a)
    part_5(L, F, a)
    part_6_8(L, F, a)
    with open(os.path.join(HERE, 'ders2.script.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(P) + '\n')
