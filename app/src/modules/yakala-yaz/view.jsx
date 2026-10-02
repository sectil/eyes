import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import YakalaYaz from '../../screens/YakalaYaz.jsx'
import { isYakala } from '../../lib/yakalaYaz.js'
import { speechAvailable, requestSpeechPermission, startSpeech } from '../../lib/native.js'
import { getPrefs, setPrefs, subscribePrefs } from '../../lib/prefs.js'

// Yoldan mı açıldı (bildirim PLAN.v1 §A.2: yolun içinde açılan modülde "Bana hatırlat" kartı çıkmaz)
const inPathOf = (ctx) => Boolean(ctx?.fromPath)

// Mikrofon yalnız telefon Türkçeyi cihaz içinde yazıya çevirebiliyorsa (speechAvailable onDevice) ve kişi kapatmadıysa;
// başlatma strictOnDevice ile: cihaz içi çalışamazsa başlamaz, ses telefondan çıkmaz (kelime-hafiza PLAN §6)
export function useYakalaMic() {
  const [onDevice, setOnDevice] = useState(false)
  const [pref, setPref] = useState(() => getPrefs().yakalaMic)
  useEffect(() => {
    let live = true
    speechAvailable('tr-TR').then((a) => { if (live) setOnDevice(a?.available === true && a?.onDevice === true) })
    const off = subscribePrefs((p) => setPref(p.yakalaMic))
    return () => { live = false; off() }
  }, [])
  if (!onDevice || pref === 'off') return null
  return {
    ask: pref === 'ask',
    setPref: (v) => setPrefs({ yakalaMic: v }),
    request: requestSpeechPermission,
    start: (onResult, onLevel) => startSpeech(onResult, { locale: 'tr-TR', strictOnDevice: true, onLevel }),
  }
}

function YakalaYazView({ ctx }) {
  const mic = useYakalaMic()
  return (
    <YakalaYaz
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
      remindField={ctx.remindField?.('yakala-yaz', { inPath: inPathOf(ctx) }) ?? null}
      mic={mic}
    />
  )
}

const lastOf = (ctx) => (ctx.sessions ?? []).filter(isYakala).at(-1)

export default {
  icon: Zap,
  // METINLER G1 ("Yakala Yaz · 2 dk") ve GE2'nin süre parçası
  sub: (ctx) => {
    const last = lastOf(ctx)
    return last ? `${last.thresholdMs} ms · 2 dk` : 'İki kelime, bir an. · 2 dk'
  },
  badge: (ctx) => {
    const last = lastOf(ctx)
    return last ? `${last.thresholdMs} ms` : null
  },
  render: (ctx) => <YakalaYazView ctx={ctx} />,
}
