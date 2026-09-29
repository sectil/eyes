import pathlib
p = pathlib.Path('ders2_kaynak.py')
t = p.read_text(encoding='utf-8')
old = "        'sourcesCard': {'rows': [{'pmid': r[0], 'cite': r[1], 'doi': r[3]} for r in REFS],\n"
new = ("        'sourcesCard': {'rows': [{'pmid': r[0], 'cite': r[1], 'detail': r[2], 'doi': r[3], 'file': r[4]} for r in REFS],\n"
       "                        'note': 'cite kartta gösterilir; detail yalnız ders2.script.md §8 içindir (EV3-05)',\n")
assert t.count(old) == 1, t.count(old)
t = t.replace(old, new, 1)
p.write_text(t, encoding='utf-8')
print('ok')
