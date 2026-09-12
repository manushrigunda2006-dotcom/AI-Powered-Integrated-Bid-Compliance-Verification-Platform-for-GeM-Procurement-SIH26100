'use client';

import React, { useState } from 'react';
import { ExternalRegistrySummary } from '@/lib/types';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Building2, Factory, Ban } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RegistryBadgeProps {
  registrySummary?: ExternalRegistrySummary;
  latencyMs?: number;
}

export function RegistryBadges({ registrySummary, latencyMs }: RegistryBadgeProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!registrySummary) {
    return (
      <div className="animate-pulse bg-slate-100 rounded-xl p-4 border border-slate-200">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-8 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  const { gstn, udyam, debarment } = registrySummary;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-900" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('registry.external_checks', 'National Registry Adapters')}
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Simulated Latency: {latencyMs || 285}ms</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* 1. GSTN Badge */}
        <div
          onClick={() => setExpanded(expanded === 'gstn' ? null : 'gstn')}
          className={`cursor-pointer rounded-lg p-2.5 border transition-all text-left ${
            gstn.status === 'ACTIVE'
              ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-slate-600" />
              <span>{t('registry.gstn', 'GSTN Registry')}</span>
            </span>
            {gstn.status === 'ACTIVE' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            )}
          </div>
          <div className="text-xs font-black text-slate-900 truncate">
            {gstn.status === 'ACTIVE' ? t('status.active', 'ACTIVE') : gstn.status}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Tax Score: {gstn.tax_compliance_score}%
          </div>
        </div>

        {/* 2. Udyam MSME Badge */}
        <div
          onClick={() => setExpanded(expanded === 'udyam' ? null : 'udyam')}
          className={`cursor-pointer rounded-lg p-2.5 border transition-all text-left ${
            udyam.is_verified
              ? 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/70'
              : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
              <Factory className="w-3 h-3 text-slate-600" />
              <span>{t('registry.msme', 'MSME / Udyam')}</span>
            </span>
            {udyam.is_verified ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
          </div>
          <div className="text-xs font-black text-slate-900 truncate">
            {udyam.msme_category} MSE
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {t('tender.eligible', 'Eligible')}
          </div>
        </div>

        {/* 3. Debarment / Blacklist Badge */}
        <div
          onClick={() => setExpanded(expanded === 'debarment' ? null : 'debarment')}
          className={`cursor-pointer rounded-lg p-2.5 border transition-all text-left ${
            !debarment.is_blacklisted
              ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-rose-100 border-rose-300 ring-2 ring-rose-500 hover:bg-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
              <Ban className="w-3 h-3 text-slate-600" />
              <span>{t('registry.cppp', 'CPPP Debarment')}</span>
            </span>
            {!debarment.is_blacklisted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
            )}
          </div>
          <div
            className={`text-xs font-black truncate ${
              !debarment.is_blacklisted ? 'text-slate-900' : 'text-rose-700'
            }`}
          >
            {!debarment.is_blacklisted ? t('status.cleared', 'CLEARED') : t('status.debarred', 'DEBARRED!')}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {!debarment.is_blacklisted ? t('gauge.zero_failures', 'Zero Violations') : 'GFR Rule 151'}
          </div>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {expanded === 'gstn' && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 animate-fadeIn">
          <div className="font-bold text-slate-800 flex justify-between">
            <span>{t('registry.gstn', 'GSTN Registry')} {t('common.details', 'Details')}</span>
            <span className="text-[10px] text-slate-500">Form REG-06 Verified</span>
          </div>
          <p><strong className="text-slate-600">Legal Name:</strong> {gstn.legal_name}</p>
          <p><strong className="text-slate-600">Matched PAN:</strong> {gstn.matched_pan}</p>
          <p><strong className="text-slate-600">Filing Frequency:</strong> {gstn.filing_frequency} (Active Returns)</p>
          <p><strong className="text-slate-600">Jurisdiction:</strong> {gstn.state_jurisdiction}</p>
        </div>
      )}

      {expanded === 'udyam' && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 animate-fadeIn">
          <div className="font-bold text-slate-800 flex justify-between">
            <span>{t('registry.msme', 'MSME / Udyam')} {t('common.details', 'Details')}</span>
            <span className="text-[10px] text-slate-500">MSME Registry</span>
          </div>
          <p><strong className="text-slate-600">Enterprise:</strong> {udyam.enterprise_name}</p>
          <p><strong className="text-slate-600">Category:</strong> {udyam.msme_category} Enterprise ({udyam.major_activity})</p>
          <p><strong className="text-slate-600">Udyam No:</strong> {udyam.udyam_number}</p>
          <p><strong className="text-slate-600">Registration Date:</strong> {udyam.registration_date}</p>
        </div>
      )}

      {expanded === 'debarment' && (
        <div className={`p-3 rounded-lg border text-xs space-y-1 animate-fadeIn ${
          debarment.is_blacklisted ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="font-bold flex justify-between">
            <span>{t('registry.cppp', 'CPPP Debarment')} {t('common.details', 'Details')}</span>
            <span className="text-[10px]">{debarment.status}</span>
          </div>
          {debarment.is_blacklisted ? (
            <>
              <p className="font-bold text-rose-700">ALERT: Vendor Debarred from Public Procurement</p>
              <p><strong>Debarring Authority:</strong> {debarment.debarring_agency}</p>
              <p><strong>Order No:</strong> {debarment.order_number}</p>
              <p><strong>Reason:</strong> {debarment.reason}</p>
              <p><strong>Period:</strong> {debarment.debarment_period?.start_date} to {debarment.debarment_period?.end_date}</p>
            </>
          ) : (
            <p className="text-slate-600">No adverse entries or debarment orders found under PAN/CIN in the Central Public Procurement Portal database.</p>
          )}
        </div>
      )}
    </div>
  );
}
