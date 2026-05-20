// Stores DPDP consent + marketing opt-in across the magic-link redirect.
// Persisted to localStorage so it survives reload in same browser. Cleared
// after first profile insert.
const KEY = "ug_pending_consent";

export type PendingConsent = {
  consent_dpdp: boolean;
  consent_marketing: boolean;
  email: string;
};

export function savePendingConsent(c: PendingConsent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {}
}

export function readPendingConsent(): PendingConsent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingConsent) : null;
  } catch {
    return null;
  }
}

export function clearPendingConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
