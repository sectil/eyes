// "Nasıl yapılır" kartları (components/StepCards.jsx) bir kez gösterilir; sonra ekran doğrudan başlar.
// Anahtar başına localStorage: gozolcum:howto:<id> = '1'. "Tüm verileri sil" prefix ile temizler.
export const HOWTO_PREFIX = 'gozolcum:howto:'
const key = (id) => `${HOWTO_PREFIX}${id}`
export function howtoSeen(id, storage = globalThis.localStorage) {
  try {
    return storage?.getItem(key(id)) === '1'
  } catch {
    return false
  }
}
export function markHowtoSeen(id, storage = globalThis.localStorage) {
  try {
    storage?.setItem(key(id), '1')
  } catch {
    // depolama yok
  }
}
export function resetHowto(id, storage = globalThis.localStorage) {
  try {
    storage?.removeItem(key(id))
  } catch {
    // yoksay
  }
}
// Tüm kartları sıfırla ("Tüm verileri sil")
export function resetAllHowto(storage = globalThis.localStorage) {
  try {
    const ks = []
    for (let i = 0; i < (storage?.length ?? 0); i++) {
      const k = storage.key(i)
      if (k && k.startsWith(HOWTO_PREFIX)) ks.push(k)
    }
    ks.forEach((k) => storage.removeItem(k))
  } catch {
    // yoksay
  }
}
