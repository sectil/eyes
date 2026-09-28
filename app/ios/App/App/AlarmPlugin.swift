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
/// - schedule({ hour, minute, weekdays: [0..6] (0 = Pazar, JS Date.getDay), sound? }) → { id }
///   weekdays boşsa tek sefer: bir sonraki hour:minute.
/// - cancel() → { cancelled }
/// - current() → { id?, scheduled } (iOS'ta hâlâ kurulu mu; çalıp kapanan alarm iOS'ta silinir)
/// - preview({ file }) / stopPreview(): paketteki sesi uygulamanın içinde çalar (alarm kurmadan)
/// - consumeOpen() → { openedAt? } alarmdaki "Nefona'yı aç"a dokunulduğu an (sn), okununca silinir
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
        CAPPluginMethod(name: "consumeOpen", returnType: CAPPluginReturnPromise)
    ]

    static let idKey = "nefona.alarm.id"
    static let openedKey = "nefona.alarm.openedAt"
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
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            Task {
                do {
                    let alert = AlarmPresentation.Alert(
                        title: "Nefona · Günaydın",
                        stopButton: AlarmButton(text: "Kapat", textColor: .white, systemImageName: "stop.circle"),
                        secondaryButton: AlarmButton(text: "Nefona'yı aç", textColor: .white, systemImageName: "sun.max"),
                        secondaryButtonBehavior: .custom)
                    let attributes = AlarmAttributes<NefonaAlarmMeta>(
                        presentation: AlarmPresentation(alert: alert),
                        metadata: NefonaAlarmMeta(),
                        tintColor: Color(red: 0.10, green: 0.76, blue: 0.82))
                    let weekdays: [Locale.Weekday] = Array(Set(days)).sorted().map { Self.weekday($0) }
                    let schedule = Alarm.Schedule.relative(Alarm.Schedule.Relative(
                        time: Alarm.Schedule.Relative.Time(hour: hour, minute: minute),
                        repeats: weekdays.isEmpty ? .never : .weekly(weekdays)))
                    let config: AlarmManager.AlarmConfiguration<NefonaAlarmMeta>
                    if let sound {
                        config = .alarm(schedule: schedule, attributes: attributes, secondaryIntent: OpenNefonaIntent(), sound: .named(sound))
                    } else {
                        config = .alarm(schedule: schedule, attributes: attributes, secondaryIntent: OpenNefonaIntent())
                    }
                    // Önce yenisi: kurulamazsa eski alarm yerinde kalır (JS de eskisini gösterir)
                    let id = UUID()
                    _ = try await AlarmManager.shared.schedule(id: id, configuration: config)
                    Self.cancelStored()
                    UserDefaults.standard.set(id.uuidString, forKey: Self.idKey)
                    call.resolve(["id": id.uuidString])
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
