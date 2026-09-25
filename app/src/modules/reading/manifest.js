// Okuma hızı testi (MNREAD tarzı, sesli okuma doğrulamalı).
export default {
  id: 'reading',
  title: 'Okuma hızı',
  label: 'okuma hızı testi',
  ring: 'eye',
  kind: 'measure',
  gates: { rest: true, active: true },
  home: { section: 'measure', order: 30 },
}
