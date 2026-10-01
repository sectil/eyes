import Foundation
import UIKit
import AuthenticationServices
import Capacitor

/// Apple ile giriş (src/lib/account.js signInWithApple). JS adı: "AppleSignIn".
/// Uygulamanın kendi eklentisi: npm'deki @capacitor-community/apple-sign-in TestFlight (Release) derlemesinde
/// "SignInWithApple plugin is not implemented" verdi; uygulama hedefinden `import SignInWithApple` ile açıkça kaydetmek
/// de derlenmedi ("Unable to resolve module dependency": modül CapApp-SPM'in içinde, uygulamaya görünmüyor).
/// AuthSessionPlugin gibi doğrudan uygulama hedefinde durur ve MainViewController'da kaydedilir.
/// - authorize({ nonce, scopes: "email name" }) → { response: { user, email, givenName, familyName, identityToken, authorizationCode } }
///   (npm eklentisiyle aynı yanıt biçimi). nonce: SHA-256 özeti (hex), JS hazırlar.
/// - Vazgeçme: reject("canceled (1001)", "1001"); diğer hatalar: reject("<açıklama> (error <kod>)", "<kod>").
@objc(AppleSignInPlugin)
public class AppleSignInPlugin: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "AppleSignInPlugin"
    public let jsName = "AppleSignIn"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise)
    ]

    // Pencere kapanana dek güçlü tutulur
    private var pending: CAPPluginCall?
    private var controller: ASAuthorizationController?

    @objc func authorize(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let old = self.pending {
                old.reject("Yeni giriş isteği başladı", "SUPERSEDED")
            }
            let request = ASAuthorizationAppleIDProvider().createRequest()
            let scopes = call.getString("scopes") ?? ""
            var requested: [ASAuthorization.Scope] = []
            if scopes.contains("name") { requested.append(.fullName) }
            if scopes.contains("email") { requested.append(.email) }
            request.requestedScopes = requested
            if let nonce = call.getString("nonce") { request.nonce = nonce }
            if let state = call.getString("state") { request.state = state }
            let c = ASAuthorizationController(authorizationRequests: [request])
            c.delegate = self
            c.presentationContextProvider = self
            self.pending = call
            self.controller = c
            c.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let call = pending else { return }
        pending = nil
        self.controller = nil
        guard let cred = authorization.credential as? ASAuthorizationAppleIDCredential else {
            call.reject("Apple kimlik bilgisi gelmedi", "NO_CREDENTIAL")
            return
        }
        guard let tokenData = cred.identityToken, let token = String(data: tokenData, encoding: .utf8) else {
            call.reject("Apple kimlik belirteci gelmedi", "NO_TOKEN")
            return
        }
        let code = cred.authorizationCode.flatMap { String(data: $0, encoding: .utf8) }
        var response: [String: Any] = ["user": cred.user, "identityToken": token]
        if let v = cred.email { response["email"] = v }
        if let v = cred.fullName?.givenName { response["givenName"] = v }
        if let v = cred.fullName?.familyName { response["familyName"] = v }
        if let v = code { response["authorizationCode"] = v }
        call.resolve(["response": response])
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        guard let call = pending else { return }
        pending = nil
        self.controller = nil
        let code = (error as NSError).code
        if code == ASAuthorizationError.Code.canceled.rawValue {
            call.reject("canceled (1001)", "1001")
            return
        }
        call.reject("\(error.localizedDescription) (error \(code))", "\(code)", error)
    }
}
