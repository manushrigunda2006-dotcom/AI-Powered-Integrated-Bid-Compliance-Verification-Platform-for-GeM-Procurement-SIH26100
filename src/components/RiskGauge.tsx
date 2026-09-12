'use client';

import React from 'react';
import { RiskLevel } from '@/lib/types';
import { getRiskLevelBadge } from '@/lib/utils';
import { AlertOctagon, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RiskGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  mandatoryFailuresCount?: number;
  minorDiscrepanciesCount?: number;
}

export function RiskGauge({
  score,
  riskLevel,
  mandatoryFailuresCount = 0,
  minorDiscrepanciesCount = 0,
}: RiskGaugeProps) {
  const { t } = useLanguage();
  const riskBadge = getRiskLevelBadge(riskLevel, t);

  // SVG circular gauge geometry
  const radius = 48;
  const strokeWidth = 9;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // green-500
  let textColor = 'text-emerald-700';
  let bgColor = 'bg-emerald-50';

  if (riskLevel === 'HIGH') {
    strokeColor = '#f43f5e'; // rose-500
    textColor = 'text-rose-700';
    bgColor = 'bg-rose-50';
  } else if (riskLevel === 'MEDIUM') {
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-700';
    bgColor = 'bg-amber-50';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('gauge.overall_score', 'Composite Compliance Score')}
        </h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadge.className}`}
        >
          {riskBadge.icon} {riskBadge.label}
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Circular SVG Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Dynamic Animated Value */}
            <circle
              stroke={strokeColor}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          {/* Center Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${textColor} tracking-tight`}>
              {score}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              / 100
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-slate-600 font-medium">{t('common.status', 'Evaluation Gate')}:</span>
            <span className="font-bold text-slate-800">
              {riskLevel === 'HIGH'
                ? t('tender.disqualified', 'Fatal Non-Compliance')
                : riskLevel === 'MEDIUM'
                ? t('tender.review_required', 'Review Required')
                : t('tender.eligible', 'Full Pass (Eligible)')}
            </span>
          </div>

          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-slate-600 font-medium">{t('gauge.mandatory_failures', 'Mandatory Breaches')}:</span>
            <span
              className={`font-bold ${
                mandatoryFailuresCount > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {mandatoryFailuresCount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">{t('gauge.minor_discrepancies', 'Clarification Flags')}:</span>
            <span
              className={`font-bold ${
                minorDiscrepanciesCount > 0 ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              {minorDiscrepanciesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Override Banner if High Risk */}
      {mandatoryFailuresCount > 0 && (
        <div className="mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-800 text-xs">
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-tight font-medium">
            <strong className="font-bold">{t('status.disqualified', 'Override')}:</strong> {t('bidders.blacklist_breach', 'Mandatory clause breach detected')}.
          </p>
        </div>
      )}

      {/* Clarification Notice Banner if Medium Risk */}
      {riskLevel === 'MEDIUM' && (
        <div className="mt-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-tight font-medium">
            <strong className="font-bold">{t('status.clarification', 'Clarification')}:</strong> {t('bidders.name_variances', 'Name variances or borderline criteria detected')}.
          </p>
        </div>
      )}
    </div>
  );
}
