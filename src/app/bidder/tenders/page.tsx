'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Search,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { tenderService } from '@/services/tenderService';
import { Tender } from '@/lib/types';
import { formatDate, formatIndianCurrency } from '@/lib/utils';

export default function BidderTendersPage() {
  const { session, isAuthenticated, isAuthorized, isLoading: authLoading } = useBidderAuth(true);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTenders() {
      setIsLoading(true);
      try {
        const list = await tenderService.getTenders();
        setTenders(list);
      } catch (err) {
        console.error('Error fetching tenders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTenders();
  }, []);

  const filteredTenders = tenders.filter((t) => {
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tender_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (authLoading || !isAuthorized || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Verifying Bidder Authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/bidder/dashboard" className="text-blue-900 hover:underline font-bold">
          Bidder Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Available Tenders</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
              Active GeM Procurements
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-md">
              {tenders.length} Open RFPs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Available Tenders for Bidding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Browse published government RFP tenders, review deterministic eligibility criteria, and track your active bids.
          </p>
        </div>

        <Link
          href="/bidder/dashboard"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <span>View My Active Submissions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tender title, GEM RFP number or ministry..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {tender.tender_number}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    Open for Bidding
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {tender.title}
                </h2>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tender.department}</span>
                </div>
              </div>

              {/* Action Buttons for Bidder */}
              <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0">
                <Link
                  href={`/tenders/${tender.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View RFP Specifications
                </Link>
                <Link
                  href="/bidder/dashboard"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>My Bid Status</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Estimated Budget
                </span>
                <span className="text-sm font-black text-slate-900">
                  {tender.budget_formatted || formatIndianCurrency(tender.estimated_budget)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Submission Deadline
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {formatDate(tender.deadline)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Mandatory Clauses
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {tender.requirements?.length || 6} Deterministic Criteria
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
