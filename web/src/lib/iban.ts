const IBAN_PATTERN = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/;

export function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function isValidIbanFormat(raw: string): boolean {
  return IBAN_PATTERN.test(normalizeIban(raw));
}

export function maskIban(raw: string): string {
  const clean = normalizeIban(raw);
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}
