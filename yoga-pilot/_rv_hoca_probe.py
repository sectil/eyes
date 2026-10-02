import sys
import os; sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'pilot'))
import timing as tm
L=tm.load()
def show(T,rate,prof):
    p=tm.plan(L,T*60,rate,prof)
    print(f"=== {T} dk {rate} {prof} mode={p['mode']} f={p['f']:.2f}")
    for ev in p['events']:
        s=ev['start']; m=int(s//60); sec=s-60*m
        print(f"{m:2d}:{sec:04.1f} {ev['block']:8s} {ev['clip']['id']:16s} d={ev['dur']:4.1f} g={ev['gap']:4.1f} | {ev['clip']['text']}")
for a in sys.argv[1:]:
    T,rate,prof=a.split(',')
    show(int(T),float(rate),prof)
