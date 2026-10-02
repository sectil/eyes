// Fark Ettin mi? ekran metinleri: tek kaynak (fark-ettin-mi/METINLER.md kimlikleri). Kural: ekrana yalnız onaylı metin
// çıkar. Onaylı = bugünkü uygulamada zaten görünen metin (aynen) ya da METINLER'de sahip onaylı (S). Taslaklar (T) burada
// metinsiz durur: say() onlar için null döner; ekran kimliği yer tutucu olarak tutar (street.test.js kilitler).
// Yeni metin gerekiyorsa: METINLER.md'ye taslak → 5 sn kapısı → onay; onaydan sonra buraya `text` ile eklenir.
import { COLORS } from './streetScenes.js'
import { ITEMS, VENDORS, TASKS } from './street.js'

const OK = 'onayli'
const T = 'T'
// METINLER.md satırları (durum oradaki gibi)
const METINLER = {
  M1: T, M2: T, M3: T, M4: T, D1: T, D2: T, D3: T, D4: T, D5: T, D6: T, D7: T, D8: T, D9: T,
  G1: T, G2: T, G3: T, G4: T, G5: T, 'Ş1': T, R1: T, R2: T, R3: T, R4: T, R5: T, Y1: T, Y2: T, N1: T, N2: T, N3: T, N4: T,
}
export const TEXTS = {
  ...Object.fromEntries(Object.entries(METINLER).map(([id, status]) => [id, { status }])),
  // onaylı: bugünkü metin, aynen (METINLER M5, M6, R6)
  M5: { status: OK, text: 'Bu bir fark etme alıştırması. Gerçek hayatta daha çok fark ettirdiği gösterilmedi.' },
  M6: { status: OK, text: 'Yürümeye başla' },
  R6: { status: OK, text: 'Bitti' },
  // bugünkü ekranda olan parçalar
  'task.label': { status: OK, text: 'Görevin' },
  ...Object.fromEntries(TASKS.flatMap((t) => [[`task.${t.id}`, { status: OK, text: t.text }], [`count.${t.id}`, { status: OK, text: t.q }]])),
}
// Yeni sayma hedefleri (task.<id>, count.<id>), "Gözünden kaçan" şablonları ve yeni seçenek adları kayıtlı değildir:
// bilinmeyen kimlik taslak sayılır (say → null).
export const isApproved = (id) => TEXTS[id]?.status === OK && typeof TEXTS[id]?.text === 'string'
// Onaylı metin ({ad} yer tutucuları doldurulur) ya da null (taslak ya da bilinmeyen kimlik: ekrana çıkmaz)
export function say(id, vars = {}) {
  if (!isApproved(id)) return null
  return TEXTS[id].text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m))
}
// Ekranın kullanacağı tek yol: onaylıysa metin, değilse kimlik yer tutucusu (görünür cümle değil; geliştirici görür)
export const textOr = (id, vars) => say(id, vars) ?? `⟨${id}⟩`
// Seçenek adları: renk adları, çocuğun elindeki, satıcının sattığı ve dükkân adları bugünkü ekranda var (onaylı);
// öbürleri (çalgı, tezgâh adı) taslaktır.
export function optionText(detail, id, v) {
  if (detail === 'color') return COLORS[v]?.name ?? null
  if (id === 'child') return ITEMS[v] ?? null
  if (id === 'vendor') return VENDORS[v] ?? null
  if (detail === 'shop') return v.charAt(0) + v.slice(1).toLocaleLowerCase('tr')
  return null
}
