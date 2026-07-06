// Reklam soyutlaması. Web'de simüle edilir; Capacitor sürümünde bu modül
// AdMob eklentisine bağlanacak (arayüz aynı kalır).

import { t } from '../i18n';

export function showRewardedAd(onReward: () => void): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal ad-modal">
      <div class="ad-spinner"></div>
      <div class="ad-title">${t('ui.adPlaying')}</div>
      <div class="ad-note">${t('ui.adSim')}</div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.remove();
    onReward();
  }, 2500);
}
