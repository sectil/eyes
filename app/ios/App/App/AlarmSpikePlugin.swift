import Foundation
import SwiftUI
import Capacitor
#if canImport(AlarmKit)
import AlarmKit
import AppIntents
#endif

/// Alarm DENEMESİ (spike, 2026-09-28): AlarmKit gerçek cihazda bizim için ne yapıyor, onu ölçmek için.
/// Yalnız test derlemesinde (VITE_TEST_UNLOCK) Dalga ekranındaki gizli panelden çağrılır; asıl alarm özelliği
/// tasarım onayından sonra ayrı yazılır (YAPILACAKLAR "Nefona alarmı"). JS adı: "AlarmSpike".
/// Sorular: sessiz/Odak modunda çalıyor mu; Library/Sounds'a yazılan Dalga WAV'ı çalınıyor mu; "Nefona'yı aç"
/// düğmesi uygulamayı açıyor mu; widget (Live Activity) uzantısı olmadan kurulabiliyor mu.
/// AlarmKit yalnız iOS 26+; uygulama iOS 15'ten destekli: AlarmKit ve AppIntents zayıf bağlanır
/// (OTHER_LDFLAGS -weak_framework), her çağrı #available ile korunur.
/// İmzalar Apple belgesinden (developer.apple.com/documentation/alarmkit); Alert için eski (stopButton'lı) kurucu
/// bilerek: her iOS 26 SDK'sında var, yeni SDK'da yalnız "eskidi" uyarısı verir.
@objc(AlarmSpikePlugin)
public class AlarmSpikePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AlarmSpikePlugin"
    public let jsName = "AlarmSpike"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuth", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeSound", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "schedule", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "list", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelAll", returnType: CAPPluginReturnPromise)
    ]

    /// { available, auth: "authorized"|"denied"|"notDetermined"|"unavailable" }
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
        call.reject("AlarmKit yok (iOS 26 gerekir)", "UNAVAILABLE")
    }

    /// { name, data: base64 } → Library/Sounds/<name> ; { path, bytes }
    @objc func writeSound(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), !name.contains("/"), let b64 = call.getString("data"),
              let data = Data(base64Encoded: b64) else {
            call.reject("name ve data (base64) gerekli", "ARGS")
            return
        }
        do {
            let lib = try FileManager.default.url(for: .libraryDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            let dir = lib.appendingPathComponent("Sounds", isDirectory: true)
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            let url = dir.appendingPathComponent(name)
            try data.write(to: url, options: .atomic)
            call.resolve(["path": url.path, "bytes": data.count])
        } catch {
            call.reject("Ses yazılamadı: \(error)", "WRITE")
        }
    }

    /// { seconds, sound?: dosya adı (Library/Sounds ya da paket) } → { id, at }
    @objc func schedule(_ call: CAPPluginCall) {
        let seconds = max(10, call.getInt("seconds") ?? 120)
        let sound = call.getString("sound")
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            Task {
                do {
                    let alert = AlarmPresentation.Alert(
                        title: "Nefona · Dalga",
                        stopButton: AlarmButton(text: "Kapat", textColor: .white, systemImageName: "stop.circle"),
                        secondaryButton: AlarmButton(text: "Nefona'yı aç", textColor: .white, systemImageName: "arrow.up.forward.app"),
                        secondaryButtonBehavior: .custom)
                    let attributes = AlarmAttributes<NefonaAlarmMeta>(
                        presentation: AlarmPresentation(alert: alert),
                        metadata: NefonaAlarmMeta(),
                        tintColor: Color(red: 0.10, green: 0.76, blue: 0.82))
                    let when = Date().addingTimeInterval(TimeInterval(seconds))
                    let config: AlarmManager.AlarmConfiguration<NefonaAlarmMeta>
                    if let sound {
                        config = .alarm(schedule: .fixed(when), attributes: attributes, secondaryIntent: OpenNefonaIntent(), sound: .named(sound))
                    } else {
                        config = .alarm(schedule: .fixed(when), attributes: attributes, secondaryIntent: OpenNefonaIntent())
                    }
                    let id = UUID()
                    _ = try await AlarmManager.shared.schedule(id: id, configuration: config)
                    call.resolve(["id": id.uuidString, "at": ISO8601DateFormatter().string(from: when)])
                } catch {
                    call.reject("Alarm kurulamadı: \(error)", "SCHEDULE")
                }
            }
            return
        }
        #endif
        call.reject("AlarmKit yok (iOS 26 gerekir)", "UNAVAILABLE")
    }

    @objc func list(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            do {
                let ids = try AlarmManager.shared.alarms.map { $0.id.uuidString }
                call.resolve(["ids": ids])
            } catch {
                call.reject("Alarmlar okunamadı: \(error)", "LIST")
            }
            return
        }
        #endif
        call.resolve(["ids": []])
    }

    @objc func cancelAll(_ call: CAPPluginCall) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            do {
                let all = try AlarmManager.shared.alarms
                for a in all { try AlarmManager.shared.cancel(id: a.id) }
                call.resolve(["cancelled": all.count])
            } catch {
                call.reject("İptal edilemedi: \(error)", "CANCEL")
            }
            return
        }
        #endif
        call.resolve(["cancelled": 0])
    }

    #if canImport(AlarmKit)
    @available(iOS 26.0, *)
    private static func authName(_ s: AlarmManager.AuthorizationState) -> String {
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

/// Alarmın ikinci düğmesi: uygulamayı açar (openAppWhenRun). Asıl özellikte ilgili pratiğe gider.
@available(iOS 26.0, *)
struct OpenNefonaIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Nefona'yı aç"
    static let openAppWhenRun: Bool = true
    init() {}
    func perform() async throws -> some IntentResult { .result() }
}
#endif
