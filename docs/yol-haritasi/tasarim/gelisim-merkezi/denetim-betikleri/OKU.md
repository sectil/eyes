# Denetim betikleri (2026-09-30)

`DENETIM.md`'deki bulguları gösteren betikler. Depoda test olarak koşmaz (uzantıları bilerek `.denetim.js`); uygulama
modüllerini `/home/user/eyes/app/src/...` mutlak yoluyla içe aktarırlar. Koşmak için bir kopyayı `*.test.js` adıyla geçici
bir klasöre koyup `cd app && npx vitest run <yol> --root <app> --dir <klasör>` kullanılır. Kod oturumu bunları
`app/src/lib/` altında gerçek testlere çevirir (PLAN §8.4).
