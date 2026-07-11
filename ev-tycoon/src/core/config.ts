// Tüm oyun dengesi bu dosyadadır. GDD.md ile senkron tutulur.

export interface LocationDef {
  id: string;
  nameKey: string;
  unlockCost: number; // 0 = baştan açık
  unlockGems: number;
  /** araç başına, rol başına (teknisyen/temsilci) personel tavanı —
      küçük mekânda az çalışan; her yeni mekânda artar */
  staffCap: number;
  icon: string;
}

export const LOCATIONS: LocationDef[] = [
  { id: 'garage', nameKey: 'loc.garage', unlockCost: 0, unlockGems: 0, staffCap: 6, icon: 'home' },
  { id: 'workshop', nameKey: 'loc.workshop', unlockCost: 75_000, unlockGems: 20, staffCap: 12, icon: 'gear' },
  { id: 'factory', nameKey: 'loc.factory', unlockCost: 5_000_000, unlockGems: 30, staffCap: 20, icon: 'factory' },
  { id: 'gigafactory', nameKey: 'loc.gigafactory', unlockCost: 250_000_000, unlockGems: 40, staffCap: 30, icon: 'giga' },
];

export interface VehicleDef {
  id: string;
  /** i18n anahtarı değil — marka adı, çevrilmez */
  name: string;
  /** i18n anahtarı: araç sınıfı (kick scooter, e-bike...) */
  classKey: string;
  locationId: string;
  unlockCost: number; // 0 = baştan açık
  unlockGems: number; // lisans için gem bedeli
  baseProdTime: number; // saniye
  baseSellTime: number; // saniye
  basePrice: number; // $
  baseStockCap: number;
  techBaseCost: number;
  repBaseCost: number;
  prodManagerCost: number;
  salesManagerCost: number;
  /** SVG ikonunun id'si (art.ts) */
  icon: string;
  accent: string; // vurgu rengi
}

export const VEHICLES: VehicleDef[] = [
  {
    id: 'zipvolt',
    name: 'ZipVolt',
    classKey: 'class.kickscooter',
    locationId: 'garage',
    unlockCost: 0,
    unlockGems: 0,
    baseProdTime: 4,
    baseSellTime: 3,
    basePrice: 12,
    baseStockCap: 20,
    techBaseCost: 25,
    repBaseCost: 20,
    prodManagerCost: 400,
    salesManagerCost: 500,
    icon: 'scooter',
    accent: '#3ef0c8',
  },
  {
    id: 'voltrider',
    name: 'VoltRider',
    classKey: 'class.ebike',
    locationId: 'garage',
    unlockCost: 600,
    unlockGems: 10,
    baseProdTime: 12,
    baseSellTime: 8,
    basePrice: 95,
    baseStockCap: 15,
    techBaseCost: 220,
    repBaseCost: 180,
    prodManagerCost: 3500,
    salesManagerCost: 4200,
    icon: 'ebike',
    accent: '#41b0ff',
  },
  {
    id: 'econoev',
    name: 'Econo EV',
    classKey: 'class.microcar',
    locationId: 'garage',
    unlockCost: 9000,
    unlockGems: 25,
    baseProdTime: 45,
    baseSellTime: 25,
    basePrice: 1100,
    baseStockCap: 10,
    techBaseCost: 2600,
    repBaseCost: 2100,
    prodManagerCost: 40000,
    salesManagerCost: 48000,
    icon: 'microcar',
    accent: '#c8f43e',
  },
  // ---- Workshop (2. mekân) ----
  {
    id: 'trihauler',
    name: 'TriHauler',
    classKey: 'class.cargotrike',
    locationId: 'workshop',
    unlockCost: 35_000,
    unlockGems: 30,
    baseProdTime: 75,
    baseSellTime: 40,
    basePrice: 3400,
    baseStockCap: 12,
    techBaseCost: 7500,
    repBaseCost: 6000,
    prodManagerCost: 130_000,
    salesManagerCost: 160_000,
    icon: 'trike',
    accent: '#ff9d3e',
  },
  {
    id: 'fairwaygo',
    name: 'FairwayGo',
    classKey: 'class.golfcart',
    locationId: 'workshop',
    unlockCost: 180_000,
    unlockGems: 35,
    baseProdTime: 150,
    baseSellTime: 80,
    basePrice: 16_000,
    baseStockCap: 10,
    techBaseCost: 36_000,
    repBaseCost: 29_000,
    prodManagerCost: 640_000,
    salesManagerCost: 770_000,
    icon: 'golfcart',
    accent: '#5eff8f',
  },
  {
    id: 'citypod',
    name: 'CityPod',
    classKey: 'class.nev',
    locationId: 'workshop',
    unlockCost: 900_000,
    unlockGems: 40,
    baseProdTime: 360,
    baseSellTime: 180,
    basePrice: 90_000,
    baseStockCap: 8,
    techBaseCost: 200_000,
    repBaseCost: 160_000,
    prodManagerCost: 3_600_000,
    salesManagerCost: 4_300_000,
    icon: 'citypod',
    accent: '#b06bff',
  },
  // ---- Factory (3. mekân) ----
  {
    id: 'volterra',
    name: 'Volterra',
    classKey: 'class.sedan',
    locationId: 'factory',
    unlockCost: 3_000_000,
    unlockGems: 35,
    baseProdTime: 600,
    baseSellTime: 300,
    basePrice: 450_000,
    baseStockCap: 8,
    techBaseCost: 1_000_000,
    repBaseCost: 800_000,
    prodManagerCost: 18_000_000,
    salesManagerCost: 22_000_000,
    icon: 'sedan',
    accent: '#41b0ff',
  },
  {
    id: 'terravolt',
    name: 'Terravolt',
    classKey: 'class.suv',
    locationId: 'factory',
    unlockCost: 15_000_000,
    unlockGems: 40,
    baseProdTime: 1200,
    baseSellTime: 600,
    basePrice: 2_000_000,
    baseStockCap: 6,
    techBaseCost: 4_400_000,
    repBaseCost: 3_500_000,
    prodManagerCost: 80_000_000,
    salesManagerCost: 96_000_000,
    icon: 'suv',
    accent: '#ff5e9b',
  },
  {
    id: 'haulen',
    name: 'Haulen',
    classKey: 'class.pickup',
    locationId: 'factory',
    unlockCost: 70_000_000,
    unlockGems: 45,
    baseProdTime: 2400,
    baseSellTime: 1200,
    basePrice: 9_000_000,
    baseStockCap: 6,
    techBaseCost: 20_000_000,
    repBaseCost: 16_000_000,
    prodManagerCost: 360_000_000,
    salesManagerCost: 430_000_000,
    icon: 'pickup',
    accent: '#ffd35e',
  },
  // ---- Gigafactory (4. mekân) ----
  {
    id: 'voltvan',
    name: 'VoltVan',
    classKey: 'class.van',
    locationId: 'gigafactory',
    unlockCost: 300_000_000,
    unlockGems: 40,
    baseProdTime: 3600,
    baseSellTime: 1800,
    basePrice: 40_000_000,
    baseStockCap: 6,
    techBaseCost: 88_000_000,
    repBaseCost: 70_000_000,
    prodManagerCost: 1_600_000_000,
    salesManagerCost: 1_900_000_000,
    icon: 'van',
    accent: '#3ef0c8',
  },
  {
    id: 'colossus',
    name: 'Colossus',
    classKey: 'class.truck',
    locationId: 'gigafactory',
    unlockCost: 1_500_000_000,
    unlockGems: 45,
    baseProdTime: 7200,
    baseSellTime: 3600,
    basePrice: 180_000_000,
    baseStockCap: 5,
    techBaseCost: 400_000_000,
    repBaseCost: 320_000_000,
    prodManagerCost: 7_200_000_000,
    salesManagerCost: 8_600_000_000,
    icon: 'truck',
    accent: '#ff9d3e',
  },
  {
    id: 'transitron',
    name: 'Transitron',
    classKey: 'class.bus',
    locationId: 'gigafactory',
    unlockCost: 7_000_000_000,
    unlockGems: 50,
    baseProdTime: 14_400,
    baseSellTime: 7200,
    basePrice: 800_000_000,
    baseStockCap: 4,
    techBaseCost: 1_760_000_000,
    repBaseCost: 1_400_000_000,
    prodManagerCost: 32_000_000_000,
    salesManagerCost: 38_000_000_000,
    icon: 'bus',
    accent: '#c8f43e',
  },
];

// Personel eğrisi: Hız = 1 + (SMAX-1) * (1 - e^(-n/TAU))  → azalan getiri
export const STAFF_SMAX = 4;
export const STAFF_TAU = 8;
// 1,35'ten indirildi: tavanlar 20-30'a çıkınca üstel artış geç oyunda
// tam kadroyu ulaşılamaz kılıyordu (1,35^29 ≈ ×6000 → 1,30^29 ≈ ×2000)
export const STAFF_COST_GROWTH = 1.3;
// Aracın KENDİ tesisinin tavanı üzerindeki "uzman kadro" (yeni tesislerin
// açtığı ek slotlar) çok daha dik pahalanır: eski araca dönüş kısa vadeli
// bir köprü olsun, uzun erimli kâr motoru olmasın (GDD: köprü mekaniği)
export const OVERSTAFF_GROWTH = 1.75;

// Claim / Research
export const CLAIM_DURATION = 240; // saniye
export const CLAIM_REWARD = 5; // RP (baz — research ile artar)

/**
 * Research etki türleri:
 *  - prodTime / sellTime / price / cap / claimTime / claimMult → çarpımsal (val^seviye)
 *  - claimAdd / batch → toplamsal (val × seviye)
 *  - offline → özel: FX.offlineHours[seviye]
 */
export type ResearchFx =
  | 'prodTime' | 'sellTime' | 'price' | 'cap'
  | 'claimTime' | 'claimAdd' | 'claimMult'
  | 'batch' | 'offline' | 'autoclaim'
  /** retrofit: yalnızca targetLocationId'deki araçların üretim VE satış
      süresini çarpar — "bir önceki tesisi modernize et" araştırmaları */
  | 'retrofit';

export interface ResearchDef {
  id: string;
  /** bu mekân açık olmalı (haberlerle aynı mantık: tier ile büyür) */
  locationId: string;
  maxLevel: number;
  costs: number[]; // RP, seviye başına
  icon: string;
  fx: ResearchFx;
  val: number;
  /** yalnızca fx='retrofit' için: etkilenen tesis */
  targetLocationId?: string;
}

export const RESEARCH: ResearchDef[] = [
  // ---- Katman 1 — Garage ----
  // Ar-Ge personeli merdiveni: Mucit otomatik claim'i açar, sonraki
  // tesislerdeki personalar claim'i iyileştirir (süre/çarpan).
  // Mucit bilinçli olarak UCUZ (ilk 15-20 dk): otomasyon erken konfor,
  // tempo sonrasında süre/ödül araştırmalarıyla ayarlanır.
  { id: 'inventor', locationId: 'garage', maxLevel: 1, costs: [25], icon: 'person', fx: 'autoclaim', val: 1 },
  { id: 'assembly', locationId: 'garage', maxLevel: 3, costs: [10, 30, 80], icon: 'gear', fx: 'prodTime', val: 0.9 },
  { id: 'marketing', locationId: 'garage', maxLevel: 3, costs: [10, 30, 80], icon: 'megaphone', fx: 'price', val: 1.15 },
  { id: 'tinker', locationId: 'garage', maxLevel: 2, costs: [15, 45], icon: 'wrench', fx: 'claimAdd', val: 3 },
  { id: 'warehouse', locationId: 'garage', maxLevel: 2, costs: [20, 60], icon: 'box', fx: 'cap', val: 1.5 },
  { id: 'offline', locationId: 'garage', maxLevel: 2, costs: [25, 70], icon: 'moon', fx: 'offline', val: 0 },
  { id: 'quickclaim', locationId: 'garage', maxLevel: 1, costs: [30], icon: 'bolt', fx: 'claimTime', val: 0.75 },
  { id: 'batch', locationId: 'garage', maxLevel: 1, costs: [120], icon: 'stack', fx: 'batch', val: 1 },
  // ---- Katman 2 — Workshop ----
  { id: 'rndassistant', locationId: 'workshop', maxLevel: 1, costs: [350], icon: 'person', fx: 'claimTime', val: 0.75 },
  { id: 'reverseeng', locationId: 'workshop', maxLevel: 2, costs: [80, 180], icon: 'flask', fx: 'claimAdd', val: 5 },
  { id: 'logistics', locationId: 'workshop', maxLevel: 2, costs: [90, 200], icon: 'cart', fx: 'sellTime', val: 0.85 },
  { id: 'robotics', locationId: 'workshop', maxLevel: 2, costs: [120, 260], icon: 'gear', fx: 'prodTime', val: 0.9 },
  { id: 'bulkstorage', locationId: 'workshop', maxLevel: 1, costs: [150], icon: 'box', fx: 'cap', val: 1.5 },
  { id: 'garagekit', locationId: 'workshop', maxLevel: 2, costs: [150, 350], icon: 'wrench', fx: 'retrofit', val: 0.85, targetLocationId: 'garage' },
  // ---- Katman 3 — Factory ----
  { id: 'rndmanager', locationId: 'factory', maxLevel: 1, costs: [900], icon: 'tie', fx: 'claimMult', val: 1.5 },
  { id: 'rdlab', locationId: 'factory', maxLevel: 2, costs: [350, 700], icon: 'flask', fx: 'claimTime', val: 0.8 },
  { id: 'brandpower', locationId: 'factory', maxLevel: 2, costs: [400, 800], icon: 'megaphone', fx: 'price', val: 1.2 },
  { id: 'automation', locationId: 'factory', maxLevel: 2, costs: [500, 1000], icon: 'gear', fx: 'prodTime', val: 0.9 },
  { id: 'gigabatch', locationId: 'factory', maxLevel: 1, costs: [900], icon: 'stack', fx: 'batch', val: 1 },
  { id: 'workshopkit', locationId: 'factory', maxLevel: 2, costs: [600, 1200], icon: 'wrench', fx: 'retrofit', val: 0.85, targetLocationId: 'workshop' },
  // ---- Katman 4 — Gigafactory ----
  { id: 'singularity', locationId: 'gigafactory', maxLevel: 1, costs: [4500], icon: 'tie', fx: 'claimMult', val: 2 },
  { id: 'quantumclaim', locationId: 'gigafactory', maxLevel: 1, costs: [2000], icon: 'bolt', fx: 'claimMult', val: 2 },
  { id: 'aicore', locationId: 'gigafactory', maxLevel: 2, costs: [2500, 5000], icon: 'gear', fx: 'prodTime', val: 0.85 },
  { id: 'globalbrand', locationId: 'gigafactory', maxLevel: 2, costs: [3000, 6000], icon: 'megaphone', fx: 'price', val: 1.25 },
  { id: 'hyperlogistics', locationId: 'gigafactory', maxLevel: 2, costs: [2800, 5600], icon: 'cart', fx: 'sellTime', val: 0.8 },
  { id: 'factorykit', locationId: 'gigafactory', maxLevel: 2, costs: [3500, 7000], icon: 'wrench', fx: 'retrofit', val: 0.85, targetLocationId: 'factory' },
];

// Offline tavanı (offline research seviyesine göre saat)
export const FX = {
  offlineHours: [8, 12, 24], // seviye 0/1/2
};

// Gems
export const GEM_COST_INSTANT_PROD = 1;
export const GEM_COST_INSTANT_CLAIM = 3;
export const GEM_COST_BOOST = 10;
export const BOOST_HOURS = 4;
export const BOOST_MULT = 2;
export const STARTING_GEMS = 5;

// Reklam ödülleri
export const AD_REWARD_GEMS = 5;
export const TIME_WARP_MINUTES = 15;

export interface AchievementDef {
  id: string;
  gems: number;
  check: (s: import('./state').GameState) => boolean;
}

// TASARIM KURALI: Reklamsız kazanılabilir toplam gem (başlangıç +
// "allVehicles" HARİÇ başarımlar), kümülatif gem giderlerinin (lisanslar +
// tesis açılışları) en az 1,5 katı olmalı. Böylece çok sabırlı bir oyuncu
// hiç video izlemeden her şeyi açabilir.
// Güncel doğrulama:
//   Giderler: lisanslar garaj 35 + atölye 105 + fabrika 120 + giga 135 = 395
//             tesis açılışları 20+30+40 = 90 → toplam 485 → gerek 727,5
//   Havuz: başlangıç 5 + başarımlar 731 = 736 ≥ 727,5 ✓
//
// TEMPO: Eşikler ×10 büyür (100→1K→…→10M satış; $10K→…→$100B kazanç).
// Erken oyunda başarımlar dakikalar içinde, geç oyunda günler arayla gelir.
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstSale', gems: 4, check: (s) => s.stats.totalSold >= 1 },
  { id: 'firstTech', gems: 4, check: (s) => Object.values(s.lines).some((l) => l.technicians >= 1) },
  { id: 'firstManager', gems: 5, check: (s) => Object.values(s.lines).some((l) => l.prodManager || l.salesManager) },
  { id: 'firstResearch', gems: 3, check: (s) => Object.values(s.research).some((v) => v >= 1) },
  { id: 'sold100', gems: 5, check: (s) => s.stats.totalSold >= 100 },
  { id: 'techSquad', gems: 5, check: (s) => Object.values(s.lines).reduce((n, l) => n + l.technicians, 0) >= 10 },
  { id: 'earned10k', gems: 5, check: (s) => s.stats.totalEarned >= 10_000 },
  { id: 'sold1000', gems: 10, check: (s) => s.stats.totalSold >= 1000 },
  { id: 'earned100k', gems: 10, check: (s) => s.stats.totalEarned >= 100_000 },
  { id: 'workshopOpen', gems: 15, check: (s) => !!s.locations['workshop'] },
  { id: 'researchAdept', gems: 15, check: (s) => Object.values(s.research).reduce((a, b) => a + b, 0) >= 10 },
  { id: 'sold10k', gems: 20, check: (s) => s.stats.totalSold >= 10_000 },
  { id: 'earned1m', gems: 20, check: (s) => s.stats.totalEarned >= 1_000_000 },
  // techArmy eşiği toplam kapasitenin altında kalmalı (garaj 18 + atölye 36 = 54)
  { id: 'techArmy', gems: 15, check: (s) => Object.values(s.lines).reduce((n, l) => n + l.technicians, 0) >= 40 },
  { id: 'autoEmpire', gems: 15, check: (s) => Object.values(s.lines).filter((l) => l.unlocked && l.prodManager && l.salesManager).length >= 4 },
  { id: 'factoryOpen', gems: 25, check: (s) => !!s.locations['factory'] },
  { id: 'sold100k', gems: 25, check: (s) => s.stats.totalSold >= 100_000 },
  { id: 'earned10m', gems: 30, check: (s) => s.stats.totalEarned >= 10_000_000 },
  { id: 'researchVeteran', gems: 30, check: (s) => Object.values(s.research).reduce((a, b) => a + b, 0) >= 25 },
  // techLegion: toplam personel (teknisyen+temsilci); kapasite 54×2+120+180=…
  { id: 'techLegion', gems: 30, check: (s) => Object.values(s.lines).reduce((n, l) => n + l.technicians + l.salesReps, 0) >= 150 },
  { id: 'autoNation', gems: 30, check: (s) => Object.values(s.lines).filter((l) => l.unlocked && l.prodManager && l.salesManager).length >= 9 },
  { id: 'gigaOpen', gems: 40, check: (s) => !!s.locations['gigafactory'] },
  { id: 'earned100m', gems: 40, check: (s) => s.stats.totalEarned >= 100_000_000 },
  { id: 'sold1m', gems: 40, check: (s) => s.stats.totalSold >= 1_000_000 },
  { id: 'earned1b', gems: 50, check: (s) => s.stats.totalEarned >= 1_000_000_000 },
  { id: 'researchMaster', gems: 50, check: (s) => RESEARCH.every((r) => (s.research[r.id] ?? 0) >= r.maxLevel) },
  { id: 'sold10m', gems: 60, check: (s) => s.stats.totalSold >= 10_000_000 },
  { id: 'earned10b', gems: 60, check: (s) => s.stats.totalEarned >= 10_000_000_000 },
  { id: 'earned100b', gems: 70, check: (s) => s.stats.totalEarned >= 100_000_000_000 },
  { id: 'allVehicles', gems: 10, check: (s) => Object.values(s.lines).every((l) => l.unlocked) },
];

// Haber havuzu — FAZ sistemi (GDD 9): kayan bant her zaman açık olan
// EN BÜYÜK tesisin düzleminden beslenir; alt fazların haberleri havuzdan
// çıkar. locationId: fazı belirler. vehicleId: o araç açık olmalı.
export interface NewsDef {
  key: string;
  locationId: string;
  vehicleId: string | null;
}

export const NEWS: NewsDef[] = [
  // Katman 1 — Home Garage: mahalle mizahı
  { key: 'news.g1', locationId: 'garage', vehicleId: null },
  { key: 'news.g2', locationId: 'garage', vehicleId: null },
  { key: 'news.g3', locationId: 'garage', vehicleId: null },
  { key: 'news.g4', locationId: 'garage', vehicleId: null },
  { key: 'news.g5', locationId: 'garage', vehicleId: null },
  { key: 'news.g6', locationId: 'garage', vehicleId: null },
  { key: 'news.g7', locationId: 'garage', vehicleId: null },
  { key: 'news.g8', locationId: 'garage', vehicleId: null },
  { key: 'news.zipvolt1', locationId: 'garage', vehicleId: 'zipvolt' },
  { key: 'news.zipvolt2', locationId: 'garage', vehicleId: 'zipvolt' },
  { key: 'news.voltrider1', locationId: 'garage', vehicleId: 'voltrider' },
  { key: 'news.voltrider2', locationId: 'garage', vehicleId: 'voltrider' },
  { key: 'news.econoev1', locationId: 'garage', vehicleId: 'econoev' },
  { key: 'news.econoev2', locationId: 'garage', vehicleId: 'econoev' },
  // Katman 2 — Workshop: şehir/belediye
  { key: 'news.w1', locationId: 'workshop', vehicleId: null },
  { key: 'news.w2', locationId: 'workshop', vehicleId: null },
  { key: 'news.w3', locationId: 'workshop', vehicleId: null },
  { key: 'news.w4', locationId: 'workshop', vehicleId: null },
  { key: 'news.w5', locationId: 'workshop', vehicleId: null },
  { key: 'news.w6', locationId: 'workshop', vehicleId: null },
  { key: 'news.w7', locationId: 'workshop', vehicleId: null },
  { key: 'news.w8', locationId: 'workshop', vehicleId: null },
  { key: 'news.w9', locationId: 'workshop', vehicleId: null },
  { key: 'news.trihauler1', locationId: 'workshop', vehicleId: 'trihauler' },
  { key: 'news.fairwaygo1', locationId: 'workshop', vehicleId: 'fairwaygo' },
  { key: 'news.citypod1', locationId: 'workshop', vehicleId: 'citypod' },
  // Katman 3 — Factory: sektörel, görece ciddi
  { key: 'news.f1', locationId: 'factory', vehicleId: null },
  { key: 'news.f2', locationId: 'factory', vehicleId: null },
  { key: 'news.f3', locationId: 'factory', vehicleId: null },
  { key: 'news.f4', locationId: 'factory', vehicleId: null },
  { key: 'news.f5', locationId: 'factory', vehicleId: null },
  { key: 'news.f6', locationId: 'factory', vehicleId: null },
  { key: 'news.f7', locationId: 'factory', vehicleId: null },
  { key: 'news.f8', locationId: 'factory', vehicleId: null },
  { key: 'news.f9', locationId: 'factory', vehicleId: null },
  { key: 'news.volterra1', locationId: 'factory', vehicleId: 'volterra' },
  { key: 'news.terravolt1', locationId: 'factory', vehicleId: 'terravolt' },
  { key: 'news.haulen1', locationId: 'factory', vehicleId: 'haulen' },
  // Katman 4 — Gigafactory: kurumsal parodi (telifsiz)
  { key: 'news.x1', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x2', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x3', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x4', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x5', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x6', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x7', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x8', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.x9', locationId: 'gigafactory', vehicleId: null },
  { key: 'news.voltvan1', locationId: 'gigafactory', vehicleId: 'voltvan' },
  { key: 'news.colossus1', locationId: 'gigafactory', vehicleId: 'colossus' },
  { key: 'news.transitron1', locationId: 'gigafactory', vehicleId: 'transitron' },
];

// ---- Haber olayları (popup + geçici oynanış etkisi) ----

/** buyout: süresiz ANLIK olay — stoğu ≥%80 dolu bir aracın tüm stoğu
    anında satılır (yatırımcı ziyareti). Yalnızca uygun araç varken çıkar.
    gift: süresiz ANLIK olay — gizemli ziyaretçi 1-4 gem bırakır. */
export type EventKind = 'prodSpeed' | 'sellSpeed' | 'price' | 'buyout' | 'gift';

export interface NewsEventDef {
  id: string;
  /** olayın çıkabilmesi için açık olması gereken mekân */
  locationId: string;
  /** null → tüm araçlar; dolu → yalnızca o araç (ve araç açıksa çıkar) */
  vehicleId: string | null;
  kind: EventKind;
  mult: number;
  durationSec: number;
  positive: boolean;
}

export const NEWS_EVENTS: NewsEventDef[] = [
  // ---- Katman 1 — Home Garage: mahalle olayları ----
  { id: 'trash_batteries', locationId: 'garage', vehicleId: null, kind: 'prodSpeed', mult: 1.3, durationSec: 90, positive: true },
  { id: 'neighbor_cable', locationId: 'garage', vehicleId: null, kind: 'prodSpeed', mult: 1.2, durationSec: 120, positive: true },
  { id: 'kids_race', locationId: 'garage', vehicleId: null, kind: 'sellSpeed', mult: 1.4, durationSec: 90, positive: true },
  { id: 'garage_sale', locationId: 'garage', vehicleId: null, kind: 'price', mult: 1.25, durationSec: 90, positive: true },
  { id: 'investor_buyout', locationId: 'garage', vehicleId: null, kind: 'buyout', mult: 1, durationSec: 0, positive: true },
  { id: 'stranger_gems', locationId: 'garage', vehicleId: null, kind: 'gift', mult: 1, durationSec: 0, positive: true },
  { id: 'lucky_cat', locationId: 'garage', vehicleId: null, kind: 'gift', mult: 1, durationSec: 0, positive: true },
  { id: 'midnight_note', locationId: 'garage', vehicleId: null, kind: 'gift', mult: 1, durationSec: 0, positive: true },
  { id: 'fuse_blown', locationId: 'garage', vehicleId: null, kind: 'prodSpeed', mult: 0.85, durationSec: 60, positive: false },
  { id: 'neighbor_complaint', locationId: 'garage', vehicleId: null, kind: 'sellSpeed', mult: 0.9, durationSec: 60, positive: false },
  { id: 'viral_zipvolt', locationId: 'garage', vehicleId: 'zipvolt', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_voltrider', locationId: 'garage', vehicleId: 'voltrider', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_econoev', locationId: 'garage', vehicleId: 'econoev', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  // ---- Katman 2 — Workshop: şehir/belediye olayları ----
  { id: 'mayor_visit', locationId: 'workshop', vehicleId: null, kind: 'price', mult: 1.3, durationSec: 90, positive: true },
  { id: 'city_parking', locationId: 'workshop', vehicleId: null, kind: 'sellSpeed', mult: 1.4, durationSec: 120, positive: true },
  { id: 'battery_deal', locationId: 'workshop', vehicleId: null, kind: 'prodSpeed', mult: 1.3, durationSec: 90, positive: true },
  { id: 'collector_buyout', locationId: 'workshop', vehicleId: null, kind: 'buyout', mult: 1, durationSec: 0, positive: true },
  { id: 'subsidy', locationId: 'workshop', vehicleId: null, kind: 'price', mult: 1.25, durationSec: 120, positive: true },
  { id: 'grid_maintenance', locationId: 'workshop', vehicleId: null, kind: 'prodSpeed', mult: 0.85, durationSec: 60, positive: false },
  { id: 'market_dip', locationId: 'workshop', vehicleId: null, kind: 'price', mult: 0.85, durationSec: 60, positive: false },
  { id: 'viral_trihauler', locationId: 'workshop', vehicleId: 'trihauler', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_fairwaygo', locationId: 'workshop', vehicleId: 'fairwaygo', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'viral_citypod', locationId: 'workshop', vehicleId: 'citypod', kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  // ---- Katman 3 — Factory: sektörel olaylar ----
  { id: 'export_deal', locationId: 'factory', vehicleId: null, kind: 'price', mult: 1.3, durationSec: 120, positive: true },
  { id: 'fleet_order', locationId: 'factory', vehicleId: null, kind: 'sellSpeed', mult: 1.4, durationSec: 120, positive: true },
  { id: 'chip_shortage', locationId: 'factory', vehicleId: null, kind: 'prodSpeed', mult: 0.85, durationSec: 60, positive: false },
  // ---- Katman 4 — Gigafactory: kurumsal parodi ----
  { id: 'tusk_praise', locationId: 'gigafactory', vehicleId: null, kind: 'price', mult: 1.5, durationSec: 90, positive: true },
  { id: 'rocket_stunt', locationId: 'gigafactory', vehicleId: null, kind: 'sellSpeed', mult: 1.5, durationSec: 90, positive: true },
  { id: 'ai_tantrum', locationId: 'gigafactory', vehicleId: null, kind: 'prodSpeed', mult: 0.85, durationSec: 60, positive: false },
];

export const EVENT_GAP_MIN = 240; // sn — iki olay arası en az
export const EVENT_GAP_MAX = 420; // sn — en çok
export const EVENT_POSITIVE_CHANCE = 0.75;

// ---- Banka / Kredi (GDD: taksit + iflas modeli) ----

export interface LoanDef {
  id: string;
  /** bu tesis açık olmalı — tesis açıldıkça yeni kredi teklifi belirir */
  locationId: string;
  principal: number;
  /** toplam faiz oranı (0.3 = %30); geri ödeme = anapara × (1+faiz) */
  rate: number;
  installments: number;
  /** taksit aralığı (sn; offline'da da işler, tavana kadar) */
  intervalSec: number;
}

// Her tesiste 2 seçenek: temkinli küçük kredi + daha büyük/yüksek faizli
// büyüme kredisi (ikisi aynı anda çekilebilir; HUD toplam yükü gösterir)
export const LOANS: LoanDef[] = [
  { id: 'loan_garage', locationId: 'garage', principal: 600, rate: 0.3, installments: 12, intervalSec: 90 },
  { id: 'loan_garage2', locationId: 'garage', principal: 2500, rate: 0.35, installments: 16, intervalSec: 120 },
  { id: 'loan_workshop', locationId: 'workshop', principal: 60_000, rate: 0.35, installments: 12, intervalSec: 120 },
  { id: 'loan_workshop2', locationId: 'workshop', principal: 250_000, rate: 0.4, installments: 16, intervalSec: 180 },
  { id: 'loan_factory', locationId: 'factory', principal: 4_000_000, rate: 0.4, installments: 16, intervalSec: 180 },
  { id: 'loan_factory2', locationId: 'factory', principal: 20_000_000, rate: 0.45, installments: 20, intervalSec: 240 },
  { id: 'loan_giga', locationId: 'gigafactory', principal: 400_000_000, rate: 0.5, installments: 20, intervalSec: 240 },
  { id: 'loan_giga2', locationId: 'gigafactory', principal: 2_000_000_000, rate: 0.55, installments: 24, intervalSec: 300 },
];

/** bakiye eksideyken (yalnızca AKTİF oyunda) iflasa kalan süre */
export const BANKRUPTCY_GRACE = 300; // sn

/**
 * Erken kapatma "dosya masrafı" (ana paranın oranı).
 * Kapatma bedeli = kalan anapara + fee×anapara → taksitleri beklemekten
 * (faiz dahil) avantajlıdır ama çek-kapat döngüsü her seferinde
 * fee kadar zarar ettirir.
 */
export const LOAN_REPAY_FEE = 0.08;

// ---- Sözleşme sistemi (GDD 9d) ----

export interface ContractIssuerDef {
  id: string;
  locationId: string;
}

/** Tesis başına 2 sözleşme veren. AKTİF verenler: açık olan SON 2 tesisin
    verenleri (fabrika açılınca garaj verenleri artık teklif göndermez). */
export const CONTRACT_ISSUERS: ContractIssuerDef[] = [
  { id: 'neighbor', locationId: 'garage' },
  { id: 'pizzeria', locationId: 'garage' },
  { id: 'municipality', locationId: 'workshop' },
  { id: 'courierco', locationId: 'workshop' },
  { id: 'dealer', locationId: 'factory' },
  { id: 'rentacar', locationId: 'factory' },
  { id: 'elektrania', locationId: 'gigafactory' },
  { id: 'zappistan', locationId: 'gigafactory' },
];

/** Teklif aralığı (sn) — itibar sıklığı artırır (aşağıdaki çarpanla) */
export const CONTRACT_GAP_MIN = 300;
export const CONTRACT_GAP_MAX = 540;
/** rep başına aralık kısalması (rep 10 → %35 daha sık) */
export const CONTRACT_REP_GAP_FACTOR = 0.035;
/** Birim fiyat bandı: piyasanın [0.85, 1.25]'i; rep başına +0.015 kayar */
export const CONTRACT_PRICE_MIN = 0.85;
export const CONTRACT_PRICE_MAX = 1.25;
export const CONTRACT_REP_PRICE_BONUS = 0.015;
export const CONTRACT_REP_CAP = 10;
/** Gecikme penceresi = sürenin bu oranı; ödül bu pencere boyunca %100→%50 erir */
export const CONTRACT_DELAY_RATIO = 0.5;
export const CONTRACT_DECAY_FLOOR = 0.5;
/** Tam başarısızlıkta ceza: sözleşme toplam değerinin oranı */
export const CONTRACT_FAIL_PENALTY = 0.2;
/** Aynı anda en fazla aktif sözleşme (veren başına 1) */
export const CONTRACT_MAX_ACTIVE = 2;
/** Tesise göre sözleşme süresi aralığı (sn) */
export const CONTRACT_DURATION: Record<string, [number, number]> = {
  garage: [480, 900],
  workshop: [900, 1800],
  factory: [1800, 3600],
  gigafactory: [3600, 7200],
};

export const SAVE_KEY = 'evtycoon_save_v1';
export const SAVE_VERSION = 1;
export const AUTOSAVE_INTERVAL = 10; // saniye
export const OFFLINE_MIN_SECONDS = 30;
