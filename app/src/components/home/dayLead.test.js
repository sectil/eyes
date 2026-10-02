// Ana sayfa · günün tek cümlesi (SONSUZ_YOL.PLAN.v1 §3.F.4; ana sayfa 5 saniye raporu): öncelik sırası, "aynı öncelik
// iki gün üst üste gelmez", onaylı cümleler ve ekrandaki adlar. Yolun kendisi gerçek kodla kurulur (değişmez).
import { describe, it, expect } from 'vitest'
import { leadCandidates, pickLead, pathDoneOn, pathDayOn, shownTitle, stepLine, stopLine, newsStop, goFace, LINES, todayLead, firstStop, leadSub, NEF, CHAPTER_PRIZE, nefTopLine, nefEndLine, isMileLine, quietsNef, pathMinutes } from './dayLead.js'
import { WEEKLY_SUB } from '../../lib/today.js'
import { registry } from '../../modules/registry.js'

const NOW = new Date('2026-09-30T10:00:00')
const day = (d, h = 9, m = 50) => { const t = new Date(NOW); t.setDate(t.getDate() - d); t.setHours(h, m, 0, 0); return t.toISOString() }
const look = { blinks: 3, seconds: 20, method: 'camera' }
const texts = (c) => c.map((x) => x.text)
const stop = (key, extra = {}) => ({ key, id: key.split(':')[0], title: key, done: false, ...extra })

describe('leadCandidates', () => {
  it('1: kurulum günü (sabah) İlk Bakış cümlesi; akşam kurulduysa ertesi gün; kırpma yoksa yazılmaz (sıfır yok)', () => {
    expect(texts(leadCandidates({ now: NOW, setupDate: day(0), firstLook: look }))).toEqual([LINES.first(20, 3)])
    // 5 saniye kapı turu 1: sayı büyük, anlamı altında (İlk Bakış sonuç ekranının onaylı cümlesi); "İlk Bakış" adı ve
    // üçüncü gün sayısı ("28. gün") yok; sayı "kez"den ayrılmaz
    expect(LINES.first(20, 3)).toBe('20 saniyede 3\u00a0kez göz kırptın.')
    expect(leadCandidates({ now: NOW, setupDate: day(0), firstLook: look })[0].sub).toBe('Senin sayın bir yargı değil, bir başlangıç. 4 hafta sonra yeniden bakacağız.')
    expect(leadCandidates({ now: NOW, setupDate: day(1), firstLook: look })).toEqual([])
    expect(texts(leadCandidates({ now: NOW, setupDate: day(1, 21, 5), firstLook: look }))).toEqual([LINES.first(20, 3)])
    expect(leadCandidates({ now: NOW, setupDate: day(0), firstLook: { ...look, blinks: 0 } })).toEqual([])
  })
  it('2: 7. gün ve 30. gün (kurulum günü 1. gün); 28. gün iris haritası (başlangıçtan 28 takvim günü, yenilenmemişse)', () => {
    expect(texts(leadCandidates({ now: NOW, setupDate: day(6) }))).toEqual(['Bugün 7. gün: ilk haftanı tamamlıyorsun.'])
    expect(texts(leadCandidates({ now: NOW, setupDate: day(29) }))).toEqual(['Bugün 30. gün: ilk ayını tamamlıyorsun.'])
    expect(texts(leadCandidates({ now: NOW, baseline: day(28) }))).toEqual(['Bugün 28. gün: iris haritan başlangıçla yan yana geliyor.'])
    expect(leadCandidates({ now: NOW, baseline: day(28), recheck: day(0) })).toEqual([])
  })
  it('8: iris haritası 1–3 gün sonra', () => {
    expect(texts(leadCandidates({ now: NOW, baseline: day(25) }))).toEqual(['İris haritan 3 gün sonra başlangıçla yan yana gelecek.'])
    expect(leadCandidates({ now: NOW, baseline: day(24) })).toEqual([])
  })
  it('3: ≥ 2 gün aradan dönüş (14 günden kısa); 7: dün yol tamamdı', () => {
    expect(texts(leadCandidates({ now: NOW, lastDay: '2026-09-27' }))).toEqual(['Kaldığın yerden: basamakların aynı.'])
    expect(leadCandidates({ now: NOW, lastDay: '2026-09-28' })).toEqual([])
    expect(leadCandidates({ now: NOW, lastDay: '2026-09-16' })).toEqual([]) // 14 gün: basamak bir gün aşağı iner
    expect(texts(leadCandidates({ now: NOW, lastDay: '2026-09-29', yesterdayDone: true }))).toEqual(['Dün yolunun bütün duraklarını tamamladın.'])
  })
  it('6: bugünün yenisi göz egzersizi önce ("Sağ–sol bakış", S0 kararı 4); Daire tarifle', () => {
    const isinma = stop('routine:isinma', { id: 'routine', title: 'Sağ–sol', stage: { steps: ['lookRight', 'lookLeft', 'rest'] } })
    const snake = stop('snake', { title: 'Yılan' })
    const [c] = leadCandidates({ now: NOW, plan: { stops: [isinma, snake], next: snake }, newKeys: ['snake', 'routine:isinma'] })
    expect(c).toMatchObject({ p: 6, text: 'Bugün yeni: sağ–sol bakış.', pre: 'Bugün yeni: ', name: 'sağ–sol bakış', post: '.', sub: 'Sağa bak, sola bak, gözlerini kapat' })
    expect(c.stop).toBe(isinma)
    const daire = stop('routine:daire', { id: 'routine', title: 'Daire', stage: { steps: ['circleCw', 'circleCcw', 'rest'] } })
    const [d] = leadCandidates({ now: NOW, plan: { stops: [isinma, daire], next: isinma }, newKeys: ['routine:daire'] })
    expect(d).toMatchObject({ text: 'Bugün yeni: daire.', sub: 'Havada yavaşça büyük bir daire çiz.' })
  })
  it('cümle düğmeyi tekrar etmez (5 saniye kapı turu 2): yeni durak düğmenin durağıysa "Bugün yeni" yazılmaz, sıradaki aday gelir', () => {
    const isinma = stop('routine:isinma', { id: 'routine', title: 'Sağ–sol', stage: { steps: ['lookRight', 'lookLeft', 'rest'] } })
    const snake = stop('snake', { title: 'Yılan' })
    const plan = { stops: [isinma, snake], next: isinma }
    // 2. gün: düğme "Yeni · Sağ–sol bakış" der; cümle dünün yolunu söyler. Yılan ikinci bir "Bugün yeni" olmaz.
    expect(texts(leadCandidates({ now: NOW, plan, newKeys: ['snake', 'routine:isinma'], yesterdayDone: true }))).toEqual(['Dün yolunun bütün duraklarını tamamladın.'])
    expect(leadCandidates({ now: NOW, plan, newKeys: ['snake', 'routine:isinma'] })).toEqual([])
    // Düğme yolun durağını göstermiyorsa (ör. göz molası önerisi; Home.jsx next vermez) haber cümlede kalır
    expect(texts(leadCandidates({ now: NOW, plan: { stops: plan.stops, next: null }, newKeys: ['routine:isinma'] }))).toEqual(['Bugün yeni: sağ–sol bakış.'])
  })
  it('haftalık E testi günü: düğmenin durağıysa cümle yok (düğme "E testi · haftada bir"); değilse "Bugün yeni"nin ardında, alt satırıyla', () => {
    const weekly = stop('weekly', { title: 'Haftalık E testi' })
    const warm = stop('routine:isinma', { id: 'routine', title: 'Isınma' })
    const dikey = stop('routine:dikey', { id: 'routine', title: 'Yukarı–aşağı', stage: { steps: ['lookUp', 'lookDown', 'rest'] } })
    const first = leadCandidates({ now: NOW, plan: { stops: [weekly, warm], next: weekly }, newKeys: ['routine:isinma'] })
    expect(texts(first)).toEqual(['Bugün yeni: ısınma.'])
    const later = leadCandidates({ now: NOW, plan: { stops: [warm, weekly, dikey], next: warm }, newKeys: ['routine:dikey'] })
    expect(texts(later)).toEqual(['Bugün yeni: yukarı–aşağı.', 'Bugün haftalık E testi günü.'])
    expect(later[0].sub).toBe('Yukarı bak, aşağı bak, gözlerini kapat')
    expect(later[1].sub).toBe('3 bölüm · sağ, sol, iki göz')
  })
  it('güncelleme günü (eski kullanıcı): "Yolun yenilendi." ve bugünün yenileri yol sırasıyla; tek "Bugün yeni" yazılmaz', () => {
    const warm = stop('routine:isinma', { id: 'routine', title: 'Isınma' })
    const rest = stop('breath', { restSlot: true, title: 'Nefes' })
    const dikey = stop('routine:dikey', { id: 'routine', title: 'Yukarı–aşağı' })
    const notice = stop('notice', { title: 'Bugünün görevi' })
    const plan = { stops: [warm, rest, dikey, notice], next: warm }
    const newKeys = ['breath', 'routine:dikey', 'notice']
    const c = leadCandidates({ now: NOW, plan, newKeys, update: true, yesterdayDone: true })
    expect(texts(c)).toEqual(['Yolun yenilendi.', 'Dün yolunun bütün duraklarını tamamladın.'])
    expect(c[0].p).toBe(2)
    expect(c[0].list).toEqual([dikey, notice]) // nefes molası "Bugünün ritmi"ni nefes ekranında söyler
    // güncelleme günü değilse tek "Bugün yeni"
    expect(texts(leadCandidates({ now: NOW, plan, newKeys }))).toEqual(['Bugün yeni: yukarı–aşağı.'])
    // yenisi olmayan güncelleme gününde cümle yok
    expect(leadCandidates({ now: NOW, plan, newKeys: [], update: true })).toEqual([])
  })
})

describe('pickLead: ilk tutan kazanır; aynı öncelik iki gün üst üste gelmez (0, 1, 2 hariç)', () => {
  const c = [{ p: 6, text: 'a' }, { p: 7, text: 'b' }]
  it('dün 6 yazıldıysa bugün 7; dün 2 yazıldıysa 2 yine yazılır; aday yoksa null', () => {
    expect(pickLead(c, null).text).toBe('a')
    expect(pickLead(c, 6).text).toBe('b')
    expect(pickLead([{ p: 2, text: 'x' }], 2).text).toBe('x')
    expect(pickLead([{ p: 7, text: 'b' }], 7)).toBeNull()
    expect(pickLead([], null)).toBeNull()
  })
})

describe('adlar ve satırlar', () => {
  it('shownTitle: "Sağ–sol" ekranda "Sağ–sol bakış"; öteki adlar aynı', () => {
    expect(shownTitle({ title: 'Sağ–sol' })).toBe('Sağ–sol bakış')
    expect(shownTitle({ title: 'Isınma' })).toBe('Isınma')
  })
  it('stepLine: adımların adları düz dille, ardışık aynı adım bir kez; stopLine önce durağın kendi satırı', () => {
    expect(stepLine({ stage: { steps: ['blink', 'lookRight', 'lookLeft'] } })).toBe('Göz kırp, sağa bak, sola bak')
    expect(stepLine({ stage: { steps: ['blink', 'blink', 'rest'] } })).toBe('Göz kırp, gözlerini kapat')
    expect(stepLine({})).toBeNull()
    expect(stopLine({ sub: '3 bölüm · sağ, sol, iki göz', stage: { steps: ['blink'] } })).toBe('3 bölüm · sağ, sol, iki göz')
  })
  it('goFace: büyük düğmede haftalık E testi "E testi" + "haftada bir", satırı "E hangi yöne bakıyor?"; yarımsa kalan gözler', () => {
    expect(goFace({ id: 'weekly', title: 'Haftalık E testi', sub: WEEKLY_SUB })).toEqual({ title: 'E testi', tag: 'haftada bir', sub: 'E hangi yöne bakıyor?' })
    expect(goFace({ id: 'weekly', title: 'Haftalık E testi', sub: 'Kalan: Sol göz, İki göz' })).toEqual({ title: 'E testi', tag: 'haftada bir', sub: 'Kalan: Sol göz, İki göz' })
    expect(goFace({ id: 'routine', title: 'Sağ–sol', stage: { steps: ['lookRight', 'lookLeft'] } })).toEqual({ title: 'Sağ–sol bakış', tag: null, sub: 'Sağa bak, sola bak' })
  })
  it('newsStop: nefes molası ve biten durak "Bugün yeni" olmaz', () => {
    const rest = stop('breath', { restSlot: true })
    const done = stop('notice', { done: true })
    const read = stop('reading')
    expect(newsStop({ stops: [rest, done, read] }, ['breath', 'notice', 'reading'])).toBe(read)
    expect(newsStop({ stops: [rest] }, ['breath'])).toBeNull()
  })
})

describe('pathDoneOn (dünün yolu, gerçek yol koduyla)', () => {
  const iso = (d, h = 10) => day(d, h, 0)
  it('1. gün yolunun dört durağı dün bitti → true; biri eksikse false; dün kayıt yoksa false', () => {
    const tests = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: iso(1) }))
    const sessions = [{ type: 'game', game: 'track', date: iso(1) }, { type: 'breath', seconds: 60, date: iso(1) }, { type: 'routine', setId: 'kirpma', seconds: 30, date: iso(1) }]
    const args = { modules: registry.live, now: NOW }
    expect(pathDoneOn({ ...args, tests, sessions })).toBe(true)
    expect(pathDoneOn({ ...args, tests, sessions: sessions.slice(0, 2) })).toBe(false)
    expect(pathDoneOn({ ...args, tests: [], sessions: [] })).toBe(false)
    // D9 v2: dünün yolunun kaç durağı bitti (Nef cümlesi 2)
    expect(pathDayOn({ ...args, tests, sessions: sessions.slice(0, 2) })).toMatchObject({ done: 3, allDone: false })
    expect(pathDayOn({ ...args, tests: [], sessions: [] })).toBeNull()
  })
  it('tur 4: dün gerçekten bir yol günü değilse (eski kullanıcı, güncelleme günü: yolun stage alanı hiç yok) null; dün yol başladıysa sayılır', () => {
    const args = { modules: registry.live, now: NOW }
    const old = []
    for (let d = 20; d >= 1; d--) old.push({ type: 'routine', setId: 'kirpma', seconds: 30, date: iso(d) }, { type: 'breath', seconds: 60, date: iso(d) })
    expect(pathDayOn({ ...args, tests: [], sessions: old })).toBeNull()
    expect(pathDoneOn({ ...args, tests: [], sessions: old })).toBe(false)
    // dün (güncelleme günü) yolun bir durağı stage ile yapıldı: dün yol günüydü
    const upd = [...old, { type: 'breath', seconds: 120, stage: 2, date: iso(1, 11) }]
    expect(pathDayOn({ ...args, tests: [], sessions: upd })).not.toBeNull()
    // Nef: dün yol yoksa cümle 1 ve 2 seçilmez
    expect(nefTopLine({ n: 69, gap: 1, yday: pathDayOn({ ...args, tests: [], sessions: old }) })).toBeNull()
  })
})

describe('todayLead · tur 7: yolda haftalık E testi varken sahibin cümlesi', () => {
  it('"Bugünkü yolun N dakika ve haftalık E testi." (N süresi yazan durakların toplamı); E testi bittiyse ya da yoksa olağan cümle', () => {
    const w = { id: 'weekly', key: 'weekly', title: 'Haftalık E testi', minutes: 5, hideMinutes: true }
    const r = { id: 'routine', key: 'routine:isinma', title: 'Isınma', minutes: 1 }
    const b = { id: 'breath', key: 'breath', title: 'Nefes', minutes: 3, restSlot: true }
    const stops = [w, r, b]
    expect(LINES.todayWeekly(6)).toBe('Bugünkü yolun 6\u00a0dakika ve haftalık E testi.')
    expect(todayLead({ stops, doneCount: 0 }, w, pathMinutes(stops, 5)).text).toBe('Bugünkü yolun 6\u00a0dakika ve haftalık E testi.')
    expect(todayLead({ stops, doneCount: 0 }, r, pathMinutes(stops, 5)).text).toBe('Bugünkü yolun 6\u00a0dakika ve haftalık E testi.')
    expect(todayLead({ stops: [r, b], doneCount: 0 }, r, pathMinutes([r, b], 5)).text).toBe('Bugünkü yolun 6\u00a0dakika, ilk durağın Isınma.')
    // ölçüm durağı toplamda yok
    expect(pathMinutes(stops, 5)).toBe(6)
  })
})

describe('quietsNef (tur 3c, tur 4): ilk görünümün satırı Nef\'i susturur mu', () => {
  it('kilometre taşı ya da güncelleme günü cümlesi (4) ilk görünümdeyse susar; öteki satırlarda konuşur', () => {
    const upd = NEF.update(2, 'Yukarı–aşağı')
    expect(quietsNef([LINES.today(8, 'Isınma'), LINES.week1])).toBe(true)
    expect(quietsNef([LINES.today(8, 'Isınma'), upd], upd)).toBe(true)
    expect(quietsNef([LINES.today(8, 'Isınma'), LINES.yday], upd)).toBe(false)
    expect(quietsNef([null, undefined])).toBe(false)
    expect(nefTopLine({ n: 69, update: { n: 2, name: 'Yukarı–aşağı' }, yday: { done: 10, total: 10, allDone: true }, mileShown: quietsNef([upd], upd) })).toBeNull()
  })
})

// D9 v2: Nef'in yoldaki cümleleri, sahibin onayladığı 13 cümle harfi harfine (d9-karar/nef-cumleleri-onay.md)
describe('NEF · onaylı 13 cümle', () => {
  it('kalıplar onaylı metnin aynısı', () => {
    expect(NEF.yday).toBe('Dün yolunun bütün duraklarını tamamladın.')
    expect(NEF.ydayPart(3)).toBe('Dün 3 durak yaptın. Bugün yol yeniden başlıyor.')
    expect(NEF.back).toBe('Kaldığın yerden: basamakların aynı.')
    expect(NEF.update(2, 'Yukarı–aşağı')).toBe('Yolun yenilendi: bugün 2 yeni durak var, ilki Yukarı–aşağı.')
    expect(NEF.done(10)).toBe('Bugünkü yol tamam. Yarın 10. gün.')
    expect(NEF.chapterLast(CHAPTER_PRIZE[1])).toBe('Bu bölümün son günü. Yolu bitirince iris haritan açılır.')
    expect(NEF.month).toBe('İlk ayın tamam: 30 gün.')
    expect(NEF.tomorrow(10, 11)).toBe('Yarın · 10. gün · 11 durak')
    expect(NEF.alarm('06.35')).toBe('Yarın 06.35 alarm')
    expect(NEF.remind).toBe('Hatırlatma kurmak ister misin?')
    expect(NEF.remindSub).toBe('Saatini ve günlerini sen seçersin.')
    expect(NEF.chapter(3, 15, 21)).toBe('3. bölüm · 15–21. gün')
    expect(NEF.news(['Daire', 'Tek Bakışta'])).toBe('Yeni: Daire, Tek Bakışta')
    expect(NEF.prize(CHAPTER_PRIZE[4])).toBe('Sonunda: iris haritan başlangıçla yan yana gelir')
  })
  it('yolun başı: güncelleme günü > aradan dönüş > dün bitti > dün yarım; ilk görünümdeki cümle atlanır; akşam yok', () => {
    const upd = { n: 2, name: 'Yukarı–aşağı' }
    const yday = { done: 10, total: 10, allDone: true }
    expect(nefTopLine({ update: upd, gap: 1, yday })).toBe(NEF.update(2, 'Yukarı–aşağı'))
    expect(nefTopLine({ update: upd, gap: 1, yday, skip: NEF.update(2, 'Yukarı–aşağı') })).toBe(NEF.yday)
    expect(nefTopLine({ gap: 4, yday: null })).toBe(NEF.back)
    expect(nefTopLine({ gap: 1, yday: { done: 4, total: 10, allDone: false } })).toBe(NEF.ydayPart(4))
    expect(nefTopLine({ gap: 1, yday: null })).toBeNull()
    expect(nefTopLine({ allDone: true, gap: 1, yday })).toBeNull()
  })
  it('bugünün sonu: 30. gün yol bitince 7, yol bitince 5, bölümün son günü bitmeden 6 (onaylı ödülle)', () => {
    expect(nefEndLine({ n: 30, allDone: true })).toBe('İlk ayın tamam: 30 gün.')
    expect(nefEndLine({ n: 30, allDone: false })).toBeNull()
    expect(nefEndLine({ n: 9, allDone: true })).toBe('Bugünkü yol tamam. Yarın 10. gün.')
    expect(nefEndLine({ n: 7, allDone: false, chapterEnd: true, prize: CHAPTER_PRIZE[1] })).toBe('Bu bölümün son günü. Yolu bitirince iris haritan açılır.')
    expect(nefEndLine({ n: 14, allDone: false, chapterEnd: true, prize: null })).toBeNull()
  })
  // Tur 3: ek onaylı cümleler 14–16 (aynı dosya, "Ek cümleler")
  it('ek cümleler 14–16 onaylı metnin aynısı', () => {
    expect(NEF.month30).toBe('Bugün 30. gün: yolu bitirince ilk ayın tamam.')
    expect(NEF.chapterDay(1, CHAPTER_PRIZE[1])).toBe('1. bölümün son günü: yolu bitirince iris haritan açılır.')
    expect(NEF.chapterDay(2)).toBe('2. bölümün son günü: yolu bitirince bölüm tamam.')
    expect(NEF.chapterDay(2, null)).toBe('2. bölümün son günü: yolu bitirince bölüm tamam.')
    expect(NEF.more(7)).toBe('ve 7 durak daha')
  })
  it('sabah: 30. gün Nef susar (14 seçilmez, tur 3b); bölümün son günü 15, 1–3\'ün önünde; akşam (yol bitti) yok', () => {
    const yday = { done: 10, total: 10, allDone: true }
    expect(nefTopLine({ n: 30, gap: 1, yday })).toBeNull()
    expect(nefTopLine({ n: 30, gap: 5, yday })).toBeNull()
    expect(nefTopLine({ n: 30, gap: 1, yday: { done: 3, total: 10, allDone: false } })).toBeNull()
    expect(nefTopLine({ n: 30, update: { n: 2, name: 'Daire' }, yday })).toBeNull()
    expect(nefTopLine({ n: 30, chapterEnd: true, chapter: 5, yday })).toBeNull()
    expect(nefTopLine({ n: 14, chapterEnd: true, chapter: 2, gap: 1, yday })).toBe('2. bölümün son günü: yolu bitirince bölüm tamam.')
    expect(nefTopLine({ n: 7, chapterEnd: true, chapter: 1, prize: CHAPTER_PRIZE[1], gap: 4, yday })).toBe('1. bölümün son günü: yolu bitirince iris haritan açılır.')
    expect(nefTopLine({ n: 7, chapterEnd: true, chapter: 1, prize: CHAPTER_PRIZE[1], yday: { done: 3, total: 10, allDone: false } })).toBe('1. bölümün son günü: yolu bitirince iris haritan açılır.')
    expect(nefTopLine({ n: 28, chapterEnd: true, chapter: 4, prize: CHAPTER_PRIZE[4], yday })).toBe('4. bölümün son günü: yolu bitirince iris haritan başlangıçla yan yana gelir.')
    expect(nefTopLine({ n: 9, gap: 1, yday })).toBe(NEF.yday)
    expect(nefTopLine({ n: 31, gap: 1, yday })).toBe(NEF.yday) // ertesi gün olağan
    expect(nefTopLine({ n: 14, chapterEnd: true, chapter: 2, allDone: true, yday })).toBeNull()
    // güncelleme günü (4) bir kez olur ve önde kalır (VARSAYIM)
    expect(nefTopLine({ n: 14, chapterEnd: true, chapter: 2, update: { n: 2, name: 'Daire' }, yday })).toBe(NEF.update(2, 'Daire'))
  })
  it('tur 3c: ilk görünümde o güne ait kilometre taşı satırı varsa Nef o sabah susar; yoksa bölüm sonu 15 aynen', () => {
    const yday = { done: 10, total: 10, allDone: true }
    expect(isMileLine(LINES.week1)).toBe(true)
    expect(isMileLine(LINES.month1)).toBe(true)
    expect(isMileLine(LINES.iris)).toBe(true)
    expect(isMileLine(LINES.yday)).toBe(false)
    expect(isMileLine(LINES.today(8, 'Isınma'))).toBe(false)
    expect(isMileLine(null)).toBe(false)
    // 7. gün: ilk görünüm "Bugün 7. gün: ilk haftanı tamamlıyorsun." → 15 yok
    expect(nefTopLine({ n: 7, chapterEnd: true, chapter: 1, prize: CHAPTER_PRIZE[1], yday, mileShown: isMileLine(LINES.week1) })).toBeNull()
    // 28. bölüm sonu, iris satırı ilk görünümde (gün atlamış kişi) → yok; satır yoksa 15
    expect(nefTopLine({ n: 28, chapterEnd: true, chapter: 4, yday, mileShown: true })).toBeNull()
    expect(nefTopLine({ n: 28, chapterEnd: true, chapter: 4, yday, mileShown: false })).toBe('4. bölümün son günü: yolu bitirince bölüm tamam.')
    expect(nefTopLine({ n: 14, chapterEnd: true, chapter: 2, yday })).toBe('2. bölümün son günü: yolu bitirince bölüm tamam.')
    // bölüm sonu olmayan kilometre taşı günü de susar
    expect(nefTopLine({ n: 29, gap: 1, yday, mileShown: true })).toBeNull()
    // bugünün sonundaki 6 da o sabah yok; yol bitince 5 olağan
    expect(nefEndLine({ n: 7, chapterEnd: true, prize: CHAPTER_PRIZE[1], mileShown: true })).toBeNull()
    expect(nefEndLine({ n: 7, allDone: true, chapterEnd: true, prize: CHAPTER_PRIZE[1], mileShown: true })).toBe(NEF.done(8))
    expect(nefEndLine({ n: 7, chapterEnd: true, prize: CHAPTER_PRIZE[1], mileShown: false })).toBe(NEF.chapterLast(CHAPTER_PRIZE[1]))
  })
  it('bölümün son günü: sabah 15 ödülü söylediyse bugünün sonunda 6 yazılmaz', () => {
    const top = NEF.chapterDay(1, CHAPTER_PRIZE[1])
    expect(nefEndLine({ n: 7, allDone: false, chapterEnd: true, prize: CHAPTER_PRIZE[1], top })).toBeNull()
    expect(nefEndLine({ n: 7, allDone: false, chapterEnd: true, prize: CHAPTER_PRIZE[1], top: NEF.yday })).toBe(NEF.chapterLast(CHAPTER_PRIZE[1]))
    expect(nefEndLine({ n: 7, allDone: true, chapterEnd: true, prize: CHAPTER_PRIZE[1], top: null })).toBe(NEF.done(8))
  })
})

// Sahibin kararı (2026-10-01): ilk cümle bugüne dönük
describe('todayLead · "Bugünkü yolun N dakika, ilk durağın X."', () => {
  const next = { id: 'routine', key: 'routine:sagsol', title: 'Sağ–sol', minutes: 1 }
  it('gün başında yolun süresi ve ilk durağın ekrandaki adı (sahibin örneği)', () => {
    expect(todayLead({ minutesLeft: 8, doneCount: 0 }, next)?.text).toBe('Bugünkü yolun 8 dakika, ilk durağın Sağ–sol bakış.')
  })
  it('haftalık E testi düğmedeki adıyla; durağın süresi yazılmaz', () => {
    const t = todayLead({ minutesLeft: 8, doneCount: 0 }, { id: 'weekly', key: 'weekly', title: 'Haftalık E testi', minutes: 5, hideMinutes: true })
    expect(t?.text).toBe('Bugünkü yolun 8 dakika, ilk durağın E testi.')
  })
  it('yol başladıysa, bittiyse ya da düğme yolun durağı değilse cümle yok', () => {
    expect(todayLead({ minutesLeft: 6, doneCount: 1 }, next)).toBeNull()
    expect(todayLead({ minutesLeft: 0, doneCount: 4, allDone: true }, next)).toBeNull()
    expect(todayLead({ minutesLeft: 8, doneCount: 0 }, null)).toBeNull()
  })
})

describe('tur 5: tek kaynak ve yeni durağın alt satırı', () => {
  it('firstStop adı todayLead cümlesindeki ad', () => {
    const next = { id: 'routine', key: 'routine:isinma', title: 'Isınma', minutes: 1 }
    const plan = { stops: [next], next, total: 1, doneCount: 0, minutesLeft: 18 }
    expect(firstStop(next).name).toBe('Isınma')
    expect(todayLead(plan, next).text).toBe('Bugünkü yolun 18\u00a0dakika, ilk durağın Isınma.')
    const w = { id: 'weekly', key: 'weekly', title: 'Haftalık E testi' }
    expect(firstStop(w).name).toBe('E testi')
  })
  it('"Bugün yeni" alt satırında durağın onaylı tarifi; öteki adaylar aynen', () => {
    expect(leadSub({ p: 6, text: 'Bugün yeni: daire.', sub: 'Havada yavaşça büyük bir daire çiz.' })).toBe('Bugün yeni: daire. Havada yavaşça büyük bir daire çiz.')
    expect(leadSub({ p: 2, text: 'Bugün haftalık E testi günü.', sub: '3 bölüm' })).toBe('Bugün haftalık E testi günü.')
    expect(leadSub(null)).toBeNull()
  })
})
