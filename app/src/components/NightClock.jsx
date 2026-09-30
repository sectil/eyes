// Gece saati: uyku sesi çalarken ekran (tasarım A "Amber Saat", sahibi 2026-09-28 seçti; styles/dalga.css .dg-night).
// Tam siyah, kehribar ve kısık; en parlak yer saatin kendisi. Saat ve dakika alt alta, altında kalan müzik ince çizgi ve
// alarm. Dokununca 5 sn "Bitir" (çağıran showEnd'i yönetir; odaktayken onEndFocus/onEndBlur ile süre durur). Müzik
// bitince (state 'done') müzik göstergesi kaybolur, saat ve alarm kalır. drift: [x, y] nokta, dakikada bir kayar
// (lib/nightClock.js nextDrift). Ekranda başka yazı yok; VoiceOver için gizli durum satırı ve açık yazılmış süreler.
// state 'lesson': yoga dersi çaldığı için uyku sesi başlamadı (lib/dalgaSleep.js; PLAN.v3 §D.3): "Önce çalan dersi
// durdur." yazar, "dokun, başlat" düğmesi çıkmaz (her dokunuş yine reddedilirdi).
// Tema dışı: hep karanlık.
import { useEffect, useState } from 'react'
import { untilShort, spoken } from '../lib/nightClock.js'
import '../styles/dalga.css'

export const END_ARM_MS = 400 // "Bitir" çıktıktan sonra bu süre dokunuş sayılmaz: aynı yere çift dokunuş müziği bitirmesin
export const LESSON_TEXT = 'Önce çalan dersi durdur.'

const STATUS = { preparing: 'Müzik hazırlanıyor', playing: 'Müzik çalıyor', blocked: 'Ses başlamadı', lesson: 'Ses başlamadı', done: 'Müzik bitti' }

export default function NightClock({ now, left, total, state, alarmLabel, alarmAt, drift = [0, 0], showEnd, onTap, onEnd, onEndFocus, onEndBlur, onKick }) {
  const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0')
  const frac = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0
  const until = untilShort(alarmAt, now)
  const music = `Müzik · ${Math.max(1, Math.ceil(left / 60))} dk sonra susar`
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    setArmed(false)
    if (!showEnd) return undefined
    const id = setTimeout(() => setArmed(true), END_ARM_MS)
    return () => clearTimeout(id)
  }, [showEnd])
  return (
    <main className="dg-sleep dg-night" onClick={onTap} aria-label="Dalga · uyku" aria-describedby="dg-nc-hint">
      <span id="dg-nc-hint" className="dg-sr">Dokununca Bitir düğmesi çıkar.</span>
      <span className="dg-sr" aria-live="polite">{STATUS[state] ?? ''}</span>
      <div className="dg-nc" style={{ '--dx': `${drift[0]}px`, '--dy': `${drift[1]}px` }}>
        <div className="dg-nc-clock" role="img" aria-label={`Saat ${hh}:${mm}`}><span>{hh}</span><span>{mm}</span></div>
        <div className="dg-nc-meta">
          {state === 'blocked' ? (
            <button className="dg-sleep-kick" onClick={(e) => { e.stopPropagation(); onKick?.() }}>Ses başlamadı · dokun, başlat</button>
          ) : state === 'lesson' ? (
            <span className="dg-nc-sub">{LESSON_TEXT}</span>
          ) : state === 'preparing' ? (
            <span className="dg-nc-sub">Müzik hazırlanıyor…</span>
          ) : state === 'playing' ? (
            <>
              <div className="dg-nc-line" aria-hidden="true"><i style={{ width: `${Math.round(frac * 100)}%` }} /></div>
              <span className="dg-nc-sub" aria-hidden="true">{music}</span>
              <span className="dg-sr">{spoken(music.replace(' · ', ', '))}</span>
            </>
          ) : null}
          {alarmLabel && (
            <>
              <div className="dg-nc-row" aria-hidden="true">
                <span>Alarm {alarmLabel}</span>
                {until && <><span>·</span><span>{until}</span></>}
              </div>
              <span className="dg-sr">{`Alarm ${alarmLabel}${until ? `, ${spoken(until)} sonra` : ''}`}</span>
            </>
          )}
        </div>
      </div>
      {showEnd && (
        <button
          className="dg-sleep-end"
          onClick={(e) => { e.stopPropagation(); if (armed) onEnd?.() }}
          onFocus={onEndFocus}
          onBlur={onEndBlur}
        >Bitir</button>
      )}
    </main>
  )
}
