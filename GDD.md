# VOLT TYCOON — Game Design Document v1.0 (MVP)

> Oyun adı: **VOLT TYCOON** (eski çalışma adı "EV Tycoon"). "Volt" araç markalarının ortak DNA'sı (ZipVolt, VoltRider, Volterra, VoltVan), "Tycoon" tür bilinirliği sağlar. Ad, HUD'un en üstünde her ekranda görünür.

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

## 4b. Workshop (2. mekân)

**Atölye**, **$75.000 + 💎20** ile açılır. Açılmadan önce içindeki araçlar GÖRÜNMEZ — kilit kartı yalnızca "3 yeni üretim hattı" der (merak unsuru). Açılınca ana ekranda kendi bölüm başlığı altında 3 yeni hat gelir:

| # | İsim | Sınıf | Lisans (para) | Lisans (gem) | Üretim | Satış | Fiyat | Stok |
|---|---|---|---|---|---|---|---|---|
| 4 | **TriHauler** | Elektrikli kargo trike | $35K | 💎 30 | 75 sn | 40 sn | $3.400 | 12 |
| 5 | **FairwayGo** | Elektrikli golf aracı | $180K | 💎 35 | 150 sn | 80 sn | $16K | 10 |
| 6 | **CityPod** | Mahalle elektrikli aracı (NEV) | $900K | 💎 40 | 360 sn | 180 sn | $90K | 8 |

Personel bedelleri (teknisyen ≈ fiyat×2,2, müdürler ≈ fiyat×40, ×1,35 artış aynı):

| Araç | Teknisyen | Satış Temsilcisi | Üretim Müdürü | Satış Müdürü |
|---|---|---|---|---|
| TriHauler | $7,5K | $6K | $130K | $160K |
| FairwayGo | $36K | $29K | $640K | $770K |
| CityPod | $200K | $160K | $3,6M | $4,3M |

Araca özel haberler ve viral olaylar Workshop araçları için de tanımlıdır.

## 4c. Factory ve Gigafactory (3. ve 4. mekân)

Kademeli açılım kuralı: **yalnızca sıradaki kilitli tesis görünür** ("YENİ TESİS" kartı); sonrakiler tamamen gizlidir. Tesis açılınca bir sonraki belirir.

| Tesis | Açılış | Personel tavanı | Araçlar |
|---|---|---|---|
| Factory | $5M + 💎30 | 20 | Volterra (sedan), Terravolt (SUV), Haulen (pickup) |
| Gigafactory | $250M + 💎40 | 30 | VoltVan (panelvan), Colossus (tır), Transitron (otobüs) |

| Araç | Lisans | Üretim | Satış | Fiyat | Stok |
|---|---|---|---|---|---|
| Volterra | $3M + 💎35 | 10 dk | 5 dk | $450K | 8 |
| Terravolt | $15M + 💎40 | 20 dk | 10 dk | $2M | 6 |
| Haulen | $70M + 💎45 | 40 dk | 20 dk | $9M | 6 |
| VoltVan | $300M + 💎40 | 60 dk | 30 dk | $40M | 6 |
| Colossus | $1,5B + 💎45 | 120 dk | 60 dk | $180M | 5 |
| Transitron | $7B + 💎50 | 240 dk | 120 dk | $800M | 4 |

Personel bedelleri aynı oranlar (teknisyen ≈ fiyat×2,2, müdür ≈ fiyat×40). İçerik backlog'u: Factory/Giga araçlarına özel ticker haberi ve viral olaylar sonraki sürümde.

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

### Personel tavanı (mekâna göre)

Küçük mekânda az çalışan — parayla sınırsız coşturulamaz. Tavan **araç başına, rol başına**dır ve her yeni mekânda artar:

| Mekân | Teknisyen tavanı | Satış Temsilcisi tavanı |
|---|---|---|
| Home Garage | 6 | 6 |
| Workshop | 12 | 12 |
| Factory | 20 | 20 |
| Gigafactory | 30 | 30 |

Tavana ulaşan buton "MAX" olur. Sayaç `3/6` biçiminde gösterilir. Not: personel gerektiren başarım eşikleri her zaman toplam kapasitenin altında tutulur (örn. Teknisyen Ordusu 40 < 54 kapasite).
- Production Manager: oto-üretim + offline üretim.
- Sales Manager: oto-satış + offline satış.

## 5. Claim + Research

- **Claim**: 4 dakikada dolar; dolunca oyuncu claim eder → **baz 5 RP** (research ile artar: `(5 + toplamsal) × çarpımsal`). Offline'da da dolar (tek sefer, birikmez).
- **Research ağacı tier'lıdır** (haberlerle aynı mantık): her tesisin kendi araştırmaları vardır ve yalnızca o tesis açıkken görünür. RP kazanım hızını artıran araştırmalar her tier'a serpiştirilmiştir — research ekonomisi kendi kendini besler.

### Ar-Ge personeli merdiveni (otomatik claim)

Her tesiste bir "Ar-Ge personası" araştırması vardır; ilki otomasyonu açar, sonrakiler iyileştirir:

| Tesis | Persona | Etki | Maliyet (RP) |
|---|---|---|---|
| Garage | **Mucit** | Claim dolduğunda otomatik toplanır (offline dahil) | 200 |
| Workshop | **Ar-Ge Asistanı** | Claim süresi ×0,8 | 300 |
| Factory | **R&D Manager** | Claim başına RP ×1,5 | 900 |
| Giga | **Tekillik Çekirdeği** | Claim başına RP ×2 | 4.500 |

Mucit'ten önce claim manuel tıklamayla toplanır (erken oyunun "uğrama" ritüeli); Mucit orta oyunda kazanılan bir konfor terfisidir.

| Tier | Araştırma | Etki | Maliyet (RP) |
|---|---|---|---|
| Garage | Efficient Assembly I–III | üretim −10%/sv | 10/30/80 |
| Garage | Smart Marketing I–III | fiyat +15%/sv | 10/30/80 |
| Garage | **Tinkering I–II** 🧪 | claim +3 RP/sv | 15/45 |
| Garage | Warehouse I–II | stok +50%/sv | 20/60 |
| Garage | Offline Logistics I–II | offline 8→12→24s | 25/70 |
| Garage | Quick Claim 🧪 | claim süresi −25% | 40 |
| Garage | Batch Production | döngü +1 araç | 120 |
| Workshop | **Reverse Engineering I–II** 🧪 | claim +5 RP/sv | 80/180 |
| Workshop | Smart Logistics I–II | satış −15%/sv | 90/200 |
| Workshop | Robotics I–II | üretim −10%/sv | 120/260 |
| Workshop | Bulk Storage | stok +50% | 150 |
| Factory | **R&D Laboratory I–II** 🧪 | claim süresi −20%/sv | 350/700 |
| Factory | Brand Power I–II | fiyat +20%/sv | 400/800 |
| Factory | Full Automation I–II | üretim −10%/sv | 500/1000 |
| Factory | Giga Batch | döngü +1 araç | 900 |
| Giga | **Quantum Analysis** 🧪 | claim RP ×2 | 2000 |
| Giga | AI Core I–II | üretim −15%/sv | 2500/5000 |
| Giga | Global Brand I–II | fiyat +25%/sv | 3000/6000 |
| Giga | Hyperlogistics I–II | satış −20%/sv | 2800/5600 |

🧪 = RP kazanım hızını artıran araştırma. Tam yatırımla claim: 5 → 21 RP (garaj+atölye) → 42 RP (kuantum), süre 240sn → 115sn.

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

### Haber hiyerarşisi (mekân büyüdükçe ciddileşir)

Her haber ve haber olayı bir **mekân katmanına** bağlıdır; yalnızca o mekân açıksa havuza girer. Ton, katmanla birlikte olgunlaşır:

| Katman | Mekân | Ton | Örnek |
|---|---|---|---|
| 1 | Home Garage | Mahalle mizahı — komşular, kediler, uzatma kabloları | "Komşunun çöpünde 4 akü buldun!" |
| 2 | Workshop | Şehir/belediye — başkan ziyareti, park indirimi, şebeke bakımı | "Belediyeden elektrikli araçlara ücretsiz park!" |
| 3 | Factory (ileride) | Sektörel, görece ciddi — tedarik zinciri, ihracat, borsa | "Çeyrek raporu beklentileri aştı." |
| 4–5 | Global (ileride) | Kurumsal parodi — Tesla/Musk *benzeri* ama telifsiz parodi isimler | "Rakip CEO 'Peron Tusk' roketle işe gitti." |

Alt katman haberleri havuzdan çıkmaz (mahalle esprisi hep tatlı kalır) ama üst katmanlar açıldıkça havuz ciddileşen içerikle genişler. Gerçek kişi/marka adı KULLANILMAZ — mağaza güvenliği için parodi adlar.

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

| Başarım | Koşul | Gem |
|---|---|---|
| İlk Satış | 1 satış | 4 |
| İlk Eleman | 1 teknisyen | 4 |
| Satışçı | 100 satış | 5 |
| Teknik Kadro | toplam 10 teknisyen | 5 |
| Delegasyon | ilk müdür | 5 |
| Evreka | ilk araştırma | 3 |
| Beş Hane | $10K toplam kazanç | 5 |
| Satış Efsanesi | 1.000 satış | 10 |
| Altı Hane | $100K toplam kazanç | 10 |
| Tam Kadro | tüm araçlar açık | 10 |

### Reklamsız oynanabilirlik kuralı (tasarım ilkesi)

> **Reklam asla zorunlu olamaz.** Başlangıç gem'i + ("Tam Kadro" hariç) başarımlardan kazanılabilir toplam gem, kümülatif lisans gem bedelinin **en az 1,5 katı** olmalıdır. Yeni araç/lokasyon eklerken bu oran korunur.

Güncel doğrulama (4 tesis dahil): lisanslar 35+105+120+135 = 395 + tesis açılışları 20+30+40 = 90 → **485 gem gider** → gerek 727,5. Havuz: başlangıç 5 + ("Tam Kadro" hariç) başarımlar 731 = **736 ≥ 727,5** ✓. Yeni üst katman başarımları: tesis açılışları (+25/+40), 1M/10M satış (+40/+60), $1B/$10B/$100B (+50/+60/+70), araştırma kademeleri (+15/+30/+50), iş gücü (+30), otomasyon (+30).

### Başarım temposu (bilinçli yavaşlama)

Eşikler ×10 büyür: 100 → 1.000 → 10.000 → 100.000 satış; $10K → $100K → $1M → $10M kazanç. İlk 10 dakikada 4-5 başarım gelir (erken ödül yoğunluğu), orta oyunda saatte 1-2'ye, geç oyunda günlere yayılır. Yeni mekânlar açıldıkça üst katmanlar eklenir; tempo hiçbir zaman erken oyundaki yoğunluğa geri dönmez.

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
