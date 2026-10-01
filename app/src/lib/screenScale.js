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

// Model eşleşmezse yedek: cihazın fiziksel çözünürlüğü tablodaki modellerle eşleşiyor ve
// hepsi aynı ppi'yi paylaşıyorsa o ppi kullanılır (ör. tabloya henüz eklenmemiş yeni model).
// VARSAYIM: aynı piksel çözünürlüğünde farklı ppi'li iki iPhone çıkarsa yedek devre dışı kalır.
// Döner: { cal, reason } — cal null ise reason kullanıcıya/geliştiriciye gösterilecek açıklamadır.
export function resolveAutoCalibration(model, screenInfo, table) {
  if (!screenInfo) return { cal: null, reason: 'Ekran bilgisi alınamadı (yerel eklenti yanıt vermedi)' }
  const byModel = autoCalibration(model, screenInfo, table)
  if (byModel) return { cal: byModel, reason: null }
  const matches = Object.values(table).filter((e) => resolutionMatches(e.px, screenInfo))
  const ppis = new Set(matches.map((e) => e.ppi))
  if (matches.length > 0 && ppis.size === 1) {
    const pxPerMm = pxPerMmFromPpi(matches[0].ppi, screenInfo.nativeScale)
    if (pxPerMm) return { cal: { pxPerMm, model, name: model || 'iPhone', byResolution: true }, reason: null }
  }
  const res = `${Math.round(screenInfo.nativeWidth)}×${Math.round(screenInfo.nativeHeight)}`
  const why = model && table[model] ? 'çözünürlük tabloyla uyuşmuyor' : 'model tabloda yok'
  return { cal: null, reason: `Otomatik ölçüm yapılamadı: ${why} (${model || 'model bilinmiyor'}, ekran ${res}, ölçek ${screenInfo.nativeScale})` }
}

// Son yedek (iPhone'da elle ayar ekranı hiç gösterilmez): tabloda eşleşme yoksa ekran ölçeğine
// göre tipik iPhone yoğunluğu kullanılır. VARSAYIM: 2x ekranlar 326 ppi, 3x ekranlar 460 ppi
// (tablodaki 3x modeller 458–476 ppi → hata en fazla ~%3,5; 2x modellerin hepsi 326).
export function estimateCalibration(nativeScale) {
  if (!(nativeScale > 0)) return null
  const ppi = nativeScale >= 2.5 ? 460 : 326
  return { pxPerMm: pxPerMmFromPpi(ppi, nativeScale), estimated: true }
}
