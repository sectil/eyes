// Yoga ders oynatıcısının JS köprüsü (lib/native.js lesson*; iOS: AlarmPlugin.swift LessonPlayer, PLAN.v3 §D.3).
// Web'de hiçbir çağrı yerel tarafa gitmez; iPhone'da girdiler temizlenip eklentiye iletilir. Swift burada derlenemediği
// için yerel kaynakla sözleşme metin olarak denetlenir: her JS çağrısının Swift'te kayıtlı bir yöntemi var.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'

const h = vi.hoisted(() => ({ native: true, alarm: {} }))
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => h.native,
    getPlatform: () => (h.native ? 'ios' : 'web'),
  },
  registerPlugin: (name) => (name === 'Alarm' ? h.alarm : {}),
}))

const native = await import('./native.js')
const { lessonStart, lessonPause, lessonResume, lessonSeek, lessonCrossTo, lessonStop, lessonStatus, lessonMeta, lessonJournal, lessonJournalClear } = native

const METHODS = ['lessonStart', 'lessonPause', 'lessonResume', 'lessonSeek', 'lessonCrossTo', 'lessonStop', 'lessonStatus', 'lessonMeta', 'lessonJournal', 'lessonJournalClear']
const swift = (name) => readFileSync(new URL(`../../ios/App/App/${name}`, import.meta.url), 'utf8')

beforeEach(() => {
  h.native = true
  for (const k of Object.keys(h.alarm)) delete h.alarm[k]
  for (const m of METHODS) h.alarm[m] = vi.fn(async () => ({ ok: m }))
})

describe('ders köprüsü: web', () => {
  it('web\'de her çağrı UNAVAILABLE ile reddedilir, eklentiye gitmez; kayıt null, silme false', async () => {
    h.native = false
    for (const call of [() => lessonStart({ file: 'yoga/ders2-15.mp3' }), lessonPause, () => lessonResume({ at: 3 }), () => lessonSeek({ at: 3 }), () => lessonCrossTo({ at: 3 }), lessonStop, lessonStatus, () => lessonMeta({})]) {
      await expect(call()).rejects.toMatchObject({ code: 'UNAVAILABLE' })
    }
    expect(await lessonJournal()).toBe(null)
    expect(await lessonJournalClear()).toBe(false)
    for (const m of METHODS) expect(h.alarm[m]).not.toHaveBeenCalled()
  })
})

describe('ders köprüsü: iPhone', () => {
  it('modules/yoga/bridge.js sözleşmesi aynen iletilir', async () => {
    await lessonStart({ file: 'yoga/ders2-15.mp3', at: 0, title: 'Derin Dinlenme' })
    expect(h.alarm.lessonStart).toHaveBeenCalledWith({ file: 'yoga/ders2-15.mp3', at: 0, title: 'Derin Dinlenme' })
    await lessonPause()
    expect(h.alarm.lessonPause).toHaveBeenCalledWith()
    await lessonResume({ at: 41.2 })
    expect(h.alarm.lessonResume).toHaveBeenLastCalledWith({ at: 41.2 })
    await lessonSeek({ at: 120 })
    expect(h.alarm.lessonSeek).toHaveBeenLastCalledWith({ at: 120 })
    await lessonCrossTo({ file: 'yoga/ders2-15.mp3', at: 812.5 })
    expect(h.alarm.lessonCrossTo).toHaveBeenLastCalledWith({ file: 'yoga/ders2-15.mp3', at: 812.5 })
    await lessonStop()
    expect(h.alarm.lessonStop).toHaveBeenCalledWith()
    h.alarm.lessonStatus = vi.fn(async () => ({ time: 12, duration: 900, playing: true, route: 'Speaker', state: 'playing' }))
    expect(await lessonStatus()).toEqual({ time: 12, duration: 900, playing: true, route: 'Speaker', state: 'playing' })
  })

  it('girdiler temizlenir: baştaki "./" düşer, geçersiz sayı ve öğe gitmez, isteğe bağlı ekler biçimlenir', async () => {
    await lessonStart({
      file: './yoga/ders2-15.mp3', at: NaN, title: 42, id: 7, journal: 'evet',
      sections: [{ at: 0, name: 'Karşılama' }, { at: 'x', name: 'Bozuk' }, { at: 300, name: '' }, { at: 812, name: 'Kapanış' }],
      resume: [{ from: 4.1, to: 5.1, at: 2.9 }, { from: 9, to: 8, at: 7 }, null],
      next: { file: '/yoga/ders2-15.mp3' },
      tail: { file: 'yoga/uyku-muzik.mp3', seconds: 600, fade: NaN },
    })
    expect(h.alarm.lessonStart).toHaveBeenCalledWith({
      file: 'yoga/ders2-15.mp3', at: 0, id: '7',
      sections: [{ at: 0, name: 'Karşılama' }, { at: 812, name: 'Kapanış' }],
      resume: [{ from: 4.1, to: 5.1, at: 2.9 }],
      next: { file: 'yoga/ders2-15.mp3', at: 0 },
      tail: { file: 'yoga/uyku-muzik.mp3', seconds: 600 },
    })
    await lessonStart({ file: 'yoga/a.mp3', tail: { file: 'yoga/b.mp3', seconds: 0.5 }, sections: [], journal: false })
    expect(h.alarm.lessonStart).toHaveBeenLastCalledWith({ file: 'yoga/a.mp3', at: 0, journal: false })
    await lessonResume()
    expect(h.alarm.lessonResume).toHaveBeenLastCalledWith({}) // at yok: klip başını yerel oynatıcı bulur
    await lessonResume({ at: Infinity })
    expect(h.alarm.lessonResume).toHaveBeenLastCalledWith({})
    await lessonCrossTo({ at: 30 })
    expect(h.alarm.lessonCrossTo).toHaveBeenLastCalledWith({ at: 30 }) // çalan dosyada geçiş
    await lessonMeta({ sections: [{ at: 0, name: 'Varış' }], resume: [] })
    expect(h.alarm.lessonMeta).toHaveBeenLastCalledWith({ sections: [{ at: 0, name: 'Varış' }] })
  })

  it('yerel ret kodu olduğu gibi gelir; eski derlemede (yöntem yok) UNIMPLEMENTED', async () => {
    h.alarm.lessonStart = vi.fn(() => Promise.reject(Object.assign(new Error('Ses kaydı sürüyor'), { code: 'BUSY' })))
    await expect(lessonStart({ file: 'yoga/ders2-15.mp3' })).rejects.toMatchObject({ code: 'BUSY' })
    delete h.alarm.lessonSeek
    await expect(lessonSeek({ at: 1 })).rejects.toMatchObject({ code: 'UNIMPLEMENTED' })
  })

  it('yerel kayıt: geçerliyse nesne, yoksa ya da hata varsa null; silme', async () => {
    const j = { id: 'r1', file: 'yoga/ders2-15.mp3', title: 'Derin Dinlenme', state: 'playing', finished: false, prelude: false, startedAt: 1790000000, updatedAt: 1790000874, listened: 874, time: 874, maxTime: 874, duration: 900 }
    h.alarm.lessonJournal = vi.fn(async () => ({ journal: j }))
    expect(await lessonJournal()).toEqual(j)
    h.alarm.lessonJournal = vi.fn(async () => ({}))
    expect(await lessonJournal()).toBe(null)
    h.alarm.lessonJournal = vi.fn(async () => ({ journal: { listened: 3 } }))
    expect(await lessonJournal()).toBe(null)
    h.alarm.lessonJournal = vi.fn(async () => { throw Object.assign(new Error('x'), { code: 'UNIMPLEMENTED' }) })
    expect(await lessonJournal()).toBe(null)
    expect(await lessonJournalClear()).toBe(true)
    expect(h.alarm.lessonJournalClear).toHaveBeenCalledTimes(1)
    h.alarm.lessonJournalClear = vi.fn(async () => { throw new Error('x') })
    expect(await lessonJournalClear()).toBe(false)
  })

  it('bridge.js\'in beklediği yedi yöntem native.js\'te işlev', () => {
    for (const m of ['lessonStart', 'lessonPause', 'lessonResume', 'lessonSeek', 'lessonCrossTo', 'lessonStop', 'lessonStatus']) {
      expect(typeof native[m]).toBe('function')
    }
  })
})

describe('yerel kaynakla sözleşme (Swift burada derlenemez; metin denetimi)', () => {
  const alarm = swift('AlarmPlugin.swift')
  const feedback = swift('FeedbackPlugin.swift')

  it('her JS çağrısı AlarmPlugin\'de kayıtlı ve @objc yöntemi var', () => {
    for (const m of METHODS) {
      expect(typeof native[m]).toBe('function')
      expect(alarm).toContain(`CAPPluginMethod(name: "${m}", returnType: CAPPluginReturnPromise)`)
      expect(alarm).toContain(`@objc func ${m}(_ call: CAPPluginCall)`)
    }
  })

  it('bugünkü yöntemler yerinde: uyku sesi ve alarm kayıtları değişmedi', () => {
    for (const m of ['status', 'requestAuth', 'schedule', 'cancel', 'current', 'preview', 'stopPreview', 'consumeOpen', 'sleepStart', 'sleepStop', 'sleepStatus']) {
      expect(alarm).toContain(`CAPPluginMethod(name: "${m}", returnType: CAPPluginReturnPromise)`)
    }
    expect(alarm).toContain('call.reject("Ses kaydı sürüyor", "BUSY")') // BUSY bugünkü anlamıyla: ses kaydı
  })

  it('sleepStart ders açıkken "LESSON" ile reddeder, uyku sesine dokunmadan (JS kodu aynı)', async () => {
    const { SLEEP_LESSON_CODE } = await import('./dalgaSleep.js')
    const body = alarm.slice(alarm.indexOf('@objc func sleepStart'), alarm.indexOf('@objc func sleepStop'))
    const guard = body.indexOf('LessonPlayer.shared.holdsAudio()')
    expect(guard).toBeGreaterThan(0)
    expect(body).toContain(`call.reject("Ders çalıyor", "${SLEEP_LESSON_CODE}")`)
    expect(guard).toBeLessThan(body.indexOf('self.stopSleepOnMain()'))
    expect(guard).toBeLessThan(body.indexOf('beginSleep()'))
  })

  it('ders başlayınca uyku sesi durur; oturum ayrı bayrakla (beginLesson / endLesson)', () => {
    const body = alarm.slice(alarm.indexOf('@objc func lessonStart'), alarm.indexOf('@objc func lessonPause'))
    expect(body.indexOf('try lesson.start(')).toBeLessThan(body.indexOf('self.stopSleepOnMain()'))
    expect(alarm).toContain('AppAudioSession.shared.beginLesson()')
    expect(alarm).toContain('AppAudioSession.shared.endLesson()')
    expect(feedback).toContain('func beginLesson() throws -> Bool')
    expect(feedback).toContain('func endLesson()')
    // Tercih iki bayraktan biri açıkken uygulanmaz; kayıt bitince .playback'e dönülür
    expect(feedback).toContain('if recording || sleepActive || lessonActive { return }')
    expect(feedback).toContain('if sleepActive || lessonActive {')
  })

  it('oynatıcı: sönme/açılma 1 sn, geçiş 2 sn, gözlemciler, Now Playing, uzaktan oynat/duraklat, yerel kayıt', () => {
    expect(alarm).toContain('import MediaPlayer')
    expect(alarm).toContain('static let fadeSeconds: TimeInterval = 1')
    expect(alarm).toContain('static let crossSeconds: TimeInterval = 2')
    for (const s of ['AVAudioSession.interruptionNotification', 'AVAudioSession.routeChangeNotification', 'AVAudioSession.mediaServicesWereResetNotification',
      '.oldDeviceUnavailable', 'MPNowPlayingInfoCenter.default().nowPlayingInfo', 'c.playCommand.addTarget', 'c.pauseCommand.addTarget',
      'static let journalKey = "nefona.lesson.journal"', 'subdirectory: "public/yoga"']) {
      expect(alarm).toContain(s)
    }
    // uzaktan komut yalnız oynat / duraklat: atlama, sarma komutuna hedef yok; ders süresince açıkça kapatılır (Apple:
    // kapatılmayan komutun arayüzü görünebilir) ve ders bitince eski değerine döner (modul.md §2.6)
    const install = alarm.slice(alarm.indexOf('private func installRemote()'), alarm.indexOf('private func removeRemote()'))
    const remove = alarm.slice(alarm.indexOf('private func removeRemote()'), alarm.indexOf('private func remote(play: Bool?)'))
    for (const s of ['nextTrackCommand', 'previousTrackCommand', 'skipForwardCommand', 'skipBackwardCommand', 'seekForwardCommand', 'seekBackwardCommand', 'changePlaybackPositionCommand']) {
      expect(alarm).not.toContain(`${s}.addTarget`)
      expect(install).toContain(`c.${s}`)
    }
    expect(install).toContain('for command in unwanted { command.isEnabled = false }')
    expect(remove).toContain('for (command, was) in disabledCommands { command.isEnabled = was }')
  })

  it('ders çalarken ses kaydı biterse oturum kapatılmaz (çalan oynatıcı durmasın); kayıt başlarken çalan ders duraklar', () => {
    const end = feedback.slice(feedback.indexOf('func endRecording()'), feedback.indexOf('func beginSleep()'))
    const keep = end.indexOf('if sleepActive || lessonActive {')
    expect(keep).toBeGreaterThan(0)
    expect(keep).toBeLessThan(end.indexOf('setActive(false'))
    expect(end.slice(keep, end.indexOf('return', keep))).not.toContain('setActive(false')
    const speech = swift('SpeechPlugin.swift')
    const start = speech.slice(speech.indexOf('@objc func start'), speech.indexOf('@objc func stop'))
    const yieldAt = start.indexOf('LessonPlayer.yieldToRecording()')
    expect(yieldAt).toBeGreaterThan(0)
    expect(yieldAt).toBeLessThan(start.indexOf('AppAudioSession.shared.beginRecording()'))
    expect(yieldAt).toBeLessThan(start.indexOf('.playAndRecord'))
    const y = alarm.slice(alarm.indexOf('private func yieldToRecordingOnMain()'), alarm.indexOf('func holdsAudio()'))
    expect(y).toContain('case .playing:\n            halt(reason: "recording")')
    expect(y).toContain('case .tail:\n            closeSession(finished: true)')
    expect(alarm).toContain('DispatchQueue.main.sync { shared.yieldToRecordingOnMain() }')
  })

  it('duraklatılmış ders kapanınca bitiş anı duraklatma anı (kayıt dinlenen güne); durum ve yerel kayıt pausedAt taşır', () => {
    const stop = alarm.slice(alarm.indexOf('    func stop() {'), alarm.indexOf('static func yieldToRecording()'))
    expect(stop).toContain('endedAt = pausedAt ?? Date()')
    const pause = alarm.slice(alarm.indexOf('func pause(reason r: String)'), alarm.indexOf('func resume(at: Double?)'))
    expect(pause).toContain('pausedAt = Date()')
    const resume = alarm.slice(alarm.indexOf('func resume(at: Double?)'), alarm.indexOf('func seek(to at: Double)'))
    expect(resume).toContain('pausedAt = nil')
    const halt = alarm.slice(alarm.indexOf('private func halt(reason r: String)'), alarm.indexOf('private func onTick()'))
    expect(halt).toContain('if state != .paused || pausedAt == nil { pausedAt = Date() }')
    expect(alarm).toContain('if let p = pausedAt, state == .paused { out["pausedAt"] = p.timeIntervalSince1970 }')
    expect(alarm).toContain('if let p = pausedAt, state == .paused { j["pausedAt"] = p.timeIntervalSince1970 }')
  })

  it('müzik kuyruğunda kesinti: kuyruk kapanır (çalıyormuş gibi görünen Now Playing ve açık oturum kalmaz)', () => {
    const intr = alarm.slice(alarm.indexOf('private func interrupted('), alarm.indexOf('private func routeChanged('))
    expect(intr).toContain('case .tail:')
    expect(intr.slice(intr.indexOf('case .tail:'), intr.indexOf('default:'))).toContain('closeSession(finished: true)')
    expect(intr).not.toContain('tp.play()')
  })
})
