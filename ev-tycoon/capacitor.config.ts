import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ⚠️ App ID Play Store'a ilk yüklemeden sonra ASLA değiştirilemez
  appId: 'com.pocketforge.volttycoon',
  appName: 'Volt Tycoon',
  webDir: 'dist',
  backgroundColor: '#0a1128',
  android: {
    allowMixedContent: false,
  },
};

export default config;
