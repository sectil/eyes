import pathlib, sys, json
sys.path.insert(0, 'pilot')
import timing
p = pathlib.Path('PLAN.v2.md')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:100])
    t = t.replace(old, new)
rep('uzaktan gelip giden ses ve güneşin sıcaklığı (en kısa imgede de) → ayak tabanları, koku, izler, esinti → dinlenme yeri: ılık taş, ışık, gökyüzü',
    'uzaktan gelip giden ses → açık, aydınlık bir yere varış ve güneşin sıcaklığı (en kısa imgede de; pilot 4. tur L3-06) → '
    'yolun kenarında rahat bir köşe (17–18. dk\'dan; MT3-11, TR3-05) → ayak tabanları, kendi izlerin, koku, esinti → ılık taş, ışık, gökyüzü')
rep('C2 ≥ 0:30 ve N2 ≥ 0:18 (ölçülen tahmin: C2 0:31–0:32, N2 0:19–0:22)',
    'C2 ≥ 0:30 ve N2 ≥ 0:15 (pilot 4. tur L3-03, MT3-05: 5 dakikada niyet başta ve sonda bir kez söylenir, kısa biçim; '
    'ölçülen tahmin: C2 0:40–0:42, N2 0:17)')
# C.8 örneği: 15 dk, 5,6 yüksek planının A + N1 klipleri
L = timing.load('pilot/ders2.lesson.json')
pl = timing.plan(L, 15 * 60, 5.6, 'hi')
lines, syl, wrd, chars = [], 0, 0, 0
for ev in pl['events']:
    if ev['block'] not in ('A', 'N1'):
        continue
    c = ev['clip']
    g = ev['gd']
    pre = '' if not lines else '‖ '
    opt = '(isteğe bağlı) ' if c['tier'] != 'required' else ''
    rngtxt = '[%s–%s]' % (('%g' % g['min']).replace('.', ','), ('%g' % g['max']).replace('.', ','))
    lines.append('%s%s%s %s' % (pre, opt, c['text'], rngtxt))
    syl += c['syllables']; wrd += c['words']; chars += len(c['text'])
block = '\n'.join(lines)
secs = {}
for rate in timing.RATES:
    for pr in ('lo', 'hi'):
        prof = timing.profile(pr, rate)
        secs[(rate, pr)] = sum(timing.clip_dur(ev['clip'], rate, prof) for ev in pl['events'] if ev['block'] in ('A', 'N1'))
a_n1 = sum(ev['dur'] + ev['gap'] for ev in pl['events'] if ev['block'] in ('A', 'N1'))
i0 = t.index('### C.8 Örnek (Ders 2, Varış + N1 Niyet, 15 dk sürüm; pilot 3. tur metni, insan editör onayı bekliyor)')
i1 = t.index('---', t.index('gelecek") ve yararlanıcısız niyet', i0))
new = ('### C.8 Örnek (Ders 2, Varış + N1 Niyet, 15 dk sürüm; pilot 4. tur metni, insan editör onayı bekliyor)\n\n'
       'Köşeli parantez: klipten sonraki sessizlik, sn (min–max; planlayıcı bu aralıkta esnetir). Kaynak:\n'
       '`pilot/ders2.lesson.json`; 15 dk, 5,6 hece/sn, yüksek duraklama planı. Çok cümleli klipler tek TTS isteğidir, cümle\n'
       'sonlarından kesilir ve araya uygulamanın cümle arası sessizliği girer (Varış 0,6–1,0 sn, Derinleşme 0,8–1,3 sn;\n'
       'pilot 4. tur MT3-02).\n\n```\n' + block + '\n```\n\n'
       'Bu örnekte %d hece, %d sözcük ve %d karakter var (%s hece/sözcük, %s karakter/sözcük; `pilot/timing.py` ile\n'
       'sayıldı). Sese göre ≈ %d–%d sn konuşma eder. 15 dk sürümde Varış + N1 ≈ %d:%02d\'dir; kalan süre boşluklardan\n'
       'gelir. Emir kipi yoktur (güvenlik cümleleri dışında); yönergeler "-mek yeterli", "sana kalmış", "iyi olur", şimdiki\n'
       'zaman ve "-ebilirsin" arasında dağıtılır; böylece hiçbir 60 sn\'de üçten çok "-(y)abil-" duyulmaz (pilot 3. tur,\n'
       'TR2-03, H11). 4. turda: örtü ve yastık uzanmadan önce (MT3-13), "yan yatıp zemine yerleşmen" (TR3-02, MT3-05),\n'
       'bakış serbest ve bir noktaya bağlı değil (TR3-14, S3-05), varış zemin cümlesiyle biter (MT3-12), niyet "söylemek\n'
       'yeterli" (S3-08) ve hazır niyet "Kendime dinlenmeye izin veriyorum." (TR3-04); 5 dakikada niyet bir kez söylenir\n'
       '(L3-03, MT3-05). Sürüm 1\'deki ve pilotun ilk turlarındaki çifte izin ("İstersen … seçebilirsin"), gelecek güvencesi\n'
       '("bugün sana iyi gelecek") ve yararlanıcısız niyet ("Dinlenmeye izin veriyorum") bu metinde yok.\n\n') % (
           syl, wrd, chars, ('%.1f' % (syl / wrd)).replace('.', ','), ('%.1f' % (chars / wrd)).replace('.', ','),
           round(min(secs.values())), round(max(secs.values())), int(a_n1 // 60), int(round(a_n1 % 60)))
t = t[:i0] + new + t[i1:]
p.write_text(t, encoding='utf-8')
print(new[:2600])
