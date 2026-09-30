#!/usr/bin/env node
// İl ve ilçe tablosu üretimi (PLAN.v1 §5.5 madde 8). Kaynak: GeoNames TR.zip (CC BY 4.0), feature code ADM2 (ilçe) ve
// ADM1 (il). Çıktı: src/lib/places.data.js ({ il, ilce, lat, lon } + il merkezleri) ve fark raporu places-fark.md
// (GeoNames 974 ↔ resmî 973).
//
// Kullanım (app/ içinden):
//   node scripts/places.mjs                         # TR.zip'i indirir (curl + unzip gerekir)
//   node scripts/places.mjs --txt /yol/TR.txt       # indirilmiş TR.txt ile
//   node scripts/places.mjs --resmi /yol/resmi.csv  # resmî liste ("il;ilce" satırları, UTF-8) ile fark raporu
//   node scripts/places.mjs --fark /yol/places-fark.md
// Resmî liste verilmezse rapor yalnız GeoNames tarafını (sayılar, ad düzeltmeleri, çıkarılanlar) yazar ve
// karşılaştırma bölümünü "resmî liste verilmedi" diye bırakır.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = resolve(HERE, '..')
const OUT = join(APP, 'src/lib/places.data.js')
const DEFAULT_FARK = resolve(APP, '../docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/places-fark.md')
const URL = 'https://download.geonames.org/export/dump/TR.zip'

// GeoNames adındaki ekler ve bilinen yazım farkları (her biri raporda listelenir)
const IL_FIX = { 'Elâzığ': 'Elazığ' }
const ILCE_FIX = {
  'Kilis Merkez': 'Merkez',
  'Siirt Merkez': 'Merkez',
  'Muradiye / Berkri': 'Muradiye',
  'Cihanbeyli District': 'Cihanbeyli',
}
// İlçe olmayan ADM2 kayıtları: tabloya girmez, raporda gerekçesiyle yazılır (sahip/inceleme karar verir)
const EXCLUDE = { 'Doski Aşireti Bölgesi': 'ilçe değil (aşiret bölgesi); resmî listede yok' }

function arg(name) {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : null
}

export function cleanIlce(name) {
  if (ILCE_FIX[name]) return ILCE_FIX[name]
  return name.replace(/ İlçesi$/u, '').replace(/ District$/u, '').trim()
}

// TR.txt satırlarından tablo: { iller: [{ code, il, lat, lon }], places: [{ il, ilce, lat, lon, gid, raw }], dropped }
export function parseGeonames(text) {
  const rows = text.split('\n').filter(Boolean).map((l) => l.split('\t'))
  const iller = rows.filter((r) => r[7] === 'ADM1').map((r) => ({
    code: r[10], il: IL_FIX[r[1]] ?? r[1], raw: r[1], lat: round4(+r[4]), lon: round4(+r[5]),
  }))
  const byCode = new Map(iller.map((i) => [i.code, i]))
  const places = []
  const dropped = []
  for (const r of rows.filter((x) => x[7] === 'ADM2')) {
    if (EXCLUDE[r[1]]) { dropped.push({ raw: r[1], il: byCode.get(r[10])?.il ?? r[10], why: EXCLUDE[r[1]] }); continue }
    const il = byCode.get(r[10])
    if (!il) { dropped.push({ raw: r[1], il: r[10], why: 'il kodu ADM1 listesinde yok' }); continue }
    places.push({ il: il.il, ilce: cleanIlce(r[1]), lat: round4(+r[4]), lon: round4(+r[5]), gid: r[0], raw: r[1] })
  }
  const coll = new Intl.Collator('tr')
  places.sort((a, b) => coll.compare(a.il, b.il) || coll.compare(a.ilce, b.ilce))
  iller.sort((a, b) => coll.compare(a.il, b.il))
  return { iller, places, dropped, adm2: rows.filter((x) => x[7] === 'ADM2').length }
}

const round4 = (x) => Math.round(x * 1e4) / 1e4
const key = (il, ilce) => `${il.toLocaleLowerCase('tr')}|${ilce.toLocaleLowerCase('tr')}`

// Resmî liste ↔ GeoNames: yalnız birinde olanlar ve il başına sayı farkı
export function compare(places, resmi) {
  const g = new Set(places.map((p) => key(p.il, p.ilce)))
  const r = new Set(resmi.map((p) => key(p.il, p.ilce)))
  const onlyG = places.filter((p) => !r.has(key(p.il, p.ilce)))
  const onlyR = resmi.filter((p) => !g.has(key(p.il, p.ilce)))
  const count = (list) => list.reduce((m, p) => m.set(p.il, (m.get(p.il) ?? 0) + 1), new Map())
  const cg = count(places), cr = count(resmi)
  const perIl = [...new Set([...cg.keys(), ...cr.keys()])]
    .map((il) => ({ il, geonames: cg.get(il) ?? 0, resmi: cr.get(il) ?? 0 }))
    .filter((x) => x.geonames !== x.resmi)
  return { onlyG, onlyR, perIl }
}

export function farkReport({ places, iller, dropped, adm2 }, resmi, date = new Date().toISOString().slice(0, 10)) {
  const L = []
  L.push('# İl ve ilçe tablosu · fark raporu (GeoNames ↔ resmî liste)', '')
  L.push(`Üretim: \`app/scripts/places.mjs\`, ${date}. Kaynak: GeoNames TR.zip (CC BY 4.0), ADM1 ve ADM2.`, '')
  L.push('## GeoNames tarafı', '')
  L.push(`- ADM1 (il): ${iller.length}`)
  L.push(`- ADM2 kaydı: ${adm2}; tabloya giren: ${places.length}; çıkarılan: ${dropped.length}`)
  L.push('- Koordinat: GeoNames ADM2 noktası (ilçe merkezi yerine alanın temsil noktası olabilir; cihazda denenir).', '')
  L.push('### Ad düzeltmeleri', '')
  L.push('| GeoNames | Tabloda |', '|---|---|')
  for (const [a, b] of Object.entries(IL_FIX)) L.push(`| ${a} (il) | ${b} |`)
  for (const p of places.filter((x) => x.raw !== x.ilce && !/ İlçesi$/u.test(x.raw))) L.push(`| ${p.raw} (${p.il}) | ${p.ilce} |`)
  L.push(`| "… İlçesi" eki (${places.filter((x) => / İlçesi$/u.test(x.raw)).length} kayıt) | ek atıldı |`, '')
  L.push('### Tabloya girmeyenler', '')
  if (!dropped.length) L.push('Yok.')
  for (const d of dropped) L.push(`- ${d.raw} (${d.il}): ${d.why}`)
  L.push('', '### İl adıyla aynı adlı ilçeler (resmî listede çoğu "Merkez")', '')
  const same = places.filter((p) => p.ilce === p.il)
  L.push(same.length ? same.map((p) => p.il).join(', ') : 'Yok.', '')
  L.push('## Resmî listeyle karşılaştırma', '')
  if (!resmi) {
    L.push('Resmî liste verilmedi (`--resmi il;ilce.csv`). Karşılaştırma yapılmadı; fark (974 ↔ 973) incelenmedi.')
    return L.join('\n') + '\n'
  }
  const c = compare(places, resmi)
  L.push(`Resmî: ${resmi.length} · tablo: ${places.length}`, '')
  L.push('### Yalnız GeoNames tablosunda', '', ...(c.onlyG.length ? c.onlyG.map((p) => `- ${p.il} ${p.ilce}`) : ['Yok.']), '')
  L.push('### Yalnız resmî listede', '', ...(c.onlyR.length ? c.onlyR.map((p) => `- ${p.il} ${p.ilce}`) : ['Yok.']), '')
  L.push('### İl başına sayı farkı', '', '| İl | GeoNames | Resmî |', '|---|---|---|', ...c.perIl.map((x) => `| ${x.il} | ${x.geonames} | ${x.resmi} |`))
  return L.join('\n') + '\n'
}

export function dataModule({ iller, places }) {
  const head = '// ÜRETİLDİ: app/scripts/places.mjs — elle düzenlenmez. Kaynak: GeoNames (CC BY 4.0), TR ADM1 ve ADM2.\n' +
    '// Atıf Bilgi → Kaynaklar\'da: "İlçe listesi: GeoNames (CC BY 4.0)".\n'
  const il = iller.map((i) => `  { il: ${JSON.stringify(i.il)}, lat: ${i.lat}, lon: ${i.lon} },`).join('\n')
  const pl = places.map((p) => `  { il: ${JSON.stringify(p.il)}, ilce: ${JSON.stringify(p.ilce)}, lat: ${p.lat}, lon: ${p.lon} },`).join('\n')
  return `${head}export const PLACES_SOURCE = 'GeoNames (CC BY 4.0)'\n\nexport const ILLER = [\n${il}\n]\n\nexport const PLACES = [\n${pl}\n]\n`
}

function readTxt() {
  const given = arg('--txt')
  if (given) return readFileSync(given, 'utf8')
  const dir = mkdtempSync(join(tmpdir(), 'places-'))
  execFileSync('curl', ['-sSfL', '-o', join(dir, 'TR.zip'), URL], { stdio: 'inherit' })
  execFileSync('unzip', ['-o', '-q', join(dir, 'TR.zip'), '-d', dir], { stdio: 'inherit' })
  return readFileSync(join(dir, 'TR.txt'), 'utf8')
}

function readResmi() {
  const p = arg('--resmi')
  if (!p || !existsSync(p)) return null
  return readFileSync(p, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
    .map((l) => l.split(/[;,\t]/)).filter((x) => x.length >= 2).map(([il, ilce]) => ({ il: il.trim(), ilce: ilce.trim() }))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const t = parseGeonames(readTxt())
  writeFileSync(OUT, dataModule(t))
  const fark = arg('--fark') ?? DEFAULT_FARK
  writeFileSync(fark, farkReport(t, readResmi()))
  console.log(`il ${t.iller.length} · ilçe ${t.places.length} (ADM2 ${t.adm2}, çıkarılan ${t.dropped.length}) → ${OUT}; rapor → ${fark}`)
}
