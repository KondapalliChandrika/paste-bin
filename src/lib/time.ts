/**
 * Get the current time in milliseconds since epoch.
 * Supports TEST_MODE with x-test-now-ms header for deterministic testing.
 */
export function getCurrentTime(testNowHeader?: string | null): number {
  // Check if TEST_MODE is enabled
  if (process.env.TEST_MODE === '1' && testNowHeader) {
    const testTime = parseInt(testNowHeader, 10);
    if (!isNaN(testTime)) {
      return testTime;
    }
  }

  return Date.now();
}

/**
 * Check if a paste has expired based on TTL
 */
export function isPasteExpired(
  createdAt: number | string | bigint,
  ttlSeconds: number | string | null | undefined,
  currentTime: number
): boolean {
  const ttl =
    ttlSeconds === null || ttlSeconds === undefined
      ? null
      : typeof ttlSeconds === 'bigint'
        ? Number(ttlSeconds)
        : Number(ttlSeconds);

  if (ttl === null) {
    return false;
  }

  const created = typeof createdAt === 'bigint'
    ? Number(createdAt)
    : Number(createdAt);

  const expiryTime = created + (ttl * 1000);
  return currentTime >= expiryTime;
}

/**
 * Get the expiry timestamp for a paste
 */
export function getExpiryTimestamp(
  createdAt: number | string | bigint,
  ttlSeconds: number | string | null | undefined
): string | null {
  // Convert created_at properly (handle BigInt)
  const created = typeof createdAt === 'bigint'
    ? Number(createdAt)
    : Number(createdAt);

  const ttl =
    ttlSeconds === null || ttlSeconds === undefined
      ? null
      : typeof ttlSeconds === 'bigint'
        ? Number(ttlSeconds)
        : Number(ttlSeconds);

  // Validate created timestamp
  if (!created || isNaN(created) || created <= 0) {
    console.error('Invalid created_at:', createdAt, '→', created);
    return null;
  }

  if (ttl === null || isNaN(ttl) || ttl <= 0) {
    return null;
  }

  const expiresAtMs = created + ttl * 1000;

  // Protect against JS max date limit
  const MAX = 8640000000000000;
  if (!expiresAtMs || isNaN(expiresAtMs) || Math.abs(expiresAtMs) > MAX) {
    console.error('Invalid expiry calculation:', { created, ttl, expiresAtMs });
    return null;
  }

  const expires = new Date(expiresAtMs);
  if (isNaN(expires.getTime())) {
    console.error('Invalid Date created:', expiresAtMs);
    return null;
  }

  return expires.toISOString();
}