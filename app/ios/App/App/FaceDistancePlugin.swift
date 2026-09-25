import Foundation
import UIKit
import AVFoundation
import ARKit
import Capacitor

/// TrueDepth (Face ID) kamerası + ARKit yüz takibi ile göz–ekran mesafesi ve göz kırpma.
/// JS adı: "FaceDistance" (src/lib/native.js).
/// - getScreenInfo: ekran ölçeği (fiziksel ekran ölçüsü hesabı için)
/// - isSupported / start / stop: yüz takibi
///   start kamera iznine bakar: izin yoksa (reddedilmiş / kısıtlı ya da ilk soruda "İzin Verme")
///   reject(code: "camera-denied") döner, böylece JS tarafı yedeğe (süre / dokunma) düşebilir.
/// - "face" olayı (~30 Hz): { tracked, distanceMm, focusMm, vergenceMm, blinkLeft, blinkRight,
///   lookUp/Down/In/Out Left/Right, gazeLeftX, gazeLeftY, gazeRightX, gazeRightY,
///   camLeftX, camLeftY, camRightX, camRightY, headX, headY }
/// - Oturum hatası: "face" olayı { tracked: false, error: <açıklama>, errorCode: "camera-denied" | "session-failed" }.
///   ARKit bu durumda oturumu durdurur; bir daha kare gelmez.
/// Mesafe: kameradan iki gözün ortalama uzaklığı (ön kamera ekran düzlemindedir).
/// Bakış açısı (gaze*, derece, başa göre): X > 0 kişinin KENDİ sağı, Y > 0 yukarı; hesap yoksa null.
/// Kameraya göre bakış (cam*, derece): gözün bakış doğrultusu ile gözden kameraya giden doğru arasındaki
/// açı, yerçekimine hizalı dünya çerçevesinde. 0 = tam kameraya bakıyor. Baş dönüşü de dahildir;
/// "telefona bakıyor mu" için doğru büyüklük budur (gaze* yüze göredir, baş dönünce değişmez).
/// Baş duruşu (head*, derece): yüzün ileri yönü ile yüzden kameraya giden doğru arasındaki açı.
/// 0 = yüz kameraya dönük. Kalibrasyon "başını değil gözünü oynat" uyarısı için.
/// VARSAYIM: X işareti kişinin sağı için pozitif (dünya +y etrafında işaretli açı, çevrilmiş); JS
/// tarafı kalibrasyonda işareti veriden doğrular, eşikler büyüklük üzerinden çalışır.
@objc(FaceDistancePlugin)
public class FaceDistancePlugin: CAPPlugin, CAPBridgedPlugin, ARSessionDelegate {
    public let identifier = "FaceDistancePlugin"
    public let jsName = "FaceDistance"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getScreenInfo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]

    private var session: ARSession?
    private var lastEmit: TimeInterval = 0
    /// 30 Hz (oyun için; JS gerekirse seyreltir). ARKit yüz takibi 60 fps kare verir; kare zamanları
    /// tam 1/30 s aralıklı gelmeyebildiği için 4 ms pay bırakılır — yoksa her 3 karede bir (20 Hz) düşer.
    private let emitInterval: TimeInterval = 1.0 / 30.0
    private let emitSlack: TimeInterval = 0.004
    /// Her stop'ta artar (yalnızca ana kuyrukta okunur/yazılır). İzin sorusu açıkken stop gelirse,
    /// cevap sonradan "izin ver" olsa bile kamera açılmasın diye start bu sayacı karşılaştırır.
    private var stopGeneration = 0

    @objc func getScreenInfo(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let screen = UIScreen.main
            call.resolve([
                "nativeScale": Double(screen.nativeScale),
                "scale": Double(screen.scale),
                "nativeWidth": Double(screen.nativeBounds.width),
                "nativeHeight": Double(screen.nativeBounds.height),
                "pointsWidth": Double(screen.bounds.width),
                "pointsHeight": Double(screen.bounds.height)
            ])
        }
    }

    @objc func isSupported(_ call: CAPPluginCall) {
        call.resolve(["supported": ARFaceTrackingConfiguration.isSupported])
    }

    @objc func start(_ call: CAPPluginCall) {
        guard ARFaceTrackingConfiguration.isSupported else {
            call.reject("Bu cihazda TrueDepth kamera yok")
            return
        }
        DispatchQueue.main.async {
            // Kamera izni: ARKit izin reddini start'ta değil, sonradan session(_:didFailWithError:) ile
            // (ARError.Code.cameraUnauthorized) bildirir; start yine de başarılı dönerdi. İzin burada
            // denetlenir ki izin yoksa start reddedilsin ve JS'teki yedek yol (catch) devreye girsin.
            // VARSAYIM: ARKit yüz takibi AVCaptureDevice'ın .video (kamera) iznini kullanır
            // (ARError.Code.cameraUnauthorized: "the app lacks user permission for the camera").
            switch AVCaptureDevice.authorizationStatus(for: .video) {
            case .authorized:
                self.runSession(call)
            case .notDetermined:
                // İzni ARKit'e bırakmak yerine burada sorulur: "İzin Verme" cevabı da start'ın
                // reddi olarak JS'e ulaşır. Aynı NSCameraUsageDescription metni gösterilir.
                let generation = self.stopGeneration
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    // Tamamlama işleyicisi rastgele bir kuyrukta çağrılabilir → ana kuyruğa dön.
                    DispatchQueue.main.async {
                        guard generation == self.stopGeneration else {
                            // Soru açıkken stop çağrıldı: kamerayı açma.
                            call.reject("Yüz takibi başlamadan durduruldu", "cancelled")
                            return
                        }
                        if granted {
                            self.runSession(call)
                        } else {
                            call.reject("Kamera izni verilmedi", "camera-denied")
                        }
                    }
                }
            case .denied, .restricted:
                call.reject("Kamera izni yok (Ayarlar'dan açılabilir)", "camera-denied")
            @unknown default:
                // VARSAYIM: gelecekte eklenecek bilinmeyen bir durumda eski davranış korunur; ARKit
                // oturumu dener, başarısız olursa hata "face" olayıyla (errorCode) bildirilir.
                self.runSession(call)
            }
        }
    }

    /// Yüz takibi oturumunu (yeniden) başlatır ve çağrıyı çözer. Ana kuyrukta çağrılmalı.
    private func runSession(_ call: CAPPluginCall) {
        if session == nil {
            let session = ARSession()
            session.delegate = self
            self.session = session
        }
        let config = ARFaceTrackingConfiguration()
        config.maximumNumberOfTrackedFaces = 1
        session?.run(config, options: [.resetTracking, .removeExistingAnchors])
        call.resolve()
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.stopGeneration += 1
            self.session?.pause()
            call.resolve()
        }
    }

    // MARK: - ARSessionDelegate

    public func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard let face = anchors.compactMap({ $0 as? ARFaceAnchor }).first,
              let frame = session.currentFrame else { return }
        let now = frame.timestamp
        if now - lastEmit < emitInterval - emitSlack { return }
        lastEmit = now

        let cameraPos = position(frame.camera.transform)
        let leftEye = position(simd_mul(face.transform, face.leftEyeTransform))
        let rightEye = position(simd_mul(face.transform, face.rightEyeTransform))
        let distanceM = (simd_distance(leftEye, cameraPos) + simd_distance(rightEye, cameraPos)) / 2

        func shape(_ key: ARFaceAnchor.BlendShapeLocation) -> Double {
            return face.blendShapes[key]?.doubleValue ?? 0
        }

        // Odak mesafesi (mm): gözlerin baktığı noktanın (lookAtPoint, yüz koordinatları) iki göz
        // ortasına uzaklığı. Yakına bakınca küçük, uzağa bakınca büyük.
        let eyeMidLocal = (position(face.leftEyeTransform) + position(face.rightEyeTransform)) / 2
        let focusMm = Double(simd_distance(face.lookAtPoint, eyeMidLocal)) * 1000.0
        // Konverjans mesafesi (mm): iki gözün bakış doğrultuları arasındaki açıdan.
        // Doğrultular paralele yakınsa (< 0,5°) uzak → nil.
        // Bakış doğrultusu = göz dönüşümünün +z ekseni (columns.2): nötrde yüzden dışarı, kameraya doğru
        // (yüz koordinatında +z izleyiciye doğru). İki doğrultu arasındaki açı işaretten bağımsızdır;
        // eskiden kullanılan -columns.2 ile aynı sonucu verir, gaze* ile tutarlı olsun diye +z kullanılıyor.
        let ipd = simd_distance(position(face.leftEyeTransform), position(face.rightEyeTransform))
        let dirL = simd_normalize(simd_float3(face.leftEyeTransform.columns.2.x, face.leftEyeTransform.columns.2.y, face.leftEyeTransform.columns.2.z))
        let dirR = simd_normalize(simd_float3(face.rightEyeTransform.columns.2.x, face.rightEyeTransform.columns.2.y, face.rightEyeTransform.columns.2.z))
        let cosA = max(-1, min(1, simd_dot(dirL, dirR)))
        let angle = acos(cosA)
        var vergence: Any = NSNull()
        if angle > 0.5 * Float.pi / 180 {
            vergence = Double((ipd / 2) / tan(angle / 2)) * 1000.0
        }

        // Göz başına bakış açısı (derece, başa göre). Yüz izlenmiyorsa dönüşümler bayat → null.
        let gazeL = face.isTracked ? gazeDegrees(face.leftEyeTransform) : nil
        let gazeR = face.isTracked ? gazeDegrees(face.rightEyeTransform) : nil
        // Kameraya göre bakış ve baş duruşu (dünya çerçevesi, yerçekimi hizalı)
        let camL = face.isTracked ? angleToCamera(simd_mul(face.transform, face.leftEyeTransform), cameraPos) : nil
        let camR = face.isTracked ? angleToCamera(simd_mul(face.transform, face.rightEyeTransform), cameraPos) : nil
        let head = face.isTracked ? angleToCamera(face.transform, cameraPos) : nil

        notifyListeners("face", data: [
            "tracked": face.isTracked,
            "distanceMm": Double(distanceM) * 1000.0,
            "focusMm": focusMm,
            "vergenceMm": vergence,
            "blinkLeft": shape(.eyeBlinkLeft),
            "blinkRight": shape(.eyeBlinkRight),
            // Bakış yönü (0–1). In: burna doğru, Out: şakağa doğru.
            "lookUpLeft": shape(.eyeLookUpLeft),
            "lookUpRight": shape(.eyeLookUpRight),
            "lookDownLeft": shape(.eyeLookDownLeft),
            "lookDownRight": shape(.eyeLookDownRight),
            "lookInLeft": shape(.eyeLookInLeft),
            "lookInRight": shape(.eyeLookInRight),
            "lookOutLeft": shape(.eyeLookOutLeft),
            "lookOutRight": shape(.eyeLookOutRight),
            // Bakış açısı (derece). X > 0: kişinin kendi sağı, Y > 0: yukarı. Hesap yoksa null.
            "gazeLeftX": jsNumber(gazeL?.x),
            "gazeLeftY": jsNumber(gazeL?.y),
            "gazeRightX": jsNumber(gazeR?.x),
            "gazeRightY": jsNumber(gazeR?.y),
            // Kameraya göre bakış (derece; 0 = kameraya) ve baş duruşu (derece; 0 = yüz kameraya dönük)
            "camLeftX": jsNumber(camL?.x),
            "camLeftY": jsNumber(camL?.y),
            "camRightX": jsNumber(camR?.x),
            "camRightY": jsNumber(camR?.y),
            "headX": jsNumber(head?.x),
            "headY": jsNumber(head?.y),
            // Ham ARKit bakış noktası (yüz koordinatı, metre). Eksen/işaret yorumu JS'teki kişisel
            // kalibrasyonda (src/lib/gazeCalib.js) veriden öğrenilir; burada dönüştürülmez.
            "lookAtX": jsNumber(face.isTracked ? Double(face.lookAtPoint.x) : nil),
            "lookAtY": jsNumber(face.isTracked ? Double(face.lookAtPoint.y) : nil),
            "lookAtZ": jsNumber(face.isTracked ? Double(face.lookAtPoint.z) : nil)
        ])
    }

    public func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {
        if anchors.contains(where: { $0 is ARFaceAnchor }) {
            notifyListeners("face", data: ["tracked": false])
        }
    }

    /// Apple: "Tells the delegate that the session has stopped running due to an error." Oturum durur,
    /// bir daha kare gelmez; JS "error" alanını görünce yedeğe düşmeli (kareyi yüz karesi saymamalı).
    public func session(_ session: ARSession, didFailWithError error: Error) {
        let errorCode: String
        if let arError = error as? ARError, arError.code == .cameraUnauthorized {
            errorCode = "camera-denied"
        } else {
            errorCode = "session-failed"
        }
        notifyListeners("face", data: [
            "tracked": false,
            "error": error.localizedDescription,
            "errorCode": errorCode
        ])
    }

    private func position(_ m: simd_float4x4) -> simd_float3 {
        return simd_float3(m.columns.3.x, m.columns.3.y, m.columns.3.z)
    }

    /// Göz dönüşümünden (yüz koordinatında) bakış açısı, derece.
    /// Apple, ARFaceAnchor: "the positive x direction points to the viewer's right (that is, the face's
    /// own left), the positive y direction points up (relative to the face itself), and the positive
    /// z direction points outward from the face (toward the viewer)."
    /// Bakış doğrultusu d = columns.2 (+z, yüzden dışarı). Yaw = atan2(d.x, d.z), pitch = atan2(d.y, hypot(d.x, d.z)).
    /// +x kişinin SOLU olduğu için X işareti çevrilir → X > 0 kişinin kendi sağı.
    /// VARSAYIM: göz dönüşümünün +z ekseni bakış yönüdür (yaygın ARKit göz takibi örnekleri hedefi gözün
    /// +z'sine koyar). JS tarafı işareti eyeLookIn/Out blendshape'lerine karşı ayrıca doğrular.
    private func gazeDegrees(_ eye: simd_float4x4) -> (x: Double, y: Double)? {
        let c = eye.columns.2
        let dx = Double(c.x), dy = Double(c.y), dz = Double(c.z)
        let n = (dx * dx + dy * dy + dz * dz).squareRoot()
        guard n.isFinite, n > 1e-6 else { return nil }
        let x = dx / n, y = dy / n, z = dz / n
        let yaw = atan2(-x, z)
        let pitch = atan2(y, hypot(x, z))
        let deg = 180.0 / Double.pi
        return (x: yaw * deg, y: pitch * deg)
    }

    /// Bir dönüşümün +z ekseni (bakış / yüz ileri yönü, dünya çerçevesi) ile o dönüşümün konumundan
    /// kameraya giden doğru arasındaki açı (derece). x: dünya +y (yukarı) etrafında yatay açı, kişinin
    /// sağı pozitif olacak şekilde çevrilmiş; y: yükseliş farkı (yukarı pozitif).
    /// ARFaceTrackingConfiguration dünyası yerçekimine hizalıdır (+y yukarı), bu yüzden cihaz yönünden
    /// bağımsızdır. Yatay bileşen için vektörler yatay düzleme izdüşürülür.
    private func angleToCamera(_ t: simd_float4x4, _ cameraPos: simd_float3) -> (x: Double, y: Double)? {
        let c = t.columns.2
        let d = simd_float3(c.x, c.y, c.z)
        let toCam = cameraPos - position(t)
        let nd = simd_length(d), nc = simd_length(toCam)
        guard nd.isFinite, nc.isFinite, nd > 1e-6, nc > 1e-6 else { return nil }
        let a = d / nd, b = toCam / nc
        // Yatay izdüşüm
        let ah = simd_float3(a.x, 0, a.z), bh = simd_float3(b.x, 0, b.z)
        let lah = simd_length(ah), lbh = simd_length(bh)
        guard lah > 1e-6, lbh > 1e-6 else { return nil }
        let ahn = ah / lah, bhn = bh / lbh
        // b'den a'ya +y etrafında işaretli açı; kişinin sağına dönüş yukarıdan bakınca saat yönü (negatif) → çevrilir
        let cross = simd_cross(bhn, ahn)
        let yaw = -atan2(cross.y, simd_dot(bhn, ahn))
        let pitch = asin(max(-1, min(1, a.y))) - asin(max(-1, min(1, b.y)))
        let deg = 180.0 / Double.pi
        let x = Double(yaw) * deg, y = Double(pitch) * deg
        guard x.isFinite, y.isFinite else { return nil }
        return (x: x, y: y)
    }

    /// JS'e sayı ya da null (NaN/sonsuz gönderme).
    private func jsNumber(_ value: Double?) -> Any {
        if let value = value, value.isFinite { return value }
        return NSNull()
    }
}
