# VOLT TYCOON — Yayın Yol Haritası (Google Play + App Store)

> Güncelleme: 2026-07-07. İş bölümü: **[BEN]** = Claude yapar, **[SEN]** = senin yapman gereken (her adımda yönlendiririm).
> Durum: Oyun içerik olarak v1.0 adayı olgunluğunda; web sürümü canlı (GitHub Pages + artifact). Sıradaki iş: NATIVE PAKETLEME.

---

## Genel Bakış ve Takvim

| Aşama | Durum | Süre | Maliyet |
|---|---|---|---|
| 0. Sürüm dondurma + son rötuşlar | 🟡 %70 | 1-2 gün | — |
| 1. Capacitor ile Android paketi | ⬜ | 2-3 gün | — |
| 2. AdMob entegrasyonu | ⬜ | 2-3 gün | — |
| 3. Play hesabı + yasal | 🟡 kısmen | 1-2 gün (senin işlemler) | **$25 (tek sefer)** |
| 4. Mağaza varlıkları | ⬜ | 2 gün | — |
| 5. Play kapalı test (**zorunlu: 12 tester × 14 gün**) | ⬜ | **14 gün** (paralel) | — |
| 6. Play production yayını | ⬜ | 1-3 gün inceleme | — |
| 7. iOS (Codemagic + TestFlight + inceleme) | ⬜ | 1-2 hafta | **$99/yıl** |
| 8. Yayın sonrası döngü | ⬜ | sürekli | — |

**Gerçekçi hedef:** Play Store'da yayın ≈ **3 hafta** (14 günlük zorunlu test dâhil, bugün başlanırsa ~28 Temmuz). iOS ≈ +2 hafta.

### ✅ Zaten tamamlananlar (orijinal plandan öne çekilenler)
- Oyun adı: **VOLT TYCOON**; marka şeridi her ekranda
- **6 dil** (EN/TR/ES/PT/DE/FR) — mağaza metinleri de 6 dilde hazırlanacak
- **Yasal metinler oyun içinde** (gizlilik + koşullar + parodi feragati + telif) — [SEN] avukat kardeşin gözden geçiriyor ⚖️
- **GitHub reposu + Pages** canlı: https://onurozdi.github.io/volt-tycoon/ → gizlilik politikası URL'si buradan servis edilecek (Aşama 3'ün en zahmetli maddesi çözüldü)
- Öğretici, banka/iflas, istatistikler, 4 tesis + 12 araç, denge denetimi

---

## Aşama 0 — Sürüm Dondurma (v1.0 adayı) 🟡

- [x] Kardeş testi ilk tur geri bildirimleri işlendi (UI, denge, banka…)
- [ ] [BEN] **Kayıt: localStorage → Capacitor Preferences** (Android WebView localStorage'ı silebilir; oyuncu kaydı kutsal). Mevcut kayıtları otomatik taşıyan köprüyle.
- [ ] [BEN] Sürüm düzeni: `versionName 1.0.0` / `versionCode 1`
- [ ] [BEN] Düşük donanım WebView performans turu
- [ ] [SEN] Son bir "denetim oyunu": baştan sona 1 saat oyna, garip bir şey var mı?

## Aşama 1 — Capacitor ile Android Paketi ⬜

- [ ] [SEN] **Android Studio** kur (~10 dk; ben adım adım yönlendiririm)
- [ ] [SEN]+[BEN] **App ID kararı**: önerim `com.onurozdi.volttycoon` — ⚠️ SONRADAN DEĞİŞTİRİLEMEZ
- [ ] [BEN] Capacitor kurulumu (`@capacitor/core`, `android`, `preferences`), portrait kilidi, status bar (#0a1128), geri tuşu, tam ekran
- [ ] [BEN] Uygulama ikonu + splash (Neon Tech, özel çizim)
- [ ] [SEN] **Keystore oluşturma** (ben komut veririm) — ⚠️ **EN KRİTİK DOSYA**: kaybolursa uygulama bir daha güncellenemez. 2 yedek + şifre ayrı yerde + Play App Signing açılacak (Google da yedekler)
- [ ] [BEN] `.aab` (mağaza) + `.apk` (telefon testi) üretimi
- [ ] [SEN] Kendi telefonuna APK kur, dene; kardeşine de gönder (artık gerçek uygulama testi!)

## Aşama 2 — AdMob Entegrasyonu ⬜

Oyundaki 6 ödüllü reklam noktası hazır ve simüle çalışıyor (offline ×2, +5 gem, boost, zaman atlaması, claim doldurma ×2 yol) — `ads.ts` soyutlaması sayesinde tek dosya değişecek.

- [ ] [SEN] **AdMob hesabı** aç (admob.google.com, ücretsiz) → uygulama kaydet → App ID + Rewarded ad unit ID (adım adım tarif ederim)
- [ ] [BEN] `@capacitor-community/admob`; geliştirmede test reklamları, sürümde gerçek kimlikler
- [ ] [BEN] **UMP/GDPR onay akışı** (Avrupa için zorunlu) + Ayarlar'a "Reklam izinlerini yönet" düğmesi
- [ ] [BEN] Reklam yüklenemezse zarif düşüş (buton bekleme durumuna geçer, oyun kilitlenmez)
- [ ] [BEN] Oyun içi gizlilik metnini AdMob gerçeğine göre güncelle → [SEN] kardeşine son kontrol

## Aşama 3 — Google Play Hesabı + Yasal 🟡

- [ ] [SEN] **⏰ BUGÜN BAŞLA (en uzun bekleme zinciri buradan tetikleniyor):** play.google.com/console → $25 → kimlik doğrulaması (1-3 gün sürebilir)
- [ ] [SEN] **12 test kullanıcısı listesi** hazırla (Google/Gmail adresleri): aile + arkadaşlar + kardeşin. Kural: yeni bireysel hesaplar production'a çıkmadan **12 tester ile 14 gün kesintisiz kapalı test** yapmak zorunda.
- [x] Gizlilik politikası metni hazır (oyun içi) → [BEN] Pages'te ayrı sayfa olarak yayınlarım (URL Play formunda zorunlu)
- [ ] [SEN]+[BEN] Play Console formları (metinleri ben yazarım, sen yapıştırırsın): Data Safety, içerik derecelendirme (IARC — "Herkes" çıkar), reklam beyanı, hedef yaş

## Aşama 4 — Mağaza Varlıkları ⬜

- [ ] [BEN] Uygulama ikonu 512×512 (ZipVolt silüeti + yıldırım, Neon Tech)
- [ ] [BEN] Feature graphic 1024×500
- [ ] [BEN] Ekran görüntüleri: telefon 6-8 adet + 7"/10" tablet — üstlerine pazarlama şeritleri ("Üret. Sat. Büyü. ⚡")
- [ ] [BEN] Mağaza metinleri **6 dilde**: başlık (30kr), kısa açıklama (80kr), uzun açıklama (4000kr) + ASO anahtar kelimeleri (idle tycoon, ev factory, electric car game…)
- [ ] [SEN] Beğeni turu

## Aşama 5 — Kapalı Test (14 gün, diğer işlerle paralel) ⬜

- [ ] [SEN] 12+ tester e-postasını Console'a ekle, test linkini gruba at
- [ ] [BEN] Gelen hataları düzelt, güncel AAB yükle (versionCode++)
- [ ] [SEN] 14 gün dolunca "production erişimi" başvurusu (kısa anket)

## Aşama 6 — Play Production 🚀

- [ ] [BEN] Final AAB + sürüm notları (6 dil)
- [ ] [SEN] Kademeli yayın: %20 → %50 → %100
- [ ] Google incelemesi (1-3 gün) → **YAYINDA**

## Aşama 7 — iOS / App Store ⬜

Windows'tan iOS: **Codemagic bulut derleme** (ücretsiz katman yeterli; GitHub repomuz hazır olduğu için kurulumu kolay — ben yaparım).

- [ ] [SEN] **Apple Developer Program**: developer.apple.com → $99/yıl (doğrulama 1-2 gün; Play testi sürerken başlatılabilir)
- [ ] [BEN] `@capacitor/ios` + Codemagic pipeline + çentik/safe-area kontrolü (CSS zaten hazır)
- [ ] [BEN] AdMob iOS + **ATT** (App Tracking Transparency) izin ekranı
- [ ] [BEN] App Store görselleri (6.7"/6.5"/iPad) + 6 dilde metinler
- [ ] [SEN]+[BEN] App Store Connect kaydı + App Privacy formu + TestFlight'a kardeşini davet
- [ ] Apple incelemesi 1-3 gün (ilk seferde ret normaldir; genelde küçük düzeltmeyle geçer)

## Aşama 8 — Yayın Sonrası ⬜

- Haftalık denge yaması ritmi (config.ts tek dosya)
- Yorumlara yanıt; AdMob eCPM/doluluk takibi
- **v1.1 adayları:** IAP gem paketleri (Play Billing + StoreKit), günlük ödül, bulut kayıt, tier 5 (Global) + parodi haber genişlemesi, prestige
- İlk hedef metrik: gelir değil **D1/D7 tutundurma** — oyuncu kalıyorsa para arkasından gelir

---

## Kritik Uyarılar

1. **Keystore kaybı = uygulamanın sonu.** Oluşturduğumuz gün yedekle.
2. **App ID sonradan değişmez** (`com.onurozdi.volttycoon` öneriyorum).
3. **12 tester × 14 gün** takvimin kritik yolu — tester listesi bu hafta hazır olsun.
4. Hesap doğrulamaları günler sürer → **Play hesabını bugün aç.**

## Bu Haftanın Somut Adımları

| Kim | Ne |
|---|---|
| **SEN** | 1) Play Console hesabı aç ($25) 2) 12 tester listesi topla 3) Android Studio kur (ben söyleyince) |
| **BEN** | 1) Preferences kayıt köprüsü 2) Capacitor + Android projesi 3) İkon + splash 4) İlk APK → telefonuna |
