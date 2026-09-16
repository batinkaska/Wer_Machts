import { type Analytics, getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { app } from "../firebase/config";
import { getCookieConsent, onCookieConsentChanged } from "./cookieConsent";

let analytics: Analytics | null = null;
let enabled = false;

async function enable() {
  try {
    if (!analytics) {
      const supported = await isSupported().catch(() => false);
      if (!supported || !import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return;
      analytics = getAnalytics(app);
    }
    setAnalyticsCollectionEnabled(analytics, true);
    enabled = true;
  } catch {
    // Missing/invalid measurement ID or an unsupported environment — fail silently,
    // analytics is a non-essential enhancement and must never break the app.
  }
}

function disable() {
  enabled = false;
  if (analytics) setAnalyticsCollectionEnabled(analytics, false);
}

/** Call once at app startup. Respects the existing cookie-consent choice and reacts to later changes. */
export function initAnalytics() {
  if (getCookieConsent()?.analytics) void enable();

  onCookieConsentChanged((consent) => {
    if (consent.analytics) void enable();
    else disable();
  });
}

export function logAnalyticsEvent(name: string, params?: Record<string, unknown>) {
  if (!enabled || !analytics) return;
  logEvent(analytics, name, params);
}
