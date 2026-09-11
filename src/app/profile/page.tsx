'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  Building2,
  Mail,
  Key,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  XCircle,
  LogOut,
  ExternalLink,
  Award,
  Fingerprint,
  FileSignature,
  Cpu,
  BadgeAlert
} from 'lucide-react';

export default function OfficerProfilePage() {
  const router = useRouter();

  const officer = {
    name: 'ABCD',
    department: 'Ministry of Commerce & Industry / MeitY',
    officerId: 'GEM-OFF-2024-8841',
    email: 'abcd@gmail.com',
    phone: '1234567890',
    jurisdiction: 'National Public Procurement & Technical Adjudication',
    securityClearance: 'Class-3 PKI / GeM Level-IV Authority',
    dscToken: {
      status: 'ACTIVE_VALID',
      hardwareDevice: 'FIPS 140-2 Level 3 Cryptographic Token',
      serialNumber: '04:7A:B3:91:F8:42:C1:99',
      issuer: 'Certifying Authority / PKI Sub-CA III',
      validFrom: '15-Aug-2024',
      validTill: '14-Aug-2027',
      sha256Fingerprint: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    adjudicationStats: {
      totalEvaluated: 18,
      qualified: 11,
      disqualifiedGfr151: 4,
      clarificationsRaised: 3,
      avgTurnaroundTime: '4.2 Minutes (AI Accelerated)',
      regulatoryComplianceRate: '100% GFR-151 Audit Proof',
    },
    recentAuditSignatures: [
      {
        id: 'sig-01',
        timestamp: '10-Sep-2026 14:45 IST',
        bidder: 'DEFG Systems Limited (Bidder 03)',
        tender: 'GEM/2026/B/894120 - Cloud Infrastructure',
        decision: 'DISQUALIFIED',
        reason: 'GFR Rule 151 Blacklist match on CPPP registry (DoE Office Memorandum)',
        status: 'DISQUALIFIED',
      },
      {
        id: 'sig-02',
        timestamp: '10-Sep-2026 11:20 IST',
        bidder: 'CDEF Solutions Private Limited (Bidder 02)',
        tender: 'GEM/2026/B/894120 - Cloud Infrastructure',
        decision: 'CLARIFICATION REQUESTED',
        reason: 'Turnover ₹41.20 Cr falls short of ₹50 Cr minimum threshold; MSME waiver evidence pending',
        status: 'CLARIFICATION',
      },
      {
        id: 'sig-03',
        timestamp: '09-Sep-2026 17:15 IST',
        bidder: 'BCDE Technologies Private Limited (Bidder 01)',
        tender: 'GEM/2026/B/894120 - Cloud Infrastructure',
        decision: 'QUALIFIED',
        reason: '100% Deterministic rule pass (Turnover ₹58.4 Cr, GST Active, MAF Verified)',
        status: 'QUALIFIED',
      },
    ],
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gem_officer_session');
    }
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="text-blue-900 hover:underline font-bold">
          Procurement Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Officer Profile & PKI Standing</span>
      </nav>

      {/* Hero Officer Identification Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white font-black text-2xl flex items-center justify-center ring-4 ring-blue-100 shadow-md shrink-0">
              AB
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {officer.officerId}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Class-3 DSC Active</span>
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  SIH Evaluator Ready
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {officer.name}
              </h1>

              <p className="text-xs text-slate-500 flex items-center space-x-3 pt-1">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{officer.email}</span>
                </span>
                <span>•</span>
                <span>{officer.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 pt-2 md:pt-0">
            <Link
              href="/tenders"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Review Active Tenders</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: PKI Token Card & Adjudication Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Class-3 PKI Security Token Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Digital Signature Credential</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Class-3 PKI Token Verified & Plugged</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Hardware cryptographic device authenticated for legally binding procurement decisions under Indian IT Act 2000.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Token Device</span>
                <span className="text-slate-900 font-bold">{officer.dscToken.hardwareDevice}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Serial Number</span>
                <span className="font-mono text-slate-800">{officer.dscToken.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Certifying Authority</span>
                <span className="text-slate-800">{officer.dscToken.issuer}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Issued On</span>
                  <span className="text-slate-800 font-medium">{officer.dscToken.validFrom}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Valid Until</span>
                  <span className="text-emerald-700 font-bold">{officer.dscToken.validTill}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">SHA-256 Token Fingerprint</span>
                <span className="font-mono text-[10px] text-slate-500 break-all block bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                  {officer.dscToken.sha256Fingerprint}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Adjudication Performance Metrics & Recent Signatures */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-900" />
                <h2 className="text-base font-bold text-slate-900">Officer Adjudication Performance</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">FY 2025–26</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Bids Evaluated
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {officer.adjudicationStats.totalEvaluated}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                  Qualified
                </span>
                <span className="text-2xl font-black text-emerald-800">
                  {officer.adjudicationStats.qualified}
                </span>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1">
                  GFR 151 Disqualified
                </span>
                <span className="text-2xl font-black text-rose-800">
                  {officer.adjudicationStats.disqualifiedGfr151}
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
                  Clarifications
                </span>
                <span className="text-2xl font-black text-amber-800">
                  {officer.adjudicationStats.clarificationsRaised}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-900 gap-2">
              <span className="font-semibold flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>AI Accelerated Turnaround: {officer.adjudicationStats.avgTurnaroundTime}</span>
              </span>
              <span className="font-bold text-emerald-700">
                {officer.adjudicationStats.regulatoryComplianceRate}
              </span>
            </div>
          </div>

          {/* Recent Cryptographically Signed Audit Decisions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-purple-900" />
                <h2 className="text-base font-bold text-slate-900">Recent Signed Adjudications (Audit Trail)</h2>
              </div>
              <span className="text-[11px] text-slate-500">Immutable Log</span>
            </div>

            <div className="space-y-3">
              {officer.recentAuditSignatures.map((sig) => (
                <div
                  key={sig.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          sig.status === 'QUALIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sig.status === 'DISQUALIFIED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sig.decision}
                      </span>
                      <span className="font-bold text-slate-900">{sig.bidder}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{sig.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    {sig.tender}
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">Official Adjudication Finding: </span>
                    {sig.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
