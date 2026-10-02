// Hızlı Bakış uyaranları (SVG). Renk: mürekkep; yıldız kehribar (doymuş kırmızı yok — ışığa duyarlılık, rapor 18 §7).
export function CarIcon({ size = 48, title }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d="M8 40 L14 26 Q18 18 28 18 L60 18 Q68 18 74 26 L82 32 L92 34 Q96 35 96 40 L96 44 L8 44 Z" fill="currentColor" />
      <path d="M30 22 L44 22 L44 31 L22 31 Q25 22 30 22 Z M48 22 L60 22 Q66 22 70 28 L72 31 L48 31 Z" fill="var(--ql-field, #fff)" opacity="0.55" />
      <circle cx="26" cy="46" r="8" fill="currentColor" /><circle cx="26" cy="46" r="3.5" fill="var(--ql-field, #fff)" />
      <circle cx="78" cy="46" r="8" fill="currentColor" /><circle cx="78" cy="46" r="3.5" fill="var(--ql-field, #fff)" />
    </svg>
  )
}
export function TruckIcon({ size = 48, title }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect x="4" y="8" width="58" height="36" rx="3" fill="currentColor" />
      <path d="M64 18 L82 18 Q86 18 88 22 L96 34 L96 44 L64 44 Z" fill="currentColor" />
      <path d="M70 22 L81 22 Q84 22 85 25 L89 32 L70 32 Z" fill="var(--ql-field, #fff)" opacity="0.55" />
      <circle cx="20" cy="46" r="8" fill="currentColor" /><circle cx="20" cy="46" r="3.5" fill="var(--ql-field, #fff)" />
      <circle cx="44" cy="46" r="8" fill="currentColor" /><circle cx="44" cy="46" r="3.5" fill="var(--ql-field, #fff)" />
      <circle cx="82" cy="46" r="8" fill="currentColor" /><circle cx="82" cy="46" r="3.5" fill="var(--ql-field, #fff)" />
    </svg>
  )
}
export function StarIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="var(--lens)" stroke="var(--lens-ink)" strokeWidth="0.8" />
    </svg>
  )
}
export function TriangleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 L21 20 L3 20 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  )
}
