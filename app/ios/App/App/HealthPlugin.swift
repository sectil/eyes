import Foundation
import HealthKit
import UserNotifications
import Capacitor

/// Apple Sağlık (HealthKit) — YALNIZ OKUMA. JS adı: "Health" (src/lib/native.js).
/// - isAvailable() → { available }
/// - requestAuthorization() → { requested } : iOS'un kendi izin sayfası. iOS, okuma izninin verilip verilmediğini
///   uygulamaya SÖYLEMEZ (gizlilik); izin yoksa sorgular boş/sıfır döner. JS bunu "veri yok" diye gösterir.
/// - dailyTotals({ days }) → { days: [{ date: 'YYYY-MM-DD', steps, distanceM, exerciseMin }] } (yerel gün, eskiden yeniye)
/// - recentSteps({ minutes }) → { steps } : son N dakikadaki adım ("kalk, biraz yürü" önerisi için)
/// - setWalkGuards({ guards: [{ id, date: 'YYYY-MM-DD', threshold }] }) → { count } : yürüyüş koruması (aşağıda WalkGuard)
/// - walkGuardLog() → { cancelled: [{ id, date, steps, at }] } : native'in sildiği yürüyüş bildirimleri; okununca temizlenir
///
/// KVKK: veri telefondan çıkmaz; sunucuya ve Nef'e gönderilmez. Yazma izni istenmez.
/// Okunan türler: adım, yürüme/koşu mesafesi, egzersiz dakikası (Apple'ın "Egzersiz" halkası).
@objc(HealthPlugin)
public class HealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthPlugin"
    public let jsName = "Health"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "dailyTotals", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "recentSteps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setWalkGuards", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "walkGuardLog", returnType: CAPPluginReturnPromise)
    ]

    private let store = HKHealthStore()

    private var readTypes: Set<HKObjectType> {
        var s = Set<HKObjectType>()
        for id in [HKQuantityTypeIdentifier.stepCount, .distanceWalkingRunning, .appleExerciseTime] {
            if let t = HKObjectType.quantityType(forIdentifier: id) { s.insert(t) }
        }
        return s
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Apple Sağlık bu cihazda yok", "UNAVAILABLE")
            return
        }
        store.requestAuthorization(toShare: [], read: readTypes) { ok, error in
            if let error = error {
                call.reject(error.localizedDescription, "AUTH_FAILED", error)
                return
            }
            call.resolve(["requested": ok])
        }
    }

    @objc func dailyTotals(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Apple Sağlık bu cihazda yok", "UNAVAILABLE")
            return
        }
        let days = max(1, min(call.getInt("days") ?? 7, 60))
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        guard let start = cal.date(byAdding: .day, value: -(days - 1), to: today) else {
            call.reject("Tarih hesaplanamadı", "DATE")
            return
        }
        let metrics: [(String, HKQuantityTypeIdentifier, HKUnit)] = [
            ("steps", .stepCount, .count()),
            ("distanceM", .distanceWalkingRunning, .meter()),
            ("exerciseMin", .appleExerciseTime, .minute())
        ]
        // gün anahtarı → metrik → değer (yalnız bu kuyrukta yazılır)
        var table: [String: [String: Double]] = [:]
        let lock = DispatchQueue(label: "nefona.health.table")
        let group = DispatchGroup()
        let fmt = DateFormatter()
        fmt.calendar = cal
        fmt.locale = Locale(identifier: "en_US_POSIX")
        fmt.timeZone = cal.timeZone
        fmt.dateFormat = "yyyy-MM-dd"

        for (key, id, unit) in metrics {
            guard let type = HKQuantityType.quantityType(forIdentifier: id) else { continue }
            group.enter()
            let q = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: HKQuery.predicateForSamples(withStart: start, end: Date(), options: .strictStartDate),
                options: .cumulativeSum,
                anchorDate: today,
                intervalComponents: DateComponents(day: 1)
            )
            q.initialResultsHandler = { _, results, _ in
                // Hata (ör. izin yok) → bu metrik boş kalır; diğerleri etkilenmez
                results?.enumerateStatistics(from: start, to: Date()) { stat, _ in
                    let v = stat.sumQuantity()?.doubleValue(for: unit) ?? 0
                    let d = fmt.string(from: stat.startDate)
                    lock.sync { table[d, default: [:]][key] = v }
                }
                group.leave()
            }
            store.execute(q)
        }

        group.notify(queue: .main) {
            var out: [[String: Any]] = []
            for i in 0..<days {
                guard let day = cal.date(byAdding: .day, value: i, to: start) else { continue }
                let d = fmt.string(from: day)
                let row = lock.sync { table[d] ?? [:] }
                out.append([
                    "date": d,
                    "steps": Int((row["steps"] ?? 0).rounded()),
                    "distanceM": Int((row["distanceM"] ?? 0).rounded()),
                    "exerciseMin": Int((row["exerciseMin"] ?? 0).rounded())
                ])
            }
            call.resolve(["days": out])
        }
    }

    @objc func recentSteps(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(), let type = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            call.reject("Apple Sağlık bu cihazda yok", "UNAVAILABLE")
            return
        }
        let minutes = max(5, min(call.getInt("minutes") ?? 60, 24 * 60))
        let end = Date()
        let start = end.addingTimeInterval(TimeInterval(-minutes * 60))
        let q = HKStatisticsQuery(
            quantityType: type,
            quantitySamplePredicate: HKQuery.predicateForSamples(withStart: start, end: end, options: []),
            options: .cumulativeSum
        ) { _, stat, _ in
            let v = stat?.sumQuantity()?.doubleValue(for: .count()) ?? 0
            call.resolve(["steps": Int(v.rounded()), "minutes": minutes])
        }
        store.execute(q)
    }

    /// JS planının kurulu yürüyüş bildirimleri (lib/notifyApply.js). Liste bütünüyle değişir; boş liste korumayı kapatır.
    /// Bozuk öğe atlanır. HealthKit yoksa da saklanır (WalkGuard başlamaz).
    @objc func setWalkGuards(_ call: CAPPluginCall) {
        let raw = call.getArray("guards", JSObject.self) ?? []
        let items = raw.compactMap { (g: JSObject) -> WalkGuard.Item? in
            guard let id = (g["id"] as? NSNumber)?.intValue,
                  let date = g["date"] as? String,
                  let threshold = (g["threshold"] as? NSNumber)?.doubleValue else {
                return nil
            }
            return WalkGuard.Item(id: id, date: date, threshold: threshold)
        }
        WalkGuard.shared.setItems(items)
        call.resolve(["count": items.count])
    }

    @objc func walkGuardLog(_ call: CAPPluginCall) {
        call.resolve(["cancelled": WalkGuard.shared.takeLog()])
    }
}

/// Yürüyüş koruması: günün adımı eşiğe ulaştıysa o günün yürüyüş hatırlatması gelmesin — uygulama o gün hiç açılmasa da.
/// - JS kurduğu yürüyüş bildirimlerini setWalkGuards ile verir: { id, date, threshold } (threshold = o saate dek beklenen
///   adım, lib/notifyPlan.js walkThreshold). UserDefaults'ta saklanır.
/// - HealthKit yeni adım kaydı yazınca uygulamayı arka planda uyandırır (stepCount için iOS'un izin verdiği en sık aralık
///   saatte bir). Bugünün adım toplamı (gece yarısından beri) ≥ eşik ise bekleyen bildirim silinir ve günlüğe yazılır.
/// - Bildirim kimliği: @capacitor/local-notifications 8.3.1 isteği String(id) ile kurar —
///   node_modules/@capacitor/local-notifications/ios/Sources/LocalNotificationsPlugin/LocalNotificationsPlugin.swift:178
///   (`notification["id"] as? Int`) ve :207 (`UNNotificationRequest(identifier: "\(identifier)", …)`).
/// - Yalnız HÂLÂ BEKLEYEN bildirim günlüğe yazılır: zaten gelmiş bir bildirimi "iptal" saymak ölçümü bozardı.
/// - Kilitli telefonda Sağlık verisi şifrelidir, sorgu hata verir: o uyanışta bir şey yapılmaz, sonraki uyanışta yeniden denenir.
/// - Koruma yoksa (yürüyüş kapalı ya da tarihleri geçmiş) uyandırma istenmez; önceden açıldıysa kapatılır.
/// - Yetki: App.entitlements com.apple.developer.healthkit.background-delivery (iOS 15+ zorunlu). Otomatik imzada
///   profile kendiliğinden eklenmesi VARSAYIM; Mac'te doğrulanacak.
final class WalkGuard {
    static let shared = WalkGuard()

    struct Item {
        let id: Int
        let date: String       // 'YYYY-MM-DD' yerel gün
        let threshold: Double  // bu adıma ulaşılırsa o günün bildirimi silinir
    }

    private static let itemsKey = "nefona.walkGuards"
    private static let logKey = "nefona.walkGuardLog"
    private static let deliveryKey = "nefona.walkGuardDelivery" // background delivery açıldı mı (kapatmayı unutmamak için)
    private static let logLimit = 60                            // taşma koruması; JS açılışta okuyup temizler

    private let store = HKHealthStore()
    private let queue = DispatchQueue(label: "nefona.walkguard") // UserDefaults oku-yaz ve observer yalnız bu kuyrukta
    private let defaults = UserDefaults.standard
    private var observer: HKObserverQuery?

    private init() {}

    private var stepType: HKQuantityType? {
        return HKQuantityType.quantityType(forIdentifier: .stepCount)
    }

    /// AppDelegate açılışında çağrılır: arka plan uyandırmasında HealthKit'in haber vereceği gözlemci hazır olmalı (Apple).
    /// Tekrar çağrı zararsız. Kuyruk kısa işler taşıdığından sync güvenli (bu kuyruktan çağrılmaz).
    func start() {
        queue.sync {
            self.startLocked()
        }
    }

    func setItems(_ items: [Item]) {
        queue.sync {
            self.saveItems(items)
            self.startLocked()
        }
    }

    /// Günlüğü döndürür ve temizler.
    func takeLog() -> [[String: Any]] {
        return queue.sync { () -> [[String: Any]] in
            let log = self.loadLog()
            self.defaults.removeObject(forKey: WalkGuard.logKey)
            return log
        }
    }

    // MARK: - Kuyruk içi

    /// Yerel gün anahtarı ('yyyy-MM-dd', JS dayKey ile aynı biçim) ve o günün gece yarısı, TEK takvim anlık
    /// görüntüsünden. Her çağrıda yeniden kurulur: açılışta sabitlenen saat dilimi (tekil nesne süreç boyunca yaşar)
    /// yolculukta eskiyordu; gün anahtarı eski bölgeden, adım sorgusunun gece yarısı yeni bölgeden hesaplanınca
    /// yarının yürüyüş hatırlatması silinebiliyordu. dailyTotals'taki gibi biçimleyici takvimin bölgesini kullanır.
    private func localDay(_ date: Date) -> (key: String, start: Date) {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone.autoupdatingCurrent
        let fmt = DateFormatter()
        fmt.calendar = cal
        fmt.locale = Locale(identifier: "en_US_POSIX")
        fmt.timeZone = cal.timeZone
        fmt.dateFormat = "yyyy-MM-dd"
        return (fmt.string(from: date), cal.startOfDay(for: date))
    }

    private func startLocked() {
        guard HKHealthStore.isHealthDataAvailable(), let type = stepType else { return }
        // Tarihi geçmiş korumalar atılır
        let today = localDay(Date()).key
        let all = loadItems()
        let active = all.filter { $0.date >= today }
        if active.count != all.count { saveItems(active) }
        guard !active.isEmpty else {
            stopLocked()
            return
        }
        guard observer == nil else { return }

        let q = HKObserverQuery(sampleType: type, predicate: nil) { [weak self] _, completionHandler, error in
            // completionHandler HER YOLDA çağrılır: çağrılmazsa HealthKit uyandırmayı seyreltir, sonra bırakır.
            guard let self = self, error == nil else {
                completionHandler()
                return
            }
            self.check(completion: completionHandler)
        }
        observer = q
        store.execute(q)
        defaults.set(true, forKey: WalkGuard.deliveryKey)
        store.enableBackgroundDelivery(for: type, frequency: .hourly) { _, _ in
            // Hata (ör. yetki profilde yok) → yalnız uygulama açıkken denetlenir; JS planı yine son okumaya göre kurar.
        }
    }

    private func stopLocked() {
        if let q = observer {
            store.stop(q)
            observer = nil
        }
        guard defaults.bool(forKey: WalkGuard.deliveryKey), let type = stepType else { return }
        defaults.set(false, forKey: WalkGuard.deliveryKey)
        store.disableBackgroundDelivery(for: type) { _, _ in }
    }

    /// Bugünün korumalarını adım toplamıyla karşılaştırır; completion her yolda bir kez çağrılır.
    private func check(completion: @escaping () -> Void) {
        queue.async {
            let now = Date()
            let day = self.localDay(now) // gün anahtarı ve sorgu başlangıcı aynı bölgeden
            let due = self.loadItems().filter { $0.date == day.key }
            guard !due.isEmpty, let type = self.stepType else {
                completion()
                return
            }
            let q = HKStatisticsQuery(
                quantityType: type,
                quantitySamplePredicate: HKQuery.predicateForSamples(
                    withStart: day.start, end: now, options: .strictStartDate),
                options: .cumulativeSum
            ) { _, stat, _ in
                // Hata (kilitli telefon, izin yok, veri yok) → bu uyanışta bir şey yapılmaz
                guard let steps = stat?.sumQuantity()?.doubleValue(for: .count()) else {
                    completion()
                    return
                }
                let reached = due.filter { steps >= $0.threshold }
                guard !reached.isEmpty else {
                    completion()
                    return
                }
                self.cancel(reached, steps: steps, completion: completion)
            }
            self.store.execute(q)
        }
    }

    private func cancel(_ reached: [Item], steps: Double, completion: @escaping () -> Void) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { requests in
            let pending = Set(requests.map { $0.identifier })
            let hits = reached.filter { pending.contains(String($0.id)) }
            if !hits.isEmpty {
                center.removePendingNotificationRequests(withIdentifiers: hits.map { String($0.id) })
            }
            self.queue.async {
                // Eşiğe ulaşan korumalar bugün için bitti (bildirim silindi ya da zaten gelmişti). Arada JS listeyi
                // değiştirmiş olabilir: yalnız aynı (id, tarih) çıkarılır.
                let done = Set(reached.map { "\($0.id)|\($0.date)" })
                self.saveItems(self.loadItems().filter { !done.contains("\($0.id)|\($0.date)") })
                if !hits.isEmpty {
                    let at = ISO8601DateFormatter().string(from: Date())
                    var log = self.loadLog()
                    for g in hits {
                        log.append(["id": g.id, "date": g.date, "steps": Int(steps.rounded()), "at": at])
                    }
                    self.saveLog(Array(log.suffix(WalkGuard.logLimit)))
                }
                completion()
            }
        }
    }

    // MARK: - Saklama (JSON → UserDefaults)

    private func loadItems() -> [Item] {
        return readJSON(WalkGuard.itemsKey).compactMap { (d: [String: Any]) -> Item? in
            guard let id = (d["id"] as? NSNumber)?.intValue,
                  let date = d["date"] as? String,
                  let threshold = (d["threshold"] as? NSNumber)?.doubleValue else {
                return nil
            }
            return Item(id: id, date: date, threshold: threshold)
        }
    }

    private func saveItems(_ items: [Item]) {
        writeJSON(WalkGuard.itemsKey, items.map { (i: Item) -> [String: Any] in
            ["id": i.id, "date": i.date, "threshold": i.threshold]
        })
    }

    private func loadLog() -> [[String: Any]] {
        return readJSON(WalkGuard.logKey)
    }

    private func saveLog(_ log: [[String: Any]]) {
        writeJSON(WalkGuard.logKey, log)
    }

    private func readJSON(_ key: String) -> [[String: Any]] {
        guard let data = defaults.data(forKey: key),
              let list = (try? JSONSerialization.jsonObject(with: data)) as? [[String: Any]] else {
            return []
        }
        return list
    }

    private func writeJSON(_ key: String, _ list: [[String: Any]]) {
        if list.isEmpty {
            defaults.removeObject(forKey: key)
            return
        }
        if let data = try? JSONSerialization.data(withJSONObject: list) {
            defaults.set(data, forKey: key)
        }
    }
}
