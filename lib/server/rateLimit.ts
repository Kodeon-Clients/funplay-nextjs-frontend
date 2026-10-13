/**
 * Small fixed-window, in-memory rate limiter keyed by an arbitrary string (usually
 * "<route>:<ip>"). On Vercel each serverless instance has its own memory, so this is best
 * effort only: it stops bursts from one client hitting a warm instance, not a distributed
 * attack. Use Vercel's firewall / a shared store if stronger limits are ever needed.
 */

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

function prune(now: number) {
  for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  // still too many live keys: drop the oldest entries (Map keeps insertion order)
  if (buckets.size > MAX_KEYS) {
    let drop = buckets.size - MAX_KEYS;
    for (const k of buckets.keys()) {
      if (drop-- <= 0) break;
      buckets.delete(k);
    }
  }
}

export type RateResult = { ok: boolean; retryAfter: number };

/** Counts one hit for `key`; returns ok=false once more than `limit` hits fall in `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) prune(now);
  let b = buckets.get(key);
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  return { ok: b.count <= limit, retryAfter: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
}
