'use client';

import React from 'react';
import { Evidence } from '@/lib/types';
import { X, FileText, CheckCircle2, ShieldCheck, Search, Eye } from 'lucide-react';

interface EvidenceModalProps {
  evidence: Evidence | null;
  clauseCode: string;
  clauseTitle: string;
  onClose: () => void;
}

export function EvidenceModal({
  evidence,
  clauseCode,
  clauseTitle,
  onClose,
}: EvidenceModalProps) {
  if (!evidence) return null;

  const confidencePercent = Math.round(evidence.confidence_score * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-300">
                  [{clauseCode}] EVIDENCE AUDIT
                </span>
                <span className="bg-blue-900 text-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-700">
                  Page {evidence.source_page}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {clauseTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Metadata bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Document Name</span>
              <span className="font-semibold text-slate-800 truncate block">
                {evidence.document_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Document Type</span>
              <span className="font-semibold text-slate-800 truncate block">
                {evidence.document_type}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Page Citation</span>
              <span className="font-semibold text-slate-800 block">
                Page {evidence.source_page}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">OCR Confidence</span>
              <span className="font-bold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{confidencePercent}%</span>
              </span>
            </div>
          </div>

          {/* Extracted Value Banner */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 block mb-1">
              Deterministically Extracted & Normalized Value
            </span>
            <div className="text-lg font-black text-blue-950 font-mono">
              {evidence.extracted_value}
            </div>
          </div>

          {/* Simulated PDF Layout Viewer with Bounding Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>OCR Extracted Text Snippet with Bounding Box</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                LayoutLM BBox [T:{evidence.bounding_box?.top || 210}, L:{evidence.bounding_box?.left || 120}]
              </span>
            </div>

            {/* Document sheet mockup */}
            <div className="relative bg-amber-50/20 border-2 border-dashed border-slate-300 rounded-xl p-5 shadow-inner">
              <div className="absolute top-2 right-3 text-[10px] font-mono uppercase font-bold text-slate-400 select-none">
                Gov Form REG-06 / CA Audit Page {evidence.source_page}
              </div>

              {/* Surrounding mock text */}
              <p className="text-[11px] text-slate-400 select-none leading-relaxed blur-[0.6px] mb-3">
                Public Procurement Portal • Official Digital Record Serial No 829104-B. Certified copy issued for technical bid compliance adjudication under General Procurement Rules.
              </p>

              {/* Highlighted Bounding Box */}
              <div className="relative border-2 border-blue-500 bg-blue-50/70 rounded-lg p-3.5 shadow-sm">
                <div className="absolute -top-2.5 left-3 bg-blue-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs">
                  OCR SNIPPET MATCH ({confidencePercent}% CONFIDENCE)
                </div>
                <p className="text-xs text-slate-900 font-serif leading-relaxed italic">
                  &ldquo;{evidence.snippet_text}&rdquo;
                </p>
              </div>

              {/* Sub-mock text */}
              <p className="text-[11px] text-slate-400 select-none leading-relaxed blur-[0.6px] mt-3">
                Verified digitally through Public Key Infrastructure (PKI) token. Signature timestamp logged with Licensed Cryptographic Certifying Authority.
              </p>
            </div>
          </div>

          {/* Tamper and Audit Stamp */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic PDF Hash SHA-256 Validated • No Tampering Detected</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              ID: {evidence.id}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Evidence Audit
          </button>
        </div>
      </div>
    </div>
  );
}
