import UIKit
import Capacitor

/// Uygulama içi (npm dışı) Capacitor eklentilerini kaydeder.
/// Capacitor 6+ yerel eklentileri otomatik kaydetmez (capacitorjs.com/docs/ios/custom-code).
class MainViewController: CAPBridgeViewController {
    /// Göz takibi açıkken true (FaceDistancePlugin start/stop): ekran yalnız dikey döner.
    static var portraitLock = false

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return MainViewController.portraitLock ? .portrait : super.supportedInterfaceOrientations
    }

    override open func capacitorDidLoad() {
        // Açılış ekranından sonra, sayfa çizilene kadar görünen zemin: uygulamanın zemini, temayı izler
        // (capacitor.config'deki tek renk #f5f7f7 koyu temada açık gri yanıp sönüyordu). Açılış görseli de aynı iki renk.
        let ground = UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 7 / 255, green: 12 / 255, blue: 18 / 255, alpha: 1)
                : UIColor(red: 243 / 255, green: 246 / 255, blue: 248 / 255, alpha: 1)
        }
        webView?.backgroundColor = ground
        webView?.scrollView.backgroundColor = ground

        bridge?.registerPluginInstance(FaceDistancePlugin())
        bridge?.registerPluginInstance(SpeechPlugin())
        bridge?.registerPluginInstance(FeedbackPlugin())
        bridge?.registerPluginInstance(ExportPlugin())
        bridge?.registerPluginInstance(HealthPlugin())
        bridge?.registerPluginInstance(SkyPlugin())
        bridge?.registerPluginInstance(AuthSessionPlugin())
        // Apple ile giriş: uygulamanın kendi eklentisi (npm eklentisi TestFlight'ta "not implemented" verdi,
        // `import SignInWithApple` uygulama hedefinde derlenmedi — AppleSignInPlugin.swift)
        bridge?.registerPluginInstance(AppleSignInPlugin())
        // Nefona alarmı (AlarmKit, iOS 26+; daha eski iOS'ta JS bildirimle hatırlatır)
        bridge?.registerPluginInstance(AlarmPlugin())
    }
}
