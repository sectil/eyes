#!/usr/bin/env python3
"""ders3.lesson.json + planlayıcı → ders3.script.md (okunabilir metin, süre sürüm sürüm). Metin kaynağı JSON'dur."""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing as T  # noqa: E402
import timing_d3 as TD  # noqa: E402

L = TD.load()
TD.patch(L)
PV = TD.planner_view(L)
OUT = os.path.join(HERE, 'ders3.script.md')
TIER = {'required': 'zorunlu', 'optional': 'isteğe bağlı', 'extension': 'genişletme'}
BNAME = {b['id']: b['title'] for b in L['blocks']}


def fmt(s):
    return '%d:%02d' % (int(s // 60), int(round(s % 60)) if round(s % 60) < 60 else 59)


def entry_minutes(corner):
    name, rate, prof, sc = corner
    T.DUR_SCALE = sc
    ent = {}
    for m in TD.MINUTES:
        p = T.plan(PV, m * 60, rate, prof)
        for ev in p['events']:
            ent.setdefault(ev['clip']['id'], m)
    T.DUR_SCALE = 1.0
    return ent


def plan_of(corner, m):
    name, rate, prof, sc = corner
    T.DUR_SCALE = sc
    p = T.plan(PV, m * 60, rate, prof)
    T.DUR_SCALE = 1.0
    return p


C = {c[0]: c for c in TD.corners(L)}
ENT = entry_minutes(C['hoc'])
ENT_NES = entry_minutes(C['nes'])
out = []
P = out.append

P('# Ders 3 · Uykuya Geçiş — metin (B adımı, Parti 1)')
P('')
P('Sürüm: %s. Kaynak: `ders3.lesson.json` (tek kaynak `ders3_kaynak.py`). **Ses yok:** ElevenLabs bağlantısı bu '
  'oturumda yoktu; hiçbir ses üretilmedi, ücretli çağrı yapılmadı. Bütün süreler hece modelinden tahmindir '
  '(**VARSAYIM**; köşeler §7). Metin, PLAN.v3 §E.1\'in üç onayını bekliyor: inceleyici adı verilmediği için karar 2 '
  'yedeği (Türkçe editör ve usta hoca yerine birbirinden bağımsız iki model incelemesi; Ders 3 psikolog gerektirmez).'
  % L['version'])
P('')
P('Okuma anahtarı: `[a–b]` klipten sonraki sessizlik (sn, planlayıcı bu aralıkta esnetir). **(Z)** zorunlu: 5 dk dahil her '
  'sürümde çalar. **(İ n)** isteğe bağlı: Nefona Hoca köşesinde (4,68 hece/sn, yüksek duraklama) *n*. dakikadan itibaren '
  'girer; Neslihan köşesinde farklıysa ikisi yazılır. **6+** "yalnız 6 dk ve üstü" (minTarget). Çok cümleli klip tek TTS '
  'isteğidir, cümle sonlarından kesilir; ekrandaki cümle söylenen cümledir (SPEC.v3 §3.1).')
P('')
P('## 1. Ders kimliği')
P('')
P('| Alan | Değer |')
P('|---|---|')
P('| Söz (kart) | %s |' % L['tagline'])
P('| Duruş, zaman | yatakta, ışık kapalı ya da kısık; gece dersi. Süreler **5 · 15** (varsayılan 15; 3 dk yok, PLAN.v3 §A.3) |')
P('| Teknik ve çalma sırası | Varış → C1 yavaş, uzun veriş (tutma yok, sayı yok) → C2 bedenin ağırlaşması (ayaklardan başa) '
  '→ C4 nefesle geri sayma (10 dk\'dan) → C3 tek sahneli, ayrıntılı imgeleme → K uyku izni. Dışa dönüş yok. |')
P('| Benzersiz açılış | "Günün sesleri geride kalıyor; yatağına yerleşiyorsun." (PLAN.v2 §A.2.1 yönünün "-(y)abil-"siz, '
  '"şimdi"siz biçimi) |')
P('| Anahtar cümle | "Bugün bitti; artık dinlenebilirsin." (C1 sonu) → "Bugün bitti; dinlenebilirsin." (C4 sonu, 10 dk ve '
  'üstü) → "Bugün bitti." (uyku izninin başı). 5–9 dk\'da iki geçiş. |')
P('| İmge yayı | yağmurlu bir akşam: oda ya da üstü örtülü veranda (yağmur istemeyen için sessiz akşam) → yağmuru dinlemek '
  '(ses, oluk, ıslak toprak kokusu, camdaki izler) → örtünün ağırlığı ve sıcaklığı → lambanın sarı ışığı → ışık kısılır, '
  'loş bir aydınlık kalır (karanlık tümüyle gelmez) |')
P('| Derse özgü motif | ağırlığı yatağa **vermek** (Ders 2\'nin "zemin taşıyor"undan ayrı); "Bugün bitti." |')
P('| Görsel | sönen kor, kehribar `#E3A857` / `#9B651A`; sayıyla bir soluk kararır; uyku izninde söner, ekran siyah |')
P('| Müzik | %s; %s; doğa: %s. Kuyruk 0/5/10/20 dk (varsayılan 10), son 3 dk kosinüs, tamamen durur; sürenin dışında |'
  % (L['music']['key'], L['music']['pulseNote'].split(';')[0], L['music']['nature']['default']))
P('| Ses | Nefona Hoca (`%s`), `eleven_v4`, 3 çekim; uyku izninden sonra ses gerçekten alçalır: −4,5 / −6 dB '
  '(`voicePhaseGainDb.sleepSteps`) |' % L['voiceProduction']['chosen']['voice_id'])
P('| Gelişim | önce puanı yok; ertesi sabah 12.00\'ye kadar: "%s" 1–10 |' % L['progress']['morningQuestion'])
P('')
P('## 2. Metin, blok blok')
P('')
for b in L['blocks']:
    P('### %s · %s' % (b['id'], b['title']))
    P('')
    extra = ''
    if b['id'] == 'C4':
        extra = ' Blok 10. dakikada girer (entryRank %s); altı…on 14. dakikada tek grup olarak.' % b.get('entryRank')
    P('Evre: %s. 5/10/15 dk blok süresi (hoc): %s sn.%s' % (
        ', '.join(dict.fromkeys(c['phase'] for c in b['clips'])),
        ' / '.join('%s' % b['prefSec'][k] for k in ('5', '10', '15')), extra))
    P('')
    P('```')
    nums = []
    for c in b['clips']:
        if c.get('carrier'):
            nums.append(c)
            continue
        if nums:
            P('‖ %s  {sayılar; 8 sn\'de bir; taşıyıcı car.sayi3}' % ' '.join(
                '%s%s' % (n['text'], '' if n['tier'] == 'required' else '°') for n in nums))
            nums = []
        g = c['gapAfter']
        if c['tier'] == 'required':
            tag = '(Z%s)' % (' 6+' if c.get('minTarget') else '')
        else:
            e1, e2 = ENT.get(c['id']), ENT_NES.get(c['id'])
            tag = '(İ %s%s)' % (e1, '' if e1 == e2 else '/nes %s' % e2)
        P('‖ %s %s [%g–%g]' % (tag, c['text'], g['min'], g['max']))
        if c.get('short'):
            sh = c['short']
            P('    5 dk kısa biçimi: %s [%g–%g]' % (sh['text'], sh['gapAfter']['min'], sh['gapAfter']['max']))
    if nums:
        P('‖ %s' % ' '.join(n['text'] for n in nums))
    P('```')
    if b['id'] == 'C4':
        P('')
        P('° altı…on isteğe bağlı grup (14. dakikadan). Sayılar tek başına üretilmez: "%s" tek istekte okunur, üç nokta '
          'duraklarından kesilir, ön söz atılır.' % L['carriers'][0]['text'])
    P('')

P('## 3. Süre sürüm sürüm (Nefona Hoca köşesi, 4,68 hece/sn, yüksek duraklama; VARSAYIM)')
P('')
P('| dk | bloklar | klip | hece | konuşma payı | blok süreleri (A · C1 · C2 · C4 · C3 · K) |')
P('|---|---|---|---|---|---|')
for m in TD.MINUTES:
    p = plan_of(C['hoc'], m)
    bd = T.block_durations(p)
    bd['A'] = bd.get('A', 0) + p['events'][0]['start']
    syl = sum(ev['clip']['syllables'] for ev in p['events'])
    P('| %d | %s | %d | %d | %%%.0f | %s |' % (m, TD.fmt_blocks(p), len(p['events']), syl,
                                            100 * p['speech'] / p['total'],
                                            ' · '.join(fmt(bd[k]) if k in bd else '—' for k in
                                                       ('A', 'C1', 'C2', 'C4', 'C3', 'K'))))
P('')
P('Önek kuralı: her dakikanın klipleri bir sonrakinin alt kümesidir (5 ⊂ 6 ⊂ … ⊂ 15; üç köşede denetlendi, '
  '`timing.txt`). Kısa biçim (c3.kisilir, 5 dk) aynı kimlikle çalar.')
P('')
for m in TD.RELEASE:
    for cn in ('hoc', 'nes'):
        p = plan_of(C[cn], m)
        P('### %d dakika · %s köşesi (toplam %.1f sn, konuşma %.1f sn, giriş müziği %.1f sn)' % (
            m, cn, p['total'], p['speech'], p['events'][0]['start']))
        P('')
        P('```')
        for ev in p['events']:
            c = ev['clip']
            P('%6s  %-3s %-14s %s  [+%.1f]%s' % (fmt(ev['start']), ev['block'], c['id'], c['text'], ev['gap'],
                                              '  (5 dk kısa biçimi)' if c.get('shortForm') else ''))
        P('%6s  — dosya biter; müzik kuyruğu başlar (sürenin dışında)' % fmt(p['total']))
        P('```')
        P('')

P('## 4. Ekler (ayrı dosyalar)')
P('')
for k, ex in L['extras'].items():
    P('**%s** — %s' % (ex['title'], ex.get('rule', '')))
    P('')
    P('```')
    for c in ex['clips']:
        P('‖ %s [%g–%g]' % (c['text'], c['gapAfter']['min'], c['gapAfter']['max']))
    P('```')
    P('')
P('"Uykuya geç" ve Durdur dönüşünün süreleri üç hızda ve iki duraklama profilinde denetlendi (pilot `quick_and_stop`; '
  '"Uykuya geç" 25–75 sn VARSAYIM, Durdur dönüşü 20–30 sn).')
P('')
P('## 5. Ekran metinleri (seste yok)')
P('')
P('- Kart sözü: %s' % L['tagline'])
P('- Açılış ekranı: %s' % ' / '.join(L['openingScreen']))
P('- Hazırlık kartı: %s' % ' · '.join(L['preparationCard']))
P('- Ertesi sabah sorusu: %s (1–10)' % L['progress']['morningQuestion'])
P('- Kaynak kartı cümlesi: %s' % L['evidenceLine'])
for k, v in L['evidenceByVersion'].items():
    P('- %s dk sürüm satırı: %s' % (k, v))
P('')
P('## 6. Bilimsel dayanak (yalnız doğrulanmış dosyalardan; yeni PMID yok)')
P('')
P('| Kaynak | PMID | DOI | Dosya | Derste neye dayanak |')
P('|---|---|---|---|---|')
for r in L['sourcesCard']['rows']:
    P('| %s | %s | [%s](https://doi.org/%s) | %s | %s |' % (r['cite'], r['pmid'], r['doi'], r['doi'], r['file'],
                                                        r['detail']))
P('')
P('Sağlık iddiası yok: hiçbir cümle "uyutur", "uykusuzluğa iyi gelir" demez; kart karşı kanıtı da yazar (Sharpe 2023).')
P('')
P('## 7. Köşeler ve denetim özeti')
P('')
for name, v in L['timingModel']['corners'].items():
    P('- **%s**: %.2f hece/sn, %s duraklama, × %.3f — %s' % (name, v['rate'], v['profile'], v['durScale'], v['basis']))
P('')
P('Ayrıntı ve bütün planlar `timing.txt`\'de (`python3 timing_d3.py`).')
P('')
P('## 8. PLAN\'dan sapmalar ve açık sorular (inceleyicilere)')
P('')
for x in [
    'Anahtar cümle: PLAN.v2 §A.2.1 yönü "Bugün bitti; şimdi dinlenebilirsin." → "Bugün bitti." → "Dinlenme zamanı…". '
    'Üçüncüsü yüklemsiz, üç noktalı ve ikinciden uzundu; "şimdi" dolgu listesinde. Yerine: "Bugün bitti; artık '
    'dinlenebilirsin." → "Bugün bitti; dinlenebilirsin." → "Bugün bitti."',
    'Benzersiz açılış "-(y)abil-"siz yazıldı ("…yatağına yerleşiyorsun"): 5 dakikada a.izin ile aynı 60 sn\'ye düşer.',
    'Beden dolaşımı ayaklardan başa (PLAN.v2 §A.2.2 satır 3); Ders 2\'nin "sağ → sol → arka → ön → bütün" sırası değil. '
    'PLAN.v2 §C.1 ve §E.6 #5 "her derste aynı sıra" der; iki madde çelişiyor. Seçim: derse özgü satır (A.2.2); sağ ve sol '
    'karışmıyor. Usta hoca kararı.',
    'Açılış sırası pilot Ders 2 gibi: dersin kendi açılışı önce, ortak açılış cümlesi göz seçiminden sonra (PLAN.v2 §A.1, '
    'T33). §A.2.1\'deki "ortak cümleden hemen sonra" sırası uygulanmadı.',
    '<= 15 dk\'da duyurulu sessiz pencere yok (her boşluk <= 20 sn). Uyku dersinde pencere dönüşü ("Yeniden '
    'seninleyim") uyandırabilir; 16–30 dk\'daki pencereler için dönüş cümlesinin biçimi usta hocaya soruldu (iskelet30.md).',
    'Durdur (X) sonrası isteğe bağlı sesli dönüş uyku dersinde de var (kişi düğmeye kendi dokunur); metni gece için '
    'yazıldı ("Ders burada bitti; şu an yatağındasın." …).',
    '"sesim yavaşça kısılacak" sözünü karışım tutar: k.uyanik −4,5 dB, k.son −6 dB (VARSAYIM). Konuşma − yatak >= 15 dB '
    'korunmalı; ölçülmedi.',
    'Metin bütçesi: 15 dk tam metin 975 hece; sure.md §4.1 modeli ≈ 1.180 (−%17). Konuşma payı %25–27 (uyku dersi modeli '
    '≈ %30). Seyreklik bilinçli (azalan anlatım), ama sessizlikler 15. dakikada pref→max yolunun %37–42\'sine esniyor.',
    'Varış 15 dk\'da 1:30 (çapa 1:15), C1 2:04 (çapa 1:45); C3 4:32 (çapa 5:00). C3 tek dokulu blok; 5:00\'ı aşarsa '
    'dikkat eğrisi denetimi (<= 300 sn) kırılır.',
]:
    P('- ' + x)
P('')
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
print('yazıldı', OUT, len(out), 'satır')
