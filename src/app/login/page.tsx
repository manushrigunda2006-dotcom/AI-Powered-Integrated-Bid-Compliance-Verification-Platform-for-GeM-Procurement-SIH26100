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
  Fingerprint,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [officerId, setOfficerId] = useState('v.ramaswamy@gem.gov.in');
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('gem_officer_session', JSON.stringify({
          name: 'Shri V. Ramaswamy',
          designation: 'Joint Director (GeM Procurement)',
          department: 'Ministry of Commerce & Industry / MeitY',
          email: 'v.ramaswamy@gem.gov.in',
          officerId: 'GEM-OFF-2024-8841',
          dscValid: true,
          authenticatedAt: new Date().toISOString(),
        }));
      }
      setTimeout(() => {
        router.push('/');
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Emblem / GeM Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-blue-900 to-blue-700 text-white font-black text-2xl shadow-md ring-4 ring-blue-100">
          GeM
        </div>

        <div>
          <span className="bg-blue-100 text-blue-900 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            National Procurement Portal • SIH26100
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Procurement Officer Sign-In
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Secure access for Government Evaluators, Tender Authorities, and Bid Adjudication Officers.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-xl border border-slate-200 rounded-3xl space-y-5">
          {/* Quick Demo 1-Click Login Card */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-800 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>SIH Evaluator Demo Access</span>
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                Authorized
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                VR
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold text-slate-900 truncate">Shri V. Ramaswamy</div>
                <div className="text-[11px] text-slate-500 truncate">Joint Director (GeM Procurement)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleLogin()}
              disabled={isLoading || loginSuccess}
              className="w-full mt-2 py-2 px-3 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Authenticated! Redirecting to Dashboard...</span>
                </>
              ) : isLoading ? (
                <span>Authenticating Officer...</span>
              ) : (
                <>
                  <span>1-Click Sign In as Joint Director</span>
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

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'CREDENTIALS' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Government Officer Email / GeM ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                      placeholder="officer@gem.gov.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password / Passphrase
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
              </>
            )}

            {authMode === 'PARICHAY' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Fingerprint className="w-8 h-8 text-blue-800 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">National Single Sign-On (Jan Parichay)</h4>
                <p className="text-[11px] text-slate-500">
                  Authenticate using Government of India Central Identity Gateway with Aadhaar / e-Pramaan OTP.
                </p>
              </div>
            )}

            {authMode === 'DSC' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Class-3 PKI Digital Signature Token</h4>
                <p className="text-[11px] text-slate-500">
                  Insert your hardware cryptographic e-Token (ePass2003 / Watchdata) to unlock officer clearance.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sign-In Successful!</span>
                </>
              ) : isLoading ? (
                <span>Validating Security Clearance...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify Credentials & Enter Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NIC Cyber Security Protected</span>
            </span>
            <Link href="/" className="text-blue-900 font-bold hover:underline">
              Skip to Dashboard ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
