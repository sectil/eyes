// B2 hava akışının kararları (saf; App.jsx uygular). Sahip kararı 2026-10-01 (SAHIP_ISTEKLERI.md "Hava: il ve ilçe
// konumdan kendiliğinden"): rıza → iOS konum izni → il ve en yakın ilçe kendiliğinden → hava sayfası. Liste (SkyPlace)
// yalnız izin yokken ya da hava sayfasındaki "Değiştir"den. "…'de misin?" (SkyConfirm) adımı yok.
import { placeFromLocation } from './places.js'

// Giriş (Bilgi → "Hava (deneme)"): rıza yoksa rıza sayfası; rıza ve kayıtlı yer varsa doğrudan hava sayfası;
// rıza var, yer yoksa konum iznine. mode 'list' (yalnız liste) istenirse konum sorulmaz.
//   → 'consent' | 'sky' | 'locate' | 'list'
export function skyEntry({ consent, place, mode = 'locate' }) {
  if (!consent) return 'consent'
  if (mode === 'locate' && place?.il) return 'sky'
  return mode === 'locate' ? 'locate' : 'list'
}

// requestLocation (lib/sky.js) sonucu → { place } (kaydedilip hava sayfası açılır) | { list: true } (izin yok ya da
// konum alınamadı: il listesi). Yaklaşık ve kesin aynı: il + en yakın ilçe merkezi. Dönen yerde koordinat yok.
export function afterLocation(loc) {
  const place = loc?.status === 'granted' ? placeFromLocation(loc.pos, loc.accuracy) : null
  return place ? { place } : { list: true }
}
