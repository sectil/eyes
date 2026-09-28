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
        bridge?.registerPluginInstance(FaceDistancePlugin())
        bridge?.registerPluginInstance(SpeechPlugin())
        bridge?.registerPluginInstance(FeedbackPlugin())
        bridge?.registerPluginInstance(ExportPlugin())
        bridge?.registerPluginInstance(HealthPlugin())
        bridge?.registerPluginInstance(AuthSessionPlugin())
        // Apple ile giriş: uygulamanın kendi eklentisi (npm eklentisi TestFlight'ta "not implemented" verdi,
        // `import SignInWithApple` uygulama hedefinde derlenmedi — AppleSignInPlugin.swift)
        bridge?.registerPluginInstance(AppleSignInPlugin())
    }
}
