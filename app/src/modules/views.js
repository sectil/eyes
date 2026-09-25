// Modül ekranları: src/modules/<ad>/view.jsx → { icon, render(ctx, route), sub?(ctx), badge?(ctx) }
// ctx (App verir): { native, settings, tests, sessions, exercise, common, go, back, refresh, store, saveTests }
const found = import.meta.glob('./*/view.jsx', { eager: true })
export const VIEWS = Object.fromEntries(
  Object.entries(found).map(([path, mod]) => [path.split('/')[1], mod.default]),
)
export const viewFor = (id) => VIEWS[id] ?? null
