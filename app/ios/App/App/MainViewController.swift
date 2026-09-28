import UIKit
import Capacitor
import SignInWithApple

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
        // Apple ile giriş (npm eklentisi) otomatik listeden (capacitor.config.json packageClassList, NSClassFromString)
        // kaydediliyor; TestFlight (Release) derlemesinde "SignInWithApple plugin is not implemented on ios" verdi,
        // Debug'da çalıştı. Açık kayıt sınıfa doğrudan başvurur (derlemede kalır); ikinci kayıt öncekinin yerine geçer.
        bridge?.registerPluginInstance(SignInWithApple())
    }
}
