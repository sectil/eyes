// Alarmı telefona kurar. iOS 26+: AlarmKit (ios/App/App/AlarmPlugin.swift) — sessiz ve Odak modunda da çalar.
// iOS 15–25: yerel bildirim (@capacitor/local-notifications 8.3.1) — sessiz modda ses çıkmaz; ekranda açıkça yazılır.
// Web: alarm yok. Kimlikler: 7600 + gün (0..6, haftalık tekrar: schedule.on, weekday 1 = Pazar) ve 7607 (tek sefer).
// 74xx/75xx (notifyApply) ve 7301/7302 (restNotify) bu aralıkta değil; birbirini iptal etmez.
import { Alarm, isIOSApp } from './native.js'
import { notifyPermission } from './restNotify.js'
import { soundById } from './alarmSounds.js'

export const FALLBACK_BASE = 7600
export const FALLBACK_ONCE = 7607
const FALLBACK_IDS = Array.from({ length: 8 }, (_, i) => FALLBACK_BASE + i)
export const ALARM_TITLE = 'Nefona · Günaydın'
export const FALLBACK_BODY = 'Güne başlama vakti.'
// Kurma/kaldırma sonrası (izin penceresi görünürlük olayı tetiklemez): App durumu yeniden okur
export const ALARM_CHANGED = 'nefona:alarm-changed'
const changed = () => {
  try {
    globalThis.dispatchEvent?.(new Event(ALARM_CHANGED))
  } catch {
    // ortamda Event yok
  }
}

let modPromise = null
const loadMod = () => {
  if (!isIOSApp()) return Promise.resolve(null)
  if (!modPromise) modPromise = import('@capacitor/local-notifications').catch(() => null)
  return modPromise
}
// Eklenti nesnesi kutuda döner (Bug 15; restNotify.js notu)
const ln = async () => {
  const m = await loadMod()
  return m ? { LN: m.LocalNotifications } : null
}

// { platform: 'web'|'alarmkit'|'notify', auth } — AlarmKit izni ya da bildirim izni
export async function alarmStatus() {
  if (!isIOSApp()) return { platform: 'web', auth: null }
  try {
    const s = await Alarm.status()
    if (s?.available) return { platform: 'alarmkit', auth: s.auth ?? 'notDetermined' }
  } catch {
    // eklenti yok ya da eski iOS: bildirime düş
  }
  return { platform: 'notify', auth: await notifyPermission() }
}

// Bildirim yedeği: haftalık günler ya da tek sefer (at). Ses bildirimin varsayılanı (ekranda "bildirim sesi" yazar;
// Dalga sesinin bildirimde çaldığı denenmedi).
export function fallbackNotifications(cfg) {
  const base = { title: ALARM_TITLE, body: FALLBACK_BODY, interruptionLevel: 'timeSensitive', extra: { kind: 'alarm' } }
  if (cfg.days.length) return cfg.days.map((d) => ({ ...base, id: FALLBACK_BASE + d, schedule: { on: { weekday: d + 1, hour: cfg.hour, minute: cfg.minute }, allowWhileIdle: true } }))
  return cfg.at ? [{ ...base, id: FALLBACK_ONCE, schedule: { at: new Date(cfg.at), allowWhileIdle: true } }] : []
}

// Kurar. Döner: { ok: true } | { ok: false, reason: 'denied'|'unsupported'|'error', detail? }
// İzin burada istenir (kişi "Kur"a dokundu). Tek alarm: yenisi kurulduktan sonra eskisi iptal edilir.
export async function scheduleAlarm(cfg, platform) {
  try {
    return await scheduleOn(cfg, platform)
  } finally {
    changed()
  }
}
async function scheduleOn(cfg, platform) {
  if (platform === 'alarmkit') {
    try {
      let { auth } = await Alarm.status()
      if (auth === 'notDetermined') auth = (await Alarm.requestAuth())?.auth
      if (auth !== 'authorized') return { ok: false, reason: 'denied' }
      const file = soundById(cfg.sound).file
      await Alarm.schedule({ hour: cfg.hour, minute: cfg.minute, weekdays: cfg.days, ...(file ? { sound: file } : {}) })
      // iOS 26'ya güncellemeden önce kurulmuş bildirim yedeği kalmasın (ikisi birden çalmasın)
      await cancelFallback()
      return { ok: true }
    } catch (e) {
      return { ok: false, reason: 'error', detail: String(e?.message ?? e) }
    }
  }
  if (platform === 'notify') {
    const pl = await ln()
    if (!pl) return { ok: false, reason: 'unsupported' }
    const { LN } = pl
    try {
      let { display } = await LN.checkPermissions()
      if (display !== 'granted' && display !== 'denied') display = (await LN.requestPermissions())?.display
      if (display !== 'granted') return { ok: false, reason: 'denied' }
      // Önce yenisi (aynı kimlik bekleyeni değiştirir); kurulamazsa eskisi yerinde kalır. Sonra kullanılmayanlar iptal.
      const list = fallbackNotifications(cfg)
      if (list.length) await LN.schedule({ notifications: list })
      const used = new Set(list.map((n) => n.id))
      const stale = FALLBACK_IDS.filter((id) => !used.has(id))
      if (stale.length) await LN.cancel({ notifications: stale.map((id) => ({ id })) })
      return { ok: true }
    } catch (e) {
      return { ok: false, reason: 'error', detail: String(e?.message ?? e) }
    }
  }
  return { ok: false, reason: 'unsupported' }
}

async function cancelFallback() {
  const pl = await ln()
  if (!pl) return
  try {
    await pl.LN.cancel({ notifications: FALLBACK_IDS.map((id) => ({ id })) })
  } catch {
    // yoksay
  }
}

// İki yolu da iptal eder (kaldır, "Tüm verileri sil"). Hata yutulur.
export async function cancelAlarm() {
  if (!isIOSApp()) return
  try {
    await Alarm.cancel()
  } catch {
    // AlarmKit yok
  }
  await cancelFallback()
  changed()
}

// "Nefona'yı aç"a dokunulan an (ms) ya da null; okununca native tarafta silinir
export async function consumeOpen() {
  if (!isIOSApp()) return null
  try {
    const r = await Alarm.consumeOpen()
    return Number.isFinite(r?.openedAt) ? r.openedAt * 1000 : null
  } catch {
    return null
  }
}

// Sesi uygulamanın içinde dinlet (alarm kurmadan). Varsayılan ses (file null) dinletilemez: iOS vermez.
export async function previewSound(id) {
  const file = soundById(id).file
  if (!file || !isIOSApp()) return false
  try {
    await Alarm.preview({ file })
    return true
  } catch {
    return false
  }
}
export async function stopPreview() {
  if (!isIOSApp()) return
  try {
    await Alarm.stopPreview()
  } catch {
    // yoksay
  }
}
