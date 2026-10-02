import sys; sys.path.insert(0,'.')
from eval5 import run
G = {'min': 4.0, 'pref': 4.0, 'max': 7.0}; K = {'min': 3.0, 'pref': 9.0, 'max': 11.0}; H = {'min': 1.0, 'pref': 2.0, 'max': 3.0}
cands = {
 'yok': {},
 'gozler11+kolay11': {'a.gozler': ('Gözlerini kapatmak sana kalmış.', G), 'a.kolay': ('Gevşemek zor gelirse bu da olur.', K)},
 'gozler11+kolay14': {'a.gozler': ('Gözlerini kapatmak sana kalmış.', G), 'a.kolay': ('Gevşemek zor gelirse bunda yanlış bir şey yok.', K)},
 'gozler11': {'a.gozler': ('Gözlerini kapatmak sana kalmış.', G)},
}
for k, vs in cands.items():
    run(vs, k, voices=('hoc','nes','hak'))
