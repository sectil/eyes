// Ana sayfa önerisi (tasarım: Artifact "Nefona Bugün ve Profil"): tek büyük düğme + sakin seçenekler.
// Kural yalnız kayıtlı veriden; sağlık iddiası yok.
//  1. Göz molası kilidi ya da molası gelmişse → Nefes (5 dk)
//  2. Bugünün yolu yarımsa → sıradaki durak (yol sıralı; canOpen ile aynı durak)
//  3. Yol bittiyse ya da bugün yol yoksa → Dalga
// Sakin seçenekler: Nefes ve Dalga'dan birincil olmayanlar (ikisi de göz bütçesine bağlı değil).
const CALM = {
  breath: { kind: 'breath', title: 'Nefes', sub: '5 dk mola', route: 'breath-rest' },
  dalga: { kind: 'dalga', title: 'Dalga', sub: 'sakinleş', route: 'dalga' },
}

export function homeSuggestion({ plan = null, eye = null } = {}) {
  let primary
  if (eye?.locked || eye?.due) {
    primary = { kind: 'breath', eyebrow: 'Göz molası', title: 'Nefes · 5 dk', line: 'Gözlerin mola istiyor.', sub: 'Ekrandan uzak, yavaş nefes', route: 'breath-rest' }
  } else if (plan?.next && !plan.allDone) {
    const s = plan.next
    const min = s.minutes ? `${s.minutes} dk` : ''
    const started = (plan.doneCount ?? 0) > 0
    primary = {
      kind: 'path',
      eyebrow: started ? 'Yola devam et' : 'Güne başla',
      title: [s.title, min].filter(Boolean).join(' · '),
      line: started ? `Kaldığın yerden devam: ${s.title}.` : `Güne ${s.title} ile başla.`,
      sub: s.sub || (min ? `${min}` : ''),
      route: s.route,
    }
  } else {
    const done = Boolean(plan?.allDone)
    primary = {
      kind: 'dalga',
      eyebrow: done ? 'Bugün tamam' : 'Serbest gün',
      title: 'Dalga',
      line: done ? 'Bugünkü yol tamam.' : 'Bugün yol yok.',
      sub: 'İstersen Dalga ile gevşe',
      route: 'dalga',
    }
  }
  const alts = ['breath', 'dalga'].filter((k) => k !== primary.kind).map((k) => CALM[k])
  return { primary, alts }
}
