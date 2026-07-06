# EV Tycoon

Mobil (portrait) idle/incremental tycoon oyunu. Oyuncu ev garajında elektrikli araç üretimine başlar ve dünyanın en büyük EV üreticisi olmayı hedefler.

- **Tasarım dokümanı:** [GDD.md](GDD.md) — tüm tasarım kararları burada.
- **Oyun kodu:** [ev-tycoon/](ev-tycoon/) — TypeScript + Vite; ileride Capacitor ile Android/iOS.

## Geliştirme

```bash
cd ev-tycoon
npm install
npm run dev      # http://localhost:5188
npm run build    # dist/ üretim çıktısı
```

## Mimari

```
ev-tycoon/src/
  core/config.ts    # tüm denge değerleri (araçlar, maliyetler, research, haberler)
  core/state.ts     # oyun durumu + kayıt/yükleme (localStorage)
  core/formulas.ts  # azalan getiri, fiyat, süre, biçimleme formülleri
  core/engine.ts    # simülasyon (tick), oyuncu eylemleri, offline hesap
  i18n/index.ts     # EN + TR sözlükler
  ui/art.ts         # özel SVG ikon seti (Neon Tech)
  ui/render.ts      # ekranlar, kartlar, modallar
  ui/audio.ts       # sentezlenen ses efektleri (WebAudio)
  ui/ads.ts         # reklam soyutlaması (webde simüle; mobilde AdMob'a bağlanacak)
  main.ts           # giriş: yükleme, offline raporu, ana döngü, otokayıt
```

## Yol haritası

1. ✅ MVP — Home Garage (3 araç, manager/technician, research+claim, haberler, gems, offline, EN/TR)
2. ⬜ Capacitor ile Android paketi (AAB) + AdMob ödüllü reklam entegrasyonu
3. ⬜ Google Play kaydı ve mağaza yayını
4. ⬜ Factory 1 içeriği (Cargo Trike, yeni lokasyon)
5. ⬜ iOS derlemesi ve App Store
