// Göz bütçesinin uygulama içindeki tek kopyası (saf motor: lib/eyeBudget.js). App süreyi buraya yazar;
// ekranlar (Yılan "Tekrar oyna" gibi yeni tur başlatan yerler) requestEyeRound() ile izin sorar.
import { loadBudget, saveBudget, addTime, check, startRest, settle, setMotion, setShort, emptyBudget } from './eyeBudget.js'
import { scheduleRestEnd, cancelRestEnd } from './restNotify.js'

export const BUDGET_EVENT = 'gozolcum:eye-budget' // durum değişti (kilit başladı/bitti)
export const EXHAUSTED_EVENT = 'gozolcum:eye-budget-exhausted' // yeni tur istendi ama bütçe dolu

let state = null
let lastSave = 0
const get = () => (state ??= loadBudget())
const persist = (force = false) => {
  const now = Date.now()
  if (force || now - lastSave > 5000) {
    saveBudget(get())
    lastSave = now
  }
}
const emit = (name, detail) => {
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }))
  } catch {
    // window yok (test)
  }
}

export function recordTime(kind, start, end) {
  state = addTime(get(), kind, start, end)
  persist()
}
export function eyeStatus(now = Date.now()) {
  state = settle(get(), now)
  return check(state, now)
}
export function beginRest(reason, now = Date.now()) {
  state = startRest(get(), reason, now)
  persist(true)
  scheduleRestEnd(state.rest.until) // izin yoksa sessizce atlar
  emit(BUDGET_EVENT, eyeStatus(now))
  return state.rest
}
export function setMotionHistory(yes) {
  state = setMotion(get(), yes)
  persist(true)
}
// Profilden: günde 6+ saat ekran → bütçe 3 dk (App, profil kaydedilince çağırır)
export function setShortBudget(yes) {
  state = setShort(get(), yes)
  persist(true)
  emit(BUDGET_EVENT, eyeStatus())
}
export const motionHistory = () => get().motion
export const restHistory = () => get().rests
export function flushBudget() {
  persist(true)
}
export function resetBudget() {
  cancelRestEnd()
  state = emptyBudget()
  persist(true)
  emit(BUDGET_EVENT, eyeStatus())
}

// Yeni bir göz turu (oyun turu) başlatılabilir mi? Değilse App'e haber verilir, App kilidi açar.
export function requestEyeRound(now = Date.now()) {
  const st = eyeStatus(now)
  if (!st.locked && !st.due) return true
  emit(EXHAUSTED_EVENT, st)
  return false
}
