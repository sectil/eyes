import UIKit
import Capacitor

/// Uygulama içi (npm dışı) Capacitor eklentilerini kaydeder.
/// Capacitor 6+ yerel eklentileri otomatik kaydetmez (capacitorjs.com/docs/ios/custom-code).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(FaceDistancePlugin())
    }
}
