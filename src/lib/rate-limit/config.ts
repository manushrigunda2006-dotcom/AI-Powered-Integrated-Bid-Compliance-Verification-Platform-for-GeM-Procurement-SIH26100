/**
 * Rate Limiting Configuration for GeM Compliance Assistant
 * Centralized rate limits separated by operation type and client authentication tier.
 */

export type RateLimitCategory =
  | 'read'
  | 'mutation'
  | 'verification'
  | 'documentExport'
  | 'upload'
  | 'auth';

export interface RateLimitTier {
  /** Maximum allowed requests within the time window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Optional burst capacity above the sustained rate */
  burstCapacity?: number;
}

export interface EndpointRateLimitConfig {
  authenticated: RateLimitTier;
  anonymous: RateLimitTier;
  /** Whether to use composite (userId + IP) for sensitive operations */
  useCompositeKey?: boolean;
}

/**
 * Standardized Rate Limits for GeM RegTech / GovTech Workload
 * 
 * RATIONALE:
 * - Read: High capacity for officer navigation and live dashboard refreshes.
 * - Mutation: Sane limits to prevent automated duplicate tender/decision submissions.
 * - Verification: Strict limit on CPU-intensive deterministic rule execution & registry polling.
 * - Document Export: Strict limit on memory-intensive Section 65B PDF generation.
 * - Auth: Strict anti-brute-force window (10 requests per 5 minutes per IP).
 */
export const RATE_LIMITS: Record<RateLimitCategory, EndpointRateLimitConfig> = {
  read: {
    authenticated: { maxRequests: 120, windowSeconds: 60 },
    anonymous: { maxRequests: 60, windowSeconds: 60 },
    useCompositeKey: false,
  },
  mutation: {
    authenticated: { maxRequests: 30, windowSeconds: 60 },
    anonymous: { maxRequests: 10, windowSeconds: 60 },
    useCompositeKey: true,
  },
  verification: {
    authenticated: { maxRequests: 15, windowSeconds: 60, burstCapacity: 5 },
    anonymous: { maxRequests: 5, windowSeconds: 60, burstCapacity: 2 },
    useCompositeKey: true,
  },
  documentExport: {
    authenticated: { maxRequests: 10, windowSeconds: 60 },
    anonymous: { maxRequests: 4, windowSeconds: 60 },
    useCompositeKey: true,
  },
  upload: {
    authenticated: { maxRequests: 10, windowSeconds: 60 },
    anonymous: { maxRequests: 5, windowSeconds: 600 },
    useCompositeKey: true,
  },
  auth: {
    authenticated: { maxRequests: 20, windowSeconds: 300 },
    anonymous: { maxRequests: 10, windowSeconds: 300 },
    useCompositeKey: false,
  },
};
