import sys, os, json, importlib
P='/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot'
sys.path.insert(0, P); os.chdir(P)
import timing, ders2_kaynak as k
k.finalize(); L = k.lesson_dict(); k.estimates(L)
json.dump(L, open(os.path.join(P,'ders2.lesson.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)
rc = timing.main()
print('rc', rc)
