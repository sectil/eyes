import { ExternalLink, X } from 'lucide-react'
import { sourceOf, designText, doiUrl } from '../lib/sources.js'

// Bilim kartı (PLAN.v1 §A.6, tasarim.html tpl-sci): bildirime dokununca açılan ekranın üstünde durur. Metin yalnız
// lib/sources.js alanlarından (finding, limit, design/n, duration, künye); yeni cümle yok. Başlık "Neden şimdi?" ve
// bağlantı "Kaynağı aç · …, yıl" onaylı tasarımdan (tpl-sci). finding yoksa bulgu satırı çıkmaz.
// VARSAYIM: kart sabit konumda ekranın üstünde; kapatınca bir daha açılmaz (yeni dokunuşa dek).
export const pubmedUrl = (pmid) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
// "Klasnja ve ark." biçimi (tasarım): ilk yazarın soyadı; tek yazarlıysa yalnız soyadı
export function shortAuthors(s) {
  const first = String(s?.authors?.[0] ?? '').split(' ')[0]
  return (s?.authors?.length ?? 0) > 1 ? `${first} ve ark.` : first
}

export default function ScienceCard({ evidence, onClose }) {
  const s = sourceOf(evidence)
  if (!s) return null
  const href = s.pmid ? pubmedUrl(s.pmid) : doiUrl(s.doi)
  const meta = [designText(s), s.duration].filter(Boolean).join(' · ')
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 0' }}>
      <section className="src-card" aria-labelledby="sci-card-h" data-evidence={evidence}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span id="sci-card-h" className="src-ey">Neden şimdi?</span>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>
        {s.finding && <p className="h">{s.finding}</p>}
        {s.limit && <p className="muted small">{s.limit}</p>}
        {meta && <p className="muted small">{meta}</p>}
        <a className="doi" href={href} target="_blank" rel="noreferrer">
          Kaynağı aç · {shortAuthors(s)}, {s.year} <ExternalLink size={12} aria-hidden="true" />
        </a>
        {s.pmid && s.doi && <a className="doi" href={doiUrl(s.doi)} target="_blank" rel="noreferrer">doi {s.doi} <ExternalLink size={12} aria-hidden="true" /></a>}
      </section>
    </div>
  )
}
