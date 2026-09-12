'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  Lock,
  CheckCircle2,
  FileCheck2,
  Scale
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function RoleSelectionPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[78vh] flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      {/* Header / Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3">
        {/* GeM Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2F63] to-[#1D4ED8] text-white font-black text-2xl shadow-md ring-4 ring-blue-100">
          GeM
        </div>

        <div>
          <span className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-900 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>National Procurement Portal • SIH Edition</span>
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('role.welcome', 'Welcome to the Procurement Compliance Platform')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            {t('role.select_prompt', 'Please select your role below to access your dedicated, secure portal.')}
          </p>

          {/* Expanded Language Selector on Landing */}
          <div className="pt-3 flex justify-center">
            <LanguageSelector variant="expanded" />
          </div>
        </div>
      </div>

      {/* Role Selection Cards Grid */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* OPTION 1: BIDDER */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-500 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-blue-900" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  Role: Bidder
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                  {t('role.bidder_title', 'Bidder Login')}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t('role.bidder_desc', 'Access your tenders, submissions, compliance status and verification results.')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Track submission packets &amp; compliance scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Inspect rule-by-rule verification status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>View isolated bidder activity &amp; verification logs</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <Link
                href="/bidder/login"
                className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer group-hover:shadow-md"
              >
                <span>{t('role.bidder_btn', 'Enter as Bidder →')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OPTION 2: GOVERNMENT OFFICER */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-amber-500 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  {t('role.officer_badge', 'Procurement Authority')}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                  {t('role.officer_title', 'Government Officer Login')}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {t('role.officer_desc', 'Review tenders, verify bidder eligibility, run compliance engine and audit bids.')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Deterministic rule engine &amp; registry checks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Class-3 PKI DSC token signed adjudication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>GFR Rule 151 &amp; Section 65B immutable audit trails</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <Link
                href="/officer/login"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer group-hover:shadow-md"
              >
                <span>{t('role.officer_btn', 'Enter as Government Officer →')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Role-based session isolation enforced • GFR 2017 &amp; Section 65B Electronic Evidence compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
