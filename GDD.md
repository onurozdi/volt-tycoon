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

Personel bedelleri (teknisyen ≈ fiyat×2,2, müdürler ≈ fiyat×40, ×1,30 artış aynı):

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

### Personel maliyetleri (araç başına, üstel artış ×1,30)

> Denge denetimi (2026-07-07): artış ×1,35'ten ×1,30'a indirildi — tavanlar 20-30'a çıkınca 1,35^29 ≈ ×6.000 geç oyunda tam kadroyu ulaşılamaz kılıyordu. Erken oyun etkisi ihmal edilebilir (~%11).

| Araç | İlk Technician | İlk Sales Rep | Prod. Manager | Sales Manager |
|---|---|---|---|---|
| ZipVolt | $25 | $20 | $400 | $500 |
| VoltRider | $220 | $180 | $3.500 | $4.200 |
| Econo EV | $2.600 | $2.100 | $40.000 | $48.000 |

- Technician: üretim hızını artırır. `Smax = 4`, `τ = 8` (üretim süresi asla baz sürenin 1/4'ünün altına inmez).
- Sales Rep: satış hızını artırır. Aynı formül, `Smax = 4`, `τ = 8`.

### Personel tavanı (mekâna göre)

Küçük mekânda az çalışan — parayla sınırsız coşturulamaz. Tavan **araç başına, rol başına**dır ve **açık olan en büyük tesisin tavanı TÜM araçlara uygulanır** — yeni tesis açmak eski hatların kadrosunu da büyütür, böylece eski araçlar önemsizleşmez ve "sürümden kazanmaya" devam eder:

| Açık en büyük tesis | Tüm araçlarda tavan (rol başına) |
|---|---|
| Home Garage | 6 |
| Workshop | 12 |
| Factory | 20 |
| Gigafactory | 30 |

Azalan getiri eğrisi (Smax=4, τ=8) sayesinde bu güç patlaması yaratmaz: 6 kişi ×2,58 hız, 30 kişi ×3,93 (asimptot 4). Tavana ulaşan buton "MAX" olur; sayaç `3/6` biçiminde gösterilir. Personel gerektiren başarım eşikleri her zaman erişilebilir kapasitenin altında tutulur.

### Uzman kadro — "eski araca dönüş" köprü mekaniği

Personel maliyeti iki rejimlidir:

- Aracın **kendi tesisinin** tavanına kadar: normal artış (×1,30/kişi).
- Üzerindeki slotlar (**uzman kadro** — yeni tesislerin açtığı ek kapasite): ek **×1,75/kişi**. Arayüzde altın fiyatla gösterilir.

Amaç: Oyun ortasında fiyatlar yavaşlatınca eski araca dönüp birkaç uzman almak **kısa vadeli tatlı bir köprü** olsun (ilk 3-5 uzman dakikalarla ödenir, hattı %15-25 hızlandırır) ama ×1,75 dikliği + Smax asimptotu sayesinde **uzun erimli kâr motoruna dönüşmesin** — oyuncu doğal olarak pahalı yeni araçlara geri döner. Örnek (CityPod, fabrika döneminde): 13. teknisyen 4,7M (dakikalar), 20. teknisyen 233M (açıkça değmez).
- Production Manager: oto-üretim + offline üretim.
- Sales Manager: oto-satış + offline satış.

## 5. Claim + Research

- **Claim**: 4 dakikada dolar; dolunca oyuncu claim eder → **baz 5 RP** (research ile artar: `(5 + toplamsal) × çarpımsal`). Offline'da da dolar (tek sefer, birikmez).
- **Research ağacı tier'lıdır** (haberlerle aynı mantık): her tesisin kendi araştırmaları vardır ve yalnızca o tesis açıkken görünür. RP kazanım hızını artıran araştırmalar her tier'a serpiştirilmiştir — research ekonomisi kendi kendini besler.

### Ar-Ge personeli merdiveni (otomatik claim)

Her tesiste bir "Ar-Ge personası" araştırması vardır; ilki otomasyonu açar, sonrakiler iyileştirir:

| Tesis | Persona | Etki | Maliyet (RP) |
|---|---|---|---|
| Garage | **Mucit** | Claim dolduğunda otomatik toplanır (offline dahil) | 25 |
| Workshop | **Ar-Ge Asistanı** | Claim süresi ×0,75 | 350 |
| Factory | **R&D Manager** | Claim başına RP ×1,5 | 900 |
| Giga | **Tekillik Çekirdeği** | Claim başına RP ×2 | 4.500 |

Mucit bilinçli olarak **ucuzdur** (~ilk 15-20 dakika, 5 claim): otomasyon erken bir konfordur, tıklama yalnızca açılışın tadımlığıdır. Tempo sonrasında süre/ödül araştırmalarıyla ayarlanır: RP/saat ≈ 75 (garaj) → ~560 (atölye) → ~1.300 (fabrika) → ~5.200 (giga); tier araştırma toplamları da paralel büyür (~660 → 1.930 → 7.350 → 42K RP).

| Tier | Araştırma | Etki | Maliyet (RP) |
|---|---|---|---|
| Garage | Efficient Assembly I–III | üretim −10%/sv | 10/30/80 |
| Garage | Smart Marketing I–III | fiyat +15%/sv | 10/30/80 |
| Garage | **Tinkering I–II** 🧪 | claim +3 RP/sv | 15/45 |
| Garage | Warehouse I–II | stok +50%/sv | 20/60 |
| Garage | Offline Logistics I–II | offline 8→12→24s | 25/70 |
| Garage | Quick Claim 🧪 | claim süresi −25% | 30 |
| Garage | Batch Production | döngü +1 araç | 120 |
| Workshop | **Reverse Engineering I–II** 🧪 | claim +5 RP/sv | 80/180 |
| Workshop | Smart Logistics I–II | satış −15%/sv | 90/200 |
| Workshop | Robotics I–II | üretim −10%/sv | 120/260 |
| Workshop | Bulk Storage | stok +50% | 150 |
| Workshop | **Garaj Modernizasyonu I–II** 🔧 | garaj araçları üretim+satış −15%/sv | 150/350 |
| Factory | **R&D Laboratory I–II** 🧪 | claim süresi −20%/sv | 350/700 |
| Factory | Brand Power I–II | fiyat +20%/sv | 400/800 |
| Factory | Full Automation I–II | üretim −10%/sv | 500/1000 |
| Factory | Giga Batch | döngü +1 araç | 900 |
| Factory | **Atölye Modernizasyonu I–II** 🔧 | atölye araçları üretim+satış −15%/sv | 600/1200 |
| Giga | **Quantum Analysis** 🧪 | claim RP ×2 | 2000 |
| Giga | AI Core I–II | üretim −15%/sv | 2500/5000 |
| Giga | Global Brand I–II | fiyat +25%/sv | 3000/6000 |
| Giga | Hyperlogistics I–II | satış −20%/sv | 2800/5600 |
| Giga | **Fabrika Modernizasyonu I–II** 🔧 | fabrika araçları üretim+satış −15%/sv | 3500/7000 |

🔧 = Modernizasyon: her tesis, **bir önceki tesisin** araçlarını hızlandıran bir araştırma taşır. Eski tier'ın mutlak geliri güncel tier'ın ~1/5–1/10'u olduğundan bu cömert çarpan dengeyi bozmaz — eski hatlar "sürümden kazanmaya" devam eder ama lisans finanse eden motora dönüşmez (uzman kadro köprüsüyle aynı felsefe).

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

**Faz kuralı (kayan bant):** Bant her zaman açık olan **en büyük tesisin düzleminden** beslenir — gigafactory döneminde artık mahalle haberi dönmez; şirket büyüdükçe dünyası da büyür. Her fazın havuzu ~10-12 haberdir (jenerik + o fazın araçlarına özel). Popup olayları ise katman-BİRİKİMLİ kalır (garaj hediyeleri hep gelebilir — mekanik çeşitlilik için bilinçli fark). Gerçek kişi/marka adı KULLANILMAZ — mağaza güvenliği için parodi adlar.

**b) Haber olayları (popup):** Seyrek aralıklarla (4–7 dakikada bir, rastgele) ekrana "SON DAKİKA" popup'ı çıkar ve **geçici bir oynanış etkisi** uygular. Kurallar:

- Etkiler çoğunlukla olumludur (%75); olumsuz olaylar seyrek ve hafiftir (%25, en fazla −%15).
- Etki türleri: üretim hızı, satış hızı veya satış fiyatı çarpanı; tüm araçlara ya da tek araca uygulanabilir.
- Araca özel olaylar yalnızca o araç açıksa çıkar.
- Aynı anda tek olay aktif olur; süresi 60–120 sn. Aktif olay HUD altındaki ince şeritte geri sayımla gösterilir.
- **Anlık olaylar (buyout):** Süresiz özel tür — stoğu kapasitesinin ≥%80'i dolu bir araç varsa havuza "Zengin yatırımcı tüm {araç} stoğunu satın aldı!" tarzı olaylar girer; o aracın TÜM stoğu anında güncel fiyattan satılır (etki süresi yok). Dolu depo böylece küçük bir piyango biletine dönüşür. Çeşniler: Yatırımcı (garaj katmanı), Koleksiyoncu (atölye katmanı). Ayrıca **gizemli hediye olayları** (gift): kapüşonlu yabancı / sokak kedisi / "V" imzalı not — 1-4 gem bırakır, koşulsuz, anlık.
- Olaylar çevrimdışında tetiklenmez ve süreleri gerçek zamanla dolar.

| Olay | Etki | Süre |
|---|---|---|
| Araç viral oldu (araca özel ×3) | O aracın fiyatı ×1,5 | 90 sn |
| Batarya indirimi | Tüm üretim hızı ×1,3 | 90 sn |
| EV fuarı şehirde | Tüm satış hızı ×1,4 | 90 sn |
| Devlet teşviki | Tüm fiyatlar ×1,25 | 120 sn |
| Parça gecikmesi (olumsuz) | Tüm üretim hızı ×0,85 | 60 sn |
| Piyasa durgunluğu (olumsuz) | Tüm fiyatlar ×0,85 | 60 sn |

## 9c. Banka (kredi + iflas)

Alt navigasyonda **Banka** sekmesi (Ayarlar üst HUD'a dişli olarak taşındı). RCT ruhu: tesis açıldıkça daha büyük kredi teklifi belirir (kademeli açılım — sıradaki tesisin teklifi görünmez).

Her tesiste **2 seçenek**: temkinli küçük kredi + daha büyük/yüksek faizli büyüme kredisi (aynı anda ikisi de çekilebilir; HUD tüm kredilerin birleşik dakikalık yükünü gösterir).

| Tesis | Kredi | Ana para | Faiz | Taksit |
|---|---|---|---|---|
| Garage | Esnaf Kredisi | $600 | %30 | 12 × 90sn |
| Garage | Genişleme Kredisi | $2,5K | %35 | 16 × 120sn |
| Workshop | İşletme Kredisi | $60K | %35 | 12 × 120sn |
| Workshop | Büyüme Kredisi | $250K | %40 | 16 × 180sn |
| Factory | Sanayi Kredisi | $4M | %40 | 16 × 180sn |
| Factory | Kurumsal Kredi | $20M | %45 | 20 × 240sn |
| Giga | Mega Tahvil | $400M | %50 | 20 × 240sn |
| Giga | Titan Tahvili | $2B | %55 | 24 × 300sn |

Kurallar:
- Aynı tekliften aynı anda 1 aktif kredi; toplam ana paralar dönem lisansı mertebesinde → kredi hızlandırır ama oyunu satın alamaz.
- Taksitler bakiyeyi **eksiye düşürebilir**; eksi bakiyede hiçbir satın alma yapılamaz (borç sarmalı imkânsız).
- Taksitler offline'da da kesilir (offline tavanına kadar; Welcome Back'te "🏦 −$X" satırı).
- **İflas:** bakiye kesintisiz 5 dk ekside kalırsa (sayaç YALNIZCA aktif oyunda işler — kimse uykusunda iflas etmez) → İFLAS ekranı → tek çıkış "BAŞTAN BAŞLA" (tam sıfırlama).
- Eksi bakiyede HUD parası kırmızıya döner, altında nabız atan uyarı bandı geri sayar.
- Erken kapatma: kalan taksit toplamı tek seferde ödenir (indirim yok).

Tasarım amacı: oyuncu bir hedefe para biriktirirken sıkılmaya başladığında "kredi çeksem mi?" değerlendirmesi gerçek bir karar olsun; faiz, aceleciliğin fiyatıdır.

## 9d. Sözleşme Panosu

Teklifler **popup** olarak gelir (reddetmek ücretsiz); kabul edilen sözleşme Home'un tepesine **kompakt altın şerit** (~32px, aktif etki barı boyutunda) olarak sabitlenir: şeridin arkaplan dolgusu stok ilerlemesidir, sağda ödül + geri sayım okunur; stok tamamlanınca sağ etiket altın "TESLİM ET" rozetine döner ve **şeride dokunmak teslim eder**. Oyun içeriğini aşağı itmez. Eşzamanlı sözleşme sayısı **sınırsız** — doğal sınır, veren başına aynı anda 1 sözleşme kuralıdır (aktif pencerede en çok 4 veren olduğundan pratikte en çok 4).

**Verenler (tesis başına 2):**

| Tesis | Verenler |
|---|---|
| Garage | Komşu Kemal, Mahalle Pizzacısı |
| Workshop | Belediye, Kurye Kooperatifi |
| Factory | Ulusal Bayi Zinciri, Araç Kiralama Devi |
| Gigafactory | Elektrania Cumhuriyeti, Zappistan Krallığı |

- **Pencere kuralı (haber fazlarından FARKLI):** yalnızca **son açılan 2 tesisin** verenleri teklif gönderir. Factory açılınca garaj verenleri tekliften düşer — büyüdükçe eski çevre küçülür.
- **İtibar (veren başına bağımsız, −5..+10):** başarılı teslim +1, başarısızlık −1. **Eksiye düşebilir**: eksi itibarlı veren daha seyrek teklif verir, fiyat bandı aşağı kayar (−%2/eksi yıldız; −5'te bant 0,75–1,15×) ve seçilme olasılığı düşer. İstatistikte eksi itibar **kırmızı ⚠ yıldızlarla** ve −%X etiketiyle gösterilir; teklif popup'ında da veren adının yanında kırmızı görünür. Çıkış her zaman mümkün: eksideyken bile teslim itibarı +1 toparlar (−5 → −4). Etkisi mütevazı: teklif sıklığı hafif artar (aralık ×(1 − 0.035×itibar)) ve birim fiyat bandına **+%2/yıldız** eklenir — itibar 10'da bant 1,05–1,45× olur, yani yüksek itibarla **piyasanın belirgin üstüne** satılır (kötü teklif gelmez olur). İstatistik sayfasında **Sözleşme İtibarı** paneli aktif verenleri ★ (0–10) ve güncel fiyat bonusuyla listeler; ipucu metni teslimin ödülünü/başarısızlığın bedelini açıklar.

**Teklif üretimi:** son teklif aralığı 300–540sn (itibarla kısalır); araç, verenin tesisinden rastgele; adet = stok tavanının %50–90'ı (min 3); süre = o adedi üretme süresinin ~1,6 katı (tesis başına alt/üst sınırlı); birim fiyat = piyasa × **0,85–1,25** bandı — bazen piyasadan kötü teklif gelir, kabul etmek gerçek bir karardır (popup fiyat farkını ±% olarak renkli gösterir).

**Stok biriktirme:** satış müdürü olan hatlarda OTO SAT düğmesi tıklanarak **duraklatılabilir** (⏸); satış durur, stok birikir, sözleşme stoktan tek tuşla teslim edilir.

**Gem ikramiyesi:** sözleşmelerin ~%25'i gem ikramiyesi taşır (garage 1 / workshop 1–2 / factory 2–3 / giga 3–5); popup ve kartta 💎 olarak görünür, teslimde ödenir. Yüksek risk-ödül: başarısızlıkta **aynı miktar gem ceza olarak gider** (oyuncunun gem'i asla 0'ın altına inmez).

**Gecikme ve ceza:** son teslim geçilirse **gecikme penceresi** başlar (sözleşme süresinin yarısı): ödül karttan canlı izlenerek doğrusal olarak **%50'ye kadar erir** (kart kırmızı nabız atar, ⚠ %X gösterir). Pencere de dolarsa **BAŞARISIZ**: sözleşme bedelinin **%20'si para cezası** + varsa gem ikramiyesi kadar gem + itibar −1.

Tasarım amacı: oto-satış konforuna karşı "biriktir ve topluca sat" kararı; kötü teklifleri reddetmeyi öğrenmek de oyunun parçası.

## 9e. Görsel Tesis Sahnesi (Panorama) + Şirket Adı

Home'un en tepesinde **sabit 96px yükseklikte SVG panorama** (Neon Tech: koyu gövde + tesise özgü neon kontur). Açılan tesisle soldan sağa büyür: garaj (cyan) → atölye testere çatı (lime) → fabrika bacaları (altın) → gigafactory + yanıp sönen ikaz ışığı (mor). Sıradaki kilitli tesis **soluk kesikli siluet + "?"** olarak görünür (merak unsuru); tesis büyüdükçe gökyüzünde yıldız artar. Yükseklik sabit: sayfa düzeni asla oynamaz.

- **Şirket adı:** ilk açılışta popup sorar ("Her efsane bir adla başlar…", 18 karakter), Ayarlar'dan değiştirilebilir; panoramanın **sol üstünde neon altın tabela** olarak yazar. Boş bırakılırsa "Volt Motors".
- Not: Egg Inc. tarzı "içeriğin arkasında izometrik tesis + yarı saydam kartlar" denendi ve **geri alındı** — kart yoğun arayüzde içerik görseli kapatıyor, okunabilirlik/etki dengesi tutmuyor (11.07.2026).

**Kilometre taşı detayları** — kazanılan başarımlar sahneye kalıcı minik objeler ekler (oyuncunun hikâyesi birikir):

| Detay | Koşul |
|---|---|
| Kedi kulübesi + çatısında kedi 😺 | Tam Kadro (allVehicles) |
| Sahada ⚡ reklam totemi | İlk milyon (earned1m) |
| Şirket bayrağı | İş Gücü 150 çalışan (techLegion) |
| Çatıda uydu çanağı | Araştırma Ustası (researchMaster, giga sahnesi) |

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
