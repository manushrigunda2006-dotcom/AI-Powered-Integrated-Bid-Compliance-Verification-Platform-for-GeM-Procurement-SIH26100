import { NextRequest } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ClientIdentity {
  /** The primary key used for rate-limiting bucket lookup */
  identifier: string;
  /** Whether the request has a verified officer session / auth token */
  isAuthenticated: boolean;
  /** Validated client IP address */
  ip: string;
  /** Officer or user ID if authenticated */
  userId: string | null;
}

/**
 * Extracts a resilient, spoof-resistant IP address from request headers.
 */
export function extractClientIp(request: Request | NextRequest): string {
  const headers = request.headers;

  // Cloudflare Connecting IP (trusted when running behind Cloudflare)
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp.trim())) {
    return cfIp.trim();
  }

  // Nginx / NIC reverse proxy real IP
  const realIp = headers.get('x-real-ip');
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // Standard X-Forwarded-For: Client IP is the first entry
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    const candidate = ips[0];
    if (candidate && isValidIp(candidate)) {
      return candidate;
    }
  }

  // NextRequest connection IP if available
  if ('ip' in request && typeof (request as any).ip === 'string') {
    const ip = (request as any).ip;
    if (isValidIp(ip)) return ip;
  }

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  // IPv4 simple validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
  // IPv6 simple validation
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost';
}

/**
 * Resolves request identity, verifying bearer tokens against Supabase when configured,
 * or inspecting verified officer session tokens.
 */
export async function resolveClientIdentity(
  request: Request | NextRequest,
  useCompositeKey = false
): Promise<ClientIdentity> {
  const ip = extractClientIp(request);
  const authHeader = request.headers.get('authorization');
  let userId: string | null = null;
  let isAuthenticated = false;

  // Check 1: Bearer Token verification
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user?.id) {
          userId = data.user.id;
          isAuthenticated = true;
        }
      } catch {
        // Fallback to unauthenticated
      }
    } else if (token && token.startsWith('gem-officer-')) {
      // Local session token format
      userId = token;
      isAuthenticated = true;
    }
  }

  // Check 2: Officer Session Cookie or Header
  if (!isAuthenticated) {
    const officerHeader = request.headers.get('x-officer-id');
    if (officerHeader && officerHeader.startsWith('GEM-OFF-')) {
      userId = officerHeader;
      isAuthenticated = true;
    }
  }

  // Construct rate limiting identifier
  let identifier: string;
  if (isAuthenticated && userId) {
    if (useCompositeKey) {
      // Composite (userId + IP) prevents a compromised token from being abused across hundreds of rotating IPs
      identifier = `usr:${userId}:ip:${ip}`;
    } else {
      identifier = `usr:${userId}`;
    }
  } else {
    identifier = `ip:${ip}`;
  }

  return {
    identifier,
    isAuthenticated,
    ip,
    userId,
  };
}
