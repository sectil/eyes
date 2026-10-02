import { useEffect, useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { weeklyStatus } from '../lib/today.js'
import { isIOSApp } from '../lib/native.js'
import { dayKey } from '../lib/calendar.js'
import { nefCard, saidToday } from '../lib/nef/card.js'
import { loadSaid, recordSaid, markOutcome } from '../lib/nef/memory.js'
import '../styles/coach.css'

// Ana sayfa Nef kartı (Nef PLAN §4.2, §4.5; ANA_OTURUM_ISTEMI N1 madde 6). An motorundan beslenir (lib/nef/card.js:
// moments → speak, kanal 'card'); günlük model çağrısı yok (lib/coach.js getTodayInsight Ana sayfadan çağrılmaz; sunucu
// api/coach.js N2'deki mektup için durur). Veri telefondan çıkmaz, rıza gerekmez. Görünen her metin onaylı: bankadaki
// cümle, kart etiketi "Nef", düğme yazısı (onaylı kalıp; bank/tr.js actions), göz uyarısının sabit metni.
// Sahip kararı 2026-10-02 "Kart yalnız güçlü haberde": kart yalnız örüntüde (F2.C/F2.D) ve ilerlemede (metricChange);
// öteki anlarda ve düşük WHO-5 gününde kart yok (lib/nef/card.js CARD_TYPES). Göz uyarısı kartı olduğu gibi.
// Söylenen cümle söz hafızasına (gozolcum:nef-said) günde bir kez yazılır; aynı gün yeniden açılışta aynı cümle gelir
// (speak.js kartı gün içinde kararlı tutar).

// Öneri metnindeki eylem → uygulama ekranı (eski çevrimiçi kartın eşlemesi; Gelişim ve yoga testleri okur). Karar
// 2026-09-29: E testi haftada bir; eşleme yalnız savunma için haftalık teste gider.
const ACTIONS = [
  [/^haftalık test/i, 'weekly'],
  [/^günlük test/i, 'weekly'],
  [/^hafif set/i, 'routine-lite'],
  [/^normal set/i, 'routine-normal'],
  [/^kırpma/i, 'blink'],
  [/^okuma/i, 'reading'],
  [/^nefes/i, 'breath'],
  [/^çember/i, 'track'],
  [/^yılan/i, 'snake'],
  [/^yoga/i, 'yoga'], // Yoga kütüphanesi (modul.md §8); yalnız iPhone uygulamasında düğme olur (actionTarget)
]
export const screenFor = (action) => ACTIONS.find(([re]) => re.test(action ?? ''))?.[1] ?? null
// Düğmenin açacağı ekran: haftalık test yalnız zamanı gelince açılır (lib/today.js weeklyStatus; Bug 29). Yoga ilk
// yayında yalnız iPhone uygulamasında (PLAN.v3 §D.7).
export function actionTarget(action, tests = [], now = new Date(), ios = isIOSApp()) {
  const target = screenFor(action)
  if (target === 'weekly' && !weeklyStatus(tests, now).due) return null
  if (target === 'yoga' && !ios) return null
  return target
}

// Önce–sonra çizimi (M2; 5 saniye notu: sayı etiketleri halkanın üstünde, koyu temada iz belirgin). Sayılar cümlede de
// yazılı olduğu için çizim ekran okuyucudan gizli. İki uçta ölçeğin değerleri (örüntüde etkinin ölçeği, ilerlemede
// metriğin tanımlı uçları; lib/nef/card.js scaleOf); noktalar ölçeğe göre orantılı. Uçlar yoksa çizim yok.
function Scale({ scale, lang }) {
  const { min, max, before, after } = scale
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null
  const pos = (v) => `${Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))}%`
  let fmt = (v) => String(v)
  let fmtPair = fmt
  try {
    const nf = new Intl.NumberFormat(lang ?? undefined, { maximumFractionDigits: 1 })
    fmt = (v) => nf.format(v)
    // İki nokta etiketi aynı basamakla: biri ondalıklıysa öteki de ("6,0" ile "4,2"; tutarlılık)
    const dec = !Number.isInteger(before) || !Number.isInteger(after)
    const np = new Intl.NumberFormat(lang ?? undefined, { minimumFractionDigits: dec ? 1 : 0, maximumFractionDigits: 1 })
    fmtPair = (v) => np.format(v)
  } catch {
    // Intl yoksa düz sayı
  }
  const lo = Math.min(before, after)
  const hi = Math.max(before, after)
  return (
    <div className={`nef-scale ${after < before ? 'down' : 'up'}`} aria-hidden="true">
      <div className="nef-track" />
      <div className="nef-fill" style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})` }} />
      <span className="nef-lab b" style={{ left: pos(before) }}>{fmtPair(before)}</span>
      <span className="nef-lab a" style={{ left: pos(after) }}>{fmtPair(after)}</span>
      <span className="nef-dot b" style={{ left: pos(before) }} />
      <span className="nef-dot a" style={{ left: pos(after) }} />
      <div className="nef-ends"><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
    </div>
  )
}

// Son satırda tek kelime kalmasın (5 sn notu, 320 pt): son iki kelime bölünmez boşlukla bağlanır (aynı uzunluk; vurgu
// aralığı kaymaz). CSS'teki text-wrap: pretty her motorda tek kelimeyi önlemiyor (Chromium 5 satırlık cümlede bıraktı).
// Görünen metin değişmez.
// Sayı ile birimi de ayrılmaz ("1,8 puan", "6 harf"): sayı satır sonunda tek kalmasın.
export const glueLast = (t) => {
  if (typeof t !== 'string') return t
  const s = t.replace(/(\d) (?=\p{Ll})/gu, '$1\u00a0')
  const i = s.lastIndexOf(' ')
  return i > 0 ? `${s.slice(0, i)}\u00a0${s.slice(i + 1)}` : s
}

// Bağlanan son parça üç ve daha çok kelimeyse ("1,8 puan düştü."): satırlar dengelenir (coach.css .nef-say.bal). Yoksa
// açgözlü kırma öndeki kelimeyi tek başına satırda bırakabiliyor (390 pt: "ortalama"). İki kelimelik sonda pretty kalır.
export const longTail = (t) => typeof t === 'string' && t.slice(t.lastIndexOf(' ') + 1).split('\u00a0').length >= 3

// Göz uyarısı kartının etiketi: aşama 4 öncesindeki kartın etiketi (yeni metin değil)
const EYE_LABEL = 'Bugün · Nef'

function Badge({ label }) {
  if (!label) return null
  return (
    <span className="nef-badge">
      <i aria-hidden="true" />
      {label}
    </span>
  )
}

// Kartın düğmesi (örüntü kartı ve oyunun ilerleme kartı): sahip onaylı yazı (lib/nef/card.js action; bank/tr.js actions) +
// rota; dokununca modül açılır (Home'un onStart yolu). Yazı ya da rota yoksa düğme yok. Dokunma alanı 48 pt (coach.css).
// onTap: dokunuşun hafızaya yazılması (CoachCard)
export function NefAction({ action, onStart, onTap = null }) {
  if (!action?.label || !action.route || !onStart) return null
  // Süre parçası ("· 8 dk") satır sonunda bölünmez; görünen yazı aynı
  const i = action.label.lastIndexOf(' · ')
  const head = i > 0 ? action.label.slice(0, i + 1) : action.label
  const tail = i > 0 ? action.label.slice(i + 1) : null
  return (
    <button
      type="button"
      className="nef-go"
      onClick={() => {
        onTap?.()
        onStart(action.route)
      }}
    >
      {head}
      {tail && <span className="nef-go-dk">{tail}</span>}
    </button>
  )
}

// nef: App'in Nef girdisi (lib/nef/context.js) · alert: göz uyarısı ('red' | 'yellow' | null; Ana sayfanın görme
// serisi) · onStart: rota açar (Home; düğme için) · profile: kişinin profili (düğmenin süresi modülün bugünkü durağından)
export default function CoachCard({ nef = null, alert = null, onStart = null, profile = null, now: at = null }) {
  const now = at ?? new Date()
  const day = dayKey(now)
  const card = useMemo(
    () => nefCard({ input: nef, alert, rows: loadSaid({ now }), now, profile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nef, alert, day, profile],
  )
  // Gösterilen cümle günde bir kez hafızaya (göz uyarısı Nef'in sözü değil: yazılmaz; gösterilmeyen cümle seçilmez). Düğmeli kart
  // "yok sayıldı" diye yazılır, dokunulunca "dokunuldu"ya döner (memory.js kural 5: üç kez gösterilip dokunulmayan an
  // türü 14 gün dinlenir; restUntil yalnız sonucu olan satırları sayar). Düğmesiz kartın sonucu yok: sayaca girmez.
  useEffect(() => {
    if (!card?.say) return
    const t = at ?? new Date()
    const button = Boolean(card.action?.label && onStart)
    if (!saidToday(loadSaid({ now: t }), card.say, t)) recordSaid({ ...card.say, ...(button ? { outcome: 'ignored' } : {}) }, { now: t })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card])
  const touched = () => {
    if (!card?.say) return
    const t = at ?? new Date()
    markOutcome({ id: card.say.id, type: card.say.type, channel: 'card', date: dayKey(t) }, 'touched', { now: t })
  }
  if (!card) return null

  // Göz uyarısı: aşama 4 öncesindeki kartın görünümü aynen (sınıflar, etiket "Bugün · Nef", eylem kutusu). Yalnız
  // "çevrimdışı öneri" damgası yok (madde 6). Metin sabit, modelden bağımsız.
  if (card.kind === 'eye') {
    return (
      <section className="card coach-card" aria-live="polite">
        <div className="row between">
          <span className="coach-badge"><Sparkles size={15} aria-hidden="true" /> {EYE_LABEL}</span>
        </div>
        <p className="coach-insight">{card.text}</p>
        <p className="coach-action static">{card.action}</p>
      </section>
    )
  }
  const a = card.accent
  const said = glueLast(card.text)
  return (
    <section className="card nef-card" aria-live="polite">
      <Badge label={card.label} />
      <p className={longTail(said) ? 'nef-say bal' : 'nef-say'}>
        {a ? (
          <>
            {said.slice(0, a.start)}
            <em>{said.slice(a.start, a.end)}</em>
            {said.slice(a.end)}
          </>
        ) : (
          said
        )}
      </p>
      {card.scale && <Scale scale={card.scale} lang={nef?.lang} />}
      <NefAction action={card.action} onStart={onStart} onTap={touched} />
    </section>
  )
}
