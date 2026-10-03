// Dik Dur (plan docs/yol-haritasi/tasarim/dik-dur/PLAN.v2.md, sahip onayı 2026-10-03; metinler metin-D1-onay.md).
// Kısa ve tam tur; kayıt lib/dikDur.js makeRecord. "Bana hatırlat" (saat ve aralıklı kip) D1-3'te eklenir.
import { SAFETY_KEY } from '../../lib/dikDur.js'
import { CAM_KEY, CALIB_KEY } from '../../lib/postureSense.js'

export default {
  id: 'dik-dur',
  title: 'Dik Dur',
  label: 'Dik Dur',
  ring: 'life',
  kind: 'exercise',
  progress: { domain: 'body' },
  storageKeys: [SAFETY_KEY, CAM_KEY, CALIB_KEY], // kamera tercihi ve iki duruşun sayıları (görüntü yok)
  sessions: {
    match: (s) => s?.type === 'dik-dur',
    countsTowardGoal: true,
    describe: () => ({ title: 'Dik Dur', detail: '' }),
  },
  gates: {},
  home: { section: 'exercise', order: 92 },
  // "Bana hatırlat": saat kipi (günde en çok 3 saat) ve aralıklı kip (lib/postureRemind.js; settings.moduleReminders
  // ['dik-dur'].interval). Öneri saati 11.00 (PLAN §4.2, VARSAYIM: ekran işinin ortası).
  remind: { route: 'dik-dur', window: 'move', defaultTime: '11:00', science: ['nair2015', 'elkjaer2022', 'xing2026', 'alghadir2021'] },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-03, metin kapısı 5/5): ad çekimleri, genel anlar, kanıt.
  nef: {
    name: { tr: { '': 'Dik Dur egzersizi', ABL: 'Dik Dur egzersizinden', ACC: 'Dik Dur egzersizini', LOC: 'Dik Dur egzersizinde', DAT: 'Dik Dur egzersizine', INS: 'Dik Dur egzersiziyle', POSS: 'Dik Dur egzersizin', 'POSS-ABL': 'Dik Dur egzersizinden' } },
    moments: ['firstTime', 'returnAfterGap'],
    evidence: ['nair2015', 'elkjaer2022', 'xing2026', 'alghadir2021'],
    note: 'Dik Dur egzersizi: boyunu uzat, çeneni içeri çek, omuzlarını geri ve aşağı al; her biri 10 sn. Kayıt yalnız gün olarak okunur; kamera ölçüsü söylenmez.',
  },
}
