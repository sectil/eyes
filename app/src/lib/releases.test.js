import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { RELEASES, unseenReleases, latestRelease } from './releases.js'
import { WEEKLY_MIN_BASELINE_TESTS, MIN_BASELINE_TESTS, BASELINE_TO_DAY } from './trend.js'

describe('sürüm notları', () => {
  it('en yeni en üstte, kimlikler benzersiz ve azalan; her maddenin türü geçerli', () => {
    const ids = RELEASES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort().reverse()).toEqual(ids)
    for (const r of RELEASES) for (const it of r.items) expect(['new', 'fix', 'change']).toContain(it.kind)
  })
  it('yeni E testi (yeni seri, 36–44 cm, parlaklık, her göz kaydı) sürüm notunda; sağlık iddiası yok', () => {
    const text = RELEASES.find((r) => r.id === '2026-09-29').items.map((i) => i.text).join(' ')
    for (const s of ['yeni seri', '36–44 cm', 'parlaklığı', 'Her göz bittiği an kaydedilir', 'başlangıç değerin yeniden oluşur', 'ters çevirme']) expect(text).toContain(s)
    expect(text).not.toMatch(/tanı|hastalık|iyileştir|tedavi/i)
  })
  // Karar 2026-09-29 (YAPILACAKLAR "Sonsuz yol ve ilk 5 saniye" (a)): E testi ilk günden haftada bir
  it('29 Eylül: E testi haftada bir; kısa test isteğe bağlı; haftalık başlangıç kuralı trend.js ile aynı sayılar', () => {
    // İnceleme 2026-09-29 (metin): "İstersen … durur" anlatım bozukluğu ve art arda iki "haftada bir" düzeltildi; eski
    // ölçümlere de uygulandığı (iki göz serisinde uyarı yeni test olmadan gelebilir) söylenir
    const t = items292().find((x) => x.startsWith('E testi artık haftada bir:'))
    expect(t).toBe("E testi artık haftada bir: haftalık E testi (sağ, sol, iki göz) ilk gün yola eklenir, sonra her hafta; öteki günlerde yolda E testi yok. İstersen kısa E testini (eski adıyla Günlük test; sağ ve sol göz) Ana sayfadaki Ölçüm listesinden yapabilirsin. Eski günlük test kayıtların geçmişte ve CSV dosyasında \"Kısa görme testi\" adıyla görünür. Gelişim'de ilk test alışma sayılır; başlangıç değerin 3 haftalık testle, en erken 22. günde hazır olur ve yeni testlerle 7 teste kadar güçlenir. Bu kural eski ölçümlerine de uygulanır: özellikle iki göz serisinde, yeni test yapmasan da değerlendirme hemen başlayabilir, bir uyarı da görebilirsin.")
    expect(t.match(/haftada bir/g)).toHaveLength(1)
    // Bug 24: haftalık test takvim günüyle gelir
    expect(items292().find((x) => x.startsWith('Haftalık E testi son testin saatini'))).toMatch(/7 gün sonra, o günün başından itibaren/)
    // Okuma testi E testinden ayrı gün (karar 2026-09-29)
    expect(items292().find((x) => x.startsWith('Okuma testi artık'))).toMatch(/aynı güne düşmez.*en çok bir gün.*7 gün sonra/)
    expect(WEEKLY_MIN_BASELINE_TESTS).toBe(3)
    expect(MIN_BASELINE_TESTS).toBe(7)
    expect(BASELINE_TO_DAY + 1).toBe(22)
    // eski "en az 7 testle oluşur" cümlesi haftalık testte doğru değil: hiçbir 29 Eylül maddesinde yok
    expect([...items29(), ...items292()].join(' ')).not.toMatch(/en az 7 testle/)
    const nef = items292().find((x) => x.startsWith('Nef artık'))
    expect(nef).toMatch(/günlük test önermez/)
    const fix = RELEASES.find((r) => r.id === '2026-09-29-2').items.find((i) => i.kind === 'fix')
    expect(fix.text).toContain('"Son 3 test"')
    // her gün test isteyen cümle yok
    expect([...items29(), ...items292()].join(' ')).not.toMatch(/her gün (E )?test|günlük E testi/i)
  })
  // İkinci inceleme: V-S3 (cihazda doğrulanmamış davranış), V-N4 ("Kalan" kartı yalnız haftalıkta), V-N5 (çift "ve", ses açıksa)
  const items29 = () => RELEASES.find((r) => r.id === '2026-09-29').items.map((i) => i.text)
  const items292 = () => RELEASES.find((r) => r.id === '2026-09-29-2').items.map((i) => i.text)
  // Bug 31: Build 59'da 29 Eylül girdisine eklenen maddeler Build 58'de o girdiyi görmüş kişiye gösterilmedi. Yeni
  // girdiye taşındı; 29 Eylül'ü görmüş kişi yeni girdiyi görür.
  it('Bug 31: 29 Eylül\'ü görmüş kişi ikinci güncellemeyi görür; taşınan maddeler 29 Eylül\'de yok; (b) maddesi var', () => {
    expect(unseenReleases('2026-09-29').map((r) => r.id)).toEqual(['2026-09-29-2'])
    expect(latestRelease().id).toBe('2026-09-29-2')
    for (const start of ['E testi artık haftada bir:', 'Nef artık', "Gelişim'de son testten", 'Haftalık E testi son testin saatini', 'Okuma testi artık']) {
      expect(items292().some((t) => t.startsWith(start)), start).toBe(true)
      expect(items29().some((t) => t.startsWith(start)), start).toBe(false)
    }
    expect(items292()[0]).toBe("Yeni kurulumda önce ölçüm: uygulamayı ilk kez açan kişi giriş ekranından sonra doğrudan İlk Bakış'a geçer, kamera 20 saniyede kaç kez göz kırptığını sayar. Hesap, güvenlik bilgisi ve sorular sonuçtan sonra gelir. Kurulumu bitirmiş olan için hiçbir şey değişmez.")
  })
  it('29 Eylül: her cümle doğru ve yalın; aynı cümle parçasında iki "ve" yok', () => {
    for (const t of [...items29(), ...items292()]) {
      for (const part of t.split(/[.;:]/)) expect(part.match(/(^|\s)ve\s/g)?.length ?? 0, part).toBeLessThanOrEqual(1)
    }
    expect(items29()[0]).toBe('E testi yenilendi: her göz için tek ekran; Gözlük, Örtme, Mesafe satırları ve tek düğme. Düğme hazır değilse eksik adımı yazar, dokununca o satırı gösterir. Gözlük seçimin hatırlanır, her testte yeniden sorulmaz.')
  })
  it('29 Eylül: sesli yönlendirme yalnız ses açıksa; "Kalan: …" kartı yalnız haftalık test için vaat edilir', () => {
    const voice = items29().find((t) => t.includes('sesli yönlendirme'))
    expect(voice).toContain('ses açıksa')
    const saved = items29().find((t) => t.includes('Her göz bittiği an kaydedilir'))
    expect(saved).toBe('Her göz bittiği an kaydedilir. Haftalık testi yarıda bırakırsan kalan gözler o gün Bugün kartında "Kalan: …" diye bekler; test ancak üç göz de bitince tamam sayılır, ertesi güne kalan yarım test baştan açılır.')
  })
  it('29 Eylül: parlaklık ve ters renk maddesi kodun yaptığını söyler; cihazda doğrulanmadığı kodda yazılı', () => {
    const t = items29().find((x) => x.includes('parlaklığı'))
    expect(t).toBe('Test başlayınca ekran parlaklığı en yükseğe alınır; test bitince, testten çıkınca ya da uygulamadan ayrılınca eski değerine döner. Renkleri ters çevirme açıksa test başlamaz ve nasıl kapatılacağı yazar.')
    // Maddenin hemen üstündeki yorum: doğrulanmadı, TestFlight'tan önce doğrulanacak, doğrulanmazsa çıkarılır
    const src = readFileSync(new URL('./releases.js', import.meta.url), 'utf8').split('\n')
    const at = src.findIndex((l) => l.includes(t.slice(0, 40)))
    const above = src.slice(Math.max(0, at - 5), at).join(' ')
    expect(above).toMatch(/cihazda doğrulanmadı/)
    expect(above).toMatch(/TestFlight'tan önce doğrulanacak; doğrulanmazsa\s+(\/\/\s+)?sürüm notundan çıkarılır/)
    // 36–44 cm dışında test hemen durmaz (S1: 35–45 cm dışında durur); metin bunu doğru söyler. Üçüncü inceleme:
    // bant kenarında da ne yapılacağı harf yuvasında yazar; sayılmayan cevabın nedeni yazar; "28 harf" sayılan harf
    // (iki alıştırma harfi bunun üstüne gösterilir)
    const band = items29().find((x) => x.includes('36–44 cm'))
    expect(band).toContain("Bu aralığın dışında sayılan harf gelmez: mesafe göstergesi uyarır, harfin yerinde ne yapacağın yazar; 35–45 cm'nin dışına çıkınca test durur.")
    expect(band).toContain('Bir cevap sayılmazsa nedeni de harfin yerinde yazar.')
    expect(band).toContain('Haftalık testte her gözde 28 harf sayılır.')
    expect(band).not.toMatch(/her göz 28 harf\./)
  })
  // Üçüncü doğrulama (V3-N3; 2. doğrulayıcı NIT 2): yorumun andığı YAPILACAKLAR maddesi yoktu. Madde, sürüm notunun
  // dayandığı cihaz denetimini taşır; "TestFlight'tan önce doğrulanacak; doğrulanmazsa sürüm notundan çıkarılır".
  it('29 Eylül: parlaklık ve ters renk için cihaz denetimi YAPILACAKLAR\'da açık madde olarak duruyor', () => {
    const doc = readFileSync(new URL('../../../docs/yol-haritasi/YAPILACAKLAR.md', import.meta.url), 'utf8').split('\n')
    // madde: "- [ ]" / "- [~]" / "- [x]" satırı ve ardından gelen girintili satırlar
    const items = []
    let cur = null
    for (const line of doc) {
      if (/^- \[[ ~x]\] /.test(line)) items.push((cur = [line]))
      else if (cur && /^\s+\S/.test(line)) cur.push(line)
      else cur = null
    }
    const item = items.map((x) => x.join(' ').replace(/\s+/g, ' ')).find((t) => /parlaklık/i.test(t) && /ters çevirme/.test(t) && t.includes('releases.js'))
    expect(item).toBeTruthy()
    expect(item).toMatch(/^- \[[ ~]\] /) // doğrulanmadı: [x] değil
    expect(item).toContain("TestFlight'tan önce cihazda doğrulanacak")
    expect(item).toContain('doğrulanmazsa sürüm notundan çıkarılır')
    expect(item).toMatch(/CİHAZDA DENENMEDİ/)
    for (const f of ['FaceDistancePlugin.swift', 'brightnessSession.js', 'invertedColors.js']) expect(item).toContain(f)
  })
  it('görülmemişler: hiç görülmediyse yalnız en son; görülen sonrası yeniler', () => {
    expect(unseenReleases(null)).toEqual([latestRelease()])
    expect(unseenReleases(latestRelease().id)).toEqual([])
    expect(unseenReleases('2000-01-01').length).toBe(RELEASES.length)
  })
})
