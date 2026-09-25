// Modül ekranları: src/modules/<ad>/view.jsx → { icon, render(ctx, route), sub?(ctx), badge?(ctx), entries?(ctx) }
//   entries?(ctx) → [{ route, title, sub?, badge?, color? }]  bir modül Ana sayfada birden çok satır
//                   açıyorsa (ör. üç egzersiz seti). Yoksa tek satır: manifest.title + sub + badge.
// ctx (App verir): { native, settings, tests, sessions, exercise, common, go, back, refresh, store, saveTests }
const found = import.meta.glob('./*/view.jsx', { eager: true })
export const VIEWS = Object.fromEntries(
  Object.entries(found).map(([path, mod]) => [path.split('/')[1], mod.default]),
)
export const viewFor = (id) => VIEWS[id] ?? null
