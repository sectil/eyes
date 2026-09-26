import Foundation
import UIKit
import WebKit
import Capacitor

/// Dışa aktarma: Gelişim → "Doktoruma göster (PDF)" ve "CSV indir".
/// JS adı: "Export" (src/lib/native.js).
/// - shareText({ filename, text }) → dosyayı geçici klasöre yazar, iOS paylaşım sayfasını açar → { completed, activity }
/// - sharePdf({ filename, html, footer }) → HTML'yi görünmez bir WKWebView'da yükler, iOS yazdırma motoruyla
///   (UIPrintPageRenderer) A4 sayfalara böler, PDF'i paylaşım sayfasıyla sunar → { completed, activity }
///
/// KVKK: dosya yalnız kullanıcı dokununca oluşur ve yalnız onun seçtiği yere gider (Dosyalar, Mail, AirDrop…);
/// uygulama bir yere göndermez. Geçici klasör her dışa aktarmada boşaltılır (eski dosyalar telefonda birikmez).
///
/// Neden JS PDF kütüphanesi değil: Türkçe harfler için yazı tipi gömmek gerekir; iOS yazdırma motoru sistem
/// yazı tipiyle vektör metin ve sayfa bölme verir. Neden @capacitor/share değil: PDF'i yine yerel üretmek gerekiyor;
/// paylaşım aynı eklentide birkaç satır.
@objc(ExportPlugin)
public class ExportPlugin: CAPPlugin, CAPBridgedPlugin, WKNavigationDelegate {
    public let identifier = "ExportPlugin"
    public let jsName = "Export"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "shareText", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sharePdf", returnType: CAPPluginReturnPromise)
    ]

    /// A4, nokta (1/72 inç)
    private static let paper = CGRect(x: 0, y: 0, width: 595.2, height: 841.8)
    private static let margins = UIEdgeInsets(top: 40, left: 42, bottom: 34, right: 42)

    // PDF işi (aynı anda bir tane; yalnız ana thread'de okunur/yazılır)
    private var pdfWebView: WKWebView?
    private var pdfCall: CAPPluginCall?
    private var pdfName = "nefona-rapor.pdf"
    private var pdfFooter = "Nefona"

    // MARK: - JS yöntemleri

    @objc func shareText(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else {
            call.reject("text yok")
            return
        }
        let name = safeName(call.getString("filename"), fallback: "nefona.csv")
        // Dosya ve paylaşım işi ana thread'de (sharePdf ile aynı yerde): iki dışa aktarma birbirinin dosyasını silmesin.
        // Capacitor yöntemleri "bridge" kuyruğunda çağırır (CapacitorBridge.swift handleJSCall).
        DispatchQueue.main.async {
            if self.pdfCall != nil || self.sheetIsUp() {
                call.reject("Dışa aktarma sürüyor")
                return
            }
            do {
                let url = try self.writeTemp(Data(text.utf8), name: name)
                self.present(url, call)
            } catch {
                call.reject("Dosya yazılamadı: \(error.localizedDescription)")
            }
        }
    }

    @objc func sharePdf(_ call: CAPPluginCall) {
        guard let html = call.getString("html") else {
            call.reject("html yok")
            return
        }
        let name = safeName(call.getString("filename"), fallback: "nefona-rapor.pdf")
        let footer = call.getString("footer") ?? "Nefona"
        DispatchQueue.main.async {
            if self.pdfCall != nil || self.sheetIsUp() {
                call.reject("Rapor zaten hazırlanıyor")
                return
            }
            self.pdfCall = call
            self.pdfName = name
            self.pdfFooter = footer
            // Genişlik = yazdırılabilir alan: yerleşim ölçeklenmeden sayfaya oturur
            let width = Self.paper.width - Self.margins.left - Self.margins.right
            let web = WKWebView(frame: CGRect(x: 0, y: 0, width: width, height: Self.paper.height))
            web.navigationDelegate = self
            web.isUserInteractionEnabled = false
            // Pencerenin en altına (uygulama görünümünün arkasına) eklenir: kullanıcı görmez.
            // VARSAYIM: pencereye eklenmiş WKWebView yazdırmada içeriği güvenle çizer (pencere dışında boş sayfa
            // riskine karşı); cihazda doğrulanacak.
            self.bridge?.viewController?.view.window?.insertSubview(web, at: 0)
            self.pdfWebView = web
            web.loadHTMLString(html, baseURL: nil)
        }
    }

    // MARK: - WKNavigationDelegate

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard webView === pdfWebView else { return }
        // SVG ve yazı yerleşimi otursun diye kısa bekleme
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            guard let call = self.pdfCall, let web = self.pdfWebView else { return }
            let data = self.renderPdf(web)
            let name = self.pdfName
            self.cleanupPdf()
            guard !data.isEmpty else {
                call.reject("PDF oluşturulamadı")
                return
            }
            do {
                let url = try self.writeTemp(data, name: name)
                self.present(url, call)
            } catch {
                call.reject("Dosya yazılamadı: \(error.localizedDescription)")
            }
        }
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        guard webView === pdfWebView else { return }
        failPdf("PDF hazırlanamadı: \(error.localizedDescription)")
    }

    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        guard webView === pdfWebView else { return }
        failPdf("PDF hazırlanamadı: \(error.localizedDescription)")
    }

    public func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        guard webView === pdfWebView else { return }
        failPdf("PDF hazırlanamadı (içerik işlemi kapandı)")
    }

    // MARK: - PDF

    private func renderPdf(_ web: WKWebView) -> Data {
        let renderer = PageRenderer(paper: Self.paper, margins: Self.margins, footer: pdfFooter)
        renderer.addPrintFormatter(web.viewPrintFormatter(), startingAtPageAt: 0)
        let pages = renderer.numberOfPages
        guard pages > 0 else { return Data() }
        let format = UIGraphicsPDFRendererFormat()
        format.documentInfo = [
            kCGPDFContextTitle as String: "Nefona · Kişisel takip özeti",
            kCGPDFContextCreator as String: "Nefona"
        ]
        let pdf = UIGraphicsPDFRenderer(bounds: Self.paper, format: format)
        return pdf.pdfData { ctx in
            renderer.prepare(forDrawingPages: NSRange(location: 0, length: pages))
            for i in 0..<pages {
                ctx.beginPage()
                renderer.drawPage(at: i, in: ctx.pdfContextBounds)
            }
        }
    }

    private func cleanupPdf() {
        pdfWebView?.navigationDelegate = nil
        pdfWebView?.stopLoading()
        pdfWebView?.removeFromSuperview()
        pdfWebView = nil
        pdfCall = nil
    }

    private func failPdf(_ message: String) {
        let call = pdfCall
        cleanupPdf()
        call?.reject(message)
    }

    // MARK: - Dosya ve paylaşım

    private func writeTemp(_ data: Data, name: String) throws -> URL {
        let fm = FileManager.default
        let dir = fm.temporaryDirectory.appendingPathComponent("export", isDirectory: true)
        try? fm.removeItem(at: dir)
        try fm.createDirectory(at: dir, withIntermediateDirectories: true)
        let url = dir.appendingPathComponent(name)
        try data.write(to: url, options: [.atomic, .completeFileProtection])
        return url
    }

    /// Yalnız harf, rakam, "-", "_", "."; baştaki nokta ve boş ad kabul edilmez.
    private func safeName(_ raw: String?, fallback: String) -> String {
        let allowed = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: "-_."))
        let cleaned = String((raw ?? "").unicodeScalars.map { allowed.contains($0) ? Character($0) : "-" })
        return cleaned.isEmpty || cleaned.hasPrefix(".") ? fallback : cleaned
    }

    /// Yalnız ana thread. Paylaşım sayfası açıksa ya da açılıyorsa true (presentedViewController, present()
    /// çağrılır çağrılmaz dolar).
    private func sheetIsUp() -> Bool {
        var top = bridge?.viewController
        while let next = top?.presentedViewController {
            top = next
        }
        guard let shown = top else { return false }
        return shown is UIActivityViewController
    }

    private func present(_ url: URL, _ call: CAPPluginCall, attempt: Int = 0) {
        guard var top = bridge?.viewController else {
            call.reject("Görünüm yok")
            return
        }
        while let next = top.presentedViewController, !next.isBeingDismissed {
            top = next
        }
        // Üstte kapanmakta olan bir görünüm varsa UIKit present()'i yalnız günlüğe yazıp yok sayar; o zaman
        // tamamlanma hiç gelmez ve JS sözü askıda kalır. Kısa bekleyip yeniden dene; olmazsa reddet (söz hep biter).
        if top.presentedViewController != nil || top.isBeingDismissed || top.viewIfLoaded?.window == nil {
            if attempt < 5 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    self.present(url, call, attempt: attempt + 1)
                }
            } else {
                call.reject("Paylaşım sayfası açılamadı")
            }
            return
        }
        let sheet = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        // iPad: paylaşım sayfası açılır pencere olarak gösterilir, bir kaynak noktası şart
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = top.view
            pop.sourceRect = CGRect(x: top.view.bounds.midX, y: top.view.bounds.midY, width: 1, height: 1)
            pop.permittedArrowDirections = []
        }
        // Söz yalnız bir kez biter. iOS 13+: kullanıcı bir eklentiden (Mail, Mesajlar…) vazgeçince tamamlanma
        // (etkinlik, false) ile gelir ama sayfa açık kalır; asıl sonuç sayfa kapanınca ikinci çağrıda gelir.
        var settled = false
        let finish: (UIActivity.ActivityType?, Bool) -> Void = { activity, completed in
            if settled { return }
            settled = true
            call.resolve(["completed": completed, "activity": activity?.rawValue ?? ""])
        }
        sheet.completionWithItemsHandler = { [weak sheet] activity, completed, _, error in
            if settled { return }
            if let error = error {
                settled = true
                call.reject(error.localizedDescription)
                return
            }
            if !completed, activity != nil {
                // Bir sonraki turda bak: sayfa kapandıysa bitir, hâlâ açıksa sonraki çağrıyı bekle
                DispatchQueue.main.async {
                    if let open = sheet, open.presentingViewController != nil, !open.isBeingDismissed {
                        return
                    }
                    finish(activity, completed)
                }
                return
            }
            finish(activity, completed)
        }
        top.present(sheet, animated: true)
    }
}

/// A4 sayfa, kenar boşlukları ve alt bilgi ("Nefona · 26.09.2026 · 1/3").
private final class PageRenderer: UIPrintPageRenderer {
    private let paper: CGRect
    private let margins: UIEdgeInsets
    private let footer: String

    init(paper: CGRect, margins: UIEdgeInsets, footer: String) {
        self.paper = paper
        self.margins = margins
        self.footer = footer
        super.init()
        footerHeight = 18
    }

    override var paperRect: CGRect { paper }
    override var printableRect: CGRect { paper.inset(by: margins) }

    override func drawFooterForPage(at pageIndex: Int, in footerRect: CGRect) {
        let text = "\(footer) · \(pageIndex + 1)/\(numberOfPages)" as NSString
        let attrs: [NSAttributedString.Key: Any] = [
            .font: UIFont.systemFont(ofSize: 7.5),
            .foregroundColor: UIColor(white: 0.4, alpha: 1)
        ]
        let size = text.size(withAttributes: attrs)
        // Konum footerRect'e değil kağıda göre: alt kenar boşluğunun içinde, sağa yaslı (drawPage'e hangi
        // dikdörtgen verilirse verilsin aynı yer)
        let x = paper.maxX - margins.right - size.width
        let y = paper.maxY - margins.bottom + (margins.bottom - size.height) / 2
        text.draw(at: CGPoint(x: x, y: y), withAttributes: attrs)
    }
}
