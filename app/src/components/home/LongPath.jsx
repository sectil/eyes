import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Sunucu çiziminde (testler) uyarısız: tarayıcıda useLayoutEffect
const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect
import { Check, Lock, Bell, ChevronRight, AlarmClock, Sparkles, Waves, Trophy, Medal, Play, CalendarDays } from 'lucide-react'
import { canOpen } from '../../lib/today.js'
import { fmtLeft } from '../../lib/eyeBudget.js'
import { haptic } from '../../lib/native.js'
import { chapterOf, chapterEnd, CHAPTER_DAYS } from '../../lib/pathAhead.js'
import { StopGlyph } from './HomeGo.jsx'
import { shownTitle, GO_WEEKLY, NEF, CHAPTER_PRIZE, stopMinutes } from './dayLead.js'
import { IrisMark } from '../ui.jsx'

// Ana sayfa · uzun yol (sahibin isteği 2026-10-01, D9: "Duolingo'daki gibi, uzun; yüzlerce aşama; aralarda nefes, yoga,
// Dalga; etiketler sade"). D9 v2, sahibin dört kararıyla:
//  1. Gelecek: YARIN ayrıntılı ama tek kart (başlık "Yarın · N. gün · D durak", alarm, yarının durakları yol sırasıyla küçük
//     haplar; hatırlatma kartı ardında); sonra Duolingo üniteleri gibi BÖLÜM KARTLARI, bugünün bölümünden başlayarak (7 günde
//     bir kart: başlık, ilk kez gelen duraklar çizimleriyle, onaylı ödül, bölümün gözü; bugünün bölümünde yedi günün sırası).
//     Kartlar tembel çizilir: önce 8, aşağı inildikçe 8'er (en çok 100).
//  2. Geçmiş Ana sayfada yok (sayfa selamdan başlar).
//  3. Nef yalnız onaylı 13 cümleyle (dayLead.js NEF): yolun başında 1–4, bugünün sonunda 5–7, yarında 8–10, kartlarda 11–13.
//  4. (Hava hapındaki Apple Weather işareti: SkyChip.jsx.)
// Bugünün durakları ritimli: sıradaki büyük ve halkalı, bitenler küçük ve tikli, kalanlar sakin (ilk kez gelen işaretli);
// aralarda Nefes, Yoga ve Dalga bantları. Bölüm sonu ve 30. gün hedefi yol bitmeden parçalı halkayla dolar, "tamam" yalnız
// yol bitince.
// D9 v2 tur 2 (değerlendiriciler): yarın ikinci bir uzun sütun değil (kart); bölüm kartları bölümün gözüyle ayrışır (sayı
// duvarı yok); 30. gün kupası gri kilit değil; eski kullanıcı içinde bulunduğu bölümü görür.
// D9 v2 tur 3 (sahibin kararı "Sadeleştir"): yarın kartında yalnız ilk 3 durak, alt alta ve okunur boyda, sonra "ve N durak
// daha" (onaylı cümle 16); alarm kuruluysa hatırlatma kartı yok; yalnız iki bölüm kartı (bugünün bölümü ve bir sonraki;
// sonsuz yığın ve tembel çizim kalktı); bugünün bölümünde "Yeni:" yarını tekrar etmez (yarından sonrası, en çok 3 hap);
// bölümün gözünde dış halka yok; 30. gün kupası ve bölüm sonu madalyası bugünün durağından büyük, tek ilerleme halkalı.

const AMP = 24 // durağın ortadan en çok uzaklığı (genişliğin yüzdesi)
const SNAKE = [0.55, 1, 0.55, -0.55, -1, -0.55]
// Durak boyu ve satır yüksekliği: sıradaki, kalan, biten
const SIZE = { now: 76, open: 54, done: 44 }
const ROW = { now: 116, open: 76, done: 52, bandToday: 80 }
const TOM_SHOWN = 3 // yarın kartında adıyla yazılan durak (sonrası "ve N durak daha")
const NEWS_SHOWN = 3 // bugünün bölüm kartında "Yeni:" hapı
const BAND_EXT = 26 // bant satırının iç boşluğu (7) + bandın kenar boşluğu (19): çizgi bandın içinde burada kaybolur
const isBand = (p) => Boolean(p && !p.run && !p.side && String(p.extra ?? '').split(' ').includes('band'))
const BAND_KIND = (s) => (s?.restSlot ? 'nefes' : s?.id === 'yoga' ? 'yoga' : null)
const NB = ' '
const hhdot = (d) => `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`

// Durağın yoldaki adı: haftalık E testi büyük düğmedeki adıyla ("E testi"; ilk görünüm ve yol aynı adı söyler)
export const pathTitle = (s) => (s?.id === 'weekly' ? GO_WEEKLY.title : shownTitle(s))

// Durağın kısa etiketi: süre; molada "Mola · N dk" (lib/progression.js pathRestMinutes); süresi ölçülmemiş haftalık testte
// "haftada bir", süresi kişiye bağlı oyunda kendi satırı ("1 tur"; lib/today.js unitOf ile aynı kural)
// Tur 6: süre başlıktaki toplamla aynı kaynaktan gelir (dayLead.js stopMinutes): oyunda "1 tur · 2 dk"; ölçüm durağı
// (haftalık E testi) süre yazmaz ve toplama girmez (sahibin kararı, S0 kararı 22): "haftada bir"
export function metaOf(s, restMin = null) {
  const m = stopMinutes(s, restMin)
  const dk = m > 0 ? `${m}${NB}dk` : null
  if (s.restSlot) return `Mola · ${m || 5}${NB}dk`
  if (s.id === 'yoga') return [s.sub, dk].filter(Boolean).join(' · ')
  if (s.id === 'weekly') return [GO_WEEKLY.tag, dk].filter(Boolean).join(' · ')
  if (s.openEnded) return [s.sub, dk].filter(Boolean).join(' · ') || null
  return dk
}

// Erişilebilir ad: "Nefes, yeni, mola, 3 dakika, sırada", "Göz kırpma, 1 dakika. Önce Nefes", "E testi, kilitli (mola 5:00)"
function ariaOf(s, { state, newOn, note, plan, restMin }) {
  const min = stopMinutes(s, restMin) || null
  const head = `${pathTitle(s)}${newOn ? ', yeni' : ''}${s.restSlot ? ', mola' : ''}`
  if (state === 'done') return `${head}, tamam`
  if (state === 'locked') return `${head}, kilitli (${note})`
  if (state === 'running') return `${head}, ${note}`
  const body = `${head}${min ? `, ${min} dakika` : ''}`
  if (plan?.next === s) return `${body}, sırada`
  return plan?.next ? `${body}. Önce ${pathTitle(plan.next)}` : body
}

const WAVE = (
  <svg className="lp-wave" viewBox="0 0 320 60" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 34 C 40 14, 80 14, 120 32 S 200 52, 240 32 S 300 14, 320 26" />
    <path className="b" d="M0 42 C 50 54, 90 54, 140 38 S 230 22, 270 40 S 310 48, 320 44" />
  </svg>
)
const DALGA = { title: 'Dalga', sub: 'sakinleş' }

// Bant (nefes, yoga, Dalga): yolun ortasında, tam genişlik
function Band({ band, s = null, tone, tap = null, state = null, newOn = false, note = null, aria = null, restMin = null, title: t0 = null, sub: s0 = null, play = false }) {
  const title = t0 ?? (s ? pathTitle(s) : DALGA.title)
  const sub = s0 ?? (s ? metaOf(s, restMin) : DALGA.sub)
  const icon = band === 'dalga' ? <Waves size={22} aria-hidden="true" /> : <StopGlyph stop={s} kind={band === 'nefes' && !s ? 'breath' : null} size={22} />
  const inner = (
    <>
      {WAVE}
      <span className="lp-bic" aria-hidden="true">{state === 'done' ? <Check size={20} strokeWidth={3} aria-hidden="true" /> : icon}</span>
      <span className="lp-btx">
        <b>{title}{newOn && <i className="hh-new">Yeni</i>}</b>
        {sub && <small>{sub}</small>}
        {note && <small className="lp-run">{note}</small>}
      </span>
      {play && <span className="lp-bgo" aria-hidden="true"><Play size={16} fill="currentColor" aria-hidden="true" /></span>}
    </>
  )
  const cls = `lp-band ${band} ${tone} ${state ?? ''}`
  return tap ? (
    <button type="button" className={cls} onClick={tap} aria-label={aria ?? `${title}, ${sub}`}>{inner}</button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

// Durak etiketi: durağın boş tarafında
function Label({ x, half, hide, size = null, children }) {
  const right = x > 50
  return (
    <span className={`lp-lb ${right ? 'l' : 'r'}${size ? ` ${size}` : ''}`} style={right ? { right: `calc(${100 - x}% + ${half + 8}px)` } : { left: `calc(${x}% + ${half + 8}px)` }} aria-hidden={hide ? 'true' : undefined}>
      {children}
    </span>
  )
}

// Bugünün durağı. state: now | open | done | locked | running. Boy duruma göre (sıradaki büyük, biten küçük).
function TodayNode({ r, tap, state, newOn, icons, note, aria }) {
  const s = r.s
  const big = r.size
  const gl = state === 'now' ? 32 : state === 'done' ? 18 : 24
  return (
    <>
      <button type="button" className={`lp-n today ${state}${newOn && state !== 'done' ? ' new' : ''}`} style={{ left: `${r.x}%`, width: big, height: big }} data-key={s.key} onClick={tap} aria-label={aria}>
        <span className={`lp-gl${state === 'done' ? ' ok' : ''}`} aria-hidden="true">
          {state === 'done' ? <Check size={gl} strokeWidth={3} aria-hidden="true" /> : <StopGlyph stop={s} Icon={icons[s.id]} size={gl} />}
        </span>
      </button>
      <Label x={r.x} half={big / 2} hide size={state}>
        <b>{pathTitle(s)}</b>
        {state !== 'done' && (
          <span className="lp-meta">
            {newOn && <i className="hh-new">Yeni</i>}
            {note ? <small>{note}</small> : metaOf(s) && <small>{metaOf(s)}</small>}
          </span>
        )}
      </Label>
    </>
  )
}

// Sayıyla "gün" aynı satırda kalsın ("Yarın 10." / "gün."; 390 pt akşam): bölünmez boşluk (metin aynı)
const keepDay = (t) => String(t).replace(/(\d+\.) (gün|bölüm)/g, '$1\u00a0$2')

// Nef kartı. mile: kilometre taşı günü yolun başında kupa (30. gün) ya da madalya (bölümün son günü)
function Nef({ text, end = false, mile = null }) {
  const icon = end ? <Check size={24} strokeWidth={3.2} aria-hidden="true" /> : mile === 'month' ? <Trophy size={19} strokeWidth={2.4} aria-hidden="true" /> : mile ? <Medal size={19} strokeWidth={2.4} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />
  return (
    <div className={`lp-nef${end ? ' end' : ''}${mile ? ' mile' : ''}`}>
      <span className="lp-nef-a" aria-hidden="true">{icon}</span>
      <span className="lp-nef-tx"><span className="lp-nef-b">Nef</span><p>{keepDay(text)}</p></span>
    </div>
  )
}

// ---- Bölümün gözü (D9 v2 tur 2) ----
// İlk görünümdeki gözün dili (components/home/dayRays.js: her gün bir ışın, 28 ışında göz dolar): bölümün 7 günü gözün
// çeyreği. Bölümün ışınları parlak, önceki günler sönük, sonrakiler silik. Tur 3: biten turların dış halkaları kalktı (40 pt
// gözde seçilmiyordu); tur kartın ve ışınların renginden okunur. Işınlar takvim gibi saat yönünde dizilir: her bölüm gözün bir sonraki çeyreğini yakar, dört bölümde göz
// dolar, sonra yeni tur yeni renkte. Bölüm kartları böylece birbirinin aynısı değildir ve renk değişiminin nedeni turdur
// (D9 v2 tur 1: "renkler nedensiz dönüyor", "6.–21. bölüm birbirinin aynı kartları"). Yazı yok: yalnız çizim.
const LAP_DAYS = 28
export const lapOf = (day) => Math.floor((Math.max(1, day) - 1) / LAP_DAYS)
const RAY = (i, r0, r1) => {
  const a = ((i + 0.5) / LAP_DAYS) * Math.PI * 2 - Math.PI / 2
  const c = Math.cos(a)
  const sn = Math.sin(a)
  return { x1: 32 + r0 * c, y1: 32 + r0 * sn, x2: 32 + r1 * c, y2: 32 + r1 * sn }
}
//   a, b: bölümün ilk ve son günü; n: bugün; done: bugünün yolu bitti; size: pt
export function ChapterEye({ a, b, n = 0, done = false, size = 60, month = false }) {
  const lap = lapOf(a)
  const base = lap * LAP_DAYS
  const rays = []
  for (let i = 0; i < LAP_DAYS; i++) {
    const d = base + i + 1
    const st = d < a ? 'lit' : d <= b ? (d < n || (d === n && done) ? 'got' : 'goal') : 'off'
    const g = RAY(i, 11.5, st === 'goal' || st === 'got' ? 27 : 24.5)
    rays.push(<line key={i} className={`r ${st}${d === n ? ' now' : ''}`} {...g} />)
  }
  return (
    <span className={`lp-eye${month ? ' m' : ''}`} data-l={lap % 4} style={{ width: month ? size + 34 : size, height: size }} aria-hidden="true">
      <svg viewBox="-3 -3 70 70" width={size} height={size}>
        <circle className="iris" cx="32" cy="32" r="25.5" />
        {rays}
        <circle className="pupil" cx="32" cy="32" r="9.5" />
        <circle className="glint" cx="29" cy="29" r="2.4" />
      </svg>
      {month && <span className="lp-eye-b"><Trophy size={12} strokeWidth={2.6} aria-hidden="true" /></span>}
    </span>
  )
}

// Günün hedefi (bölümün son günü ya da 30. gün): yol bitmeden "tamam" yok ama kilitli, gri bir düğme de değil (tur 1:
// "ceza gibi, devre dışı düğme"). Kupa (30. gün) ya da madalya (bölüm sonu) kendi renginde ve bugünün sıradaki durağından
// belirgin büyük (tur 3: "küçük ve solgun"); çevresinde tek ilerleme halkası (parçalı halka seçilmiyordu): biten durak
// oranı kadar dolu; yol bitince halka tam, ödül parlar ve tik alır. caption: altında "30. gün" / "14. gün".
const GM = { size: 132, r: 60, w: 9 }
// Tur 4: bölüm sonu madalyası ödüle göre: ödüllü bölümde (1. ve 4. bölüm, iris haritası) içinde ilk görünümdeki iris simgesi
// (ChapterStrip'in yedinci günü, IrisMark); ödülsüz bölümde sade madalya.
function GoalMedal({ month = false, a, total = 0, got = 0, done = false, caption = null, prize = null }) {
  const C = 2 * Math.PI * GM.r
  const part = done ? 1 : total > 0 ? Math.min(1, got / total) : 0
  const c = GM.size / 2
  return (
    <span className={`lp-gm${done ? ' done' : ''}${month ? ' month' : ''}${prize && !month ? ' iris' : ''}`} data-l={lapOf(a) % 4}>
      <span className="lp-gm-c" style={{ width: GM.size, height: GM.size }}>
        <svg className="lp-gm-ring" viewBox={`0 0 ${GM.size} ${GM.size}`} aria-hidden="true">
          <circle className="tr" cx={c} cy={c} r={GM.r} strokeWidth={GM.w} />
          {part > 0 && <circle className="on" cx={c} cy={c} r={GM.r} strokeWidth={GM.w} strokeDasharray={`${C * part} ${C}`} />}
        </svg>
        <span className="lp-gm-in" aria-hidden="true">
          {month ? <Trophy size={52} strokeWidth={2} aria-hidden="true" /> : prize ? <IrisMark size={78} /> : <Medal size={50} strokeWidth={2} aria-hidden="true" />}
        </span>
        {done && <span className="lp-gm-ok" aria-hidden="true"><Check size={18} strokeWidth={3.2} aria-hidden="true" /></span>}
      </span>
      {caption && <small>{caption}</small>}
    </span>
  )
}

// Yarın (cümle 8, 9, 16): tek kart. Başlık, alarm, yarının yalnız ilk 3 durağı yol sırasıyla alt alta (çizimi ve adı okunur
// boyda; tur 2'nin 10 gri hapı "duvar" gibi okundu, sıra yoktu), sonra "ve N durak daha". "Yeni" yalnız gerçekten ilk kez
// gelende.
// Tur 3b: yarının "Yeni"si her zaman görünür. İlk kez gelen durak ilk 3'ün dışında kalıyorsa sondan başlayarak yeni
// olmayanın yerine geçer; yol sırası bozulmaz (seçilenler yolun sırasıyla dizilir).
export function tomPick(stops = [], news = [], max = TOM_SHOWN) {
  const fresh = stops.filter((s) => news.includes(s)).slice(0, max)
  const keep = new Set(fresh)
  for (const s of stops) {
    if (keep.size >= Math.min(max, stops.length)) break
    keep.add(s)
  }
  return stops.filter((s) => keep.has(s))
}
// Tur 6: hatırlatma ayrı kart değil, yarın kartının son satırı (zil, cümle 10, ›); alt satırı ("Saatini ve günlerini sen
// seçersin.") kartta yer olmadığı için yok. remind: hatırlatma satırı (alarm kuruluysa verilmez)
// Tur 9 ("Yarın'ı bölüme kat"): ayrı kart değil, yarının bölüm kartının içinde gün şeridinin altında (inCard)
function TomCard({ n, stops = [], news = [], alarm = null, icons = {}, remind = false, onRemind, inCard = false }) {
  const shown = tomPick(stops, news)
  const rest = stops.length - shown.length
  return (
    <div className={`lp-tc${inCard ? ' in' : ''}`}>
      <div className="lp-tc-h">
        <span className="lp-tc-ic" aria-hidden="true"><CalendarDays size={22} aria-hidden="true" /></span>
        <b className="lp-tm-t">{keepDay(NEF.tomorrow(n, stops.length)).replace(/(\d+) durak/, '$1\u00a0durak')}</b>
      </div>
      {alarm && <span className="lp-al"><AlarmClock size={17} aria-hidden="true" /><b>{NEF.alarm(hhdot(alarm))}</b></span>}
      <ol className="lp-tps">
        {shown.map((s) => {
          const isNew = news.includes(s)
          const band = BAND_KIND(s)
          return (
            <li key={s.key} className={`lp-tp${isNew ? ' new' : ''}${band ? ` ${band}` : ''}`}>
              <span className="lp-tp-g" aria-hidden="true"><StopGlyph stop={s} Icon={icons[s.id]} size={20} /></span>
              <span className="lp-tp-t">{keepDash(newsName(s))}</span>
              {isNew && <i className="hh-new">Yeni</i>}
            </li>
          )
        })}
      </ol>
      {rest > 0 && <span className="lp-tc-more">{NEF.more(rest)}</span>}
      {remind && (
        <button type="button" className="lp-tc-rem" onClick={onRemind}>
          <span className="lp-tc-rem-ic" aria-hidden="true"><Bell size={18} aria-hidden="true" /></span>
          <b>{NEF.remind}</b>
          <ChevronRight size={18} aria-hidden="true" className="chev" />
        </button>
      )}
    </div>
  )
}

// Adın içindeki uzun çizgide satır kırılmasın ("Yakın–" / "uzak"; 320 pt): görünmez kelime birleştirici
const keepDash = (t) => String(t).replace(/–/g, '⁠–⁠')
const newsName = (s) => pathTitle(s)

// Bölüm kartı (cümle 11–13, 16). Yalnız iki kart (tur 3): bugünün bölümü ve bir sonraki. Bugünün bölümü: başlık, bölümün
// gözü, yarından sonraki günlerin ilk kez gelecek durakları (en çok 3 hap, sonra "ve N durak daha"; yarının durakları yarın
// kartında, burada tekrar yok), ödül, yedi günün sırası (geçen günler tikli, bugün halkalı ve "bugün", yarın açık halka, son
// gün bölümün gözü). Bir sonraki bölüm: başlık ve ödülü varsa ödül; gün sırası ve "Yeni:" yok. Tur 3b: göz başlık satırının
// sağında 40 pt (60 pt göz başlıkla "Yeni:" arasında boşluk açıyordu).
// Tur 5: kaydı olan geçmiş günler (eski kullanıcının yol öncesi günleri de) tikli (tur 4'ün "tiksiz" denemesi "kaçırmışım"
// diye okundu). Başlık dar kartta "·" atılarak iki temiz satır (CSS kapsayıcı sorgusu; metin aynı).
// "Yeni:" hapları sığdığı kadar: "ve N durak daha" tek başına bir satıra düşerse bir hap sayıya katılır.
const TIGHT_GAIN = 16 // dar başlıkta gözün (40 → 30: 10) ve aralığın (12 → 6: 6) verdiği yer
// strip: bugünün bölümünde gün şeridi (tur 7: ilk 7 günde ilk görünüm aynı şeridi gösterdiği için yok)
// narrowTwo (tur 8): ≤360 pt'de bütün bölüm başlıkları aynı biçimde (LongPath ölçer: hepsi sığıyorsa tek satır, yoksa hepsi iki)
// host (tur 9, tur 10): bugünün bölümü (bölüm sonu günü de): gün şeridi her zaman, bugün işaretli, yarın sıradaki nokta (bu
// bölümdeyse), yarının durakları şeridin altında (tom); "Yeni:" hap satırı yok (yarının durakları "Yeni"yi gösterir)
function ChapterCard({ c, a, b, news = [], prize = null, n, done = false, icons = {}, month = false, strip = true, narrowTwo = null, host = false, tom = null }) {
  const current = host || (n >= a && n <= b)
  const days = []
  if (current) for (let d = a; d <= b; d++) days.push({ d, st: d < n || (d === n && done) ? 'past' : d === n ? 'now' : d === n + 1 ? 'next' : 'future' })
  const [fit, setFit] = useState(NEWS_SHOWN)
  const newRef = useRef(null)
  const chips = current ? news.slice(0, fit) : []
  const rest = current ? news.length - chips.length : 0
  const [pass, setPass] = useState(0)
  // Her ölçüde (genişlik değişince, yazı tipleri yüklenince) en çok hapla yeniden başlanır, sığana dek bir hap eksiltilir
  useIsoLayout(() => {
    const box = newRef.current
    if (!box?.querySelector) return
    const more = box.querySelector('.lp-cc-more')
    const last = [...box.querySelectorAll('.lp-cc-chip')].at(-1)
    if (more && last && more.offsetTop > last.offsetTop + 4 && fit > 1) setFit(fit - 1)
  }, [fit, pass])
  useIsoLayout(() => {
    const box = newRef.current?.parentElement
    if (!box?.querySelector) return undefined
    const again = () => {
      setFit(NEWS_SHOWN)
      setPass((v) => v + 1)
    }
    let w = box.clientWidth
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      if (box.clientWidth !== w) {
        w = box.clientWidth
        again()
      }
    }) : null
    ro?.observe(box)
    let alive = true
    globalThis.document?.fonts?.ready?.then?.(() => alive && again())
    return () => {
      alive = false
      ro?.disconnect()
    }
  }, [news.length > 0])
  const [ct, cd] = NEF.chapter(c, a, b).split(' · ')
  // Başlık tek satıra sığmıyorsa "·" atılır, iki temiz satır: tek satırlık hâli görünmez bir ölçü kopyasında ölçülür
  // Tur 7: önce göz ve aralık daralır (40 → 30 pt, 12 → 6 pt; yazı boyu aynı); yine sığmazsa iki satır
  const [mode0, setMode] = useState('one')
  const mode = narrowTwo == null ? mode0 : narrowTwo ? 'two' : 'one'
  const two = mode === 'two'
  const tight = mode === 'tight'
  const [live, setLive] = useState(false) // ölçü kopyası yalnız tarayıcıda (sunucu çiziminde metin bir kez)
  const titleRef = useRef(null)
  useIsoLayout(() => setLive(true), [])
  useIsoLayout(() => {
    const t = titleRef.current
    if (!t?.querySelector || typeof ResizeObserver !== 'function') return undefined
    const check = () => {
      const m = t.querySelector('.lp-cc-tm')
      if (!m) return
      const isTight = t.classList.contains('tight')
      const need = m.scrollWidth - (t.clientWidth - (isTight ? TIGHT_GAIN : 0))
      if (need <= 1) setMode('one')
      else if (isTight) setMode(m.scrollWidth <= t.clientWidth + 1 ? 'tight' : 'two')
      // dar mod yalnız geniş ekranda (320'de başlık iki temiz satır kalır; kilitli görünümler değişmesin)
      else setMode(need <= TIGHT_GAIN && (globalThis.innerWidth ?? 999) > 360 ? 'tight' : 'two')
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(t)
    let alive = true
    globalThis.document?.fonts?.ready?.then?.(() => alive && check())
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [live])
  return (
    <div className={`lp-cc${current ? ' cur' : ' nx'}`} data-l={lapOf(a) % 4}>
      <b className={`lp-cc-t${two ? ' two' : ''}${tight ? ' tight' : ''}`} ref={titleRef}>
        <span>{keepDay(ct)}</span><span className="lp-cc-dot"> · </span><span>{keepDay(keepDash(cd))}</span>
        {live && <span className="lp-cc-tm" aria-hidden="true">{keepDay(keepDash(NEF.chapter(c, a, b)))}</span>}
      </b>
      <ChapterEye a={a} b={b} n={n} done={done} month={month} size={tight ? 30 : 40} />
      {chips.length > 0 && (
        <span className="lp-cc-new" ref={newRef}>
          <span className="lp-cc-nl">{NEF.news([]).trim()}</span>
          {chips.map((s) => (
            <span key={stopIdentityKey(s)} className="lp-cc-chip">
              <StopGlyph stop={s} Icon={icons[s.id]} size={15} />
              {keepDash(newsName(s))}
            </span>
          ))}
          {rest > 0 && <span className="lp-cc-more">{NEF.more(rest)}</span>}
        </span>
      )}
      {prize && <span className="lp-cc-pr"><IrisMark size={18} />{NEF.prize(prize)}</span>}
      {current && (strip || host) && (
        <ol className="lp-cc-d" aria-hidden="true">
          {days.map(({ d, st }) => (
            <li key={d} className={st}>
              <span className="lp-cc-o">{d === b ? <ChapterEye a={a} b={b} n={n} done={done} size={st === 'now' ? 26 : 28} /> : st === 'past' ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : d === 30 && month ? <Trophy size={14} strokeWidth={2.4} aria-hidden="true" /> : <span>{d}</span>}</span>
              {d === n && <small>bugün</small>}
            </li>
          ))}
        </ol>
      )}
      {tom && <div className="lp-cc-tom">{tom}</div>}
    </div>
  )
}
const stopIdentityKey = (s) => `${s.key}:${(s.stage?.steps ?? []).join(',')}:${s.stage?.lesson ?? ''}`

export default function LongPath({ plan, today = [], newKeys = [], icons = {}, eye = null, onStart, dalga = true, n = 1, ahead = [], firsts = null, nefTop = null, nefEnd = null, alarm = null, remind = false, onRemind, alt = null, chapter = false, restMin = null, prizes = CHAPTER_PRIZE }) {
  const [nudge, setNudge] = useState(null)
  const lpRef = useRef(null)
  const [narrowTwo, setNarrowTwo] = useState(null)
  useEffect(() => {
    if (!nudge) return undefined
    const id = setTimeout(() => setNudge(null), 2400)
    return () => clearTimeout(id)
  }, [nudge])

  // ---- Satırlar: { key, kind: 'node' | 'c', tone: 'today' | 'tom' | 'ahead', h?, x?, el } ----
  const rows = []
  let si = 0
  const snakeX = () => 50 + SNAKE[si++ % SNAKE.length] * AMP
  const center = (key, tone, el, extra = '') => rows.push({ key, kind: 'c', tone, el, extra })

  const pathRest = Boolean(eye?.locked && eye.reason === 'path')
  const allDone = today.length > 0 && today.every((s) => s.done)
  if (chapter) center('chp', 'today', <span className="lp-day-h now"><b>{chapterOf(n)}. bölüm</b><span>{n}. gün</span>{n === 30 && <Trophy size={17} strokeWidth={2.4} aria-hidden="true" className="lp-day-t" />}</span>, 'first')
  // Yolun başı: Nef (cümle 1–4)
  // Tur 6: ilk 7 günde yol Başla kartının altından gelir (çizgi Nef kartının arkasından geçer; "first" yok)
  if (nefTop) center('nef', 'today', <Nef text={nefTop} mile={n === 30 ? 'month' : chapterEnd(n) ? 'chapter' : null} />, 'wide')
  for (const s of today) {
    const band = BAND_KIND(s)
    const running = Boolean(s.restSlot && pathRest && !s.done)
    const state = s.done ? 'done' : running ? 'running' : s.locked ? 'locked' : plan?.next === s ? 'now' : 'open'
    const note = state === 'locked' ? `mola ${fmtLeft(s.lockLeftMs ?? 0)}` : state === 'running' ? `Mola · ${fmtLeft(eye?.leftMs ?? 0)}` : null
    const newOn = newKeys.includes(s.key) && !s.done
    const tap = () => {
      if (running || canOpen(plan, s)) return onStart?.(s.route)
      haptic('warning')
      setNudge(s.key)
    }
    const aria = ariaOf(s, { state, newOn, note, plan, restMin })
    const bubble = nudge === s.key && plan?.next ? <span className="lp-nudge" role="status"><Lock size={13} aria-hidden="true" />Önce: {pathTitle(plan.next)}</span> : null
    if (band) {
      rows.push({ key: s.key, kind: 'c', tone: 'today', h: ROW.bandToday, extra: 'band', el: <><Band band={band} s={s} tone="today" tap={tap} state={state} newOn={newOn} note={note} aria={aria} restMin={restMin} />{bubble}</> })
    } else {
      const sz = state === 'now' ? 'now' : state === 'done' ? 'done' : 'open'
      rows.push({ key: s.key, kind: 'node', tone: 'today', h: ROW[sz], size: SIZE[sz], x: snakeX(), el: (r) => <><TodayNode r={{ ...r, s }} tap={tap} state={state} newOn={newOn} icons={icons} note={note} aria={aria} />{bubble}</> })
    }
  }
  if (dalga) rows.push({ key: 'dalga', kind: 'c', tone: 'today', h: ROW.bandToday, extra: 'band', el: <Band band="dalga" tone="today" tap={() => onStart?.('dalga')} /> })
  // Sakin seçenek (5 dk nefes) yalnız yol bitmemişken: bitmiş günde tikli durakların ardında oynat düğmeli bant "yapılmamış
  // bir durak" gibi okundu (tur 1, akşam)
  if (alt && !allDone) rows.push({ key: 'alt', kind: 'c', tone: 'today', h: ROW.bandToday, extra: 'band', el: <Band band="nefes" tone="today" tap={alt.onTap} title={alt.title} sub={alt.sub} play aria={`${alt.title}, ${alt.sub}`} /> })
  // Bugünün sonu: hedef (bölüm sonu, 30. gün; yol bitmeden parçalı halka, "tamam" yok) ve Nef (cümle 5–7)
  if (chapterEnd(n) || n === 30) {
    const a = (chapterOf(n) - 1) * CHAPTER_DAYS + 1
    const all = plan?.stops ?? today
    center('prize', 'today', <GoalMedal month={n === 30} prize={prizes?.[chapterOf(n)] ?? null} a={a} total={all.length} got={all.filter((s) => s.done).length} done={allDone} caption={`${n}. gün`} />)
  }
  if (nefEnd) center('nefEnd', 'today', <Nef text={nefEnd} end={allDone} />, 'wide')

  // ---- Yarın (ayrıntılı, tek kart) ve hatırlatma ----
  const tom = ahead[0] ?? null
  // VARSAYIM (tur 3): alarm kuruluysa hatırlatma satırı yok; değerlendiriciler alarm varken hatırlatma sormayı gereksiz buldu.
  // Davranış değişikliği: önceki turlarda kart alarmdan bağımsız, yalnız hatırlatma açılmamışken çıkıyordu.
  const tomEl = tom ? <TomCard n={tom.n} stops={tom.stops} news={firsts?.get?.(tom.n) ?? []} alarm={alarm} icons={icons} remind={remind && !alarm} onRemind={onRemind} inCard /> : null

  // ---- Bölüm kartları (tur 9, sahibin onayı "Yarın'ı bölüme kat"; tur 10): bugünün yolundan sonra "bugün"ü taşıyan bölüm
  // HER ZAMAN (bölüm sonu günü de: şeritte bugün, "Sonunda:" satırı), içinde gün şeridi ve yarının durakları; sonra bir
  // sonraki bölüm (başlık, ödülü varsa ödül; şeritsiz önizleme). ----
  const c0 = chapterOf(n)
  for (const c of [c0, c0 + 1]) {
    const a = (c - 1) * CHAPTER_DAYS + 1
    const b = c * CHAPTER_DAYS
    const host = c === c0
    center(`cc${c}`, 'ahead', <ChapterCard c={c} a={a} b={b} news={[]} prize={prizes?.[c] ?? null} n={n} done={allDone} icons={icons} month={a <= 30 && b >= 30} strip={chapter} narrowTwo={narrowTwo} host={host} tom={host ? tomEl : null} />, `wide unit stop ${host ? 'l' : 'nx r'}`)
  }

  // Art arda durak satırları tek parça: çizgi ortadan girer, durakların ortasından geçer, ortadan çıkar
  // Tur 5 (sahibin ilk isteği "Duolingo'daki gibi uzun yol"): bugünün kıvrımlı yolu aynı dille aşağı sürer. Yarın kartı ve
  // bölüm kartları kıvrımın dirseklerinde sırayla sola ve sağa yerleşen duraklar; çizgi kartın altından geçer. Hatırlatma
  // kartı yolun dışında, yarın kartının hemen altında: çizgi onun yanından geçer. Çizgi tarayıcıda kartların yerinden çizilir.
  const parts = []
  for (const r of rows) {
    const last = parts.at(-1)
    if (r.kind === 'node' && last?.run && last.tone === r.tone) last.rows.push(r)
    else if (r.kind === 'node') parts.push({ run: true, tone: r.tone, rows: [r] })
    else if (r.tone !== 'today' && last?.side) last.rows.push(r)
    else if (r.tone !== 'today') parts.push({ side: true, key: `side-${r.key}`, rows: [r] })
    else parts.push(r)
  }
  // Tur 8: ≤360 pt'de bölüm başlıkları tek biçim: ölçü kopyalarının hepsi başlık genişliğine sığıyorsa tek satır, yoksa hepsi iki
  useIsoLayout(() => {
    const el = lpRef.current
    if (!el?.querySelectorAll || typeof ResizeObserver !== 'function') return undefined
    const check = () => {
      if (!((globalThis.innerWidth ?? 999) <= 360)) return setNarrowTwo(null)
      const ts = [...el.querySelectorAll('.lp-cc-t')]
      const ms = ts.map((t) => t.querySelector('.lp-cc-tm'))
      if (!ts.length || ms.some((m) => !m)) return undefined
      setNarrowTwo(!ts.every((t, i) => ms[i].scrollWidth <= t.clientWidth + 1))
      return undefined
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    let alive = true
    globalThis.document?.fonts?.ready?.then?.(() => alive && check())
    return () => {
      alive = false
      ro.disconnect()
    }
  })
  const sideRef = useRef(null)
  const [aheadLine, setAheadLine] = useState(null)
  useIsoLayout(() => {
    const el = sideRef.current
    if (!el?.querySelectorAll || !(el.clientWidth > 0)) return undefined
    const set = () => {
      const W = el.clientWidth
      const H = el.clientHeight
      const et = el.classList?.contains('after-band') ? BAND_EXT : 0
      const pts = [[W / 2, 0]]
      for (const row of [...(el.children ?? [])]) {
        const card = row.firstElementChild
        if (!card || !row.classList?.contains('lp-r')) continue
        const y = row.offsetTop + row.offsetHeight / 2
        if (row.classList.contains('rem')) pts.push([(card.offsetLeft + card.offsetWidth + W) / 2, y])
        else pts.push([card.offsetLeft + card.offsetWidth / 2, y])
      }
      let d = et ? `M${pts[0][0]} ${-et} L${pts[0][0]} 0` : `M${pts[0][0]} 0`
      for (let k = 1; k < pts.length; k++) {
        const [x0, y0] = pts[k - 1]
        const [x1, y1] = pts[k]
        const my = (y0 + y1) / 2
        d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`
      }
      setAheadLine((v) => (v?.d === d && v.W === W && v.H === H && v.et === et ? v : { d, W, H, et }))
    }
    set()
    if (typeof ResizeObserver !== 'function') return undefined
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  })
  return (
    <section className="lp" aria-label="Yol" ref={lpRef}>
      {parts.map((p, pi) => {
        if (p.run) {
          let y = 0
          const pts = [[50, 0]]
          for (const r of p.rows) {
            pts.push([r.x, y + r.h / 2])
            y += r.h
          }
          pts.push([50, y])
          // Tur 7: komşu bant varsa çizgi bandın kenarına kadar sürer ve orada kaybolur (kısa dik çubuk ya da kademe yok)
          const et = isBand(parts[pi - 1]) ? BAND_EXT : 0
          const eb = isBand(parts[pi + 1]) ? BAND_EXT : 0
          let d = et ? `M50 ${-et} L50 0` : `M50 0`
          for (let k = 1; k < pts.length; k++) {
            const [x0, y0] = pts[k - 1]
            const [x1, y1] = pts[k]
            const my = (y0 + y1) / 2
            d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`
          }
          if (eb) d += ` L50 ${y + eb}`
          const H = y + et + eb
          const gid = `lpg-${p.rows[0].key.replace(/[^a-z0-9]/gi, '')}`
          return (
            <div key={p.rows[0].key} className={`lp-run ${p.tone}`} style={{ height: y }}>
              <svg className="lp-line" viewBox={`0 ${-et} 100 ${H}`} preserveAspectRatio="none" aria-hidden="true" style={et || eb ? { top: -et, height: H } : undefined}>
                {(et || eb) ? (
                  <defs>
                    <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1={-et} x2="0" y2={y + eb}>
                      <stop offset="0" stopColor="currentColor" stopOpacity={et ? 0 : 1} />
                      <stop offset={et / H} stopColor="currentColor" stopOpacity="1" />
                      <stop offset={(et + y) / H} stopColor="currentColor" stopOpacity="1" />
                      <stop offset="1" stopColor="currentColor" stopOpacity={eb ? 0 : 1} />
                    </linearGradient>
                  </defs>
                ) : null}
                <path d={d} vectorEffect="non-scaling-stroke" style={et || eb ? { stroke: `url(#${gid})` } : undefined} />
              </svg>
              {p.rows.map((r) => (
                <div key={r.key} className={`lp-r node ${r.tone}`} style={{ height: r.h }}>{r.el(r)}</div>
              ))}
            </div>
          )
        }
        if (p.side) {
          return (
            <div key={p.key} className={`lp-side${isBand(parts[pi - 1]) ? ' after-band' : ''}`} ref={sideRef}>
              {aheadLine && (
                <svg className="lp-aline" width={aheadLine.W} height={aheadLine.H + aheadLine.et} viewBox={`0 ${-aheadLine.et} ${aheadLine.W} ${aheadLine.H + aheadLine.et}`} style={{ top: -aheadLine.et }} aria-hidden="true">
                  {aheadLine.et ? (
                    <defs>
                      <linearGradient id="lpg-ahead" gradientUnits="userSpaceOnUse" x1="0" y1={-aheadLine.et} x2="0" y2="0">
                        <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                        <stop offset="1" stopColor="currentColor" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                  ) : null}
                  {aheadLine.et ? <path d={`M${aheadLine.W / 2} ${-aheadLine.et} L${aheadLine.W / 2} 0`} style={{ stroke: 'url(#lpg-ahead)' }} /> : null}
                  <path d={aheadLine.d.replace(/^M[^ ]+ -?\d+ L/, 'M')} />
                </svg>
              )}
              {p.rows.map((r) => (
                <div key={r.key} className={`lp-r c ${r.tone} ${r.extra ?? ''}`}>{r.el}</div>
              ))}
            </div>
          )
        }
        return (
          <div key={p.key} className={`lp-r c ${p.tone} ${p.extra ?? ''}`} style={p.h ? { height: p.h } : undefined}>
            {p.el}
          </div>
        )
      })}
    </section>
  )
}
