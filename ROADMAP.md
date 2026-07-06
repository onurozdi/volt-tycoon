# VOLT TYCOON — Yayın Yol Haritası (Google Play + App Store)

> Varsayım: Oyun bugünkü haliyle (v0.2) çıkacak. Test geri bildirimleri geldikçe yalnızca denge/hata düzeltmesi yapılacak.
> İş bölümü: **[BEN]** = Claude kodlar/üretir, **[SEN]** = senin yapman gereken (hesap, ödeme, onay, tıklama — hepsinde adım adım yönlendiririm).

---

## Genel Bakış

| Aşama | Süre (tahmini) | Maliyet |
|---|---|---|
| 0. Sürüm dondurma + son rötuşlar | 2–3 gün | — |
| 1. Capacitor ile Android paketi | 2–3 gün | — |
| 2. AdMob (ödüllü reklam) entegrasyonu | 2–3 gün | — |
| 3. Google Play hesabı + yasal gereklilikler | 1–2 gün (senin işlemlerin) | **$25 (tek seferlik)** |
| 4. Mağaza varlıkları (ikon, ekran görüntüleri, metinler) | 2 gün | — |
| 5. Play kapalı test (**zorunlu: 12 tester × 14 gün**) | **14 gün** (paralel yürür) | — |
| 6. Play production yayını | 1–3 gün inceleme | — |
| 7. iOS (Mac/bulut derleme + TestFlight + inceleme) | 1–2 hafta | **$99/yıl + (gerekirse bulut CI)** |
| 8. Yayın sonrası döngü | sürekli | — |

**Gerçekçi takvim:** Android'de mağazada satışta olmak ≈ **3–4 hafta** (14 günlük zorunlu test dâhil). iOS onun ardından ≈ **+2 hafta**.

---

## Aşama 0 — Sürüm Dondurma (v1.0 adayı)

- [ ] [BEN] Kardeşinin test geri bildirimlerinden gelen düzeltmeler
- [ ] [BEN] Kayıt sistemini WebView-güvenli hale getirme: localStorage → **Capacitor Preferences** (Android WebView bazı durumlarda localStorage'ı temizleyebilir; oyuncu kaydı kutsaldır)
- [ ] [BEN] Sürüm numarası düzeni: `versionName 1.0.0` / `versionCode 1` (her mağaza yüklemesinde +1)
- [ ] [BEN] Basit hata yakalama: global error handler → oyuncuya "kayıt bozulmadı" güvencesi (Sentry gibi servis İSTEĞE BAĞLI, MVP'de gerekmez)
- [ ] [BEN] Performans turu: düşük donanımlı Android WebView'de 10Hz döngü + CSS animasyonları kontrolü

## Aşama 1 — Capacitor ile Android Paketi

- [ ] [SEN] **Android Studio** kur (tek seferlik, ~10 dk; SDK'yı otomatik kurar). Ben komutlarını veririm.
- [ ] [BEN] Capacitor kurulumu: `@capacitor/core`, `@capacitor/android`, `@capacitor/preferences`
- [ ] [BEN] App kimliği: `com.<soyadın/markan>.volttycoon` ← **buna birlikte karar vereceğiz, sonradan DEĞİŞTİRİLEMEZ**
- [ ] [BEN] Native ayarlar: portrait kilidi, status bar rengi (#0a1128), tam ekran, geri tuşu davranışı
- [ ] [BEN] Uygulama ikonu + splash screen (Neon Tech, özel çizim — mağaza jenerik algısı yaratmaz)
- [ ] [SEN] **Keystore oluşturma** (imza anahtarı; ben komutu veririm sen çalıştırırsın):
  - ⚠️ **EN KRİTİK DOSYA**: keystore + şifresi kaybolursa uygulama bir daha GÜNCELLENEMEZ.
  - Yedek planı: 1 kopya bilgisayarda, 1 kopya buluta (Drive), şifre ayrı yerde. Play "App Signing by Google" da açılacak (Google yedeği tutar).
- [ ] [BEN] `.aab` (Android App Bundle) üretimi + telefonunda test için `.apk`
- [ ] [SEN] Kendi telefonuna APK kurup son kontrol

## Aşama 2 — AdMob Entegrasyonu

Oyundaki 5 ödüllü reklam noktası hazır (offline ×2, +5 gem, boost, zaman atlaması, claim doldurma) — sadece simülasyonu gerçeğiyle değiştireceğiz. `ads.ts` soyutlaması sayesinde tek dosya değişir.

- [ ] [SEN] **AdMob hesabı** aç (admob.google.com, Google hesabınla ücretsiz) → uygulama kaydet → App ID + 1 adet Rewarded ad unit ID oluştur (adımları tek tek tarif ederim)
- [ ] [BEN] `@capacitor-community/admob` entegrasyonu; test reklam kimlikleriyle geliştirme, gerçek kimliklerle sürüm
- [ ] [BEN] **Consent (UMP) akışı**: Avrupa oyuncularına GDPR onay ekranı (Google zorunlu tutuyor; plugin destekliyor)
- [ ] [BEN] Reklam yüklenemezse zarif düşüş: buton "şu an reklam yok" durumuna geçer, oyun asla kilitlenmez
- [ ] Kural hatırlatması (tasarımına zaten uygun): ödül ancak reklam TAMAMEN izlenince verilir; reklamı kapatan ödül alamaz ama cezalandırılmaz.

## Aşama 3 — Google Play Hesabı + Yasal Gereklilikler

- [ ] [SEN] **Google Play Developer hesabı**: play.google.com/console → $25 tek seferlik → kimlik doğrulaması (kimlik/adres belgesi isteyebilir, 1–3 gün sürebilir; ERKEN BAŞLA)
- [ ] ⚠️ **Yeni kişisel hesaplar için zorunluluk**: Production'a çıkmadan önce **en az 12 test kullanıcısıyla 14 gün kesintisiz kapalı test** şartı var. Plan: aile + arkadaşlar + kardeşin = 12 kişi topla (Google hesap adresleri gerekecek). Bu 14 gün, diğer işlerle PARALEL yürür.
- [ ] [BEN] **Gizlilik politikası** hazırlama (reklam SDK'sı veri işlediği için zorunlu) → GitHub Pages'te ücretsiz yayınlarız (github.com hesabın var mı? yoksa 2 dk'da açılır)
- [ ] [SEN]+[BEN] Play Console formları (ben metinleri hazırlarım, sen yapıştırırsın):
  - Data Safety (veri güvenliği) formu — AdMob'un topladığı veriler beyan edilir
  - İçerik derecelendirme anketi (IARC) — oyunumuz "Herkes/PEGI 3" çıkar
  - Reklam beyanı: "Evet, reklam içerir"
  - Hedef yaş grubu (13+ seçmek COPPA yükünü azaltır)

## Aşama 4 — Mağaza Varlıkları

- [ ] [BEN] Uygulama ikonu 512×512 (Neon Tech, ZipVolt silüeti + yıldırım)
- [ ] [BEN] Feature graphic 1024×500 (Play vitrin görseli)
- [ ] [BEN] Ekran görüntüleri: telefon (min 2, ideal 6–8) + 7"/10" tablet — oynanış anları üstüne pazarlama şeritleri ("Kur, Üret, Sat, Büyü!")
- [ ] [BEN] Mağaza metinleri **EN + TR**: başlık (30), kısa açıklama (80), uzun açıklama (4000) — ASO anahtar kelimeleri: idle tycoon, ev, electric car, factory…
- [ ] [SEN] Onay: görselleri ve metinleri beğenme turu

## Aşama 5 — Kapalı Test (Play zorunluluğu)

- [ ] [SEN] 12+ tester e-postasını Console'a ekle; test linkini WhatsApp grubuna at
- [ ] 14 gün boyunca: [BEN] gelen hataları düzeltir, yeni AAB yüklerim (versionCode artar); testerlar oynamaya devam eder
- [ ] [SEN] 14 gün dolunca Console'dan "production erişimi başvurusu" (kısa anket)

## Aşama 6 — Google Play Production

- [ ] [BEN] Son AAB + sürüm notları
- [ ] [SEN] Production release oluştur → **kademeli yayın** öner: %20 → %50 → %100 (ilk gün kritik hata riskine karşı)
- [ ] Google incelemesi: genelde 1–3 gün
- [ ] 🎉 Yayında — "satmaya başladık" (gelir = reklam; IAP sonraki sürümde)

## Aşama 7 — iOS / App Store

Ön koşul: iOS derlemesi **Mac gerektirir**. Windows'tan 3 seçenek:
1. **Bulut CI (önerilen)**: Codemagic — ücretsiz katmanı iş görür; Mac'e hiç dokunmadan derler + TestFlight'a yükler. Kurulumunu ben yaparım.
2. Erişebildiğin bir Mac (arkadaş/aile) — birkaç saatlik iş.
3. Kiralık bulut Mac (MacinCloud vb., ~$20/ay) — gerekirse.

- [ ] [SEN] **Apple Developer Program**: developer.apple.com → $99/yıl (kimlik doğrulama 1–2 gün)
- [ ] [BEN] `@capacitor/ios` + Xcode proje ayarları + safe-area/çentik kontrolü (CSS'imiz zaten env(safe-area-inset) kullanıyor)
- [ ] [BEN] AdMob iOS tarafı + **ATT** (App Tracking Transparency) izin ekranı — Apple zorunlu tutuyor
- [ ] [BEN] App Store varlıkları: 6.7" + 6.5" + iPad ekran görüntüleri, açıklamalar
- [ ] [SEN]+[BEN] App Store Connect: uygulama kaydı, App Privacy formu, TestFlight'a kardeşini davet et
- [ ] Apple incelemesi: 1–3 gün (ilk başvuruda ret yaygındır — genelde metadata/izin metni düzeltmesiyle geçer, panik yok)

## Aşama 8 — Yayın Sonrası Döngü

- [ ] Haftalık denge yaması ritmi (config.ts tek dosya — hızlı)
- [ ] Yorumlara yanıt (mağaza sıralamasını etkiler)
- [ ] AdMob raporlarını izleme; eCPM/doluluk optimizasyonu
- [ ] **v1.1 adayları**: IAP gem paketleri (Play Billing + StoreKit), günlük ödül, bulut kayıt (Play Games / Game Center), yeni tesis (tier 5 — Global), prestige
- [ ] Gelir gerçekçiliği notu: ödüllü video eCPM'i bölgeye göre ~$8–25; kazanç indirme sayısıyla ölçeklenir. İlk hedef para değil **tutundurma metriği** (D1/D7 retention) — para, oyuncu kalınca gelir.

---

## Kritik Uyarılar (özet)

1. **Keystore'u kaybetme.** (Aşama 1) — yedeksiz kayıp = uygulamanın sonu.
2. **App ID sonradan değişmez.** (Aşama 1)
3. **12 tester × 14 gün** kuralını takvimin başına koy — en uzun bekleme bu. (Aşama 5)
4. Hesap doğrulamaları (Google 1–3 gün, Apple 1–2 gün) — **hesapları bu hafta aç**, kodlama beklemesin.
5. Gizlilik politikası ve consent ekranı olmadan reklam yayını = mağaza reddi.

## Sıradaki Somut Adım

Sen **Google Play Developer hesabını açarken** ($25 + kimlik doğrulama), ben paralelde Aşama 0–1'i kodlamaya başlarım (Preferences kayıt + Capacitor + ikon/splash). "Başla" demen yeterli.
