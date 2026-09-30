import { useEffect, useRef, useState } from 'react'
import {
  BookOpen, CreditCard, Camera, Bell, CalendarDays, Download, Trash, ChevronRight, ShieldCheck,
  Volume2, VolumeX, Vibrate, VibrateOff, Smartphone, CircleCheck, CircleAlert, Crosshair, Sparkles, UserRound,
} from 'lucide-react'
import { PageHeader, ThemeSwitch } from '../components/ui.jsx'
import PrefToggle from '../components/PrefToggle.jsx'
import CoachConsent from '../components/CoachConsent.jsx'
import { getPrefs, setPrefs, subscribePrefs } from '../lib/prefs.js'
import { coachAllowed } from '../lib/consent.js'
import { haptic, initFeedback, testHaptic } from '../lib/native.js'
import WarningSigns from '../components/WarningSigns.jsx'
import { setupText } from '../lib/setupText.js'
import { buildInfo, versionLine } from '../lib/buildInfo.js'
import '../styles/info.css'

const SAFETY = setupText().safety

const TEST_MESSAGES = {
  okApp: 'Gönderildi. Hissetmediysen aşağıdaki iPhone ayarına bak.',
  okWeb: 'Gönderildi. Hissetmediysen cihazının titreşim ayarına bak.',
  noHardware: 'Bu cihazda titreşim donanımı yok.',
  unsupported: 'Bu tarayıcı titreşimi desteklemiyor.',
  failed: 'Titreşim gönderilemedi. Uygulamayı kapatıp yeniden açmayı dene.',
}

// Nef Göz Koçu aç/kapa (ana sayfa "Bugün" kartı). Kapatınca Nef'e hiçbir veri gitmez.
// Açmak açık rıza ister (CoachConsent: iki ayrı işaretsiz kutu; App rızayı settings.consents'e kaydeder);
// kapatmak tek dokunuş. Rıza paneli açıkken anahtara yeniden dokunmak paneli kapatır.
function CoachSettings({ consents = null, onCoach }) {
  const [prefs, setLocal] = useState(getPrefs)
  const [asking, setAsking] = useState(false)
  const panel = useRef(null)
  useEffect(() => subscribePrefs((p) => setLocal(p)), [])
  // Panel açılınca odak ilk kutuya (VoiceOver, anahtarın altında sessizce beliren paneli duyurmuyordu)
  useEffect(() => {
    if (asking) panel.current?.querySelector('input')?.focus()
  }, [asking])
  const allowed = coachAllowed(prefs, consents)
  return (
    <section className="stack">
      <span className="eyebrow">Nef Göz Koçu</span>
      <div className="list">
        <PrefToggle
          Icon={Sparkles}
          IconOff={Sparkles}
          label="Günlük öneri (yapay zekâ)"
          sub={allowed.on ? (allowed.life ? 'Açık · günlük özetler ve profil cevapların gider' : 'Açık · günlük özetler gider') : "Kapalı · Nef'e veri gitmez"}
          checked={allowed.on}
          onChange={(on) => (on ? setAsking((a) => !a) : (setAsking(false), onCoach?.({ on: false })))}
        />
      </div>
      {asking && !allowed.on && (
        <div ref={panel} role="region" aria-label="Nef için açık rıza">
          <CoachConsent
            idPrefix="cc-info"
            onAccept={({ life }) => { setAsking(false); onCoach?.({ on: true, life }) }}
            onCancel={() => setAsking(false)}
          />
        </div>
      )}
      <p className="note">
        <ShieldCheck size={16} aria-hidden="true" />
        Açıkken son 7 günün özetleri (görme ölçümü dahil) yurt dışındaki bir yapay zekâ modeline gider; profil cevapların
        yalnızca ayrıca izin verirsen. Kamera görüntüsü, ad ya da cihaz kimliği gitmez. Öneriler tıbbi tavsiye değildir.
      </p>
    </section>
  )
}

function FeedbackSettings({ iosApp }) {
  const [prefs, setLocal] = useState(getPrefs)
  const [test, setTest] = useState({ busy: false, result: null, buzz: 0 })
  const clearTimer = useRef(null)

  useEffect(() => {
    initFeedback() // uygulama açılışında zaten çağrıldıysa hiçbir şey yapmaz
    const off = subscribePrefs((next) => setLocal(next))
    return () => {
      off()
      clearTimeout(clearTimer.current)
    }
  }, [])

  function toggleHaptics(on) {
    setPrefs({ haptics: on })
    if (on) haptic('tick') // açıldığını elde hisset
    else setTest((t) => ({ ...t, result: null }))
  }

  async function runTest() {
    clearTimeout(clearTimer.current)
    setTest((t) => ({ ...t, busy: true, result: null }))
    let r
    try {
      r = await testHaptic('success')
    } catch {
      r = { ok: false, via: null, reason: 'failed' }
    }
    const key = r.ok ? (iosApp ? 'okApp' : 'okWeb') : r.reason === 'unsupported' ? (r.via ? 'noHardware' : 'unsupported') : 'failed'
    setTest((t) => ({ busy: false, result: key, buzz: r.ok ? t.buzz + 1 : t.buzz }))
    clearTimer.current = setTimeout(() => setTest((t) => ({ ...t, result: null })), 9000)
  }

  const bothOff = !prefs.sound && !prefs.haptics
  const ok = test.result === 'okApp' || test.result === 'okWeb'

  return (
    <section className="stack">
      <span className="eyebrow">Ses ve titreşim</span>
      <div className="list">
        <PrefToggle
          Icon={Volume2}
          IconOff={VolumeX}
          label="Sesler"
          sub={prefs.sound ? 'Sesli yönlendirme ve uyarı tonları' : bothOff ? 'Kapalı · yönlendirme yalnızca ekranda' : 'Kapalı · yönlendirme ekranda ve titreşimle'}
          checked={prefs.sound}
          onChange={(on) => {
            setPrefs({ sound: on })
            haptic('tick') // iOS anahtarları gibi hafif dokunuş (titreşim kapalıysa hiçbir şey)
          }}
        />
        <PrefToggle
          Icon={Vibrate}
          IconOff={VibrateOff}
          label="Titreşim"
          sub={prefs.haptics ? 'Dokunuş, doğru yanıt ve bitiş bildirimleri' : 'Kapalı · hiçbir titreşim verilmez'}
          checked={prefs.haptics}
          onChange={toggleHaptics}
        />
        <div className="list-row pref-row pref-static">
          <span
            key={test.buzz}
            className={`pref-icon${test.buzz ? ' buzz' : ''}${prefs.haptics ? ' on' : ''}`}
            aria-hidden="true"
          >
            <Smartphone size={18} />
          </span>
          <span className="pref-text">
            <span className="pref-label">Titreşimi dene</span>
            <span className="pref-sub" role="status" aria-live="polite">
              {!prefs.haptics ? (
                'Denemek için önce titreşimi aç'
              ) : test.result ? (
                <span className={`pref-result ${ok ? 'good' : 'bad'}`}>
                  {ok ? <CircleCheck size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}
                  {TEST_MESSAGES[test.result]}
                </span>
              ) : (
                'Kısa bir titreşim gönderir'
              )}
            </span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm pref-test-btn"
            onClick={runTest}
            data-no-tap
            disabled={!prefs.haptics || test.busy}
            aria-label="Titreşimi dene"
          >
            Dene
          </button>
        </div>
      </div>
      <p className="note">
        <Smartphone size={16} aria-hidden="true" />
        {iosApp
          ? "iPhone'da Ayarlar → Ses ve Dokunuş → Sistem Dokunuşları kapalıysa bazı titreşimler hissedilmeyebilir."
          : 'Tarayıcıda titreşim, tarayıcının ve cihazın desteğine bağlıdır.'}
      </p>
    </section>
  )
}

export default function Info({ onGo, onReset, onExport, distanceSkipped, iosApp = false, trueDepth = false, calibration = null, consents = null, onCoach }) {
  const build = buildInfo()
  const [confirm, setConfirm] = useState(false)

  const Row = ({ Icon, label, sub, onClick, danger }) => (
    <button className={`list-row ${danger ? 'danger' : ''}`} onClick={onClick}>
      <Icon size={20} aria-hidden="true" />
      <span className="grow stack" style={{ gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        {sub && <span className="muted small">{sub}</span>}
      </span>
      {!danger && <ChevronRight size={18} className="muted" />}
    </button>
  )

  return (
    <>
      <PageHeader title="Bilgi" />

      <section className="stack">
        <span className="eyebrow">Görünüm</span>
        <ThemeSwitch />
      </section>

      <FeedbackSettings iosApp={iosApp} />
      <CoachSettings consents={consents} onCoach={onCoach} />

      <section className="stack">
        <span className="eyebrow">Günlük düzen</span>
        <div className="list">
          {/* Hatırlatmalar yalnız iPhone uygulamasında gelir: web'de satır yok (izin 'unsupported'; ölçüm de yok) */}
          {iosApp && <Row Icon={Bell} label="Hatırlatmalar" sub="Mola, yürüyüş, nefes, su; saatlerini sen seç" onClick={() => onGo('reminders')} />}
          <Row Icon={CalendarDays} label="Çalışma günleri" sub="Haftanın hangi günleri, saat kaçta" onClick={() => onGo('schedule')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Bilim</span>
        <div className="list">
          <Row Icon={BookOpen} label="Bu neye dayanıyor?" sub="Her özelliğin kaynağı, kanıt düzeyi ve sınırları" onClick={() => onGo('evidence')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Ölçüm ayarları</span>
        <div className="list">
          <Row Icon={UserRound} label="Profilim" sub="Ad, doğum tarihi, avatar, gözlük ve profil soruları" onClick={() => onGo('profile')} />
          {!iosApp && <Row Icon={CreditCard} label="Ekran kalibrasyonu" sub="Kartla yeniden ölç" onClick={() => onGo('recalibrate')} />}
          <Row
            Icon={Camera}
            label={distanceSkipped ? 'Mesafe takibini aç' : iosApp ? '40 cm mesafe' : 'Mesafe kalibrasyonu'}
            sub={distanceSkipped ? 'Kapalı · testler 40 cm varsayar' : iosApp ? 'Face ID kamerasıyla canlı göster' : "40 cm'yi yeniden öğret"}
            onClick={() => onGo('recalibrate-distance')}
          />
          {trueDepth && <Row Icon={Crosshair} label="Göz takibi" sub="Kalibre et ve canlı dene" onClick={() => onGo('gaze-test')} />}
          <Row Icon={Sparkles} label="Yenilikler" sub={versionLine(build)} onClick={() => onGo('whatsnew')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Verilerim</span>
        <div className="list">
          <Row Icon={Download} label="Verilerimi indir" sub="JSON dosyası — göz doktorunla paylaşabilirsin" onClick={onExport} />
          <Row Icon={Trash} label="Tüm verileri sil" danger onClick={() => setConfirm(true)} />
        </div>
        {confirm && (
          <div className="card tone-danger">
            <p className="small">
              {`Tüm ölçüm sonuçların, egzersiz ve oyun geçmişin, Yılan rekorun, ön tarama yanıtların, ${iosApp ? '' : 'ekran ve mesafe kalibrasyonun, '}hatırlatma ayarların ve hatırlatma günlüğün bu cihazdan silinecek; kurulu hatırlatmalar iptal edilir. Tema ile ses ve titreşim tercihlerin korunur.${iosApp ? ' Aboneliğin bu silmeyle iptal olmaz; denemedeysen deneme bitiş uyarısı kalır.' : ''} Geri alınamaz.`}
            </p>
            <div className="row">
              <button className="btn btn-danger btn-sm" onClick={onReset}>Evet, sil</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Vazgeç</button>
            </div>
          </div>
        )}
      </section>

      <p className="muted small" style={{ textAlign: 'center' }}>
        Sürüm {build.version}{build.date ? ` · ${build.date}` : ''}{build.sha ? ` · ${build.sha}` : ''}
        {iosApp && calibration?.method === 'auto' && ` · ekran: ${calibration.deviceName}${calibration.estimated ? ' (tahmini)' : ''}`}
      </p>
      <section className="card info-warn" aria-labelledby="info-warn-h">
        <h3 id="info-warn-h"><ShieldCheck size={18} aria-hidden="true" /> {SAFETY.infoTitle}</h3>
        <p className="muted small">{SAFETY.infoSub}</p>
        <WarningSigns compact label={SAFETY.infoTitle} />
        <p className="muted small">Tıbbi bir karar vermeden önce göz doktoruna danış.</p>
      </section>
    </>
  )
}
