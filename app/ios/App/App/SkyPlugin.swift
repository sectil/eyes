// HEDEFTE DEĞİL (2026-10-01): bu dosya Xcode hedefine eklenmedi ve MainViewController kaydı yok; bu ortamda derlenemedi.
// Açmak için: Xcode'da App hedefine ekle, MainViewController'a registerPluginInstance(SkyPlugin()) yaz, WeatherKit
// yeteneğini ve entitlement'ı ekle, derle, DOĞRULA notlarını kapat; sonra App.jsx SKY_UI = true.
// Info.plist NSLocationWhenInUseUsageDescription (sahip onaylı, rizalar-taslak.md): "Bulunduğun yerin havasını göstermek
// için yaklaşık konumunu kullanırım. Konum yuvarlanarak Apple'ın hava servisine gider; telefonda yalnız il ve ilçe adı kalır."
import Foundation
import CoreLocation
import Capacitor
#if canImport(WeatherKit)
import WeatherKit
#endif

/// Hava (B2; PLAN.v1 §B.1, §5.5 madde 7). JS adı: "Sky" (lib/sky.js). Arayüz App.jsx'teki SKY_UI bayrağının arkasında.
/// WeatherKit Swift çerçevesi: anahtar yok, yetki (App.entitlements → com.apple.developer.weatherkit) ve App ID'de
/// WeatherKit servisi ile çalışır.
///
/// SKY_UI AÇILMADAN ÖNCE (Mac'te; bayrak kapalıyken derlemeye girmesin diye bu turda EKLENMEDİ):
///   1. App.entitlements: <key>com.apple.developer.weatherkit</key><true/> (App ID'de WeatherKit hem Capability hem
///      App Service açık olmalı; yoksa forecast PERMISSION döner, profil eksikse imzalama düşer).
///   2. Info.plist: NSLocationWhenInUseUsageDescription (onaylı metin bekleniyor; hukukçu adı gelmeden konum izni App
///      Store'a gitmez, PLAN.v1 §B.1) ve NSLocationDefaultAccuracyReduced = true. Anahtar yokken iOS pencere açmaz;
///      requestLocation zaman aşımıyla { status: "notDetermined" } döner, JS il ve ilçe listesine düşer. WeatherKit iOS 16+ (`weatherkit_weather.json`); iOS 15'te available: false.
/// WeatherKit zayıf bağlı (OTHER_LDFLAGS -weak_framework WeatherKit); her çağrı #available ile korunur.
///
/// Gizlilik (PLAN.v1 §B.1): konum yalnız "Kullanırken" (requestWhenInUseAuthorization), varsayılan yaklaşık
/// (Info.plist NSLocationDefaultAccuracyReduced + desiredAccuracy = kCLLocationAccuracyReduced); kesin konum yalnız JS
/// `precise: true` isterse ve kişi iOS penceresinde ya da Ayarlar'da "Kesin Konum"u kendisi açtıysa (geçici kesin konum,
/// requestTemporaryFullAccuracyAuthorization, B2'de İSTENMEZ). "Kesin" yalnız G yolunu ("…'de misin?") açar; koordinat
/// yine 2 ondalığa (≈ 1 km) yuvarlanır, bu da en yakın ilçe merkezini önermeye yeter. Koordinat her zaman 2 ondalığa yuvarlanır
/// (41.0082 → 41.01) ve yuvarlanmış hâli JS'e ve WeatherKit'e gider; ham koordinat bu dosyadan çıkmaz, hiçbir yere
/// yazılmaz. Ters coğrafi kodlama YOK (CLGeocoder / MKReverseGeocodingRequest kullanılmaz). İl ve ilçe JS'te tablodan.
///
/// - isAvailable() → { available, iosMajor } : iOS 16+ mı (WeatherKit); iosMajor = işletim sistemi ana sürümü
/// - locationStatus() → { status: notDetermined|denied|restricted|whenInUse|always, accuracy: full|reduced, enabled }
/// - requestLocation({ precise? }) → { status, accuracy, lat?, lon? } : izin sorulmamışsa iOS penceresini açar
///   ("Kullanırken"), sonra tek sefer konum alır. İzin yoksa lat/lon dönmez (reddetmez; JS il/ilçe listesine düşer).
///   Zaman aşımı: izin penceresi AUTH_TIMEOUT içinde cevaplanmazsa (pencere hiç çıkmadı: uygulama arka planda, Info.plist
///   anahtarı yok) { status: "notDetermined" } döner; konum FIX_TIMEOUT içinde gelmezse LOCATION koduyla reddedilir.
/// - forecast({ lat, lon, hours = 24, days = 2, rainChance = 0.5 }) → { fetchedAt, lat, lon, now, hours: [...],
///   days: [...], rain? } : zamanlar ms (epoch), sıcaklık °C, olasılık 0–1. `rain` = saatlik şeritte olasılığı
///   `rainChance`'e eşit ya da üstünde olan ilk kesintisiz aralık { from, to, chance } (to = son saatin bitişi).
///   Hata kodları: UNAVAILABLE (iOS 15), ARGS, PERMISSION (WeatherError.permissionDenied: yetki/App ID eksik), WEATHER.
/// - attribution() → { serviceName, legalPageURL, combinedMarkLightURL, combinedMarkDarkURL, squareMarkURL,
///   legalAttributionText? } : Ana sayfa kartındaki "Apple Weather" işareti ve "Veri kaynakları" bağlantısı.
/// - setMorningKit({ place: { lat, lon, label }, templates: [{ id, cell, text }], hours: { "21": { LOC, ABL, DAT } },
///   delayMin }) → { stored: false } : SAPLAMA. 2. katman (AlarmKit stopIntent) bu turda yok; hiçbir şey saklanmaz.
/// - takeLocalRefresh() → { } : SAPLAMA. "Yerelde yenilendi" işareti ({ date, at }) 2. katmanla gelir; şimdilik hep boş.
///
/// VARSAYIM: `rainChance` varsayılanı 0.5 ürün kararı değildir; eşiği JS (lib/sky.js) verir.
@objc(SkyPlugin)
public class SkyPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "SkyPlugin"
    public let jsName = "Sky"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "locationStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestLocation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "forecast", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "attribution", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setMorningKit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeLocalRefresh", returnType: CAPPluginReturnPromise)
    ]

    // MARK: - Konum ("Kullanırken", varsayılan yaklaşık)

    /// Yalnız ana kuyrukta oluşturulur ve kullanılır (temsilci geri çağrıları oluşturulduğu iş parçacığına gelir).
    private var manager: CLLocationManager?
    /// İzin penceresinin cevabını bekleyen çağrılar (ana kuyruk).
    private var waitingAuth: [(call: CAPPluginCall, precise: Bool)] = []
    /// Konumu bekleyen çağrılar (ana kuyruk).
    private var waitingFix: [(call: CAPPluginCall, precise: Bool)] = []
    /// VARSAYIM (ürün kararı değil): izin penceresini cevaplamaya 120 sn, tek sefer konuma 20 sn.
    static let AUTH_TIMEOUT: TimeInterval = 120
    static let FIX_TIMEOUT: TimeInterval = 20

    /// `corelocation__cllocationmanager.json`: init(), delegate. Ana kuyrukta çağrılır.
    private func locationManager() -> CLLocationManager {
        if let m = manager { return m }
        let m = CLLocationManager()
        m.delegate = self
        // Varsayılan yaklaşık (`corelocation__cllocationmanager__desiredaccuracy.json`, kCLLocationAccuracyReduced).
        m.desiredAccuracy = kCLLocationAccuracyReduced
        manager = m
        return m
    }

    /// 2 ondalığa yuvarlama: 41.0082 → 41.01 (≈ 1 km). Ham değer saklanmaz.
    static func round2(_ x: Double) -> Double {
        return (x * 100).rounded() / 100
    }

    /// `authorizationStatus` (iOS 14+, CLLocationManager örnek özelliği; `corelocation__cllocationmanager.json`).
    private static func statusName(_ s: CLAuthorizationStatus) -> String {
        switch s {
        case .notDetermined: return "notDetermined"
        case .restricted: return "restricted"
        case .denied: return "denied"
        case .authorizedWhenInUse: return "whenInUse"
        case .authorizedAlways: return "always"
        @unknown default: return "denied"
        }
    }

    /// `accuracyAuthorization` (`corelocation_cllocationmanager_accuracyauthorization.json`).
    private static func accuracyName(_ a: CLAccuracyAuthorization) -> String {
        return a == .fullAccuracy ? "full" : "reduced"
    }

    private static func isAuthorized(_ s: CLAuthorizationStatus) -> Bool {
        return s == .authorizedWhenInUse || s == .authorizedAlways
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            call.resolve(["available": true, "iosMajor": ProcessInfo.processInfo.operatingSystemVersion.majorVersion])
        } else {
            call.resolve(["available": false, "iosMajor": ProcessInfo.processInfo.operatingSystemVersion.majorVersion])
        }
    }

    @objc func locationStatus(_ call: CAPPluginCall) {
        // locationServicesEnabled() ana kuyrukta çağrılınca Xcode 14+ "UI unresponsiveness" uyarısı verir: arka planda.
        DispatchQueue.global(qos: .userInitiated).async {
            let enabled = CLLocationManager.locationServicesEnabled()
            DispatchQueue.main.async {
                let m = self.locationManager()
                call.resolve([
                    "status": SkyPlugin.statusName(m.authorizationStatus),
                    "accuracy": SkyPlugin.accuracyName(m.accuracyAuthorization),
                    "enabled": enabled
                ])
            }
        }
    }

    @objc func requestLocation(_ call: CAPPluginCall) {
        let precise = call.getBool("precise") ?? false
        DispatchQueue.main.async {
            let m = self.locationManager()
            let s = m.authorizationStatus
            if s == .notDetermined {
                self.waitingAuth.append((call, precise))
                self.expireAuth(call)
                // Yalnız "Kullanırken" (`corelocation__requesting-authorization-to-use-location-services.json`).
                // "Her Zaman" (requestAlwaysAuthorization) bu eklentide YOK.
                if self.waitingAuth.count == 1 { m.requestWhenInUseAuthorization() }
                return
            }
            if !SkyPlugin.isAuthorized(s) {
                call.resolve(["status": SkyPlugin.statusName(s), "accuracy": SkyPlugin.accuracyName(m.accuracyAuthorization)])
                return
            }
            self.startFix(call, precise: precise)
        }
    }

    /// Ana kuyrukta. Tek sefer konum: requestLocation() (`corelocation__cllocationmanager.json`).
    private func startFix(_ call: CAPPluginCall, precise: Bool) {
        let m = locationManager()
        waitingFix.append((call, precise))
        expireFix(call)
        // Kesin konum yalnız istenirse VE kişi kesin konuma izin verdiyse; yoksa yaklaşık.
        let wantFull = waitingFix.contains { $0.precise } && m.accuracyAuthorization == .fullAccuracy
        m.desiredAccuracy = wantFull ? kCLLocationAccuracyHundredMeters : kCLLocationAccuracyReduced
        if waitingFix.count == 1 { m.requestLocation() }
    }

    /// Ana kuyrukta. Pencere cevaplanmadıysa çağrı bekleme listesinden çıkar ve "notDetermined" ile sonuçlanır.
    private func expireAuth(_ call: CAPPluginCall) {
        let id = call.callbackId
        DispatchQueue.main.asyncAfter(deadline: .now() + SkyPlugin.AUTH_TIMEOUT) {
            guard let i = self.waitingAuth.firstIndex(where: { $0.call.callbackId == id }) else { return }
            let p = self.waitingAuth.remove(at: i)
            let m = self.locationManager()
            p.call.resolve(["status": SkyPlugin.statusName(m.authorizationStatus), "accuracy": SkyPlugin.accuracyName(m.accuracyAuthorization)])
        }
    }

    /// Ana kuyrukta. Konum gelmediyse çağrı reddedilir (JS: 'unavailable' → il ve ilçe listesi).
    private func expireFix(_ call: CAPPluginCall) {
        let id = call.callbackId
        DispatchQueue.main.asyncAfter(deadline: .now() + SkyPlugin.FIX_TIMEOUT) {
            guard let i = self.waitingFix.firstIndex(where: { $0.call.callbackId == id }) else { return }
            let p = self.waitingFix.remove(at: i)
            if self.waitingFix.isEmpty { self.manager?.desiredAccuracy = kCLLocationAccuracyReduced }
            p.call.reject("Konum zaman aşımı", "LOCATION")
        }
    }

    /// `locationManagerDidChangeAuthorization(_:)` (`corelocation__cllocationmanager.json`, CLLocationManagerDelegate).
    public func locationManagerDidChangeAuthorization(_ m: CLLocationManager) {
        let s = m.authorizationStatus
        if s == .notDetermined { return } // pencere henüz cevaplanmadı (temsilci atanınca da çağrılır)
        let pending = waitingAuth
        waitingAuth.removeAll()
        for p in pending {
            if SkyPlugin.isAuthorized(s) {
                startFix(p.call, precise: p.precise)
            } else {
                p.call.resolve(["status": SkyPlugin.statusName(s), "accuracy": SkyPlugin.accuracyName(m.accuracyAuthorization)])
            }
        }
    }

    /// `locationManager(_:didUpdateLocations:)` (CLLocationManagerDelegate).
    public func locationManager(_ m: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        let pending = waitingFix
        waitingFix.removeAll()
        let full = m.accuracyAuthorization == .fullAccuracy && m.desiredAccuracy != kCLLocationAccuracyReduced
        // Yuvarlanmış değer; ham koordinat burada kalır ve atılır.
        let lat = SkyPlugin.round2(loc.coordinate.latitude)
        let lon = SkyPlugin.round2(loc.coordinate.longitude)
        m.desiredAccuracy = kCLLocationAccuracyReduced
        for p in pending {
            p.call.resolve([
                "status": SkyPlugin.statusName(m.authorizationStatus),
                "accuracy": (full && p.precise) ? "full" : "reduced",
                "lat": lat,
                "lon": lon
            ])
        }
    }

    /// `locationManager(_:didFailWithError:)` (CLLocationManagerDelegate).
    public func locationManager(_ m: CLLocationManager, didFailWithError error: Error) {
        let pending = waitingFix
        waitingFix.removeAll()
        m.desiredAccuracy = kCLLocationAccuracyReduced
        for p in pending {
            p.call.reject("Konum alınamadı: \(error.localizedDescription)", "LOCATION", error)
        }
    }

    // MARK: - WeatherKit

    @objc func forecast(_ call: CAPPluginCall) {
        guard let rawLat = call.getDouble("lat"), let rawLon = call.getDouble("lon"),
              rawLat >= -90, rawLat <= 90, rawLon >= -180, rawLon <= 180 else {
            call.reject("lat ve lon gerekli", "ARGS")
            return
        }
        let hours = max(1, min(call.getInt("hours") ?? 24, 48))
        let days = max(1, min(call.getInt("days") ?? 2, 10))
        let rainChance = max(0, min(call.getDouble("rainChance") ?? 0.5, 1))
        // JS tablodan ilçe merkezi verse de yuvarlanır: WeatherKit'e hep 2 ondalık gider.
        let lat = SkyPlugin.round2(rawLat)
        let lon = SkyPlugin.round2(rawLon)
        #if canImport(WeatherKit)
        if #available(iOS 16.0, *) {
            Task {
                do {
                    let out = try await SkyWeather.fetch(lat: lat, lon: lon, hours: hours, days: days, rainChance: rainChance)
                    call.resolve(out)
                } catch {
                    let (code, msg) = SkyWeather.describe(error)
                    call.reject(msg, code, error)
                }
            }
            return
        }
        #endif
        call.reject("Hava iOS 16 ve üstünde", "UNAVAILABLE")
    }

    @objc func attribution(_ call: CAPPluginCall) {
        #if canImport(WeatherKit)
        if #available(iOS 16.0, *) {
            Task {
                do {
                    call.resolve(try await SkyWeather.attribution())
                } catch {
                    let (code, msg) = SkyWeather.describe(error)
                    call.reject(msg, code, error)
                }
            }
            return
        }
        #endif
        call.reject("Hava iOS 16 ve üstünde", "UNAVAILABLE")
    }

    // MARK: - 2. katman (PLAN.v1 §5.5 madde 7) — SAPLAMA, bu turda yok

    /// İmza: setMorningKit({ place: { lat, lon, label }, templates: [{ id, cell, text }],
    /// hours: { "21": { LOC: "21.00'de", ABL: "21.00'den", DAT: "21.00'e" }, … }, delayMin }).
    /// Katman 2 (AlarmKit stopIntent) gelene kadar hiçbir şey saklanmaz; JS 1. katmanla sürer.
    @objc func setMorningKit(_ call: CAPPluginCall) {
        call.resolve(["stored": false])
    }

    /// İmza: takeLocalRefresh() → { date, at }. Saplama: işaret hiç yazılmadığı için hep boş döner ({}).
    @objc func takeLocalRefresh(_ call: CAPPluginCall) {
        call.resolve([:])
    }
}

#if canImport(WeatherKit)
/// WeatherKit çağrıları (iOS 16+). İmzalar arastirma/apple-json/ altındaki dosyalardan:
/// - WeatherService.shared (`weatherkit_weatherservice_shared.json`)
/// - weather(for: CLLocation, including: WeatherQuery<T1>, WeatherQuery<T2>) async throws -> (T1, T2)
///   (`weatherkit_weatherservice_shared.json` başvuruları; örnek `weatherkit_weatherquery.json`)
/// - WeatherQuery.hourly(startDate:endDate:), .daily(startDate:endDate:) (`weatherkit_weatherquery.json`,
///   `weatherkit_weatherquery_hourlystartdate-enddate-.json`)
/// - HourWeather: date, temperature, apparentTemperature, precipitationChance, symbolName, isDaylight
///   (`weatherkit_hourweather.json`)
/// - DayWeather: date, highTemperature, lowTemperature, precipitationChance, symbolName (`weatherkit_dayweather.json`)
/// - WeatherError.permissionDenied / .unknown (`weatherkit_weathererror.json`)
/// - WeatherAttribution: serviceName, legalPageURL, combinedMarkLightURL, combinedMarkDarkURL, squareMarkURL,
///   legalAttributionText (iOS 16.4) (`weatherkit_weatherattribution_*.json`)
@available(iOS 16.0, *)
enum SkyWeather {
    static let service = WeatherService.shared

    static func ms(_ d: Date) -> Double {
        return (d.timeIntervalSince1970 * 1000).rounded()
    }

    static func celsius(_ m: Measurement<UnitTemperature>) -> Double {
        // Bir ondalık: JS yuvarlar; burada yalnız gereksiz basamak atılır.
        return (m.converted(to: .celsius).value * 10).rounded() / 10
    }

    static func chance(_ x: Double) -> Double {
        return (max(0, min(x, 1)) * 100).rounded() / 100
    }

    static func dayKey(_ d: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone.current
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: d)
    }

    static func fetch(lat: Double, lon: Double, hours: Int, days: Int, rainChance: Double) async throws -> [String: Any] {
        let now = Date()
        let cal = Calendar.current
        let hourStart = cal.dateInterval(of: .hour, for: now)?.start ?? now
        let hourEnd = hourStart.addingTimeInterval(Double(hours) * 3600)
        let dayStart = cal.startOfDay(for: now)
        let dayEnd = cal.date(byAdding: .day, value: days, to: dayStart) ?? dayStart.addingTimeInterval(Double(days) * 86400)

        // DOĞRULA: CLLocation(latitude:longitude:) başlatıcısı eldeki Apple belgelerinde yok (yalnız CLLocation türü
        // weather(for:) imzasında geçiyor).
        let place = CLLocation(latitude: lat, longitude: lon)
        let (hourly, daily): (Forecast<HourWeather>, Forecast<DayWeather>) = try await service.weather(
            for: place,
            including: .hourly(startDate: hourStart, endDate: hourEnd),
            .daily(startDate: dayStart, endDate: dayEnd)
        )

        var hourRows: [[String: Any]] = []
        var nowRow: [String: Any]? = nil
        var rain: [String: Any]? = nil
        var rainOpen = true // ilk kesintisiz aralık kapanınca false
        // DOĞRULA: Forecast<T>'nin Sequence/RandomAccessCollection olduğu eldeki belgelerde yok
        // (`weatherkit_weather.json` yalnız `Forecast<HourWeather>` türünü veriyor). Değilse `hourly.forecast` dizisi.
        for h in hourly {
            let at = h.date
            let row: [String: Any] = [
                "at": ms(at),
                "tempC": celsius(h.temperature),
                "precipChance": chance(h.precipitationChance),
                "symbol": h.symbolName
            ]
            hourRows.append(row)
            if nowRow == nil, at <= now, now < at.addingTimeInterval(3600) {
                nowRow = [
                    "at": ms(at),
                    "tempC": celsius(h.temperature),
                    "apparentC": celsius(h.apparentTemperature),
                    "precipChance": chance(h.precipitationChance),
                    "symbol": h.symbolName,
                    "isDaylight": h.isDaylight
                ]
            }
            // Yağmur aralığı: şimdiki saatten başlayarak, eşiği geçen ilk kesintisiz saatler.
            guard rainOpen, at.addingTimeInterval(3600) > now else { continue }
            if h.precipitationChance >= rainChance {
                if var r = rain {
                    r["to"] = ms(at.addingTimeInterval(3600))
                    r["chance"] = max(r["chance"] as? Double ?? 0, chance(h.precipitationChance))
                    rain = r
                } else {
                    rain = ["from": ms(at), "to": ms(at.addingTimeInterval(3600)), "chance": chance(h.precipitationChance)]
                }
            } else if rain != nil {
                rainOpen = false
            }
        }

        var dayRows: [[String: Any]] = []
        // DOĞRULA: Forecast<DayWeather> üzerinde döngü (yukarıdaki notla aynı).
        for d in daily {
            dayRows.append([
                "date": dayKey(d.date),
                "highC": celsius(d.highTemperature),
                "lowC": celsius(d.lowTemperature),
                "precipChance": chance(d.precipitationChance),
                "symbol": d.symbolName
            ])
        }

        var out: [String: Any] = [
            "fetchedAt": ms(now),
            "lat": lat,
            "lon": lon,
            "hours": hourRows,
            "days": dayRows
        ]
        if let n = nowRow ?? hourRows.first { out["now"] = n }
        if let r = rain { out["rain"] = r }
        return out
    }

    static func attribution() async throws -> [String: Any] {
        // DOĞRULA: WeatherService.attribution (async throws özellik) eldeki belgelerde yok; yalnız WeatherAttribution
        // türünün alanları var (`weatherkit_weatherattribution_*.json`). Mac'te Xcode'da imzayı doğrula.
        let a = try await service.attribution
        var out: [String: Any] = [
            "serviceName": a.serviceName,
            "legalPageURL": a.legalPageURL.absoluteString,
            "combinedMarkLightURL": a.combinedMarkLightURL.absoluteString,
            "combinedMarkDarkURL": a.combinedMarkDarkURL.absoluteString,
            "squareMarkURL": a.squareMarkURL.absoluteString
        ]
        if #available(iOS 16.4, *) {
            out["legalAttributionText"] = a.legalAttributionText
        }
        return out
    }

    /// Hata kodu: WeatherError yalnız permissionDenied ve unknown (`weatherkit_weathererror.json`); kota aşımı ayrı
    /// türle gelmez. permissionDenied çoğunlukla yetki (entitlement) ya da App ID'de WeatherKit servisi eksik demek.
    static func describe(_ error: Error) -> (String, String) {
        if let w = error as? WeatherError {
            switch w {
            case .permissionDenied: return ("PERMISSION", "WeatherKit izni yok")
            default: return ("WEATHER", "Hava alınamadı: \(w.localizedDescription)")
            }
        }
        return ("WEATHER", "Hava alınamadı: \(error.localizedDescription)")
    }
}
#endif
