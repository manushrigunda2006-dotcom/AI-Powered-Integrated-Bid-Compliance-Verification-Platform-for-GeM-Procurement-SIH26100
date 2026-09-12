'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Download,
  Send,
  HelpCircle,
  FileCheck2,
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { bidderService } from '@/services/bidderService';
import { MOCK_TENDER, MOCK_BIDDERS } from '@/lib/mock-data/tender-seed';
import { Bidder, Tender } from '@/lib/types';
import { formatIndianCurrency, formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { session, isAuthenticated, isAuthorized, isLoading } = useBidderAuth(true);

  const [bidderData, setBidderData] = useState<Bidder | null>(null);
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [clarificationSent, setClarificationSent] = useState(false);

  useEffect(() => {
    if (session?.bidderId) {
      // Find matching mock bidder or fetch via service
      const matched =
        MOCK_BIDDERS.find(
          (b) =>
            b.id === session.bidderId ||
            b.id.includes(session.bidderId) ||
            session.bidderId.includes(b.id)
        ) || MOCK_BIDDERS[0];

      setBidderData(matched);
    }
  }, [session]);

  if (isLoading || !isAuthorized || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Verifying Bidder Credentials &amp; Access...</p>
        </div>
      </div>
    );
  }

  const bidder = bidderData || MOCK_BIDDERS[0];
  const tender = MOCK_TENDER;

  const isLowRisk = bidder.risk_level === 'LOW';
  const isMediumRisk = bidder.risk_level === 'MEDIUM';
  const isHighRisk = bidder.risk_level === 'HIGH';

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationResponse.trim()) return;
    setClarificationSent(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-md">
              {t('app.bidder_portal')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Session Authenticated</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            {session.companyName}
          </h1>
          <p className="text-xs text-slate-600">
            GSTIN: <span className="font-mono font-bold text-slate-800">{session.gstNumber}</span> • PAN: <span className="font-mono font-bold text-slate-800">{session.panNumber}</span> • Contact: <span className="font-semibold text-slate-800">{session.contactPerson}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/bidder/logs"
            className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-900 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('nav.my_logs')}</span>
          </Link>
          <Link
            href="/bidder/profile"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('nav.company_profile')}</span>
          </Link>
        </div>
      </div>

      {/* Tender Participation Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                {tender.tender_number}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                Enrolled RFP
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {tender.title}
            </h2>
            <p className="text-xs text-slate-500 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{tender.department}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Estimated Tender Value
              </span>
              <span className="text-base font-black text-slate-900">
                {tender.budget_formatted || formatIndianCurrency(tender.estimated_budget)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Status Box 1: Compliance Score */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block">
                {t('bidder.overall_score')}
              </span>
              <span className="text-2xl font-black text-slate-900">
                {bidder.overall_score}/100
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isLowRisk
                  ? 'bg-emerald-100 text-emerald-800'
                  : isMediumRisk
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {bidder.risk_level === 'LOW'
                ? t('status.low_risk')
                : bidder.risk_level === 'MEDIUM'
                ? t('status.medium_risk')
                : t('status.high_risk')}
            </span>
          </div>

          {/* Status Box 2: Standing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 block">
              {t('bidder.officer_decision')}
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              {isLowRisk ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">{t('status.qualified')}</span>
                </>
              ) : isMediumRisk ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-700">{t('status.clarification')}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-red-700">{t('status.disqualified')}</span>
                </>
              )}
            </div>
          </div>

          {/* Status Box 3: Registry Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10.5px] uppercase font-bold text-slate-400 block">
              Registry Standing
            </span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                GSTN: {isHighRisk ? 'CANCELLED' : 'ACTIVE'}
              </span>
              <span className="bg-blue-100 text-blue-900 text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                MSME: VALIDATED
              </span>
              <span
                className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                  isHighRisk ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                CPPP: {isHighRisk ? 'DEBARRED' : 'CLEAR'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clarification Alert (if Bidder 2 / Medium Risk) */}
      {isMediumRisk && (
        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 shadow-xs space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-amber-900">
                Official GeM Clarification Notice Issued
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                The Procurement Evaluation Authority has flagged an inconsistency between your GST Registration legal name (<strong>{bidder.company_name}</strong>) and the legal name appearing on your submitted OEM Manufacturer Authorization Form (<strong>{bidder.company_name} Systems</strong>).
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-900 font-mono mt-2">
                &ldquo;Please furnish Board Resolution or Registrar of Companies (ROC) name amendment certificate confirming corporate continuity.&rdquo;
              </div>
            </div>
          </div>

          {!clarificationSent ? (
            <form onSubmit={handleSendClarification} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-amber-900">
                Submit Bidder Clarification Response
              </label>
              <textarea
                rows={3}
                value={clarificationResponse}
                onChange={(e) => setClarificationResponse(e.target.value)}
                placeholder="Enter your formal response, explanation of corporate identity, or cite attached board resolution..."
                required
                className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Response to Tender Authority</span>
              </button>
            </form>
          ) : (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Clarification response submitted successfully! Timestamp recorded in immutable audit log.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Two-Column View: Submitted Documents & Clause Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="submissions">
        {/* Left Column (5 cols): Submitted Document Packets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t('bidder.my_documents')}
                </h3>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">
                {bidder.documents?.length || 5} Documents
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {(bidder.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                    <FileText className="w-4 h-4 text-blue-900 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {doc.doc_type} • {doc.page_count} Pages
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Parsed OK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Clause-by-Clause Compliance Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t('verify.compliance_clauses')}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Evaluated deterministically
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* R001 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">R001 • Turnover</span>
                  {isHighRisk ? (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      NOT COMPLIANT
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      COMPLIANT
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11.5px]">
                  Threshold: Minimum ₹3.00 Cr avg annual turnover.
                </p>
                <p className="text-slate-900 font-semibold text-[11px]">
                  Extracted from CA Audit: {isHighRisk ? '₹1.80 Crores' : isMediumRisk ? '₹3.15 Crores' : '₹5.20 Crores'}
                </p>
              </div>

              {/* R002 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">R002 • Past Experience</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    COMPLIANT
                  </span>
                </div>
                <p className="text-slate-600 text-[11.5px]">
                  Threshold: Minimum 5 years operational experience.
                </p>
                <p className="text-slate-900 font-semibold text-[11px]">
                  Extracted from Completion Certificate: 7 Years continuous track record.
                </p>
              </div>

              {/* R003 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">R003 • GST Registration</span>
                  {isHighRisk ? (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      CANCELLED / FAILED
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ACTIVE &amp; VERIFIED
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11.5px]">
                  Live GSTN Registry check verified Form REG-06 status.
                </p>
              </div>

              {/* R004 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">R004 • Non-Debarment</span>
                  {isHighRisk ? (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DEBARRED ON CPPP
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      CLEAR / ZERO DEBARMENT
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11.5px]">
                  Cross-checked against CPPP Central Debarment Database under GFR Rule 151.
                </p>
              </div>

              {/* R005 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">R005 • OEM Authorization (MAF)</span>
                  {isMediumRisk ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      INCONSISTENT NAME
                    </span>
                  ) : isHighRisk ? (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      MISSING MAF
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      VERIFIED &amp; MATCHED
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11.5px]">
                  Manufacturer Authorization Form validity and legal entity consistency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
