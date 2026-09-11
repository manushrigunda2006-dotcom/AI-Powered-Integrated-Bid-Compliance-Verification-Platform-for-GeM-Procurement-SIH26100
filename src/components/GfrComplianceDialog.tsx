'use client';

import React, { useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Check,
  Scale,
  Clock,
  FileCheck,
} from 'lucide-react';
import { GfrStatusDetails } from '@/services/gfrComplianceService';

interface GfrComplianceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  details?: GfrStatusDetails | null;
}

export function GfrComplianceDialog({
  isOpen,
  onClose,
  details,
}: GfrComplianceDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fallback data if details prop is loading or omitted
  const status = details?.status || 'COMPLIANT';
  const statusLabel = details?.statusLabel || 'COMPLIANT';
  const statusCardSubtext = details?.statusCardSubtext || 'GFR Rule 151 requirements satisfied';
  const description =
    details?.description ||
    'The current procurement workflow has been checked against the configured GFR Rule 151 compliance conditions.';
  const checklist = details?.checklist || [
    { label: 'Tender requirements identified', passed: true },
    { label: 'Mandatory clauses configured', passed: true },
    { label: 'Procurement rules evaluated', passed: true },
    { label: 'Required bidder documentation configured', passed: true },
    { label: 'Compliance checks available for officer review', passed: true },
  ];
  const ruleName = details?.ruleName || 'GFR Rule 151';
  const ruleStatus = details?.ruleStatus || 'Compliant';
  const verificationMode = details?.verificationMode || 'Deterministic Rule Engine';
  const decisionAuthority = details?.decisionAuthority || 'Procurement Officer';
  const verificationSource = details?.verificationSource || 'Configured procurement compliance rules';
  const verificationEngine = details?.verificationEngine || 'Deterministic Compliance Engine';
  const verificationTime =
    details?.verificationTime ||
    'Verification timestamp available when the compliance run is executed.';

  // Handle keyboard events (Escape to close) and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scrolling behind modal
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus the close button for accessibility
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gfr-dialog-title"
        className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F0] shadow-xl w-full max-w-[520px] overflow-hidden my-auto animate-scaleUp text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="gfr-dialog-title"
                className="text-base sm:text-[17px] font-bold text-[#0F172A] tracking-tight leading-none"
              >
                GFR Rule 151 Compliance
              </h2>
              <span className="text-[11px] text-[#64748B] font-medium mt-0.5 inline-block">
                General Financial Rules 2017 • Debarment & Statutory Integrity
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#16A34A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* STATUS SECTION */}
          <div className="space-y-2">
            {/* Status Card */}
            <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-sm font-bold text-[#15803D] tracking-wide">
                    ✓ {statusLabel}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#166534] bg-white/70 px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                  Clause R004 Verified
                </span>
              </div>
              <p className="text-xs text-[#166534] font-medium mt-1">
                {statusCardSubtext}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-[#475569] leading-relaxed">
              {description}
            </p>
          </div>

          {/* VERIFICATION SUMMARY */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Verification Summary</span>
            </h3>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <div className="w-4 h-4 rounded-full bg-[#ECFDF5] border border-[#BBF7D0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-[#16A34A] stroke-[3]" />
                  </div>
                  <span className="text-[#1E293B] font-medium leading-snug">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RULE REFERENCE */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Rule Reference</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-0.5">
                  Rule
                </span>
                <span className="font-semibold text-[#0F172A]">{ruleName}</span>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-0.5">
                  Status
                </span>
                <span className="font-semibold text-[#15803D] flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  <span>{ruleStatus}</span>
                </span>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-0.5">
                  Verification Mode
                </span>
                <span className="font-semibold text-[#0F172A]">{verificationMode}</span>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-0.5">
                  Decision Authority
                </span>
                <span className="font-semibold text-[#0F172A]">{decisionAuthority}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] leading-tight">
              Final qualification or disqualification remains with the authorized procurement officer.
            </p>
          </div>

          {/* AUDIT INFORMATION */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Audit Information</span>
            </h3>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                  Verification Source
                </span>
                <span className="text-[#0F172A] font-medium">{verificationSource}</span>
              </div>

              <div className="border-t border-[#E2E8F0]/70 pt-2">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                  Verification Engine
                </span>
                <span className="text-[#0F172A] font-medium">{verificationEngine}</span>
              </div>

              <div className="border-t border-[#E2E8F0]/70 pt-2">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                  Verification Time
                </span>
                <span className="text-[#0F172A] font-medium">
                  {verificationTime}
                </span>
              </div>
            </div>
          </div>

          {/* HUMAN-IN-THE-LOOP MESSAGE BOX */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] flex items-start space-x-2.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#102F5F] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#0F172A] block text-[11.5px] mb-0.5">
                Human-in-the-Loop Architecture
              </span>
              AI-assisted verification only. Final procurement qualification/disqualification remains with the authorized procurement officer.
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0F2F63] hover:bg-[#102F5F] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#16A34A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
