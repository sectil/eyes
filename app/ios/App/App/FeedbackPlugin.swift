import Foundation
import UIKit
import AVFoundation
import AudioToolbox
import CoreHaptics
import Capacitor

/// Dokunsal geri bildirim (titreşim) + uygulama ses modu.
/// JS adı: "Feedback" (src/lib/native.js).
/// - haptic({ kind: 'tick' | 'hit' | 'success' | 'warning' | 'error' }) → Promise<void>
/// - setAudioMode({ playback }) → true: .playback + .mixWithOthers (sessiz tuşunda da ses, müziği kesmez)
///                                false: .ambient (sessiz tuşuna uyar, müziği kesmez)
/// - isHapticsSupported() → { supported, coreHaptics }
///
/// Neden @capacitor/haptics değil: o eklenti UIImpactFeedbackGenerator / UINotificationFeedbackGenerator
/// kullanır (node_modules/@capacitor/haptics/ios/Sources/HapticsPlugin/Haptics.swift). Bu üreteçler
/// yalnızca "Ayarlar > Ses ve Dokunuş > Sistem Dokunuşları" açıkken ve uygulama ön plandayken çalışır
/// (UIFeedbackGenerator dokümanı: "haptic feedback is currently played only ... when the System Haptics
/// setting is enabled"). VARSAYIM: kullanıcıda titreşimin hissedilmemesinin olası nedenlerinden biri bu
/// ayarın kapalı olması; diğeri okuma testindeki ses kaydı (aşağıda).
/// Burada önce Core Haptics (CHHapticEngine) kullanılır.
/// VARSAYIM: Core Haptics uygulamaya özel dokunuşları "Sistem Dokunuşları" ayarından bağımsız çalar
/// (Apple dokümanında bu ayar yalnızca UIFeedbackGenerator için koşul olarak geçiyor; Core Haptics
/// için geçmiyor). Erişilebilirlik > Dokunma > Titreşim kapalıysa hiçbir yol titreşmez — bu doğru davranış.
/// Mikrofon kaydı sırasında iOS titreşimi ve sistem seslerini varsayılan olarak susturur; SpeechPlugin
/// bu yüzden AVAudioSession.setAllowHapticsAndSystemSoundsDuringRecording(true) çağırır.
/// ARKit yüz takibinde ARConfiguration.providesAudioData ayarlanmıyor (VARSAYIM: varsayılanı false) →
/// mikrofon açılmaz, titreşim susturulmaz (susturma, ses yakalayan oturumlarda görülüyor).
@objc(FeedbackPlugin)
public class FeedbackPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FeedbackPlugin"
    public let jsName = "Feedback"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "haptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setAudioMode", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isHapticsSupported", returnType: CAPPluginReturnPromise)
    ]

    private enum Kind: String {
        case tick, hit, success, warning, error

        var isNotification: Bool {
            return self == .success || self == .warning || self == .error
        }
    }

    /// Core Haptics iPhone 8 ve sonrasında var (iPad / iPod'da yok).
    private let supportsCoreHaptics: Bool = CHHapticEngine.capabilitiesForHardware().supportsHaptics

    /// Motor durumu yalnızca bu kuyrukta okunur/yazılır. Apple: "Core Haptics is thread-safe" —
    /// motoru ana thread dışında sürmek, oyun sırasında ana thread'i (WebView) bekletmez.
    /// UIKit üreteçleri ise her zaman ana thread'de çağrılır.
    private let hapticQueue = DispatchQueue(label: "eyetrail.feedback.haptics", qos: .userInteractive)
    private var engine: CHHapticEngine?
    private var engineNeedsStart = true

    override public func load() {
        guard supportsCoreHaptics else { return }
        // Motoru önceden oluştur (başlatma ilk dokunuşta; boşta enerji harcamasın).
        hapticQueue.async { [weak self] in
            _ = self?.makeEngineIfNeeded()
        }
    }

    // MARK: - JS yöntemleri

    @objc func haptic(_ call: CAPPluginCall) {
        let kind = Kind(rawValue: call.getString("kind") ?? "tick") ?? .tick
        play(kind)
        call.resolve()
    }

    @objc func setAudioMode(_ call: CAPPluginCall) {
        let playback = call.getBool("playback") ?? false
        do {
            try AppAudioSession.shared.setPreferredMode(playback: playback)
            call.resolve()
        } catch {
            call.reject("Ses modu ayarlanamadı: \(error.localizedDescription)")
        }
    }

    @objc func isHapticsSupported(_ call: CAPPluginCall) {
        let coreHaptics = supportsCoreHaptics
        DispatchQueue.main.async {
            let isPhone = UIDevice.current.userInterfaceIdiom == .phone
            call.resolve([
                "supported": coreHaptics || isPhone,
                "coreHaptics": coreHaptics
            ])
        }
    }

    // MARK: - Oynatma

    /// Sıra: Core Haptics → (hata olursa) UIKit üreteçleri.
    /// Core Haptics yoksa (iPhone 7 ve öncesi, iPad): UIKit üreteçleri; bildirim türlerinde
    /// (success/warning/error) klasik titreşim (kSystemSoundID_Vibrate).
    /// VARSAYIM: iPhone 6s/SE (1. nesil) UIKit üreteçlerini çalmaz ve bu cihaz API ile ayırt edilemez;
    /// klasik titreşim her iPhone'da çalıştığı için bildirim türlerinde onu seçtik. tick/hit için
    /// klasik titreşim (~0,4 sn) oyunda fazla uzun olduğundan kullanılmaz.
    private func play(_ kind: Kind) {
        if supportsCoreHaptics {
            hapticQueue.async { [weak self] in
                guard let self = self else { return }
                if !self.playCoreHaptics(kind) {
                    self.playUIKit(kind)
                }
            }
            return
        }
        DispatchQueue.main.async {
            if kind.isNotification && UIDevice.current.userInterfaceIdiom == .phone {
                AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
            } else {
                FeedbackPlugin.playUIKitOnMain(kind)
            }
        }
    }

    /// Yalnızca hapticQueue üzerinde çağrılır. Başarılıysa true.
    private func playCoreHaptics(_ kind: Kind) -> Bool {
        guard let engine = makeEngineIfNeeded() else { return false }
        do {
            let pattern = try CHHapticPattern(events: FeedbackPlugin.events(for: kind), parameters: [])
            if engineNeedsStart {
                try engine.start()
                engineNeedsStart = false
            }
            do {
                let player = try engine.makePlayer(with: pattern)
                try player.start(atTime: CHHapticTimeImmediate)
            } catch {
                // Motor bizden habersiz durmuş olabilir (ör. arka plandan dönüş): bir kez yeniden başlat.
                try engine.start()
                let player = try engine.makePlayer(with: pattern)
                try player.start(atTime: CHHapticTimeImmediate)
            }
            return true
        } catch {
            engineNeedsStart = true
            return false
        }
    }

    /// Yalnızca hapticQueue üzerinde çağrılır.
    private func makeEngineIfNeeded() -> CHHapticEngine? {
        if let engine = engine { return engine }
        guard supportsCoreHaptics else { return nil }
        do {
            // audioSession: nil → Apple: "You should pass nil when you need the engine only for playing
            // haptics." Uygulamanın ses oturumuna (Speech kaydı, playback/ambient) bağlanmaz.
            let newEngine = try CHHapticEngine(audioSession: nil)
            newEngine.playsHapticsOnly = true
            // Yaklaşık 2 dk boşta kalınca motor kendini kapatır (enerji); stoppedHandler bunu bildirir.
            newEngine.isAutoShutdownEnabled = true
            newEngine.stoppedHandler = { [weak self] reason in
                guard let self = self else { return }
                self.hapticQueue.async {
                    self.engineNeedsStart = true
                    if reason == .systemError {
                        // Sistem hatası: bir sonraki dokunuşta motoru baştan kur.
                        self.engine = nil
                    }
                }
            }
            newEngine.resetHandler = { [weak self] in
                // Haptik sunucusu yeniden başladı: motor bir sonraki çalmada yeniden başlatılır.
                // Oynatıcılar her dokunuşta yeniden oluşturulduğu için başka bir şey gerekmez.
                guard let self = self else { return }
                self.hapticQueue.async {
                    self.engineNeedsStart = true
                }
            }
            engine = newEngine
            engineNeedsStart = true
            return newEngine
        } catch {
            return nil
        }
    }

    /// Kısa, keskin vuruşlar (transient). Değerler tasarım tercihidir: tick ≈ UIKit "light",
    /// hit ≈ "medium", success/warning/error ≈ UINotificationFeedbackGenerator ritimleri.
    private static func events(for kind: Kind) -> [CHHapticEvent] {
        let taps: [(t: TimeInterval, intensity: Float, sharpness: Float)]
        switch kind {
        case .tick:
            taps = [(0, 0.5, 0.8)]
        case .hit:
            taps = [(0, 0.85, 0.55)]
        case .success:
            taps = [(0, 0.6, 0.6), (0.11, 1.0, 0.8)]
        case .warning:
            taps = [(0, 1.0, 0.5), (0.16, 0.7, 0.4)]
        case .error:
            taps = [(0, 0.9, 0.7), (0.09, 0.9, 0.7), (0.18, 1.0, 0.9)]
        }
        return taps.map { tap in
            CHHapticEvent(
                eventType: .hapticTransient,
                parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: tap.intensity),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: tap.sharpness)
                ],
                relativeTime: tap.t
            )
        }
    }

    private func playUIKit(_ kind: Kind) {
        DispatchQueue.main.async {
            FeedbackPlugin.playUIKitOnMain(kind)
        }
    }

    /// Yalnızca ana thread'de çağrılır.
    private static func playUIKitOnMain(_ kind: Kind) {
        switch kind {
        case .tick:
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        case .hit:
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        case .success:
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        case .warning:
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
        case .error:
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }
    }
}

/// Uygulamanın ses oturumu (AVAudioSession) tercihini tek yerde tutar.
/// - Feedback.setAudioMode tercihi kaydeder ve (kayıt sürmüyorsa) hemen uygular.
/// - SpeechPlugin kayda başlarken beginRecording(), dururken endRecording() çağırır; kayıt bitince
///   oturum bırakılır (müzik gibi diğer uygulamalar devam edebilsin) ve kayıtlı tercihe dönülür.
/// setAudioMode hiç çağrılmadıysa kayıttan sonra yalnızca oturum bırakılır (eski davranış).
/// VARSAYIM: WKWebView'in sesi (Web Audio, speechSynthesis) uygulamanın AVAudioSession kategorisine
/// uyar; Capacitor uygulamalarında "sessiz tuşunda ses" için yaygın yöntem budur, cihazda doğrulanmalı.
final class AppAudioSession {
    static let shared = AppAudioSession()

    private let lock = NSLock()
    private var preferredPlayback: Bool?
    private var recording = false

    private init() {}

    func setPreferredMode(playback: Bool) throws {
        lock.lock()
        defer { lock.unlock() }
        preferredPlayback = playback
        if recording { return } // kayıt bitince endRecording() uygular
        try applyPreferredLocked()
    }

    /// SpeechPlugin: kategoriyi .playAndRecord'a çevirmeden önce.
    func beginRecording() {
        lock.lock()
        defer { lock.unlock() }
        recording = true
    }

    /// SpeechPlugin: ses motoru durduktan sonra. Kayıt yoksa hiçbir şey yapmaz.
    func endRecording() {
        lock.lock()
        defer { lock.unlock() }
        guard recording else { return }
        recording = false
        let session = AVAudioSession.sharedInstance()
        // Kayıt, karışmayan (.playAndRecord) oturumla diğer sesleri kesmişti; onlara devam etmelerini bildir.
        try? session.setActive(false, options: .notifyOthersOnDeactivation)
        try? applyPreferredLocked()
    }

    /// Kilit tutulurken çağrılır.
    private func applyPreferredLocked() throws {
        guard let playback = preferredPlayback else { return }
        let session = AVAudioSession.sharedInstance()
        if playback {
            try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        } else {
            try session.setCategory(.ambient, mode: .default, options: [])
        }
        // Her iki kategori de karışabilir; etkinleştirmek başka uygulamanın sesini kesmez.
        try session.setActive(true)
    }
}
