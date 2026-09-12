const STORAGE_KEY = "wermacht_cookie_consent";
const REOPEN_EVENT = "cookie-consent-reopen";
const CHANGED_EVENT = "cookie-consent-changed";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: { analytics: boolean; marketing: boolean }): CookieConsent {
  const consent: CookieConsent = { necessary: true, ...choice, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // localStorage unavailable (private browsing etc.) — the choice just won't
    // persist across reloads; the banner will ask again next time.
  }
  window.dispatchEvent(new CustomEvent<CookieConsent>(CHANGED_EVENT, { detail: consent }));
  return consent;
}

/** Re-opens the cookie banner so the user can change an earlier decision (e.g. from the footer). */
export function reopenCookieBanner() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onReopenCookieBanner(handler: () => void): () => void {
  window.addEventListener(REOPEN_EVENT, handler);
  return () => window.removeEventListener(REOPEN_EVENT, handler);
}

export function onCookieConsentChanged(handler: (consent: CookieConsent) => void): () => void {
  function listener(e: Event) {
    handler((e as CustomEvent<CookieConsent>).detail);
  }
  window.addEventListener(CHANGED_EVENT, listener);
  return () => window.removeEventListener(CHANGED_EVENT, listener);
}
