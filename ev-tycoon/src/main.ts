import './style.css';
import { AUTOSAVE_INTERVAL, SAVE_KEY } from './core/config';
import { computeOffline, setEngineEvents, tick } from './core/engine';
import { fmtMoney } from './core/formulas';
import { loadGame, newGame, resetGame, saveGame } from './core/state';
import { detectLang, setLang, t } from './i18n';
import { sfx } from './ui/audio';
import { floatMoney, initUI, persist, showNewsEvent, showWelcomeBack, toast, updateFrame } from './ui/render';

const state = loadGame() ?? newGame(detectLang());
setLang(state.settings.lang);

// Geliştirme kolaylığı: konsoldan durum incelemek için
(window as unknown as { __state: unknown }).__state = state;

// Motor olayları → görsel/işitsel geri bildirim.
// Otomatik (manager'lı) üretim/satışta ses çalınmaz; sesler yalnızca
// oyuncunun kendi başlattığı işlemlerde gelir — aksi halde hızlanan
// üretim sürekli bip sesine dönüşüyor.
let lastFloat = 0;
setEngineEvents({
  onSale: (id, amount) => {
    if (!state.lines[id]?.salesManager) sfx.sale();
    // satış olduğunda paranın yanında küçük uçuş efekti (sık satışta seyrelt)
    const now = performance.now();
    if (now - lastFloat > 300) {
      lastFloat = now;
      const hud = document.querySelector('.hud-money');
      if (hud) {
        const r = hud.getBoundingClientRect();
        floatMoney(r.right + 8, r.bottom + 6, `+${fmtMoney(amount)}`);
      }
    }
  },
  onProduce: (id) => {
    if (!state.lines[id]?.prodManager) sfx.produce();
  },
  onAchievement: (id, gems) => {
    sfx.achievement();
    toast(t('toast.achievement', { name: t('ach.' + id), gems }), 'gold');
  },
  onNewsEvent: (def) => {
    sfx.news();
    showNewsEvent(def);
  },
});

// Offline ilerleme (açılışta)
const report = computeOffline(state, Date.now());

initUI(state);
if (report) showWelcomeBack(report);

// Ana döngü: sabit zamanlayıcı (arka planda rAF durduğu için ona bağlanmıyoruz)
let last = performance.now();
let saveAcc = 0;

function step(): void {
  const now = performance.now();
  let dt = (now - last) / 1000;
  last = now;
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
