// Günlük görme testi ("E hangi yönde", ~3 dk). Kayıtları tests deposuna gider; Gelişim'de stats.js işler.
export default {
  id: 'daily',
  title: 'Günlük test',
  label: 'günlük test',
  ring: 'eye',
  kind: 'measure',
  gates: { rest: true, active: true },
  home: { section: 'measure', order: 20 },
}
