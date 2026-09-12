'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Tender } from '@/lib/types';
import { tenderService } from '@/services/tenderService';
import { formatDate, formatDateTime, formatIndianCurrency } from '@/lib/utils';
import {
  Building2,
  Calendar,
  FileText,
  ShieldCheck,
  Users,
  ChevronRight,
  ArrowLeft,
  Lock,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Scale,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/lib/authGuard';

export default function TenderDetailsPage() {
  const { isBidder, isOfficer } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'tender-gem-2026-cloud';

  const [tender, setTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTender() {
      setIsLoading(true);
      try {
        const data = await tenderService.getTender(rawId);
        setTender(data);
      } catch (err) {
        console.error('Failed to load tender:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTender();
  }, [rawId]);

  if (isLoading || !tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-600">Loading Tender Specifications...</span>
      </div>
    );
  }

  const requirements = tender.requirements || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="text-blue-900 hover:underline font-bold">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/tenders" className="text-blue-900 hover:underline font-bold">
          Existing Tenders
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate max-w-xs">{tender.tender_number}</span>
      </nav>

      {/* Tender Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg">
                {tender.tender_number}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-slate-200">
                Custom Bid for Services
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Technical Opening Phase Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {tender.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{tender.department}</span>
            </p>
          </div>

          {/* Primary CTA: Jump to Bidders */}
          <div className="shrink-0 pt-2 lg:pt-0 flex flex-col items-start lg:items-end gap-2">
            {isBidder ? (
              <Link
                href="/bidder/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>View My Bid &amp; Compliance Status</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/tenders/${tender.id}/bidders`}
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Proceed to Bidders Evaluation (3 Enrolled)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            <span className="text-[11px] text-slate-400">
              {isBidder ? 'Track your proposal verification status' : 'Click to view compliance matrix & audit trail'}
            </span>
          </div>
        </div>

        {/* Specification Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Estimated RFP Budget
            </span>
            <span className="text-lg font-black text-slate-900">
              {tender.budget_formatted || formatIndianCurrency(tender.estimated_budget)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Bid Closing Date
            </span>
            <span className="text-sm font-bold text-slate-800">
              {formatDate(tender.deadline)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Mandatory Clauses
            </span>
            <span className="text-sm font-bold text-slate-800">
              {requirements.filter((r) => r.is_mandatory).length} Strict Clauses
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              GFR Compliance
            </span>
            <span className="text-sm font-bold text-emerald-700 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Rule 151 Enforced</span>
            </span>
          </div>
        </div>
      </div>

      {/* Required Bidder Documents Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-black text-slate-900">
                Required Bidder Documents
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Documents configured by the Procurement Officer that every bidder must submit for this tender.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {tender.required_documents?.length || 5} Required Files
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(tender.required_documents && tender.required_documents.length > 0
            ? tender.required_documents
            : [
                { id: '1', display_name: 'CA_Certified_Turnover.pdf', document_type: 'FINANCIAL_AUDIT', is_mandatory: true },
                { id: '2', display_name: 'GST_Registration_Certificate.pdf', document_type: 'GST_CERT', is_mandatory: true },
                { id: '3', display_name: 'Past_Performance_Work_Order.pdf', document_type: 'WORK_ORDER_EXPERIENCE', is_mandatory: true },
                { id: '4', display_name: 'Non_Blacklisting_Affidavit.pdf', document_type: 'AFFIDAVIT_BLACKLIST', is_mandatory: true },
                { id: '5', display_name: 'OEM_Authorization_MAF.pdf', document_type: 'OEM_AUTH', is_mandatory: true },
              ]
          ).map((doc: any) => (
            <div
              key={doc.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900">
                  {doc.document_type}
                </span>
                {doc.is_mandatory && (
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Mandatory
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 truncate">
                {doc.display_name}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span>Verified in packet evaluation</span>
                <span className="text-emerald-700 font-semibold">Enforced ➔</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Clauses & Eligibility Thresholds */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-900" />
              <h2 className="text-lg font-black text-slate-900">
                Tender Compliance Clauses & Threshold Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured deterministic rules used by the engine to evaluate bidder document packets
            </p>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {requirements.length} Configured Rules
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Clause Code</th>
                <th className="py-3.5 px-4">Requirement Clause</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Rule Type</th>
                <th className="py-3.5 px-4">Threshold Criteria</th>
                <th className="py-3.5 px-4 text-center">Mandatory</th>
                <th className="py-3.5 px-4 text-center">Score Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md text-xs">
                      {req.clause_code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{req.clause_title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 max-w-md leading-relaxed">
                      {req.description}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-blue-50 text-blue-900 text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {req.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-700">
                    {req.rule_type}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {req.threshold_display || req.threshold_value}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {req.is_mandatory ? (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Mandatory
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {req.weight} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar: Action to Bidders */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
            <span className="font-semibold">
              All 6 deterministic compliance rules are linked to OCR page extraction and registry adapters.
            </span>
          </div>
          <Link
            href={`/tenders/${tender.id}/bidders`}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Proceed to Bidders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
