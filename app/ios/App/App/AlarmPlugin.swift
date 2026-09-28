import Foundation
import AVFoundation
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
        CAPPluginMethod(name: "preview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "consumeOpen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sleepStart", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sleepStop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sleepStatus", returnType: CAPPluginReturnPromise)
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
            self.stopSleepOnMain()
            do {
                // Sessiz tuşunda ve kilitli ekranda da çalsın; kullanıcının "ses kapalı" (ambient) tercihinden bağımsız
                let session = AVAudioSession.sharedInstance()
                try session.setCategory(.playback, mode: .default, options: [])
                try session.setActive(true)
                let p = try AVAudioPlayer(contentsOf: url)
                p.numberOfLoops = -1
                p.volume = 1
                p.prepareToPlay()
                guard p.play() else {
                    AppAudioSession.shared.restorePreferred()
                    call.reject("Çalınamadı", "PLAY")
                    return
                }
                self.sleepPlayer = p
                let f = DispatchWorkItem { [weak self] in self?.sleepPlayer?.setVolume(0, fadeDuration: fade) }
                let e = DispatchWorkItem { [weak self] in self?.stopSleepOnMain() }
                self.sleepFade = f
                self.sleepEnd = e
                DispatchQueue.main.asyncAfter(deadline: .now() + max(0, seconds - fade), execute: f)
                DispatchQueue.main.asyncAfter(deadline: .now() + seconds + 1, execute: e)
                call.resolve(Self.audioInfo(p))
            } catch {
                AppAudioSession.shared.restorePreferred()
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
        guard let p = sleepPlayer else { return }
        p.stop()
        sleepPlayer = nil
        AppAudioSession.shared.restorePreferred()
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
