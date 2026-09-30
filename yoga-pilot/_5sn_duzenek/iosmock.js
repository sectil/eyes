// iPhone uygulaması taklidi (klasik betik; @capacitor/core yüklenmeden ÖNCE çalışır).
//
// lib/native.js isIOSApp(): Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'.
// @capacitor/core 8.5.2 getPlatformId(win): win.webkit.messageHandlers.bridge varsa 'ios' (gerçek WKWebView gibi).
// createCapacitor(win) var olan window.Capacitor nesnesini kullanır: PluginHeaders'ta adı geçen eklenti yöntemleri
// cap.nativePromise(eklenti, yöntem, seçenekler) ile yerel tarafa gider. Burada yerel taraf bu dosyadır.
// Başlıkta olmayan eklenti ya da yöntem, eski iOS derlemesindeki gibi UNIMPLEMENTED ile reddedilir.
//
// Ders oynatıcısı (AlarmPlugin LessonPlayer; lib/native.js lesson*): sahte saatli küçük bir motor. Playwright
//   window.__lesson.freeze(sn)  konumu verilen saniyeye koyar ve orada tutar (çalıyor görünür, ilerlemez)
//   window.__lesson.finish()    dosya sonuna kadar çaldı (state 'finished'; dinlenen = süre)
// Bütün yerel çağrılar window.__nativeCalls'ta.
;(function () {
  const now = () => Date.now()
  const unix = (ms = now()) => ms / 1000
  const calls = (window.__nativeCalls = [])
  const bridgeMsgs = (window.__bridgeMsgs = [])

  // Capacitor 'ios' platformunu bu nesneden anlar
  window.webkit = { messageHandlers: { bridge: { postMessage: (m) => bridgeMsgs.push(m) } } }

  // Uygulama paketindeki ders dosyaları ve süreleri (sn). Şu an yalnız Ders 2 · 15 dk yayımlı (public/yoga/).
  const FILES = { 'yoga/ders2-15.mp3': 900 }

  const err = (message, code) => Object.assign(new Error(message), { code })
  const L = (window.__lesson = {
    state: 'idle', // idle | playing | paused | stopping | tail | finished
    reason: null,
    file: null,
    title: null,
    id: null,
    journalOn: true,
    duration: 0,
    at: 0, // son bilinen konum
    wall: 0, // o konumun duvar saati (ms)
    rate: 1, // 0: donmuş (freeze)
    listened: 0,
    maxTime: 0,
    startedAt: 0,
    updatedAt: 0,
    endedAt: 0,
    pausedAt: 0,
    journal: null,
    pos() {
      if (this.state !== 'playing') return this.at
      return Math.min(this.duration, this.at + ((now() - this.wall) / 1000) * this.rate)
    },
    settle() {
      // çalarken geçen süre dinlenmiş sayılır
      const p = this.pos()
      if (this.state === 'playing') this.listened += Math.max(0, p - this.at)
      this.at = p
      this.wall = now()
      this.maxTime = Math.max(this.maxTime, p)
      this.updatedAt = unix()
      this.writeJournal()
    },
    writeJournal() {
      if (!this.journalOn || !this.file) return
      this.journal = {
        id: this.id ?? undefined, file: this.file, title: this.title, state: this.state,
        finished: this.state === 'finished' || this.state === 'tail', prelude: false,
        startedAt: this.startedAt, updatedAt: this.updatedAt || unix(), endedAt: this.endedAt || undefined,
        pausedAt: this.state === 'paused' ? this.pausedAt : undefined,
        listened: this.listened, time: this.at, maxTime: this.maxTime, duration: this.duration,
      }
    },
    freeze(t) {
      this.settle()
      this.at = Math.max(0, Math.min(this.duration, Number(t) || 0)) // atlama: dinlenmiş sayılmaz
      this.maxTime = Math.max(this.maxTime, this.at)
      this.wall = now()
      this.rate = 0
      this.writeJournal()
    },
    finish() {
      this.settle()
      this.at = this.duration
      this.maxTime = this.duration
      this.listened = this.duration
      this.state = 'finished'
      this.endedAt = unix()
      this.writeJournal()
    },
  })

  const Alarm = {
    lessonStart(o) {
      const file = String(o.file ?? '').replace(/^\.?\//, '')
      if (!(file in FILES)) throw err(`Dosya pakette yok: ${file}`, 'MISSING')
      Object.assign(L, {
        state: 'playing', reason: null, file, title: o.title ?? null, id: o.id ?? null, journalOn: o.journal !== false,
        duration: FILES[file], at: Number(o.at) || 0, wall: now(), rate: 1, listened: 0, maxTime: 0,
        startedAt: unix(), updatedAt: unix(), endedAt: 0, pausedAt: 0,
      })
      L.writeJournal()
      return {}
    },
    lessonPause() {
      if (L.state !== 'playing') throw err('Çalan ders yok', 'IDLE')
      L.settle()
      L.state = 'paused'
      L.reason = 'user'
      L.pausedAt = unix()
      L.writeJournal()
      return {}
    },
    lessonResume(o) {
      if (L.state !== 'paused') throw err('Duraklatılmış ders yok', 'IDLE')
      L.settle()
      if (Number.isFinite(o?.at)) L.at = o.at
      L.state = 'playing'
      L.reason = null
      L.pausedAt = 0
      L.wall = now()
      L.writeJournal()
      return {}
    },
    lessonSeek(o) {
      L.settle()
      if (Number.isFinite(o?.at)) L.at = Math.max(0, Math.min(L.duration, o.at))
      L.wall = now()
      return {}
    },
    lessonCrossTo(o) {
      L.settle()
      if (Number.isFinite(o?.at)) L.at = Math.max(0, Math.min(L.duration, o.at))
      L.wall = now()
      return {}
    },
    lessonStop() {
      if (L.state === 'idle') throw err('Çalan ders yok', 'IDLE')
      L.settle()
      L.state = 'idle'
      L.endedAt = L.endedAt || unix()
      L.writeJournal()
      return {}
    },
    lessonMeta() {
      return {}
    },
    lessonStatus() {
      const p = L.pos()
      return {
        time: p, duration: L.duration || null, playing: L.state === 'playing', route: 'speaker', state: L.state,
        reason: L.state === 'paused' ? L.reason : undefined, pausedAt: L.state === 'paused' ? L.pausedAt : undefined,
        listened: L.listened + (L.state === 'playing' ? Math.max(0, p - L.at) : 0), file: L.file, prelude: false,
        ended: L.state === 'finished',
      }
    },
    lessonJournal() {
      return { journal: L.journal }
    },
    lessonJournalClear() {
      L.journal = null
      return {}
    },
    sleepStatus() {
      return { playing: false }
    },
  }
  const Feedback = {
    haptic: () => ({}),
    setAudioMode: () => ({}),
    isHapticsSupported: () => ({ supported: true }),
  }
  const impl = { Alarm, Feedback }
  const header = (name, methods) => ({
    name,
    methods: [...methods.map((m) => ({ name: m, rtype: 'promise' })), { name: 'addListener', rtype: 'callback' }, { name: 'removeListener', rtype: 'promise' }],
  })
  let seq = 0
  window.Capacitor = {
    PluginHeaders: Object.entries(impl).map(([name, o]) => header(name, Object.keys(o))),
    nativeCallback(plugin, method, options) {
      calls.push({ plugin, method, options, t: now() })
      return `cb${++seq}`
    },
    async nativePromise(plugin, method, options) {
      calls.push({ plugin, method, options, t: now() })
      const f = impl[plugin]?.[method]
      if (method === 'removeListener') return {}
      if (!f) throw err(`${plugin}.${method} bu taklitte yok`, 'UNIMPLEMENTED')
      return f(options ?? {})
    },
  }
})()
