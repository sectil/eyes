import Foundation
import AVFoundation
import MediaPlayer
import SwiftUI
import Capacitor
#if canImport(AlarmKit)
import AlarmKit
import AppIntents
#endif

/// Nefona alarmı (Artifact "Nefona Alarm" v3, onaylı 2026-09-28). JS adı: "Alarm" (lib/alarm.js, lib/native.js).
/// AlarmKit yalnız iOS 26+ (sessiz ve Odak modunu deler). iOS 15–25'te JS tarafı bildirimle hatırlatır.
/// AlarmKit ve AppIntents zayıf bağlı (OTHER_LDFLAGS -weak_framework); her çağrı #available ile korunur.
/// Tek alarm: kimliği UserDefaults'ta; yeniden kurmak yenisi kurulduktan SONRA eskisini iptal eder.
/// Ses: uygulama paketindeki dosya adı (Library/Sounds'taki dosya çalmıyor — HATA_GUNLUGU Bug 20); nil = iOS varsayılanı.
/// - status() → { available, auth: authorized|denied|notDetermined|unavailable }
/// - requestAuth() → { auth }
/// - schedule({ hour, minute, weekdays: [0..6] (0 = Pazar, JS Date.getDay), sound? }) → { id, snooze }
///   İkinci düğme "9 dk ertele" (simgesi 9); iOS reddederse "Nefona'yı aç" ile kurulur (snooze: false).
///   Başlık saate göre: sabah "Nefona · Günaydın", değilse "Nefona · Alarm".
///   weekdays boşsa tek sefer: bir sonraki hour:minute.
/// - cancel() → { cancelled }
/// - current() → { id?, scheduled } (iOS'ta hâlâ kurulu mu; çalıp kapanan alarm iOS'ta silinir)
/// - preview({ file }) / stopPreview(): paketteki sesi uygulamanın içinde çalar (alarm kurmadan)
/// - consumeOpen() → { openedAt? } alarmdaki "Nefona'yı aç"a dokunulduğu an (sn), okununca silinir
/// - sleepStart({ seconds, fade }) / sleepStop() / sleepStatus(): uyku sesi iOS'un kendi oynatıcısıyla (Bug 22: web
///   görünümündeki <audio> çalıyor görünüp duyulmuyordu). public/sleep/sakin-loop.wav döngüde; son `fade` sn'de
///   setVolume(0, fadeDuration:) ile kısılır, süre bitince durur; kilitli ekranda sürer (UIBackgroundModes: audio).
///   Döner/raporlar: { playing, time, gain, outputVolume (telefonun medya sesi 0–1), category, route }
///   Yoga dersi çalarken (ya da müzik kuyruğunda) sleepStart "LESSON" ile reddeder; çalan ders kendiliğinden
///   durdurulmaz ("BUSY" bugünkü anlamıyla ses kaydı için kalır). Duraklatılmış (sessiz) ders kapatılır ve uyku sesi
///   başlar (LessonPlayer.holdsAudio). Ders yokken davranış aynıdır.
/// - lessonStart({ file, at, title, id?, journal?, sections?, resume?, next?, tail? }) / lessonPause() /
///   lessonResume({ at? }) / lessonSeek({ at }) / lessonCrossTo({ file?, at }) / lessonStop() / lessonStatus() /
///   lessonMeta({ file?, sections?, resume? }) / lessonJournal() / lessonJournalClear(): yoga dersi (LessonPlayer, bu
///   dosyanın sonunda; PLAN.v3 §D.3). Ayrıntı LessonPlayer'ın başındaki notta.
@objc(AlarmPlugin)
public class AlarmPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AlarmPlugin"
    public let jsName = "Alarm"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuth", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "schedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "current", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "list", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "preview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "consumeOpen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sleepStart", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sleepStop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sleepStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonStart", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonPause", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonResume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonSeek", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonCrossTo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonStop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonMeta", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonJournal", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lessonJournalClear", returnType: CAPPluginReturnPromise)
    ]

    static let idKey = "nefona.alarm.id"
    static let openedKey = "nefona.alarm.openedAt"
    static let snoozeSeconds: TimeInterval = 9 * 60 // iOS saat uygulamasıyla aynı 9 dk
    private var player: AVAudioPlayer?

    @objc func status(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            call.resolve(["available": true, "auth": Self.authName(AlarmManager.shared.authorizationState)])
            return
        }
        #endif
        call.resolve(["available": false, "auth": "unavailable"])
    }

    @objc func requestAuth(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            Task {
                do {
                    let st = try await AlarmManager.shared.requestAuthorization()
                    call.resolve(["auth": Self.authName(st)])
                } catch {
                    call.reject("İzin istenemedi: \(error)", "AUTH")
                }
            }
            return
        }
        #endif
        call.resolve(["auth": "unavailable"])
    }

    @objc func schedule(_ call: CAPPluginCall) {
        guard let hour = call.getInt("hour"), let minute = call.getInt("minute"),
              (0...23).contains(hour), (0...59).contains(minute) else {
            call.reject("hour (0–23) ve minute (0–59) gerekli", "ARGS")
            return
        }
        let days = (call.getArray("weekdays", Int.self) ?? []).filter { (0...6).contains($0) }
        let sound = call.getString("sound")
        // Paket kökünde olmayan ad AlarmKit'te sessizce varsayılan sese düşer (Apple forum 802620); önce kendimiz bakarız
        if let sound {
            let name = (sound as NSString).deletingPathExtension
            let ext = (sound as NSString).pathExtension
            if sound.contains("/") || Bundle.main.url(forResource: name, withExtension: ext.isEmpty ? nil : ext) == nil {
                call.reject("Ses pakette yok: \(sound)", "MISSING")
                return
            }
        }
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            Task {
                do {
                    let weekdays: [Locale.Weekday] = Array(Set(days)).sorted().map { Self.weekday($0) }
                    let schedule = Alarm.Schedule.relative(Alarm.Schedule.Relative(
                        time: Alarm.Schedule.Relative.Time(hour: hour, minute: minute),
                        repeats: weekdays.isEmpty ? .never : .weekly(weekdays)))
                    let tint = Color(red: 0.10, green: 0.76, blue: 0.82)
                    let stop = AlarmButton(text: "Kapat", textColor: .white, systemImageName: "stop.circle")
                    // Başlık saate göre: sabah (04.00–11.59) "Günaydın", değilse "Alarm" (sahibi 18:05'te "Günaydın" gördü)
                    let title = (4...11).contains(hour) ? "Nefona · Günaydın" : "Nefona · Alarm"
                    // Üstten gelen şeritte iOS düğmenin yalnız simgesini gösterir: süre simgede de görünsün (9 yuvarlak içinde)
                    let snoozeMin = Int(Self.snoozeSeconds / 60)
                    // Önce yenisi: kurulamazsa eski alarm yerinde kalır (JS de eskisini gösterir)
                    let id = UUID()
                    var snooze = true
                    do {
                        // İkinci düğme "Ertele": .countdown → postAlert (9 dk) sonra yeniden çalar (Apple örneği
                        // "Scheduling an alarm with AlarmKit"). Sahibinin kararı (2026-09-28): "Nefona'yı aç" yerine erteleme.
                        let alert = AlarmPresentation.Alert(
                            title: "\(title)",
                            stopButton: stop,
                            secondaryButton: AlarmButton(text: "\(snoozeMin) dk ertele", textColor: .white, systemImageName: "\(snoozeMin).circle.fill"),
                            secondaryButtonBehavior: .countdown)
                        let attributes = AlarmAttributes<NefonaAlarmMeta>(
                            presentation: AlarmPresentation(alert: alert, countdown: AlarmPresentation.Countdown(title: "\(snoozeMin) dk ertelendi")),
                            metadata: NefonaAlarmMeta(),
                            tintColor: tint)
                        let countdown = Alarm.CountdownDuration(preAlert: nil, postAlert: Self.snoozeSeconds)
                        let config: AlarmManager.AlarmConfiguration<NefonaAlarmMeta>
                        if let sound {
                            config = AlarmManager.AlarmConfiguration<NefonaAlarmMeta>(countdownDuration: countdown, schedule: schedule, attributes: attributes, sound: .named(sound))
                        } else {
                            config = AlarmManager.AlarmConfiguration<NefonaAlarmMeta>(countdownDuration: countdown, schedule: schedule, attributes: attributes)
                        }
                        _ = try await AlarmManager.shared.schedule(id: id, configuration: config)
                    } catch {
                        // VARSAYIM: geri sayım (erteleme) widget uzantısı isteyebilir; reddedilirse alarm yine kurulur,
                        // ikinci düğme eskisi gibi "Nefona'yı aç" olur. JS { snooze: false } ile öğrenir ve günlüğe yazar.
                        snooze = false
                        let alert = AlarmPresentation.Alert(
                            title: "\(title)",
                            stopButton: stop,
                            secondaryButton: AlarmButton(text: "Nefona'yı aç", textColor: .white, systemImageName: "sun.max"),
                            secondaryButtonBehavior: .custom)
                        let attributes = AlarmAttributes<NefonaAlarmMeta>(
                            presentation: AlarmPresentation(alert: alert), metadata: NefonaAlarmMeta(), tintColor: tint)
                        let config: AlarmManager.AlarmConfiguration<NefonaAlarmMeta>
                        if let sound {
                            config = .alarm(schedule: schedule, attributes: attributes, secondaryIntent: OpenNefonaIntent(), sound: .named(sound))
                        } else {
                            config = .alarm(schedule: schedule, attributes: attributes, secondaryIntent: OpenNefonaIntent())
                        }
                        _ = try await AlarmManager.shared.schedule(id: id, configuration: config)
                    }
                    Self.cancelStored()
                    UserDefaults.standard.set(id.uuidString, forKey: Self.idKey)
                    call.resolve(["id": id.uuidString, "snooze": snooze])
                } catch {
                    call.reject("Alarm kurulamadı: \(error)", "SCHEDULE")
                }
            }
            return
        }
        #endif
        call.reject("AlarmKit yok (iOS 26 gerekir)", "UNAVAILABLE")
    }

    /// Tanı (yalnız test derlemesinde Bilgi → "Alarm (tanı)"): AlarmKit'te bu uygulamanın bütün alarmları.
    /// Alarm'ın belgeli alanları: id, schedule (isteğe bağlı), state (alarmkit_alarm.json); durum ve çizelge metin olarak.
    @objc func list(_ call: CAPPluginCall) {
        let stored = UserDefaults.standard.string(forKey: Self.idKey) ?? ""
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            do {
                let rows: [[String: Any]] = try AlarmManager.shared.alarms.map { a in
                    ["id": a.id.uuidString,
                     "state": String(describing: a.state),
                     "schedule": a.schedule.map { String(describing: $0) } ?? "yok"]
                }
                call.resolve(["available": true, "stored": stored, "alarms": rows])
            } catch {
                call.resolve(["available": true, "stored": stored, "alarms": [], "error": "\(error)"])
            }
            return
        }
        #endif
        call.resolve(["available": false, "stored": stored, "alarms": []])
    }

    @objc func cancel(_ call: CAPPluginCall) {
        call.resolve(["cancelled": Self.cancelStored()])
    }

    @objc func current(_ call: CAPPluginCall) {
        guard let s = UserDefaults.standard.string(forKey: Self.idKey), let id = UUID(uuidString: s) else {
            call.resolve(["scheduled": false])
            return
        }
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            let alive = (try? AlarmManager.shared.alarms.contains { $0.id == id }) ?? false
            call.resolve(["id": s, "scheduled": alive])
            return
        }
        #endif
        call.resolve(["id": s, "scheduled": false])
    }

    @objc func preview(_ call: CAPPluginCall) {
        guard let file = call.getString("file"), !file.contains("/") else {
            call.reject("file gerekli", "ARGS")
            return
        }
        let name = (file as NSString).deletingPathExtension
        let ext = (file as NSString).pathExtension
        guard let url = Bundle.main.url(forResource: name, withExtension: ext.isEmpty ? nil : ext) else {
            call.reject("Ses pakette yok: \(file)", "MISSING")
            return
        }
        DispatchQueue.main.async {
            do {
                self.player?.stop()
                // Ses oturumuna dokunmaz: kategori kullanıcının tercihinde (AppAudioSession, FeedbackPlugin.swift)
                let p = try AVAudioPlayer(contentsOf: url)
                p.play()
                self.player = p
                call.resolve(["seconds": p.duration])
            } catch {
                call.reject("Çalınamadı: \(error)", "PLAY")
            }
        }
    }

    @objc func stopPreview(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.player?.stop()
            self.player = nil
            call.resolve()
        }
    }

    // MARK: Uyku sesi (yerel oynatıcı)
    private var sleepPlayer: AVAudioPlayer?
    private var sleepFade: DispatchWorkItem?
    private var sleepEnd: DispatchWorkItem?
    private var sleepEndsAt: Date?
    private var interruptObserver: NSObjectProtocol?

    @objc func sleepStart(_ call: CAPPluginCall) {
        let seconds = call.getDouble("seconds") ?? 0
        guard seconds >= 1 else {
            call.reject("seconds gerekli", "ARGS")
            return
        }
        let fade = max(1, min(call.getDouble("fade") ?? 180, seconds / 2))
        guard let url = Bundle.main.url(forResource: "sakin-loop", withExtension: "wav", subdirectory: "public/sleep") else {
            call.reject("Uyku sesi pakette yok", "MISSING")
            return
        }
        DispatchQueue.main.async {
            // Yoga dersi çalarken (ya da müzik kuyruğunda) uyku sesi başlamaz; ikisi hiçbir zaman aynı anda çalmaz ve
            // çalan ders kendiliğinden durdurulmaz (PLAN.v3 §D.3). Ayrı kod: JS bunu "Önce çalan dersi durdur." evresine
            // çevirir (dalgaSleep.js). Duraklatılmış (sessiz) ders ise kapatılır ve uyku sesine yer açar (holdsAudio).
            if LessonPlayer.shared.holdsAudio() {
                call.reject("Ders çalıyor", "LESSON")
                return
            }
            self.stopSleepOnMain()
            do {
                // Sessiz tuşunda ve kilitli ekranda da çalsın; kullanıcının "ses kapalı" (ambient) tercihi bitene kadar
                // oturumu değiştirmez (AppAudioSession, FeedbackPlugin.swift)
                guard try AppAudioSession.shared.beginSleep() else {
                    call.reject("Ses kaydı sürüyor", "BUSY")
                    return
                }
                let p = try AVAudioPlayer(contentsOf: url)
                p.numberOfLoops = -1
                p.volume = 1
                p.prepareToPlay()
                guard p.play() else {
                    AppAudioSession.shared.endSleep()
                    call.reject("Çalınamadı", "PLAY")
                    return
                }
                self.sleepPlayer = p
                self.sleepEndsAt = Date().addingTimeInterval(seconds)
                // Arama, Siri ya da başka uygulama sesi keserse: kesinti bitince (iOS izin verirse) kaldığı yerden sürdür
                self.interruptObserver = NotificationCenter.default.addObserver(
                    forName: AVAudioSession.interruptionNotification, object: nil, queue: .main
                ) { [weak self] note in self?.sleepInterrupted(note) }
                let f = DispatchWorkItem { [weak self] in self?.sleepPlayer?.setVolume(0, fadeDuration: fade) }
                let e = DispatchWorkItem { [weak self] in self?.stopSleepOnMain() }
                self.sleepFade = f
                self.sleepEnd = e
                DispatchQueue.main.asyncAfter(deadline: .now() + max(0, seconds - fade), execute: f)
                DispatchQueue.main.asyncAfter(deadline: .now() + seconds + 1, execute: e)
                call.resolve(Self.audioInfo(p))
            } catch {
                AppAudioSession.shared.endSleep()
                call.reject("Çalınamadı: \(error)", "PLAY")
            }
        }
    }

    @objc func sleepStop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.stopSleepOnMain()
            call.resolve()
        }
    }

    @objc func sleepStatus(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(Self.audioInfo(self.sleepPlayer))
        }
    }

    private func stopSleepOnMain() {
        sleepFade?.cancel()
        sleepEnd?.cancel()
        sleepFade = nil
        sleepEnd = nil
        sleepEndsAt = nil
        if let o = interruptObserver {
            NotificationCenter.default.removeObserver(o)
            interruptObserver = nil
        }
        guard let p = sleepPlayer else { return }
        p.stop()
        sleepPlayer = nil
        AppAudioSession.shared.endSleep()
    }

    private func sleepInterrupted(_ note: Notification) {
        guard let p = sleepPlayer, let info = note.userInfo,
              let raw = info[AVAudioSessionInterruptionTypeKey] as? UInt,
              AVAudioSession.InterruptionType(rawValue: raw) == .ended,
              let end = sleepEndsAt, Date() < end else { return }
        let optRaw = info[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0
        guard AVAudioSession.InterruptionOptions(rawValue: optRaw).contains(.shouldResume) else { return }
        try? AVAudioSession.sharedInstance().setActive(true)
        p.play()
    }

    static func audioInfo(_ p: AVAudioPlayer?) -> [String: Any] {
        let s = AVAudioSession.sharedInstance()
        return [
            "playing": p?.isPlaying ?? false,
            "time": p?.currentTime ?? 0,
            "gain": Double(p?.volume ?? 0),
            "outputVolume": Double(s.outputVolume),
            "category": s.category.rawValue,
            "route": s.currentRoute.outputs.map { $0.portType.rawValue }.joined(separator: ","),
        ]
    }

    // MARK: Yoga dersi (yerel oynatıcı; LessonPlayer aşağıda). Her iş ana kuyrukta.

    @objc func lessonStart(_ call: CAPPluginCall) {
        let file = call.getString("file") ?? ""
        guard let url = LessonPlayer.bundleURL(file) else {
            call.reject("Ders dosyası pakette yok: \(file)", "MISSING")
            return
        }
        let at = LessonPlayer.number(call.getValue("at")) ?? 0
        let title = call.getString("title") ?? ""
        let id = call.getString("id")
        let journal = call.getBool("journal") ?? true
        let meta = LessonPlayer.parseMeta(sections: call.getArray("sections"), resume: call.getArray("resume"))
        let next: LessonPlayer.Next?
        let tail: LessonPlayer.Tail?
        do {
            next = try LessonPlayer.parseNext(call.getObject("next"))
            tail = try LessonPlayer.parseTail(call.getObject("tail"))
        } catch {
            LessonPlayer.reject(call, error)
            return
        }
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            do {
                try lesson.start(file: file, url: url, at: at, title: title, id: id, journal: journal,
                                 meta: meta, next: next, tail: tail)
                // Tek yerel ses: ders başlayınca çalan uyku sesi durur. Oturum dersin bayrağıyla açık kalır
                // (endSleep ders açıkken oturumu bırakmaz; FeedbackPlugin.swift AppAudioSession).
                self.stopSleepOnMain()
                call.resolve(lesson.status())
            } catch {
                LessonPlayer.reject(call, error)
            }
        }
    }

    @objc func lessonPause(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            lesson.pause(reason: "user")
            call.resolve(lesson.status())
        }
    }

    @objc func lessonResume(_ call: CAPPluginCall) {
        let at = LessonPlayer.number(call.getValue("at"))
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            do {
                try lesson.resume(at: at)
                call.resolve(lesson.status())
            } catch {
                LessonPlayer.reject(call, error)
            }
        }
    }

    @objc func lessonSeek(_ call: CAPPluginCall) {
        guard let at = LessonPlayer.number(call.getValue("at")) else {
            call.reject("at gerekli", "ARGS")
            return
        }
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            do {
                try lesson.seek(to: at)
                call.resolve(lesson.status())
            } catch {
                LessonPlayer.reject(call, error)
            }
        }
    }

    @objc func lessonCrossTo(_ call: CAPPluginCall) {
        guard let at = LessonPlayer.number(call.getValue("at")) else {
            call.reject("at gerekli", "ARGS")
            return
        }
        // file yoksa çalan dosya (aynı dosyada başka yere geçiş: "Kapanışa geç", bölüme atlama)
        let file = call.getString("file")
        let url = file.flatMap { LessonPlayer.bundleURL($0) }
        if let file, url == nil {
            call.reject("Ders dosyası pakette yok: \(file)", "MISSING")
            return
        }
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            do {
                try lesson.cross(file: file, url: url, at: at)
                call.resolve(lesson.status())
            } catch {
                LessonPlayer.reject(call, error)
            }
        }
    }

    @objc func lessonStop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            lesson.stop()
            call.resolve(lesson.status())
        }
    }

    @objc func lessonStatus(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(LessonPlayer.shared.status())
        }
    }

    @objc func lessonMeta(_ call: CAPPluginCall) {
        let file = call.getString("file")
        let meta = LessonPlayer.parseMeta(sections: call.getArray("sections"), resume: call.getArray("resume"))
        DispatchQueue.main.async {
            let lesson = LessonPlayer.shared
            lesson.setMeta(meta, for: file)
            call.resolve(lesson.status())
        }
    }

    @objc func lessonJournal(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            var out: [String: Any] = [:]
            if let j = LessonPlayer.journal() { out["journal"] = j }
            call.resolve(out)
        }
    }

    @objc func lessonJournalClear(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            LessonPlayer.shared.forgetJournal()
            call.resolve()
        }
    }

    @objc func consumeOpen(_ call: CAPPluginCall) {
        let d = UserDefaults.standard
        let t = d.double(forKey: Self.openedKey)
        d.removeObject(forKey: Self.openedKey)
        var out: [String: Any] = [:]
        if t > 0 { out["openedAt"] = t }
        call.resolve(out)
    }

    /// Kayıtlı alarmı iptal eder; bir şey iptal edildiyse true
    @discardableResult
    static func cancelStored() -> Bool {
        guard let s = UserDefaults.standard.string(forKey: idKey) else { return false }
        UserDefaults.standard.removeObject(forKey: idKey)
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *), let id = UUID(uuidString: s) {
            do { try AlarmManager.shared.cancel(id: id); return true } catch { return false }
        }
        #endif
        return false
    }

    #if canImport(AlarmKit)
    /// JS Date.getDay(): 0 = Pazar … 6 = Cumartesi
    @available(iOS 26.0, *)
    static func weekday(_ d: Int) -> Locale.Weekday {
        switch d {
        case 0: return .sunday
        case 1: return .monday
        case 2: return .tuesday
        case 3: return .wednesday
        case 4: return .thursday
        case 5: return .friday
        default: return .saturday
        }
    }

    @available(iOS 26.0, *)
    static func authName(_ s: AlarmManager.AuthorizationState) -> String {
        switch s {
        case .authorized: return "authorized"
        case .denied: return "denied"
        case .notDetermined: return "notDetermined"
        @unknown default: return "unknown"
        }
    }
    #endif
}

/// Yoga ders oynatıcısı (PLAN.v3 §D.3; modul.md §4 "ses asla kesilmez"). pbxproj'a dokunmamak için bu dosyada.
/// Uyku sesinin kalıbı (AVAudioPlayer, kesinti gözlemcisi) ama oturum bayrağı ayrı: AppAudioSession.beginLesson /
/// endLesson (FeedbackPlugin.swift). Her yöntem ana kuyrukta çağrılır (AlarmPlugin köprüsü, gözlemciler, zamanlayıcı).
/// Kasıtlı olarak NSObject ve AVAudioPlayerDelegate yok (o protokol SDK'da @MainActor; eşzamanlılık denetimine
/// girmesin): dosyanın bittiği 0,25 sn'lik tikle anlaşılır.
/// - Dosya: paketteki public/yoga/ altında düz ad ("yoga/ders2-15.mp3"); başka yol kabul edilmez (MISSING).
/// - Başa oturan dosya kendi girişiyle tam sesle başlar; ortasından başlayan 1 sn'de açılır.
/// - Duraklat 1 sn'de söner. Sürdür 1 sn'de açılır: `at` verilmezse o anki klibin başından (`resume` aralıkları:
///   [{ from, to, at }], JS timeline.js resumePoint ile üretir), aralık yoksa kaldığı yerden.
/// - lessonCrossTo 2 sn, lessonSeek 1 sn: iki oynatıcı arasında çapraz geçiş. X (lessonStop) 2 sn'de söner.
/// - next { file, at }: bu dosyanın bitmesine 2 sn kala ona geçilir (ilk ders girişi, "Kaldığın yerden" açılış izni);
///   giriş dosyası dinlenen süreye sayılmaz (status.prelude).
/// - tail { file, seconds, fade }: uyku dersinde dosya bitince müzik kuyruğu: döngü, 2 sn'de açılır, son `fade` sn'de
///   kısılır, sonra tamamen durur; uyandırma yok; dinlenen süreye sayılmaz.
/// - Gözlemciler: kesinti (arama, Siri: duraklar; iOS "sürdür" derse klip başından sürer; müzik kuyruğunda müzik
///   biter), rota (kulaklık ya da AirPods çıkınca hemen duraklar; müzik kuyruğunda müzik biter), medya hizmetlerinin
///   sıfırlanması (oynatıcı aynı konumdan yeniden kurulur ve duraklatılmış kalır: Apple, kişi başlatmadan çalmanın
///   yeniden başlatılmamasını söyler). Okuma testi kayda başlarken çalan ders hemen duraklar (yieldToRecording).
/// - Now Playing: ders adı, bölüm adı (sections: [{ at, name }]), geçen ve toplam süre. Uzaktan komut yalnız oynat,
///   duraklat ve oynat/duraklat (kulaklık düğmesi); öteki komutlar ders süresince kapatılır (isEnabled = false).
/// - Duraklatılmış ders kapanınca (X, uyku sesi) bitiş anı duraklatma anıdır (pausedAt): kayıt dinlenen güne yazılır.
/// - Dinlenen saniye UserDefaults'a da yazılır (journalKey; çalarken 2 sn'de bir, her durum değişiminde): uygulama
///   arka planda kapanırsa JS açılışta lessonJournal() ile kaydı uzlaştırır; "Tüm verileri sil" lessonJournalClear().
/// status() → { state, playing, time, duration?, route, listened, file?, reason?, pausedAt?, prelude?, ended?, tailLeft? }
///   state: idle | playing | paused | stopping | tail | finished; reason (duraklatılmışken): user | remote |
///   interruption | route | reset | stalled | error | recording; pausedAt (duraklatılmışken): duraklatma anı, Unix sn.
/// Bu ortamda derlenmedi ve cihazda denenmedi. VARSAYIM: AVAudioPlayer'ın konuma oturma kesinliği; arka planda çalan
/// uygulamada ana kuyruk zamanlayıcısının sürmesi; uzaktan komutun ana iş parçacığında gelmesi (gelmezse ana kuyruğa aktarılır).
final class LessonPlayer {
    static let shared = LessonPlayer()
    static let journalKey = "nefona.lesson.journal"
    static let fadeSeconds: TimeInterval = 1 // duraklat / sürdür
    static let seekSeconds: TimeInterval = 1 // sarma, bölüme atlama
    static let crossSeconds: TimeInterval = 2 // lessonCrossTo, next, X
    static let tickSeconds: TimeInterval = 0.25

    enum Failure: Error { case busy, idle, play, missing(String) }
    enum State: String { case idle, playing, paused, stopping, tail, finished }

    struct Meta {
        var sections: [(at: Double, name: String)] = []
        var resume: [(from: Double, to: Double, at: Double)] = []
    }
    struct Next { let file: String; let url: URL; let at: Double }
    struct Tail { let file: String; let url: URL; let seconds: Double; let fade: Double }

    private(set) var state: State = .idle
    private var reason: String?
    private var main: AVAudioPlayer?
    private var outgoing: AVAudioPlayer? // çapraz geçişte sönen oynatıcı
    private var tailPlayer: AVAudioPlayer?
    private var file: String?
    private var url: URL?
    private var title = ""
    private var id: String?
    private var journalOn = true
    private var meta: [String: Meta] = [:] // dosya adına göre bölümler ve sürdürme aralıkları
    private var next: Next?
    private var tail: Tail?
    private var prelude = false // giriş dosyası çalıyor (next bekliyor)
    private var finishedFile = false // ders dosyası sonuna kadar çaldı
    private var lastTime: Double = 0 // son bilinen konum (sn)
    private var duration: Double = 0
    private var maxTime: Double = 0
    private var listened: Double = 0 // gerçekten çalan süre (sn); duraklama, giriş ve müzik kuyruğu hariç
    private var startedAt = Date()
    private var endedAt: Date?
    private var pausedAt: Date? // duraklatma anı (dinlemenin bittiği an): duraklatılmış ders kapanınca bitiş anı bu olur
    private var lastTick = Date()
    private var lastSave = Date.distantPast
    private var sectionName: String?
    // Bekleyen işler: tikte yapılır (tek zamanlayıcı; iptal gerekmez, alan nil'lenir)
    private var pauseAt: Date?
    private var outgoingStopAt: Date?
    private var stopAt: Date?
    private var tailStartedAt: Date?
    private var tailFadeAt: Date?
    private var tailEndAt: Date?
    private var timer: DispatchSourceTimer?
    private var observers: [NSObjectProtocol] = []
    private var remoteTargets: [(MPRemoteCommand, Any)] = []
    private var disabledCommands: [(MPRemoteCommand, Bool)] = [] // ders süresince kapatılan komutlar ve eski değerleri

    private init() {}

    // MARK: Köprü girdileri (JS sayısı NSNumber gelir)

    static func number(_ v: Any?) -> Double? {
        let d: Double
        if let n = v as? NSNumber {
            d = n.doubleValue
        } else if let x = v as? Double {
            d = x
        } else if let i = v as? Int {
            d = Double(i)
        } else {
            return nil
        }
        return d.isFinite ? d : nil
    }

    /// Paketteki public/yoga/ altındaki düz dosya adı ("yoga/ders2-15.mp3"); başka her yol nil.
    static func bundleURL(_ file: String) -> URL? {
        let parts = file.split(separator: "/", omittingEmptySubsequences: false)
        guard parts.count == 2, parts[0] == "yoga" else { return nil }
        let name = String(parts[1])
        guard !name.hasPrefix("."), name.range(of: "^[A-Za-z0-9._-]+$", options: .regularExpression) != nil else { return nil }
        let base = (name as NSString).deletingPathExtension
        let ext = (name as NSString).pathExtension
        return Bundle.main.url(forResource: base, withExtension: ext.isEmpty ? nil : ext, subdirectory: "public/yoga")
    }

    static func parseMeta(sections: JSArray?, resume: JSArray?) -> Meta? {
        var m = Meta()
        for v in sections ?? [] {
            guard let o = v as? JSObject, let at = number(o["at"]), let name = o["name"] as? String, !name.isEmpty else { continue }
            m.sections.append((at: at, name: name))
        }
        m.sections.sort { $0.at < $1.at }
        for v in resume ?? [] {
            guard let o = v as? JSObject, let from = number(o["from"]), let to = number(o["to"]),
                  let at = number(o["at"]), to > from else { continue }
            m.resume.append((from: from, to: to, at: at))
        }
        return m.sections.isEmpty && m.resume.isEmpty ? nil : m
    }

    static func parseNext(_ o: JSObject?) throws -> Next? {
        guard let o else { return nil }
        let f = (o["file"] as? String) ?? ""
        guard let u = bundleURL(f) else { throw Failure.missing(f) }
        return Next(file: f, url: u, at: number(o["at"]) ?? 0)
    }

    /// Uyku sesiyle aynı kalıp: son `fade` sn'de kısılır (varsayılan 180 sn, en çok sürenin yarısı; AlarmPlugin.sleepStart)
    static func parseTail(_ o: JSObject?) throws -> Tail? {
        guard let o, let seconds = number(o["seconds"]), seconds >= 1 else { return nil }
        let f = (o["file"] as? String) ?? ""
        guard let u = bundleURL(f) else { throw Failure.missing(f) }
        let fade = max(1, min(number(o["fade"]) ?? 180, seconds / 2))
        return Tail(file: f, url: u, seconds: seconds, fade: fade)
    }

    static func reject(_ call: CAPPluginCall, _ error: Error) {
        guard let f = error as? Failure else {
            call.reject("Çalınamadı: \(error)", "PLAY")
            return
        }
        switch f {
        case .busy: call.reject("Ses kaydı sürüyor", "BUSY")
        case .idle: call.reject("Çalan ders yok", "IDLE")
        case .play: call.reject("Çalınamadı", "PLAY")
        case .missing(let name): call.reject("Dosya pakette yok: \(name)", "MISSING")
        }
    }

    static func journal() -> [String: Any]? {
        return UserDefaults.standard.dictionary(forKey: journalKey)
    }

    static func routeName() -> String {
        return AVAudioSession.sharedInstance().currentRoute.outputs.map { $0.portType.rawValue }.joined(separator: ",")
    }

    private static func makePlayer(_ u: URL) throws -> AVAudioPlayer {
        let p = try AVAudioPlayer(contentsOf: u)
        p.numberOfLoops = 0
        p.prepareToPlay()
        return p
    }

    private static func clamp(_ t: Double, _ d: Double) -> Double {
        return max(0, min(t, max(0, d - 0.25)))
    }

    // MARK: Köprü yöntemleri (ana kuyrukta)

    func start(file f: String, url u: URL, at: Double, title t: String, id i: String?, journal: Bool,
               meta m: Meta?, next n: Next?, tail tl: Tail?) throws {
        dropPlayers() // önceki ders (varsa) susar; oturum bayrağı yerinde kalır
        do {
            guard try AppAudioSession.shared.beginLesson() else { throw Failure.busy }
            let p = try Self.makePlayer(u)
            let from = Self.clamp(at, p.duration)
            p.currentTime = from
            p.volume = from > 0.05 ? 0 : 1
            guard p.play() else { throw Failure.play }
            if from > 0.05 { p.setVolume(1, fadeDuration: Self.fadeSeconds) }
            main = p
        } catch {
            closeSession(finished: false)
            throw error
        }
        file = f
        url = u
        title = t
        id = i
        journalOn = journal
        if let m { meta[f] = m }
        next = n
        tail = tl
        prelude = n != nil
        finishedFile = false
        state = .playing
        reason = nil
        duration = main?.duration ?? 0
        lastTime = main?.currentTime ?? 0
        maxTime = prelude ? 0 : lastTime
        listened = 0
        startedAt = Date()
        endedAt = nil
        pausedAt = nil
        lastTick = Date()
        lastSave = .distantPast
        sectionName = section(at: lastTime)
        installObservers()
        installRemote()
        startTimer()
        updateNowPlaying()
        save(force: true)
    }

    func pause(reason r: String) {
        guard state == .playing else { return }
        outgoing?.setVolume(0, fadeDuration: Self.fadeSeconds) // geçiş sürüyorsa o da söner (kesilmez)
        if let p = main {
            lastTime = p.currentTime
            p.setVolume(0, fadeDuration: Self.fadeSeconds)
            pauseAt = Date().addingTimeInterval(Self.fadeSeconds)
        }
        state = .paused
        reason = r
        pausedAt = Date()
        updateNowPlaying()
        save(force: true)
    }

    func resume(at: Double?) throws {
        switch state {
        case .playing:
            if let at { try seek(to: at) }
            return
        case .paused:
            break
        case .tail:
            return
        default:
            throw Failure.idle
        }
        // Kesintiden sonra oturum etkin olmayabilir: yeniden etkinleştir (kayıt sürüyorsa başlamaz)
        guard try AppAudioSession.shared.beginLesson() else { throw Failure.busy }
        let rebuilt = main == nil // medya hizmetleri sıfırlandı ve kurulamadıysa şimdi kur
        if rebuilt, let u = url { main = try Self.makePlayer(u) }
        guard let p = main else { throw Failure.play }
        if rebuilt { duration = p.duration }
        pauseAt = nil
        let here = rebuilt ? lastTime : p.currentTime
        p.volume = 0
        p.currentTime = Self.clamp(at ?? resumePoint(here), p.duration)
        guard p.play() else { throw Failure.play }
        p.setVolume(1, fadeDuration: Self.fadeSeconds)
        state = .playing
        reason = nil
        pausedAt = nil
        lastTime = p.currentTime
        lastTick = Date()
        sectionName = section(at: lastTime)
        updateNowPlaying()
        save(force: true)
    }

    func seek(to at: Double) throws {
        switch state {
        case .playing:
            guard let f = file, let u = url else { throw Failure.idle }
            try crossfade(file: f, url: u, at: at, seconds: Self.seekSeconds)
        case .paused:
            if main == nil, let u = url {
                let p = try Self.makePlayer(u)
                duration = p.duration
                main = p
            }
            guard let p = main else { throw Failure.play }
            if pauseAt != nil {
                pauseAt = nil
                p.pause()
            }
            p.currentTime = Self.clamp(at, p.duration)
            lastTime = p.currentTime
            sectionName = section(at: lastTime)
            updateNowPlaying()
            save(force: true)
        default:
            throw Failure.idle
        }
    }

    /// file/url nil: çalan dosya. Duraklatılmışken yeni yerden 1 sn'de açılır (JS o durumda lessonResume çağırır).
    func cross(file newFile: String?, url newURL: URL?, at: Double) throws {
        guard let f = newFile ?? file, let u = newURL ?? url else { throw Failure.idle }
        switch state {
        case .playing:
            try crossfade(file: f, url: u, at: at, seconds: Self.crossSeconds)
        case .paused:
            if f != file {
                finishCrossfade()
                pauseAt = nil
                main?.stop()
                main = nil
                file = f
                url = u
                next = nil
                prelude = false
                maxTime = 0
            }
            try resume(at: at)
        default:
            throw Failure.idle
        }
    }

    /// X: onaysız; 2 sn'de söner, sonra oturum bırakılır. Duraklatılmışsa hemen.
    func stop() {
        if ranOut { fileEnded() } // dosya zaten bitmişti (tik görmeden): önce bitiş olarak işlenir
        switch state {
        case .idle, .stopping:
            return
        case .finished:
            state = .idle
            reason = nil
        case .paused:
            if let p = main { lastTime = p.currentTime }
            // Dinleme duraklatınca bitti: saatler sonra kapatılsa da (X, uyku sesi) kayıt dinlenen güne yazılır
            endedAt = pausedAt ?? Date()
            closeSession(finished: false)
        case .playing, .tail:
            outgoing?.setVolume(0, fadeDuration: Self.crossSeconds) // geçiş sürüyorsa o da söner; kapanışta durur
            outgoingStopAt = nil
            pauseAt = nil
            if state == .playing {
                if let p = main { lastTime = p.currentTime }
                endedAt = Date()
            }
            main?.setVolume(0, fadeDuration: Self.crossSeconds)
            tailPlayer?.setVolume(0, fadeDuration: Self.crossSeconds)
            tailFadeAt = nil
            tailEndAt = nil
            state = .stopping
            stopAt = Date().addingTimeInterval(Self.crossSeconds)
            updateNowPlaying()
            save(force: true)
        }
    }

    /// SpeechPlugin.start (okuma testi) için, kayıt oturumu açılmadan önce: çalan ders hemen duraklar (kesintideki gibi;
    /// ders sesi mikrofona girmesin ve kayıt oturumunda hoparlörden çalmasın), müzik kuyruğu biter, sönmekte olan ders
    /// kapanır. Duraklatılmış ders olduğu gibi kalır. Ana kuyrukta çalışır (SpeechPlugin köprü kuyruğundan çağırır).
    static func yieldToRecording() {
        if Thread.isMainThread {
            shared.yieldToRecordingOnMain()
        } else {
            DispatchQueue.main.sync { shared.yieldToRecordingOnMain() }
        }
    }

    private func yieldToRecordingOnMain() {
        if ranOut { fileEnded() } // dosya zaten bitmişti (tik görmeden): önce bitiş olarak işlenir
        switch state {
        case .playing:
            halt(reason: "recording")
        case .tail:
            closeSession(finished: true)
        case .stopping:
            closeSession(finished: false)
        default:
            break
        }
    }

    /// sleepStart için: ders sesi çalıyor mu (ders ya da müzik kuyruğu)? Duraklatılmış ders sessizdir ve kişi uyku sesini
    /// kendisi istemiştir: ders kapatılır (bitiş anı olarak duraklatma anı ve dinlenen süre yerel kayda yazılır; JS kaydı
    /// oynatıcıya dönünce ya da açılışta yazar) ve uyku sesine yer açılır. Öğleden kalma duraklatılmış bir ders gece uyku
    /// sesini engellemez; "Önce çalan dersi durdur." yalnız gerçekten çalan derste görünür. X ile sönmekte olan ders
    /// beklemeden kapanır.
    func holdsAudio() -> Bool {
        switch state {
        case .stopping:
            closeSession(finished: false)
            return false
        case .paused:
            stop() // duraklatılmışken hemen kapanır (endedAt yazılır, closeSession)
            return false
        case .playing, .tail:
            return true
        default:
            return false
        }
    }

    func setMeta(_ m: Meta?, for f: String?) {
        guard let key = f ?? file else { return }
        meta[key] = m
        if key == file {
            sectionName = section(at: main?.currentTime ?? lastTime)
            updateNowPlaying()
        }
    }

    /// "Tüm verileri sil": yerel kayıt silinir; çalan dersin kaydı da artık yazılmaz.
    func forgetJournal() {
        journalOn = false
        UserDefaults.standard.removeObject(forKey: Self.journalKey)
    }

    func status() -> [String: Any] {
        var out: [String: Any] = [
            "state": state.rawValue,
            "playing": state == .playing && (main?.isPlaying ?? false),
            "route": Self.routeName(),
            "listened": listened,
        ]
        if let f = file, state != .idle { out["file"] = f }
        if let r = reason, state == .paused { out["reason"] = r }
        if let p = pausedAt, state == .paused { out["pausedAt"] = p.timeIntervalSince1970 }
        switch state {
        case .idle:
            out["time"] = 0
        case .finished, .tail:
            out["time"] = duration
            out["duration"] = duration
            out["ended"] = true
            if state == .tail, let tl = tail, let started = tailStartedAt {
                out["tailLeft"] = max(0, tl.seconds - Date().timeIntervalSince(started))
            }
        case .stopping:
            out["time"] = lastTime
            out["duration"] = duration
        case .playing, .paused:
            // Dosya bitti ama tik henüz görmedi: sona oturt (AVAudioPlayer bitince konumu başa alabilir)
            out["time"] = ranOut ? duration : (main?.currentTime ?? lastTime)
            out["duration"] = duration
            if prelude { out["prelude"] = true }
        }
        return out
    }

    // MARK: İç işler

    /// Çalıyor sayılan dosya kendiliğinden durdu ve sona yakındı: bitti (tik en çok 0,25 sn sonra görür)
    private var ranOut: Bool {
        guard state == .playing, let p = main else { return false }
        return !p.isPlaying && lastTime >= p.duration - 1.5
    }

    private func crossfade(file f: String, url u: URL, at: Double, seconds: TimeInterval) throws {
        finishCrossfade()
        let b = try Self.makePlayer(u)
        b.volume = 0
        b.currentTime = Self.clamp(at, b.duration)
        guard b.play() else { throw Failure.play }
        b.setVolume(1, fadeDuration: seconds)
        if let a = main {
            a.setVolume(0, fadeDuration: seconds)
            outgoing = a
            outgoingStopAt = Date().addingTimeInterval(seconds + 0.1)
        }
        main = b
        if f != file {
            file = f
            url = u
            duration = b.duration
            next = nil
            prelude = false
            maxTime = b.currentTime
        }
        lastTime = b.currentTime
        sectionName = section(at: lastTime)
        updateNowPlaying()
        save(force: true)
    }

    private func finishCrossfade() {
        outgoing?.stop()
        outgoing = nil
        outgoingStopAt = nil
    }

    /// Hemen duraklat (rota, kesinti, sistem durdurdu, kayıt başlıyor): sönme yok.
    private func halt(reason r: String) {
        if state != .paused || pausedAt == nil { pausedAt = Date() }
        finishCrossfade()
        pauseAt = nil
        if let p = main {
            p.pause()
            lastTime = p.currentTime
        }
        state = .paused
        reason = r
        updateNowPlaying()
        save(force: true)
    }

    private func onTick() {
        let now = Date()
        let dt = min(max(0, now.timeIntervalSince(lastTick)), 1)
        lastTick = now
        if let t = outgoingStopAt, now >= t { finishCrossfade() }
        if let t = pauseAt, now >= t {
            pauseAt = nil
            finishCrossfade()
            if let p = main {
                // Dosya 1 sn'lik sönme sırasında bittiyse bitiş sayılır (konum başa dönmüş olabilir; sürdür baştan başlatmasın)
                if !p.isPlaying && lastTime >= p.duration - Self.fadeSeconds - 1.5 {
                    fileEnded()
                    return
                }
                p.pause()
                lastTime = p.currentTime
            }
            updateNowPlaying()
            save(force: true)
        }
        if let t = stopAt, now >= t {
            closeSession(finished: false)
            return
        }
        if state == .tail {
            if let t = tailFadeAt, now >= t, let tl = tail {
                tailFadeAt = nil
                tailPlayer?.setVolume(0, fadeDuration: tl.fade)
            }
            if let t = tailEndAt, now >= t { closeSession(finished: true) }
            return
        }
        guard state == .playing, let p = main else { return }
        if p.isPlaying {
            if !prelude {
                listened += dt
                maxTime = max(maxTime, p.currentTime)
            }
            lastTime = p.currentTime
            if let n = next, p.duration - p.currentTime <= Self.crossSeconds {
                next = nil
                do {
                    try crossfade(file: n.file, url: n.url, at: n.at, seconds: Self.crossSeconds)
                } catch {
                    halt(reason: "error") // ders dosyası açılamadı: giriş susar, "Sürdür" görünür
                }
                return
            }
            let name = section(at: lastTime)
            if name != sectionName {
                sectionName = name
                updateNowPlaying()
            }
            save(force: false)
        } else if lastTime >= p.duration - 1.5 {
            fileEnded()
        } else {
            // Sistem durdurdu (kesinti bildirimi henüz gelmedi ya da çözme hatası): duraklatılmış say, "Sürdür" görünsün
            halt(reason: "stalled")
        }
    }

    /// Dosya sonuna kadar çaldı (kaydın anı). Uyku dersinde müzik kuyruğu başlar; yoksa oturum bırakılır.
    private func fileEnded() {
        finishCrossfade()
        main?.stop()
        main = nil
        lastTime = duration
        if !prelude {
            maxTime = duration
            finishedFile = true
        }
        endedAt = Date()
        if let tl = tail, let tp = try? Self.makePlayer(tl.url) {
            tp.numberOfLoops = -1
            tp.volume = 0
            if tp.play() {
                tp.setVolume(1, fadeDuration: Self.crossSeconds)
                tailPlayer = tp
                let now = Date()
                tailStartedAt = now
                tailFadeAt = now.addingTimeInterval(max(0, tl.seconds - tl.fade))
                tailEndAt = now.addingTimeInterval(tl.seconds + 1)
                state = .tail
                updateNowPlaying()
                save(force: true)
                return
            }
        }
        closeSession(finished: true)
    }

    private func dropPlayers() {
        main?.stop()
        outgoing?.stop()
        tailPlayer?.stop()
        main = nil
        outgoing = nil
        tailPlayer = nil
        pauseAt = nil
        outgoingStopAt = nil
        stopAt = nil
        tailStartedAt = nil
        tailFadeAt = nil
        tailEndAt = nil
        next = nil
        tail = nil
        prelude = false
    }

    /// Her şeyi kapatır: oynatıcılar, zamanlayıcı, gözlemciler, uzaktan komut, Now Playing; en son oturum bırakılır
    /// (çalan oynatıcı varken oturum kapatılmaz).
    private func closeSession(finished: Bool) {
        stopTimer()
        dropPlayers()
        for o in observers { NotificationCenter.default.removeObserver(o) }
        observers = []
        removeRemote()
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        state = finished ? .finished : .idle
        reason = nil
        save(force: true)
        AppAudioSession.shared.endLesson()
    }

    private func section(at t: Double) -> String? {
        guard let f = file, let list = meta[f]?.sections, let first = list.first else { return nil }
        return list.last(where: { $0.at <= t + 0.05 })?.name ?? first.name
    }

    private func resumePoint(_ t: Double) -> Double {
        guard let f = file, let spans = meta[f]?.resume else { return t }
        return spans.first(where: { t >= $0.from && t < $0.to })?.at ?? t
    }

    // MARK: Gözlemciler

    private func installObservers() {
        guard observers.isEmpty else { return }
        let nc = NotificationCenter.default
        observers = [
            nc.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
                self?.interrupted(note)
            },
            nc.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { [weak self] note in
                self?.routeChanged(note)
            },
            nc.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: nil, queue: .main) { [weak self] _ in
                self?.mediaServicesReset()
            },
        ]
    }

    /// Arama, Siri, başka uygulama: sistem sesi durdurur. Bitince iOS "sürdür" derse klip başından 1 sn'de açılır.
    private func interrupted(_ note: Notification) {
        guard let info = note.userInfo, let raw = info[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
        if type == .began {
            switch state {
            case .playing:
                halt(reason: "interruption")
            case .paused:
                if reason == "stalled" {
                    reason = "interruption" // tik bildirimden önce görmüştü
                    save(force: true)
                }
            case .stopping:
                closeSession(finished: false)
            case .tail:
                // Müzik kuyruğu: sistem sesi susturdu. Kuyruk "tamamen durur" (modul.md §4): kapanır; kilit ekranında
                // çalıyormuş gibi görünen bir Now Playing ya da açık kalan oturum bırakılmaz. Ders zaten bitmişti.
                closeSession(finished: true)
            default:
                break
            }
            return
        }
        guard type == .ended else { return }
        let optRaw = (info[AVAudioSessionInterruptionOptionKey] as? UInt) ?? 0
        guard AVAudioSession.InterruptionOptions(rawValue: optRaw).contains(.shouldResume) else { return }
        if state == .paused && reason == "interruption" {
            try? resume(at: nil)
        }
    }

    /// Kulaklık ya da AirPods çıktı: ses hoparlöre geçmesin, hemen duraklar (Apple: "Responding to audio route
    /// changes"). Yeni çıkış takılınca duraklatılmaz; AVAudioPlayer yeni rotada sürer.
    private func routeChanged(_ note: Notification) {
        guard let raw = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              AVAudioSession.RouteChangeReason(rawValue: raw) == .oldDeviceUnavailable else { return }
        switch state {
        case .playing:
            halt(reason: "route")
        case .paused:
            if pauseAt != nil { // 1 sn'lik sönme hoparlörde sürmesin
                pauseAt = nil
                main?.pause()
            }
        case .tail:
            closeSession(finished: true) // uyku müziği hoparlörden sürmesin
        case .stopping:
            closeSession(finished: false)
        default:
            break
        }
    }

    private func mediaServicesReset() {
        switch state {
        case .playing, .paused:
            // Eski nesneler geçersiz: bırakılır. Oturum yeniden kurulur; oynatıcı aynı konumdan duraklatılmış kurulur.
            // Kurulamazsa oynatıcısız duraklatılmış kalır; "Sürdür" (resume) yeniden kurmayı dener.
            outgoing = nil
            outgoingStopAt = nil
            pauseAt = nil
            main = nil
            if state == .playing || pausedAt == nil { pausedAt = Date() }
            _ = try? AppAudioSession.shared.beginLesson()
            if let u = url, let p = try? Self.makePlayer(u) {
                p.currentTime = Self.clamp(lastTime, p.duration)
                main = p
            }
            state = .paused
            reason = "reset"
            updateNowPlaying()
            save(force: true)
        case .tail, .stopping:
            let ended = state == .tail
            outgoing = nil
            main = nil
            tailPlayer = nil
            closeSession(finished: ended)
        default:
            break
        }
    }

    // MARK: Uzaktan komut ve Now Playing

    private func installRemote() {
        guard remoteTargets.isEmpty else { return }
        let c = MPRemoteCommandCenter.shared()
        let playToken = c.playCommand.addTarget { [weak self] _ in self?.remote(play: true) ?? .noActionableNowPlayingItem }
        let pauseToken = c.pauseCommand.addTarget { [weak self] _ in self?.remote(play: false) ?? .noActionableNowPlayingItem }
        let toggleToken = c.togglePlayPauseCommand.addTarget { [weak self] _ in self?.remote(play: nil) ?? .noActionableNowPlayingItem }
        remoteTargets = [(c.playCommand, playToken), (c.pauseCommand, pauseToken), (c.togglePlayPauseCommand, toggleToken)]
        // Kilit ekranında yalnız oynat/duraklat (modul.md §2.6: başka düğme eklenmez). Apple (MPRemoteCommand): istenmeyen
        // komut açıkça kapatılmazsa (isEnabled varsayılanı true) sistem onun arayüzünü gösterebilir. Ders bitince
        // removeRemote eski değerlere döndürür.
        let unwanted: [MPRemoteCommand] = [
            c.nextTrackCommand, c.previousTrackCommand, c.skipForwardCommand, c.skipBackwardCommand,
            c.seekForwardCommand, c.seekBackwardCommand, c.changePlaybackPositionCommand,
        ]
        disabledCommands = unwanted.map { ($0, $0.isEnabled) }
        for command in unwanted { command.isEnabled = false }
    }

    private func removeRemote() {
        for (command, target) in remoteTargets { command.removeTarget(target) }
        remoteTargets = []
        for (command, was) in disabledCommands { command.isEnabled = was }
        disabledCommands = []
    }

    /// Kilit ekranı, Denetim Merkezi, kulaklık düğmesi. play nil: oynat/duraklat. Müzik kuyruğunda duraklat = sustur.
    private func remote(play: Bool?) -> MPRemoteCommandHandlerStatus {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in _ = self?.remote(play: play) }
            return .success
        }
        switch state {
        case .playing:
            if play != true { pause(reason: "remote") }
            return .success
        case .paused:
            if play == false { return .success }
            do {
                try resume(at: nil)
            } catch {
                return .commandFailed
            }
            return .success
        case .tail:
            if play != true { stop() }
            return .success
        default:
            return .noActionableNowPlayingItem
        }
    }

    /// Kilit ekranı: ders adı, bölüm adı, geçen ve toplam süre (modul.md §2.6). Geçen süreyi sistem hızdan sürdürür.
    private func updateNowPlaying() {
        guard state != .idle && state != .finished else { return }
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: title.isEmpty ? "Yoga" : title,
            MPMediaItemPropertyAlbumTitle: "Nefona",
        ]
        if state == .tail, let tl = tail, let started = tailStartedAt {
            info[MPMediaItemPropertyArtist] = "Müzik"
            info[MPMediaItemPropertyPlaybackDuration] = tl.seconds
            info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = min(tl.seconds, Date().timeIntervalSince(started))
            info[MPNowPlayingInfoPropertyPlaybackRate] = 1.0
        } else {
            info[MPMediaItemPropertyArtist] = sectionName ?? "Yoga"
            info[MPMediaItemPropertyPlaybackDuration] = duration
            info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = main?.currentTime ?? lastTime
            info[MPNowPlayingInfoPropertyPlaybackRate] = state == .playing ? 1.0 : 0.0
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }

    // MARK: Zamanlayıcı ve yerel kayıt

    private func startTimer() {
        guard timer == nil else { return }
        let t = DispatchSource.makeTimerSource(queue: .main)
        t.schedule(deadline: .now() + Self.tickSeconds, repeating: Self.tickSeconds, leeway: .milliseconds(50))
        t.setEventHandler { [weak self] in self?.onTick() }
        t.resume()
        timer = t
    }

    private func stopTimer() {
        timer?.cancel()
        timer = nil
    }

    /// Dinlenen saniye yerelde (uygulama arka planda kapanırsa JS açılışta uzlaştırır; kaydın tarihi endedAt,
    /// yoksa updatedAt). Zamanlar Unix saniyesi.
    private func save(force: Bool) {
        guard journalOn, let f = file else { return }
        let now = Date()
        if !force && now.timeIntervalSince(lastSave) < 2 { return }
        lastSave = now
        let st: String
        switch state {
        case .stopping, .idle: st = "stopped"
        default: st = state.rawValue
        }
        var j: [String: Any] = [
            "file": f,
            "title": title,
            "state": st,
            "finished": finishedFile,
            "prelude": prelude,
            "startedAt": startedAt.timeIntervalSince1970,
            "updatedAt": now.timeIntervalSince1970,
            "listened": listened,
            "time": lastTime,
            "maxTime": maxTime,
            "duration": duration,
        ]
        if let id { j["id"] = id }
        if let e = endedAt { j["endedAt"] = e.timeIntervalSince1970 }
        if let p = pausedAt, state == .paused { j["pausedAt"] = p.timeIntervalSince1970 }
        UserDefaults.standard.set(j, forKey: Self.journalKey)
    }
}

#if canImport(AlarmKit)
/// Alarm ekranına ek veri yok (AlarmMetadata boş olabilir; Apple belgesi).
@available(iOS 26.0, *)
struct NefonaAlarmMeta: AlarmMetadata {}

/// Alarmın ikinci düğmesi "Nefona'yı aç": uygulamayı açar ve dokunulduğu anı yazar (uyanma işareti;
/// JS consumeOpen ile okur). VARSAYIM: openAppWhenRun ile perform uygulama sürecinde çalışır; JS ayrıca alarm
/// saatinden sonraki ilk açılışı da uyanma işareti sayar (lib/alarm.js).
@available(iOS 26.0, *)
struct OpenNefonaIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Nefona'yı aç"
    static let openAppWhenRun: Bool = true
    init() {}
    func perform() async throws -> some IntentResult {
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: AlarmPlugin.openedKey)
        return .result()
    }
}
#endif
