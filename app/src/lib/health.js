// Hareket (Apple Sağlık) özeti ve "kalk, biraz yürü" kuralı. Saf fonksiyonlar (test edilir).
// Veri telefondan çıkmaz (HealthPlugin.swift, yalnız okuma). Sağlık iddiası yok: gösterir, kaynağını verir.
//  - Adım: Paluch 2022 Lancet Public Health (doi:10.1016/S2468-2667(21)00302-9) — daha çok adımla daha düşük ölüm
//    riski; fayda 60 yaş üstünde ~6–8 bin, altında ~8–10 bin adımda düzleşiyor (gözlemsel; neden-sonuç değil).
//  - Hareket molası: Dunstan 2012 Diabetes Care (doi:10.2337/dc11-1931) — 20 dk'da bir 2 dk hafif yürüyüş,
//    kesintisiz oturmaya göre yemek sonrası şeker/insülini düşürdü (45–65 yaş, fazla kilolu 19 kişi; genellenemez).

// Son 1 saatte bu kadar adımın altı "neredeyse hiç yürümedi" sayılır. VARSAYIM: 100 adım ≈ 1 dk yürüyüş;
// Dunstan'ın 20 dk'da bir 2 dk'sına göre bir saatte hiç kalkmamak açık bir "ara ver" işaretidir.
export const WALK_NUDGE_STEPS = 100
export const WALK_NUDGE_HOURS = [9, 21] // gece hatırlatılmaz

// days: HealthPlugin.dailyTotals sonucu (eskiden yeniye). hasData: hiç sıfırdan büyük değer var mı
// (izin verilmemişse iOS hepsini 0 döndürür; o zaman "veri yok" gösterilir, "0 adım" değil).
export function summarizeHealth(days = []) {
  const list = (Array.isArray(days) ? days : []).filter((d) => d && typeof d.date === 'string')
  const n = (v) => (Number.isFinite(v) && v > 0 ? Math.round(v) : 0)
  const rows = list.map((d) => ({ date: d.date, steps: n(d.steps), distanceM: n(d.distanceM), exerciseMin: n(d.exerciseMin) }))
  const hasData = rows.some((r) => r.steps > 0 || r.distanceM > 0 || r.exerciseMin > 0)
  const today = rows.at(-1) ?? null
  const past = rows.slice(0, -1).filter((r) => r.steps > 0)
  const avgSteps = past.length ? Math.round(past.reduce((a, r) => a + r.steps, 0) / past.length) : null
  return { rows, hasData, today, avgSteps, activeDays: rows.filter((r) => r.steps > 0).length }
}

// "Kalk, 2 dk yürü" önerisi: gündüz, veri var ve son 1 saatte WALK_NUDGE_STEPS'ten az adım
export function walkNudge({ recentSteps = null, hasData = false, hour = new Date().getHours() } = {}) {
  if (!hasData || !Number.isFinite(recentSteps)) return false
  if (hour < WALK_NUDGE_HOURS[0] || hour >= WALK_NUDGE_HOURS[1]) return false
  return recentSteps < WALK_NUDGE_STEPS
}

// 4215 → "4.215" (Türkçe binlik ayırıcı)
export const fmtSteps = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString('tr-TR') : '—')
