# Jev Göz Koçu — plan

Durum: **Faz 1a kodlandı** (2026-09-25): sunucu köprüsü `app/api/coach.js`, ortak mantık `app/src/lib/coachCore.js`,
istemci `app/src/lib/coach.js`, ana sayfa "Bugün" kartı `app/src/components/CoachCard.jsx` (açık onayla, varsayılan kapalı),
Bilgi'de aç/kapa. Kurulum: `bash app/scripts/coach-setup.sh` (anahtar Vercel'e Sensitive, model doğrulama, CLI ile production).
Varsayılan model (VARSAYIM, kullanıcı kararı "varsayalım"): `google/gemini-3.1-flash-lite`, yoksa `google/gemini-2.5-flash-lite`.
Sıradaki: haftalık rapor, 30 soruluk sınav (Faz 2 ile).

## Amaç
Uygulamaya kişinin kendi verisiyle konuşan, hatırlayan ve eylem öneren bir koç eklemek.
"Zeki" hissi üç şeyden gelir:
1. Kendi sayılarınla konuşur.
2. Söylediklerini hatırlar.
3. Harekete geçirir (plan, hatırlatma).

## Temel kural
- **Ölçüm, sayım ve tehlike uyarıları yapay zekâya bırakılmaz.**
  - E testi, okuma hızı, göz takibi ve kırmızı bayrak (ani görme kaybı, ışık çakması, perde inmesi) kural tabanlı ve deterministik kalır.
- **Jev yalnızca açıklar, kişiselleştirir ve önerir.**
  - Önerilerini kural katmanı doğrular.
- **Sağlık iddiası yok** (bkz. `docs/arastirma/SENTEZ_RAPORU.md`).
  - Kanıtı olmayan konuda "kanıt yok" der.

## Mimari (3 katman)

### 1. Sinyal katmanı — telefonda, kural tabanlı
Seanslardan günlük özet üretilir (yaklaşık 1 KB, anonim):

| Alan | İçerik |
|---|---|
| **Görme** | Göz başına logMAR (ZEST), okuma hızı ve kritik yazı boyutu. |
| **Göz davranışı** | Kırpma hızı, eksik kırpma oranı, testlerde ortalama göz–ekran mesafesi, yakın–uzak geçiş süresi, bakış kontrolü puanı (Yılan). |
| **Uyum** | Gün, saat, süre, atlanan adımlar. |
| **Semptom günlüğü** | Kullanıcının serbest metni. |

Kamera görüntüsü asla cihazdan çıkmaz.

### 2. Akıl katmanı — Jev, sunucuda
Yol: telefon → bizim sunucu (Vercel fonksiyonu) → OpenRouter → model.
- API anahtarı **telefona konmaz**.

Jev'e ham veri verilmez, **araçlar** verilir. Her cevap bir araç çağrısına dayanır.

| Araç | Döndürdüğü |
|---|---|
| `trend(metrik, aralık)` | Gerçek sayılar ve gürültü sınırı (±0,1 logMAR). |
| `karsilastir(donemA, donemB)` | İki dönemin karşılaştırması. |
| `kanit(konu)` | 14 araştırma raporundan kaynaklı cevap (PMID/DOI). Kaynak yoksa "kanıt yok". |
| `plan_oner(kisitlar)` | Günün seti. Kural katmanı süreyi, kanıt etiketini ve güvenliği doğrular. |
| `hatirlatma_kur(...)` | Hatırlatma kurar. |
| `semptom_kaydet(metin)` | Metni etiketlere çevirir (kuruluk, ekran süresi, saat). |
| **Bellek** | Kullanıcının verdiği bağlam (okuma gözlüğü, ekran saatleri, vardiya) ve Jev'in geçmiş önerileri. |

### 3. Sunum katmanı — uygulamada
- **Bugün kartı:** her gün 1 içgörü ve 1 eylem.
  - Sayıyı kural katmanı verir, cümleyi Jev kurar.
  - İnternet yoksa şablon metin gösterilir.
- **Sohbet (yazılı ve sesli):** mevcut konuşma tanıma kullanılır.
  - Cevap mini grafikle birlikte gelir.
- **Haftalık rapor:** Pazar günü kart olarak gelir, ayrıca doktora götürülecek PDF.
- **"Bugün senin için" seti:** gerekçesiyle birlikte önerilir.

## Kabul kriterleri ("zeki mi?" nasıl anlaşılır)
1. Veri sorularına kullanıcının **kendi sayılarıyla** cevap verir.
2. Her sağlık cümlesinde kaynak gösterir ya da "kanıt yok" der.
3. Bir hafta önce söyleneni hatırlar.
4. Günlük öneriyi nedeniyle verir.
5. **Ölçülü sınav** (yayın kapısı): 30 soru.
   - Soru türleri: 10 veri, 10 kanıt, 10 tuzak (ör. "gözlüğümü bıraksam mı?").
   - Bağımsız bir model puanlar: doğruluk, uydurma ve kaynak.
   - Geçme koşulu: **uydurma %0, doğruluk ≥ %90.** Geçmezse yayına çıkmaz.
6. Kırmızı bayrak içeren her mesajda sabit güvenlik uyarısı çıkar ve Jev'e gitmez.

## Gizlilik ve mağaza
- Açık onay ekranı; özellik varsayılan olarak kapalıdır.
- Anonim kimlik kullanılır; "verilerimi sil" seçeneği sunucudaki kayıtları da siler.
- Apple Guideline 5.1.2: kişisel verinin üçüncü taraf yapay zekâyla paylaşıldığı açıkça belirtilir ve onay alınır.
  - Güncel metin yayından önce kontrol edilecek.
- Gizlilik politikasına "Göz Koçu" bölümü eklenir.

## Maliyet ve sınırlar
- **VARSAYIM:** Ucuz bir modelle kullanıcı başına günde 1 içgörü ve sınırlı sohbet, ayda birkaç cent tutar.
  - Kesin rakam, kullanılacak model ve fiyatı belli olunca hesaplanacak.
- Kullanıcı başına günlük sohbet sınırı konur; önbellek kullanılır.
- Premium özelliktir.

## Fazlar

| Faz | İçerik | Tahmini süre |
|---|---|---|
| 1 | Sinyal katmanı, sunucu köprüsü (Vercel), Bugün kartı, haftalık rapor | ~2 hafta |
| 2 | Sohbet, bellek, kaynaklı `kanit` aracı, 30 soruluk sınav düzeneği | — |
| 3 | Sesli koç, "Bugün senin için" seti | — |

## Açık sorular (başlamadan cevaplanmalı)
1. Jev altta hangi modeli kullanıyor (OpenRouter model adı)?
2. Jev yalnızca geliştiricinin Mac'inde mi çalışıyor, yoksa sunucuya konabilir mi?
   - App Store kullanıcıları Mac'teki Jev'e erişemez. Bu durumda aynı model sunucudan çağrılır.
   - Jev ise geliştirme aracı olarak kullanılır: metin, çeviri kontrolü, test senaryoları.
3. Sunucu: mevcut Vercel projesi (eyetrail) mi, ayrı bir proje mi?
