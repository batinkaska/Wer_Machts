import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wermacht.app',
  appName: 'Wer Macht',
  webDir: 'dist',
  // The app loads the live production site directly (instead of bundling a local
  // copy of dist/) so the WebView's origin genuinely is https://www.wermacht.app.
  // That means every domain-restricted integration already in place — Firebase
  // Auth authorized domains, the reCAPTCHA Enterprise site key (phone verification
  // + App Check), Stripe — keeps working with zero reconfiguration. It also means
  // web deploys (Vercel) reach the app instantly with no App Store review needed
  // for ordinary UI/content changes.
  server: {
    url: 'https://www.wermacht.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
