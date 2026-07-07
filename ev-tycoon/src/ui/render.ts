import {
  ACHIEVEMENTS, BANKRUPTCY_GRACE, GEM_COST_BOOST, GEM_COST_INSTANT_CLAIM, GEM_COST_INSTANT_PROD,
  LOANS, LOCATIONS, NEWS, NEWS_EVENTS, RESEARCH, TIME_WARP_MINUTES, VEHICLES,
} from '../core/config';
import type { NewsEventDef } from '../core/config';
import { setPaused } from '../core/clock';
import {
  buyProdManager, buyResearch, buySalesManager, buySalesRep, buyTechnician,
  claim, gemBuyBoost, gemInstantClaim, gemInstantProd, startProduce, startSell,
  unlockVehicle, unlockLocation, adFillClaim, adRewardBoost, adRewardGems,
  canTakeLoan, doubleOfflineEarnings, gemInstantSell, hasAnyManager, payoffLoan,
  repayCost, takeLoan, timeWarp,
} from '../core/engine';
import type { OfflineReport } from '../core/engine';
import {
  batchSize, claimDuration, claimReward, fmt, fmtMoney, fmtTime, hasAutoClaim, homeCapFor,
  prodInterval, researchCost, researchLevel, sellInterval, sellPrice, staffCapFor, staffCost,
  staffSpeed, stockCap,
} from '../core/formulas';
import type { GameState } from '../core/state';
import { resetGame, saveGame } from '../core/state';
import { getLang, LANGS, setLang, t } from '../i18n';
import type { Lang } from '../i18n';
import { showRewardedAd } from './ads';
import { icon } from './art';
import { setSoundEnabled, sfx } from './audio';

export type Tab = 'home' | 'research' | 'stats' | 'ach' | 'market' | 'bank' | 'settings';

let S: GameState;
let currentTab: Tab = 'home';
let updaters: Array<() => void> = [];
let newsTimer = 0;

const $ = (sel: string): HTMLElement => document.querySelector(sel) as HTMLElement;

export function initUI(state: GameState): void {
  S = state;
  setSoundEnabled(S.settings.sound);
  renderHUD();
  renderTabbar();
  renderTab(currentTab);
  rotateNews(true);
}

// ---------- yardımcılar ----------

function el(html: string): HTMLElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild as HTMLElement;
}

export function toast(msg: string, kind: '' | 'gold' | 'err' = ''): void {
  const box = $('#toasts');
  const node = el(`<div class="toast ${kind}">${msg}</div>`);
  box.appendChild(node);
  setTimeout(() => node.remove(), 3000);
}

export function floatMoney(x: number, y: number, text: string): void {
  const node = el(`<div class="float-money">${text}</div>`);
  node.style.left = `${x - 20}px`;
  node.style.top = `${y - 10}px`;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 950);
}

/** dakikadaki hız için kısa sayı: 10 altı 1 ondalık, üstü tam sayı */
function fmtRate(n: number): string {
  return n >= 10 ? String(Math.round(n)) : n.toFixed(1);
}

// Satış uçan parası: yalnızca Home sekmesinde, o aracın satış barının
// bittiği noktadan yükselir (sık satışta seyreltilir)
let lastSaleFloat = 0;
export function saleFloat(vehicleId: string, amount: number): void {
  if (currentTab !== 'home') return;
  const now = performance.now();
  if (now - lastSaleFloat < 300) return;
  const bar = document.querySelector(`.vcard[data-vid="${vehicleId}"] .sell-row .bar`);
  if (!bar) return;
  lastSaleFloat = now;
  const r = bar.getBoundingClientRect();
  floatMoney(r.right - 6, r.top + r.height / 2, `+${fmtMoney(amount)}`);
}

function refresh(): void {
  renderTab(currentTab);
}

// ---------- HUD ----------

let hudMoney: HTMLElement, hudGems: HTMLElement, hudBoost: HTMLElement, hudRate: HTMLElement, hudDue: HTMLElement;

// Gelir hızı: son ~10 sn'nin gerçek kazancından ölçülür (dürüst gösterge)
const incomeSamples: Array<{ t: number; earned: number }> = [];

function renderHUD(): void {
  const hud = $('#hud');
  hud.innerHTML = '';
  hud.appendChild(el(`<div class="hud-brand">${icon('bolt')}<span>VOLT TYCOON</span>${icon('bolt')}</div>`));
  const row = el(`<div class="hud-stats"></div>`);
  hud.appendChild(row);
  row.appendChild(el(`<div class="hud-stat hud-money">${icon('coin')}<span class="val"></span><span class="due"></span><span class="rate"></span></div>`));
  row.appendChild(el(`<div class="hud-stat hud-boost">⚡×2 <span class="val"></span></div>`));
  row.appendChild(el(`<div class="hud-stat hud-gems">${icon('gem')}<span class="val"></span></div>`));
  const gear = el(`<button class="hud-gear">${icon('settings')}</button>`);
  gear.addEventListener('click', () => {
    sfx.click();
    currentTab = 'settings';
    renderTabbar();
    renderTab('settings');
  });
  row.appendChild(gear);
  hudMoney = row.querySelector('.hud-money .val') as HTMLElement;
  hudDue = row.querySelector('.hud-money .due') as HTMLElement;
  hudRate = row.querySelector('.hud-money .rate') as HTMLElement;
  hudGems = row.querySelector('.hud-gems .val') as HTMLElement;
  hudBoost = row.querySelector('.hud-boost') as HTMLElement;
}

// ---------- Alt navigasyon ----------

// Ayarlar alt bardan üst HUD'a taşındı (dişli) — Banka'ya yer açıldı
const TABS: Array<{ id: Tab; icn: string }> = [
  { id: 'home', icn: 'home' },
  { id: 'research', icn: 'flask' },
  { id: 'bank', icn: 'bank' },
  { id: 'stats', icn: 'chart' },
  { id: 'ach', icn: 'trophy' },
  { id: 'market', icn: 'cart' },
];

function renderTabbar(): void {
  const bar = $('#tabbar');
  bar.innerHTML = '';
  for (const tab of TABS) {
    const b = el(
      `<button class="tab ${tab.id === currentTab ? 'active' : ''}" data-tab="${tab.id}">
        <span class="dot"></span>${icon(tab.icn)}<span class="tab-label">${t('tab.' + tab.id)}</span>
      </button>`,
    );
    b.addEventListener('click', () => {
      sfx.click();
      currentTab = tab.id;
      renderTabbar();
      renderTab(tab.id);
    });
    bar.appendChild(b);
  }
}

// ---------- Sekme yönlendirme ----------

function renderTab(tab: Tab): void {
  updaters = [];
  const c = $('#content');
  c.innerHTML = '';
  c.scrollTop = 0;
  if (tab === 'home') renderHome(c);
  else if (tab === 'research') renderResearch(c);
  else if (tab === 'stats') renderStats(c);
  else if (tab === 'ach') renderAchievements(c);
  else if (tab === 'market') renderMarket(c);
  else if (tab === 'bank') renderBank(c);
  else renderSettings(c);
}

// ---------- HOME ----------

function renderHome(c: HTMLElement): void {
  // Kademeli açılım: açık mekânlar + yalnızca SIRADAKİ kilitli mekân görünür;
  // daha sonrakiler tamamen gizli kalır (merak unsuru).
  // Her tesis aynı yapıyı kullanır: başlık + altında özlü söz.
  for (const loc of LOCATIONS) {
    c.appendChild(el(`<div class="loc-title">${icon(loc.icon)}<span>${t(loc.nameKey)}</span></div>`));
    if (!S.locations[loc.id]) {
      c.appendChild(locationUnlockCard(loc.id));
      break;
    }
    c.appendChild(el(`<div class="loc-motto">${t(loc.nameKey + '.motto')}</div>`));
    const cards = el(`<div class="cards"></div>`);
    c.appendChild(cards);
    for (const v of VEHICLES.filter((x) => x.locationId === loc.id)) {
      const line = S.lines[v.id];
      if (line.unlocked) cards.appendChild(vehicleCard(v.id));
      else cards.appendChild(lockedCard(v.id));
    }
  }
}

function locationUnlockCard(id: string): HTMLElement {
  const loc = LOCATIONS.find((l) => l.id === id)!;
  const card = el(`<div class="vcard loc-unlock" style="--accent:var(--gold)">
    <div class="loc-badge">✦ ${t('loc.milestone')}</div>
    <div class="vcard-head">
      <div class="vcard-icon">${icon(loc.icon)}</div>
      <div style="flex:1">
        <div class="vcard-title">${t(loc.nameKey)}</div>
        <div class="vcard-class">${t(loc.nameKey + '.desc')}</div>
      </div>
      <div class="vcard-stock loc-lock">${icon('lock')}</div>
    </div>
    <div class="locked-row">
      <button class="btn btn-unlock btn-milestone">${t('loc.unlock')} — ${fmtMoney(loc.unlockCost)}${loc.unlockGems > 0 ? ` + 💎${loc.unlockGems}` : ''}</button>
    </div>
  </div>`);
  const btn = card.querySelector('.btn-unlock') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    if (unlockLocation(S, id)) {
      sfx.achievement();
      refresh();
    } else {
      toast(t(S.money < loc.unlockCost ? 'toast.notEnoughMoney' : 'toast.notEnoughGems'), 'err');
      sfx.error();
    }
  });
  updaters.push(() => {
    btn.disabled = S.money < loc.unlockCost || S.gems < loc.unlockGems;
  });
  return card;
}

function vehicleCard(id: string): HTMLElement {
  const v = VEHICLES.find((x) => x.id === id)!;
  const line = S.lines[id];

  const card = el(`<div class="vcard" data-vid="${v.id}" style="--accent:${v.accent}">
    <div class="vcard-head">
      <div class="vcard-icon">${icon(v.icon)}</div>
      <div>
        <div class="vcard-title">${v.name}</div>
        <div class="vcard-class">${t(v.classKey)}</div>
        <div class="vcard-price"></div>
      </div>
      <div class="vcard-stock">${t('ui.stock')}<b></b><span class="cap"></span></div>
    </div>
    <div class="line-row prod-row">
      <button class="btn btn-produce"></button>
      <div class="bar"><div class="bar-fill prodfill"></div><div class="bar-label prodlabel"></div><span class="bar-rate prodrate"></span></div>
      <button class="btn btn-gem gem-prod">${icon('gem')}${GEM_COST_INSTANT_PROD}</button>
    </div>
    <div class="line-row sell-row">
      <button class="btn btn-sell"></button>
      <div class="bar"><div class="bar-fill sellbar"></div><div class="bar-label selllabel"></div><span class="bar-rate sellrate"></span></div>
      <button class="btn btn-gem gem-sell">${icon('gem')}${GEM_COST_INSTANT_PROD}</button>
    </div>
    <div class="staff-grid">
      <div class="staff-cell">
        <button class="btn btn-buy buy-tech">
          <span class="who">${icon('person')}<span>${t('ui.technician')}</span></span>
          <span class="cost"></span>
        </button>
        <div class="staff-info tech-info"></div>
      </div>
      <div class="staff-cell">
        <button class="btn btn-buy buy-rep">
          <span class="who">${icon('person')}<span>${t('ui.salesrep')}</span></span>
          <span class="cost"></span>
        </button>
        <div class="staff-info rep-info"></div>
      </div>
      <div class="staff-cell">
        <button class="btn btn-buy buy-pm">
          <span class="who">${icon('tie')}<span>${t('ui.prodmanager')}</span></span>
          <span class="cost"></span>
        </button>
      </div>
      <div class="staff-cell">
        <button class="btn btn-buy buy-sm">
          <span class="who">${icon('tie')}<span>${t('ui.salesmanager')}</span></span>
          <span class="cost"></span>
        </button>
      </div>
    </div>
  </div>`);

  const q = (sel: string): HTMLElement => card.querySelector(sel) as HTMLElement;
  const priceEl = q('.vcard-price');
  const stockEl = q('.vcard-stock b');
  const stockBox = q('.vcard-stock');
  const capEl = q('.vcard-stock .cap');
  const btnProd = q('.btn-produce') as HTMLButtonElement;
  const btnSell = q('.btn-sell') as HTMLButtonElement;
  const btnGemProd = q('.gem-prod') as HTMLButtonElement;
  const btnGemSell = q('.gem-sell') as HTMLButtonElement;
  const prodFill = q('.prodfill');
  const sellFill = q('.sellbar');
  const prodLabel = q('.prodlabel');
  const sellLabel = q('.selllabel');
  const prodRate = q('.prodrate');
  const sellRate = q('.sellrate');
  const btnTech = q('.buy-tech') as HTMLButtonElement;
  const btnRep = q('.buy-rep') as HTMLButtonElement;
  const btnPM = q('.buy-pm') as HTMLButtonElement;
  const btnSM = q('.buy-sm') as HTMLButtonElement;
  const techInfo = q('.tech-info');
  const repInfo = q('.rep-info');

  btnProd.addEventListener('click', (e) => {
    if (startProduce(S, id)) {
      sfx.click();
    } else if (line.stock >= stockCap(S, v)) {
      sfx.error();
    }
    e.stopPropagation();
  });
  btnSell.addEventListener('click', () => {
    if (startSell(S, id)) sfx.click();
    else sfx.error();
  });
  btnGemProd.addEventListener('click', (e) => {
    if (gemInstantProd(S, id)) {
      sfx.buy();
      floatMoney((e as MouseEvent).clientX, (e as MouseEvent).clientY, '+📦');
    } else {
      toast(t('toast.notEnoughGems'), 'err');
      sfx.error();
    }
  });
  btnGemSell.addEventListener('click', (e) => {
    if (gemInstantSell(S, id)) {
      sfx.buy();
      floatMoney((e as MouseEvent).clientX, (e as MouseEvent).clientY, `+${fmtMoney(sellPrice(S, v))}`);
    } else {
      toast(t('toast.notEnoughGems'), 'err');
      sfx.error();
    }
  });
  // Not: satın almalarda refresh() çağırmıyoruz; updater'lar her kare
  // maliyet/etiket/disabled durumlarını zaten güncelliyor. Tam yeniden
  // çizim ekranda görünür bir titremeye yol açıyordu.
  btnTech.addEventListener('click', () => {
    if (buyTechnician(S, id)) sfx.buy();
    else {
      toast(t('toast.notEnoughMoney'), 'err');
      sfx.error();
    }
  });
  btnRep.addEventListener('click', () => {
    if (buySalesRep(S, id)) sfx.buy();
    else {
      toast(t('toast.notEnoughMoney'), 'err');
      sfx.error();
    }
  });
  btnPM.addEventListener('click', () => {
    if (buyProdManager(S, id)) sfx.buy();
    else {
      toast(t('toast.notEnoughMoney'), 'err');
      sfx.error();
    }
  });
  btnSM.addEventListener('click', () => {
    if (buySalesManager(S, id)) sfx.buy();
    else {
      toast(t('toast.notEnoughMoney'), 'err');
      sfx.error();
    }
  });

  updaters.push(() => {
    const cap = stockCap(S, v);
    priceEl.textContent = `${t('ui.price')}: ${fmtMoney(sellPrice(S, v))}`;
    stockEl.textContent = String(line.stock);
    capEl.textContent = `/ ${cap}`;
    stockBox.classList.toggle('full', line.stock >= cap);

    // Hız sayaçları: dakikada kaç araç üretilir/satılır
    const pIntNow = prodInterval(S, v, line);
    const sIntNow = sellInterval(S, v, line);
    prodRate.textContent = t('ui.perMin', { n: fmtRate((60 / pIntNow) * batchSize(S)) });
    sellRate.textContent = t('ui.perMin', { n: fmtRate(60 / sIntNow) });

    // Üretim
    const pInt = pIntNow;
    const pActive = line.producing || line.prodManager;
    const pPct = pActive ? Math.min(100, (line.prodElapsed / pInt) * 100) : 0;
    prodFill.style.width = `${pPct}%`;
    prodLabel.textContent = pActive
      ? line.stock >= cap
        ? t('ui.max')
        : `${fmtTime(Math.max(0, pInt - line.prodElapsed))}`
      : `${pInt.toFixed(1)}s`;
    if (line.prodManager) {
      btnProd.textContent = t('ui.auto');
      btnProd.className = 'btn btn-auto';
      btnProd.disabled = true;
    } else {
      btnProd.textContent = t('ui.produce');
      btnProd.className = 'btn btn-produce';
      btnProd.disabled = line.producing || line.stock >= cap;
    }
    btnGemProd.style.visibility = pActive && line.stock < cap ? 'visible' : 'hidden';
    btnGemProd.classList.toggle('cant', S.gems < GEM_COST_INSTANT_PROD);

    // Satış
    const sInt = sellInterval(S, v, line);
    const sActive = (line.selling || line.salesManager) && line.stock > 0;
    const sPct = sActive ? Math.min(100, (line.sellElapsed / sInt) * 100) : 0;
    sellFill.style.width = `${sPct}%`;
    sellLabel.textContent = sActive ? fmtTime(Math.max(0, sInt - line.sellElapsed)) : `${sInt.toFixed(1)}s`;
    if (line.salesManager) {
      btnSell.textContent = t('ui.auto');
      btnSell.className = 'btn btn-auto';
      btnSell.disabled = true;
    } else {
      btnSell.textContent = t('ui.sell');
      btnSell.className = 'btn btn-sell';
      btnSell.disabled = line.selling || line.stock <= 0;
    }
    btnGemSell.style.visibility = sActive ? 'visible' : 'hidden';
    btnGemSell.classList.toggle('cant', S.gems < GEM_COST_INSTANT_PROD);

    // Personel (tavan: açık en büyük tesisin tavanı; dolunca MAX;
    // kendi tesis tavanı üzeri "uzman kadro" altın fiyatla gösterilir)
    const sCap = staffCapFor(S);
    const hCap = homeCapFor(v);
    const techMax = line.technicians >= sCap;
    const repMax = line.salesReps >= sCap;
    const tc = staffCost(v.techBaseCost, line.technicians, hCap);
    const rc = staffCost(v.repBaseCost, line.salesReps, hCap);
    const tCostEl = btnTech.querySelector('.cost') as HTMLElement;
    const rCostEl = btnRep.querySelector('.cost') as HTMLElement;
    tCostEl.textContent = techMax ? t('ui.max') : fmtMoney(tc);
    rCostEl.textContent = repMax ? t('ui.max') : fmtMoney(rc);
    tCostEl.classList.toggle('over', !techMax && line.technicians >= hCap);
    rCostEl.classList.toggle('over', !repMax && line.salesReps >= hCap);
    btnTech.disabled = techMax;
    btnRep.disabled = repMax;
    btnTech.classList.toggle('cant', !techMax && S.money < tc);
    btnRep.classList.toggle('cant', !repMax && S.money < rc);
    techInfo.textContent = `${line.technicians}/${sCap} — ${t('ui.speed')} ×${staffSpeed(line.technicians).toFixed(2)}`;
    repInfo.textContent = `${line.salesReps}/${sCap} — ${t('ui.speed')} ×${staffSpeed(line.salesReps).toFixed(2)}`;

    const pmCost = btnPM.querySelector('.cost') as HTMLElement;
    if (line.prodManager) {
      pmCost.textContent = t('ui.hired');
      btnPM.disabled = true;
    } else {
      pmCost.textContent = fmtMoney(v.prodManagerCost);
      btnPM.classList.toggle('cant', S.money < v.prodManagerCost);
    }
    const smCost = btnSM.querySelector('.cost') as HTMLElement;
    if (line.salesManager) {
      smCost.textContent = t('ui.hired');
      btnSM.disabled = true;
    } else {
      smCost.textContent = fmtMoney(v.salesManagerCost);
      btnSM.classList.toggle('cant', S.money < v.salesManagerCost);
    }
  });

  return card;
}

function lockedCard(id: string): HTMLElement {
  const v = VEHICLES.find((x) => x.id === id)!;
  const gemPart = v.unlockGems > 0 ? ` + 💎${v.unlockGems}` : '';
  const card = el(`<div class="vcard locked" style="--accent:#3a4a7a">
    <div class="vcard-head">
      <div class="vcard-icon">${icon(v.icon)}</div>
      <div>
        <div class="vcard-title">${v.name}</div>
        <div class="vcard-class">${t(v.classKey)}</div>
      </div>
      <div class="vcard-stock">${icon('lock')}</div>
    </div>
    <div class="locked-row">
      <button class="btn btn-unlock">${t('ui.unlock')} — ${fmtMoney(v.unlockCost)}${gemPart}</button>
    </div>
  </div>`);
  const btn = card.querySelector('.btn-unlock') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    if (unlockVehicle(S, id)) {
      sfx.achievement();
      refresh();
    } else {
      toast(t(S.money < v.unlockCost ? 'toast.notEnoughMoney' : 'toast.notEnoughGems'), 'err');
      sfx.error();
    }
  });
  updaters.push(() => {
    btn.disabled = S.money < v.unlockCost || S.gems < v.unlockGems;
  });
  return card;
}

// ---------- RESEARCH ----------

function renderResearch(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('research.title')}</div>`));
  c.appendChild(el(`<div class="rp-badge">${icon('flask')}<span class="rp-val"></span> ${t('research.points')}</div>`));

  // Claim paneli
  const panel = el(`<div class="panel claim-panel">
    <div class="claim-msg screen-sub" style="margin-bottom:0"></div>
    <div class="bar claim-bar"><div class="bar-fill"></div><div class="bar-label"></div></div>
    <button class="btn btn-claim"></button>
    <div class="claim-gem-row">
      <button class="btn btn-gem gem-claim">${icon('gem')}${GEM_COST_INSTANT_CLAIM} ${t('ui.instant')}</button>
      <button class="btn btn-ad ad-claim">${icon('play')}${t('ui.watchAd')}</button>
    </div>
  </div>`);
  c.appendChild(panel);

  const q = (sel: string): HTMLElement => panel.querySelector(sel) as HTMLElement;
  const msg = q('.claim-msg');
  const fill = q('.bar-fill');
  const label = q('.bar-label');
  const btnClaim = q('.btn-claim') as HTMLButtonElement;
  const btnGem = q('.gem-claim') as HTMLButtonElement;

  btnClaim.addEventListener('click', () => {
    if (claim(S)) sfx.achievement();
  });
  btnGem.addEventListener('click', () => {
    if (gemInstantClaim(S)) sfx.buy();
    else {
      toast(t('toast.notEnoughGems'), 'err');
      sfx.error();
    }
  });
  const btnAdClaim = q('.ad-claim') as HTMLButtonElement;
  btnAdClaim.addEventListener('click', () => {
    showRewardedAd(() => {
      if (adFillClaim(S)) sfx.achievement();
    });
  });

  const rpVal = c.querySelector('.rp-val') as HTMLElement;
  updaters.push(() => {
    rpVal.textContent = fmt(S.rp);
    const dur = claimDuration(S);
    const auto = hasAutoClaim(S);
    const ready = !auto && S.claimElapsed >= dur;
    msg.textContent = auto
      ? `🤖 ${t('research.inventor.name')} — ${t('ui.auto')}`
      : ready
        ? t('ui.claimReady')
        : t('ui.claimFilling');
    fill.style.width = `${Math.min(100, (S.claimElapsed / dur) * 100)}%`;
    label.textContent = ready ? '✓' : fmtTime(dur - S.claimElapsed);
    if (auto) {
      btnClaim.textContent = `${t('ui.auto')} +${claimReward(S)}`;
      btnClaim.disabled = true;
      btnGem.style.visibility = 'hidden';
      btnAdClaim.style.visibility = 'hidden';
    } else {
      btnClaim.textContent = `${t('ui.claim')} +${claimReward(S)}`;
      btnClaim.disabled = !ready;
      btnGem.style.visibility = ready ? 'hidden' : 'visible';
      btnAdClaim.style.visibility = ready ? 'hidden' : 'visible';
    }
  });

  // Araştırma listesi — haberlerle aynı tier mantığı: yalnızca açık
  // mekânların araştırmaları görünür, mekân başlığıyla gruplanır
  for (const loc of LOCATIONS) {
    if (!S.locations[loc.id]) break;
    const items = RESEARCH.filter((r) => r.locationId === loc.id);
    if (items.length === 0) continue;
    c.appendChild(el(`<div class="loc-header">${icon(loc.icon)}<span>${t(loc.nameKey)}</span></div>`));
    for (const r of items) {
      const item = el(`<div class="panel">
        <div class="panel-row">
          <div class="panel-icon">${icon(r.icon)}</div>
          <div style="flex:1">
            <div class="panel-name">${t(`research.${r.id}.name`)}</div>
            <div class="panel-desc">${t(`research.${r.id}.desc`)}</div>
            <div class="lvl"></div>
          </div>
          <div class="panel-side">
            <button class="btn btn-buy rbuy"><span class="cost"></span></button>
          </div>
        </div>
      </div>`);
      c.appendChild(item);
      const lvlEl = item.querySelector('.lvl') as HTMLElement;
      const btn = item.querySelector('.rbuy') as HTMLButtonElement;
      const costEl = item.querySelector('.cost') as HTMLElement;
      btn.addEventListener('click', () => {
        if (buyResearch(S, r.id)) sfx.achievement();
        else {
          toast(t('toast.notEnoughRP'), 'err');
          sfx.error();
        }
      });
      updaters.push(() => {
        const lvl = researchLevel(S, r.id);
        lvlEl.textContent = `${t('ui.level')} ${lvl}/${r.maxLevel}`;
        const cost = researchCost(S, r.id);
        if (cost === null) {
          costEl.textContent = t('ui.max');
          btn.disabled = true;
        } else {
          costEl.textContent = `${cost} RP`;
          btn.classList.toggle('cant', S.rp < cost);
        }
      });
    }
  }
  c.appendChild(el(`<div class="screen-sub" style="margin-top:10px">${t('research.more')}</div>`));
}

// ---------- STATS (istatistikler + grafik) ----------

function renderStats(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('stats.title')}</div>`));
  c.appendChild(el(`<div class="screen-sub">${t('stats.sub')}</div>`));
  const grid = el(`<div class="stat-grid">
    <div class="stat-box"><b class="st-earned"></b><span>${t('garage.totalEarned')}</span></div>
    <div class="stat-box"><b class="st-prod"></b><span>${t('garage.totalProduced')}</span></div>
    <div class="stat-box"><b class="st-sold"></b><span>${t('garage.totalSold')}</span></div>
  </div>`);
  c.appendChild(grid);
  const e1 = grid.querySelector('.st-earned') as HTMLElement;
  const e2 = grid.querySelector('.st-prod') as HTMLElement;
  const e3 = grid.querySelector('.st-sold') as HTMLElement;
  updaters.push(() => {
    e1.textContent = fmtMoney(S.stats.totalEarned);
    e2.textContent = fmt(S.stats.totalProduced);
    e3.textContent = fmt(S.stats.totalSold);
  });

  const owned = VEHICLES.filter((v) => S.lines[v.id].unlocked);

  // Ciro payı grafiği — canlı büyüyen yatay barlar
  const chart = el(`<div class="panel">
    <div class="panel-name" style="margin-bottom:10px">${t('stats.chart')}</div>
    <div class="chart"></div>
  </div>`);
  c.appendChild(chart);
  const chartBox = chart.querySelector('.chart') as HTMLElement;
  const rows: Array<{ fill: HTMLElement; val: HTMLElement; id: string }> = [];
  for (const v of owned) {
    const row = el(`<div class="chart-row">
      <span class="chart-name">${v.name}</span>
      <div class="chart-track"><div class="chart-fill" style="background:${v.accent}"></div></div>
      <span class="chart-val"></span>
    </div>`);
    chartBox.appendChild(row);
    rows.push({
      fill: row.querySelector('.chart-fill') as HTMLElement,
      val: row.querySelector('.chart-val') as HTMLElement,
      id: v.id,
    });
  }
  updaters.push(() => {
    const max = Math.max(1, ...owned.map((v) => S.lines[v.id].revenue));
    for (const r of rows) {
      const rev = S.lines[r.id].revenue;
      r.fill.style.width = `${Math.max(rev > 0 ? 3 : 0, (rev / max) * 100)}%`;
      r.val.textContent = fmtMoney(rev);
    }
  });

  // Araç başına kârlılık listesi (kompakt satırlar)
  const list = el(`<div class="panel plist">
    <div class="plist-row plist-head">
      <span></span>
      <span>${t('stats.revenue')}</span>
      <span>${t('stats.spent')}</span>
      <span>${t('stats.net')}</span>
    </div>
  </div>`);
  c.appendChild(list);
  for (const v of owned) {
    const row = el(`<div class="plist-row" style="--accent:${v.accent}">
      <span class="pl-name">
        <span class="pl-icon" style="color:${v.accent}">${icon(v.icon)}</span>
        <span class="pl-nm">${v.name}<small class="pl-sold"></small></span>
      </span>
      <span class="pl-rev"></span>
      <span class="pl-spent"></span>
      <span class="pl-net"></span>
    </div>`);
    list.appendChild(row);
    const soldEl = row.querySelector('.pl-sold') as HTMLElement;
    const revEl = row.querySelector('.pl-rev') as HTMLElement;
    const spentEl = row.querySelector('.pl-spent') as HTMLElement;
    const netEl = row.querySelector('.pl-net') as HTMLElement;
    updaters.push(() => {
      const line = S.lines[v.id];
      const net = line.revenue - line.spent;
      soldEl.textContent = `${fmt(line.totalSold)} ${t('stats.soldUnit')}`;
      revEl.textContent = fmtMoney(line.revenue);
      spentEl.textContent = fmtMoney(line.spent);
      netEl.textContent = (net >= 0 ? '+' : '−') + fmtMoney(Math.abs(net));
      netEl.classList.toggle('neg', net < 0);
    });
  }
}

// ---------- ACHIEVEMENTS (başarımlar) ----------

function renderAchievements(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('ach.title')}</div>`));
  const earnedCount = S.achievements.length;
  c.appendChild(el(`<div class="screen-sub">${earnedCount} / ${ACHIEVEMENTS.length}</div>`));
  for (const a of ACHIEVEMENTS) {
    const earned = S.achievements.includes(a.id);
    c.appendChild(
      el(`<div class="panel ach ${earned ? 'earned' : ''}">
        <div class="panel-row">
          <div class="panel-icon">${icon('trophy')}</div>
          <div style="flex:1">
            <div class="panel-name">${t('ach.' + a.id)}</div>
            <div class="panel-desc">${t('ach.reward')}: +${a.gems} 💎</div>
          </div>
          <div class="panel-side">${earned ? '✅' : ''}</div>
        </div>
      </div>`),
    );
  }
}

// ---------- MARKET ----------

function renderMarket(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('market.title')}</div>`));

  // Gem boost
  const boost = el(`<div class="panel">
    <div class="panel-row">
      <div class="panel-icon" style="color:var(--gold)">${icon('bolt')}</div>
      <div style="flex:1">
        <div class="panel-name">${t('market.boost.name')}</div>
        <div class="panel-desc">${t('market.boost.desc')}</div>
      </div>
      <div class="panel-side">
        <button class="btn btn-gem boost-buy">${icon('gem')}${GEM_COST_BOOST}</button>
      </div>
    </div>
  </div>`);
  c.appendChild(boost);
  const boostBtn = boost.querySelector('.boost-buy') as HTMLButtonElement;
  boostBtn.addEventListener('click', () => {
    if (gemBuyBoost(S)) sfx.buy();
    else {
      toast(t('toast.notEnoughGems'), 'err');
      sfx.error();
    }
  });
  updaters.push(() => {
    const active = Date.now() < S.boostUntil;
    boostBtn.disabled = active;
    if (active) {
      boostBtn.innerHTML = `${t('ui.active')} ${fmtTime((S.boostUntil - Date.now()) / 1000)}`;
    }
  });

  // Zaman Atlaması (reklamla)
  const warp = el(`<div class="panel">
    <div class="panel-row">
      <div class="panel-icon" style="color:var(--cyan)">${icon('bolt')}</div>
      <div style="flex:1">
        <div class="panel-name">${t('market.warp.name')}</div>
        <div class="panel-desc">${t('market.warp.desc', { mins: TIME_WARP_MINUTES })}</div>
      </div>
      <div class="panel-side"><button class="btn btn-ad ad-warp">${icon('play')}${t('ui.watchAd')}</button></div>
    </div>
  </div>`);
  c.appendChild(warp);
  const warpBtn = warp.querySelector('.ad-warp') as HTMLButtonElement;
  warpBtn.addEventListener('click', () => {
    if (!hasAnyManager(S)) {
      toast(t('market.warp.none'), 'err');
      sfx.error();
      return;
    }
    showRewardedAd(() => {
      const rep = timeWarp(S, TIME_WARP_MINUTES * 60);
      sfx.achievement();
      toast(`⏩ +${fmtMoney(rep.earned)}`, 'gold');
    });
  });
  updaters.push(() => {
    warpBtn.classList.toggle('disabled', !hasAnyManager(S));
  });

  // Reklamla gems
  const adg = el(`<div class="panel">
    <div class="panel-row">
      <div class="panel-icon" style="color:var(--pink)">${icon('gem')}</div>
      <div style="flex:1">
        <div class="panel-name">${t('market.adGems.name')}</div>
        <div class="panel-desc">${t('market.adGems.desc')}</div>
      </div>
      <div class="panel-side"><button class="btn btn-ad ad-gems">${icon('play')}${t('ui.watchAd')}</button></div>
    </div>
  </div>`);
  c.appendChild(adg);
  (adg.querySelector('.ad-gems') as HTMLButtonElement).addEventListener('click', () => {
    showRewardedAd(() => {
      adRewardGems(S);
      sfx.achievement();
      toast('+5 💎', 'gold');
    });
  });

  // Reklamla boost
  const adb = el(`<div class="panel">
    <div class="panel-row">
      <div class="panel-icon" style="color:var(--gold)">${icon('bolt')}</div>
      <div style="flex:1">
        <div class="panel-name">${t('market.adBoost.name')}</div>
        <div class="panel-desc">${t('market.adBoost.desc')}</div>
      </div>
      <div class="panel-side"><button class="btn btn-ad ad-boost">${icon('play')}${t('ui.watchAd')}</button></div>
    </div>
  </div>`);
  c.appendChild(adb);
  (adb.querySelector('.ad-boost') as HTMLButtonElement).addEventListener('click', () => {
    showRewardedAd(() => {
      adRewardBoost(S);
      sfx.achievement();
      toast('⚡ ×2 — 4h', 'gold');
    });
  });

  // Gem shop bilgisi
  c.appendChild(
    el(`<div class="panel">
      <div class="panel-name" style="margin-bottom:6px">${t('market.gems.title')}</div>
      <div class="panel-desc">${t('market.gems.soon')}</div>
    </div>`),
  );
}

// ---------- BANK ----------

function renderBank(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('bank.title')}</div>`));
  c.appendChild(el(`<div class="screen-sub">${t('bank.sub')}</div>`));

  // Aktif krediler
  const activeBox = el(`<div class="bank-active"></div>`);
  c.appendChild(activeBox);

  // Teklifler (yalnızca açık tesislerin kredileri; kademeli açılım gibi
  // sıradaki tesisin teklifi görünmez)
  c.appendChild(el(`<div class="loc-header">${icon('bank')}<span>${t('bank.offers')}</span></div>`));
  for (const def of LOANS) {
    if (!S.locations[def.locationId]) continue;
    const total = def.principal * (1 + def.rate);
    const inst = Math.ceil(total / def.installments);
    const offer = el(`<div class="panel">
      <div class="panel-row">
        <div class="panel-icon" style="color:var(--gold)">${icon('bank')}</div>
        <div style="flex:1">
          <div class="panel-name">${t(`loan.${def.id}.name`)}</div>
          <div class="panel-desc">${fmtMoney(def.principal)} — ${t('bank.interest', { p: Math.round(def.rate * 100) })} · ${t('bank.plan', { n: def.installments, amt: fmtMoney(inst), time: fmtTime(def.intervalSec) })} · ${t('bank.fee', { p: 8 })}</div>
        </div>
        <div class="panel-side loan-btns">
          <button class="btn btn-ad take-loan">${t('bank.take')}</button>
          <button class="btn btn-buy repay-loan"><span class="cost"></span></button>
        </div>
      </div>
    </div>`);
    c.appendChild(offer);
    const btn = offer.querySelector('.take-loan') as HTMLButtonElement;
    const repayBtn = offer.querySelector('.repay-loan') as HTMLButtonElement;
    const repayCostEl = repayBtn.querySelector('.cost') as HTMLElement;
    btn.addEventListener('click', () => {
      if (takeLoan(S, def.id)) {
        sfx.buy();
        toast(`🏦 +${fmtMoney(def.principal)}`, 'gold');
      }
    });
    repayBtn.addEventListener('click', () => {
      if (payoffLoan(S, def.id)) {
        sfx.achievement();
        toast(t('bank.paidoff'), 'gold');
      } else {
        toast(t('toast.notEnoughMoney'), 'err');
        sfx.error();
      }
    });
    updaters.push(() => {
      btn.disabled = !canTakeLoan(S, def.id);
      const cost = repayCost(S, def.id);
      if (cost === null) {
        repayBtn.disabled = true;
        repayCostEl.textContent = t('bank.payoff');
      } else {
        repayBtn.disabled = false;
        repayCostEl.textContent = `${t('bank.payoff')} ${fmtMoney(cost)}`;
        repayBtn.classList.toggle('cant', S.money < cost);
      }
    });
  }
  c.appendChild(el(`<div class="screen-sub" style="margin-top:10px">${t('bank.more')}</div>`));

  // Aktif kredi kartları (yapı değişince yeniden çiz)
  let lastCount = -1;
  const rebuildActive = (): void => {
    activeBox.innerHTML = '';
    if (S.loans.length === 0) return;
    activeBox.appendChild(el(`<div class="loc-header">${icon('coin')}<span>${t('bank.active')}</span></div>`));
    for (const loan of S.loans) {
      const item = el(`<div class="panel loan-card" data-loan="${loan.defId}">
        <div class="panel-row">
          <div class="panel-icon" style="color:var(--danger)">${icon('bank')}</div>
          <div style="flex:1">
            <div class="panel-name">${t(`loan.${loan.defId}.name`)}</div>
            <div class="panel-desc ln-info"></div>
          </div>
        </div>
      </div>`);
      activeBox.appendChild(item);
    }
  };
  updaters.push(() => {
    if (S.loans.length !== lastCount) {
      lastCount = S.loans.length;
      rebuildActive();
    }
    for (const loan of S.loans) {
      const card = activeBox.querySelector(`.loan-card[data-loan="${loan.defId}"]`);
      if (!card) continue;
      (card.querySelector('.ln-info') as HTMLElement).textContent =
        `${t('bank.remaining', { n: loan.remaining, amt: fmtMoney(loan.installment) })} · ${t('bank.next', { time: fmtTime(loan.nextIn) })}`;
    }
  });
}

/** İflas ekranı — tek çıkış: sıfırdan başlamak */
export function showBankruptcy(): void {
  setPaused(true);
  const overlay = el(`<div class="modal-overlay">
    <div class="modal bankrupt-modal">
      <div class="tut-emoji">📉💸</div>
      <h2>${t('bank.bankrupt.title')}</h2>
      <p>${t('bank.bankrupt.body')}</p>
      <div class="modal-btns">
        <button class="btn btn-danger bk-restart">${t('bank.restart')}</button>
      </div>
    </div>
  </div>`);
  document.body.appendChild(overlay);
  (overlay.querySelector('.bk-restart') as HTMLButtonElement).addEventListener('click', () => {
    resetGame();
    location.reload();
  });
}

// ---------- SETTINGS ----------

function renderSettings(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('settings.title')}</div>`));

  // Dil
  const LANG_NAMES: Record<Lang, string> = {
    en: 'English',
    tr: 'Türkçe',
    es: 'Español',
    pt: 'Português',
    de: 'Deutsch',
    fr: 'Français',
  };
  const langRow = el(`<div class="panel settings-row">
    <span>${t('settings.language')}</span>
    <select class="lang-select"></select>
  </div>`);
  c.appendChild(langRow);
  const sel = langRow.querySelector('.lang-select') as HTMLSelectElement;
  for (const l of LANGS) {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = LANG_NAMES[l];
    if (l === getLang()) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => {
    const l = sel.value as Lang;
    S.settings.lang = l;
    setLang(l);
    sfx.click();
    renderTabbar();
    renderTab('settings');
    rotateNews(true);
  });

  // Ses
  const sndRow = el(`<div class="panel settings-row">
    <span>${t('settings.sound')}</span>
    <span class="seg">
      <button class="btn snd-on">${t('settings.on')}</button>
      <button class="btn snd-off">${t('settings.off')}</button>
    </span>
  </div>`);
  c.appendChild(sndRow);
  const bOn = sndRow.querySelector('.snd-on') as HTMLButtonElement;
  const bOff = sndRow.querySelector('.snd-off') as HTMLButtonElement;
  bOn.addEventListener('click', () => {
    S.settings.sound = true;
    setSoundEnabled(true);
    sfx.click();
  });
  bOff.addEventListener('click', () => {
    S.settings.sound = false;
    setSoundEnabled(false);
  });
  updaters.push(() => {
    bOn.classList.toggle('on', S.settings.sound);
    bOff.classList.toggle('on', !S.settings.sound);
  });

  // Sıfırlama
  const resetRow = el(`<div class="panel settings-row">
    <span>${t('settings.reset')}</span>
    <button class="btn btn-danger do-reset">${t('settings.reset')}</button>
  </div>`);
  c.appendChild(resetRow);
  (resetRow.querySelector('.do-reset') as HTMLButtonElement).addEventListener('click', () => {
    const overlay = el(`<div class="modal-overlay">
      <div class="modal">
        <h2>⚠️</h2>
        <p>${t('settings.resetConfirm')}</p>
        <div class="modal-btns">
          <button class="btn btn-buy m-cancel">${t('settings.cancel')}</button>
          <button class="btn btn-danger m-ok">${t('settings.resetBtn')}</button>
        </div>
      </div>
    </div>`);
    document.body.appendChild(overlay);
    (overlay.querySelector('.m-cancel') as HTMLButtonElement).addEventListener('click', () => overlay.remove());
    (overlay.querySelector('.m-ok') as HTMLButtonElement).addEventListener('click', () => {
      resetGame();
      location.reload();
    });
  });

  // Yasal bölüm
  const legal = el(`<div class="panel legal-panel">
    <div class="panel-name" style="margin-bottom:8px">${t('legal.title')}</div>
    <div class="seg" style="margin-bottom:10px">
      <button class="btn show-privacy">${t('legal.privacy')}</button>
      <button class="btn show-terms">${t('legal.terms')}</button>
    </div>
    <div class="legal-text">${t('legal.fiction')}</div>
    <div class="legal-text">${t('legal.copyright')}</div>
  </div>`);
  c.appendChild(legal);
  const showLegalDoc = (titleKey: string, bodyKey: string): void => {
    const overlay = el(`<div class="modal-overlay">
      <div class="modal legal-modal">
        <h2>${t(titleKey)}</h2>
        <div class="legal-body">${t(bodyKey)}</div>
        <div class="modal-btns"><button class="btn btn-buy m-close">${t('ui.close')}</button></div>
      </div>
    </div>`);
    document.body.appendChild(overlay);
    (overlay.querySelector('.m-close') as HTMLButtonElement).addEventListener('click', () => overlay.remove());
  };
  (legal.querySelector('.show-privacy') as HTMLButtonElement).addEventListener('click', () => {
    sfx.click();
    showLegalDoc('legal.privacy', 'legal.privacyBody');
  });
  (legal.querySelector('.show-terms') as HTMLButtonElement).addEventListener('click', () => {
    sfx.click();
    showLegalDoc('legal.terms', 'legal.termsBody');
  });

  c.appendChild(el(`<div class="about">${t('settings.about')}</div>`));
}

// ---------- Haber bandı ----------

export function rotateNews(immediate = false): void {
  const box = $('#ticker');
  const pool = NEWS.filter(
    (n) => S.locations[n.locationId] && (n.vehicleId === null || S.lines[n.vehicleId]?.unlocked),
  );
  const pick = pool[Math.floor(Math.random() * pool.length)];
  box.innerHTML = `<span class="tk-badge">EV NEWS</span><span class="tk-wrap"><span class="tk-text">${t(pick.key)}</span></span>`;
  if (immediate) newsTimer = 0;
}

// ---------- Haber olayı popup + aktif olay şeridi ----------

function eventFxText(def: NewsEventDef): string {
  const dir = def.mult >= 1 ? 'up' : 'down';
  const fx = t(`event.fx.${def.kind}.${dir}`, { mult: def.mult });
  const scope = def.vehicleId
    ? VEHICLES.find((v) => v.id === def.vehicleId)?.name ?? ''
    : t('event.scope.all');
  return `${fx} — ${scope}`;
}

export function showNewsEvent(def: NewsEventDef): void {
  const good = def.mult >= 1;
  // Popup açıkken oyun tamamen durur: üretim/satış ilerlemez, etki
  // süresi işlemez, yeni popup birikmez. Kapatınca etki süresi baştan
  // başlar — oyuncu hiçbir saniyesini kaçırmaz.
  setPaused(true);
  const overlay = el(`<div class="modal-overlay">
    <div class="modal event-modal ${good ? 'good' : 'bad'}">
      <div class="event-badge">${good ? '📈' : '📉'} ${t('event.breaking')}</div>
      <h2>${t(`event.${def.id}.title`)}</h2>
      <p class="event-fx">${eventFxText(def)}</p>
      <p class="event-dur">${t('event.duration', { time: fmtTime(def.durationSec) })}</p>
      <div class="modal-btns">
        <button class="btn ${good ? 'btn-unlock' : 'btn-buy'} ev-ok">${t('event.ok')}</button>
      </div>
    </div>
  </div>`);
  document.body.appendChild(overlay);
  (overlay.querySelector('.ev-ok') as HTMLButtonElement).addEventListener('click', () => {
    sfx.click();
    overlay.remove();
    if (S.activeEvent && S.activeEvent.id === def.id) {
      S.activeEvent.until = Date.now() + def.durationSec * 1000;
    }
    setPaused(false);
  });
}

function updateEventBar(): void {
  const bar = $('#eventbar');
  const ev = S.activeEvent;
  if (!ev || Date.now() > ev.until) {
    bar.classList.remove('on', 'bad');
    return;
  }
  const def = NEWS_EVENTS.find((e) => e.id === ev.id);
  if (!def) return;
  bar.classList.add('on');
  bar.classList.toggle('bad', def.mult < 1);
  bar.innerHTML = `<span>${def.mult >= 1 ? '📈' : '📉'} ${t('event.active')}: ${eventFxText(def)}</span><b>${fmtTime((ev.until - Date.now()) / 1000)}</b>`;
}

// ---------- Welcome back ----------

export function showWelcomeBack(report: OfflineReport): void {
  const overlay = el(`<div class="modal-overlay">
    <div class="modal">
      <h2>${t('wb.title')}</h2>
      <p>${t('wb.away', { time: fmtTime(report.seconds) })}</p>
      <div class="wb-grid">
        <div class="wb-cell"><b>${fmt(report.produced)}</b><span>${t('wb.produced')}</span></div>
        <div class="wb-cell"><b>${fmt(report.sold)}</b><span>${t('wb.sold')}</span></div>
        <div class="wb-cell"><b>${fmtMoney(report.earned)}</b><span>${t('wb.earned')}</span></div>
      </div>
      ${report.claimReady ? `<p>🧪 ${t('wb.claimReady')}</p>` : ''}
      ${report.rp > 0 ? `<p>🤖 +${fmt(report.rp)} ${t('research.points')}</p>` : ''}
      ${report.loanPaid > 0 ? `<p>🏦 −${fmtMoney(report.loanPaid)}</p>` : ''}
      <div class="modal-btns">
        <button class="btn btn-buy wb-collect">${t('ui.collect')}</button>
        ${report.earned > 0 ? `<button class="btn btn-ad wb-double">${icon('play')}${t('ui.double')}</button>` : ''}
      </div>
    </div>
  </div>`);
  document.body.appendChild(overlay);
  (overlay.querySelector('.wb-collect') as HTMLButtonElement).addEventListener('click', () => {
    sfx.click();
    overlay.remove();
  });
  const dbl = overlay.querySelector('.wb-double') as HTMLButtonElement | null;
  dbl?.addEventListener('click', () => {
    overlay.remove();
    showRewardedAd(() => {
      doubleOfflineEarnings(S, report);
      sfx.achievement();
      toast(`+${fmtMoney(report.earned)}`, 'gold');
    });
  });
}

// ---------- Kare güncellemesi ----------

let lastMoney = -1;
let lastGems = -1;

export function updateFrame(dt: number): void {
  if (S.money !== lastMoney) {
    hudMoney.textContent = fmt(S.money);
    lastMoney = S.money;
  }

  // Gelir hızı göstergesi (para hapının sağ ucu)
  const now = performance.now();
  incomeSamples.push({ t: now, earned: S.stats.totalEarned });
  while (incomeSamples.length > 2 && now - incomeSamples[0].t > 10_000) incomeSamples.shift();
  const first = incomeSamples[0];
  const span = (now - first.t) / 1000;
  const rate = span > 2 ? ((S.stats.totalEarned - first.earned) / span) * 60 : 0;
  hudRate.textContent = rate > 0 ? t('ui.perMin', { n: '+' + fmtMoney(rate) }) : '';
  if (S.gems !== lastGems) {
    hudGems.textContent = String(S.gems);
    lastGems = S.gems;
  }
  const boostOn = Date.now() < S.boostUntil;
  hudBoost.classList.toggle('on', boostOn);
  if (boostOn) {
    (hudBoost.querySelector('.val') as HTMLElement).textContent = fmtTime((S.boostUntil - Date.now()) / 1000);
  }

  updateEventBar();

  // Yaklaşan taksit sayacı (para hapının ortası, kırmızı)
  if (S.loans.length > 0) {
    const nearest = S.loans.reduce((a, b) => (a.nextIn < b.nextIn ? a : b));
    hudDue.textContent = `−${fmtMoney(nearest.installment)} · ${fmtTime(nearest.nextIn)}`;
  } else {
    hudDue.textContent = '';
  }

  // Borç/iflas uyarı bandı + para kırmızı
  const debtBar = $('#debtbar');
  const inDebt = S.money < 0;
  (hudMoney.parentElement as HTMLElement).classList.toggle('debt', inDebt);
  debtBar.classList.toggle('on', inDebt);
  if (inDebt) {
    debtBar.innerHTML = `<span>⚠️ ${t('bank.debtWarn', { time: fmtTime(Math.max(0, BANKRUPTCY_GRACE - S.debtTimer)) })}</span>`;
  }

  for (const u of updaters) u();

  newsTimer += dt;
  if (newsTimer >= 15) {
    newsTimer = 0;
    rotateNews();
  }
}

export function persist(): void {
  saveGame(S);
}
