import { Check, Play, Waves, Trophy, Sparkles } from 'lucide-react'
import { GLYPH } from '../TodayPath.jsx'
import { EGlyph } from '../howtoArt.jsx'
import { shownTitle } from './dayLead.js'
import HeroArt from './HeroArt.jsx'

// Ana sayfa · ilk görünümün tek eylemi ve günün cümlesi (ana sayfa 5 saniye yeniden tasarımı, Yön B + aşılar).
// Büyük düğmenin önceliği, rotası ve başlattığı mola kararı Home.jsx'te değişmeden kalır (lib/homeSuggest.js); burada
// yalnız görünüşü var.

// Durağın çizimi (yoldaki ve günün zincirindeki çizimin aynısı): ölçümde E, egzersizde hareket (↔, ↕, daire …), molada
// ay, öteki modülde modülün simgesi. Yön A'dan aşı: hareket okunmadan görülsün.
export function StopGlyph({ stop = null, kind = null, Icon = null, size = 24 }) {
  const svg = (children) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
  if (kind === 'dalga') return <Waves size={size} aria-hidden="true" />
  if (kind === 'breath' || stop?.restSlot) return svg(GLYPH.moon)
  if (stop?.kind === 'measure') {
    if (stop.glyph === 'lines') return svg(<path d="M6 8.5h12M6 12h12M6 15.5h8" />)
    // E testi: ortada E, dört yanında yön okları ("E hangi yöne bakıyor?"; 5 saniye kapı turu 1: daire içindeki tek "E"
    // anlaşılmadı)
    return svg(
      <>
        <g stroke="none"><EGlyph x={7.5} y={7.5} size={9} dir="right" fill="currentColor" /></g>
        <path d="M9.9 4.5L12 2.4l2.1 2.1M9.9 19.5l2.1 2.1 2.1-2.1M4.5 9.9L2.4 12l2.1 2.1M19.5 9.9l2.1 2.1-2.1 2.1" strokeWidth="1.7" />
      </>,
    )
  }
  // D9 tur 2: Isınma, Sağ–sol bakışın büyümüşü; aynı ↔ çizimi "aynı egzersizin yeni adı" gibi okundu → güneş. Bugünün
  // görevinin kıvılcımı "yükleniyor" gibi okundu → yıldız. Yalnız çizim; merdiven ve kayıt değişmez.
  if (stop?.glyph === 'arrows' && stop?.title === 'Isınma') return svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></>)
  if (stop?.glyph === 'spark') return svg(<path d="M12 3.2l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L12 16.4l-5.3 3 1.2-5.9-4.5-4.1 6-.7z" />)
  if (stop && GLYPH[stop.glyph]) return svg(GLYPH[stop.glyph])
  if (Icon) return <Icon size={size} aria-hidden="true" />
  return svg(<circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />)
}

// Günün tek cümlesi: büyük ve kalın (Yön A'dan aşı), "Bugün yeni"de adın önünde durağın çizimi. lead: dayLead adayı ya da
// { text, sub, ok }. Uzun cümle (1. gün) bir boy küçük. Güncelleme gününde (lead.list) cümlenin altında bugünün yeni
// durakları, yoldaki çizimleri ve adlarıyla ("Bugün yeni:" onaylı kalıbın başı; plan §3.F.4 öncelik 6).
const LIST_HEAD = 'Bugün yeni:'
export function HomeLead({ lead, icons = {} }) {
  if (!lead?.text) return null
  const long = lead.text.length > 48
  return (
    <div className={`hl${long ? ' long' : ''}`}>
      <p className="hl-t">
        {lead.stop ? (
          <>
            {lead.pre}
            <span className="nw">
              <span className="hl-chip" aria-hidden="true"><StopGlyph stop={lead.stop} Icon={icons[lead.stop.id]} size={18} /></span>
              {lead.name}
            </span>
            {lead.post}
          </>
        ) : (
          lead.text
        )}
      </p>
      {lead.list?.length > 0 && (
        <p className="hl-list">
          <span className="hl-list-h">{LIST_HEAD}</span>
          {lead.list.map((s) => (
            <span key={s.key} className="hl-item">
              <StopGlyph stop={s} Icon={icons[s.id]} size={16} />
              {shownTitle(s)}
            </span>
          ))}
        </p>
      )}
      {lead.sub && (
        <p className={`hl-s${lead.ok ? ' ok' : ''}${lead.mile ? ' mile' : ''}`}>
          {lead.ok && <Check size={15} strokeWidth={3} aria-hidden="true" />}
          {lead.mile && (lead.mileIcon === 'new' ? <Sparkles size={16} strokeWidth={2.4} aria-hidden="true" /> : <Trophy size={16} strokeWidth={2.4} aria-hidden="true" />)}
          {lead.sub}
        </p>
      )}
    </div>
  )
}

// Akşamın sakin görseli: koyu zeminde yavaş dalgalar (Yön A'dan aşı; durgun, hareket yok)
function WaveArt() {
  return (
    <svg className="hg-wave" viewBox="0 0 320 80" preserveAspectRatio="none" aria-hidden="true">
      <path className="w1" d="M0 44 C 40 20, 80 20, 120 42 S 200 66, 240 42 S 300 20, 320 34" />
      <path className="w2" d="M0 50 C 50 64, 90 64, 140 46 S 230 28, 270 48 S 310 58, 320 52" />
      <path className="w3" d="M0 38 C 60 50, 100 52, 160 40 S 250 30, 320 42" />
      <circle cx="46" cy="18" r="1.6" /><circle cx="132" cy="12" r="1.2" /><circle cx="214" cy="20" r="1.8" /><circle cx="286" cy="14" r="1.2" /><circle cx="96" cy="66" r="1.2" /><circle cx="252" cy="68" r="1.4" />
    </svg>
  )
}

// Durağın adı ve süresi: süre adın son sözcüğüyle birlikte kalır ("Sağ–sol" / "bakış · 1 dk"; 320 pt'de "· 1 dk" satır
// başında tek kalmasın), tireden bölünmez (görünmez sözcük birleştirici)
const WJ = '\u2060'
function TitleLine({ title = '', minutes = null }) {
  const words = String(title).split(' ')
  const last = words.pop()
  const head = words.length ? `${words.join(' ').replace(/–/g, `–${WJ}`)} ` : ''
  return (
    <b>
      {head}
      <span className="nw">
        {last.replace(/–/g, `–${WJ}`)}
        {minutes ? ` · ${minutes}` : ''}
      </span>
    </b>
  )
}

// Büyük düğme. Tek bir <button>: dokununca açılan şey ve sırası Home.jsx'te (startSuggest). "Başla" yazısı düğmenin
// içinde, görünür (değerlendirici 3 ve 4: "küçük oynat dairesine mi basacağım?"); sağ üstte durağın çizimi (1 ve 5).
// calm: yol bitti ya da serbest gün: Dalga sakin bir seçenek (degrade iş düğmesi değil), üstünde akşamın dalga görseli.
// hero: ilk 7 günün tek büyük kartı (Yön B "Tek büyük kart"; 5 saniye turu 6): üstte bugünün işinin kendi çizimi büyük
// (HeroArt; boyu Home.jsx'te ilk görünüme sığdırılır, --hero), altında aynı yazılar ve tek "Başla". Rota ve öncelik aynı.
// bare: günün cümlesi bugünün ilk durağının adını söylüyorken (sahibin isteği D9: "bugünün ilk işi ekranda bir kez adıyla
// geçsin") düğme adı tekrar etmez: solda durağın çizimi, ortada "Başla". Erişilebilir adı durağın adını taşır.
export default function HomeGo({ eyebrow = '', title, minutes = null, sub = null, tag = null, isNew = false, stop = null, kind = null, Icon = null, calm = false, hero = false, bare = false, onClick }) {
  if (bare && !calm) {
    return (
      <button type="button" className="hg bare" onClick={onClick} aria-label={`Başla: ${title}`}>
        <span className="hg-art" aria-hidden="true"><StopGlyph stop={stop} kind={kind} Icon={Icon} size={30} /></span>
        <span className="hg-go" aria-hidden="true"><Play className="play" size={20} fill="currentColor" aria-hidden="true" />Başla</span>
      </button>
    )
  }
  if (hero && !calm) {
    return (
      <button type="button" className="hg hero" onClick={onClick}>
        <span className="hg-stage" aria-hidden="true"><HeroArt stop={stop} kind={kind} Icon={Icon} /></span>
        <span className="t">
          {(eyebrow || isNew || tag) && (
            <small>
              {eyebrow}
              {isNew && <i className="hh-new">Yeni</i>}
              {tag && <i className="hg-tag">{tag}</i>}
            </small>
          )}
          <TitleLine title={title} minutes={minutes} />
          {sub && <span className="s">{sub}</span>}
        </span>
        <span className="hg-cta" aria-hidden="true"><Play className="play" size={18} fill="currentColor" aria-hidden="true" />Başla</span>
      </button>
    )
  }
  if (calm) {
    return (
      <button type="button" className="hg calm" onClick={onClick}>
        <span className="hg-art wave"><WaveArt /></span>
        <span className="t">
          <b>{title}</b>
          {sub && <span className="s">{sub}</span>}
        </span>
        <span className="hg-cta" aria-hidden="true"><Play size={16} fill="currentColor" aria-hidden="true" />Başla</span>
      </button>
    )
  }
  return (
    <button type="button" className="hg" onClick={onClick}>
      <span className="t">
        {(eyebrow || isNew || tag) && (
          <small>
            {eyebrow}
            {isNew && <i className="hh-new">Yeni</i>}
            {tag && <i className="hg-tag">{tag}</i>}
          </small>
        )}
        <TitleLine title={title} minutes={minutes} />
        {sub && <span className="s">{sub}</span>}
      </span>
      <span className="hg-art" aria-hidden="true"><StopGlyph stop={stop} kind={kind} Icon={Icon} size={26} /></span>
      {/* Kısa ekranda (≤ 740 pt yükseklik) çizim "Başla"nın üstünde, sağda tek sütun; uzun ekranda "Başla" alt şerit */}
      <span className="hg-cta" aria-hidden="true">
        <span className="gl"><StopGlyph stop={stop} kind={kind} Icon={Icon} size={22} /></span>
        <Play className="play" size={16} fill="currentColor" aria-hidden="true" />
        Başla
      </span>
    </button>
  )
}

