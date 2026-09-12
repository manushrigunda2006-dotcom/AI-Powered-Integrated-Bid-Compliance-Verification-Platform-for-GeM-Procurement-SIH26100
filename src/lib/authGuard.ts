'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from './supabase';
import { auditService } from '@/services/auditService';

export type UserRole = 'bidder' | 'officer';

export interface OfficerSession {
  role: 'officer';
  name: string;
  designation?: string;
  department: string;
  email: string;
  officerId: string;
  dscValid: boolean;
  authenticatedAt: string;
}

export interface BidderSession {
  role: 'bidder';
  companyName: string;
  contactPerson: string;
  email: string;
  bidderId: string;
  gstNumber: string;
  panNumber: string;
  udyamRegistration: string;
  cinNumber: string;
  authenticatedAt: string;
}

export type AuthSession = OfficerSession | BidderSession;

/**
 * Get current authenticated session from storage (bidder or officer)
 */
export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('gem_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === 'officer' || parsed?.role === 'bidder') {
        return parsed;
      }
    }
    // Backward compatibility: check gem_officer_session
    const officerRaw = localStorage.getItem('gem_officer_session');
    if (officerRaw) {
      const parsed = JSON.parse(officerRaw);
      return {
        role: 'officer',
        name: parsed.name || 'ABCD',
        designation: parsed.designation || 'Tender Evaluation Officer',
        department: parsed.department || 'Department of Public Procurement & IT Infrastructure',
        email: parsed.email || 'abcd@gmail.com',
        officerId: parsed.officerId || 'OFFICER-ABCD-001',
        dscValid: parsed.dscValid ?? true,
        authenticatedAt: parsed.authenticatedAt || new Date().toISOString(),
      };
    }
    // Backward compatibility: check gem_bidder_session
    const bidderRaw = localStorage.getItem('gem_bidder_session');
    if (bidderRaw) {
      const parsed = JSON.parse(bidderRaw);
      return {
        role: 'bidder',
        companyName: parsed.companyName || 'ABCD Technologies',
        contactPerson: parsed.contactPerson || 'Authorized Signatory',
        email: parsed.email || 'contact@abcd.example',
        bidderId: parsed.bidderId || 'bidder-01',
        gstNumber: parsed.gstNumber || '07AAAAA0000A1Z5',
        panNumber: parsed.panNumber || 'AAAAA0000A',
        udyamRegistration: parsed.udyamRegistration || 'UDYAM-AA-01-0000001',
        cinNumber: parsed.cinNumber || 'U72200AA2017PTC000001',
        authenticatedAt: parsed.authenticatedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get active Officer session (returns null if not logged in or if user is a Bidder)
 */
export function getOfficerSession(): OfficerSession | null {
  const session = getAuthSession();
  if (session && session.role === 'officer') {
    return session as OfficerSession;
  }
  return null;
}

/**
 * Get active Bidder session (returns null if not logged in or if user is an Officer)
 */
export function getBidderSession(): BidderSession | null {
  const session = getAuthSession();
  if (session && session.role === 'bidder') {
    return session as BidderSession;
  }
  return null;
}

export function getUserRole(): UserRole | null {
  const session = getAuthSession();
  return session ? session.role : null;
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

export function isAuthenticatedOfficer(): boolean {
  return getOfficerSession() !== null;
}

export function isAuthenticatedBidder(): boolean {
  return getBidderSession() !== null;
}

/**
 * Set an authenticated officer session
 */
export function setOfficerSession(officer: Partial<OfficerSession>): OfficerSession {
  const session: OfficerSession = {
    role: 'officer',
    name: officer.name || 'ABCD',
    designation: officer.designation || 'Tender Evaluation Officer',
    department: officer.department || 'Department of Public Procurement & IT Infrastructure',
    email: officer.email || 'abcd@gmail.com',
    officerId: officer.officerId || 'OFFICER-ABCD-001',
    dscValid: officer.dscValid ?? true,
    authenticatedAt: officer.authenticatedAt || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('gem_auth_session', JSON.stringify(session));
    localStorage.setItem('gem_officer_session', JSON.stringify(session));
    localStorage.removeItem('gem_bidder_session');
  }

  return session;
}

/**
 * Set an authenticated bidder session
 */
export function setBidderSession(bidder: Partial<BidderSession>): BidderSession {
  const session: BidderSession = {
    role: 'bidder',
    companyName: bidder.companyName || 'ABCD Technologies',
    contactPerson: bidder.contactPerson || 'Authorized Representative - ABCD',
    email: bidder.email || 'contact@abcd.example',
    bidderId: bidder.bidderId || 'bidder-01',
    gstNumber: bidder.gstNumber || '07AAAAA0000A1Z5',
    panNumber: bidder.panNumber || 'AAAAA0000A',
    udyamRegistration: bidder.udyamRegistration || 'UDYAM-AA-01-0000001',
    cinNumber: bidder.cinNumber || 'U72200AA2017PTC000001',
    authenticatedAt: bidder.authenticatedAt || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('gem_auth_session', JSON.stringify(session));
    localStorage.setItem('gem_bidder_session', JSON.stringify(session));
    localStorage.removeItem('gem_officer_session');
  }

  return session;
}

/**
 * Comprehensive logout: clears all session tokens, role credentials, and drafts
 */
export function logout(router?: any, redirectPath = '/role-selection'): void {
  // 1. Read currently authenticated user's information BEFORE clearing session
  const currentSession = getAuthSession();
  if (currentSession) {
    const role: 'Officer' | 'Bidder' = currentSession.role === 'officer' ? 'Officer' : 'Bidder';
    const userName =
      currentSession.role === 'officer'
        ? (currentSession.name || 'ABCD')
        : (currentSession.companyName || currentSession.contactPerson || 'ABCD');

    // 2. Create the LOGOUT audit event with actual timestamp
    try {
      auditService.recordAuthEvent({
        eventType: 'LOGOUT',
        userName,
        role,
        sessionInfo: `${role} (${userName}) signed out at ${new Date().toISOString()}`,
      });
    } catch (err) {
      console.warn('Notice recording logout audit event:', err);
    }
  }

  // 3. Clear session and tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gem_auth_session');
    localStorage.removeItem('gem_officer_session');
    localStorage.removeItem('gem_bidder_session');
    localStorage.removeItem('gem_tender_draft');
  }
  if (isSupabaseConfigured()) {
    supabase.auth.signOut().catch(() => {});
  }

  // 4. Redirect
  if (router) {
    router.push(redirectPath);
  } else if (typeof window !== 'undefined') {
    window.location.href = redirectPath;
  }
}

// Kept for backward compatibility
export function logoutOfficer(router?: any): void {
  logout(router, '/role-selection');
}

export function logoutBidder(router?: any): void {
  logout(router, '/role-selection');
}

/**
 * Primary multi-role authorization hook
 */
export function useAuth(options?: {
  requiredRole?: UserRole;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const currentSession = getAuthSession();

    if (!currentSession) {
      // Unauthenticated
      setSession(null);
      setIsLoading(false);
      if (options?.requiredRole) {
        const target = options.redirectTo || (options.requiredRole === 'officer' ? '/officer/login' : '/bidder/login');
        router.push(target);
      }
      return;
    }

    // Role-based route enforcement
    if (options?.requiredRole && currentSession.role !== options.requiredRole) {
      setSession(currentSession);
      setIsLoading(false);
      // Unauthorized cross-role access: redirect to that role's own authorized dashboard
      if (currentSession.role === 'officer') {
        router.push('/officer/dashboard');
      } else {
        router.push('/bidder/dashboard');
      }
      return;
    }

    setSession(currentSession);
    setIsLoading(false);
  }, [options?.requiredRole, options?.redirectTo, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    session,
    role: session?.role || null,
    isAuthenticated: session !== null,
    isOfficer: session?.role === 'officer',
    isBidder: session?.role === 'bidder',
    isAuthorized: options?.requiredRole ? session?.role === options.requiredRole : session !== null,
    isLoading,
    logout: () => logout(router),
  };
}

/**
 * Officer-specific auth hook: prevents Bidders from accessing Officer screens
 */
export function useOfficerAuth(redirectToLogin = true) {
  const { session, isAuthenticated, isAuthorized, isLoading, logout } = useAuth({
    requiredRole: 'officer',
    redirectTo: redirectToLogin ? '/officer/login' : undefined,
  });

  return {
    session: session as OfficerSession | null,
    isAuthenticated,
    isAuthorized,
    isLoading,
    logout,
  };
}

/**
 * Bidder-specific auth hook: prevents Officers from accessing Bidder-only screens
 */
export function useBidderAuth(redirectToLogin = true) {
  const { session, isAuthenticated, isAuthorized, isLoading, logout } = useAuth({
    requiredRole: 'bidder',
    redirectTo: redirectToLogin ? '/bidder/login' : undefined,
  });

  return {
    session: session as BidderSession | null,
    isAuthenticated,
    isAuthorized,
    isLoading,
    logout,
  };
}
