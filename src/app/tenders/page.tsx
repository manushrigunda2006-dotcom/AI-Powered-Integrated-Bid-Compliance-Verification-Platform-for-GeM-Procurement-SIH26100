'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tender } from '@/lib/types';
import { tenderService } from '@/services/tenderService';
import { formatDate, formatIndianCurrency } from '@/lib/utils';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Search,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Users,
  Sparkles,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authGuard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ExistingTendersPage() {
  const router = useRouter();
  const { isBidder, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [tenders, setTenders] = useState<Tender[]>([]);

  useEffect(() => {
    if (isBidder) {
      router.replace('/bidder/tenders');
    }
  }, [isBidder, router]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
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

  const departments = ['ALL', ...Array.from(new Set(tenders.map((t) => t.department.split(',')[0].trim())))];

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tender_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || t.department.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="text-blue-900 hover:underline font-bold">
          Procurement Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Existing Tenders</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
              GeM RFP Repository
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-md">
              {tenders.length} Active Procurements
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Existing Tender RFPs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Manage active procurement tenders, inspect RFP eligibility criteria, and run automated compliance evaluations on bidder packets.
          </p>
        </div>

        <Link
          href="/tenders/new"
          className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Tender RFP</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tender title, GEM RFP number or ministry..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-500 font-bold shrink-0 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Ministry:</span>
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-6 shadow-xs hover:shadow-md transition-all space-y-4 group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {tender.tender_number}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    Technical Evaluation Phase
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {tender.title}
                </h2>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tender.department}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0">
                <Link
                  href={`/tenders/${tender.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Tender Details
                </Link>
                <Link
                  href={`/tenders/${tender.id}/bidders`}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Evaluate Bidders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
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
                  Closing Deadline
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {formatDate(tender.deadline)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Compliance Clauses
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {tender.requirements?.length || 6} Clauses Configured
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t('tender.enrolled_bidders', 'Enrolled Bidders')}
                </span>
                <span className="text-xs font-bold text-blue-900">
                  20 Bidder Packets Ready
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
