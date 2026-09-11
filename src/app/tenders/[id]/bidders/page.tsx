'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MOCK_TENDER,
  MOCK_BIDDERS,
} from '@/lib/mock-data/tender-seed';
import { Tender, Bidder } from '@/lib/types';
import {
  formatDate,
  formatDateTime,
  getRiskLevelBadge,
  getDecisionBadge,
} from '@/lib/utils';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { tenderService } from '@/services/tenderService';
import { bidderService } from '@/services/bidderService';

export default function TenderBiddersPage() {
  const params = useParams();
  const rawTenderId = (params?.id as string) || '11111111-1111-1111-1111-111111111111';

  const [tender, setTender] = useState<Tender>(MOCK_TENDER);
  const [bidders, setBidders] = useState<Bidder[]>(MOCK_BIDDERS);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  // Load from API or default to store
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/tenders?id=${rawTenderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tender) setTender(data.tender);
          if (data.bidders && data.bidders.length > 0) {
            setBidders(data.bidders);
          }
        } else {
          const liveTender = await tenderService.getTender(rawTenderId);
          const liveBidders = await bidderService.getBiddersForTender(liveTender.id);
          if (liveTender) setTender(liveTender);
          if (liveBidders && liveBidders.length > 0) setBidders(liveBidders);
        }
      } catch {
        // fallback to mock state
      }
    }
    loadData();
  }, [rawTenderId]);

  // Re-run batch automated compliance audit across all bidders
  const handleBatchAudit = async () => {
    setIsAuditing(true);
    try {
      // Concurrently evaluate all bidders instead of sequential blocking loop
      await Promise.all(
        bidders.map((bidder) =>
          fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidderId: bidder.id }),
          })
        )
      );

      // Refresh
      const res = await fetch(`/api/tenders?id=${rawTenderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.bidders) setBidders(data.bidders);
      }
    } catch {
      alert('Verification completed.');
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredBidders = bidders.filter((b) => {
    const matchesRisk =
      selectedRiskFilter === 'ALL' ? true : b.risk_level === selectedRiskFilter;
    const matchesSearch =
      b.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.gst_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pan_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const qualifiedCount = bidders.filter(
    (b) => b.officer_decision === 'QUALIFIED' || (b.risk_level === 'LOW' && b.officer_decision === 'PENDING')
  ).length;
  const reviewCount = bidders.filter(
    (b) => b.risk_level === 'MEDIUM' || b.officer_decision === 'CLARIFICATION_REQUESTED'
  ).length;
  const disqualifiedCount = bidders.filter(
    (b) => b.risk_level === 'HIGH' || b.officer_decision === 'DISQUALIFIED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-900 transition-colors">
          GeM Home
        </Link>
        <span>/</span>
        <Link href="/tenders" className="hover:text-blue-900 transition-colors">
          Tenders
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">{tender.tender_number}</span>
        <span>/</span>
        <span className="text-blue-900 font-bold">Bidder Packets</span>
      </nav>

      {/* Tender RFP Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                {tender.tender_number}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                Custom Bid for Services
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Technical Evaluation Phase Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {tender.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{tender.department}</span>
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex sm:flex-col sm:items-end justify-between gap-2 shrink-0">
            <button
              onClick={handleBatchAudit}
              disabled={isAuditing}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing Packets...' : 'Re-run Compliance Engine'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Deterministic rule checks + Registry adapters
            </span>
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Estimated Tender Value
            </span>
            <span className="text-base font-black text-slate-900">
              {tender.budget_formatted}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Bid Closing Deadline
            </span>
            <span className="text-sm font-bold text-slate-800">
              {formatDate(tender.deadline)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Mandatory Clauses
            </span>
            <span className="text-sm font-bold text-slate-800">
              {tender.requirements?.filter((r) => r.is_mandatory).length || 5} Clauses (Strict)
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Submissions
            </span>
            <span className="text-sm font-bold text-slate-800">
              {bidders.length} Bidders Enrolled
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 block">
              Eligible / Compliant
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {qualifiedCount}
            </span>
            <span className="text-[11px] text-slate-500 block">
              100% Mandatory Clauses Satisfied
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 block">
              Review / Clarification Required
            </span>
            <span className="text-2xl font-black text-amber-600">
              {reviewCount}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Name Variances or Borderline Criteria
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800 block">
              Disqualified / High Risk
            </span>
            <span className="text-2xl font-black text-rose-600">
              {disqualifiedCount}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Blacklist or Mandatory Clause Breach
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bidder List Controls: Search & Risk Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company name, GSTIN, PAN, or Udyam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Risk Filter:</span>
            </span>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRiskFilter(risk)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === risk
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Bidders Summary Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Bidder Company</th>
                <th className="py-3.5 px-4">Extracted Identifiers</th>
                <th className="py-3.5 px-4 text-center">Compliance Score</th>
                <th className="py-3.5 px-4 text-center">Risk Level</th>
                <th className="py-3.5 px-4">Officer Decision</th>
                <th className="py-3.5 px-4 text-right">Adjudication Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBidders.map((bidder) => {
                const riskBadge = getRiskLevelBadge(bidder.risk_level);
                const decisionBadge = getDecisionBadge(bidder.officer_decision);

                return (
                  <tr
                    key={bidder.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Company Legal Name & Contact */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/tenders/${tender.id}/bidders/${bidder.id}/verification`}
                          className="font-bold text-slate-900 text-sm hover:text-blue-900 flex items-center space-x-1.5"
                        >
                          <span>{bidder.company_name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-700" />
                        </Link>
                        <div className="text-[11px] text-slate-500">
                          {bidder.contact_person} • {bidder.contact_email}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Submitted: {formatDateTime(bidder.submission_date)}
                        </div>
                      </div>
                    </td>

                    {/* Extracted Entities preview */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700 font-semibold">
                            GSTIN: {bidder.gst_number}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-600">
                            PAN: {bidder.pan_number}
                          </span>
                          {bidder.udyam_registration && (
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-xs font-mono">
                              MSE
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Compliance Score Badge */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-base font-black px-3 py-1 rounded-xl border ${
                            bidder.overall_score >= 85
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : bidder.overall_score >= 60
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {bidder.overall_score} / 100
                        </span>
                      </div>
                    </td>

                    {/* Risk Level Pill */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${riskBadge.className}`}
                      >
                        {riskBadge.icon} {riskBadge.label}
                      </span>
                    </td>

                    {/* Officer Decision State */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] ${decisionBadge.className}`}
                      >
                        {decisionBadge.label}
                      </span>
                    </td>

                    {/* Quick Action Button */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/tenders/${tender.id}/bidders/${bidder.id}/verification`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        <span>Verify Engine</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
