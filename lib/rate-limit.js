const buckets = new Map();

export function rateLimit(request, { key = "global", limit = 20, windowMs = 60_000 } = {}) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const current = buckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  buckets.set(bucketKey, current);

  if (current.count > limit) {
    const error = new Error("Too many requests. Try again soon.");
    error.status = 429;
    throw error;
  }
}
