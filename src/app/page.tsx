'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/authGuard';

export default function RootHomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace('/role-selection');
    } else if (session.role === 'officer') {
      router.replace('/officer/dashboard');
    } else if (session.role === 'bidder') {
      router.replace('/bidder/dashboard');
    } else {
      router.replace('/role-selection');
    }
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2F63] to-[#1D4ED8] text-white font-black text-xl shadow-md ring-4 ring-blue-100 animate-pulse">
          GeM
        </div>
        <p className="text-xs font-bold text-slate-500">Routing to Authorized Portal...</p>
      </div>
    </div>
  );
}
