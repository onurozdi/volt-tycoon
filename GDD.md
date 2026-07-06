# EV TYCOON — Game Design Document v1.0 (MVP)

> Yaşayan doküman. Tüm tasarım kararları burada tutulur; kod bu dokümana uyar.
> Son güncelleme: 2026-07-06

## 1. Künye

| | |
|---|---|
| Tür | Idle Tycoon + Incremental + Hafif Yönetim |
| Platform | Android (öncelik) → iOS |
| Yön | Portrait, 720×1280 tasarım çözünürlüğü |
| Teknoloji | TypeScript + Vite (web) → Capacitor (Android/iOS) |
| Dil | İngilizce + Türkçe (i18n altyapısı baştan) |
| Gelir | Reklam (ödüllü video ağırlıklı, oyuncuyu yormayan) + ileride IAP (Gems) |
| Görsel stil | **Neon Tech**: koyu lacivert zemin, elektrik mavisi/turkuaz + lime yeşili vurgular, glow, özel SVG ikonlar |

## 2. Hikâye ve Büyüme

Oyuncu küçük bir **ev garajında** elektrikli araç üretmeye başlar. Amaç: dünyanın en büyük EV üreticisi olmak. Garaj → Atölye → Fabrika → Gigafactory → Küresel ağ. **MVP yalnızca Home Garage'ı kapsar.**

## 3. Çekirdek Kurallar (değişmez kararlar)

1. **Üretim ücretsizdir. Para yalnızca satıştan gelir.**
2. Her araç **bağımsız** stok, üretim hattı ve satış hattına sahiptir. Cross-selling yok.
3. Satış ve üretim **manuel** başlar; ilgili **Manager** alınınca otomatikleşir.
4. Manager'lar aynı zamanda **offline progress**'i açar.
5. Technician katkısı **azalan getirili**: `Hız = 1 + (Smax − 1) × (1 − e^(−n/τ))`
6. Research, **Claim** mekanizmasıyla kazanılan Research Point (RP) ile yapılır.
7. Premium para **Gems**; kullanım: anında bitirme, boost, claim doldurma.
8. Haberler yalnızca **kilidi açılmış** araçlar için gösterilir.
9. MVP'de **prestige yok**.

## 4. Araçlar (Home Garage — 3 araç)

| # | İsim | Sınıf | Profil | Lisans (para) | Lisans (gem) |
|---|---|---|---|---|---|
| 1 | **ZipVolt** | Elektrikli kick scooter | Çok hızlı üretim, ucuz | Baştan açık | — |
| 2 | **VoltRider** | E-Bike | Orta | $600 | 💎 10 |
| 3 | **Econo EV** | Mikro elektrikli araba | Yavaş, pahalı | $9.000 | 💎 25 |

Lisans hem para hem gem ister. Gem'ler başarımlardan ve ödüllü videodan kazanılır — böylece video izlemenin somut bir amacı olur ama zorunlu değildir (başarımlar da yeter).

### Başlangıç ekonomi değerleri

| Araç | Üretim süresi | Satış süresi | Satış fiyatı | Stok limiti |
|---|---|---|---|---|
| ZipVolt | 4 sn | 3 sn | $12 | 20 |
| VoltRider | 12 sn | 8 sn | $95 | 15 |
| Econo EV | 45 sn | 25 sn | $1.100 | 10 |

### Personel maliyetleri (araç başına, üstel artış ×1,35)

| Araç | İlk Technician | İlk Sales Rep | Prod. Manager | Sales Manager |
|---|---|---|---|---|
| ZipVolt | $25 | $20 | $400 | $500 |
| VoltRider | $220 | $180 | $3.500 | $4.200 |
| Econo EV | $2.600 | $2.100 | $40.000 | $48.000 |

- Technician: üretim hızını artırır. `Smax = 4`, `τ = 8` (üretim süresi asla baz sürenin 1/4'ünün altına inmez).
- Sales Rep: satış hızını artırır. Aynı formül, `Smax = 4`, `τ = 8`.
- Production Manager: oto-üretim + offline üretim.
- Sales Manager: oto-satış + offline satış.

## 5. Claim + Research

- **Claim**: 4 dakikada dolar; dolunca oyuncu claim eder → **5 RP**. Offline'da da dolar (tek sefer, birikmez).
- **Research ağacı (MVP):**

| Araştırma | Etki | Maliyet (RP) | Kademe |
|---|---|---|---|
| Efficient Assembly I–III | Tüm üretim süresi −10% | 10 / 30 / 80 | 3 |
| Smart Marketing I–III | Tüm satış fiyatı +15% | 10 / 30 / 80 | 3 |
| Warehouse Expansion I–II | Stok limiti +50% | 20 / 60 | 2 |
| Offline Logistics I–II | Offline süre tavanı 8s → 12s → 24s | 25 / 70 | 2 |
| Quick Claim | Claim süresi −25% | 40 | 1 |
| Batch Production | Üretim döngüsü başına +1 araç | 120 | 1 |

## 6. Gems (premium para)

- Kazanım: başarımlar + ödüllü video (+ ileride IAP).
- Harcama: üretimi anında bitir (1), claim'i anında doldur (3), 4 saatlik ×2 gelir boostu (10).

## 7. Reklam (oyuncuyu yormayan)

- **Ödüllü video** (hepsi isteğe bağlı):
  - Offline kazancı ×2 (Welcome Back ekranında)
  - +5 gem (Market)
  - 4 saat ×2 gelir boostu (Market)
  - **Zaman Atlaması**: 15 dakikalık otomatik üretim+satış geliri anında (Market; en az bir müdür gerekir)
  - Claim'i anında doldur (Research ekranı)
- Zorunlu geçiş reklamı (interstitial) **yok**. Banner **yok** (MVP'de).
- Webde reklamlar simüle edilir; Capacitor aşamasında AdMob bağlanır.

## 8. Offline Progress

- Manager'ı olan hatlarda üretim/satış kapalıyken devam eder.
- Tavan: 8 saat (research ile 24 saate kadar).
- Dönüşte "Welcome Back" ekranı: üretilen/satılan/kazanılan özet + reklamla ×2.

## 9. Haber Sistemi

İki katman:

**a) Haber bandı (ticker):** Ana ekranda kayan mizahi/atmosferik haberler. Havuz, kilit durumuna göre filtrelenir. Oynanışa etkisi yoktur.

**b) Haber olayları (popup):** Seyrek aralıklarla (4–7 dakikada bir, rastgele) ekrana "SON DAKİKA" popup'ı çıkar ve **geçici bir oynanış etkisi** uygular. Kurallar:

- Etkiler çoğunlukla olumludur (%75); olumsuz olaylar seyrek ve hafiftir (%25, en fazla −%15).
- Etki türleri: üretim hızı, satış hızı veya satış fiyatı çarpanı; tüm araçlara ya da tek araca uygulanabilir.
- Araca özel olaylar yalnızca o araç açıksa çıkar.
- Aynı anda tek olay aktif olur; süresi 60–120 sn. Aktif olay HUD altındaki ince şeritte geri sayımla gösterilir.
- Olaylar çevrimdışında tetiklenmez ve süreleri gerçek zamanla dolar.

| Olay | Etki | Süre |
|---|---|---|
| Araç viral oldu (araca özel ×3) | O aracın fiyatı ×1,5 | 90 sn |
| Batarya indirimi | Tüm üretim hızı ×1,3 | 90 sn |
| EV fuarı şehirde | Tüm satış hızı ×1,4 | 90 sn |
| Devlet teşviki | Tüm fiyatlar ×1,25 | 120 sn |
| Parça gecikmesi (olumsuz) | Tüm üretim hızı ×0,85 | 60 sn |
| Piyasa durgunluğu (olumsuz) | Tüm fiyatlar ×0,85 | 60 sn |

## 10. Başarımlar (MVP — gem kaynağı)

İlk satış, 100 satış, 1.000 satış, ilk technician, ilk manager, tüm araçlar açık, ilk research, $100K toplam kazanç… her biri 2–10 gem.

## 11. UI Yapısı

```
┌─────────────────────────┐
│  💰 Money   💎 Gems  ⚙️  │ ← sabit üst HUD
├─────────────────────────┤
│                         │
│   (scroll edilebilir)   │ ← araç kartları / aktif sekme içeriği
│                         │
├─────────────────────────┤
│ Home Research Garage    │ ← sabit alt navigasyon
│        Market  Settings │
└─────────────────────────┘
```

Sekmeler: **Home** (üretim hatları), **Research** (claim + ağaç), **Garage** (istatistik + başarımlar), **Market** (gems + boostlar + ödüllü reklamlar), **Settings** (dil, ses, kayıt sıfırlama).

## 12. Kayıt Sistemi

- Otomatik kayıt: 10 sn'de bir + görünürlük kaybında (localStorage → Capacitor Preferences).
- Sürüm damgalı kayıt formatı; ileriye dönük migration desteği.

## 13. Ekonomi Döngüsü

Produce → Stock → Sell → Money → Upgrade (tech/rep/manager) → Daha hızlı üretim → Yeni araç → (sonraki sürüm: yeni fabrika)

## 14. MVP Sonrası (kapsam dışı, plan)

Factory 1 (+ Cargo Trike), yeni lokasyonlar, prestige, görevler, IAP, bulut kayıt, ses/animasyon zenginleştirme.
