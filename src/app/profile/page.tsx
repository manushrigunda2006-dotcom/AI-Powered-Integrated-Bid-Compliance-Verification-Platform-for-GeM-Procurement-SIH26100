'use client';

import React from 'react';
import { useAuth } from '@/lib/authGuard';
import OfficerProfilePage from '@/app/officer/profile/page';
import BidderProfilePage from '@/app/bidder/profile/page';

export default function DynamicProfilePage() {
  const { session, role, isLoading } = useAuth({
    redirectTo: '/role-selection',
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (role === 'bidder') {
    return <BidderProfilePage />;
  }

  return <OfficerProfilePage />;
}
