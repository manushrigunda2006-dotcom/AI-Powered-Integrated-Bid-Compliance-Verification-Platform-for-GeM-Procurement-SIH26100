'use client';

import React, { useState } from 'react';
import {
  GeminiFullEvaluationResult,
} from '@/lib/gemini/types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  RotateCcw,
  CheckCircle2,
  Scale,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GeminiAiInsightsProps {
  evaluation: GeminiFullEvaluationResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  isConfigured?: boolean;
  fallbackMessage?: string | null;
}

export function GeminiAiInsights({
  evaluation,
  isLoading,
  onRefresh,
  isConfigured = false,
  fallbackMessage,
}: GeminiAiInsightsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'CROSS_ENTITY' | 'RECOMMENDATIONS'>('EXECUTIVE');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!evaluation && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 rounded-2xl border border-indigo-200/80 shadow-xs overflow-hidden transition-all">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-900">
                {t('ai.copilot_title', 'Gemini AI Procurement Copilot')}
              </h3>
              <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                <span>✨ AI-Assisted</span>
                <span className="text-indigo-400">•</span>
                <span>Non-Authoritative</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural-language statutory reasoning under GFR 2017 & GeM GTC guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Re-run Gemini AI Analysis"
            className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={'w-3.5 h-3.5 ' + (isLoading ? 'animate-spin text-indigo-600' : '')} />
            <span>{isLoading ? t('common.loading', 'Analyzing...') : t('verify.rerun', 'Re-Analyze')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notice if API key is not configured */}
      {!isConfigured && (
        <div className="px-5 py-2 bg-amber-50/80 border-b border-amber-200/60 text-[11px] text-amber-800 flex items-center space-x-2">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Deterministic Mode:</strong> {fallbackMessage || 'Live Gemini API key not detected in server environment. Displaying pre-computed statutory guidance.'}
          </span>
        </div>
      )}

      {isExpanded && evaluation && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl w-fit text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('EXECUTIVE')}
              className={'px-3 py-1.5 rounded-lg transition-all cursor-pointer ' + (activeTab === 'EXECUTIVE' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900')}
            >
              {t('ai.executive_summary', 'Executive Briefing')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CROSS_ENTITY')}
              className={'px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ' + (activeTab === 'CROSS_ENTITY' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900')}
            >
              <span>{t('officer.cross_entity_check', 'Cross-Entity Analysis')}</span>
              {!evaluation.cross_entity_analysis.is_coherent && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RECOMMENDATIONS')}
              className={'px-3 py-1.5 rounded-lg transition-all cursor-pointer ' + (activeTab === 'RECOMMENDATIONS' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900')}
            >
              {t('ai.recommendations', 'Officer Action Checklist')}
            </button>
          </div>

          {/* TAB 1: EXECUTIVE BRIEFING */}
          {activeTab === 'EXECUTIVE' && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2 text-indigo-950 font-bold">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>{t('ai.risk_analysis', 'AI Risk Synthesis')}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {evaluation.risk_explanation.executive_summary}
                </p>
              </div>

              {/* Detected Concerns */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{t('gauge.minor_discrepancies', 'Key Concerns & Statutory Flags')}</span>
                </div>
                <ul className="space-y-1.5">
                  {evaluation.risk_explanation.detected_concerns.map((concern, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-700 font-medium">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* GFR 2017 Grounding */}
              {evaluation.risk_explanation.gfr_compliance_notes.length > 0 && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
                    <Scale className="w-3.5 h-3.5 text-indigo-600" />
                    <span>GFR 2017 & Statutory Citations</span>
                  </div>
                  {evaluation.risk_explanation.gfr_compliance_notes.map((note, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed">
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CROSS-ENTITY ANALYSIS */}
          {activeTab === 'CROSS_ENTITY' && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className={'p-3.5 rounded-xl border ' + (!evaluation.cross_entity_analysis.is_coherent ? 'bg-amber-50/70 border-amber-300 text-amber-950' : 'bg-emerald-50/70 border-emerald-300 text-emerald-950')}>
                <div className="flex items-center space-x-2 font-bold mb-1.5">
                  {!evaluation.cross_entity_analysis.is_coherent ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>
                    {!evaluation.cross_entity_analysis.is_coherent
                      ? t('status.entity_mismatch', 'Cross-Entity Discrepancy Identified')
                      : t('status.compliant', 'Corporate Entity Identity Verified')}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {evaluation.cross_entity_analysis.explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Legal & Contractual Risks
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {evaluation.cross_entity_analysis.legal_implications}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t('ai.recommendations', 'Recommended Vigilance Action')}
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {evaluation.cross_entity_analysis.recommended_action}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECOMMENDATIONS */}
          {activeTab === 'RECOMMENDATIONS' && (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 text-xs animate-fadeIn">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>{t('ai.recommendations', 'Officer Adjudication Checklist')}</span>
              </div>
              <div className="space-y-2">
                {evaluation.risk_explanation.officer_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-800 font-medium leading-relaxed">
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Guardrail Footer */}
          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-indigo-100/60">
            {t('ai.disclaimer', evaluation.audit_disclaimer)}
          </p>
        </div>
      )}
    </div>
  );
}
