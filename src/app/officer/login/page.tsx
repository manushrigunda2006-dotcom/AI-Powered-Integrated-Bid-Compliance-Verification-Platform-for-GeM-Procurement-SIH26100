'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Key,
  Building2,
  ArrowRight,
  ArrowLeft,
  Fingerprint,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { setOfficerSession } from '@/lib/authGuard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { auditService } from '@/services/auditService';

export default function OfficerLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [officerId, setOfficerId] = useState('abcd@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [authMode, setAuthMode] = useState<'CREDENTIALS' | 'PARICHAY' | 'DSC'>('CREDENTIALS');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      
      setOfficerSession({
        name: 'ABCD',
        department: 'Department of Public Procurement & IT Infrastructure',
        email: officerId.includes('@') ? officerId : 'abcd@gmail.com',
        officerId: 'OFFICER-ABCD-001',
        dscValid: true,
        authenticatedAt: new Date().toISOString(),
        sessionId: 'SESSION-ABCD-001',
        device: 'Windows Desktop • Chrome',
      });

      // Record USER_LOGIN audit event upon successful authentication
      try {
        auditService.recordAuthEvent({
          eventType: 'USER_LOGIN',
          userName: 'ABCD',
          role: 'Officer',
          device: 'Windows Desktop • Chrome',
          sessionId: 'SESSION-ABCD-001',
          actionDescription: 'User logged into the Officer Portal.',
          sessionInfo: `Officer ABCD authenticated via ${authMode} • GeM Officer Portal`,
        });
      } catch (err) {
        console.warn('Notice recording login audit event:', err);
      }

      setTimeout(() => {
        router.push('/officer/dashboard');
      }, 700);
    }, 500);
  };

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
        {/* GeM Officer Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white font-black text-2xl shadow-md ring-4 ring-amber-100">
          <ShieldCheck className="w-8 h-8 text-amber-300" />
        </div>

        <div>
          <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
            {t('officer.login_badge')}
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('officer.login_title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t('officer.login_desc')}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-xl border border-slate-200 rounded-3xl space-y-5">
          {/* Quick Demo 1-Click Login Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-900 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{t('officer.demo_tab')}</span>
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                Authorized
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                AB
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold text-slate-900 truncate">Officer ABCD</div>
                <div className="text-[11px] text-slate-500 truncate">Department of Public Procurement</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleLogin()}
              disabled={isLoading || loginSuccess}
              className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authenticated! Redirecting to Dashboard...</span>
                </>
              ) : isLoading ? (
                <span>Authenticating Officer...</span>
              ) : (
                <>
                  <span>{t('officer.btn_signin')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Auth Method Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('CREDENTIALS')}
              className={`py-1.5 rounded-lg transition-all ${
                authMode === 'CREDENTIALS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              GeM ID
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('PARICHAY')}
              className={`py-1.5 rounded-lg transition-all ${
                authMode === 'PARICHAY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Parichay SSO
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('DSC')}
              className={`py-1.5 rounded-lg transition-all ${
                authMode === 'DSC'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              DSC Token
            </button>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {authMode === 'CREDENTIALS' && (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t('officer.email_label')}</label>
                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t('officer.pwd_label')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            {authMode === 'PARICHAY' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <UserCheck className="w-8 h-8 text-amber-700 mx-auto" />
                <p className="text-[11px] text-slate-600">
                  Gov Single Sign-On enabled via Parichay (National Informatics Centre).
                </p>
              </div>
            )}

            {authMode === 'DSC' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <Fingerprint className="w-8 h-8 text-emerald-700 mx-auto" />
                <p className="text-[11px] text-slate-600">
                  Hardware Token Detected: <strong>{t('officer.dsc_badge')}</strong>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('app.routing')}</span>
                </>
              ) : isLoading ? (
                <span>{t('common.loading')}</span>
              ) : (
                <>
                  <span>{t('officer.btn_signin')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch Role Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs">
            <Link
              href="/bidder/login"
              className="text-blue-900 hover:underline font-bold"
            >
              {t('officer.switch_to_bidder')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
