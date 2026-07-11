import { LOCATIONS, SAVE_KEY, SAVE_VERSION, STARTING_GEMS, VEHICLES } from './config';
import { clearNative, mirrorToNative } from './storage';
import { LANGS } from '../i18n';
import type { Lang } from '../i18n';

export interface LineState {
  unlocked: boolean;
  stock: number;
  producing: boolean; // manuel üretim devam ediyor
  prodElapsed: number; // saniye
  selling: boolean; // manuel satış devam ediyor
  sellElapsed: number;
  technicians: number;
  salesReps: number;
  prodManager: boolean;
  salesManager: boolean;
  totalSold: number;
  totalProduced: number;
  /** oyuncu oto-satışı duraklatıp stok biriktiriyor (sözleşmeler için) */
  sellPaused: boolean;
  /** bu hattın toplam satış geliri (ciro) */
  revenue: number;
  /** bu hatta yapılan para harcaması (lisans + personel + müdürler) */
  spent: number;
}

export interface ActiveContract {
  issuerId: string;
  vehicleId: string;
  qty: number;
  /** teklif anında sabitlenen birim fiyat */
  unitPrice: number;
  /** son teslim (epoch ms); sonrasında ödül erimeye başlar */
  deadline: number;
  /** gecikme penceresinin sonu (epoch ms); geçilirse başarısız + ceza */
  delayUntil: number;
  /** başarıda ekstra gem; başarısızlıkta aynı miktar gem cezası (taban 0) */
  gemBonus: number;
}

export interface ActiveLoan {
  defId: string;
  /** kalan taksit sayısı */
  remaining: number;
  /** sonraki taksite kalan saniye */
  nextIn: number;
  /** taksit tutarı */
  installment: number;
}

export interface GameState {
  version: number;
  money: number;
  gems: number;
  rp: number; // research points
  /** aktif krediler */
  loans: ActiveLoan[];
  /** aktif sözleşmeler */
  contracts: ActiveContract[];
  /** sözleşme verenlerle itibar (verenId -> 0..10, bağımsız) */
  contractRep: Record<string, number>;
  /** bir sonraki sözleşme teklifine kalan oyun-içi saniye */
  nextContractIn: number;
  /** hammadde deposu: id -> adet */
  materials: Record<string, number>;
  /** hammadde fiyat çarpanları (dalgalı piyasa): id -> 0.55..1.75 */
  matMult: Record<string, number>;
  /** bir sonraki fiyat dalgalanma adımına kalan sn */
  nextMatDrift: number;
  /** Tedarik Müdürü: depo azalınca +%10 primle otomatik alım */
  supplyManager: boolean;
  /** bakiye eksideyken aktif oyunda geçen süre (iflas sayacı, sn) */
  debtTimer: number;
  lines: Record<string, LineState>;
  /** mekân kilitleri: id -> açık mı */
  locations: Record<string, boolean>;
  research: Record<string, number>; // id -> seviye
  claimElapsed: number;
  boostUntil: number; // epoch ms; ×2 gelir boostunun bitişi
  /** aktif haber olayı (yoksa null) */
  activeEvent: { id: string; until: number } | null;
  /** bir sonraki haber olayına kalan oyun-içi saniye */
  nextEventIn: number;
  achievements: string[];
  stats: { totalEarned: number; totalProduced: number; totalSold: number; totalSpent: number };
  /** toplam oynanmış süre (offline dahil), sn — grafik x ekseni */
  playedSec: number;
  /**
   * Finansal zaman çizelgesi (adaptif örnekleme): en fazla ~120 örnek;
   * dolunca her 2. nokta atılır ve örnekleme aralığı ikiye katlanır.
   * Örnek: [oynanmışSn, kümülatifGelir, kümülatifGider]
   */
  chart: { int: number; d: Array<[number, number, number]> };
  settings: { lang: Lang; sound: boolean; music: boolean };
  /** oyuncunun şirket adı (ilk açılış popup'ında sorulur) */
  companyName: string;
  /** öğretici adımı: 0 = hikâye bekliyor, 1..N = adımlar, 99 = bitti */
  tutStep: number;
  lastSeen: number; // epoch ms
  createdAt: number;
}

export function newLine(unlocked: boolean): LineState {
  return {
    unlocked,
    stock: 0,
    producing: false,
    prodElapsed: 0,
    selling: false,
    sellElapsed: 0,
    technicians: 0,
    salesReps: 0,
    prodManager: false,
    salesManager: false,
    totalSold: 0,
    totalProduced: 0,
    sellPaused: false,
    revenue: 0,
    spent: 0,
  };
}

export function newGame(lang: Lang): GameState {
  const lines: Record<string, LineState> = {};
  for (const v of VEHICLES) lines[v.id] = newLine(v.unlockCost === 0);
  const locations: Record<string, boolean> = {};
  for (const l of LOCATIONS) locations[l.id] = l.unlockCost === 0;
  return {
    version: SAVE_VERSION,
    money: 0,
    gems: STARTING_GEMS,
    rp: 0,
    loans: [],
    contracts: [],
    contractRep: {},
    nextContractIn: 240, // ilk teklif ~4. dakikada
    materials: { steel: 60, aluminum: 0, chip: 0, lithium: 0 },
    matMult: { steel: 1, aluminum: 1, chip: 1, lithium: 1 },
    nextMatDrift: 20,
    supplyManager: false,
    debtTimer: 0,
    lines,
    locations,
    research: {},
    claimElapsed: 0,
    boostUntil: 0,
    activeEvent: null,
    nextEventIn: 180, // ilk olay ~3. dakikada

    achievements: [],
    stats: { totalEarned: 0, totalProduced: 0, totalSold: 0, totalSpent: 0 },
    playedSec: 0,
    chart: { int: 10, d: [[0, 0, 0]] },
    settings: { lang, sound: true, music: true },
    companyName: '',
    tutStep: 0,
    lastSeen: Date.now(),
    createdAt: Date.now(),
  };
}

// Sıfırlama sonrası beforeunload/visibilitychange kayıtları eski durumu
// geri yazmasın diye kalıcı kapatma bayrağı
let wiped = false;

export function saveGame(s: GameState): void {
  if (wiped) return;
  s.lastSeen = Date.now();
  try {
    const json = JSON.stringify(s);
    localStorage.setItem(SAVE_KEY, json);
    mirrorToNative(json); // Android'de kalıcı yedek (WebView localStorage silinebilir)
  } catch {
    // depolama dolu/engelli — sessizce geç
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (typeof s.version !== 'number' || !s.lines) return null;
    // Bozuk veya araç listesinde olmayan hat kayıtlarını at — aşağıda
    // gerçek araçlar tazeden oluşturulur (bozuk kayıt tüm oyunu kilitlemesin)
    for (const k of Object.keys(s.lines)) {
      if (!s.lines[k] || !VEHICLES.some((v) => v.id === k)) delete s.lines[k];
    }
    // İleride eklenen araçlar/mekânlar eski kayıtlarda eksik olabilir
    for (const v of VEHICLES) {
      if (!s.lines[v.id]) s.lines[v.id] = newLine(v.unlockCost === 0);
    }
    if (!s.locations) s.locations = {};
    for (const l of LOCATIONS) {
      if (s.locations[l.id] === undefined) s.locations[l.id] = l.unlockCost === 0;
    }
    // Personel tavanı eklenmeden önceki kayıtlar tavanın üstünde olabilir;
    // ciro/harcama alanları da eski kayıtlarda eksik olabilir.
    // Tavan: açık en büyük tesisin tavanı (tüm araçlara uygulanır)
    let maxCap = 6;
    for (const l of LOCATIONS) {
      if (s.locations[l.id] && l.staffCap > maxCap) maxCap = l.staffCap;
    }
    for (const v of VEHICLES) {
      const line = s.lines[v.id];
      line.technicians = Math.min(line.technicians, maxCap);
      line.salesReps = Math.min(line.salesReps, maxCap);
      if (typeof line.revenue !== 'number') line.revenue = 0;
      if (typeof line.spent !== 'number') line.spent = 0;
    }
    if (!LANGS.includes(s.settings.lang)) s.settings.lang = 'en';
    // Müzik ayarı eski kayıtlarda yok: sesi kapatan oyuncuya müzik de açılmasın
    if (typeof s.settings.music !== 'boolean') s.settings.music = s.settings.sound;
    // Şirket adı eski kayıtlarda yok: boş bırak, açılışta popup sorar
    if (typeof s.companyName !== 'string') s.companyName = '';
    // Öğretici bu alandan önceki kayıtlarda yok: mevcut oyuncuyu rahatsız etme
    if (typeof s.tutStep !== 'number') s.tutStep = 99;
    // Banka alanları eski kayıtlarda yok
    if (!Array.isArray(s.loans)) s.loans = [];
    if (typeof s.debtTimer !== 'number') s.debtTimer = 0;
    // Sözleşme alanları eski kayıtlarda yok
    if (!Array.isArray(s.contracts)) s.contracts = [];
    if (!s.contractRep) s.contractRep = {};
    if (typeof s.nextContractIn !== 'number') s.nextContractIn = 240;
    for (const c of s.contracts) {
      if (typeof c.gemBonus !== 'number') c.gemBonus = 0;
    }
    // Hammadde alanları eski kayıtlarda yok: başlangıç paketi ver ki
    // mevcut hatlar anında durmasın (oyuncu sistemi tanıyana kadar yeter)
    if (!s.materials) s.materials = { steel: 500, aluminum: 200, chip: 60, lithium: 20 };
    if (!s.matMult) s.matMult = { steel: 1, aluminum: 1, chip: 1, lithium: 1 };
    if (typeof s.nextMatDrift !== 'number') s.nextMatDrift = 20;
    if (typeof s.supplyManager !== 'boolean') s.supplyManager = false;
    for (const v of VEHICLES) {
      if (typeof s.lines[v.id].sellPaused !== 'boolean') s.lines[v.id].sellPaused = false;
    }
    // Finansal grafik alanları eski kayıtlarda yok: mevcut toplamlardan tohumla
    if (typeof s.stats.totalSpent !== 'number') {
      s.stats.totalSpent = Object.values(s.lines).reduce((a, l) => a + (l.spent || 0), 0);
    }
    if (typeof s.playedSec !== 'number') s.playedSec = 0;
    if (!s.chart || !Array.isArray(s.chart.d) || s.chart.d.length === 0) {
      s.chart = { int: 10, d: [[s.playedSec, s.stats.totalEarned, s.stats.totalSpent]] };
    }
    // Eski kayıtlar için haber olayı alanları
    if (typeof s.nextEventIn !== 'number') s.nextEventIn = 180;
    if (s.activeEvent === undefined) s.activeEvent = null;
    if (s.activeEvent && Date.now() > s.activeEvent.until) {
      s.activeEvent = null;
      s.nextEventIn = Math.max(s.nextEventIn, 120);
    }
    // Oyun açılır açılmaz popup gelmesin
    s.nextEventIn = Math.max(s.nextEventIn, 60);
    return s;
  } catch {
    return null;
  }
}

export function resetGame(): void {
  wiped = true;
  localStorage.removeItem(SAVE_KEY);
  clearNative();
}
