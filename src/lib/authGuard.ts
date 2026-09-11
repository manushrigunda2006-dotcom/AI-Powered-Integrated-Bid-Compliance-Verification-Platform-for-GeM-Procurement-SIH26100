'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from './supabase';

export interface OfficerSession {
  name: string;
  designation?: string;
  department: string;
  email: string;
  officerId: string;
  dscValid: boolean;
  authenticatedAt: string;
}

export function getOfficerSession(): OfficerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('gem_officer_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticatedOfficer(): boolean {
  if (typeof window === 'undefined') return false;
  return getOfficerSession() !== null;
}

export function logoutOfficer(router?: any): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gem_officer_session');
    localStorage.removeItem('gem_tender_draft');
  }
  if (isSupabaseConfigured()) {
    supabase.auth.signOut().catch(() => {});
  }
  if (router) {
    router.push('/login');
  } else if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function useOfficerAuth(redirectToLogin = true) {
  const router = useRouter();
  const [session, setSession] = useState<OfficerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const officer = getOfficerSession();

      if (officer) {
        setSession(officer);
        setIsLoading(false);
        return;
      }

      // If Supabase auth is active, check Supabase user
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            const mockSession: OfficerSession = {
              name: data.user.user_metadata?.full_name || 'ABCD',
              department: 'Ministry of Commerce & Industry / MeitY',
              email: data.user.email || 'abcd@gmail.com',
              officerId: 'GEM-OFF-2024-8841',
              dscValid: true,
              authenticatedAt: new Date().toISOString(),
            };
            localStorage.setItem('gem_officer_session', JSON.stringify(mockSession));
            setSession(mockSession);
            setIsLoading(false);
            return;
          }
        } catch {
          // fallback
        }
      }

      if (redirectToLogin) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [redirectToLogin, router]);

  return { session, isAuthenticated: session !== null, isLoading };
}
