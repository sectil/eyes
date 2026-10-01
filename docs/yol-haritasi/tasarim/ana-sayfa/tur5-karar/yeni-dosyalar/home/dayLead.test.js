// Ana sayfa · günün tek cümlesi (SONSUZ_YOL.PLAN.v1 §3.F.4; ana sayfa 5 saniye raporu): öncelik sırası, "aynı öncelik
// iki gün üst üste gelmez", onaylı cümleler ve ekrandaki adlar. Yolun kendisi gerçek kodla kurulur (değişmez).
import { describe, it, expect } from 'vitest'
import { leadCandidates, pickLead, pathDoneOn, shownTitle, stepLine, stopLine, newsStop, goFace, LINES, todayLead, firstStop, leadSub } from './dayLead.js'
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
