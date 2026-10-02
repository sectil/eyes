import pathlib
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)
rep(r'''      'nabız (profilde ışığa duyarlılık cevabı "evet/emin değilim" ise nabız yok) |')''',
    r'''      'nabız (profilde ışığa duyarlılık cevabı "evet/emin değilim" ise nabız yok) |' % (
          sgs('Derin'), n(L['sentenceGapBreathPair']['min']), n(L['sentenceGapBreathPair']['max'])))''')
rep(r'''      '(VARSAYIM) |' % (sgs('Derin'), n(L['sentenceGapBreathPair']['min']), n(L['sentenceGapBreathPair']['max'])))''',
    r'''      '(VARSAYIM) |')''')
# F['in'] listesinden silinmiş klip
rep("        'c4.x.yaklas', 'c4.x.gok', 'c4.x.donus2', 'c5.x.dayanak', 'c2.durak', 'c2.x.ritim', 'c5.x.hepsi',",
    "        'c4.x.yaklas', 'c4.x.gok', 'c4.x.donus2', 'c2.durak', 'c2.x.ritim', 'c5.x.hepsi',")
p.write_text(t, encoding='utf-8')
print('ok')
