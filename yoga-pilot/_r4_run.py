import json, os, sys, time
sys.path.insert(0, '/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
os.chdir('/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/pilot')
t0 = time.time()
import ders2_kaynak as K
K.finalize()
L = K.lesson_dict()
K.estimates(L)
json.dump(L, open('ders2.lesson.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
import timing
rc = timing.main()
print('rc', rc, 'sn %.0f' % (time.time() - t0))
