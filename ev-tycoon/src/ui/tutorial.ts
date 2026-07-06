// Basit, atlanabilir başlangıç öğreticisi.
// Akış: 1-2 cümlelik hikâye modali → alt yönlendirme balonu + hedef
// düğmede altın parlama. Eylem adımları (üret/sat/teknisyen) oyuncunun
// gerçek eylemiyle kendiliğinden ilerler; kavram adımları tek dokunuşla
// geçilir. Her an "Geç" ile atlanabilir. tutStep kayıtla birlikte saklanır.

import type { GameState } from '../core/state';
import { t } from '../i18n';
import { sfx } from './audio';

interface TutStep {
  key: string;
  /** parlatılacak öğe (yoksa yalnızca balon) */
  target?: string;
  /** koşul sağlanınca adım kendiliğinden ilerler; yoksa DEVAM butonu çıkar */
  done?: (s: GameState) => boolean;
}

const STEPS: TutStep[] = [
  { key: 'tut.s1', target: '.vcard .btn-produce', done: (s) => s.stats.totalProduced >= 1 },
  { key: 'tut.s2', target: '.vcard .btn-sell', done: (s) => s.stats.totalSold >= 1 },
  { key: 'tut.s3', target: '.vcard .buy-tech', done: (s) => Object.values(s.lines).some((l) => l.technicians > 0) },
  { key: 'tut.s4', target: '.vcard .buy-pm' },
  { key: 'tut.s5', target: '#tabbar .tab[data-tab="research"]' },
  { key: 'tut.s6' },
];

const DONE = 99;

let S: GameState;
let bubble: HTMLElement | null = null;
let glowEl: Element | null = null;
let timer: number | null = null;
let renderedStep = -1;

export function initTutorial(state: GameState): void {
  S = state;
  if (S.tutStep >= DONE) return;
  if (S.tutStep === 0) showStory();
  timer = window.setInterval(tick, 300);
}

function showStory(): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal tut-story">
      <div class="tut-emoji">🔧⚡</div>
      <h2>VOLT TYCOON</h2>
      <p>${t('tut.story')}</p>
      <div class="modal-btns">
        <button class="btn btn-buy tut-skip-all">${t('tut.skip')}</button>
        <button class="btn btn-unlock tut-start">${t('tut.start')}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  (overlay.querySelector('.tut-start') as HTMLButtonElement).addEventListener('click', () => {
    sfx.click();
    overlay.remove();
    S.tutStep = 1;
  });
  (overlay.querySelector('.tut-skip-all') as HTMLButtonElement).addEventListener('click', () => {
    overlay.remove();
    finish();
  });
}

function tick(): void {
  if (S.tutStep >= DONE) {
    finish();
    return;
  }
  if (S.tutStep === 0) return; // hikâye modali açık

  const step = STEPS[S.tutStep - 1];
  if (!step) {
    finish();
    return;
  }

  // Eylem adımı tamamlandıysa sıradakine geç
  if (step.done && step.done(S)) {
    sfx.achievement();
    S.tutStep += 1;
    renderedStep = -1;
    if (S.tutStep - 1 >= STEPS.length) finish();
    return;
  }

  if (renderedStep !== S.tutStep) {
    renderedStep = S.tutStep;
    renderBubble(step);
  }
  applyGlow(step.target);
}

function renderBubble(step: TutStep): void {
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.className = 'tut-bubble';
    document.body.appendChild(bubble);
  }
  const needsNext = !step.done;
  bubble.innerHTML = `
    <span class="tut-text">${t(step.key)}</span>
    <span class="tut-btns">
      ${needsNext ? `<button class="btn tut-next">${t('tut.next')}</button>` : ''}
      <button class="btn tut-skip">${t('tut.skip')}</button>
    </span>`;
  bubble.querySelector('.tut-next')?.addEventListener('click', () => {
    sfx.click();
    S.tutStep += 1;
    renderedStep = -1;
    if (S.tutStep - 1 >= STEPS.length) finish();
  });
  (bubble.querySelector('.tut-skip') as HTMLButtonElement).addEventListener('click', () => finish());
}

function applyGlow(target?: string): void {
  const el = target ? document.querySelector(target) : null;
  if (el !== glowEl) {
    glowEl?.classList.remove('tut-glow');
    glowEl = el;
  }
  // Kart güncelleyicileri className'i her karede yeniden yazabildiği için
  // sınıfı her tikte tazele
  if (glowEl && !glowEl.classList.contains('tut-glow')) glowEl.classList.add('tut-glow');
}

function finish(): void {
  S.tutStep = DONE;
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  glowEl?.classList.remove('tut-glow');
  glowEl = null;
  bubble?.remove();
  bubble = null;
}
