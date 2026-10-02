// Yoga ekran düzeneği: uygulamanın kendi bileşenleri, App.jsx'teki gibi bağlanır (uygulama kodu değişmez).
// - 'home': <main className="screen has-tabbar fade-in"><Home …/></main> + <TabBar/> (App.jsx sekmeli ekran)
// - modül rotası ('yoga', 'yoga-2' …): registry.forRoute → viewFor(id).render(ctx, rota) (App.jsx modül ekranı)
// Depo: lib/storage.js'in gerçek store'u (tarayıcı bağlamı her çekimde temiz). Tema: lib/theme.js applyTheme.
// Adres: ?t=light|dark  &r=home|yoga|yoga-2
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import '/src/styles.css'
import Home from '/src/screens/Home.jsx'
import { TabBar } from '/src/components/ui.jsx'
import { registry } from '/src/modules/registry.js'
import { viewFor } from '/src/modules/views.js'
import { store } from '/src/lib/storage.js'
import { applyTheme } from '/src/lib/theme.js'
import { isIOSApp } from '/src/lib/native.js'
import { isExerciseSession } from '/src/lib/stats.js'

const q = new URLSearchParams(location.search)
applyTheme(q.get('t') === 'dark' ? 'dark' : 'light')
if (!store.get().settings.identity) store.setSetting('identity', { name: 'Haydar' })
window.__ios = isIOSApp()

function Harness() {
  const [route, setRoute] = useState(q.get('r') ?? 'home')
  const [data, setData] = useState(() => store.get())
  const refresh = () => setData(store.get())
  const go = (r) => {
    setRoute(r)
    window.scrollTo(0, 0) // App.go ile aynı
  }
  window.__route = route
  window.__go = go
  const { settings, tests, sessions } = data

  const mod = registry.forRoute(route)
  const view = mod && viewFor(mod.id)
  if (view) {
    const ctx = {
      native: { trueDepth: false }, settings, tests, sessions, exercise: sessions.filter(isExerciseSession),
      common: { calibration: settings.calibration, distanceCal: null, onCancel: () => go('home') },
      go, back: () => go('home'), refresh, store, saveTests: () => {}, focusBlock: null,
    }
    return view.render(ctx, route)
  }
  return (
    <>
      <main className="screen has-tabbar fade-in" key="home">
        <Home
          tests={tests} sessions={sessions} settings={settings} distanceTracked trueDepth={false} eyeBudget={null}
          onCoach={() => {}} onStart={go} onYogaMorning={refresh}
        />
      </main>
      <TabBar active="home" onChange={go} />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
