import { useState } from 'react'
import { FileText, FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { csvRows, toCsv, reportModel, reportHtml, reportFilename, csvFilename } from '../lib/exportData.js'
import { shareTextFile, sharePdf } from '../lib/native.js'

// Gelişim → dışa aktarma (onaylı taslak: "Doktoruma göster (PDF)" + "CSV indir").
// KVKK: dosya yalnız dokununca oluşur, paylaşım sayfasında senin seçtiğin yere gider; sunucuya gönderilmez.
export default function ExportCard({ tests = [], sessions = [], identity = null }) {
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState(null)
  const empty = !tests.length && !sessions.length
  const run = async (kind) => {
    if (busy) return
    setBusy(kind)
    setMsg(null)
    try {
      const now = new Date()
      const r =
        kind === 'pdf'
          ? await sharePdf(reportFilename(now), reportHtml(reportModel({ tests, sessions, identity, now })), `Nefona · ${now.toLocaleDateString('tr-TR')}`)
          : await shareTextFile(csvFilename(now), toCsv(csvRows({ tests, sessions })))
      if (r?.completed) setMsg({ tone: 'ok', text: kind === 'pdf' ? 'Rapor hazır.' : 'Veri dosyası hazır.' })
    } catch {
      setMsg({ tone: 'warn', text: 'Dosya hazırlanamadı. Bir daha dene.' })
    } finally {
      setBusy(null)
    }
  }
  return (
    <section className="card p2-card p2-export" aria-label="Dışa aktar">
      <span className="eyebrow">Dışa aktar</span>
      <div className="p2-export-row">
        <button type="button" className="btn btn-sm" disabled={empty || !!busy} onClick={() => run('pdf')}>
          {busy === 'pdf' ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />} Doktoruma göster (PDF)
        </button>
        <button type="button" className="btn btn-sm btn-secondary" disabled={empty || !!busy} onClick={() => run('csv')}>
          {busy === 'csv' ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : <FileSpreadsheet size={16} aria-hidden="true" />} CSV indir
        </button>
      </div>
      <p className="muted small">
        {empty ? 'İlk ölçümünden sonra açılır. ' : ''}PDF: göz testlerin, uyarı kuralı ve diğer ölçümlerin özeti. CSV: tüm ölçümler, tablo programında açılır. Dosya yalnız
        senin seçtiğin yere gider; Nefona sunucusuna gönderilmez.
      </p>
      {msg && <p className={`p2-export-msg ${msg.tone}`} role="status">{msg.text}</p>}
    </section>
  )
}
