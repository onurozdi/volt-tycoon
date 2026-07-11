// Kayıt köprüsü: oyun canlı olarak localStorage kullanır (senkron, hızlı);
// native platformda her kayıt Capacitor Preferences'a da AYNALANIR.
// Android WebView localStorage'ı silebilir — Preferences kalıcıdır.
// Açılışta: native'de Preferences'ta kayıt varsa localStorage'a geri yüklenir.

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { SAVE_KEY } from './config';

const isNative = Capacitor.isNativePlatform();

/** Açılışta native yedekten localStorage'ı doldurur (oyun başlamadan çağrılır) */
export async function hydrateFromNative(): Promise<void> {
  if (!isNative) return;
  try {
    const { value } = await Preferences.get({ key: SAVE_KEY });
    if (!value) return;
    const local = localStorage.getItem(SAVE_KEY);
    // Native yedek varsa ve localStorage boşsa (veya native daha yeniyse) geri yükle
    if (!local) {
      localStorage.setItem(SAVE_KEY, value);
      return;
    }
    try {
      const nativeSave = JSON.parse(value) as { lastSeen?: number };
      const localSave = JSON.parse(local) as { lastSeen?: number };
      if ((nativeSave.lastSeen ?? 0) > (localSave.lastSeen ?? 0)) {
        localStorage.setItem(SAVE_KEY, value);
      }
    } catch {
      // bozuk yerel kayıt — native yedeği kullan
      localStorage.setItem(SAVE_KEY, value);
    }
  } catch {
    // Preferences erişilemedi — localStorage ile devam
  }
}

/** Her kayıtta native yedeğe yaz (beklenmez, arka planda) */
export function mirrorToNative(json: string): void {
  if (!isNative) return;
  void Preferences.set({ key: SAVE_KEY, value: json }).catch(() => {});
}

/** Sıfırlamada native yedeği de sil */
export function clearNative(): void {
  if (!isNative) return;
  void Preferences.remove({ key: SAVE_KEY }).catch(() => {});
}
