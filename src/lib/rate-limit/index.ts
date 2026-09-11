import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMITS, RateLimitCategory, RateLimitTier } from './config';
import { resolveClientIdentity, ClientIdentity } from './identity';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds until next permitted request
  identity: ClientIdentity;
}

interface WindowBucket {
  count: number;
  windowStart: number;
}

/**
 * Sliding Window Counter in-memory store
 * Tracks { currentWindow, previousWindow } per client key
 */
class SlidingWindowStore {
  private store: Map<string, { current: WindowBucket; previous: WindowBucket }> = new Map();
  private lastCleanup: number = Date.now();
  private readonly cleanupIntervalMs = 60 * 1000; // 1 minute

  check(
    key: string,
    tier: RateLimitTier
  ): { success: boolean; limit: number; remaining: number; reset: number; retryAfter: number } {
    const now = Date.now();
    const windowMs = tier.windowSeconds * 1000;
    const currentWindowStart = Math.floor(now / windowMs) * windowMs;

    this.maybeCleanup(now, windowMs);

    let entry = this.store.get(key);
    if (!entry) {
      entry = {
        current: { count: 0, windowStart: currentWindowStart },
        previous: { count: 0, windowStart: currentWindowStart - windowMs },
      };
      this.store.set(key, entry);
    } else {
      // Advance windows if time has passed
      if (entry.current.windowStart < currentWindowStart) {
        if (entry.current.windowStart === currentWindowStart - windowMs) {
          entry.previous = entry.current;
        } else {
          entry.previous = { count: 0, windowStart: currentWindowStart - windowMs };
        }
        entry.current = { count: 0, windowStart: currentWindowStart };
      }
    }

    // Calculate sliding window weighted count
    const timeIntoCurrentWindow = now - currentWindowStart;
    const previousWindowWeight = Math.max(0, (windowMs - timeIntoCurrentWindow) / windowMs);
    const estimatedCount = Math.floor(entry.previous.count * previousWindowWeight) + entry.current.count;

    const limit = tier.maxRequests;
    const reset = Math.ceil((currentWindowStart + windowMs) / 1000);

    if (estimatedCount >= limit) {
      // Calculate retryAfter (seconds until enough weight drops to allow 1 more request)
      const excess = estimatedCount - limit + 1;
      const retryAfter = Math.max(1, Math.ceil((windowMs - timeIntoCurrentWindow) / 1000));
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfter,
      };
    }

    // Register hit
    entry.current.count += 1;
    const remaining = Math.max(0, limit - (estimatedCount + 1));

    return {
      success: true,
      limit,
      remaining,
      reset,
      retryAfter: 0,
    };
  }

  private maybeCleanup(now: number, windowMs: number) {
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;

    const threshold = now - windowMs * 2;
    for (const [key, entry] of this.store.entries()) {
      if (entry.current.windowStart < threshold) {
        this.store.delete(key);
      }
    }
  }

  // Reset store for testing
  reset() {
    this.store.clear();
  }
}

const memoryLimiter = new SlidingWindowStore();

/**
 * Main Rate Limit Checker for API Routes
 */
export async function checkRateLimit(
  request: Request | NextRequest,
  category: RateLimitCategory,
  customIdentifier?: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[category];
  const identity = await resolveClientIdentity(request, config.useCompositeKey);
  const tier = identity.isAuthenticated ? config.authenticated : config.anonymous;

  const key = customIdentifier || `${category}:${identity.identifier}`;
  const result = memoryLimiter.check(key, tier);

  return {
    ...result,
    identity,
  };
}

/**
 * Creates standard HTTP 429 Too Many Requests response
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Please wait ${result.retryAfter} seconds before trying again.`,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.reset.toString(),
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Injects RateLimit headers into an existing successful response
 */
export function applyRateLimitHeaders<T extends Response | NextResponse>(
  response: T,
  result: RateLimitResult
): T {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}

export { RATE_LIMITS } from './config';
export { resolveClientIdentity } from './identity';
