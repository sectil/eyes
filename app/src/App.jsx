import { useEffect, useRef, useState } from 'react'
import { store } from './lib/storage.js'
import { TabBar } from './components/ui.jsx'
import RestLock from './components/RestLock.jsx'
import EyeBudgetPill from './components/EyeBudgetPill.jsx'
import { recordTime, eyeStatus, beginRest, resetBudget, flushBudget, EXHAUSTED_EVENT } from './lib/eyeBudgetStore.js'
import { LIMITS as EYE_LIMITS } from './lib/eyeBudget.js'
import { onRestNotifyTap, onTrialNotifyTap } from './lib/restNotify.js'
import FirstReport from './screens/FirstReport.jsx'
import { reportDay, REPORT_DAY } from './lib/progress.js'
import Home from './screens/Home.jsx'
import Onboarding from './screens/Onboarding.jsx'
import ProfileQuestions from './screens/ProfileQuestions.jsx'
import QuestionFlow from './components/QuestionFlow.jsx'
import { missing, GROUPS } from './lib/profileQuestions.js'
import ProfileHome from './screens/ProfileHome.jsx'
import IntroFilm from './components/IntroFilm.jsx'
import { shouldPlayIntro } from './lib/intro.js'
import { ageBandFromAge } from './lib/profile.js'
import { ageFromBirthDate } from './lib/identity.js'
import { screeningFromProfile, profileFromScreening, normalizeProfile } from './lib/profile.js'
import { resetAllHowto } from './lib/howto.js'
import CardCalibration, { calibrationStillValid } from './screens/CardCalibration.jsx'
import DistanceCalibration from './screens/DistanceCalibration.jsx'
import Progress from './screens/Progress.jsx'
import Calendar from './screens/Calendar.jsx'
import Schedule from './screens/Schedule.jsx'
import Evidence from './screens/Evidence.jsx'
import Info from './screens/Info.jsx'
import Paywall from './screens/Paywall.jsx'
import { getAccess, linkPurchaser, unlinkPurchaser } from './lib/subscription.js'
import AccountStart from './screens/AccountStart.jsx'
import WhatsNew from './components/WhatsNew.jsx'
import { RELEASES, unseenReleases, latestRelease } from './lib/releases.js'
import ProfileSetup from './screens/ProfileSetup.jsx'
import { signedIn, pullProfile, pushProfile, mergeProfile, signOut, deleteAccount, friendlyError } from './lib/account.js'
import DistanceHud from './screens/DistanceHud.jsx'
import { isIOSApp, getDeviceModel, getScreenInfo, trueDepthSupported, initFeedback, installTapHaptics, haptic, shareTextFile } from './lib/native.js'
import { fileStamp } from './lib/exportData.js'
import { resolveAutoCalibration, estimateCalibration } from './lib/screenScale.js'
import { registry } from './modules/registry.js'
import { viewFor } from './modules/views.js'
import IPHONE_SCREENS from './lib/iphoneScreens.json'
import GazeCalibration from './screens/GazeCalibration.jsx'
import GazeTest from './screens/GazeTest.jsx'
import { hasGazeModel } from './lib/gazeCalib.js'

const TAB_SCREENS = ['home', 'progress', 'calendar', 'info']

// --- Göz bütçesi ve zorunlu mola (lib/eyeBudget.js; plan MOLA_KILIDI_VE_YILAN_ANIMASYONU.md) ---
// Hangi ekranın göz bütçesine sayıldığı ve molada kilitlendiği modül manifestinden gelir
// (gates.eyeBudget: 'eye' | 'test'). Süre yalnızca ekran görünürken birikir (arka plan sayılmaz) ve
// kalıcıdır; mola bitiş zamanı uygulama kapanıp açılsa da korunur. Eski 10 dk'lık atlanabilir konfor
// molası (RestBreak) bu sistemin içine alındı: 20 sn'lik molaların etkisi gösterilemedi (Johnson 2022,
// DOI 10.1097/OPX.0000000000001971), 5 dk'lık molalar göz yorgunluğunu azalttı (Galinsky 2000).
const gatesOf = (s) => registry.forRoute(s)?.gates ?? {}
const budgetKindOf = (s) => gatesOf(s).eyeBudget ?? null
// Mola metninde cümle içinde geçer ("Devam: günlük test"): modülün label'ı.
const activityLabel = (s) => registry.labelFor(s)
// Ana sayfadaki mola bandından açılan kilit ekranı (hedefsiz)
const REST_ROUTE = 'eye-rest'

// Göz ekranında ve uygulama görünürken geçen süreyi saniyede bir bütçeye yazar.
function useEyeClock(kind) {
  useEffect(() => {
    if (!kind) return undefined
    let last = document.visibilityState === 'hidden' ? null : Date.now()
    const tick = () => {
      const now = Date.now()
      if (last != null) recordTime(kind, last, now)
      last = document.visibilityState === 'hidden' ? null : now
    }
    const id = setInterval(tick, 1000)
    const onVis = () => {
      tick()
      if (document.visibilityState === 'hidden') flushBudget()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      tick()
      flushBudget()
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [kind])
}

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

export default function App() {
  const [data, setData] = useState(store.get())
  const [screen, setScreen] = useState('home')
  const [lastTab, setLastTab] = useState('home')
  // Zorunlu mola ekranı: { to: mola bitince devam edilecek ekran | null } | null
  const [lockFor, setLockFor] = useState(null)
  // Göz bütçesi durumu (gösterge, Ana sayfa bandı); göz ekranında ya da kilitliyken saniyede bir
  const [budget, setBudget] = useState(() => eyeStatus())
  // Göz kalibrasyonu bekleyen hedef (TrueDepth'te göz kontrollü ekrandan önce, bir kez): { to } | null
  const [gazeFor, setGazeFor] = useState(null)
  const gazeSkipped = useRef(false) // "Şimdi değil" → bu oturumda tekrar sorma
  // Yerinde profil sorusu (lib/profileQuestions.js; modül manifest ask.before / ask.after): { ids, then, back } | null
  const [askFor, setAskFor] = useState(null)
  const entryTests = useRef(0) // ekrana girerken test sayısı (ask.after: bu ekranda yeni test kaydedildi mi)
  const budgetKind = lockFor ? null : budgetKindOf(screen)
  useEyeClock(budgetKind)
  const refresh = () => setData(store.get())
  const profileNow = () => {
    const st = store.get().settings
    return normalizeProfile(st.profile ?? profileFromScreening(st.screening))
  }
  const go = (s, { noAsk = false } = {}) => {
    // Test bitti, ekrandan çıkılıyor: modülün "sonra sor" sorusu (ör. okuma sonrası yakın zorluk) bir kez
    const after = registry.forRoute(screen)?.ask?.after
    if (!noAsk && after && s !== screen && store.get().tests.length > entryTests.current) {
      const ids = missing(profileNow(), after)
      if (ids.length) {
        setAskFor({ ids, then: s, back: s })
        window.scrollTo(0, 0)
        return
      }
    }
    const needsGaze = Boolean(gatesOf(s).gaze)
    if (needsGaze && native.trueDepth && !gazeSkipped.current && !hasGazeModel()) {
      setGazeFor({ to: s })
      window.scrollTo(0, 0)
      return
    }
    setGazeFor(null)
    if (s === REST_ROUTE) {
      setLockFor({ to: null })
      window.scrollTo(0, 0)
      return
    }
    // Göz bütçesi: kilitliyse ya da bütçe dolduysa hedef yerine mola ekranı
    if (budgetKindOf(s)) {
      const st = eyeStatus()
      if (st.locked || st.due) {
        if (!st.locked) beginRest(st.due)
        setLockFor({ to: s })
        setBudget(eyeStatus())
        window.scrollTo(0, 0)
        return
      }
    }
    // Modülün "önce sor" sorusu (ör. Hızlı Bakış'tan önce epilepsi); kapatılırsa hedefe gidilmez
    const before = registry.forRoute(s)?.ask?.before
    if (!noAsk && before) {
      const ids = missing(profileNow(), before)
      if (ids.length) {
        setLockFor(null)
        setAskFor({ ids, then: s, back: lastTab })
        window.scrollTo(0, 0)
        return
      }
    }
    setAskFor(null)
    setLockFor(null)
    if (TAB_SCREENS.includes(s)) setLastTab(s)
    entryTests.current = store.get().tests.length
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const back = () => go(lastTab)

  // Göz ekranında: 1 dk kala uyarı; bütçe dolunca oyun/egzersizde tur bitirme payı, sonra kilit.
  // Testler kesilmez (kilit bir sonraki geçişte). Kilitliyken ve Ana sayfada gösterge/geri sayım.
  const warned = useRef(false)
  const dueSince = useRef(null)
  useEffect(() => {
    const watch = Boolean(budgetKind) || screen === 'home'
    if (!watch) return undefined
    warned.current = false
    dueSince.current = null
    const id = setInterval(() => {
      const st = eyeStatus()
      setBudget(st)
      if (!budgetKind) return
      if (st.warn && !warned.current) {
        warned.current = true
        haptic('tick')
      }
      if (st.due && budgetKind === 'eye') {
        const now = Date.now()
        if (dueSince.current == null) {
          dueSince.current = now
          haptic('warning')
        } else if (now - dueSince.current >= EYE_LIMITS.graceMs) {
          beginRest(st.due)
          setLockFor({ to: screen })
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [budgetKind, screen])
  // Ekran içinden yeni tur istenip bütçe doluysa (Yılan "Tekrar oyna" vb.) mola ekranı açılır
  const screenRef = useRef(screen)
  screenRef.current = screen
  useEffect(() => {
    const on = (e) => {
      const st = e.detail ?? eyeStatus()
      if (!st.locked && st.due) beginRest(st.due)
      setLockFor({ to: screenRef.current })
      setBudget(eyeStatus())
    }
    window.addEventListener(EXHAUSTED_EVENT, on)
    return () => window.removeEventListener(EXHAUSTED_EVENT, on)
  }, [])
  // "Mola bitti" bildirimine dokununca Ana sayfa (uygulama kapalıyken açılış dahil)
  useEffect(() => {
    let off = () => {}
    let offTrial = () => {}
    onRestNotifyTap(() => {
      setLockFor(null)
      setScreen('home')
      setBudget(eyeStatus())
    }).then((f) => (off = f))
    // Deneme hatırlatması (5. gün) → İlk rapor
    onTrialNotifyTap(() => setScreen('first-report')).then((f) => (offTrial = f))
    return () => { off(); offTrial() }
  }, [])

  // iPhone ses modu (sessiz tuşunda da ses) + ses tercihi değişikliklerini izle. Web'de etkisiz.
  useEffect(() => initFeedback(), [])
  // Her düğmede hafif titreşim (ayarlardan titreşim kapalıysa hiçbir şey)
  useEffect(() => installTapHaptics(), [])

  // Abonelik durumu (yalnızca iOS uygulamasında kilit; web'de açık)
  const [access, setAccess] = useState({ loading: true, premium: false })
  useEffect(() => {
    const check = () =>
      getAccess()
        .then((a) => setAccess({ loading: false, ...a }))
        .catch(() => setAccess({ loading: false, premium: false, native: true, error: true }))
    check()
    // Uygulama öne gelince yeniden kontrol (deneme/abonelik bitmiş olabilir)
    const onVis = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // iPhone uygulaması: ekran ölçüsü modelden otomatik, mesafe TrueDepth ile (kalibrasyonsuz)
  const [native, setNative] = useState({ checked: !isIOSApp(), trueDepth: false, autoScreen: false })
  useEffect(() => {
    if (!isIOSApp()) return
    ;(async () => {
      let trueDepth = false
      let auto = null
      try {
        trueDepth = await trueDepthSupported()
      } catch {
        trueDepth = false
      }
      let reason = null
      try {
        let model = null
        let screenInfo = null
        try {
          model = await getDeviceModel()
        } catch {
          model = null
        }
        try {
          screenInfo = await getScreenInfo()
        } catch {
          screenInfo = null
        }
        const r = resolveAutoCalibration(model, screenInfo, IPHONE_SCREENS)
        auto = r.cal
        reason = r.reason
        if (!auto) {
          // iPhone'da elle ayar yok: ekran ölçeğinden tahmin (eklenti yanıt vermezse devicePixelRatio)
          const est = estimateCalibration(screenInfo?.nativeScale ?? window.devicePixelRatio)
          if (est) auto = { ...est, model, name: model || 'iPhone' }
        }
        const current = store.get().settings.calibration
        // iPhone'da otomatik ölçü (üretici ekran verisi) elle yapılan ayardan daha doğrudur;
        // varsa her açılışta onu kullan (eski elle ayarın yerine geçer).
        if (auto && !(current?.method === 'auto' && calibrationStillValid(current) && current.pxPerMm === auto.pxPerMm)) {
          store.setSetting('calibration', {
            pxPerMm: auto.pxPerMm,
            method: 'auto',
            estimated: Boolean(auto.estimated),
            reason,
            model: auto.model,
            deviceName: auto.name,
            dpr: window.devicePixelRatio,
            screenW: window.screen.width,
            screenH: window.screen.height,
            date: new Date().toISOString(),
          })
        }
      } catch {
        auto = null
      }
      setNative({ checked: true, trueDepth, autoScreen: Boolean(auto), autoReason: reason })
      refresh()
    })()
  }, [])

  const { settings, tests, sessions } = data
  // iPhone'da TrueDepth varsa mesafe her zaman sensörden gelir (eski kamera kalibrasyonu yok sayılır).
  const distanceCal = native.trueDepth
    ? { method: 'truedepth' }
    : settings.distance?.irisPxAt40 || settings.distance?.method === 'truedepth' ? settings.distance : null
  const setupTotal = native.autoScreen ? 2 : 3

  if (!native.checked) {
    return <main className="screen"><p className="muted">Hazırlanıyor…</p></main>
  }

  // --- Kurulum akışı (web: 3 adım; iPhone otomatik ekranla: 2 adım) ---
  // Profil anketi (lib/profile.js): kurulumun 1. adımı. Eski kayıtlarda (yalnızca screening) Bugün'de
  // "Profilini tamamla" kartı çıkar; Bilgi → Profilim'den düzenlenir.
  const saveProfile = (p) => {
    store.setSetting('profile', p)
    store.setSetting('screening', screeningFromProfile(p))
    refresh()
  }
  // Giriş filmi (components/IntroFilm.jsx): ilk açılışta bir kez, profil sorularından önce; Profilim'den yeniden izlenir.
  // İlk kurulumda sürüm notu gösterilmez (her şey zaten yeni): en son sürüm görülmüş sayılır
  const markIntro = () => { store.setSetting('intro', { seen: true, date: new Date().toISOString() }); if (!settings.releaseSeen) store.setSetting('releaseSeen', latestRelease()?.id ?? null); refresh() }
  if (screen === 'intro') return <IntroFilm replay onDone={() => go(lastTab)} />
  if (shouldPlayIntro(settings, prefersReducedMotion())) return <IntroFilm onDone={markIntro} />

  // --- Hesap → Seni tanıyalım → 7 gün ücretsiz (Build 23b; Artifact "Hesap ve Profil Taslağı") ---
  // Hesap açıldıysa ad, doğum tarihi, şehir, gözlük Supabase'e eşitlenir (lib/account.js); ağ yoksa telefonda kalır.
  const nowIso = () => new Date().toISOString()
  const currentCorrection = () => { const st = store.get().settings; return st.profile?.correction ?? st.setupCorrection ?? null }
  const syncUp = (id, corr) => {
    const a = store.get().settings.account
    if (signedIn(a)) pushProfile(a.userId, id, corr).catch(() => {})
  }
  // Tüm kayıt (JSON). iPhone'da <a download> WKWebView'da güvenilir değil (doğrulanmadı) → paylaşım sayfası
  // (ExportPlugin.swift); web'de indirme. Oturum anahtarları ayrı kayıtta (supabase.js storageKey), dosyaya girmez.
  const exportData = () => {
    shareTextFile(`nefona-tum-veriler-${fileStamp()}.json`, store.exportJSON(), 'application/json').catch(() => {})
  }
  const finishAccount = async (acc, extra = {}) => {
    store.setSetting('account', acc)
    if (signedIn(acc)) {
      linkPurchaser(acc.userId)
      try {
        const cur = store.get().settings
        const local = { ...cur.identity, name: cur.identity?.name || extra.givenName || '' }
        const m = mergeProfile(await pullProfile(acc.userId), local, currentCorrection())
        store.setSetting('identity', m.identity)
        if (m.correction) store.setSetting('setupCorrection', m.correction)
        if (cur.identitySetup) syncUp(m.identity, m.correction)
      } catch {
        // ağ yok ya da tablo kurulmamış: bilgiler telefonda kalır, sonraki kayıtta eşitlenir
      }
    }
    refresh()
    if (screen === 'account') go('profile')
  }
  if (screen === 'account') return <AccountStart onDone={finishAccount} onCancel={() => go('profile')} />
  if (!settings.account) return <AccountStart onDone={finishAccount} />
  if (!settings.identitySetup) {
    const done = (id, corr) => {
      store.setSetting('identity', id)
      store.setSetting('setupCorrection', corr)
      store.setSetting('identitySetup', { date: nowIso() })
      const p = settings.profile
      const band = ageBandFromAge(ageFromBirthDate(id.birthDate))
      if (p && ((band && p.ageBand !== band) || (corr && p.correction !== corr))) saveProfile({ ...p, ageBand: band ?? p.ageBand, correction: corr ?? p.correction })
      else refresh()
      syncUp(id, corr)
    }
    return <ProfileSetup identity={settings.identity} correction={currentCorrection()} account={settings.account} onSave={done} />
  }
  // Deneme teklifi bir kez, profilden hemen sonra. Web'de ödeme yok (atlanır); test derlemesinde "geç" ile görülebilir.
  if (!settings.trialOffer && !access.loading && access.native && (!access.premium || access.testUnlock) && screen !== 'evidence') {
    return (
      <Paywall
        trial
        onUnlocked={() => { store.setSetting('trialOffer', { date: nowIso(), started: true }); setAccess({ loading: false, premium: true, native: true }); refresh() }}
        onSkip={access.testUnlock ? () => { store.setSetting('trialOffer', { date: nowIso(), skipped: true }); refresh() } : null}
        onSafety={() => go('evidence')}
        onExport={exportData}
      />
    )
  }
  if (!settings.screening || settings.screening.referred) {
    // İlk açılış: 20 sn farkındalık anı, yaş, uyarı işaretleri (Artifact "Önce Fark Ettir"). İşaret varsa kilitli kalır.
    // Profil kurulumundaki doğum tarihi ve gözlük, anketin yaş ve gözlük sorularını önceden doldurur
    const setupAge = ageBandFromAge(ageFromBirthDate(settings.identity?.birthDate))
    const initial = settings.profile ?? { ...profileFromScreening(settings.screening), ...(setupAge ? { ageBand: setupAge } : {}), ...(settings.setupCorrection ? { correction: settings.setupCorrection } : {}) }
    return <Onboarding initial={initial} trueDepth={native.trueDepth} onDone={saveProfile} />
  }
  if (screen === 'whatsnew') return <WhatsNew releases={RELEASES} title="Yenilikler" back onClose={() => go('info')} />
  // Güncellemeden sonra ilk açılışta bir kez: görülmemiş sürüm notları
  const unseen = unseenReleases(settings.releaseSeen)
  if (unseen.length && screen !== 'evidence') {
    return <WhatsNew releases={unseen} onClose={() => { store.setSetting('releaseSeen', latestRelease().id); refresh() }} />
  }
  // 5. gün "İlk rapor" (Gelişim 2.0): deneme/kurulum başlangıcından 5–14. gün arası bir kez kendiliğinden; her zaman açılabilir
  const reportStart = settings.trialOffer?.date ?? settings.identitySetup?.date ?? null
  const rDay = reportDay(reportStart)
  const closeReport = (to) => { store.setSetting('firstReportSeen', { date: new Date().toISOString() }); refresh(); go(to) }
  if (screen === 'first-report' || (!settings.firstReportSeen && rDay >= REPORT_DAY && rDay <= 14 && screen === 'home')) {
    return <FirstReport tests={tests} sessions={sessions} start={reportStart} onClose={() => closeReport('home')} onProgress={() => closeReport('progress')} />
  }
  if (screen === 'profile') {
    // Profilim (screens/ProfileHome.jsx): ad, doğum tarihi, avatar cihazda kalır; doğum tarihi anketin yaş aralığını doldurur.
    const saveIdentity = (id, correction) => {
      store.setSetting('identity', id)
      const age = ageFromBirthDate(id.birthDate)
      const band = ageBandFromAge(age)
      const p = settings.profile ?? profileFromScreening(settings.screening)
      if (p && ((band && p.ageBand !== band) || (correction && p.correction !== correction))) {
        saveProfile({ ...p, ageBand: band ?? p.ageBand, correction: correction ?? p.correction })
      } else refresh()
      syncUp(id, correction ?? p?.correction ?? null)
    }
    const toGuest = () => { unlinkPurchaser(); store.setSetting('account', { mode: 'guest', date: nowIso() }); refresh() }
    return (
      <ProfileHome
        identity={settings.identity}
        profile={settings.profile ?? profileFromScreening(settings.screening)}
        onSave={saveIdentity}
        onQuestions={() => go('profile-questions')}
        onIntro={() => go('intro')}
        onBack={() => go(lastTab)}
        account={settings.account}
        onAccount={() => go('account')}
        onSignOut={async () => { try { await signOut() } catch { /* çevrimdışı: yerel oturum yine kapanır */ } toGuest() }}
        onDeleteAccount={async () => {
          try {
            await deleteAccount()
          } catch (e) {
            return friendlyError(e) ?? 'Hesap silinemedi. Biraz sonra yeniden dene.'
          }
          toGuest()
          return null
        }}
      />
    )
  }
  if (screen === 'profile-questions') {
    return <ProfileQuestions profile={settings.profile ?? profileFromScreening(settings.screening)} trueDepth={native.trueDepth} onSave={saveProfile} onBack={() => go('profile')} />
  }
  if (!isIOSApp() && (!calibrationStillValid(settings.calibration) || screen === 'recalibrate')) {
    return (
      <CardCalibration
        initial={settings.calibration}
        changed={Boolean(settings.calibration) && screen !== 'recalibrate'}
        autoReason={native.autoReason}
        onDone={(c) => { store.setSetting('calibration', c); refresh(); go(lastTab) }}
      />
    )
  }
  if (!settings.distance || screen === 'recalibrate-distance') {
    const done = (d) => { store.setSetting('distance', d); refresh(); go(lastTab) }
    if (native.trueDepth) return <DistanceHud step={setupTotal} total={setupTotal} onDone={done} />
    return <DistanceCalibration onDone={done} onSkip={() => done({ skipped: true, date: new Date().toISOString() })} />
  }

  // --- Abonelik kilidi: deneme ilk kurulumda başlar (Build 23b); abonelik/deneme yoksa ödeme ekranı ---
  const previewPaywall = new URLSearchParams(window.location.search).get('paywall') === 'preview'
  const locked = previewPaywall || (!access.loading && !access.premium)
  if (locked && screen !== 'evidence') {
    return (
      <Paywall
        preview={previewPaywall}
        onUnlocked={() => { setAccess({ loading: false, premium: true, native: true }); go('home') }}
        onSafety={() => go('evidence')}
        onExport={exportData}
      />
    )
  }
  if (locked && screen === 'evidence') return <Evidence onBack={() => go('home')} />

  // --- Kişisel göz kalibrasyonu: göz kontrollü ekrandan önce (TrueDepth, model yoksa) ---
  if (gazeFor) {
    const target = gazeFor.to
    return (
      <GazeCalibration
        onDone={() => go(target)}
        onSkip={() => { gazeSkipped.current = true; go(target) }}
        onCancel={() => { setGazeFor(null); window.scrollTo(0, 0) }}
      />
    )
  }

  // --- Zorunlu mola (göz bütçesi) ---
  if (lockFor) {
    const target = lockFor.to
    return (
      <RestLock
        key={target ?? 'rest'}
        target={target}
        targetLabel={target ? activityLabel(target) : ''}
        onGo={(r) => {
          setLockFor(null)
          go(r)
        }}
        onHome={() => {
          setLockFor(null)
          go('home')
        }}
      />
    )
  }

  // --- Yerinde profil sorusu (tek soruluk ekranlar) ---
  if (askFor) {
    const { ids, then, back: backTo } = askFor
    return (
      <QuestionFlow
        key={ids.join(',')}
        ids={ids}
        profile={settings.profile ?? profileFromScreening(settings.screening)}
        onSave={saveProfile}
        onDone={() => { setAskFor(null); go(then, { noAsk: true }) }}
        onClose={() => { setAskFor(null); go(backTo ?? lastTab, { noAsk: true }) }}
      />
    )
  }

  // Oyun oturumları (type 'game') egzersiz süresine ve takvimdeki çalışma günlerine sayılmaz
  // (Home.jsx'teki haftalık hedef/günlük süre ile tutarlı). Gelişim de oyunları gün/seri/hafta sayımına
  // katmaz; oyunları yalnızca listeler (lib/stats.js countsTowardGoal).
  const exercise = sessions.filter((s) => s.type !== 'game')

  // --- Tam ekran akışlar (sekme çubuğu yok) ---
  const saveTests = (results) => {
    ;[].concat(results).forEach((r) => store.addTest(r))
    refresh()
    go('progress')
  }
  const common = { calibration: settings.calibration, distanceCal, onCancel: back }

  // --- Modül ekranları (src/modules): ekran adını tanıyan modül kendi ekranını çizer ---
  const mod = registry.forRoute(screen)
  const view = mod && viewFor(mod.id)
  if (view) {
    const ctx = { native, settings, tests, sessions, exercise, common, go, back, refresh, store, saveTests }
    return (
      <>
        {view.render(ctx, screen)}
        {budgetKind && <EyeBudgetPill st={budget} kind={budgetKind} />}
      </>
    )
  }

  switch (screen) {
    case 'schedule':
      return <Schedule initial={settings.reminder} onBack={() => go('calendar')} onSave={(r) => { store.setSetting('reminder', r); refresh() }} />
    case 'evidence':
      return <Evidence onBack={() => go('info')} />
    case 'gaze-test':
      return <GazeTest onBack={() => go('info')} onCalibrate={() => go('gaze-cal')} />
    case 'gaze-cal':
      return <GazeCalibration onDone={() => go('gaze-test')} onCancel={() => go('info')} />
    default:
      break
  }

  // --- Sekmeli ekranlar ---
  const tab = TAB_SCREENS.includes(screen) ? screen : 'home'
  let content
  if (tab === 'progress') content = <Progress tests={tests} sessions={sessions} profile={settings.profile} identity={settings.identity} weeklyTarget={settings.reminder?.weeklyTarget} reportDay={rDay} onStart={go} />
  else if (tab === 'calendar') content = <Calendar records={[...tests, ...exercise]} schedule={settings.reminder} onEditSchedule={() => go('schedule')} />
  else if (tab === 'info') {
    content = (
      <Info
        onGo={go}
        iosApp={isIOSApp()}
        trueDepth={native.trueDepth}
        calibration={settings.calibration}
        distanceSkipped={!distanceCal}
        onExport={exportData}
        onReset={() => {
          // iPhone'da ekran ölçüsü cihaz modelinden gelir (kullanıcı verisi değil) ve yalnızca açılışta yazılır.
          // Silinirse testler uygulama yeniden açılana dek ölçeksiz kalır (AcuityTest calibration.pxPerMm → hata).
          const autoCal = isIOSApp() && settings.calibration?.method === 'auto' ? settings.calibration : null
          store.clearAll()
          if (autoCal) store.setSetting('calibration', autoCal)
          // Modüllerin cihazdaki rekorları ve seçenekleri de silinir (manifest storageKeys);
          // ses/titreşim tercihleri ve tema cihaz ayarı sayılır ve korunur.
          resetBudget(); resetAllHowto()
          for (const k of registry.resetKeys()) {
            try {
              localStorage.removeItem(k)
            } catch {
              // depolama yok: yoksay
            }
          }
          refresh()
          go('home')
        }}
      />
    )
  } else {
    content = <Home tests={tests} sessions={sessions} settings={settings} distanceTracked={Boolean(distanceCal)} trueDepth={native.trueDepth} eyeBudget={budget} premium={access.loading || access.premium} onStart={go} onAsk={(group) => { const ids = missing(settings.profile, GROUPS[group] ?? []); if (ids.length) setAskFor({ ids, then: 'home', back: 'home' }) }} onSaveProfile={saveProfile} />
  }

  return (
    <>
      <main className="screen has-tabbar fade-in" key={tab}>{content}</main>
      <TabBar active={tab} onChange={go} />
    </>
  )
}
