'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  XCircle,
  FileCheck2
} from 'lucide-react';
import { setBidderSession } from '@/lib/authGuard';
import { MOCK_BIDDERS } from '@/lib/mock-data/tender-seed';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedBidderId, setSelectedBidderId] = useState('bidder-01');
  const [customEmail, setCustomEmail] = useState('contact@abcd.example');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
  const [password, setPassword] = useState('••••••••••••');
  const [authTab, setAuthTab] = useState<'DEMO' | 'CREDENTIALS'>('DEMO');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleDemoLogin = (bidderId: string) => {
    setIsLoading(true);
    const mock = MOCK_BIDDERS.find((b) => b.id === bidderId) || MOCK_BIDDERS[0];

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);

      setBidderSession({
        role: 'bidder',
        companyName: mock.company_name,
        contactPerson: mock.contact_person || 'Authorized Signatory',
        email: mock.contact_email || 'vendor@example.com',
        bidderId: mock.id,
        gstNumber: mock.gst_number,
        panNumber: mock.pan_number,
        udyamRegistration: mock.udyam_registration || '',
        cinNumber: mock.cin_number || '',
        authenticatedAt: new Date().toISOString(),
      });

      setTimeout(() => {
        router.push('/bidder/dashboard');
      }, 700);
    }, 500);
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);

      const matchedMock =
        MOCK_BIDDERS.find((b) => b.gst_number.toLowerCase() === gstin.trim().toLowerCase()) ||
        MOCK_BIDDERS[0];

      setBidderSession({
        role: 'bidder',
        companyName: matchedMock.company_name,
        contactPerson: matchedMock.contact_person || 'Authorized Representative',
        email: customEmail || matchedMock.contact_email,
        bidderId: matchedMock.id,
        gstNumber: gstin || matchedMock.gst_number,
        panNumber: matchedMock.pan_number,
        udyamRegistration: matchedMock.udyam_registration || '',
        cinNumber: matchedMock.cin_number || '',
        authenticatedAt: new Date().toISOString(),
      });

      setTimeout(() => {
        router.push('/bidder/dashboard');
      }, 700);
    }, 500);
  };

  const selectedBidderObj = MOCK_BIDDERS.find((b) => b.id === selectedBidderId) || MOCK_BIDDERS[0];

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      {/* Top back to role selection */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          href="/role-selection"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('nav.back')} / {t('nav.role_selection')}</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Bidder Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white font-black text-2xl shadow-md ring-4 ring-blue-100">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        <div>
          <span className="bg-blue-100 text-blue-900 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            {t('bidder.login_badge')}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('bidder.login_title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t('bidder.login_desc')}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-xl border border-slate-200 rounded-3xl space-y-5">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthTab('DEMO')}
              className={`py-1.5 rounded-lg transition-all ${
                authTab === 'DEMO'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('bidder.demo_tab')}
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('CREDENTIALS')}
              className={`py-1.5 rounded-lg transition-all ${
                authTab === 'CREDENTIALS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('bidder.cred_tab')}
            </button>
          </div>

          {/* TAB 1: 1-Click Demo Bidders */}
          {authTab === 'DEMO' && (
            <div className="space-y-4">
              {/* Dropdown for all 20 Bidders */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  {t('bidder.all_bidders_select')}
                </label>
                <select
                  value={selectedBidderId}
                  onChange={(e) => setSelectedBidderId(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {MOCK_BIDDERS.map((b, idx) => (
                    <option key={b.id} value={b.id}>
                      Bidder {String(idx + 1).padStart(2, '0')} • {b.company_name} ({b.overall_score}% • {b.officer_decision})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleDemoLogin(selectedBidderId)}
                  disabled={isLoading || loginSuccess}
                  className="w-full mt-1 py-2 px-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Sign in as {selectedBidderObj.company_name} →</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                <span>{t('bidder.select_persona')}</span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
                  20 Bidders Ready
                </span>
              </div>

              {/* Quick Persona 1 */}
              <button
                type="button"
                onClick={() => handleDemoLogin('bidder-01')}
                disabled={isLoading || loginSuccess}
                className="w-full text-left p-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 transition-colors">
                    ABCD Technologies (Bidder 01)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Eligible (96%)</span>
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-1 flex justify-between">
                  <span>GSTIN: 07AAAAA0000A1Z5</span>
                  <span className="font-semibold text-emerald-700">Quick Sign In →</span>
                </div>
              </button>

              {/* Quick Persona 2 */}
              <button
                type="button"
                onClick={() => handleDemoLogin('bidder-02')}
                disabled={isLoading || loginSuccess}
                className="w-full text-left p-3 rounded-2xl border-2 border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 transition-all cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900 transition-colors">
                    BCDE Solutions (Bidder 02)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Clarification (76%)</span>
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-1 flex justify-between">
                  <span>Name Mismatch on MAF</span>
                  <span className="font-semibold text-amber-700">Quick Sign In →</span>
                </div>
              </button>

              {/* Quick Persona 3 */}
              <button
                type="button"
                onClick={() => handleDemoLogin('bidder-03')}
                disabled={isLoading || loginSuccess}
                className="w-full text-left p-3 rounded-2xl border-2 border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-400 transition-all cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-red-900 transition-colors">
                    CDEF Industries (Bidder 03)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center space-x-1">
                    <XCircle className="w-2.5 h-2.5" />
                    <span>Debarred (28%)</span>
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-600 mt-1 flex justify-between">
                  <span>CPPP Blacklisted / Cancelled GST</span>
                  <span className="font-semibold text-red-700">Quick Sign In →</span>
                </div>
              </button>

              {loginSuccess && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Authenticated as Bidder! Redirecting to dashboard...</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Custom Credentials Form */}
          {authTab === 'CREDENTIALS' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Company GSTIN</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Authorized Signatory Email</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || loginSuccess}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Signing in...</span>
                  </>
                ) : isLoading ? (
                  <span>Authenticating Bidder...</span>
                ) : (
                  <>
                    <span>Sign In to Bidder Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch Role Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">Are you a Government Procurement Officer? </span>
            <Link
              href="/officer/login"
              className="text-amber-800 hover:underline font-bold"
            >
              Switch to Officer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
