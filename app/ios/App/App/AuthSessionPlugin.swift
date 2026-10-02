import Foundation
import AuthenticationServices
import Capacitor

/// Güvenli web oturumu (ASWebAuthenticationSession) — Google ile giriş (src/lib/account.js signInWithGoogle).
/// JS adı: "AuthSession". Üçüncü taraf SDK yok: Supabase'in Google adresi Apple'ın oturum penceresinde açılır,
/// Google hesabı seçilir, Supabase `scheme://…` adresine döner; dönen adres JS'e verilir (oturum orada kurulur).
/// - start({ url, scheme }) → { url } · kullanıcı vazgeçerse reject(code: "CANCELED")
/// Tarayıcı çerezleri paylaşılır (prefersEphemeralWebBrowserSession = false): Safari'de açık Google hesabı hazır gelir;
/// iOS bunun için "Nefona oturum açmak için … kullanmak istiyor" onayını kendisi sorar.
@objc(AuthSessionPlugin)
public class AuthSessionPlugin: CAPPlugin, CAPBridgedPlugin, ASWebAuthenticationPresentationContextProviding {
    public let identifier = "AuthSessionPlugin"
    public let jsName = "AuthSession"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise)
    ]

    // Oturum bitene dek güçlü tutulur (yoksa pencere hemen kapanır)
    private var session: ASWebAuthenticationSession?

    @objc func start(_ call: CAPPluginCall) {
        guard let raw = call.getString("url"), let url = URL(string: raw),
              let scheme = call.getString("scheme"), !scheme.isEmpty else {
            call.reject("Adres eksik", "BAD_ARGS")
            return
        }
        DispatchQueue.main.async {
            let s = ASWebAuthenticationSession(url: url, callbackURLScheme: scheme) { [weak self] callbackURL, error in
                self?.session = nil
                if let e = error as? ASWebAuthenticationSessionError, e.code == .canceledLogin {
                    call.reject("canceled", "CANCELED")
                    return
                }
                if let e = error {
                    call.reject(e.localizedDescription, "FAILED", e)
                    return
                }
                guard let cb = callbackURL else {
                    call.reject("Dönüş adresi gelmedi", "FAILED")
                    return
                }
                call.resolve(["url": cb.absoluteString])
            }
            s.presentationContextProvider = self
            s.prefersEphemeralWebBrowserSession = false
            self.session = s
            if !s.start() {
                self.session = nil
                call.reject("Oturum penceresi açılamadı", "FAILED")
            }
        }
    }

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return bridge?.webView?.window ?? ASPresentationAnchor()
    }
}
