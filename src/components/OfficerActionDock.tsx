'use client';

import React, { useState } from 'react';
import { Bidder, OfficerDecision } from '@/lib/types';
import { getDecisionBadge } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  Lock,
  Sparkles,
  History,
  Check,
} from 'lucide-react';

interface OfficerActionDockProps {
  bidder: Bidder;
  executiveSummary: string;
  onDecisionSubmit: (decision: OfficerDecision, remarks: string) => Promise<void>;
  onOpenAuditLog: () => void;
}

export function OfficerActionDock({
  bidder,
  executiveSummary,
  onDecisionSubmit,
  onOpenAuditLog,
}: OfficerActionDockProps) {
  const [remarks, setRemarks] = useState(bidder.decision_notes || '');
  const [selectedDecision, setSelectedDecision] = useState<OfficerDecision>(
    bidder.officer_decision !== 'PENDING' ? bidder.officer_decision : 'QUALIFIED'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const decisionBadge = getDecisionBadge(bidder.officer_decision);

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      alert('Officer remarks are mandatory for statutory audit compliance.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onDecisionSubmit(selectedDecision, remarks);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error recording decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col h-full">
      {/* Dock Header */}
      <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">
              Officer Decision Dock
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Human-in-the-Loop Adjudication
          </span>
        </div>
        <button
          onClick={onOpenAuditLog}
          title="Open Audit Trail History"
          className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Current Official Status */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
          Current Adjudication State
        </span>
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${decisionBadge.className}`}
        >
          {decisionBadge.label}
        </span>
      </div>

      {/* AI Pre-filled Executive Briefing */}
      <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5 text-xs">
        <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <span>Executive Compliance Summary</span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[11px] font-normal">
          {executiveSummary}
        </p>
      </div>

      {/* Decision Selection Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          Select Adjudication Action:
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {/* Approve Qualification */}
          <button
            type="button"
            onClick={() => setSelectedDecision('QUALIFIED')}
            className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all ${
              selectedDecision === 'QUALIFIED'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Qualification</span>
            </span>
            {selectedDecision === 'QUALIFIED' && <Check className="w-4 h-4" />}
          </button>

          {/* Request Clarification */}
          <button
            type="button"
            onClick={() => setSelectedDecision('CLARIFICATION_REQUESTED')}
            className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all ${
              selectedDecision === 'CLARIFICATION_REQUESTED'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <span className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Request Clarification</span>
            </span>
            {selectedDecision === 'CLARIFICATION_REQUESTED' && <Check className="w-4 h-4" />}
          </button>

          {/* Reject / Disqualify */}
          <button
            type="button"
            onClick={() => setSelectedDecision('DISQUALIFIED')}
            className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all ${
              selectedDecision === 'DISQUALIFIED'
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-800'
            }`}
          >
            <span className="flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Reject / Disqualify</span>
            </span>
            {selectedDecision === 'DISQUALIFIED' && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Immutable Officer Remarks */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
            <span>Officer Remarks</span>
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400">Recorded to Audit Log</span>
        </div>
        <textarea
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="State definitive statutory grounds, GFR clauses referenced, or specific clarification items required from the bidder..."
          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none flex-1 leading-relaxed"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-xs"
        >
          {isSubmitting ? (
            <span>Recording to Audit Log...</span>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Adjudication Recorded!</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Commit Decision & Sign</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          Signed digitally by Shri V. Ramaswamy (GeM Joint Director)
        </p>
      </div>
    </div>
  );
}
