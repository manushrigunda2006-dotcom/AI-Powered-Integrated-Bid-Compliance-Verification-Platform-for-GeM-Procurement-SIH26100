'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'officer') {
      router.replace('/officer/login');
    } else if (role === 'bidder') {
      router.replace('/bidder/login');
    } else {
      router.replace('/role-selection');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Redirecting to Role Selection...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <LoginRedirector />
    </Suspense>
  );
}
