import { useEffect, useId, useRef, useState } from 'react'
import {
  BookOpen, CreditCard, Camera, Bell, Download, Trash, ChevronRight, ShieldCheck,
  Volume2, VolumeX, Vibrate, VibrateOff, Smartphone, CircleCheck, CircleAlert, Crosshair,
} from 'lucide-react'
import { PageHeader, ThemeSwitch } from '../components/ui.jsx'
import { getPrefs, setPrefs, subscribePrefs } from '../lib/prefs.js'
import { haptic, initFeedback, testHaptic } from '../lib/native.js'
import '../styles/info.css'

// iOS Ayarlar tarzı anahtar. Satırın tamamı dokunulabilir; ekran okuyucu "anahtar, açık/kapalı" okur.
function PrefToggle({ Icon, IconOff, label, sub, checked, onChange }) {
  const id = useId()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-l`}
      aria-describedby={`${id}-s`}
      className="list-row pref-row pref-toggle"
      onClick={() => onChange(!checked)}
    >
      <span className={`pref-icon${checked ? ' on' : ''}`} aria-hidden="true">
        {checked ? <Icon size={18} /> : <IconOff size={18} />}
      </span>
      <span className="pref-text">
        <span id={`${id}-l`} className="pref-label">{label}</span>
        <span id={`${id}-s`} className="pref-sub">{sub}</span>
      </span>
      <span className="pref-switch" aria-hidden="true"><span className="pref-knob" /></span>
    </button>
  )
}

const TEST_MESSAGES = {
  okApp: 'Gönderildi. Hissetmediysen aşağıdaki iPhone ayarına bak.',
  okWeb: 'Gönderildi. Hissetmediysen cihazının titreşim ayarına bak.',
  noHardware: 'Bu cihazda titreşim donanımı yok.',
  unsupported: 'Bu tarayıcı titreşimi desteklemiyor.',
  failed: 'Titreşim gönderilemedi. Uygulamayı kapatıp yeniden açmayı dene.',
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

export default function Info({ onGo, onReset, exportJSON, distanceSkipped, iosApp = false, trueDepth = false, calibration = null }) {
  const [confirm, setConfirm] = useState(false)

  function download() {
    const url = URL.createObjectURL(new Blob([exportJSON()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'goz-olcum-veriler.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

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

      <section className="stack">
        <span className="eyebrow">Bilim</span>
        <div className="list">
          <Row Icon={BookOpen} label="Bu neye dayanıyor?" sub="Her özelliğin kaynağı, kanıt düzeyi ve sınırları" onClick={() => onGo('evidence')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Ölçüm ayarları</span>
        <div className="list">
          {!iosApp && <Row Icon={CreditCard} label="Ekran kalibrasyonu" sub="Kartla yeniden ölç" onClick={() => onGo('recalibrate')} />}
          <Row
            Icon={Camera}
            label={iosApp ? '40 cm mesafe' : distanceSkipped ? 'Mesafe takibini aç' : 'Mesafe kalibrasyonu'}
            sub={iosApp ? 'Face ID kamerasıyla canlı göster' : "40 cm'yi yeniden öğret"}
            onClick={() => onGo('recalibrate-distance')}
          />
          {trueDepth && <Row Icon={Crosshair} label="Göz takibi" sub="Kalibre et ve canlı dene" onClick={() => onGo('gaze-test')} />}
          <Row Icon={Bell} label="Çalışma günleri ve hatırlatma" onClick={() => onGo('schedule')} />
        </div>
      </section>

      <section className="stack">
        <span className="eyebrow">Verilerim</span>
        <div className="list">
          <Row Icon={Download} label="Verilerimi indir" sub="JSON dosyası — göz doktorunla paylaşabilirsin" onClick={download} />
          <Row Icon={Trash} label="Tüm verileri sil" danger onClick={() => setConfirm(true)} />
        </div>
        {confirm && (
          <div className="card tone-danger">
            <p className="small">
              {`Tüm ölçüm sonuçların, egzersiz ve oyun geçmişin, Yılan rekorun, ön tarama yanıtların, ${iosApp ? '' : 'ekran ve mesafe kalibrasyonun, '}hatırlatıcı ayarın bu cihazdan silinecek. Tema ile ses ve titreşim tercihlerin korunur. Geri alınamaz.`}
            </p>
            <div className="row">
              <button className="btn btn-danger btn-sm" onClick={onReset}>Evet, sil</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Vazgeç</button>
            </div>
          </div>
        )}
      </section>

      <p className="muted small" style={{ textAlign: 'center' }}>
        Sürüm {import.meta.env.VITE_APP_BUILD ? `1.0 (${import.meta.env.VITE_APP_BUILD})` : 'web'}
        {iosApp && calibration?.method === 'auto' && ` · ekran: ${calibration.deviceName}${calibration.estimated ? ' (tahmini)' : ''}`}
      </p>
      <p className="note">
        <ShieldCheck size={16} />
        Tıbbi bir karar vermeden önce göz doktoruna danış. Ani görme kaybı, perde inmesi, ışık çakmaları veya göz ağrısında vakit kaybetmeden başvur.
      </p>
    </>
  )
}
