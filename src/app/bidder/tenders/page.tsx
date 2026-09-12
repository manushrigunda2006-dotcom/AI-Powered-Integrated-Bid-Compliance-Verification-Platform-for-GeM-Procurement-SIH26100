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
  ArrowRight,
  Upload,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { tenderService } from '@/services/tenderService';
import { tenderRequiredDocumentService } from '@/services/tenderRequiredDocumentService';
import { bidSubmissionService, BidSubmission } from '@/services/bidSubmissionService';
import { Tender, TenderRequiredDocument } from '@/lib/types';
import { formatDate, formatIndianCurrency } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderTendersPage() {
  const { session, isAuthenticated, isAuthorized, isLoading: authLoading } = useBidderAuth(true);
  const { t } = useLanguage();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tenderDocsMap, setTenderDocsMap] = useState<Record<string, TenderRequiredDocument[]>>({});
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, BidSubmission | null>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTendersAndMeta() {
      if (!session?.bidderId) return;
      setIsLoading(true);
      try {
        const list = await tenderService.getTenders();
        setTenders(list);

        const docsMap: Record<string, TenderRequiredDocument[]> = {};
        const subsMap: Record<string, BidSubmission | null> = {};

        await Promise.all(
          list.map(async (tender) => {
            const docs = await tenderRequiredDocumentService.getRequiredDocuments(tender.id);
            docsMap[tender.id] = docs;
            subsMap[tender.id] = bidSubmissionService.getSubmission(session.bidderId, tender.id);
          })
        );

        setTenderDocsMap(docsMap);
        setSubmissionsMap(subsMap);
      } catch (err) {
        console.error('Error fetching tenders:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.bidderId) {
      loadTendersAndMeta();
    }
  }, [session?.bidderId]);

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
          {t('Bidder Dashboard')}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">{t('Available Tenders')}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
              {t('Active GeM Procurements')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-md">
              {tenders.length} {t('Open RFPs')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('Available Tenders for Bidding')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            {t('Browse published government RFP tenders, review required compliance documents, and upload your submission dossier.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/bidder/submit"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('Upload Documents')}</span>
          </Link>
          <Link
            href="/bidder/dashboard#submissions"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer"
          >
            <span>{t('My Active Submissions')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search tender title, GEM RFP number or ministry...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {t('Showing')} <strong className="text-slate-800">{filteredTenders.length}</strong> {t('available tenders')}
        </div>
      </div>

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            {t('Loading available tenders and requirements...')}
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            {t('No tenders found matching your search.')}
          </div>
        ) : (
          filteredTenders.map((tender) => {
            const reqDocs = tenderDocsMap[tender.id] || [];
            const totalDocsCount = reqDocs.length || 8;
            const mandatoryDocsCount = reqDocs.filter((d) => d.is_mandatory).length || 6;
            const sub = submissionsMap[tender.id];
            const isSubmitted = sub !== null && sub !== undefined;

            return (
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
                      {isSubmitted ? (
                        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('Submitted')} - {t(sub.complianceStatus)}</span>
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-200">
                          {t('Open for Bidding')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {tender.title}
                    </h2>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t(tender.department)}</span>
                    </div>
                  </div>

                  {/* Action Buttons for Bidder */}
                  <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0">
                    <Link
                      href={`/bidder/tenders/${tender.id}/submit`}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      {t('View Tender')}
                    </Link>
                    <Link
                      href={`/bidder/tenders/${tender.id}/submit`}
                      className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isSubmitted ? t('View / Update Dossier') : t('Upload Documents')}</span>
                    </Link>
                  </div>
                </div>

                {/* Quick Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t('Estimated Budget')}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {tender.budget_formatted || formatIndianCurrency(tender.estimated_budget)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t('Submission Deadline')}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatDate(tender.deadline)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t('Required Documents')}
                    </span>
                    <span className="text-xs font-bold text-blue-950 flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-blue-700" />
                      <span>{totalDocsCount} {t('Required')} ({mandatoryDocsCount} {t('Mandatory')})</span>
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t('Procurement Status')}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {t('Active / Open RFP')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
