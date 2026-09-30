# S0 · Çizilecek ekranlar ve uygulamanın tasarım dili (tasarımcı için özet)

Tarih: 2026-09-30. Dayanak: onaylı plan `docs/yol-haritasi/tasarim/SONSUZ_YOL.PLAN.v1.md` (aşağıda "plan"; `§3.F.4 · :1064`
= planın 3.F.4 bölümü, dosyanın 1064. satırı). Ayrıntı notları: `arastirma-v1/` (`merdiven.md`, `gelisim-nef.md`,
`gunun.md`, `hava-ay.md`, `bes-saniye.md`) ve planın dayandığı `YOL.nef.md`. Bu belge kod değildir: `app/` altında hiçbir
dosya değişmedi, git kullanılmadı.

Kod satırları 2026-09-30 05.45 (UTC) çalışma ağacından okundu; yollar `app/src/` altına göredir. **Dikkat:** aynı anda
başka bir oturum `app/` altında yoga kodu yazıyor; bu belge yazılırken `screens/Home.jsx`, `components/TodayPath.jsx` ve
`lib/today.js` değişti ve satırlar 8–14 satır kaydı. Planın verdiği satır numaraları (ör. `Home.jsx:207`) bu yüzden
bugünküyle tutmayabilir; aşağıdaki numaralar bugünkü hâldir.

**İşaretler**
- «…» ya da tırnak içindeki metin **plandan birebir** alınmıştır; yanında bölüm ve satır yazar.
- **PLANDA YOK** → ardından gelen **VARSAYIM** benim önerimdir; sahibin onayına gider.
- **NOTTA** → metin planda değil, `arastirma-v1/` notlarında ya da `YOL.nef.md`'de geçer; plan onu ne aldı ne reddetti.
- **ÇELİŞKİ** → plan aynı şey için iki farklı metin ya da kural veriyor; önerim yanındadır. Hepsi Bölüm 3'te toplandı.

**Bütün çizimlerde geçerli yedekler (sahibin 2026-09-30 kararı ve plan §1 :187-196)**
1. **Hukukçu yok:** konum izni istenmez; "Konumumu kullan" hiçbir ekranda çizilmez; hava yalnız kişinin seçtiği ilin
   merkezine göre gelir (Apple'a kişinin konumu değil, ilin merkezi gider); Nef'e ruh hâli gitmez (`n7`, `moodStatus` yok).
2. **App Review'a sorulmadı:** Ana sayfa başlığında hava **yok**, yalnız ay; hava yalnız tam atıflı "Hava ve ay" kartında
   görünür; yağmur bildiriminde "Kaynak: Apple Weather" satırı bulunur (§1 :194-196; §3.H :1233-1235).
3. **Psikolog yedeği (onaylı yoga planı):** Zor Anlar İçin yolda hiç gelmez; Kendine Şefkat yolda yalnız 17.00'den sonra
   gelir (§2.3 :289-295). Yoldaki yoga durağının metinleri onaylı yoga planına aittir, bu belgede yeniden yazılmadı.

**Çizim kuralı:** her ekran iki temada (açık, koyu) ve iki genişlikte (390 pt, 320 pt) çizilir (§3.H :1212).
**Sahibin dil kuralları:** ekrandaki cümle = söylenen cümle; düzgün, sade, doğal Türkçe (anlatım bozukluğu, yüklemsiz
cümle, çeviri kokusu yok); sağlık iddiası yok ("iyileştirir, korur, önler, kanıtlanmış" yok); ilk 4 saniyede etkile;
mükemmel değilse gönderme. Nef satırındaki her cümle en çok 70 karakterdir (§3.H :1216-1219); aşağıdaki bütün Nef
cümleleri sayıldı, hepsi 70 ve altındadır.

---

## Bölüm 1 · Uygulamanın bugünkü tasarım dili

### 1.1 Kodda yazılı ilkeler (`styles.css:1-8`)

> Tema: sistem (varsayılan) · açık · koyu (Profil → Görünüm; lib/theme.js data-theme yazar)
> Renkler: iris (turkuaz → mavi) ana vurgu; mercek sarısı YALNIZCA ödül/seri; test alanı her temada beyaz (standart).
> Kontrast: açık temada düğme beyaz yazı / #0b7480–#2458cc ≥ 5,3:1; koyu temada #041017 / #19c2d1–#3e7bfa ≥ 4,9:1.
> Yazı: Unbounded (başlık, büyük sayı) · Onest (gövde) · JetBrains Mono (veri).

Tasarımcı için sonucu: "Yeni" rozeti, beş yüz, hava ve ay öğeleri **sarı (`--lens`) kullanmaz**; sarı yalnız ödül ve
seridir. Koyu tema iki yerde tanımlıdır: `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) {…} }`
(`styles.css:53-91`) ve `:root[data-theme='dark'] {…}` (`styles.css:92-128`). Sayfanın `lang="tr"` olduğu için
(`index.html`) CSS'teki büyük harf dönüşümü Türkçe doğru çalışır ("Yeni" → "YENİ").

### 1.2 Renk tokenları (`styles.css:10-128`)

| Token | Açık | Koyu | Kullanım |
|---|---|---|---|
| `--bg` | `#f3f6f8` | `#070c12` | sayfa zemini (açılış ekranı zemini de bu, bkz. 1.6) |
| `--bg-grad` | `radial-gradient(900px 520px at 0% -12%, rgba(17, 169, 184, 0.12) 0%, rgba(17, 169, 184, 0) 60%)` | aynı biçim, `rgba(25, 194, 209, …)` | `body { background: var(--bg-grad), var(--bg); }` |
| `--surface` | `#ffffff` | `#0f171f` | kart |
| `--surface-2` | `#e9eef2` | `#141e28` | kart içi kutu, seçenek zemini |
| `--surface-3` | `#dde4ea` | `#1c2834` | boş şerit hücresi, iskelet |
| `--border` | `#e1e7ec` | `rgba(255, 255, 255, 0.08)` | çizgi |
| `--ink` | `#0b1219` | `#eef3f6` | ana yazı |
| `--ink-2` | `#33414d` | `#b9c4cd` | ikincil yazı |
| `--ink-3` | `#5b6976` | `#8b98a5` | üçüncül yazı, üst başlık |
| `--accent` | `#0b7480` | `#19c2d1` | bağlantı, seçili kenar |
| `--accent-ink` | `#ffffff` | `#041017` | ana düğme yazısı |
| `--accent-soft` | `rgba(17, 169, 184, 0.12)` | `rgba(25, 194, 209, 0.14)` | rozet ve seçili zemin |
| `--accent-graphic` | `#11a9b8` | `#19c2d1` | grafik dolgusu, şerit hücresi |
| `--accent-grad` | `linear-gradient(90deg, #0b7480, #2458cc)` | `linear-gradient(90deg, #19c2d1, #3e7bfa)` | ana düğme |
| `--accent-glow` | `0 8px 22px -10px rgba(36, 88, 204, 0.55)` | `0 8px 24px -8px rgba(25, 194, 209, 0.55)` | ana düğme gölgesi |
| `--iris-1` / `--iris-2` | `#11a9b8` / `#2f6bea` | `#19c2d1` / `#3e7bfa` | iris motifi |
| `--lens` / `--lens-soft` / `--lens-text` / `--lens-ink` | `#f5a623` / `rgba(245, 166, 35, 0.16)` / `#9a5b06` / `#2a1600` | `#ffb13b` / `rgba(255, 177, 59, 0.15)` / `#ffb13b` / `#2a1600` | **yalnız ödül ve seri** |
| `--mark-down` | `#ea580c` | `#ff7a59` | Gelişim haritasında aşağı yay |
| `--chart-line` / `--chart-point` / `--chart-grid` | `#11a9b8` / `#8a98a4` / `#e4eaef` | `#19c2d1` / `#8b98a5` / `#1b2631` | grafik |
| `--warn` / `--warn-bg` | `#9a3412` / `rgba(232, 96, 62, 0.12)` | `#ff9a7d` / `rgba(255, 122, 89, 0.14)` | uyarı |
| `--danger` / `--danger-bg` | `#b91c1c` / `rgba(220, 38, 38, 0.1)` | `#fca5a5` / `rgba(248, 113, 113, 0.14)` | tehlike |
| `--ok` / `--ok-bg` | `#13704b` / `rgba(31, 169, 116, 0.13)` | `#35d39a` / `rgba(53, 211, 154, 0.12)` | olumlu durum |
| `--shadow` | `0 1px 2px rgba(11, 18, 25, 0.04), 0 8px 24px rgba(11, 18, 25, 0.05)` | `none` | kart gölgesi |
| `--shadow-lg` | `0 2px 4px rgba(11, 18, 25, 0.05), 0 20px 44px rgba(36, 88, 204, 0.1)` | `0 24px 60px -30px rgba(0, 0, 0, 0.8)` | öne çıkan kart |
| `--tabbar-bg` | `rgba(255, 255, 255, 0.86)` | `rgba(7, 12, 18, 0.88)` | alt sekme çubuğu |
| `--radius` / `--radius-sm` | `22px` / `14px` | aynı | köşe |

Bileşene özgü tokenlar (yeniden kullanılacaklar):
- Bugünün yolu (`styles/todaypath.css:5-28`): `--tp-moon` açık `#0b7480`, koyu `#eef3f6`; `--tp-moon-track` açık
  `rgba(11, 18, 25, 0.1)`, koyu `rgba(255, 255, 255, 0.12)`; `--tp-pill` `#ddf3f5` / `#0b2a33`; `--tp-pill-line`
  `rgba(11, 116, 128, 0.3)` / `rgba(25, 194, 209, 0.35)`; `--tp-ok` `#1fa974` / `#35d39a`; `--tp-gold` `#f5a623` / `#ffb13b`.
- Giriş ekranı her temada gecedir (`styles/intro.css:3-15`): zemin `#02050a`, yazı `#eaf2f6`, alt yazı
  `rgba(234, 242, 246, 0.72)`, düğme `linear-gradient(90deg, #19c2d1, #3e7bfa)` üstünde `#041017`, parıltı
  `0 0 30px rgba(25, 194, 209, 0.45)`.
- Site aynı paleti kullanır (`site/src/site.css:7-35` ve koyu tema `:40-84`).

### 1.3 Yazı yığını ve ölçek

Yazı tipleri `main.jsx:3-5`'te `@fontsource-variable` ile yüklenir:
```css
--font-display: 'Unbounded Variable', 'Avenir Next', system-ui, sans-serif;
--font-body: 'Onest Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono Variable', ui-monospace, 'SF Mono', monospace;
```

| Rol | Değer | Yer |
|---|---|---|
| Sayfa başlığı `h1` | display, 1.55rem, 700, satır 1.15, harf aralığı −0.01em | `styles.css:143` |
| `h2` / `h3` | 1.125rem 650 / 1rem 600 | `styles.css:144-145` |
| Gövde `p` | satır 1.55 | `styles.css:146` |
| Üst başlık `.eyebrow` | 0.8125rem, 600, `--ink-3`, +0.02em (büyük harf değil) | `styles.css:164` |
| Mono üst başlık (büyük harf) | `.src-ey` / `.oq-ey`: mono 0.72rem, +0.08em, büyük harf, `--accent` | `styles/sources.css:8`, `styles/profile.css:17` |
| Ana sayfa bölüm başlığı | `.home-h h2`: display 1.02rem 650 | `styles/home.css:69` |
| Kart başlığı | `.hh-ask h3`: `650 1.02rem/1.3` display; `.ask-card h3`: display 1.05rem | `home.css:210`, `profile.css:131` |
| Soru başlığı (tek soru ekranı) | `.oq-q`: display 700 1.45rem/1.22 | `profile.css:18` |
| Alttan açılan sayfa başlığı | `.cs-sheet h2`: `700 1.35rem/1.15` display | `styles/consent.css:10` |
| Büyük sayı | `.hh-big b`: `800 3.2rem/0.85` display (360 px altında 2.6rem) | `home.css:164`, `:206` |
| Mono veri etiketi | `.hh-lbl`: `500 0.68rem/1.3` mono, +0.08em, büyük harf, `--ink-3` | `home.css:166` |
| Nef cümlesi | `.hh-nef p`: `500 1rem/1.4` body; alt satırı 0.8rem `--ink-3` | `home.css:187-188` |
| Hap / rozet | `.badge` 0.72rem 650; `.p2-pill` 0.7rem 700 | `styles.css:267-270`, `styles/progress2.css:18` |

### 1.4 Köşe, boşluk, gölge, hareket

- Ekran: `max-width: 560px`; kenar boşluğu 20 px (üstte `20px + safe-area`), bloklar arası 16 px (`styles.css:150-157`).
- Kart: iç boşluk 18 px, köşe `--radius` 22 px, iç aralık 10 px (`styles.css:169-178`). Öne çıkan kart 20 px ve
  `--shadow-lg` (`:179`). Ana sayfa büyük düğmesi 22 px, küçük kutular 18 px, rıza sayfası üstte 32 px köşe.
- Düğme yüksekliği 54 px, küçük düğme 40 px, simge düğmesi 44 × 44 px (`styles.css:188-209`). Dokunma alanı en az 44 px
  (Bugünün yolu durağında `::before { inset: -6px }`, `todaypath.css:77`).
- Koyu temada `--shadow` yoktur; derinlik zemin tonlarıyla verilir.
- Hareket: sayfa girişi `fade-in 0.28s` (`styles.css:383-384`); "hareketi azalt" tercihinde bütün animasyonlar durur
  (`styles.css:386-388`).
- Simgeler: `lucide-react` (`app/package.json:28`), çizgi simgeler; yolun kendi çizgi simgeleri `components/TodayPath.jsx`
  `GLYPH` (24 × 24, `stroke-width 2`, yuvarlak uçlar). Sağa ok için uygulamada `ChevronRight` kullanılır.

### 1.5 Yeniden kullanılacak kalıplar (CSS aynen)

**Kart ve tonları** (`styles.css:169-183`)
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-hero { box-shadow: var(--shadow-lg); padding: 20px; }
.card.tone-warn { background: var(--warn-bg); border-color: transparent; color: var(--warn); box-shadow: none; }
.card.tone-danger { background: var(--danger-bg); border-color: transparent; color: var(--danger); box-shadow: none; }
.card.tone-ok { background: var(--ok-bg); border-color: transparent; color: var(--ok); box-shadow: none; }
.card.tone-accent { background: var(--accent-soft); border-color: transparent; box-shadow: none; }
```

**Düğmeler** (`styles.css:188-209`)
```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; min-height: 54px; padding: 14px 18px;
  font-size: 1rem; font-weight: 650; letter-spacing: -0.01em;
  border: 1px solid transparent; border-radius: 16px;
  background: var(--accent-grad); color: var(--accent-ink); box-shadow: var(--accent-glow);
  cursor: pointer; transition: transform 0.12s ease, filter 0.12s ease, background 0.2s;
}
.btn-secondary { background: var(--surface); color: var(--ink); border-color: var(--border); box-shadow: var(--shadow); }
.btn-ghost { background: transparent; color: var(--ink-2); border-color: var(--border); font-weight: 550; box-shadow: none; }
.btn-sm { min-height: 40px; padding: 8px 14px; font-size: 0.9rem; width: auto; border-radius: 12px; }
.link-btn { background: none; border: 0; padding: 8px 0; color: var(--accent); font-weight: 600; cursor: pointer; }
```

**Rozet, hap, durum çipi** (`styles.css:244-251`, `:267-270`; `styles/progress2.css:18-21`)
```css
.badge {
  display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 650; background: var(--accent-soft); color: var(--accent);
}
.trend-chip {
  display: inline-flex; align-items: center; gap: 4px; align-self: flex-start;
  padding: 4px 10px; border-radius: 999px; font-size: 0.8125rem; font-weight: 600;
  background: var(--surface-2); color: var(--ink-2);
}
.p2-pill { justify-self: start; display: inline-block; font-size: 0.7rem; font-weight: 700; border-radius: 999px; padding: 2px 8px; background: var(--surface-2); color: var(--ink-3); }
.p2-pill.ok { background: var(--ok-bg); color: var(--ok); }
.p2-pill.warn { background: var(--warn-bg); color: var(--warn); }
```

**Liste satırı** (`styles.css:353-360`; Ana sayfa modül satırı `styles/home.css:101-116` aynı dilde, `min-height: 60px`)
```css
.list { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.list-row {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px;
  background: none; border: 0; border-bottom: 1px solid var(--border); text-align: left; cursor: pointer;
}
```

**Ana sayfa başı: Nef satırı, büyük düğme, sayılar** (`styles/home.css:163-205`)
```css
.hh-lbl { font: 500 0.68rem/1.3 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); margin-top: -4px; }
.hh-facts { display: grid; gap: 8px; padding-top: 12px; border-top: 1px solid var(--border); }
.hh-fact { display: flex; align-items: center; gap: 8px; font: 500 0.82rem/1.2 var(--font-body); color: var(--ink-2); white-space: nowrap; }
.hh-fact b { font: 600 0.82rem/1 var(--font-mono); color: var(--ink); font-variant-numeric: tabular-nums; min-width: 30px; }
.hh-nef { display: flex; gap: 12px; align-items: flex-start; }
.hh-nef p { margin: 0; font: 500 1rem/1.4 var(--font-body); color: var(--ink); }
.hh-nef p span { display: block; margin-top: 3px; font-size: 0.8rem; color: var(--ink-3); }
.hh-go { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 14px 14px 18px; border: 0; border-radius: 22px; text-align: left; cursor: pointer;
  background: var(--accent-grad); color: var(--accent-ink); box-shadow: var(--accent-glow); }
.hh-go .t small { font: 600 0.68rem/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.72; }
.hh-go .t b { font: 700 1.1rem/1.15 var(--font-display); letter-spacing: -0.01em; }
.hh-go .ar { width: 44px; height: 44px; flex: none; border-radius: 50%; background: rgba(3, 16, 24, 0.9); display: grid; place-items: center; color: var(--iris-1); }
```
Sayı satırlarının simge renkleri: seri `.f1` `--lens-text` (Flame), hafta `.f2` `--iris-1` (CalendarDays), gün seninle
`.f3` `--iris-2` (CircleDot), adım `.f4` `--ok` (Footprints) (`home.css:172-175`).

**Tek satırlık şerit** (Ana sayfadaki çalışma oturumu şeridi; hava teklifi için aday, `styles/home.css:212-220`)
```css
.hh-focus {
  display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 14px; border-radius: 16px;
  background: var(--accent-soft); color: var(--ink); font-size: 0.875rem; line-height: 1.3;
}
```

**Alttan açılan rıza sayfası** (`styles/consent.css:2-25`, bileşen `components/ConsentSheet.jsx`)
```css
.cs-sheet { width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; display: grid; gap: 16px; padding: 10px 22px calc(26px + env(safe-area-inset-bottom, 0px));
  background: var(--surface); border-radius: 32px 32px 0 0; border-top: 1px solid var(--border); animation: cs-up 0.28s ease-out; }
.cs-shield { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; color: var(--accent);
  background: linear-gradient(140deg, color-mix(in srgb, var(--iris-1) 18%, transparent), color-mix(in srgb, var(--iris-2) 18%, transparent)); }
.cs-facts { margin: 0; display: grid; gap: 1px; border-radius: 18px; overflow: hidden; background: var(--border); }
.cs-facts div { display: grid; gap: 3px; padding: 11px 14px; background: var(--surface-2); }
.cs-facts dt { font-size: 0.78rem; font-weight: 600; line-height: 1.3; color: var(--ink-3); }
.cs-facts dd { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--ink); }
.cs-ok { position: relative; display: flex; gap: 12px; align-items: flex-start; padding: 14px; border-radius: 18px; border: 1.5px solid var(--border); cursor: pointer; }
.cs-ok.on { border-color: var(--accent); }
.cs-box { width: 24px; height: 24px; flex: none; margin-top: 1px; border-radius: 7px; border: 2px solid var(--ink-3); display: grid; place-items: center; color: var(--accent-ink); }
```

**Kaynak kartı ve kaynak satırı** (`styles/sources.css:2-16`; kanıt kartları için)
```css
.src-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.src-ey { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
.src-cite { display: flex; flex-direction: column; gap: 2px; padding-top: 8px; border-top: 1px dashed var(--border); }
.src-cite .who { font-weight: 700; font-size: 0.85rem; color: var(--ink); }
.src-cite .meta { font: 500 0.7rem/1.5 var(--font-mono); color: var(--ink-3); }
.src-cite .doi { font: 500 0.72rem var(--font-mono); color: var(--accent); display: inline-flex; gap: 4px; align-items: center; overflow-wrap: anywhere; min-height: 32px; }
```

**Beşli ölçek** (Nefeste 1–5 sakinlik; beş yüz için en yakın örnek, `styles/breath.css:152-157`)
```css
.br-calm5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.br-calm5 button { min-height: 56px; border-radius: 14px; border: 0; background: var(--surface-2); color: var(--ink); font: 600 1.25rem var(--font-mono); cursor: pointer; }
.br-calm5 button[aria-pressed='true'] { background: var(--accent-graphic); color: var(--accent-ink); }
.br-ends { display: flex; justify-content: space-between; font: 500 0.7rem var(--font-mono); color: var(--ink-3); }
.br-calmcard { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: var(--surface); border: 1px solid var(--border); }
```

**Nefes kalıbının adımları** (al · tut · ver · bekle kutuları, `styles/breath.css:117-122`)
```css
.br-steps { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 8px; }
.br-steps .st { display: grid; justify-items: center; gap: 6px; padding: 10px 4px; border-radius: 14px; background: var(--surface); border: 1px solid var(--border); }
.br-steps small { font-size: 0.72rem; color: var(--ink-3); text-align: center; line-height: 1.2; }
.br-steps b { font: 600 1.25rem/1 var(--font-mono); font-variant-numeric: tabular-nums; }
```

**28 günlük şerit ve Gelişim satırı** (`styles/progress2.css:80-88`)
```css
.gm-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; padding: 11px 0; border: 0; border-top: 1px solid var(--border); background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.gm-row .n { font-weight: 650; }
.gm-row .m { grid-column: 1; font-size: 0.8rem; color: var(--ink-2); overflow-wrap: anywhere; }
.gm-row .r { grid-row: 1 / 3; grid-column: 2; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 6px; }
.gm-bar { display: flex; gap: 1px; width: 84px; height: 6px; }
.gm-bar i { flex: 1; border-radius: 1px; background: var(--surface-3); }
.gm-bar i.on { background: var(--accent-graphic); }
```

**Nef kartı** (`styles/coach.css:2-19`)
```css
.coach-card { gap: 10px; position: relative; overflow: hidden; }
.coach-card::before {
  content: ''; position: absolute; inset: 0 0 auto 0; height: 3px;
  background: linear-gradient(90deg, var(--accent-graphic), var(--accent-soft));
}
.coach-badge {
  display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700;
  color: var(--accent); background: var(--accent-soft); padding: 5px 10px; border-radius: 999px;
}
.coach-insight { margin: 0; font-size: 1.05rem; font-weight: 600; line-height: 1.45; color: var(--ink); }
.coach-action {
  display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;
  min-height: 48px; padding: 10px 14px; border-radius: 14px; border: 0; cursor: pointer; text-align: left;
  background: var(--surface-2); color: var(--accent); font-weight: 700; font-size: 0.95rem;
}
```

**Bugünün yolu: etiket, mono etiket, mola bandı, Nef baloncuğu** (`styles/todaypath.css`)
```css
.tp-btag { position: absolute; left: 24px; top: 10px; font: 500 10px/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
.tp-lb { position: absolute; z-index: 1; font: 700 13px/15px var(--font-body); color: var(--ink); white-space: nowrap; pointer-events: none; }
.tp-lb small { display: block; font: 500 11.5px/14px var(--font-body); color: var(--ink-3); }
.tp-lb .tag { display: block; font: 500 9.5px/12px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
.tp-lb.rest { transform: translateY(-50%); white-space: normal; width: 128px; }
.tp-go { position: absolute; z-index: 2; transform: translateX(-50%); font: 700 11.5px/1 var(--font-body); color: var(--accent); background: var(--tp-pill); border: 1px solid var(--tp-pill-line); padding: 5px 11px; border-radius: 999px; pointer-events: none; }
.tp-jb-b { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 10px 12px; box-shadow: var(--tp-bshadow); }
.tp-jb .w { display: block; font: 800 15px/1.15 var(--font-display); color: var(--ink); letter-spacing: -0.01em; transition: color 0.4s; }
.tp-jb .l2 { display: block; font: 600 12px/1.3 var(--font-body); color: var(--ink-2); margin-top: 4px; }
```
(satırlar: `.tp-btag` :52, `.tp-lb` :136-146, `.tp-go` :147, `.tp-jb-b` :166, `.tp-jb .w/.l2` :172-174)

**Akşam kartı** (bugünkü; `styles/profile.css:129-132`)
```css
.ask-card { display: flex; flex-direction: column; gap: 10px; }
.ask-card.evening { background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 10%, var(--surface)), var(--surface)); }
.ask-card h3 { margin: 0; font-family: var(--font-display); font-size: 1.05rem; }
.ask-card .row .btn { flex: 1; }
```

**Giriş ekranı** (`styles/intro.css:3-23`; ölçek birimi `--u: min(calc(100vw / 390), calc(100vh / 844))`)
```css
.intro { position: fixed; inset: 0; z-index: 40; background: #02050a; color: #eaf2f6; color-scheme: dark; overflow: hidden; }
.intro .intro-start {
  position: absolute; left: 50%; top: 90.2%; transform: translate(-50%, -50%); z-index: 1;
  width: min(50%, 240px); min-height: 48px; height: min(6.2%, 56px); padding: 0; border-radius: 999px;
  background: linear-gradient(90deg, #19c2d1, #3e7bfa); color: #041017; font-size: 1.06rem; font-weight: 600;
  box-shadow: 0 0 30px rgba(25, 194, 209, 0.45);
}
.intro-brand {
  --u: min(calc(100vw / 390), calc(100vh / 844));
  position: absolute; left: 24px; right: 24px; bottom: 50.5%; z-index: 1; margin: 0; text-align: center; color: #eaf2f6;
}
.intro-brand h1 { margin: 0; font: 700 calc(40 * var(--u)) / 1.1 var(--font-display); letter-spacing: calc(-0.8 * var(--u)); text-wrap: balance; }
.intro-brand p { margin: calc(8 * var(--u)) 0 0; font: 400 calc(16.5 * var(--u)) / 1.35 var(--font-body); color: rgba(234, 242, 246, 0.72); text-wrap: balance; }
```

### 1.6 Ekranlar bugün nasıl görünüyor

**Açılış ekranı (iOS).** `ios/App/App/Base.lproj/LaunchScreen.storyboard:15`: tam ekran "Splash" görseli, ortada Nefona
logosu. Görselin zemini PNG'lerden okundu: açıkta `#f3f6f8`, koyuda `#070c12` (`Assets.xcassets/Splash.imageset`); yani
`--bg` ile aynı renk.

**Giriş ekranı** (`components/IntroFilm.jsx:40-49`, onaylı Artifact "Nefona Giriş Ekranı"): hareketsiz gece tuvali
(`lib/introStill.js`), ortada "Nefona" (h1, :44), altında "Fark etmeyi yeniden öğren." (:45), göz bebeğinin
karanlığında "Başla" (:47). İlk açılışta bir kez gösterilir (`lib/intro.js:4` `INTRO_VERSION = 3`).

**İlk Bakış tanıtımı** (`lib/firstLookText.js:22-27`): üst başlık "20 saniye", başlık "Önce bir şey fark edelim", açıklama
"Kısa bir yazı okuyacaksın; okuduğun kelime sarıyla ilerler. Bu sırada kamera yalnız göz kapaklarını sayar.", "Başla".
Sonuç ekranı "20 saniyede · X kez kırptın" (:33-34). Ardından hesap ekranı `screens/AccountStart.jsx` ("Hoş geldin", :117;
Pegasus gökyüzü sahnesi `SkyChart`).

**Ana sayfa** (`screens/Home.jsx`, onaylı Artifact "Nefona Bugün ve Profil"), üstten alta:
1. Rıza sayfaları varsa en üstte (`:214-215`).
2. Başlık: tarih satırı `.eyebrow` (`:218`; kod `toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })`
   ve Node'da denendi: **"29 Eylül Salı"**), selam + ad (`:219-222`; `lib/greeting.js:2-9`: 05.00'ten önce "İyi geceler",
   12.00'den önce "Günaydın", 18.00'den önce "İyi günler", 22.00'den önce "İyi akşamlar"), sağda avatar (44 px).
3. **Yeni (yoga oturumu, bugün eklendi):** yoga sabah kartı başlığın hemen altında (`:236-237`); bkz. Bölüm 3, madde 19.
4. Günün diyaframı ve sayılar (`:240-265`): büyük "0 / 9", altında "DURAK · ≈15 DK KALDI"; satırlar "N gün seri" (`:250`),
   "N/3 hafta" + 7 nokta (`:251-254`), adım (Sağlık izni varsa, `:255-260`), "N gün seninle" (`:261`).
5. Nef satırı ve büyük düğme (`:267-286`): göz simgesi + cümle (`lib/homeSuggest.js`: "Güne Isınma ile başla." gibi) ve
   altında "Nef · 1 dk"; gradyan düğme (üstte mono "GÜNE BAŞLA", altta "Isınma · 1 dk", sağda oynat dairesi); altında
   Nefes ve Dalga.
6. Gelişim haritası (`:288`), tek kart yuvası (`:290-323`), mola bandı (`:325-334`), yerinde sorular (28. gün iris,
   akşam, ilk hafta; `:337-369`), "Bugünün yolu" (`:371-385`), alarm kartı (`:388`), Nef kartı (`:390`), ölçüm
   kutucukları, pratikler, egzersiz ve ölçüm listeleri.

**Bugünün yolu** (`components/TodayPath.jsx`, onaylı Artifact "Bugünün Yolu"): üstte bütün durakların tek satırlık şeridi
(`Ribbon`, :470); yol iki kanat yayı: 1. bölüm sağa, mola bandı (su, yıldız, halka; "MOLA · 5 DK", :336), 2. bölüm sola,
en sonda altın kenarlı "Bugünün görevi". Durak biçimleri: egzersiz = diyafram kanatları, ölçüm = mercek (üstünde "ÖLÇÜM"
etiketi), pratik = kanatların ardında sahne, mola = ay halkası (:139). Bölüm etiketi "1. bölüm" + göz payı ölçeği ve
"≈ N dk göz" (:364-373). Sıradaki durağın altında "Başla" hapı (:411), sırası gelmemiş durağa dokununca "Önce: …"
(:415). Nef baloncuğu tek kelime + tek satır (`lib/today.js:409-447`: "Hadi" / "İlk durak: …", "Sırada … · 5 dk mola").
Altta sabit not "Hareketler rahatlamak için. Görmeyi iyileştirdiği gösterilmedi." (:462) ve "Bu hafta 2/3 gün" (:463).

**Nef kartı** (`components/CoachCard.jsx`): rıza yokken tanıtım kartı: rozet "Nef Göz Koçu", "Kendi verine bakıp her gün
tek bir içgörü ve bir öneri yazar.", "Nasıl çalışır, aç" (:62-76). Rızayla: rozet "Bugün · Nef", kural yedeğinde
"çevrimdışı öneri", içgörü cümlesi ve eylem düğmesi; beklerken iki çizgilik iskelet (:82-106).

**Akşam kartı ve soruları** (bugünkü, kalkacak): `Home.jsx:348-358`: üst başlık "Akşam kontrolü · 3 soru · 30 sn", başlık
"Günün nasıl geçti?", "Ekran, uyku ve gece telefonu. Her ekranda tek soru.", "Başla" / "Sonra". Sorular tek soruluk tam
ekranda (`components/QuestionFlow.jsx`, stil `profile.css:12-32`): "Bugün kaç saat ekrana baktın? (iş + kişisel)", uyku
0–10 kaydırıcı, gece telefonu (`lib/profileQuestions.js:74-101`; grup `:170`, saat 18.00 `:174`).

**Nefes sonuç ekranı** (`screens/Breath.jsx:449-474`): başlık "Tamamlandı" ya da "Erken bitti", alt satır "Sakin ritim ·
3 dk · 18 döngü" biçiminde; "Şimdi ne kadar sakinsin?" 1–5; "Zorlandım"; "Kaydet"; "Yeniden". "2 dk daha" buraya gelecek.
Kalıp adları ve ritimleri `lib/breath.js:39-135` (ör. Sakin ritim "4 · 6", Kutu "4·4·4·4"); aşama adları "Nefes al",
"Nefes tut", "Nefes ver", "Bekle" (`:23-27`).

**Rıza sayfası** (`components/ConsentSheet.jsx:17-39`): kalkan simgesi, başlık, giriş cümlesi, dört satırlık bilgi kutusu,
işaretsiz onay kutusu, "İzin ver" (kutu işaretlenmeden çalışmaz) ve "Şimdi değil", altta "İznini Profilim → İzinlerim'den
her an geri çekebilirsin." Metinler `lib/consent.js:25-82`.

**Gelişim** (`screens/Progress.jsx:673`, "Gelişim" başlığı; `components/ProgressOverview.jsx`): göz uyarısı, 5. gün raporu
düğmesi, iris haritası (ortada "N GÜN", :266), lejant "düzen (28 gün) · iyileşiyor · geriliyor" (:278-282), yedi alan
satırı (ad, değer, hap, 28 günlük şerit; :283-299). Haplar bugün "iyileşiyor / geriliyor / doğal oynama / henüz belirsiz /
ilk ölçüm" (:36-48), etkilerde "belirgin iyileşme / belirgin kötüleşme" (:48), gözde "doğrulanmış değişim yok" (:55).
Alan ayrıntısında "Yöntem" kartı (:461-464).

**Sitenin ilk ekranı** (`site/pages/index.html:3-20`, stil `site/src/home.css:9-20`): üst başlık "iPhone için · yakında App
Store'da", h1 "Gözün değişiyor.<br>Sen de gör.", soru satırı "Telefonu biraz daha uzağa mı tutuyorsun? Akşamları harfler
mi bulanıyor?", tanıtım paragrafı, iki düğme ("E hangi yöne bakıyor? Dene", "Bir günün nasıl geçer"), üç kısa gerçek;
sağda telefon çerçevesinde E testi tadımlığı. Masaüstünde iki sütun `grid-template-columns: 1.1fr 0.9fr`, 900 px altında
tek sütun; h1 `clamp(2.2rem, 5.6vw, 3.9rem)`.

---

## Bölüm 2 · Çizilecek ekranlar ve birebir metinler

### a) Ana sayfa · günün ilk açılışı (Y3; ay Y4)

Kaynak: §3.F.3 (:1039-1057), §3.F.4 (:1059-1078), §3.E.7 (:966-969), karar 5d (:175-176), §2.2 K2 ve K4 (:270-271).
Yeni ekran yoktur; bugünkü Ana sayfanın üst alanı değişir.

**İlk 5 saniye (§3.F.3 :1044-1051)**

| Saniye | Göz nereye gider | İçerik |
|---|---|---|
| 0–1 | açılış ekranı → Ana sayfa | düz zemin, logosuz (karar 5c) |
| 1–2 | tarih satırı | ay evresi (hava yok: App Review yedeği) |
| 1–2 | selam | "Günaydın, Haydar" (bugünkü gibi) |
| 2–4 | Nef satırı | günün tek cümlesi |
| 4–5 | büyük düğme | "Güne başla · Sağ–sol bakış · 1 dk" ve "Yeni" rozeti |
| yan | sayılar | "0/9 durak · ≈ 15 dk"; seri yalnız ≥ 3 gün, değilse "12 gün seninle"; sıfır satırı yok |

**Tarih satırı ve ay şeridi**
- Plan metni: «Salı, 29 Eylül · küçülen şişkin ay»; «önünde evreye göre çizilen ay simgesi durur» (§3.E.7 :966-967);
  satırın sonunda küçük ok «›» ve dokununca "Günün" sayfası açılır (§1 :72; §3.D.3 :788-789). 320 pt'de «şerit ikinci
  satıra iner» (:968). Ağ beklenmez.
- **ÇELİŞKİ:** bugünkü kod aynı satırı "29 Eylül Salı" diye yazar (`Home.jsx:218`). **VARSAYIM:** kodun biçimi kalsın:
  "29 Eylül Salı · küçülen şişkin ay ›" (kişinin bugün gördüğü satır değişmez; yalnız ay eklenir).
- Ay simgesinin yeri PLANDA YOK ("önünde" satırın başı mı, evre adının önü mü belli değil). **VARSAYIM:** evre adının
  hemen önünde, 14 px (NOTTA `bes-saniye.md` §3.1: "29 Eylül Salı · ◐ ilk dördün"). Renk: aydınlık kısım `--tp-moon`
  (açık `#0b7480`, koyu `#eef3f6`), karanlık kısım `--tp-moon-track`; yoldaki ay halkasıyla aynı dil (`todaypath.css:8`,
  `:17`). Sarı kullanılmaz.
- Evre adları (§3.E.3 :899-900): yeniay, büyüyen hilal, ilk dördün, büyüyen şişkin ay, dolunay, küçülen şişkin ay, son
  dördün, küçülen hilal; "yeniay" ve "dolunay" yalnız o takvim gününde yazılır.
- Ok: **VARSAYIM** `ChevronRight` 14 px, `--ink-3`. Satırın dokunma alanı 44 pt yüksekliğe tamamlanır (satırın kendisi
  ≈ 18 px).
- Hava bu satıra **eklenmez** (App Review yedeği). Plan, olumlu cevap gelirse «· 18° · öğleden sonra yağmur» ekler (:967-968);
  şimdi çizilmez.

**Günün tek cümlesi** (Nef satırı; «ilk tutan kazanır; hepsi telefonda, ağsız», §3.F.4 :1062-1072, birebir)

| Öncelik | Durum | Örnek |
|---|---|---|
| 0 | kırmızı ya da sarı görme uyarısı | cümle yok; uyarı en üstte |
| 1 | kurulumun ertesi günü ya da 1. gün | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." |
| 2 | bugün kilometre taşı | "Bugün 28. gün: iris haritan başlangıçla yan yana geliyor." / "Bugün haftalık E testi günü." |
| 3 | ≥ 2 günlük aradan dönüş | "Kaldığın yerden: basamakların aynı." |
| 4 | dün bir ilk ya da rekor | "Dün Yılan'da 38 puanla en iyi sonucuna ulaştın." |
| 5 | yeni doğrulanmış değişim | "Tek Bakışta oyununda sonucun iki haftadır başlangıcından iyi." |
| 6 | bugün yeni basamak ya da modül | "Bugün yeni: sağ–sol bakış." |
| 7 | dün yol tamamdı | "Dün yolunun bütün duraklarını tamamladın." |
| 8 | ≤ 3 gün içinde kilometre taşı | "İris haritan 3 gün sonra başlangıçla yan yana gelecek." |
| 9 | hiçbiri | bugünkü `homeSuggest` satırı |

Kurallar (§3.F.4 :1074-1078, §3.F.3 :1053-1055): aynı öncelik iki gün üst üste gelmez (0 ve 1 hariç); en çok 70
karakter; tek iddia; yalnız kişinin kendi başlangıcıyla karşılaştırma; "İyileşti", "gelişiyorsun", "sağlıklı" yok; tek
günlük ham fark yok; cümle gün içinde değişmez; ilk dokunuşa kadar ya da en çok 1 saat görünür, sonra `homeSuggest`
bugünkü gibi çalışır. Kırmızı ya da sarı görme uyarısında cümle yazılmaz, uyarının sabit cümlesi (`lib/trend.js`
`trendMessage`) en üste çıkar. Yenilikler ve rıza pencereleri günün ilk dokunuşundan sonra açılır; ilk rapor (5. gün) ve
kırmızı görme uyarısı istisnadır.
- İlk Bakış kamerasız yapıldıysa ("kendi sayımın") cümle PLANDA YOK. **VARSAYIM:** "İlk Bakış'ta 20 saniyede 3 kırpma
  saydın. 28. gün yeniden bakacağız." (68 karakter).
- Nef satırının alt satırı PLANDA YOK (bugün "Nef · 1 dk", `Home.jsx:270`). **VARSAYIM** (NOTTA `bes-saniye.md` §3.1):
  "Nef · ilk durak Sağ–sol bakış, 1 dk".

**"Yeni" rozeti.** Plan: büyük düğmede «"Yeni" rozeti» (§3.F.3 :1050) ve yolda «yoldaki "Yeni" rozeti» (§3.G.6 :1186);
merdiven basamağı bugün açıldıysa görünür (NOTTA `bes-saniye.md` §0 madde 2). Görünüşü PLANDA YOK. **VARSAYIM:** büyük
düğmede mono üst başlığın yanında hap: yazı "Yeni" (CSS'le büyük harf), zemin `rgba(3, 16, 24, 0.9)`, yazı `--iris-1`,
`font: 600 0.68rem/1 var(--font-mono)`, `padding: 3px 7px`, `border-radius: 999px` (düğmedeki oynat dairesiyle aynı çift,
`home.css:195`; `.badge`'in açık zemini gradyan üstünde okunmaz). 1. gün rozet yoktur (her şey yeni; **VARSAYIM**).

**Seri ve sıfırlar (karar 5d :175-176; §3.F.3 :1051).** Seri 3 gün ve üstündeyse görünür; 3 günden kısaysa yerine «"N gün
seninle"» yazar; sıfır satırı yok.
- **PLANDA YOK:** seri ≥ 3 iken "N gün seninle" satırı da kalır mı (bugün ikisi birlikte görünür, `Home.jsx:250`, `:261`).
  **VARSAYIM:** kalır; yalnız seri satırı 3'ün altında gizlenir.
- **VARSAYIM:** değeri 0 olan her satır gizlenir (seri, hafta, gün seninle; `bes-saniye.md` §1.2'nin saydığı üç sıfır). Pazartesi
  sabahı "0/3 hafta" da gizlenir; ilk kayıttan sonra görünür. Bütün satırlar gizliyse sayı bloğu hiç çizilmez.

**1., 7. ve 30. gün hâlleri.** Benzetim: 1 Ekim 2026 Perşembe başlayan, her gün 10.00'da açan, her durağı yapan yeni
kullanıcı (`arastirma-v1/sim_merdiven.mjs karar 10 30`, bu belge için yeniden koşuldu; plan §3.A.9 ile aynı çıktı). Ay
evreleri Meeus'un düşük hassasiyetli formülüyle hesaplandı (plandaki kontrol değeri 29 Eylül 12.00 için 214,5° ve %91,2
tuttu); üç tarih de evre sınırından uzaktır.

| | 1. gün · 1 Ekim Perşembe | 7. gün · 7 Ekim Çarşamba | 30. gün · 30 Ekim Cuma |
|---|---|---|---|
| Tarih satırı | "1 Ekim Perşembe · küçülen şişkin ay ›" (%75) | "7 Ekim Çarşamba · küçülen hilal ›" (%13) | "30 Ekim Cuma · küçülen şişkin ay ›" (%78) |
| Selam | "Günaydın, Haydar" | aynı | aynı |
| Nef cümlesi | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." (öncelik 1, :1064) | **ÇELİŞKİ** (Bölüm 3, madde 5). **VARSAYIM:** "Bugün 7. gün: ilk haftanı tamamlıyorsun." (öncelik 2) | "Dün yolunun bütün duraklarını tamamladın." (öncelik 7, :1070; 28. ve 29. gün öncelik 2'yi kullandı) |
| Büyük düğme | "GÜNE BAŞLA" · "Haftalık E testi · 5 dk" (bugünkü kod; Bölüm 3, madde 22) · rozet yok | "GÜNE BAŞLA" · "Isınma · 1 dk" · rozet yok (yeni olan Yakın–uzak, yolun 4. durağında) | "GÜNE BAŞLA" · "Isınma · 1 dk" · rozet yok |
| Diyafram | "0 / 4" · "DURAK · ≈8 DK KALDI" | "0 / 10" · "DURAK · ≈15 DK KALDI" | "0 / 11" · "DURAK · ≈18 DK KALDI" |
| Sayılar | hepsi 0 → hiçbiri görünmez (Sağlık izni ve verisi varsa yalnız adım) | "6 gün seri" · "2/3 hafta" · "6 gün seninle" | "29 gün seri" · "4✓ hafta" · "29 gün seninle" |
| Ek | — | yolda Yakın–uzak durağında "Yeni" | Nef kartında aylık satır (29–31. gün; bkz. h) |

### b) Bugünün yolu (Y1)

Kaynak: §1 "Aralar" (:68), §1 "Bugünkü kullanıcı" (:76-81), §3.A.4 (:379-406), §3.A.6 (:422-442), §3.A.8 (:453-471),
§3.A.9 (:473-513).

**1. gün yolu, 8 dk** (§3.A.9 :481; benzetimin durak dizisi)

| Yer | Durak | Biçim (bugünkü TodayPath) | Etiket · alt satır |
|---|---|---|---|
| 1. bölüm | Haftalık E testi | ölçüm (mercek, "ÖLÇÜM") | "Haftalık E testi" · süre yazılmaz (`hideMinutes`) |
| 1. bölüm | Çemberler | pratik | "Çemberler" · "1 dk" |
| Mola bandı | Nefes | ay halkası | bant "MOLA · 1 DK"; etiket "Nefes · 1 dk" · "Gözlerin dinlenirken nefes al." (`modules/breath/manifest.js:57`) |
| 2. bölüm | Göz kırpma | egzersiz (diyafram) | "Göz kırpma" · "1 dk" |

Bugünün görevi 2. günden açılır (§3.A.3 :374-375); 1. gün yolun sonunda altın durak yoktur. Nef baloncuğu: "Hadi" /
"İlk durak: Haftalık E testi" (`lib/today.js:426-428`). Alt not aynen kalır: "Hareketler rahatlamak için. Görmeyi
iyileştirdiği gösterilmedi." Yolun altındaki "Bu hafta 0/3 gün" (`Home.jsx:381`) 1. gün sıfırdır: **VARSAYIM** karar 5d
gereği gizlenir.

Gün gün yeni gelenler (birebir §3.A.9 :481-487): 1. gün «Haftalık E testi, Çemberler, Nefes 1 dk, Göz kırpma» (8 dk);
2. gün «Sağ–sol, Nefes 2 dk, okuma testi, Yılan, Bugünün görevi» (11); 3. gün «"Üçü birlikte" (Isınma), Nefes 3 dk, yoga»
(12); 4. gün «Yukarı–aşağı» (13); 5. gün «Uzağa bakış; ilk rapor» (14); 6. gün «Fark Ettin mi? (Yılan o gün düşer)» (14);
7. gün «Yakın–uzak» (15).

**Nefes arası ve "2 dk daha"**
- Plan (§1 :68): «Yolun arası, iki bölüm arasındaki moladır: nefes 1. gün 1, 2. gün 2, 3. günden başlayarak 3 dakikadır.
  İlk iki gün mola nefesle biter; 3. günden başlayarak molanın kalanı "2 dk daha" düğmesi ya da gözler kapalı
  dinlenmedir.» Mola 5 dakikadır (:77). "2 dk daha" aynı kalıpla sürer ve o günü 5 dakikaya tamamlar (§3.A.4 :394-396);
  yoldaki 3 dakika, 28 günlük nefes programında ancak "2 dk daha" ile gün sayılır (:80-81).
- Bant ve baloncuk metni 3. günden sonrası için PLANDA YOK. Bugünkü kod bandın süresini nefes durağından alır
  (`TodayPath.jsx:336`: "Mola · 3 dk" olurdu) ve baloncuk "Sırada Nefes · 3 dk mola" der (`lib/today.js:431`); ikisi de
  yanlış olur (mola 5 dk). **VARSAYIM:** bant "MOLA · 5 DK"; durak etiketi "Nefes · 3 dk"; baloncuk "Sırada mola: 3 dk
  nefes, 2 dk dinlenme". 1. ve 2. günde bant "MOLA · 1 DK" / "MOLA · 2 DK" (mola nefesle biter).
- "2 dk daha" düğmesi Nefes sonuç ekranına gelir (§3.G.3 Y1 :1146: `screens/Breath.jsx` ("2 dk daha")). Ekranın geri kalanı
  PLANDA YOK. **VARSAYIM** (bugünkü sonuç ekranının üstüne, `Breath.jsx:449-474`):
  - Başlık "Tamamlandı", alt satır "Sakin ritim · 3 dk · 18 döngü" (bugünkü biçim).
  - Kart: "Molanın bitmesine 2 dk var." · ana düğme **"2 dk daha"** · ikincil düğme "Gözlerimi kapatıp dinleneyim"
    (bugünkü mola ekranını açar, `onStart('eye-rest')`) · küçük satır "2 dk daha yaparsan bugün 28 günlük nefes
    programında da sayılır."
  - Altında bugünkü öğeler: "Şimdi ne kadar sakinsin?", "Zorlandım", "Kaydet".

**"Günün ritmi": nefes kalıbı gösterimi**
- Merdiven (§3.A.4 :381-389): N1 1. gün 1 dk; N2 2 dk; N3 3 dk sakin ritim 4·6; Ç-B (yeni kullanıcıda 8. günden) «"Günün
  ritmi": Sakin, Eşit, Uzun veriş, Karın», tutma yok; Ç-C (22. günden) «+ Vızıltı, Burun değiştir; alıştan sonra kısa tutma
  (ör. 4·2·6)», tutma ≤ 2 sn, haftada ≤ 2 gün; Ç-D (43. günden) «+ yumuşak kutu (ör. 4·2·4·2; senin 4·2·4·4'ün dakikada 4,3
  nefes)», bekleme ≤ 4 sn, haftada ≤ 1 gün. Hızlı soluma hiç yok; 4-7-8 kendiliğinden gelmez (§3.A.5 :412-417).
- Kartın metni: «Kart kalıbı adıyla söyler ("Bugünün ritmi: 4 · 1 · 6"); kanıt cümlesi ailenin mevcut `evidence` metnidir,
  yeni iddia yazılmaz» (:404-405).
- **ÇELİŞKİ:** katmanın adı "Günün ritmi", ekrandaki kart metni "Bugünün ritmi". **VARSAYIM:** ekranda "Bugünün ritmi".
- Yeri PLANDA YOK. **VARSAYIM:** (1) yolda Nefes durağının alt satırı o gün "Bugünün ritmi: 4 · 1 · 6" olur
  (`.tp-lb.rest small`, 128 px genişlik); (2) Nefes ekranında adımlar `.br-steps` kutularıyla: "Nefes al 4 sn · Nefes tut
  1 sn · Nefes ver 6 sn".
- 4·2·4·4 örneği (**VARSAYIM** biçim): "Bugünün ritmi: 4 · 2 · 4 · 4"; kutular "Nefes al 4 · Nefes tut 2 · Nefes ver 4 ·
  Bekle 4"; aile adı "Yumuşak kutu" (plandaki aile adı :388; ekran adı olarak PLANDA YOK). Kanıt satırı ailenin bugünkü
  metni: "Kısa vadeli, tutarsız fayda; doğrudan karşılaştırmada 6/dk'nın gerisinde (Marchant 2025; Dujawara 2026). İsteğe
  bağlı." (`lib/breath.js:121`). Bugünkü kodda iki yazım var ("4 · 6" boşluklu, "4·4·4·4" bitişik; `lib/breath.js:44`,
  `:117`); plan örneği boşluklu olduğu için boşluklu önerilir.
- Tutmalı kalıbın ön koşulu: güvenlik kartı görülmüş ve son 7 günde "Zorlandım" yok (§3.A.5 :415). "Zorlandım"dan sonra
  ertesi gün bir basamak kısa, 7 gün tutmasız (:416). Bunların ekran metni PLANDA YOK.

**Göz merdiveni basamağı** (§3.A.6 :424-436, birebir)

| Basamak | D | Yoldaki gruplar | Yol dk |
|---|---|---|---|
| K1 | 0 | Göz kırpma [kırp, kapat] | 1 |
| K2 | 1 | **Sağ–sol** [sağa bak, sola bak, kapat] · Göz kırpma | 2 |
| K3 | 2 | Isınma [kırp, sağa, sola] ("üçü birlikte") · Göz kırpma | 2 |
| K4 | 3 | Isınma · **Yukarı–aşağı** · Göz kırpma | 3 |
| K5 | 4–5 | + Uzağa bakış | 4 |
| K6 | 6–7 | + Yakın–uzak | 5 |
| K7 | 8+ | + Daire; Daire ile Yukarı–aşağı gün aşırı | 5 |
| V1 | Dvar 21+ | kırpma 5 → 10 tekrar | 5 |
| V2 | Dvar 28+ | bakışlar 5 → 8 sn, uzağa bakış 20 → 30 sn; haftada bir karışık gün | 5 |
| V3 | Dvar 42+ | kırpma 15, yakın–uzak 10 geçiş, daire 3 tur | 5 |
| V4 | Dvar 56+ | haftada bir tam set günü | 5 |

- Grup başlıkları: `isinma` K2'de «başlığı "Sağ–sol"» (:438), K3'ten sonra bugünkü "Isınma"; öteki başlıklar bugünkü
  `PATH_GROUPS` (`lib/routines.js:71-77`: Isınma, Uzağa bakış, Yakın–uzak, Daire, Göz kırpma). **ÇELİŞKİ:** §3.F.3 ve §3.F.4
  aynı grubu "Sağ–sol bakış" diye yazar. **VARSAYIM:** ekranda "Sağ–sol bakış" ("Uzağa bakış" ile aynı biçim).
- Tek yeni grup "Yukarı–aşağı" (`dikey`); yolda simgesi yok. **VARSAYIM** simge (bugünkü yatay `arrows` simgesinin dikey
  eşi, 24 × 24): `<path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><path d="M8 17l4 4 4-4"/>`.
- Yeni gelen durağın etiketinde "Yeni": **VARSAYIM** bugünkü mono etiket `.tp-lb .tag` ("ÖLÇÜM", "MOLA" ile aynı) `--accent`
  renginde "YENİ". Çeşitleme günlerinde (V1–V4) durak alt satırı PLANDA YOK; **VARSAYIM** "10 tekrar · 1 dk" gibi.
- «Ekrandaki metinler etki söylemez» (:440).

### c) "Günün nasıl geçti?" (Y4)

Kaynak: karar 3 (:165), §3.D.2 (:757-761), §3.D.3 (:763-786), §3.D.4 (:793-817), §3.D.5 (:819-839).

**Yer ve saat.** Ana sayfanın tek kart yuvasında, bugünkü akşam kartının yerinde (`Home.jsx:348-358`); akşam "Günün"
sayfasında da. «Kart 18.00'de açılır, 03.59'da düşer; kaçan gün boş kalır, tahmin yazılmaz, ceza yoktur» (:782-783).

**Akış (§3.D.3 :775-780, birebir)**

| Saniye | Ekranda | Kişi |
|---|---|---|
| 0–2 | "Akşam · 1 dokunuş". Üstte ölçülenler: "7.412 adım · Nefona'da 11 dk · yol 5/6". Başlık "Günün nasıl geçti?" | okur |
| 2–4 | Beş yüz (karar 3), dokunma alanı ≥ 44 pt | bir yüze dokunur; kayıt yazılır, hafif titreşim |
| 4–8 | Kart yerinde dönüşür: seçilen yüz ve varsa günün kanıt kartı | okur ya da geçer |
| 8–10 | 7. günden sonra isteğe bağlı etiketler: "İş yoğundu", "Hareketliydim", "Dışarıdaydım", "İnsanlarla", "Gözlerim yoruldu", "Ekran çoktu"; "Tamam" | dokunur ya da kapatır |

**Birebir metinler**
- Üst başlık: "Akşam · 1 dokunuş"; başlık: "Günün nasıl geçti?" (:777).
- Ölçülenler satırı: "7.412 adım · Nefona'da 11 dk · yol 5/6" (:777). Uzun biçimi (Günün sayfasında): "Nefona'da bugün 11 dk
  göz çalışması, 2 mola" (§3.D.2 :759). «hiçbir zaman "ekran süren" denmez» (:760).
- Beş yüzün etiketleri: "Çok kötü · Kötü · İdare eder · İyi · Çok iyi" (karar 3 :165).
- Tek dokunuş kaydeder; 3 saniye "Geri al" görünür; "Sonra" 2 saat erteler (:782; §2.1 :219).
- Etiketler: "İş yoğundu", "Hareketliydim", "Dışarıdaydım", "İnsanlarla", "Gözlerim yoruldu", "Ekran çoktu"; düğme
  "Tamam" (:780); 7. günden sonra, isteğe bağlı, en çok 3 (§2.2 :253).

**PLANDA YOK → VARSAYIM**
- Sağlık izni yoksa ölçülenler satırında adım kısmı yazılmaz: "Nefona'da 11 dk · yol 5/6".
- Etiketlerin sorusu: "Günü en çok ne etkiledi?" (NOTTA `gunun.md` §0 madde 4).
- Akşam kartından "Günün" sayfasına bağlantı (plan :979-980 bağlantıyı ister, metnini vermez): "Günün ayrıntıları ›".
- Yüzlerin altına isteğe bağlı güven satırı: "Cevabın yalnız bu telefonda kalır." (doğru: §1 :134; yedek gereği Nef'e
  gitmez).
- Yüzlerin çizimi: sistem emojisi değil (karar 3); 24 × 24 çizgi yüz, `stroke-width 2`, yuvarlak uç, tek renk
  (`currentColor`); yüzlerin kendisi kırmızı–yeşil gibi yargı rengi taşımaz; seçili yüz `.br-calm5 button[aria-pressed='true']`
  gibi `--accent-graphic` zemin ve `--accent-ink` çizgi.
- 320 pt hesabı: ekran 320 − 2 × 20 = 280 px, kart iç boşluğu 2 × 18 → 244 px. Beş sütun 8 px aralıkla 42,4 px olur ve 44 pt
  altına düşer. Aralık 4 px (45,6 px) ya da kart iç boşluğu 14 px olmalıdır. "İdare eder" etiketi bu genişlikte iki
  satıra iner.

**Günün kanıt kartı** (§3.D.4). «Canlı PubMed araması yapılmaz»; kart kütüphanesi; günde en çok bir kart; aynı kart 7 gün
içinde yinelenmez; tetik yoksa kart çıkmaz; kart bilgidir, öneri ya da yargı değildir (:795-798). Öncelik: dolunay, gece
ekranı, yol kartları (:815). Yolu her gün yapan kişi 30 akşamın 14–15'inde kart görür (:812-814). Kartta «kanıtın türü,
kişi sayısı ve sınırı yazar» ve kart PMID ile DOI taşır (§3.H :1222-1223).

| Kart · tetik | Metin (birebir, :803-808, :921-922) | Kaynak satırı (Kaynaklar tablosu :1311-1367) |
|---|---|---|
| `dolunay` · dolunaydan önceki ve sonraki 2 gece | "Ayın uykuya etkisi tartışmalı. Bazı çalışmalar dolunaya yakın gecelerde uykunun biraz kısaldığını buldu; binden fazla kişiyle yapılan bazı büyük çalışmalar ise fark bulmadı ya da yalnız birkaç dakikalık fark buldu." | Cajochen 2013 · PMID 23891110 · doi 10.1016/j.cub.2013.06.029; Haba-Rubio 2015 · 26498230 · 10.1016/j.sleep.2015.08.002; Chaput 2016 · 27047907 · 10.3389/fped.2016.00024; Smith 2017 · 27928860 · 10.1111/jsr.12472; Casiraghi 2021 · 33571126 · 10.1126/sciadv.abe0465 |
| `gece-ekran` · etiket "Ekran çoktu" ve saat ≥ 22 | "Çocuk ve ergenlerle yapılan 67 çalışmanın %90'ında fazla ekran süresi, daha kısa ve daha geç başlayan uykuyla birlikte görüldü. Bu birliktelik neden-sonuç ilişkisi göstermez." | Hale ve Guan 2015 · Sleep Med Rev · PMID 25193149 · doi 10.1016/j.smrv.2014.07.007 |
| `nefes-gunu` · o gün yolda nefes yapıldı | "Bir ay süren bir çalışmada, her gün 5 dakika uzun verişli nefes yapan grupta ruh hâlindeki olumlu değişim, farkındalık meditasyonu yapan gruptakinden büyüktü. Tek bir çalışmanın bulgusudur; sende aynı sonucu vereceği söylenemez." | Balban 2023 · Cell Rep Med · PMID 36630953 · doi 10.1016/j.xcrm.2022.100895 |
| `kirpma-gunu` · o gün yolda göz kırpma yapıldı | "Kuru göz yakınması olan kişilerle yapılan bir çalışmada, kırpma egzersizini bırakanlarda ölçümlerin çoğu iki hafta sonra başlangıca döndü. Yolunda bu adımın her gün olmasının nedeni budur." | Wolffsohn 2025 · Cont Lens Anterior Eye · PMID 40467388 · doi 10.1016/j.clae.2025.102453 |
| `uzaga-bakis` · o gün yolda uzağa bakış yapıldı | "Göz yakınması olan 29 bilgisayar kullanıcısıyla yapılan bir çalışmada, iki hafta boyunca uzağa bakma molası hatırlatması alanların yakınmaları azaldı; hatırlatma bırakılınca bu fark bir hafta sonra sürmedi." | Talens-Estarelles 2022 · Cont Lens Anterior Eye · PMID 35963776 · doi 10.1016/j.clae.2022.101744 |
| `yagmurlu-gun` (Y5) · hava şeridinde yağış | "Havanın ruh hâline etkisi ortalamada küçük; kişiden kişiye değişiyor." | Denissen 2008 · Emotion · PMID 18837616 · doi 10.1037/a0013497; Klimstra 2011 · 21842988 · 10.1037/a0024649 |

`kisa-gece` (e) aşamasına aittir; `az-hareket` ve `goz-yorgun` kartlarının metni ve doğrulanmış kaynağı yoktur, çizilmez
(:809-810, :816-817).

- Kaynak satırının ve tür satırının biçimi PLANDA YOK. **VARSAYIM:** kartın altında mono satır, `.src-cite .meta` gibi:
  tür satırı (ör. `nefes-gunu`: "Uzaktan randomize çalışma · günde 5 dk, 1 ay · aktif kontrol grubu"; `kirpma-gunu`:
  "Randomize kontrollü çalışma · 98 + 28 kişi · kuru göz yakınması olanlar"; `uzaga-bakis`: "29 kişi · kontrol grubu yok ·
  2 hafta"; `gece-ekran`: "Derleme · 67 çalışma · çocuk ve ergen"), altında "Balban 2023 · Cell Rep Med · PMID 36630953 ·
  doi 10.1016/j.xcrm.2022.100895" (doi bağlantı). Balban 2023'ün kişi sayısı planda yok; uygulamadaki mevcut metin n=108
  diyor (`lib/breath.js:71`), kanıt kapısında PubMed'den doğrulanmadan yazılmaz.
- **ÇELİŞKİ:** §3.H «sınır cümlesi zorunludur» (:1218-1219) diyor; `kirpma-gunu` ve `uzaga-bakis` metinlerinde sınır cümlesi
  yok. **VARSAYIM** eklemeler: `kirpma-gunu` sonuna "Çalışma kuru göz yakınması olanlarla yapıldı; sende aynı sonucu
  vereceği söylenemez."; `uzaga-bakis` sonuna "Çalışmada karşılaştırma grubu yoktu."
- Örnek akşam için tarih seçimi: 29 Eylül dolunay penceresinde değildir (dolunay 26 Eylül; pencere 24–28 Eylül), o akşam
  `nefes-gunu` çıkar. Dolunay kartını göstermek için 26 Ekim Pazartesi (benzetimin 26. günü, dolunay) seçilebilir.

### d) "Günün" sayfası ve "Hava ve ay" kartı (ay Y4, hava Y5)

Kaynak: §3.D.3 (:788-791), §3.E.2 (:862-890), §3.E.3 (:892-902), §3.E.5 (:911-925), §3.E.7 (:964-989).

**"Günün" sayfası.** Tarih satırına dokununca açılır; akşam kartından ve hava teklifinden de açılır (:788-789). Başlık:
gündüz "Günün nasıl geçiyor?", akşam "Günün nasıl geçti?" (:789-790). Sıra: üstte "Hava ve ay" kartı, altında "Bugün
ölçülenler" (adım, Nefona içi göz çalışması ve mola, yol ilerlemesi; (e)'den sonra dün gece uyku), akşam ise (c)'deki
kart (:790-791).
- Üst başlık PLANDA YOK. **VARSAYIM:** tarih, Ana sayfadaki biçimde ("29 Eylül Salı").
- "Bugün ölçülenler" satırları PLANDA YOK. **VARSAYIM** (`.list-row` ya da `.gm-src` dilinde, solda ad, sağda değer):
  "Adım · 7.412" (yalnız Sağlık izni ve verisi varsa), "Nefona'da göz çalışması · 11 dk, 2 mola", "Bugünün yolu · 5/6
  durak". Uyku satırı çizilmez ((e) aşaması).

**"Hava ve ay" kartı · yedek hâli (şehir seçilmiş, konum izni yok).** Plandaki sıra (:970-973), birebir:
«başlık "HAVA VE AY · İstanbul (yaklaşık)" ve sıcaklık; "Öğleden sonra yağmur bekleniyor"; saat saat yağış olasılığı şeridi
(tek renk tonu); en yüksek ve en düşük sıcaklık; ay evresi ve aydınlanma; son ve sonraki dolunay ve yeniay; "Bilim ne
diyor?"; her zaman görünen atıf satırı (Apple Weather markası temaya göre, "Veri kaynakları" bağlantısı) ve verinin yaşı
("12.40'ta alındı").»

Örnek değerlerle (29 Eylül 2026; ay değerleri plandan :897-898 ve USNO tablosundan `arastirma-v1/usno2026.json`):

| Sıra | Metin | Durum |
|---|---|---|
| 1 | "HAVA VE AY · İstanbul" + sağda "18°" | Plan "(yaklaşık)" der; bu, konumdan gelen il içindir. Şehir seçilince "(yaklaşık)" yazmaz (NOTTA `hava-ay.md` §8.3). Başlık mono büyük harf üst başlık dilinde (`.src-ey`) |
| 2 | "Öğleden sonra yağmur bekleniyor" | plan |
| 3 | saat saat yağış olasılığı şeridi, 0–100, tek renk tonu (`--accent-graphic`); saat etiketleri "09 · 12 · 14 · 17 · 20"; sayı dokununca görünür | saat etiketleri NOTTA `hava-ay.md` §8.2 |
| 4 | "En yüksek 21° · en düşük 14°" | NOTTA `hava-ay.md` §8.2; plan yalnız içeriği verir |
| 5 | bağlam satırı: yağmurda "Yağmur varsa yürüyüşünü içeride de yapabilirsin."; açık gündüzde "Gökyüzü açık; Gökyüzü molası için güzel bir gün." | plan :974-975; kartın hangi sırasında durduğu PLANDA YOK → **VARSAYIM** hava bölümünün sonunda. Yürüyüş satırı yürüyüş hatırlatması açıkken gelir (NOTTA `hava-ay.md` §8.2) |
| 6 | ay simgesi + "Küçülen şişkin ay · %91 aydınlık" | içerik plan; satır biçimi **VARSAYIM** |
| 7 | "Son dolunay: 26 Eylül · Sonraki yeniay: 10 Ekim" | plan "son ve sonraki dolunay ve yeniay" der, satırı vermez. **VARSAYIM:** en yakın geçmiş ve en yakın gelecek evre; iki nokta üst üste biçimi tarihe ek getirmeyi önler |
| 8 | "Bilim ne diyor? ›" → açılınca §3.E.5 metni ve kaynak satırı "Cajochen 2013, Haba-Rubio 2015, Chaput 2016, Smith 2017, Casiraghi 2021" (her birine dokununca PMID ve DOI; değerler (c)'deki `dolunay` satırında) | plan :921-924; "Tavsiye yoktur." Açılır biçim **VARSAYIM**: bugünkü `details` dili (`styles.css:329-330`, `:361-363`) |
| 9 | atıf satırı: [Apple Weather işareti] · "Veri kaynakları" · "12.40'ta alındı" | plan. İşaret Apple'ın verdiği görseldir (açık ve koyu sürümü ayrı; `WeatherAttribution` `combinedMarkLightURL` / `combinedMarkDarkURL`); tasarımda yeniden çizilmez, yer tutucu kutu konur. "Veri kaynakları" Apple'ın yasal sayfasını açar (`legalPageURL`). Görevdeki "Data sources" bu bağlantının App Review metnindeki İngilizcesidir (`S0/app-review-sorusu.md:17`); ekranda "Veri kaynakları" yazar |

"Bilim ne diyor?" metni (§3.E.5 :921-922, birebir): "Ayın uykuya etkisi tartışmalı. Bazı çalışmalar dolunaya yakın gecelerde
uykunun biraz kısaldığını buldu; binden fazla kişiyle yapılan bazı büyük çalışmalar ise fark bulmadı ya da yalnız birkaç
dakikalık fark buldu."

**Kartın durumları** (plan :981-984; yedeğe göre uyarlandı)

| Durum | Plan | Yedekte çizilecek |
|---|---|---|
| Hiç sorulmadı | «ay tam; "Bulunduğun yerin havasını göstereyim mi?" [Konumumu kullan] [Şehir seç]» | ay tam; **VARSAYIM** "Şehrinin havasını göstereyim mi?" [İstanbul için göster]* [Şehir seç]. (*) yalnız Profil'deki şehir 81 ilden biriyse (§3.E.2 :883). "Bulunduğun yer" yedekte doğru değildir: giden kişinin yeri değil, seçtiği ilin merkezidir |
| İzin reddedildi | «şehir seç» | yedekte konum izni sorulmadığı için bu hâl yoktur |
| Çevrimdışı, önbellek < 12 sa | «son veri ve yaşı» | NOTTA `hava-ay.md` §8.3: "3 saat önce alındı · şu an çevrimdışısın" |
| Önbellek yok | "Hava için internet gerekiyor." | aynen; ay tam |
| WeatherKit hatası | "Hava bilgisi şu an alınamadı." (15 dk sonra yeniden) | aynen; ay tam |
| iOS 15 ve web | «hava yok, ay tam» | aynen |
| İlk yağmurlu gün | (f)'deki tek soru | (f) |

Y4 ile Y5 arasında (ay var, hava henüz yok) kartın başlığı PLANDA YOK; **VARSAYIM** "AY".

### e) 7. günden sonra tek seferlik hava teklifi · yedeğe göre (Y5)

Kaynak: §3.E.7 "Görünür giriş" (:976-980), §3.E.2 (:862-890), hukukçu yedeği (:188-193).

- Plan metni (tam hâli, **yedekte çizilmez**): «"Bulunduğun yerin havasını da göstereyim mi?" [Konumumu kullan] [Şehir seç]
  [Hayır]». Kurallar (yedekte de geçerli): 7. günden sonra; günün ilk dokunuşundan sonra (5 saniye kuralı); Ana sayfada ay
  şeridinin altında; bir kez; tek satırlık; «"Hayır" ya da kapatma kalıcıdır; teklif bir daha çıkmaz, kart "Günün"
  sayfasında yine durur».
- Yedek hâli PLANDA YOK. **VARSAYIM:**
  - Metin: "Şehrinin havasını da göstereyim mi?" (35 karakter).
  - Düğmeler: Profil'deki şehir 81 ilden biriyse [İstanbul için göster] [Başka şehir] [Hayır]; değilse [Şehir seç] [Hayır]
    ("için" ekli yazım, değişken il adına ek getirme sorununu önler; NOTTA `hava-ay.md` §4.3 "İstanbul için göster").
  - Görünüş: `.hh-focus` şeridi (`home.css:212-220`); 390 pt'de metin solda, düğmeler aynı satırda sığmayabilir; 320 pt'de
    metin üstte, düğmeler altta. Kapatma (×) "Hayır" ile aynı sayılır.
  - Akış: seçim → il listesi (81 il; bugünkü `components/CityField.jsx` ve `lib/cities.js`) → hava rızası (aşağıda) →
    "Günün" sayfası, kart dolu.
- **Hava rızası `weather` v1.** Plan yalnız dört satırın içeriğini verir (:886-890): «Ne (yaklaşık konum ya da seçilen şehrin
  merkezi), Neden (hava, yağmur olasılığı, istenirse yağmur bildirimi), Nerede (Apple'ın hava servisi, yurt dışı;
  sunucumuza ve Nef'e gitmez), Ne kadar (telefonda yalnız en yakın il adı, hava önbelleği ve 90 günlük günlük hava özeti;
  il adı ve önbellek izin kapandıktan sonraki ilk açılışta silinir)»; kutu işaretsiz gelir (§1 :126). Metin PLANDA YOK.
  **VARSAYIM** (yedek: konum yok; `ConsentSheet` biçiminde):
  - Başlık: "Seçtiğin ilin havasını gösterelim mi?"
  - Giriş: "Hava bilgisini Apple'ın hava servisinden alırız. İzin vermesen de ay bilgisi görünür; hiçbir şey kapanmaz."
  - Ne: "Seçtiğin ilin merkezinin koordinatı. Senin konumun alınmaz."
  - Neden: "Hava durumunu, yağmur olasılığını ve istersen sabah yağmur haberini göstermek."
  - Nerede: "Apple'ın hava servisi (yurt dışı). Sunucumuza ve Nef'e gitmez."
  - Ne kadar: "Telefonda yalnız seçtiğin il, son hava bilgisi ve 90 günlük kısa hava özeti kalır. İznini geri çekersen il ve
    hava bilgisi silinir."
  - Onay kutusu: "Seçtiğim ilin merkez koordinatının, hava bilgisini göstermek için yurt dışındaki Apple hava servisine
    gönderilmesine açık rıza veriyorum."
  - Düğmeler (bugünkü): "İzin ver" / "Şimdi değil"; alt satır bugünkü gibi.

### f) Yağmur bildirimi ve ilk yağmurlu günde tek soru (Y5)

Kaynak: §3.E.6 (:927-962), §2.2 A8 ve A9 (:267-268), App Review yedeği (:194-196).

**Kilit ekranı** (iOS'un standart bildirim görünümü; biçimi Apple'ındır, yalnız metin bizim):
- Uygulama simgesi, "Nefona", saat (örnek 07.30).
- Başlık: "Bugün yağmur bekleniyor" (:956).
- Gövde, sabah kurulmuşsa: "14.00–17.00 arası yağmur olasılığı %70." ; akşam kurulmuşsa: "Dün akşamki tahmine göre
  14.00–17.00 arası yağmur olasılığı %70." (:956-957).
- Ayrı satır: "Kaynak: Apple Weather" (:957; :196).
- Dokununca "Hava ve ay" kartı açılır (:958).
- Kurallar: günde en çok bir; saat, alarm o gün çalacaksa alarm + 15 dk, değilse 07.30, 06.30–09.00 sınırı (A8); eşik
  07.00–22.00 arasında herhangi bir saatte olasılık ≥ %50 ve toplam ≥ 0,5 mm (A9); düzeyi `active`. Türkiye'de dakikalık
  yağış verisi olmadığı için "Yağmur başlamak üzere" bildirimi yoktur (§1 :73).
- NOTTA `hava-ay.md`'deki "Şemsiyeni unutma." cümlesi plana girmedi; yazılmaz.

**İlk yağmurlu günde tek soru** (Hava ve ay kartında, kartı açık kişiye bir kez): "Yağmur beklenen sabahlar sana haber
vereyim mi?" (:932-933). Tercih ayrı ve varsayılanı kapalıdır.
- Düğmeler PLANDA YOK. **VARSAYIM:** [Evet] [Hayır] (bir kez sorulduğu için "Şimdi değil" değil "Hayır"). Bildirim izni
  yoksa "Evet" iOS iznini ister (bugünkü hatırlatma kartının kalıbı, `Home.jsx` `ReminderAsk`).
- Tercih satırının adı "Yağmur haberi" (:932); bildirimlerin ana anahtarı kapalıyken satırda "Bildirimler kapalı" yazar
  (:954-955). Satırın yeri PLANDA YOK; **VARSAYIM** Bilgi → Hatırlatmalar.
- Alarm kartlarındaki hava satırları (plan :959-960: "Uyanınca" kartında bir satır hava; akşam alarm kartında "Yarın sabah
  yağmur bekleniyor") App Review yedeğiyle çelişir (hava yalnız tam atıflı kartta). **VARSAYIM:** yedek sürerken çizilmez.

### g) Gelişim "Yolun" bölümü ve ölçü kuralı v2 metinleri (Y2)

Kaynak: §3.B.4 (:600-609), §3.B.5 (:611-639), §3.B.6 (:641-668), karar 2 (:151-164).

**Yer ve başlık.** «Bölüm Gelişim'de iris haritasının ve alan satırlarının altında durur; başlığı "Yolun · 34. gün"dür.
Her satırda modül adı, basamak ("N4 · 3 dk"), 28 günlük şerit ve varsa durum hapı bulunur.» (:661-662). Etki ölçüsü olmayan
modülün ayrıntısında bir kez: "Bu modülde düzenini izliyoruz: kaç gün yaptığını ve hangi basamakta olduğunu." (:662-663).
Her modül kartı dört katmanı taşır: Düzen (son 28 günde yapılan gün), Basamak (yoldaki yeri), Ölçü (başlangıç → şimdi),
Değişim (yalnız kural doğrularsa) (:643-644).
- **VARSAYIM** yer: `GrowthMap`'in alan satırlarından sonra, dışa aktarma kartından önce (`ProgressOverview.jsx:189-191`).
- "34. gün" hangi sayı, PLANDA YOK. İris haritasının ortasında zaten "N GÜN" yazar (`ProgressOverview.jsx:266`, başlangıçtan
  beri takvim günü). **VARSAYIM:** aynı sayı; tek ekranda iki ayrı gün sayısı olmasın.
- **ÇELİŞKİ:** "N4" planın nefes merdiveninde yok (N1–N3, sonra Ç-B, Ç-C, Ç-D; :383-388); 34. günde yeni kullanıcının nefesi
  Ç-C'dedir. Nef şablonu sıra sayısı kullanır ("Nefes 4. basamakta", :702). **VARSAYIM:** ekranda sıra sayısı: "4. basamak ·
  3 dk"; iç kodlar (K7, Ç-C) gösterilmez.

**34. gün örnek satırları** (**VARSAYIM**; plan merdivenlerinden hesap, benzetimdeki kullanıcı; şerit `.gm-bar` 84 × 6 px,
28 hücre)

| Modül | Basamak satırı | 28 gün | Hap |
|---|---|---|---|
| Göz egzersizleri | "9. basamak · 5 dk" (K7 + V1 + V2: 5 grup, kırpma 10 tekrar, bakışlar 8 sn) | 28/28 | yok (düzen izlenir) |
| Nefes | "5. basamak · 3 dk" (Ç-C, kısa tutmalı ritimler) | 28/28 | etki hapı (bkz. madde 16, Bölüm 3) |
| Haftalık E testi | "haftada bir" | 4 gün | "doğrulanmış değişim yok" (göz metni değişmez) |
| Okuma | "haftada bir" | 4 gün | göz metni |
| Çemberler | "seviye 6" (NOTTA `gelisim-nef.md` §5) | 28/28 | yok (bilerek ölçü değil) |
| Yılan | "rekor 38" | ≈ 7 gün (çoğu gün yoldan ilk düşen durak) | yok (bilerek ölçü değil) |
| Bugünün görevi | "katman 2" (NOTTA) | 28/28 | yok (tavanlı ölçek) |
| Fark Ettin mi? | "seviye 3" | ≈ 10 gün | v2 hapı |
| Tek Bakışta | — | ≈ 9 gün | v2 hapı ("başlangıç oluşuyor" olabilir) |
| Yoga | onaylı yoga planının basamağı | 24/28 (E testi günlerinde yoga yok) | yoga planı §D.5 |

**Ölçü kuralı v2 metinleri** (§3.B.5 :616-622, birebir)

| Metrik türü | Bugün | Y2 |
|---|---|---|
| Görev ve oyun (isabet, eşik, harf, tepki) | "iyileşiyor" / "geriliyor" | "başlangıcından iyi" / "başlangıcının gerisinde" |
| Kendi beyanı (sakinlik, günün puanı, uyku sabah puanı) | aynı | "puanın başlangıcından yüksek" / "puanın başlangıcından düşük" |
| Göz (E testi, okuma) | "iyileşiyor" | değişmez |
| Değişim yok | "doğal oynama" | "doğrulanmış bir değişim yok" |
| Başlangıç kurulmadı | "henüz belirsiz" | "başlangıç oluşuyor" |

- Alan satırında iki yön birden varsa yay boş kalır ve satırda "karışık" yazar (§3.B.4 :605). Göz uyarısı ve WHO-5 düşüşü her
  zaman önce gelir (:602-604).
- Görev kartlarının altına tek satır: "İlk haftalarda sonuçların alıştıkça iyileşmesi olağandır; bu, göreve alıştığını
  gösterir." (:624-625)
- "Yöntem" metni (:626-629): "Yayımlanmış bir 'anlamlı değişim' eşiği varsa o kullanılır. Yoksa aynı günün ölçümleri tek değer
  sayılır ve ilk günlerin ortancası başlangıç olur. Son üç ölçüm gününün ortancası başlangıçtan belirgin biçimde ayrılır ve
  bu, iki haftalık bakışta art arda sürerse değişim denir. Tek güne değil, süren farka bakılır."
- Sürüm notu (:629-630): "Gelişim artık her sonucu ilk günlerindeki başlangıcınla karşılaştırıyor ve bir farkı ancak iki
  hafta art arda sürerse değişim sayıyor."
- Hap renkleri bugünkü `.p2-pill` tonlarıyla: "başlangıcından iyi" `ok`, "başlangıcının gerisinde" `warn`, öteki üçü
  `muted` (**VARSAYIM**; bugün aynı eşleme `ProgressOverview.jsx:36-48`).
- PLANDA YOK → VARSAYIM:
  - Fark Ettin mi?'de seviye değişince (:653 «kart bunu yazar»): "Seviye değişti; başlangıç yeniden kuruluyor."
  - Önce → sonra kartındaki ortalamaya dönüş notu (:625 ister, metnini vermez): "Gergin başladığın seanslarda sonraki puan
    kendiliğinden ortaya yaklaşabilir; bu yüzden tek seansa değil, son 28 güne bakılır."

### h) Nef haftalık (Pazartesi) ve aylık (29. gün) değerlendirme kartı ve olay satırı (Y6)

Kaynak: §3.C.1-§3.C.4 (:672-716), §1 (:69), §2.1 satır 2 (:207). Kart iskeleti için NOTTA: `YOL.nef.md` §5.1, §5.4, §12.

**Ne zaman, nerede** (§3.C.2 :679-685, birebir)

| Dönem | Tetik | Nerede | Kim üretir |
|---|---|---|---|
| Günün cümlesi | günün ilk açılışı | Ana sayfanın üstündeki Nef satırı | telefonda kural şablonu; ağ ve rıza gerekmez |
| Olay | yeni basamak, ilk doğrulanmış değişim, 28. gün, uzun aradan dönüş; günde en çok bir | aynı satır (günün cümlesinin yerine geçer) | kural şablonu |
| Günlük | her açılış, günde bir istek | Ana sayfadaki "Bugün · Nef" kartı (bugünkü gibi) | model (rızayla) ya da kural yedeği |
| Haftalık | Pazartesi, geçen takvim haftasında ≥ 4 gün veri | Ana sayfa (Pazartesi–Çarşamba) ve Gelişim başı | model ya da kural yedeği |
| Aylık | 29., 57., 85. gün… | Gelişim ve 3 gün Ana sayfa | model ya da kural yedeği |

Model yolu 30 soruluk sınavdan sonra açılır; o zamana kadar kural yedeği konuşur (:687-688). Bugünkü kartta kural yedeği
"çevrimdışı öneri" etiketiyle görünür (`CoachCard.jsx:86`).

**Olay satırı.** Ayrı bir kart değildir: Ana sayfanın üstündeki Nef satırında günün cümlesinin yerine yazılır; Nef kartı aynı
gün olayı yinelemez (§2.1 :207). Örnekleri §3.F.4'ün 2, 3, 5 ve 6. öncelik cümleleridir ((a)'daki tablo). Görsel ayrımı
PLANDA YOK; **VARSAYIM** yok (aynı satır, aynı biçim).

**Cümle şablonları** (§3.C.4 :701-713, birebir)

| Durum | Cümle |
|---|---|
| Düzen, hedef tuttu | "Geçen hafta 5 gün çalıştın; hedefin 3 gündü." |
| Basamak | "Nefes 4. basamakta: bugün 3 dakika sürecek." |
| Sıradaki | "Bu hafta göz egzersizlerine yakın–uzak ekleniyor." |
| Değişim yok | "Hızlı Bakış'ta doğrulanmış bir değişim yok." |
| Görevde "better" | "Tek Bakışta oyununda sonucun iki haftadır başlangıcından iyi." |
| Görevde "worse" | "Fark Ettin mi?'de sonucun iki haftadır başlangıcının gerisinde." (ışık ve saat notu kartın ayrıntısındadır) |
| Alan karışık | "Dikkat alanında sonuçlar farklı yönlerde; doğrulanmış bir değişim yok." |
| Etki anlamlı | "Son 28 günde nefesin sonunda sakinlik puanın başındakinden yüksek." |
| Ölçüsüz modül | "Göz egzersizlerini 28 günün 22'sinde yaptın." |
| Okuma "better" | "Son iki okuma testinde daha küçük yazıyı rahat okudun." |
| Görmede uyarı yok | "Görmende doğrulanmış bir değişim yok." |
| Görmede sarı/kırmızı | Nef yazmaz; sabit uyarı cümlesi kartın başındadır |
| 3–13 gün ara | "Beş gün ara verdin; basamağın aynı, kaldığın yerden devam ediyorsun." |

Söylemez (:692-695): sayı uydurmaz; iki sayıdan yön çıkarmaz; başkasıyla karşılaştırmaz; tanı, risk, "normal" demez; "seri
bozuldu", "kaçırdın" demez; doktor cümlesini yazmaz, yumuşatmaz; görev sonucunu görme, dikkat ya da sağlıkla
ilişkilendirmez; ölçüsü olmayan modül için "işe yarıyor" demez.

**Kart iskeleti** (PLANDA YOK; NOTTA `YOL.nef.md` §5.1 ve §5.4): haftalık kart 3 satır (düzen · alan · sıradaki) + 1 eylem;
aylık kart 4 satır (düzen · doğrulanmış değişimler · görme · sıradaki 28 gün) + 1 eylem; Ana sayfadaki Nef kartında ikinci
satır "Haftalık değerlendirmen hazır →"; Gelişim'in başında "Nef'in değerlendirmesi" kartı; Gelişim kartının hâlleri: hafta
yok (ilk 4 gün), 1 hafta, 4 hafta sekmeli, ay yok (ilk 28 gün), 1. ay (karşılaştırma yok), 2. ay (İlk/Son 28 gün),
doğrulanmış değişim var/yok, sabit belirti satırı altta (`YOL.nef.md` §12).

**Örnek haftalık kart** · 5 Ekim Pazartesi (benzetimin 5. günü; geçen takvim haftasında 1–4 Ekim = 4 gün, eşik tutuyor).
Aynı gün 5. gün raporu da kendiliğinden açılır (istisna); ikisi birlikte çizilmelidir.
1. "Geçen hafta 4 gün çalıştın; hedefin 3 gündü." (şablon, :701)
2. **VARSAYIM:** "En düzenli alanın Göz; doğrulanmış bir değişim yok."
3. "Bu hafta göz egzersizlerine yakın–uzak ekleniyor." (şablon birebir, :703; plan merdiveninde Yakın–uzak 7. gün gelir)

**Örnek aylık kart** · 29 Ekim Perşembe (29. gün). Ana sayfada 29–31. günlerde bir satır; metni PLANDA YOK, **VARSAYIM**
"Aylık değerlendirmen hazır →".
1. **VARSAYIM:** "Son 28 günde Göz alanında 28, Sakinlik alanında 27, Dikkat alanında 25 gün kaydın var." (en çok üç alan)
2. **VARSAYIM:** "Doğrulanmış bir değişim yok."
3. "Görmende doğrulanmış bir değişim yok." (şablon birebir, :711; görmede başlangıç 22. günde kuruldu)
4. **VARSAYIM:** "Önümüzdeki 28 günde nefese beklemeli ritimler, göz egzersizlerine daha uzun setler ekleniyor." (43. günde
   Ç-D ve V3; :388, :435)
Eylem (NOTTA `YOL.nef.md` §5.4): 28. gün iris haritası yapılmadıysa "İris haritası".

- Telefonda üretilen kural cümleleri rızasız da görünür (§1 :184-185). Rızasız kişide haftalık ve aylık kural kartının
  yeri PLANDA YOK; NOTTA `YOL.nef.md` §8.3: rıza yokken şablon kart "yalnız bu telefonda" etiketiyle.

### i) Nef rızası v2 ekranı (bir kez gösterilen) (Y6)

Kaynak: karar 6 (:177-180), §1 Gizlilik (:129-133), §3.C.5 (:718-735), hukukçu yedeği (:188-193), §3.G.3 Y6 (:1151).

- **Kime, ne zaman:** daha önce Nef rızası (coach v1) vermiş kişiye yeni metin bir kez gösterilir ve onayı yeniden alınır
  (:131; karar 6). Günün ilk dokunuşundan ya da ilk duraktan sonra açılır (§2.2 K4 :270).
- **Biçim:** bugünkü rıza sayfası `ConsentSheet` (kalkan, başlık, giriş, dört satır, işaretsiz kutu, "İzin ver" / "Şimdi
  değil"); en yakın örnek bugünkü `healthUpdate` (`lib/consent.js:49-54`: "Hareket izninin metni güncellendi").
- **"Şimdi değil" diyen kişi** (:730-735): eski izin geri çekilmez; ona yalnız v1 metninin izin verdiği alanlardan v2'de
  kalanlar gider; v2'de çıkan alanlar (görme sayıları, okuma hızı, `screenHours`) yine gitmez; yeni alanlar (`moodStatus`,
  `n7`, `stage`, `pathDay`, `gapDays`, `later7`, `readingStatus`) yalnız v2 rızasıyla gider. Yedek gereği `n7` ve
  `moodStatus` v2'de de gitmez.
- **Metin PLANDA YOK** (plan yalnız kapsamı verir). NOTTA `YOL.nef.md` §7.4'teki taslak kullanılamaz: "Ne" satırında görme
  ölçümü ortancası, başlangıçtan farkı ve okuma hızı var; karar 6 bunları çıkarıyor.

**VARSAYIM metin (coach v2, v1'e izin vermiş kişiye; yedek hâli)**
- Başlık: "Nef'in izin metni güncellendi"
- Giriş: "Haftalık ve aylık değerlendirme eklendi; Nef'e giden özet de değişti: görme ölçümünün sayıları ve okuma hızı artık
  gitmiyor. Bu yüzden yeniden soruyoruz. 'Şimdi değil' dersen günlük öneri eski iznin kapsamında sürer; yeni özetler
  gitmez."
- Ne: "Son 7 günün, geçen haftanın ve son 28 günün özetleri: her alanda kaydın olan gün sayısı; çalışma dakikası ve seri;
  ölçüm sonuçlarının sayısı değil durumu ("doğrulanmış bir değişim yok" gibi); görmede yalnız aşama ve uyarı düzeyi; okuma
  testinin değişim yönü; oyun ve pratik özetleri (nefes öncesi ve sonrası sakinlik farkı dahil); yoldaki basamağın, kaç
  gündür yolda olduğun, ara verdiğin gün sayısı ve "Sonra yaparım" sayısı; günün saati. Kamera görüntüsü, görme ölçümünün
  sayıları, okuma hızı, günün nasıl geçtiği, konumun, şehrin, hava bilgisi, adın, e-postan, cihaz kimliğin ve Apple Sağlık
  verilerin gitmez"
- Neden: "Nef'in sana günlük bir öneri, haftalık ve aylık bir değerlendirme yazması (tıbbi tavsiye değildir)"
  (NOTTA `YOL.nef.md` §7.4)
- Nerede: bugünkü metin aynen: "Yurt dışında: sunucumuz (Vercel) ve OpenRouter üzerinden bir yapay zekâ modeli · şifreli
  bağlantı" (`lib/consent.js:66`)
- Ne kadar: bugünkü metin aynen: "Sunucumuz içeriği kaydetmez. Nef'i kapattığın an gönderim durur" (`:67`)
- Onay kutusu: "Bu özetlerin (görme ölçümünün durumu ve sakinlik farkı sağlığa ilişkin veridir) yukarıdaki amaçla yurt
  dışına aktarılmasına açık rıza veriyorum."
- Yeni kullanıcı için Nef tanıtım kartının satırı eskir ("Kendi verine bakıp her gün tek bir içgörü ve bir öneri yazar.",
  `CoachCard.jsx:69`). **VARSAYIM:** "Kendi verine bakıp her gün bir öneri, her hafta ve her ay bir değerlendirme yazar."

**coachLife v2** (plan: «coachLife rıza metnindeki "ekran süresi" satırı da kalkar», :724). **VARSAYIM** metin: giriş "İsteğe
bağlı. İzin vermesen de Nef çalışır; yalnızca öneriler uykunu hesaba katmaz."; Ne "Profil sorularına verdiğin cevapların
özeti: uyku puanı, gece telefona bakma sıklığı, stres puanı"; onay "Profil cevaplarımın özetinin (uyku puanı, gece telefona
bakma sıklığı, stres puanı; sağlığa ilişkin veri) de aynı amaçla yurt dışına aktarılmasına açık rıza veriyorum." Bu metnin
yeniden sorulup sorulmayacağı PLANDA YOK (sürüm artarsa bugünkü mantık izin vermiş kişiye yeniden sorar,
`lib/consent.js:102-105`).

### j) İlk kez açan kişi: logosuz açılış ekranı ve giriş ekranının yeni alt yazısı (Y3)

Kaynak: karar 5a ve 5c (:171-175), §3.F.1 (:1006-1007), §3.F.2 (:1013-1026).

- **Açılış ekranı:** logo kalkar, düz zemin kalır («Apple'ın önerisi», :175; "Don't advertise"). Renk PLANDA YOK.
  **VARSAYIM:** bugünkü zeminler: açık `#f3f6f8`, koyu `#070c12` (= `--bg`; günlük açılışta Ana sayfaya geçiş renk değiştirmez).
- **Dikkat (cihazda bakılacak):** ilk açılışta açılış ekranından giriş ekranına geçilir ve giriş ekranı her temada gecedir
  (`#02050a`). Açık temada açık zeminden koyu zemine geçiş bir parlama gibi görünebilir; plan cihaz listesinde "açılış
  ekranından geçişte parlama yok" denetimi var (§3.H :1240). Tasarım iki temada bu geçişi göstermelidir.
- **Giriş ekranı:** yalnız alt yazı değişir: "Fark etmeyi yeniden öğren." yerine **"20 saniyede sana fark etmediğin bir şeyi
  göstereceğiz."** (:172; §3.F.2 :1023). "Nefona" ve "Başla" aynı kalır (`IntroFilm.jsx:44-47`); iki "Başla" şimdilik
  birleşmez (:1024-1025).
- Alt yazı 26 karakterden 54 karaktere çıkar. `intro.css:16-17` notuna göre blok yukarı doğru büyür ve `text-wrap: balance`
  kullanır; 390 pt'de iki, 320 pt'de üç satır olabilir. İris çizimine değmemelidir; iki boyda denenir.
- Giriş ekranı yalnız ilk kez açanda görünür (`lib/intro.js:4` sürümü artmadıkça eski kullanıcı yeniden görmez). Sürümün
  artıp artmayacağı PLANDA YOK; **VARSAYIM** artmaz (plan "ilk kez açan kişi" diyor).
- Sonra gelen İlk Bakış tanıtımı değişmez ("20 saniye · Önce bir şey fark edelim", `lib/firstLookText.js:22-27`). Soru
  uygulamada sonuçtan önce sorulmaz (:1025-1026).
- Kamera izin metnine Y3'te yalnız İlk Bakış'taki kırpma sayımı eklenir (§1 :135-136); metin PLANDA YOK. Bugünkü metin:
  "Ön kamera, testlerde telefonun gözünden 40 cm uzakta olduğunu doğrulamak ve göz kırpma egzersizinde kapanmaları saymak için
  kullanılır. Görüntüler cihazdan çıkmaz ve kaydedilmez." (`ios/App/App/Info.plist:16`). **VARSAYIM:** "Ön kamera, İlk
  Bakış'ta ve göz kırpma egzersizinde göz kırpmalarını saymak, testlerde de telefonun gözünden 40 cm uzakta olduğunu
  doğrulamak için kullanılır. Görüntüler cihazdan çıkmaz ve kaydedilmez."

### k) Sitenin ilk ekranı · masaüstü ve telefon (Y3)

Kaynak: karar 5b (:173-174), §3.F.2 (:1028-1037).

- Başlık (h1): **"Bu cümleyi okurken kaç kez göz kırptın?"**
- Altında tek satır: **"Bilmiyorsan şaşırma. Nefona ilk açılışta göz kırpmalarını 20 saniyede sayar; kamera görüntün
  telefondan çıkmaz."**
- Yerinde kalır: iki düğme ("E hangi yöne bakıyor? Dene", "Bir günün nasıl geçer") ve E testi tadımlığı; sayfa başlığı
  (`<title>`: "Nefona · Gözün değişiyor. Sen de gör.") ve öteki bölümler değişmez.
- Sitede kamera açılmaz, ölçüm yapılmaz, sayı istenmez; sağlık ya da bilim iddiası yazılmaz. Sitede analiz kitaplığı yoktur,
  5 saniyenin etkisi ölçülemez.
- PLANDA YOK: bugünkü üst başlık ("iPhone için · yakında App Store'da"), soru satırı ("Telefonu biraz daha uzağa mı
  tutuyorsun? Akşamları harfler mi bulanıyor?"), tanıtım paragrafı ve üç kısa gerçek kalacak mı. **VARSAYIM:** üst başlık
  kalır; soru satırı ve tanıtım paragrafı kalkar (plan "tek satır" diyor); üç kısa gerçekten "Kamera görüntün telefondan
  çıkmaz" maddesi yeni satırla yinelendiği için sahibe sorulur.
- Masaüstü: bugünkü iki sütun (`.hero2 .wrap` `grid-template-columns: 1.1fr 0.9fr`), h1 `clamp(2.2rem, 5.6vw, 3.9rem)`;
  **VARSAYIM** kırılım "Bu cümleyi okurken<br>kaç kez göz kırptın?".
- Telefon: 900 px altında tek sütun, tadımlık aşağıda (`max-width: 360px`); ilk ekranda h1, tek satır ve iki düğme görünmeli.
- Tasarım notu: ilk ekranda iki soru yan yana durur (başlık ve "E hangi yöne bakıyor? Dene"); düğmeler plan gereği aynı
  kalır, dikkatin bölünüp bölünmediği çizimde görülür.

---

## Bölüm 3 · Planda çelişen ya da eksik yerler (sahibin bakması gerekenler)

1. **Tarih satırının biçimi:** plan "Salı, 29 Eylül" (:966), kod "29 Eylül Salı" (`Home.jsx:218`). Öneri: kodun biçimi.
2. **Ay simgesinin yeri:** "önünde" belirsiz (:966-967). Öneri: evre adının önünde.
3. **Dolunay günü:** şeritte evre adı "dolunay" mı (§3.E.3 :900-901), yoksa "Bu gece dolunay" mı (§3.F.5 :1091-1092)? Öneri:
   şeritte evre adı; "Bu gece dolunay" gerekiyorsa kartta.
4. **Sağ–sol grubunun adı:** "Sağ–sol" (§3.A.6 :438) ile "Sağ–sol bakış" (§3.F.3 :1050, §3.F.4 :1069). Öneri: "Sağ–sol bakış".
5. **7. günün cümlesi:** §1 "Bugün yeni: yakın–uzak." örneğini verir (:48); §3.F.5 7. günde "İlk haftan" satırını koyar
   (:1084); §3.F.4'ün tekrar kuralı (:1074) 6. gün "Bugün yeni: Fark Ettin mi?" kullanıldıysa 7. günde 6. önceliği yasaklar.
   NOTTA `bes-saniye.md` §5.1 "İlk haftan: 6 gün." yüklemsizdir. Öneri: "Bugün 7. gün: ilk haftanı tamamlıyorsun."; Yakın–uzak'ın
   yeniliği yoldaki "Yeni" rozetiyle söylenir.
6. **"Günün ritmi" ile "Bugünün ritmi":** katman adı ve kart metni farklı (:386, :404). Öneri: ekranda "Bugünün ritmi".
7. **Basamak adı "N4 · 3 dk"** (:662) plan merdiveninde yok; 34. günde nefes 5. basamaktadır. Öneri: sıra sayısı.
8. **Mola bandı ve Nef baloncuğu** 3. günden sonra yanlış süre söyler (`TodayPath.jsx:336`, `lib/today.js:431`); metin PLANDA
   YOK. Öneri (b)'de.
9. **Kanıt kartlarında sınır cümlesi:** §3.H zorunlu tutar (:1218-1219); `kirpma-gunu` ve `uzaga-bakis` metinlerinde yok.
   Öneri (c)'de. Ayrıca `kirpma-gunu`'nun "başlangıca döndü" cümlesi egzersizin ölçümleri değiştirdiğini dolaylı olarak
   söyler; metin kapısında (§3.H) sağlık iddiası açısından yeniden okunmalı.
10. **Alarm kartlarındaki hava satırları** (:959-960) App Review yedeğiyle çelişir. Öneri: yedek sürerken yok.
11. **"Bulunduğun yerin havasını…"** (teklif :978, kart :981) yedekte doğru değildir (giden il merkezidir). Öneri (e)'de.
12. **"(yaklaşık)"**: plan başlığı (:970) konumdan gelen ile göre yazılmış; şehir seçilince yazılmaz (NOTTA).
13. **Rıza v2 metni planda yok;** `YOL.nef.md` §7.4 taslağı karar 6'ya aykırı. Öneri (i)'de.
14. **coachLife v2** yeniden sorulacak mı, PLANDA YOK.
15. **"Kaynak" ile "Source":** plan bildirimde "Kaynak: Apple Weather" der (:196, :957); `S0/app-review-sorusu.md:6` Türkçe
    açıklamada "Source: Apple Weather" yazar. Ekranda plandaki Türkçe satır kullanılır; S0 belgesindeki satır düzeltilmeli.
16. **Gelişim'in öteki metinleri v2'de PLANDA YOK:** harita lejantı "iyileşiyor / geriliyor" (`ProgressOverview.jsx:223`,
    `:278-282`) ve etki hapları "belirgin iyileşme / belirgin kötüleşme" (`:48`). v2'nin dili bunları da kapsamalı mı?
17. **Göz hapı** "doğrulanmış değişim yok" (`ProgressOverview.jsx:55`), v2 metni "doğrulanmış bir değişim yok". Plan göz
    metninin değişmediğini söylüyor; aynı ekranda iki yazım yan yana durur.
18. **"Yolun · 34. gün"** hangi gün sayısı, PLANDA YOK. Öneri: iris ortasındaki sayı.
19. **Yoga sabah kartı** (onaylı yoga planı; bugün `Home.jsx:236-237`'ye eklendi) Ana sayfada başlığın hemen altında durur
    (04.00–11.59). Sonsuz yolun ilk 5 saniye dizilimi (§3.F.3) bunu hesaba katmıyor; kart görünen sabahlarda Nef cümlesi ve
    büyük düğme aşağı kayar. Seçenekler: kart ilk dokunuştan sonra açılsın (§2.2 K4 kuralı gibi) ya da diyaframın altına
    insin. Bu, yoga planına dokunduğu için sahibin kararıdır.
20. **Açılış ekranından giriş ekranına geçiş** (açık temada açık zeminden gece zeminine) (j)'de.
21. **Site:** üst başlık, soru satırı, tanıtım paragrafı ve üç kısa gerçeğin kaderi PLANDA YOK; kamera cümlesi iki kez geçer.
22. **Bugünkü kodda büyük düğme** `hideMinutes`'ı dinlemez (`lib/homeSuggest.js:18`, `:23`): 1. gün düğmede "Haftalık E
    testi · 5 dk" yazar, yolda süre yazmaz. Tasarım hangisini gösterecek?
23. **Sıfır kuralının kapsamı:** karar 5d "Ana sayfada sıfırlar" diyor; "0/3 hafta" satırı ve yolun altındaki "Bu hafta 0/3
    gün" (`Home.jsx:381`) de gizlenecek mi? Öneri: evet.
24. **Seri ≥ 3 iken "N gün seninle"** satırı kalacak mı? Plan "yerine" diyor. Öneri: kalır.
25. **320 pt'de beş yüz:** 44 pt dokunma alanı için aralık ≤ 5 px ya da kart iç boşluğu 14 px gerekir ((c)'deki hesap).

## Bölüm 4 · Bu listede olmayan ama planla ekranı değişen yerler (bilgi)

- WHO-5'in 14. gün kartı, Ana sayfada bir kez (§2.1 satır 19 :224; §3.F.5 :1086).
- 5. gün raporunun ilk ekranı: en güçlü kendi sayısıyla açılır, "neyi ölçtük, neyi henüz bilmiyoruz" diye biter (§3.F.5
  :1084-1085).
- Yenilikler ve rıza pencereleri günün ilk dokunuşundan sonraya kayar (§2.2 K4 :270).
- Profilim → Sorularım satırları: ekran satırı yalnız eski cevap varsa, uyku "kurulumda", gece telefonu "isteğe bağlı"
  (§3.D.3 :784-786).
- 90. günden sonra haftalık odak cümlesi: "Bu haftanın odağı: yakın–uzak." (§3.F.5 :1091).
- Uzun aradan dönüş: "Kaldığın yerden" (§3.F.4 öncelik 3); 14 gün ve üstünde o gün bir basamak yumuşak (§3.A.8 :455).
- Gizlilik sayfası (`site/gizlilik.html:76`, `:59-60`), App Store gizlilik etiketi ve sitenin "Bir günün nasıl geçer"
  bölümü (Y1, Y4, Y5, Y6).
