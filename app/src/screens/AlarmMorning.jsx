import '../styles/alarm.css'
import { greeting } from '../lib/greeting.js'

// Sabah ekranı (Artifact "Nefona Alarm" v3, ekran 4): alarmdaki "Nefona'yı aç"a dokunulunca, kurulumda
// "Uyanınca" seçildiyse açılır. İsteğe bağlı: "Şimdi değil" Ana sayfaya döner ve o sabah bir daha sormaz.
export default function AlarmMorning({ action = 'breath', onStart, onSkip }) {
  const breath = action === 'breath'
  const light = action === 'light'
  return (
    <main className="screen fade-in al-morning">
      <span className="eyebrow">{greeting()}</span>
      <h1>{light ? 'Perdeyi aç, gün ışığı al' : breath ? 'Bir dakika nefes, sonra güne başla' : 'Güne bir Dalga ile başla'}</h1>
      <section className="card al-orb-card" aria-hidden="true">
        <div className="al-orb">{light ? 'Işık' : breath ? 'Nefes al' : 'Dinle'}</div>
      </section>
      <div className="grow" />
      <button type="button" className="btn" onClick={onStart}>{light ? 'Açtım' : breath ? 'Başla · 1 dk' : 'Başla'}</button>
      <button type="button" className="btn btn-ghost" onClick={onSkip}>Şimdi değil</button>
    </main>
  )
}
