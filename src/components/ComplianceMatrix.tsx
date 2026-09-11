'use client';

import React, { useState } from 'react';
import { ComplianceResult, Evidence, RequirementCategory } from '@/lib/types';
import { getComplianceStatusBadge, normalizeComplianceStatus } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileWarning,
  HelpCircle,
  Eye,
  FileSearch,
  Filter,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

interface ComplianceMatrixProps {
  results: ComplianceResult[];
  onViewEvidence: (evidence: Evidence, clauseCode: string, clauseTitle: string) => void;
  crossEntityWarning?: string;
}

export function ComplianceMatrix({
  results,
  onViewEvidence,
  crossEntityWarning,
}: ComplianceMatrixProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center space-y-2">
        <FileSearch className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-700">No Compliance Results Available</h3>
        <p className="text-xs text-slate-500">Run the evaluation engine to generate compliance verification clauses.</p>
      </div>
    );
  }

  const safeResults = results || [];

  const categories: { label: string; value: string; count: number }[] = [
    { label: 'All Clauses', value: 'ALL', count: safeResults.length },
    {
      label: 'Financial',
      value: 'FINANCIAL',
      count: results.filter((r) => r.category === 'FINANCIAL').length,
    },
    {
      label: 'Experience',
      value: 'EXPERIENCE',
      count: results.filter((r) => r.category === 'EXPERIENCE').length,
    },
    {
      label: 'Statutory',
      value: 'STATUTORY',
      count: results.filter((r) => r.category === 'STATUTORY').length,
    },
    {
      label: 'OEM MAF',
      value: 'OEM',
      count: results.filter((r) => r.category === 'OEM').length,
    },
    {
      label: 'Technical',
      value: 'TECHNICAL',
      count: results.filter((r) => r.category === 'TECHNICAL').length,
    },
  ];

  const filteredResults =
    activeCategory === 'ALL'
      ? results
      : results.filter((r) => r.category === activeCategory);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <FileSearch className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-bold text-slate-900">
              Clause-by-Clause Compliance Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict deterministic evaluation against tender thresholds with OCR page citations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.value
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Cross-Entity Name Inconsistency Alert Banner */}
      {crossEntityWarning && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-900 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
              <span>⚠️ Cross-Document Entity Name Variance Detected</span>
            </span>
            <p className="leading-relaxed font-medium">
              {crossEntityWarning}
            </p>
          </div>
        </div>
      )}

      {/* Clauses List */}
      <div className="space-y-3">
        {filteredResults.map((result) => {
          const normalizedStatus = normalizeComplianceStatus(result?.status);
          const statusBadge = getComplianceStatusBadge(result?.status);

          return (
            <div
              key={result.id}
              className={`rounded-xl border p-4 transition-all duration-150 ${
                normalizedStatus === 'COMPLIANT'
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : normalizedStatus === 'INCONSISTENT'
                  ? 'border-amber-300 bg-amber-50/20'
                  : normalizedStatus === 'FLAGGED'
                  ? 'border-purple-300 bg-purple-50/20'
                  : normalizedStatus === 'MISSING_DOC'
                  ? 'border-slate-300 bg-slate-50/40'
                  : 'border-rose-300 bg-rose-50/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2.5">
                {/* Clause Code & Title */}
                <div className="flex items-start space-x-2.5">
                  <span className="shrink-0 bg-slate-900 text-white font-mono text-xs font-black px-2 py-1 rounded-md">
                    {result.clause_code}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {result.clause_title}
                      </h4>
                      {result.is_mandatory && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded-xs border border-rose-200 uppercase">
                          Mandatory
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {result.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2 self-start md:self-auto">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge?.className || 'bg-amber-50 text-amber-800 border-amber-300'}`}
                  >
                    {normalizedStatus === 'COMPLIANT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {normalizedStatus === 'NON_COMPLIANT' && <XCircle className="w-3.5 h-3.5" />}
                    {normalizedStatus === 'INCONSISTENT' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {normalizedStatus === 'MISSING_DOC' && <FileWarning className="w-3.5 h-3.5" />}
                    {normalizedStatus === 'FLAGGED' && <HelpCircle className="w-3.5 h-3.5" />}
                    <span>{statusBadge?.label || 'Review Required'}</span>
                  </span>
                </div>
              </div>

              {/* Threshold vs Extracted Value Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 p-2.5 bg-slate-50/90 rounded-lg border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tender RFP Threshold
                  </span>
                  <span className="font-semibold text-slate-700">
                    {result.threshold_display}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Extracted & Verified Value
                  </span>
                  <span
                    className={`font-black ${
                      normalizedStatus === 'COMPLIANT'
                        ? 'text-emerald-700'
                        : normalizedStatus === 'INCONSISTENT'
                        ? 'text-amber-700'
                        : normalizedStatus === 'FLAGGED'
                        ? 'text-purple-700'
                        : normalizedStatus === 'MISSING_DOC'
                        ? 'text-slate-600'
                        : 'text-rose-700'
                    }`}
                  >
                    {result.extracted_display}
                  </span>
                </div>
              </div>

              {/* Plain-English Explanation */}
              <p className="text-xs text-slate-600 leading-relaxed font-normal mb-3">
                {result.human_explanation}
              </p>

              {/* Action: View Evidence Button */}
              {result.evidence && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Evidence verified from {result.evidence.document_name}</span>
                  </span>
                  <button
                    onClick={() =>
                      onViewEvidence(
                        result.evidence!,
                        result.clause_code,
                        result.clause_title
                      )
                    }
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-700" />
                    <span>View Evidence (Page {result.evidence.source_page})</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
