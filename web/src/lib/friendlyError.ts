import type { TFunction } from "i18next";

const ERROR_KEY_BY_CODE: Record<string, string> = {
  "auth/invalid-credential": "errors.invalidCredential",
  "auth/wrong-password": "errors.invalidCredential",
  "auth/user-not-found": "errors.invalidCredential",
  "auth/invalid-email": "errors.invalidEmail",
  "auth/user-disabled": "errors.userDisabled",
  "auth/email-already-in-use": "errors.emailInUse",
  "auth/weak-password": "errors.weakPassword",
  "auth/too-many-requests": "errors.tooManyRequests",
  "auth/network-request-failed": "errors.networkError",
  "auth/popup-closed-by-user": "errors.popupClosed",
  "auth/cancelled-popup-request": "errors.popupClosed",
  "auth/account-exists-with-different-credential": "errors.accountExistsDifferentCredential",
  "auth/requires-recent-login": "errors.requiresRecentLogin",
  "auth/invalid-phone-number": "errors.invalidPhoneNumber",
  "auth/missing-phone-number": "errors.invalidPhoneNumber",
  "auth/invalid-verification-code": "errors.invalidVerificationCode",
  "auth/missing-verification-code": "errors.invalidVerificationCode",
  "auth/code-expired": "errors.codeExpired",
  "auth/invalid-app-credential": "errors.phoneVerificationUnavailable",
  "auth/app-not-authorized": "errors.phoneVerificationUnavailable",
  "auth/captcha-check-failed": "errors.phoneVerificationUnavailable",
  "auth/expired-action-code": "errors.expiredActionCode",
  "auth/invalid-action-code": "errors.invalidActionCode",
  "storage/unauthorized": "errors.uploadUnauthorized",
  "storage/canceled": "errors.uploadCanceled",
  "storage/quota-exceeded": "errors.uploadFailed",
  "permission-denied": "errors.permissionDenied",
  "unavailable": "errors.networkError",
  "functions/failed-precondition": "errors.reviewNoSharedConversation",
  "functions/already-exists": "errors.reviewAlreadySubmitted",
};

function getErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err && typeof (err as { code?: unknown }).code === "string") {
    return (err as { code: string }).code;
  }
  return undefined;
}

/** Maps a Firebase (or similar) error to a simple, translated message — never the raw "Firebase: Error (...)" string. */
export function friendlyErrorMessage(err: unknown, t: TFunction, fallbackKey: string): string {
  const code = getErrorCode(err);
  const key = code ? ERROR_KEY_BY_CODE[code] : undefined;
  return t(key ?? fallbackKey);
}
