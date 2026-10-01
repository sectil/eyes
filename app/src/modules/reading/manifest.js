// Okuma testi (MNREAD tarzı, sesli okuma doğrulamalı; eski adı "Okuma hızı"). Ana sonuç rahat okuduğun
// en küçük yazı (kritik yazı boyu). Ayrıntı: lib/reading.js, screens/ReadingTest.jsx.
import { readingStatus } from '../../lib/today.js'
import { readingV2, cpsOf } from '../../lib/reading.js'
import { sameCondition } from '../../lib/trend.js'

// reading-cps: rahat okunan en küçük yazı (kritik yazı boyu, logMAR; küçük daha iyi). Onaylı SONSUZ_YOL §3.B.6 okuma
// satırı; gelisim-merkezi PLAN §8.1 G1; DENETIM Ö-4 (okuma testi Göz alanının ölçüsüne ve hükmüne girmiyor).
//  - Seri: yeni protokol (readingV2), rahat boyu ölçülmüş testler, SON testin gözlük koşulunda (lib/trend.js
//    sameCondition); öbür koşullar seriye girmez.
//  - Kural (ölçü kuralı v2 parametreleriyle; VARSAYIM, plan "aynı gözlük koşulunda art arda 2 testte başlangıçtan
//    ≥ 0,2 logMAR"): ilk test alışma; başlangıç sonraki 2 testin ortancası; şimdi son test; fark ≥ 0,2 logMAR
//    (meaningful; tekrar payı ±0,12'nin üstü, Subramanian 2006) iki Pazartesi bakışında art arda sürerse değişim. İki
//    bakış arasında yeni test yoksa bakış sayılmaz (lib/progress.js metricStatusV2): değişim iki ayrı haftanın testini ister.
// AÇIK (BLOCKER, sahibe soruldu): bu metrik henüz progress.metrics'e KAYITLI DEĞİL. Kayda girince
// modules/registry.test.js "her metrik kendi örnek oturumuyla serisini verir" beklentisi (metSample) değişmek zorunda
// (okuma kaydı oturum değil test); o test gelisim-merkezi PLAN §8.3'te "değişmeden yeşil" listesinde, §8.2'de yok.
export const READING_CPS_METRIC = {
  key: 'reading-cps',
  label: 'Rahat okunan en küçük yazı',
  unit: 'logMAR',
  better: 'down',
  meaningful: 0.2,
  v2: { familiar: 1, baseDays: 2, currentDays: 1, persist: 2, sdFloor: 0 },
  series({ tests = [] } = {}) {
    const all = readingV2(tests).filter((t) => cpsOf(t) != null)
    const last = all.at(-1)
    if (!last) return []
    return all.filter((t) => sameCondition(t.correction ?? null, last.correction ?? null)).map((t) => ({ date: t.date, value: cpsOf(t) }))
  },
}

export default {
  id: 'reading',
  title: 'Okuma',
  label: 'okuma testi',
  ring: 'eye',
  kind: 'measure',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'eye' },
  gates: { eyeBudget: 'test' },
  ask: { before: ['correction'], after: ['nearDifficulty'] }, // gözlük testten önce, yakın zorluk sonuçtan sonra
  home: { section: 'measure', order: 30 },
  // Haftada bir, takvim günüyle; haftalık E testiyle aynı güne düşerse bir gün sonra (lib/today.js readingStatus,
  // karar 2026-09-29). Bugün yapıldıysa tamam görünür.
  today({ tests, sessions, now }) {
    const stop = { title: 'Okuma', minutes: 3, slot: 'measure', glyph: 'lines' }
    const s = readingStatus(tests, now, sessions)
    if (s.state === 'done') return { ...stop, done: true }
    return s.state === 'due' ? { ...stop, done: false } : null
  },
}
