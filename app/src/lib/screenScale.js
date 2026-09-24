// Otomatik ekran ölçüsü (iPhone uygulaması).
// WKWebView'de 1 CSS pikseli = 1 iOS "point". Bir inçteki point sayısı = ppi / nativeScale
// (nativeScale: fiziksel piksel / point; "Ekran Büyütme" açıkken de doğru kalır).
// ppi: doğrulanmış model tablosu (iphoneScreens.json, kaynaklar docs/iphone_ekran_tablosu.md).

export const MM_PER_INCH = 25.4

export function pxPerMmFromPpi(ppi, nativeScale) {
  if (!(ppi > 0) || !(nativeScale > 0)) return null
  return ppi / nativeScale / MM_PER_INCH
}

// Tablodaki piksel çözünürlüğü cihazın bildirdiği fiziksel çözünürlükle uyuşuyor mu?
// (Yanlış eşleşmeye karşı güvenlik: uyuşmazsa otomatik ölçüm kullanılmaz.)
export function resolutionMatches(entryPx, screenInfo) {
  if (!entryPx || !screenInfo) return false
  const a = [...entryPx].sort((x, y) => x - y)
  const b = [screenInfo.nativeWidth, screenInfo.nativeHeight].map(Math.round).sort((x, y) => x - y)
  return a[0] === b[0] && a[1] === b[1]
}

// table: { [model]: { ppi, px:[w,h], name } }
// Döner: { pxPerMm, model, name } veya null (tabloda yok / uyuşmazlık → manuel yedek)
export function autoCalibration(model, screenInfo, table) {
  const entry = model ? table[model] : null
  if (!entry) return null
  if (!resolutionMatches(entry.px, screenInfo)) return null
  const pxPerMm = pxPerMmFromPpi(entry.ppi, screenInfo.nativeScale)
  if (!pxPerMm) return null
  return { pxPerMm, model, name: entry.name }
}
