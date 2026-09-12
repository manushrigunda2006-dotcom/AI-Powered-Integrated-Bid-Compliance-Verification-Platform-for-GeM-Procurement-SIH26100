'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BidderSubmitRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bidder/tenders/tender-gem-2026-cloud/submit');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Routing to Tender Document Submission...</p>
      </div>
    </div>
  );
}
