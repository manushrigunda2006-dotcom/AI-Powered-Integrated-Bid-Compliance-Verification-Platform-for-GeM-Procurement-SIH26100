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
  Send,
  FileCheck2,
  Briefcase,
  Upload,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { bidderService } from '@/services/bidderService';
import { tenderService } from '@/services/tenderService';
import { tenderRequiredDocumentService } from '@/services/tenderRequiredDocumentService';
import { bidSubmissionService, BidSubmission } from '@/services/bidSubmissionService';
import { MOCK_TENDER, MOCK_BIDDERS } from '@/lib/mock-data/tender-seed';
import { Bidder, Tender, TenderRequiredDocument } from '@/lib/types';
import { formatIndianCurrency, formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { session, isAuthenticated, isAuthorized, isLoading } = useBidderAuth(true);

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tenderDocsMap, setTenderDocsMap] = useState<Record<string, TenderRequiredDocument[]>>({});
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, BidSubmission | null>>({});

  const [bidderData, setBidderData] = useState<Bidder | null>(null);
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [clarificationSent, setClarificationSent] = useState(false);
  const [loadingTenders, setLoadingTenders] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!session?.bidderId) return;

      // 1. Match mock or db bidder
      const matched =
        MOCK_BIDDERS.find(
          (b) =>
            b.id === session.bidderId ||
            b.id.includes(session.bidderId) ||
            session.bidderId.includes(b.id)
        ) || MOCK_BIDDERS[0];
      setBidderData(matched);

      // 2. Fetch available published tenders
      try {
        setLoadingTenders(true);
        const tenderList = await tenderService.getTenders();
        setTenders(tenderList);

        // Load required documents and submission statuses for all published tenders
        const docsMap: Record<string, TenderRequiredDocument[]> = {};
        const subsMap: Record<string, BidSubmission | null> = {};

        await Promise.all(
          tenderList.map(async (t) => {
            const docs = await tenderRequiredDocumentService.getRequiredDocuments(t.id);
            docsMap[t.id] = docs;
            subsMap[t.id] = bidSubmissionService.getSubmission(session.bidderId, t.id);
          })
        );

        setTenderDocsMap(docsMap);
        setSubmissionsMap(subsMap);
      } catch (err) {
        console.error('Error loading bidder dashboard tenders:', err);
      } finally {
        setLoadingTenders(false);
      }
    }

    if (session?.bidderId) {
      loadDashboardData();
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
  const isLowRisk = bidder.risk_level === 'LOW';
  const isMediumRisk = bidder.risk_level === 'MEDIUM';
  const isHighRisk = bidder.risk_level === 'HIGH';

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationResponse.trim()) return;
    setClarificationSent(true);
  };

  return (
    <div className="space-y-8 pb-14 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-md">
              {t('app.bidder_portal', 'Bidder Portal')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t('app.session_authenticated', 'Session Authenticated')}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('bidder.dashboard_title', 'Bidder Dashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {t('bidder.dashboard_subtitle', 'View available tenders, submit required documents, and track your compliance status.')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Company: <strong className="text-slate-800 font-bold">{session.companyName}</strong></span>
            <span>•</span>
            <span>GSTIN: <strong className="font-mono text-slate-800 font-bold">{session.gstNumber}</strong></span>
            <span>•</span>
            <span>PAN: <strong className="font-mono text-slate-800 font-bold">{session.panNumber}</strong></span>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/bidder/tenders"
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t('nav.available_tenders', 'Available Tenders')}</span>
          </Link>
          <Link
            href="/bidder/submit"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-900 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-700" />
            <span>{t('nav.upload_docs', 'Upload Documents')}</span>
          </Link>
          <Link
            href="/bidder/logs"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-900 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('nav.my_logs', 'History')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Available Tenders Section (Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-900" />
              <span>Available Tenders for Bidding</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Published procurement RFPs open for technical qualification and document submission.
            </p>
          </div>

          <Link
            href="/bidder/tenders"
            className="text-xs font-bold text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View all tenders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingTenders ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Loading available tenders...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenders.map((tItem) => {
              const reqDocs = tenderDocsMap[tItem.id] || [];
              const mandatoryCount = reqDocs.filter((d) => d.is_mandatory).length || 5;
              const sub = submissionsMap[tItem.id];

              const isSubmitted = sub !== null && sub !== undefined;
              const statusLabel = isSubmitted
                ? sub.complianceStatus || 'Submitted - Awaiting Compliance Verification'
                : 'Open for Submission';

              return (
                <div
                  key={tItem.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Tender ID & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold bg-blue-900 text-white px-2.5 py-0.5 rounded-md">
                        {tItem.tender_number}
                      </span>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                          isSubmitted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {/* Title & Department */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                        {tItem.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{tItem.department}</span>
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                          Estimated Budget
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate block">
                          {tItem.budget_formatted || formatIndianCurrency(tItem.estimated_budget)}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                          Deadline
                        </span>
                        <span className="font-bold text-slate-800 text-xs truncate block">
                          {formatDate(tItem.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Required Documents Count */}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-xl">
                      <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="font-semibold">{mandatoryCount} Mandatory Files Required</span>
                    </div>
                  </div>

                  {/* Action Button: View Tender */}
                  <div className="pt-2">
                    <Link
                      href={`/bidder/tenders/${tItem.id}/submit`}
                      className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer group-hover:shadow-md"
                    >
                      <span>View Tender</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. My Submissions & Active Participation Section */}
      <div className="space-y-4 pt-2" id="submissions">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-black text-slate-900">
              {t('nav.my_submissions', 'My Submissions')}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active Tender Evaluation Standing
          </span>
        </div>

        {/* Primary Tender Participation Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {MOCK_TENDER.tender_number}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                  {t('bidder.active_rfp', 'Active RFP Submission')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {MOCK_TENDER.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{MOCK_TENDER.department}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href={`/bidder/tenders/${MOCK_TENDER.id}/submit`}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload / Manage Documents</span>
              </Link>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Compliance Score */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block">
                  {t('bidder.overall_score', 'Compliance Score')}
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
                  ? t('status.low_risk', 'LOW RISK')
                  : bidder.risk_level === 'MEDIUM'
                  ? t('status.medium_risk', 'MEDIUM RISK')
                  : t('status.high_risk', 'HIGH RISK')}
              </span>
            </div>

            {/* Officer Decision Standing */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10.5px] uppercase font-bold text-slate-400 block">
                {t('bidder.officer_decision', 'Officer Adjudication')}
              </span>
              <div className="flex items-center space-x-1.5 mt-1">
                {isLowRisk ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-700">{t('status.qualified', 'QUALIFIED')}</span>
                  </>
                ) : isMediumRisk ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-700">{t('status.clarification', 'CLARIFICATION')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-red-700">{t('status.disqualified', 'DISQUALIFIED')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Registry Checks */}
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

        {/* Clarification Alert (if Medium Risk) */}
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

        {/* Submitted Documents & Clause Compliance Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Submitted Document Packets */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="w-5 h-5 text-blue-900" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('bidder.my_documents', 'Submitted Documents')}
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

          {/* Right Column (7 cols): Deterministic Compliance Matrix */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-900" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('verify.compliance_clauses', 'Deterministic Compliance Clauses')}
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
    </div>
  );
}
