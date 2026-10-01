// Denetim bulgularının kapsamı (gelisim-merkezi DENETIM.md; PLAN §8.4 "her bulgu bir test olur"; DEVIR §0 "G1'in
// içinde kapanır"). DENETIM.md'deki her kimlik (K1–K4, Ö-1…Ö-12, Kü-1…Kü-14) ya bir testle kapanır (CLOSED: dosya ve test
// adı; test adı dosyada gerçekten bulunmalı) ya da açık olduğu, nedeni ve sahibiyle burada yazılıdır (OPEN). Ekran yarısı
// G2'ye kalan bulgu iki listede de durur (veri yarısı kapandı, ekran yarısı açık). Yeni bir bulgu DENETIM'e eklenirse ya
// da bir bulgu kapanırsa bu test listeyi güncellemeyi zorlar.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const DENETIM = '../../../docs/yol-haritasi/tasarim/gelisim-merkezi/DENETIM.md'

// kimlik → [[dosya (src/lib'e göre), test ya da describe adının bir parçası], …]
const CLOSED = {
  K1: [['./growth.audit.test.js', 'K1 (B-A)'], ['./growthCenter.test.js', 'K1: alan hükmü haritanın iç alan hükümleriyle aynı kaynaktan'], ['./growth.consumers.test.js', 'K1, K3 (A-S1b)'], ['./growth.single.test.js', 'growthCenter ≡ PDF modeli ≡ PDF metni']],
  K2: [['./growthCenter.test.js', 'K2: göz için tek "şimdi" değeri'], ['./growth.consumers.test.js', 'B-A: aynı depodan metrik hükmü, etkiler, WHO-5 ve göz "şimdi" değeri aynı'], ['./growth.single.test.js', 'growthCenter ≡ PDF modeli']],
  K3: [['./growth.audit.test.js', 'K3 (A-S1b)'], ['./growth.audit.test.js', 'K3 (A-S1)'], ['./progress.v2.test.js', 'iki haftalık bakışta sürerse "worse"']],
  K4: [['./growth.audit.test.js', 'K4 (A-S2)'], ['./growth.audit.test.js', 'K4 (A-S3b)'], ['./progress.v2.test.js', 'aynı günün beş turu tek nokta']],
  'Ö-1': [['./growth.audit.test.js', 'Ö-1 (A-S9, B-D)'], ['./growthCenter.test.js', 'Ö-1: yalnız yoga']],
  'Ö-3': [['./growth.audit.test.js', 'Ö-3 (A-S5)'], ['./growth.consumers.test.js', 'Ö-3 (A-S5)']],
  'Ö-4': [['./growth.consumers.test.js', 'Ö-4 (A-S6)']],
  'Ö-5': [['./growth.audit.test.js', 'Kü-1, Ö-5 (A-S4)']],
  'Ö-6': [['./growth.consumers.test.js', '5. gün raporu: WHO-5 (Ö-6)']],
  'Ö-7': [['./growth.consumers.test.js', 'CSV: alışkanlık ve adımlı gün satırları (Ö-7, Ö-9)']],
  'Ö-8': [['./growth.consumers.test.js', 'Ö-8: belirgin etkinin yönü'], ['./changeText.test.js', 'etki puanın kendi yönüyle yazılır (Ö-8)']],
  'Ö-9': [['./growth.audit.test.js', 'Ö-9 (A-S7)'], ['./growthCenter.test.js', 'Apple Sağlık: kendi ortancasına ulaşan gün']],
  // Ö-10: kapanan yalnız cevap → alan eşlemesinin tek yerde olması. (b) "iris hücreleri merkezden"
  // işlev düzeyinde hazır (irisCells hub parametresi, growth.consumers.test.js "A-S10: hub verilince") ama hiçbir çağıran
  // hub vermiyor: uygulamada kapanmadı, aşağıda OPEN'da G2
  'Ö-10': [['./growth.consumers.test.js', 'cevap → alan eşlemesi tek yerde']],
  'Ö-11': [['./growth.audit.test.js', 'Ö-11 (C-T8)'], ['./growth.audit.test.js', 'Ö-11 (C-T8b)'], ['./growth.audit.test.js', 'Ö-11 sınırları']],
  'Kü-1': [['./growth.audit.test.js', 'Kü-1, Ö-5 (A-S4)']],
  'Kü-2': [['./growth.audit.test.js', 'Kü-2 (A-S8)']],
  'Kü-3': [['./growth.audit.test.js', 'Kü-3 (A-S10)']],
  'Kü-4': [['./growth.audit.test.js', 'Kü-4, Kü-6 (B-B)'], ['./changeText.test.js', '"−0,0" yok (Kü-4)']],
  'Kü-5': [['./growth.consumers.test.js', 'Kü-5: düzen sayılarının penceresi'], ['./growthCenter.test.js', 'evre ve pencere adı']],
  'Kü-6': [['./growth.audit.test.js', 'Kü-4, Kü-6 (B-B)'], ['./changeText.test.js', 'basamak birimden (Kü-6)']],
  'Kü-8': [['./growth.audit.test.js', 'Kü-8: denetimin dayandığı işlev adları']],
  'Kü-9': [['./growth.consumers.test.js', 'Kü-9: anlık görüntü kırpma yöntemini taşır']],
  'Kü-12': [['./growth.audit.test.js', 'Kü-12: "Tüm verileri sil" bakış kalibrasyonunu siler']],
}

// Açık kalanlar: kimlik → { stage, why }. stage: hangi aşamada / kimin kararıyla kapanır.
const OPEN = {
  K1: { stage: 'G2', why: 'ekran yarısı: Gelişim satırı hapı (ProgressOverview tileOf → metricStatus) ve alan ayrıntısı growthCenter verdict okumaya G2\'de geçer' },
  K2: { stage: 'G2', why: 'ekran yarısı: Gelişim satırı ve Ana sayfa göz kartı (Home.jsx current7 ?? last) G2\'de eye.current okur' },
  'Ö-2': { stage: 'Y6', why: 'Nef paketi (lib/coach.js buildSignals) hüküm ve WHO-5 taşımaz; paket v2 ve rıza v2 ister (PLAN §13, onaylı karar 6)' },
  'Ö-4': { stage: 'sahip', why: 'reading-cps tanımı yazıldı ve sınandı; progress.metrics\'e kaydı modules/registry.test.js "her metrik kendi örnek oturumuyla" beklentisini değiştirir (okuma kaydı oturum değil test); o test PLAN §8.3 listesinde, §8.2\'de yok' },
  'Ö-10': { stage: 'G2', why: '(a) Profilim\'de "İris haritan" satırı (screens/ProfileHome.jsx, PLAN §8.1 G2). (b) iris hücreleri merkezden: irisCells hub alır ama App.jsx irisFilled, screens/IrisPlan.jsx ve screens/IrisQuestions.jsx hub vermiyor; yalnız App bağlanırsa iris ekranları birbirinden farklı dolardı, üçü birlikte G2\'de bağlanır (IrisPlan ve IrisQuestions G1 listesinde yok). (c) takvimde mola/su: sahip kararı 2026-10-01 "Noktayı şimdilik çıkar" (5 sn kapısı iki turda 0/5 ve ≤3/5); Takvim ekranıyla yeniden tasarlanır' },
  'Ö-7': { stage: 'sahip', why: 'takvim yarısı: mola/su noktası sahip kararıyla çıkarıldı (2026-10-01, kapı geçmedi); CSV yarısı kapandı' },
  'Ö-12': { stage: 'Y6', why: 'Dalga, Gökyüzü, Yön için coach() ve boş veride null zorunluluğu Nef paketini değiştirir (PLAN §13)' },
  'Kü-4': { stage: 'G2', why: 'ekran yarısı: ProgressOverview signed G2\'de changeText.signedText\'e geçer (veri, PDF ve rapor kapandı)' },
  'Kü-7': { stage: 'Y6', why: 'modül özetleri stats() (Pratikler) ve coach() (Nef) ayrı; birleştirmek Nef paketine dokunur (lib/coach.js G1\'de yalnız okunur, PLAN §13)' },
  'Kü-10': { stage: 'sahip', why: 'egzersiz setinde kameranın saydığı hareketleri ve "takıldım, atla"yı kaydetmek YENİ veri toplamak demek; PLAN §7 "yeni veri toplanmıyor"' },
  'Kü-11': { stage: 'sahip', why: 'parlaklık başlangıcı ya PDF/CSV\'de okunacak (yeni metin, tabandaki CSV satırları değişir: exportBase) ya da hiç yazılmayacak (acuityFlow.test beklentisi, §8.2\'de yok)' },
  'Kü-13': { stage: 'sahip', why: 'yarıda bırakılan yoga dersini gün saymamak growthMap days/strip\'i (eşdeğerlik çekirdeği) değiştirir; ders sırasında önce puanının kaybı yoga modülünün işi; Nef kısmı Y6' },
  'Kü-14': { stage: 'Y6', why: 'coach()\'larda "7 gün"ün iki anlamı Nef paketinin değerlerini değiştirir' },
}

function denetimIds() {
  const md = read(DENETIM)
  const ids = new Set()
  for (const m of md.matchAll(/\*\*(K\d|Ö-\d+|Kü-\d+)\.|^- \*\*(Kü-\d+)\.\*\*/gmu)) ids.add(m[1] ?? m[2])
  return ids
}

describe('Denetim bulguları: her biri bir testle kapanır ya da açık nedeniyle yazılı', () => {
  it('DENETIM.md\'deki 30 kimliğin hepsi listede; listede DENETIM\'de olmayan kimlik yok', () => {
    const ids = denetimIds()
    const want = ['K1', 'K2', 'K3', 'K4', ...Array.from({ length: 12 }, (_, i) => `Ö-${i + 1}`), ...Array.from({ length: 14 }, (_, i) => `Kü-${i + 1}`)]
    expect([...ids].sort()).toEqual([...want].sort())
    const listed = new Set([...Object.keys(CLOSED), ...Object.keys(OPEN)])
    expect([...listed].sort()).toEqual([...want].sort())
  })

  it('kapanan her bulgunun testi dosyasında gerçekten var', () => {
    for (const [id, refs] of Object.entries(CLOSED)) {
      expect(refs.length, id).toBeGreaterThan(0)
      for (const [file, title] of refs) {
        const src = read(file)
        const titles = [...src.matchAll(/\b(?:it|describe)(?:\.todo)?\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2].replace(/\\'/g, "'"))
        expect(titles.some((t) => t.includes(title)), `${id}: ${file} › "${title}"`).toBe(true)
      }
    }
  })

  it('açık kalanların aşaması ve nedeni yazılı; G1\'de kapanması gereken açık bulgu yok', () => {
    for (const [id, o] of Object.entries(OPEN)) {
      expect(['G2', 'Y6', 'sahip'], id).toContain(o.stage)
      expect(o.why.length, id).toBeGreaterThan(20)
    }
    // yalnız kapanmış (veri yarısı) bulgunun ekran yarısı G2'ye kalabilir
    for (const [id, o] of Object.entries(OPEN)) if (o.stage === 'G2') expect(CLOSED[id], `${id}: G2'ye kalan bulgunun veri yarısı G1'de kapanmalı`).toBeTruthy()
  })
})
