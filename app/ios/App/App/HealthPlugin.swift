import Foundation
import HealthKit
import Capacitor

/// Apple Sağlık (HealthKit) — YALNIZ OKUMA. JS adı: "Health" (src/lib/native.js).
/// - isAvailable() → { available }
/// - requestAuthorization() → { requested } : iOS'un kendi izin sayfası. iOS, okuma izninin verilip verilmediğini
///   uygulamaya SÖYLEMEZ (gizlilik); izin yoksa sorgular boş/sıfır döner. JS bunu "veri yok" diye gösterir.
/// - dailyTotals({ days }) → { days: [{ date: 'YYYY-MM-DD', steps, distanceM, exerciseMin }] } (yerel gün, eskiden yeniye)
/// - recentSteps({ minutes }) → { steps } : son N dakikadaki adım ("kalk, biraz yürü" önerisi için)
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
        CAPPluginMethod(name: "recentSteps", returnType: CAPPluginReturnPromise)
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
}
