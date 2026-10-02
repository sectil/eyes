"""Ders 2 v3 ders verisi: pilot ders2.lesson.json'un (salt okunur) kopyası + B adımı metin deltası.
Çıktı: b/ders2/ders2.lesson.v3.json. Pilot dosyasına dokunulmaz."""
import json, copy, sys
Y = '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga'
sys.path.insert(0, Y + '/pilot')
import timing as T

def voice_pair(base):
    return {'female': {'file': None, 'sec': None}, 'male': {'file': 'public/yoga/ders2/%s.m4a' % base, 'sec': None}}

def subclips_for(text, base):
    parts = T.split_keep(text)
    if len(parts) < 2:
        return None
    return [{'index': i + 1, 'text': t, 'syllables': T.syllables(t), 'voice': voice_pair('%s.%d' % (base, i + 1))}
            for i, t in enumerate(parts)]

def set_text(c, text, base):
    c['text'] = text
    c['syllables'] = T.syllables(text)
    c['words'] = len(T.words(text))
    c['sentences'] = len(T.sentences(text))
    sc = subclips_for(text, base)
    if sc:
        c['subclips'] = sc
        c['ttsUnit'] = {'text': text, 'cut': 'cümle sonlarından (SPEC.v3 §5.3); parça sayısı tutmazsa çekim elenir'}
    else:
        c.pop('subclips', None); c.pop('ttsUnit', None)
    c['voice'] = voice_pair(base)

def set_short(c, text, gap, base, below=360):
    sh = {'belowSec': below, 'text': text, 'gapAfter': gap, 'syllables': T.syllables(text),
          'words': len(T.words(text)), 'sentences': len(T.sentences(text)), 'voice': voice_pair(base + '.kisa')}
    sc = subclips_for(text, base + '.kisa')
    if sc:
        sh['subclips'] = sc
    c['short'] = sh

# ---- metin deltası (tek kaynak; units-v3.json da buradan üretilir) --------------------------------------------
N1_SEC = 'Bugün kendine kısa bir niyet seçiyorsun. Aklına bir şey gelmezse "Kendime dinlenmeye izin veriyorum" olsun.'
N1_SEC_ALT = ['Bugün için kısa bir niyet seçiyorsun. Aklına bir şey gelmezse "Kendime dinlenmeye izin veriyorum" olsun.',
              'Kısa bir niyet cümlesi seçiyorsun. Aklına bir şey gelmezse "Kendime dinlenmeye izin veriyorum" olsun.']
N1_SOYLE_KISA = 'İçinden bir kez söylemek yeterli.'
N2_HATIRLA = 'Başta seçtiğin niyeti içinden üç kez söylemek yeterli. Ya da yine "Kendime dinlenmeye izin veriyorum" olsun.'
N2_HATIRLA_KISA = 'Niyetini içinden bir kez daha söylemek yeterli. Ya da yine "Kendime dinlenmeye izin veriyorum" olsun.'
C3_AGIR = 'Önce ağırlıkla başlıyoruz. İstemezsen bu bölümü atlayıp zemini hissedebilirsin.'
C3_HAFIF = 'Şimdi hafifliğe geçiyoruz.'
# 5 dk'ya özgü Varış kısa biçimleri (PLAN.v3 §A.3); sessizlikler tam biçimle aynı (sessizlik ve taban korunur)
VARIS_SHORT = {
    'a.gozler': ('Gözlerini kapatmak sana kalmış.', {'min': 4.0, 'pref': 4.0, 'max': 7.0}),
    'a.kolay': ('Gevşemek zor gelirse bu da olur.', {'min': 3.0, 'pref': 9.0, 'max': 11.0}),
}

def build(varis_short=None, out_path=None):
    if varis_short is None:
        varis_short = VARIS_SHORT
    L = T.load(Y + '/pilot/ders2.lesson.json')
    L = copy.deepcopy(L)
    L['version'] = 'b-v3 (2026-09-30; pilot-4 + B adımı metin deltası)'
    L['releaseMinutes'] = [5, 15, 20]
    cl = {c['id']: c for b in L['blocks'] for c in b['clips']}
    c = cl['n1.sec']
    set_text(c, N1_SEC, 'n1.sec')
    c['tags']['tts'] = 'tırnak içi hafif vurgulu; tırnağın içinde nokta yok (tek cümle); iki nokta yok (SPEC.v3 §4.1)'
    c['tags']['repeatOk'] = sorted(set(c['tags'].get('repeatOk', []) + ['niyet']))
    for a, t in zip(c['alternates'], N1_SEC_ALT):
        a['text'] = t; a['syllables'] = T.syllables(t); a['words'] = len(T.words(t))
        a['subclips'] = subclips_for(t, 'n1.sec.v%d' % (c['alternates'].index(a) + 2))
        a['voice'] = voice_pair('n1.sec.v%d' % (c['alternates'].index(a) + 2))
        a['note'] = 'ilk yayında seslendirilmez (PLAN.v3 §C.1: dönüşümlü açılış dosyada sabit)'
    c = cl['n1.soyle']
    set_short(c, N1_SOYLE_KISA, c['short']['gapAfter'], 'n1.soyle')
    c = cl['n2.hatirla']
    set_text(c, N2_HATIRLA, 'n2.hatirla')
    c['tags']['repeatOk'] = sorted(set(c['tags'].get('repeatOk', []) + ['niyet']))
    set_short(c, N2_HATIRLA_KISA, c['short']['gapAfter'], 'n2.hatirla')
    # 20 dk'nın ilk kez seslendirilecek iki birimi: yüklemsiz başlık cümleleri yüklemli yazıldı (öneri; E.1 incelemesine)
    c = cl['c3.agir']
    set_text(c, C3_AGIR, 'c3.agir')
    c = cl['c3.hafif']
    set_text(c, C3_HAFIF, 'c3.hafif')
    for cid, (text, gap) in varis_short.items():
        set_short(cl[cid], text, gap, cid)
    # v3.3: mikro parça ek ofseti ders verisine taşındı
    L['qa']['microClipRmsOffsetDb'] = 0.0
    L['qa']['microClipRmsNote'] = ('SPEC.v3 §4.4: < 1 sn parça, LUFS ölçülebiliyorsa (>= 0,4 sn) uzun kliplerle aynı '
                                   'ölçüye (-18 LUFS, BS.1770 kapılı) getirilir; tek heceli mikro parçanın ek ofseti 0 dB. '
                                   '0,4 sn altı eski RMS yolu, ek ofset 0 dB.')
    L['qa']['speechOverBedAllPieces'] = True
    L['qa']['positionCheck'] = {'lowpassHz': 4000, 'corrMin': 0.95, 'searchMs': 50, 'maxShiftMs': 1.0}
    L['voiceProduction']['chosen'] = {'name': 'Nefona Hoca', 'voice_id': 'Sr5w7dIZaRDglJ2cLaJm', 'sex_param': 'm',
                                      'model': 'eleven_v4', 'generations_count': 3,
                                      'decision': 'SAHIP_ISTEKLERI madde 8 (orkestratör seçimi, VARSAYIM; sahip itiraz ederse değişir)'}
    L['timingModel']['measuredRatioVsModel'] = {'nes': 1.109, 'hak': 1.055, 'hoc': 1.127,
                                                'note': 'ölçülen/model (5,6 yüksek), 15 dk ortak birimleri; b/work/measure_hoc.py'}
    L['extras']['firstLesson'] = {
        'id': 'G.ilk', 'kind': 'utility', 'title': 'Kişinin ilk yoga dersinden önce kısa giriş (PLAN.v3 §D.3)',
        'clips': [{'id': 'g.ilk', 'text': 'Bugün yalnızca tanışıyoruz; zorlanırsan kapanışa geçmen yeterli.',
                   'tier': 'required', 'gapAfter': {'min': 2.0, 'pref': 2.0, 'max': 2.0}, 'phase': 'Varış', 'cue': {},
                   'tags': {'mood': 'safety', 'texture': 'varis', 'note': '-(y)abil- yok: ardından a.izin üç taşır'},
                   'syllables': 0, 'words': 0, 'sentences': 1, 'required': True, 'voice': voice_pair('g.ilk')}]}
    g = L['extras']['firstLesson']['clips'][0]
    g['syllables'] = T.syllables(g['text']); g['words'] = len(T.words(g['text']))
    if out_path:
        json.dump(L, open(out_path, 'w'), ensure_ascii=False, indent=1)
    return L
