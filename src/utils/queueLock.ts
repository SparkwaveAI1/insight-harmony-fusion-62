const LOCK_KEY = 'persona-queue-processing-lock';
const DEFAULT_TTL_MS = 60_000; // 60s

type LockPayload = { until: number; by: string };

export function tryAcquireQueueLock(ttlMs: number = DEFAULT_TTL_MS): boolean {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      const payload = JSON.parse(raw) as LockPayload;
      if (Date.now() < payload.until) return false; // lock still valid
    }
    const by = `${location.pathname}#${Date.now()}`;
    localStorage.setItem(LOCK_KEY, JSON.stringify({ until: Date.now() + ttlMs, by }));
    return true;
  } catch {
    // Fail-open only for localStorage errors
    return true;
  }
}

export function renewQueueLock(ttlMs: number = DEFAULT_TTL_MS): void {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    const by = raw ? (JSON.parse(raw) as LockPayload).by : `${location.pathname}#${Date.now()}`;
    localStorage.setItem(LOCK_KEY, JSON.stringify({ until: Date.now() + ttlMs, by }));
  } catch {/* noop */}
}

export function releaseQueueLock(): void {
  try { localStorage.removeItem(LOCK_KEY); } catch {/* noop */}
}

export function readQueueLock(): LockPayload | null {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LockPayload;
  } catch { return null; }
}