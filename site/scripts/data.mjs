// Uygulamadan siteye veri: kaynakça, kanıt kartları, sürüm notları, modül listesi, güvenlik belirtileri, 7 alan.
// Amaç: site uygulamayla aynı şeyi söylesin; elle kopya tutulmasın. Çıktı: src/data.json (depoya girmez; dev/build
// öncesi üretilir). Yalnız yan etkisiz modüller içe aktarılır; manifestler (localStorage'a dokunabilir) metin olarak okunur.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const app = resolve(here, '../../app/src')
const imp = (p) => import(pathToFileURL(resolve(app, p)).href)

const [{ SOURCES, DESIGNS, DESIGN_RANK }, { EVIDENCE, NOT_CLAIMED, NOT_CLAIMED_SOURCES }, { RELEASES }, { RED_FLAGS }, { setupText }] =
  await Promise.all([imp('lib/sources.js'), imp('lib/evidence.js'), imp('lib/releases.js'), imp('lib/profile.js'), imp('lib/setupText.js')])

// Modüller: manifest.js dosyalarından id/title/ring/kind (metin olarak; kod çalıştırılmaz)
const modDir = resolve(app, 'modules')
const field = (s, k) => s.match(new RegExp(`^\\s*${k}:\\s*'([^']*)'`, 'm'))?.[1] ?? ''
const modules = readdirSync(modDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    let s
    try {
      s = readFileSync(resolve(modDir, d.name, 'manifest.js'), 'utf8')
    } catch {
      return null
    }
    return { id: field(s, 'id') || d.name, title: field(s, 'title'), ring: field(s, 'ring'), kind: field(s, 'kind') }
  })
  .filter((m) => m && m.title)

const T = setupText('tr')
const sources = Object.entries(SOURCES).map(([id, s]) => ({ id, ...s, designText: DESIGNS[s.design] ?? s.design, rank: DESIGN_RANK[s.design] ?? 0 }))
  .sort((a, b) => b.year - a.year || a.authors[0].localeCompare(b.authors[0]))

const data = {
  generatedAt: new Date().toISOString(),
  domains: T.domains, // { eye: 'Göz', … } 7 alan
  safety: { title: T.safety.title, sub: T.safety.sub, note: T.safety.note, flags: RED_FLAGS.map((f) => f.text) },
  purpose: T.paywall.purpose,
  features: T.paywall.features,
  planSteps: T.plan.steps,
  honest: T.plan.honest,
  modules,
  evidence: EVIDENCE,
  notClaimed: NOT_CLAIMED,
  notClaimedSources: NOT_CLAIMED_SOURCES,
  sources,
  designs: DESIGNS,
  releases: RELEASES,
}
mkdirSync(resolve(here, '../src'), { recursive: true })
writeFileSync(resolve(here, '../src/data.json'), JSON.stringify(data, null, 1))
console.log(`data.json: ${modules.length} modül, ${sources.length} kaynak, ${EVIDENCE.length} kanıt kartı, ${RELEASES.length} sürüm`)
