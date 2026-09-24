import Foundation
import UIKit
import ARKit
import Capacitor

/// TrueDepth (Face ID) kamerası + ARKit yüz takibi ile göz–ekran mesafesi ve göz kırpma.
/// JS adı: "FaceDistance" (src/lib/native.js).
/// - getScreenInfo: ekran ölçeği (fiziksel ekran ölçüsü hesabı için)
/// - isSupported / start / stop: yüz takibi
/// - "face" olayı (~15 Hz): { tracked, distanceMm, blinkLeft, blinkRight }
/// Mesafe: kameradan iki gözün ortalama uzaklığı (ön kamera ekran düzlemindedir).
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
    private let emitInterval: TimeInterval = 1.0 / 15.0

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
            if self.session == nil {
                let session = ARSession()
                session.delegate = self
                self.session = session
            }
            let config = ARFaceTrackingConfiguration()
            config.maximumNumberOfTrackedFaces = 1
            self.session?.run(config, options: [.resetTracking, .removeExistingAnchors])
            call.resolve()
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.session?.pause()
            call.resolve()
        }
    }

    // MARK: - ARSessionDelegate

    public func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard let face = anchors.compactMap({ $0 as? ARFaceAnchor }).first,
              let frame = session.currentFrame else { return }
        let now = frame.timestamp
        if now - lastEmit < emitInterval { return }
        lastEmit = now

        let cameraPos = position(frame.camera.transform)
        let leftEye = position(simd_mul(face.transform, face.leftEyeTransform))
        let rightEye = position(simd_mul(face.transform, face.rightEyeTransform))
        let distanceM = (simd_distance(leftEye, cameraPos) + simd_distance(rightEye, cameraPos)) / 2

        let blinkLeft = face.blendShapes[.eyeBlinkLeft]?.doubleValue ?? 0
        let blinkRight = face.blendShapes[.eyeBlinkRight]?.doubleValue ?? 0

        notifyListeners("face", data: [
            "tracked": face.isTracked,
            "distanceMm": Double(distanceM) * 1000.0,
            "blinkLeft": blinkLeft,
            "blinkRight": blinkRight
        ])
    }

    public func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {
        if anchors.contains(where: { $0 is ARFaceAnchor }) {
            notifyListeners("face", data: ["tracked": false])
        }
    }

    public func session(_ session: ARSession, didFailWithError error: Error) {
        notifyListeners("face", data: ["tracked": false, "error": error.localizedDescription])
    }

    private func position(_ m: simd_float4x4) -> simd_float3 {
        return simd_float3(m.columns.3.x, m.columns.3.y, m.columns.3.z)
    }
}
