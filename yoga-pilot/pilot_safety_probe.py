import sys; sys.path.insert(0,'.')
import timing as t
L=t.load()
def ids(p): return [e['clip']['id'] for e in p['events']]
def st(p,i):
    for e in p['events']:
        if e['clip']['id']==i: return e['start']
issues={}
for rate in (5.2,5.6,6.6):
  for prof in ('lo','hi'):
    for T in range(5,31):
      p=t.plan(L,T*60,rate,prof); I=ids(p)
      # C3 without gelmezse
      if 'c3.a1' in I and 'c3.gelmezse' not in I: issues.setdefault('c3_no_gelmezse',[]).append((rate,prof,T))
      if 'c3.a1' in I and 'a.karar' not in I: issues.setdefault('c3_no_karar',[]).append((rate,prof,T))
      # skip reminder distance to göğüs
      if 'c1.f20' in I:
        d=st(p,'c1.f20')-st(p,'c1.cerceve'); issues.setdefault('skip_to_gogus_max',[]).append(round(d))
      # eyes: from a.gozler to first eyes-release (c2.dikkat) 
      d=st(p,'c2.dikkat')-st(p,'a.gozler'); issues.setdefault('gozler_to_c2dikkat',[]).append(round(d))
      # br.orta relative position
      if 'br.orta' in I: issues.setdefault('brorta_frac_%d'%T,[]).append(round(st(p,'br.orta')/(T*60),2))
      # longest gap between any stop/exit reminders (a.izin, br.orta) and end
      # longest non-window gap
      mg=max((e['gap'] for e in p['events'] if not e['clip'].get('window')),default=0)
      issues.setdefault('max_plain_gap',[]).append(round(mg,1))
      # windows
      for e in p['events']:
        if e['clip'].get('window'): issues.setdefault('win_max',[]).append(round(e['gap'],1))
      # C5 c5.x.oldugu
      if 'c5.x.oldugu' in I: issues.setdefault('oldugu',[]).append((rate,prof,T))
      # time from k.son start to end
      issues.setdefault('kson_tail',[]).append(round(p['total']-st(p,'k.son'),1))
for k,v in issues.items():
  if isinstance(v[0],(int,float)): print(k,'min',min(v),'max',max(v))
  else: print(k,len(v),v[:6])
