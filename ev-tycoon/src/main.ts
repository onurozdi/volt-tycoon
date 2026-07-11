import './style.css';
import { AUTOSAVE_INTERVAL, SAVE_KEY } from './core/config';
import { isPaused } from './core/clock';
import { computeOffline, setEngineEvents, tick } from './core/engine';
import { loadGame, newGame, resetGame, saveGame } from './core/state';
import { detectLang, setLang, t } from './i18n';
import { sfx } from './ui/audio';
import { initUI, persist, saleFloat, showBankruptcy, showCompanyPrompt, showContractOffer, showNewsEvent, showWelcomeBack, toast, updateFrame } from './ui/render';
import { fmtMoney } from './core/formulas';
import { initTutorial } from './ui/tutorial';
import { hydrateFromNative } from './core/storage';

// Tüm başlangıç async fonksiyonda: Android'de Preferences yedeği oyun
// yüklenmeden ÖNCE okunmalı (web'de anında geçer). Top-level await yerine
// sarmalayıcı kullanıyoruz — eski WebView hedefleriyle de uyumlu.
async function boot(): Promise<void> {
  await hydrateFromNative();

  const state = loadGame() ?? newGame(detectLang());
  setLang(state.settings.lang);

  // Geliştirme kolaylığı: konsoldan durum incelemek için
  (window as unknown as { __state: unknown }).__state = state;

  // Motor olayları → görsel/işitsel geri bildirim.
  // Otomatik (manager'lı) üretim/satışta ses çalınmaz; sesler yalnızca
  // oyuncunun kendi başlattığı işlemlerde gelir — aksi halde hızlanan
  // üretim sürekli bip sesine dönüşüyor.
  setEngineEvents({
    onSale: (id, amount) => {
      if (!state.lines[id]?.salesManager) sfx.sale();
      // uçan para: yalnızca Home sekmesinde, o aracın satış barının ucundan
      saleFloat(id, amount);
    },
    onProduce: (id) => {
      if (!state.lines[id]?.prodManager) sfx.produce();
    },
    onAchievement: (id, gems) => {
      sfx.achievement();
      toast(t('toast.achievement', { name: t('ach.' + id), gems }), 'gold');
    },
    onNewsEvent: (def, extra) => {
      sfx.news();
      showNewsEvent(def, extra);
    },
    onBankrupt: () => {
      sfx.error();
      showBankruptcy();
    },
    onContractOffer: (offer) => {
      sfx.news();
      showContractOffer(offer);
    },
    onContractFailed: (c, penalty, gemsLost) => {
      sfx.error();
      const key = gemsLost > 0 ? 'ct.failedGems' : 'ct.failed';
      toast(t(key, { issuer: t('issuer.' + c.issuerId), penalty: fmtMoney(penalty), gems: gemsLost }), 'err');
    },
  });

  // Offline ilerleme (açılışta)
  const report = computeOffline(state, Date.now());

  initUI(state);
  // Şirket adı yoksa önce onu sor; öğretici (gerekiyorsa) ardından başlar
  if (!state.companyName) showCompanyPrompt(() => initTutorial(state));
  else initTutorial(state);
  if (report) showWelcomeBack(report);

  // Açılış animasyonu: oyun hazır — en az ~1.4sn gösterim, dokununca atlanır
  const bootEl = document.getElementById('boot');
  if (bootEl) {
    const closeBoot = (): void => {
      bootEl.classList.add('out');
      setTimeout(() => bootEl.remove(), 450);
    };
    setTimeout(closeBoot, Math.max(0, 1400 - performance.now()));
    bootEl.addEventListener('pointerdown', closeBoot, { once: true });
  }

  // Ana döngü: sabit zamanlayıcı (arka planda rAF durduğu için ona bağlanmıyoruz)
  let last = performance.now();
  let saveAcc = 0;

  function step(): void {
    const now = performance.now();
    let dt = (now - last) / 1000;
    last = now;
    // Haber popup'ı açıkken oyun duraklatılır — üretim/satış/etki ilerlemez
    if (isPaused()) {
      updateFrame(0);
      return;
    }
    // Sekme arka planda uzun kalırsa dev dt gelmesin (offline hesabı ayrı ele alınır)
    if (dt > 1) dt = 1;
    if (dt > 0) {
      tick(state, dt);
      updateFrame(dt);
      saveAcc += dt;
      if (saveAcc >= AUTOSAVE_INTERVAL) {
        saveAcc = 0;
        persist();
      }
    }
  }
  setInterval(step, 100);

  // Görünürlük değişimlerinde kaydet; geri dönüşte offline hesapla
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveGame(state);
    } else {
      const rep = computeOffline(state, Date.now());
      state.lastSeen = Date.now();
      last = performance.now();
      if (rep) showWelcomeBack(rep);
    }
  });

  window.addEventListener('beforeunload', () => saveGame(state));

  // Başka bir sekmede kayıt sıfırlanırsa bu sekme eski durumu geri yazmasın:
  // kaydı devre dışı bırak ve baştan başla
  window.addEventListener('storage', (e) => {
    if (e.key === SAVE_KEY && e.newValue === null) {
      resetGame();
      location.reload();
    }
  });
}

void boot();
