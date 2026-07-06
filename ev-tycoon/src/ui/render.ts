import {
  ACHIEVEMENTS, GEM_COST_BOOST, GEM_COST_INSTANT_CLAIM, GEM_COST_INSTANT_PROD,
  NEWS, NEWS_EVENTS, RESEARCH, VEHICLES,
} from '../core/config';
import type { NewsEventDef } from '../core/config';
import {
  buyProdManager, buyResearch, buySalesManager, buySalesRep, buyTechnician,
  claim, gemBuyBoost, gemInstantClaim, gemInstantProd, startProduce, startSell,
  unlockVehicle, adRewardBoost, adRewardGems, doubleOfflineEarnings,
} from '../core/engine';
import type { OfflineReport } from '../core/engine';
import {
  claimDuration, fmt, fmtMoney, fmtTime, prodInterval, researchCost, researchLevel,
  sellInterval, sellPrice, staffCost, staffSpeed, stockCap,
} from '../core/formulas';
import type { GameState } from '../core/state';
import { resetGame, saveGame } from '../core/state';
import { getLang, setLang, t } from '../i18n';
import type { Lang } from '../i18n';
import { showRewardedAd } from './ads';
import { icon } from './art';
import { setSoundEnabled, sfx } from './audio';

export type Tab = 'home' | 'research' | 'garage' | 'market' | 'settings';

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

function refresh(): void {
  renderTab(currentTab);
}

// ---------- HUD ----------

let hudMoney: HTMLElement, hudGems: HTMLElement, hudBoost: HTMLElement;

function renderHUD(): void {
  const hud = $('#hud');
  hud.innerHTML = '';
  hud.appendChild(el(`<div class="hud-stat hud-money">${icon('coin')}<span class="val"></span></div>`));
  hud.appendChild(el(`<div class="hud-stat hud-boost">⚡×2 <span class="val"></span></div>`));
  hud.appendChild(el(`<div class="hud-stat hud-gems">${icon('gem')}<span class="val"></span></div>`));
  hudMoney = hud.querySelector('.hud-money .val') as HTMLElement;
  hudGems = hud.querySelector('.hud-gems .val') as HTMLElement;
  hudBoost = hud.querySelector('.hud-boost') as HTMLElement;
}

// ---------- Alt navigasyon ----------

const TABS: Array<{ id: Tab; icn: string }> = [
  { id: 'home', icn: 'home' },
  { id: 'research', icn: 'flask' },
  { id: 'garage', icn: 'trophy' },
  { id: 'market', icn: 'cart' },
  { id: 'settings', icn: 'settings' },
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
  else if (tab === 'garage') renderGarage(c);
  else if (tab === 'market') renderMarket(c);
  else renderSettings(c);
}

// ---------- HOME ----------

function renderHome(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('home.title')}</div>`));
  c.appendChild(el(`<div class="screen-sub">${t('home.subtitle')}</div>`));
  const cards = el(`<div class="cards"></div>`);
  c.appendChild(cards);
  for (const v of VEHICLES) {
    const line = S.lines[v.id];
    if (line.unlocked) cards.appendChild(vehicleCard(v.id));
    else cards.appendChild(lockedCard(v.id));
  }
}

function vehicleCard(id: string): HTMLElement {
  const v = VEHICLES.find((x) => x.id === id)!;
  const line = S.lines[id];

  const card = el(`<div class="vcard" style="--accent:${v.accent}">
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
      <div class="bar"><div class="bar-fill prodfill"></div><div class="bar-label prodlabel"></div></div>
      <button class="btn btn-gem gem-prod">${icon('gem')}${GEM_COST_INSTANT_PROD}</button>
    </div>
    <div class="line-row sell-row">
      <button class="btn btn-sell"></button>
      <div class="bar"><div class="bar-fill sellbar"></div><div class="bar-label selllabel"></div></div>
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
  const prodFill = q('.prodfill');
  const sellFill = q('.sellbar');
  const prodLabel = q('.prodlabel');
  const sellLabel = q('.selllabel');
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

    // Üretim
    const pInt = prodInterval(S, v, line);
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

    // Personel
    const tc = staffCost(v.techBaseCost, line.technicians);
    const rc = staffCost(v.repBaseCost, line.salesReps);
    (btnTech.querySelector('.cost') as HTMLElement).textContent = fmtMoney(tc);
    (btnRep.querySelector('.cost') as HTMLElement).textContent = fmtMoney(rc);
    btnTech.classList.toggle('cant', S.money < tc);
    btnRep.classList.toggle('cant', S.money < rc);
    techInfo.textContent = `×${line.technicians} — ${t('ui.speed')} ×${staffSpeed(line.technicians).toFixed(2)}`;
    repInfo.textContent = `×${line.salesReps} — ${t('ui.speed')} ×${staffSpeed(line.salesReps).toFixed(2)}`;

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
      <button class="btn btn-unlock">${t('ui.unlock')} — ${fmtMoney(v.unlockCost)}</button>
    </div>
  </div>`);
  const btn = card.querySelector('.btn-unlock') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    if (unlockVehicle(S, id)) {
      sfx.achievement();
      refresh();
    } else {
      toast(t('toast.notEnoughMoney'), 'err');
      sfx.error();
    }
  });
  updaters.push(() => {
    btn.disabled = S.money < v.unlockCost;
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

  const rpVal = c.querySelector('.rp-val') as HTMLElement;
  updaters.push(() => {
    rpVal.textContent = fmt(S.rp);
    const dur = claimDuration(S);
    const ready = S.claimElapsed >= dur;
    msg.textContent = ready ? t('ui.claimReady') : t('ui.claimFilling');
    fill.style.width = `${Math.min(100, (S.claimElapsed / dur) * 100)}%`;
    label.textContent = ready ? '✓' : fmtTime(dur - S.claimElapsed);
    btnClaim.textContent = `${t('ui.claim')} +5`;
    btnClaim.disabled = !ready;
    btnGem.style.visibility = ready ? 'hidden' : 'visible';
  });

  // Araştırma listesi
  for (const r of RESEARCH) {
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

// ---------- GARAGE (istatistik + başarımlar) ----------

function renderGarage(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('garage.title')}</div>`));
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

  c.appendChild(el(`<div class="screen-sub" style="margin-top:4px">${t('garage.achievements')}</div>`));
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

// ---------- SETTINGS ----------

function renderSettings(c: HTMLElement): void {
  c.appendChild(el(`<div class="screen-title">${t('settings.title')}</div>`));

  // Dil
  const langRow = el(`<div class="panel settings-row">
    <span>${t('settings.language')}</span>
    <span class="seg">
      <button class="btn lang-en">EN</button>
      <button class="btn lang-tr">TR</button>
    </span>
  </div>`);
  c.appendChild(langRow);
  const bEn = langRow.querySelector('.lang-en') as HTMLButtonElement;
  const bTr = langRow.querySelector('.lang-tr') as HTMLButtonElement;
  const applyLang = (l: Lang): void => {
    S.settings.lang = l;
    setLang(l);
    sfx.click();
    renderTabbar();
    renderTab('settings');
    rotateNews(true);
  };
  bEn.addEventListener('click', () => applyLang('en'));
  bTr.addEventListener('click', () => applyLang('tr'));
  updaters.push(() => {
    bEn.classList.toggle('on', getLang() === 'en');
    bTr.classList.toggle('on', getLang() === 'tr');
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

  c.appendChild(el(`<div class="about">${t('settings.about')}</div>`));
}

// ---------- Haber bandı ----------

export function rotateNews(immediate = false): void {
  const box = $('#ticker');
  const pool = NEWS.filter((n) => n.vehicleId === null || S.lines[n.vehicleId]?.unlocked);
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
  bar.innerHTML = `<span>${def.mult >= 1 ? '📈' : '📉'} ${eventFxText(def)}</span><b>${fmtTime((ev.until - Date.now()) / 1000)}</b>`;
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
