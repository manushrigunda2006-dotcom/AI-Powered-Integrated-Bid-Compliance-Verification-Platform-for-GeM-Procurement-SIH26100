'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  FileText,
  LogOut,
  ExternalLink,
  Award,
  Clock,
  Briefcase
} from 'lucide-react';
import { useBidderAuth, logout } from '@/lib/authGuard';
import { MOCK_BIDDERS } from '@/lib/mock-data/tender-seed';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { session, isAuthenticated, isAuthorized, isLoading } = useBidderAuth(true);

  if (isLoading || !isAuthorized || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">{t('Verifying Bidder Credentials & Access...')}</p>
        </div>
      </div>
    );
  }

  const mock =
    MOCK_BIDDERS.find(
      (b) =>
        b.id === session.bidderId ||
        b.id.includes(session.bidderId) ||
        session.bidderId.includes(b.id)
    ) || MOCK_BIDDERS[0];

  const handleLogout = () => {
    logout(router, '/role-selection');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/bidder/dashboard" className="text-blue-900 hover:underline font-bold">
          {t('Bidder Dashboard')}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">{t('Profile')}</span>
      </nav>

      {/* Hero Bidder Identification Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white font-black text-2xl flex items-center justify-center ring-4 ring-blue-100 shadow-md shrink-0">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                  BIDDER ID: {session.bidderId.toUpperCase()}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('GeM Enrolled Vendor')}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {session.companyName}
              </h1>
              <p className="text-xs text-slate-500 flex items-center space-x-2">
                <span>CIN: <strong className="font-mono text-slate-700">{session.cinNumber}</strong></span>
                <span>•</span>
                <span>Udyam: <strong className="font-mono text-slate-700">{session.udyamRegistration}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>{t('Log Out')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Corporate Profile & Statutory Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Tax & Corporate Identifiers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-blue-900" />
            <h2 className="text-sm font-bold text-slate-900">
              {t('Tax & Corporate Identifiers')}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-bold">{t('Goods & Services Tax (GSTIN)')}</span>
              <span className="font-mono font-bold text-slate-900">{session.gstNumber}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-bold">{t('Permanent Account Number (PAN)')}</span>
              <span className="font-mono font-bold text-slate-900">{session.panNumber}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-bold">{t('MSME / Udyam Registration')}</span>
              <span className="font-mono font-bold text-slate-900">{session.udyamRegistration}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span className="text-slate-500 font-bold">{t('Corporate Identity (CIN)')}</span>
              <span className="font-mono font-bold text-slate-900">{session.cinNumber}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Authorized Signatory Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-blue-900" />
            <h2 className="text-sm font-bold text-slate-900">
              {t('Authorized Representative & Registered Address')}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('Authorized Signatory')}
              </span>
              <span className="font-bold text-slate-900 block">{session.contactPerson}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('Official Email Address')}
              </span>
              <span className="font-mono font-semibold text-slate-800 block">{session.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('Registered Principal Place of Business')}
              </span>
              <span className="text-slate-700 block">
                Connaught Place, Barakhamba Road, New Delhi 110001, India
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Standing Badges */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {t('Statutory Standing on Government Registries')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">{t('GSTN Status')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-bold text-slate-900">{t('Active Form REG-06')}</p>
            <p className="text-[11px] text-slate-500">{t('Regular taxpayer with verified filing track record')}</p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase">{t('MSME Udyam')}</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-bold text-slate-900">{t('Validated MSE Tier')}</p>
            <p className="text-[11px] text-slate-500">{t('Eligible for GFR 153 & PPP-MSE procurement benefits')}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase">{t('CPPP Debarment')}</span>
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <p className="font-bold text-slate-900">{t('Clear Standing')}</p>
            <p className="text-[11px] text-slate-500">{t('Zero debarment orders under GFR Rule 151')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
