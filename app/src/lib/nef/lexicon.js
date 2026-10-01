// Nef'in modül sözlüğü (Nef PLAN §4.8; ANA_OTURUM_ISTEMI N1 madde 3). Modül adı ve ölçüm sözcüğü manifestin `nef`
// alanından gelir (modules/registry.js sözleşmesi), dile göre. speak.js ve bank/<dil>.js render bu biçimi okur:
//   { names: { [modül id | etki anahtarı]: { '': yalın, ABL, ACC, … } }, metrics: { [metrik anahtarı]: { word, unit, percent? } } }
// Etkinin ya da ölçümün kendi adı (nef.name.effects, ör. yoga dersleri; nef.name.metrics, ör. Yön'ün Ayna puanı) modülün
// adından önce okunur (bank/tr.js nameOf).
// O dilde ad yoksa modülün adı yoktur: cümle kurulmaz, başka dile düşülmez (plan §4.7).
import { registry } from '../../modules/registry.js'

export function lexiconFrom(modules = [], lang = null) {
  const names = {}
  const metrics = {}
  if (!lang) return { names, metrics }
  for (const m of modules ?? []) {
    const nef = m?.nef
    if (!nef || typeof nef !== 'object') continue
    if (nef.name?.[lang]) names[m.id] = nef.name[lang]
    for (const own of [nef.name?.effects, nef.name?.metrics]) {
      for (const [key, byLang] of Object.entries(own ?? {})) if (byLang?.[lang]) names[key] = byLang[lang]
    }
    Object.assign(metrics, nef.metricWords?.[lang] ?? {})
  }
  return { names, metrics }
}

// Kayıtlı modüllerin sözlüğü (emekliler dâhil: eski kayıtların anları da okunur). Manifestler değişmez; dil başına bir kez.
const cache = new Map()
export function moduleLexicon(lang) {
  if (!cache.has(lang)) cache.set(lang, lexiconFrom(registry.modules, lang))
  return cache.get(lang)
}
