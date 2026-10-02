import pathlib
p = pathlib.Path('ders2_md.py')
t = p.read_text(encoding='utf-8')
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)
rep(r'''      'patikanın başı → kendi hızında yürüyüş → uzaktan gelip giden ses ve güneşin sıcaklığı → patikanın kenarında '
      'rahat bir köşe (en kısa imgede de; MT3-11, L3-06) → ayak tabanları, izler, koku, esinti, ılık taş, ışık, gökyüzü '
      '→ sessiz pencere → aynı patikadan dönüş → görüntü silinir, taşıyan zemin |')''',
    r'''      'patikanın başı → kendi hızında yürüyüş → uzaktan gelip giden ses → açık, aydınlık bir yere varış ve güneşin '
      'sıcaklığı (en kısa imgede de; L3-06) → yolun kenarında rahat bir köşe (%s. dakikadan; imgenin ilk artımı, MT3-11, '
      'TR3-05) → ayak tabanları, kendi izlerin, koku, esinti, ılık taş, ışık, gökyüzü → sessiz pencere → aynı patikadan '
      'dönüş → görüntü silinir, taşıyan zemin |' % rng(IN['c4.yerles']))''')
rep(r'''      '>= 55 sn, niyet bloğu >= 20 sn; 5 dakikada (hedef < 6 dk) C2 >= 30 ve N2 >= 18 sn (H1; sahibe görünür değişiklik, '
      '§7).''', r'''      '>= 55 sn, niyet bloğu >= 20 sn; 5 dakikada (hedef < 6 dk) C2 >= 30 ve N2 >= 15 sn (H1; 4. turda N2 18 → 15, '
      'L3-03; sahibe görünür değişiklik, §7).''')
p.write_text(t, encoding='utf-8')
print('md ok')
