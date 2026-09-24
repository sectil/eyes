import Foundation
import Speech
import AVFoundation
import Capacitor

/// Konuşma tanıma (Apple Speech framework). Okuma testinde kullanıcının cümleyi sesli
/// okuduğunu doğrulamak ve okuma süresini ses segmentlerinin zamanından ölçmek için.
/// JS adı: "Speech" (src/lib/native.js).
/// - isAvailable({locale}) → { available, onDevice }
/// - requestPermission() → { granted }   (mikrofon + konuşma tanıma izni)
/// - start({locale, onDevice}) / stop()
/// - "speech" olayı: { text, isFinal, segments: [{ text, t, d }] }  (t, d: saniye, ses başından)
@objc(SpeechPlugin)
public class SpeechPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechPlugin"
    public let jsName = "Speech"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]

    private let audioEngine = AVAudioEngine()
    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    private func makeRecognizer(_ call: CAPPluginCall) -> SFSpeechRecognizer? {
        let locale = Locale(identifier: call.getString("locale") ?? "tr-TR")
        return SFSpeechRecognizer(locale: locale)
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        let r = makeRecognizer(call)
        call.resolve([
            "available": r?.isAvailable ?? false,
            "onDevice": r?.supportsOnDeviceRecognition ?? false
        ])
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            guard status == .authorized else {
                call.resolve(["granted": false])
                return
            }
            AVAudioSession.sharedInstance().requestRecordPermission { ok in
                call.resolve(["granted": ok])
            }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        stopInternal()
        guard let recognizer = makeRecognizer(call), recognizer.isAvailable else {
            call.reject("Konuşma tanıma bu dil için kullanılamıyor")
            return
        }
        self.recognizer = recognizer
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
            try session.setActive(true, options: .notifyOthersOnDeactivation)

            let req = SFSpeechAudioBufferRecognitionRequest()
            req.shouldReportPartialResults = true
            if call.getBool("onDevice") ?? false, recognizer.supportsOnDeviceRecognition {
                req.requiresOnDeviceRecognition = true
            }
            self.request = req

            let input = audioEngine.inputNode
            let format = input.outputFormat(forBus: 0)
            input.removeTap(onBus: 0)
            input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                req.append(buffer)
            }
            audioEngine.prepare()
            try audioEngine.start()

            task = recognizer.recognitionTask(with: req) { [weak self] result, error in
                guard let self = self else { return }
                if let result = result {
                    let segs: [[String: Any]] = result.bestTranscription.segments.map {
                        ["text": $0.substring, "t": $0.timestamp, "d": $0.duration]
                    }
                    self.notifyListeners("speech", data: [
                        "text": result.bestTranscription.formattedString,
                        "isFinal": result.isFinal,
                        "segments": segs
                    ])
                }
                if error != nil || (result?.isFinal ?? false) {
                    if let error = error {
                        self.notifyListeners("speech", data: ["error": error.localizedDescription, "isFinal": true])
                    }
                    self.stopInternal()
                }
            }
            call.resolve()
        } catch {
            stopInternal()
            call.reject("Ses başlatılamadı: \(error.localizedDescription)")
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        stopInternal()
        call.resolve()
    }

    private func stopInternal() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        request?.endAudio()
        task?.cancel()
        task = nil
        request = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
