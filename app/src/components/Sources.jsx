import { ExternalLink } from 'lucide-react'
import { sourceOf, authorLine, designText, doiUrl } from '../lib/sources.js'

// Kaynak satırı: yazarlar (yıl). Özgün başlık — Türkçesi. Dergi cilt:sayfa. Çalışma türü · kişi. DOI bağlantısı.
export function Citation({ id }) {
  const s = sourceOf(id)
  if (!s) return null
  return (
    <div className="src-cite">
      <p className="who">{authorLine(s)} ({s.year})</p>
      <p className="title" lang="en">{s.title}</p>
      <p className="tr">{s.titleTr}</p>
      <p className="meta">{s.journal} {s.cite} · {designText(s)}</p>
      <a className="doi" href={doiUrl(s.doi)} target="_blank" rel="noreferrer">doi {s.doi} <ExternalLink size={12} aria-hidden="true" /></a>
    </div>
  )
}

// "Doğru mu, efsane mi?" kartı + kaynağı. f: { claim, answer, body, source }; answerText: { [answer]: metin }
export function FactCard({ f, answerText, eyebrow = 'Doğru mu, efsane mi?' }) {
  const tone = f.answer === 'fact' ? 'ok' : f.answer === 'myth' ? 'no' : 'op'
  return (
    <section className="src-card">
      <span className="src-ey">{eyebrow}</span>
      <p className="h">{f.claim}</p>
      <p><b className={tone}>{answerText[f.answer]}.</b> {f.body}</p>
      {f.source ? <Citation id={f.source} /> : <p className="src-none">Kaynak: bulunamadı (PubMed taraması)</p>}
    </section>
  )
}

// Modülün bütün kaynakları: açılır liste
export function SourceList({ ids = [], title = 'Kaynaklar' }) {
  if (!ids.length) return null
  return (
    <details className="src-list">
      <summary>{title} ({ids.length})</summary>
      {ids.map((id) => <Citation key={id} id={id} />)}
      <p className="src-note">Türkçe başlıklar bizim çevirimiz. Çalışma türü: meta-analiz ve randomize çalışmalar daha güçlü, gözlemsel çalışmalar ve olgu raporları daha zayıf kanıttır.</p>
    </details>
  )
}
