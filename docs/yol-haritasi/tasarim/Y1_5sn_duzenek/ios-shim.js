// Düzenek: yalnız modules/yoga/manifest.js bu dosyayı lib/native.js yerine görür (vite.config.mjs yogaIos).
// Yoldaki yoga durağı iPhone uygulamasındaki gibi hesaplansın diye; lib/native.js'e dokunulmaz.
export const isIOSApp = () => true
