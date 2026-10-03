// Ana sayfa · su çipi (sahip 2026-10-03: "su daha gözüken yerde olmalı, su içtim daha kolay ... yukarıda bir yerde kaç
// bardak içtiği şık bir şekilde tasarımı bozmadan"; karar "Ana sayfada çip, tek dokunuş"). Üstteki haplarla aynı dil:
// bugünkü bardak sayısı; dokununca bir bardak eklenir (lib/habitLog.js, su ekranındaki "İçtim" ile aynı kayıt); 5 sn
// "Geri al" şeridi (AlarmLine'daki şerit; haplar yerinden oynamaz). Şerit üstte: altta Başla kartının üstüne biniyordu
// (5 sn kapısı tur 1, 320 × 640: 0/5). Litre hedefi yok (su modülü ilkesi).
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GlassWater, Plus } from 'lucide-react'
import { addHabit, removeHabit, loadHabits, habitsOn, dayKey } from '../../lib/habitLog.js'
import { haptic } from '../../lib/native.js'
import '../../styles/alarm.css' // .al-toast şeridi (AlarmLine ile aynı)

export const UNDO_MS = 5000
const countToday = (list, now) => habitsOn(list, dayKey(now)).filter((h) => h.type === 'water').length

export default function WaterChip({ now = new Date(), storage, onChange }) {
  const [n, setN] = useState(() => countToday(loadHabits(storage), now))
  const [undo, setUndo] = useState(null) // eklenen kaydın zamanı (ISO)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const add = () => {
    const t = new Date()
    const list = addHabit('water', t, storage)
    setN(countToday(list, t))
    setUndo(t.toISOString())
    haptic('success')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setUndo(null), UNDO_MS)
    onChange?.()
  }
  const back = () => {
    if (!undo) return
    const list = removeHabit('water', undo, storage)
    setN(countToday(list, new Date()))
    setUndo(null)
    clearTimeout(timer.current)
    haptic('tick')
    onChange?.()
  }

  return (
    <>
      <button type="button" className="hh-fact water" onClick={add} aria-label={`Su: bugün ${n} bardak. Bir bardak ekle`}>
        <GlassWater size={14} aria-hidden="true" className="f2" />
        <b>{n}</b>bardak su
        <Plus size={14} strokeWidth={2.6} aria-hidden="true" className="plus" />
      </button>
      {undo && typeof document !== 'undefined' ? createPortal(
        <div className="al-toast al-float wc-top" role="status">
          <span className="grow">Bir bardak su eklendi.</span>
          <button type="button" onClick={back}>Geri al</button>
        </div>,
        document.body,
      ) : null}
    </>
  )
}
