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
N1_SEC = 'Bugün kendine kısa bir niyet seçiyorsun. Aklına bir şey gelmezse niyetin "Kendime dinlenmeye izin veriyorum" olsun.'
# Düzeltme turu (INCELEME.md TE3): "olsun"un öznesi yoktu ve seste "…izin veriyorum olsun" tek öbek gibi duyuluyordu.
# Editörün "en az değişiklik" biçimi seçildi (+3 hece, "niyetin" öznesi). Editörün birinci önerisi (üç cümle: "…niyetin şu
# olsun. "Kendime dinlenmeye izin veriyorum."") 5 dk boş payını 15 sn'nin altına indirdi (Nefona Hoca kons 13,5–14,5 sn).
N1_SEC_ALT = ['Bugün için kısa bir niyet seçiyorsun. Aklına bir şey gelmezse niyetin "Kendime dinlenmeye izin veriyorum" olsun.',
              'Kısa bir niyet cümlesi seçiyorsun. Aklına bir şey gelmezse niyetin "Kendime dinlenmeye izin veriyorum" olsun.']
N1_SOYLE_KISA = 'İçinden bir kez söylemek yeterli.'
N2_HATIRLA = 'Başta seçtiğin niyeti içinden üç kez söylemek yeterli. Hatırlamazsan "Kendime dinlenmeye izin veriyorum" demen de olur.'
# Düzeltme turu (INCELEME.md TE4/UH5): "Ya da yine … olsun" ilk cümleye bağlanmıyordu; usta hoca biçimi ("-(y)abil-" yok).
# 5 dk kısa biçimi tek cümleye indi: iki öneri de 5 dk boş payını 15 sn tabanının altına ve H12'yi bozuyordu (INCELEME.md);
# N1'de hazır niyet dinleyicinin niyeti olarak verildiği için "Niyetini" ikisini de kapsar. N2 bloğunun 15 sn tabanı
# (B.3-8) sessizlikle korunur: sonrasında niyeti içinden söyleme payı.
N2_HATIRLA_KISA = 'Niyetini içinden bir kez daha söylemek yeterli.'
N2_KISA_GAP = {'min': 11.5, 'pref': 13.0, 'max': 15.0}
C3_AGIR = 'Önce ağırlıkla başlıyoruz. İstemezsen bu bölümü atlayıp zemini hissedebilirsin.'
C3_HAFIF = 'Şimdi hafifliğe geçiyoruz.'
# Düzeltme turu: C4 sahne metinleri (INCELEME.md TE2 yüklemsiz; UH4 Ders 3 c3.toprak ile benzersizlik)
SCENE_TEXT = {
    ('c4.ses', 'orman'): 'Uzaktan yaprak hışırtısı gelip gidiyor.',
    ('c4.ses', 'kiyi'): 'Uzaktan dalgaların sesi gelip gidiyor.',
    ('c4.koku', 'orman'): 'Havada çam ve yosun kokusu var.',
}
G_ILK = 'Bugün yalnızca tanışıyoruz; zorlanırsan ekrandaki "Kapanışa geç" düğmesine dokunman yeterli.'
# 5 dk'ya özgü Varış kısa biçimleri (PLAN.v3 §A.3); sessizlikler tam biçimle aynı (sessizlik ve taban korunur)
VARIS_SHORT = {
    'a.gozler': ('Gözlerini kapatıp kapatmamak sana kalmış.', {'min': 4.0, 'pref': 4.0, 'max': 7.0}),  # UH19a: açık tutma seçeneği sözle
    'a.kolay': ('Gevşemek zor gelirse bu da olur.', {'min': 3.0, 'pref': 9.0, 'max': 11.0}),
}

def build(varis_short=None, out_path=None):
    if varis_short is None:
        varis_short = VARIS_SHORT
    L = T.load(Y + '/pilot/ders2.lesson.json')
    L = copy.deepcopy(L)
    L['version'] = 'b-v3.1 (2026-09-30; pilot-4 + B adımı metin deltası + düzeltme turu, b/INCELEME.md)'
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
    set_short(c, N2_HATIRLA_KISA, N2_KISA_GAP or c['short']['gapAfter'], 'n2.hatirla')
    # 20 dk'nın ilk kez seslendirilecek iki birimi: yüklemsiz başlık cümleleri yüklemli yazıldı (öneri; E.1 incelemesine)
    c = cl['c3.agir']
    set_text(c, C3_AGIR, 'c3.agir')
    c = cl['c3.hafif']
    set_text(c, C3_HAFIF, 'c3.hafif')
    for cid, (text, gap) in varis_short.items():
        set_short(cl[cid], text, gap, cid)
    for (cid, scn), text in SCENE_TEXT.items():
        sc = cl[cid]['scenes'][scn]
        sc['text'] = text; sc['syllables'] = T.syllables(text); sc['words'] = len(T.words(text))
        sc['voice'] = voice_pair('%s.%s' % (cid, scn))
        sc['note'] = 'düzeltme turu: metin değişti, yeniden seslendirilir (INCELEME.md)'
    # UH19b: ekran = TTS (SPEC.v3); nefes çifti ilk virgülden kesilir, üç nokta gerekmez
    c = cl['c4.x.yaklas']
    c['ttsText'] = c['text']
    for sc in c['scenes'].values():
        sc['ttsText'] = sc['text']
    # Düzeltme turu (INCELEME.md TE15): soru Tamamlandı akışında da soruluyor; dersi bitiren kişi "durmamış" olabilir
    L['afterCheck']['onCok'] = L['afterCheck']['onCok'].replace('Bu olabiliyor ve durman doğruydu.',
                                                                'Bu olabiliyor; zorlandığında durmak her zaman doğru bir seçim.')
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
        'clips': [{'id': 'g.ilk', 'text': G_ILK,
                   'tier': 'required', 'gapAfter': {'min': 2.0, 'pref': 2.0, 'max': 2.0}, 'phase': 'Varış', 'cue': {},
                   'tags': {'mood': 'safety', 'texture': 'varis', 'note': '-(y)abil- yok: ardından a.izin üç taşır'},
                   'syllables': 0, 'words': 0, 'sentences': 1, 'required': True, 'voice': voice_pair('g.ilk')}]}
    g = L['extras']['firstLesson']['clips'][0]
    g['syllables'] = T.syllables(g['text']); g['words'] = len(T.words(g['text']))
    if out_path:
        json.dump(L, open(out_path, 'w'), ensure_ascii=False, indent=1)
    return L
