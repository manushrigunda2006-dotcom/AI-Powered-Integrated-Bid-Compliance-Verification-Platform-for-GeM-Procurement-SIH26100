'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  PlusCircle,
  UserCircle,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Cpu,
  Database,
  GitCompare,
  LockKeyhole,
  CheckCircle2,
  Building2,
  X,
  Activity,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { useOfficerAuth } from '@/lib/authGuard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MOCK_BIDDERS } from '@/lib/mock-data/tender-seed';

export default function OfficerDashboardPage() {
  const { session, isAuthenticated, isAuthorized, isLoading } = useOfficerAuth(true);
  const { t } = useLanguage();
  const tenderId = 'tender-gem-2026-cloud';

  // Bidder filtering and search states for all 20 bidders
  const [bidderSearch, setBidderSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  // Interactive modal state for feature inspection
  const [activeModal, setActiveModal] = useState<'engine' | 'adapters' | 'crosscheck' | null>(null);

  // Levenshtein test state for Cross-Entity modal
  const [entity1, setEntity1] = useState('ABCD Technologies');
  const [entity2, setEntity2] = useState('ABCD Technology');

  const calculateSimilarity = (s1: string, s2: string): { distance: number; score: number } => {
    const a = s1.trim().toLowerCase();
    const b = s2.trim().toLowerCase();
    if (!a.length && !b.length) return { distance: 0, score: 100 };
    if (!a.length) return { distance: b.length, score: 0 };
    if (!b.length) return { distance: a.length, score: 0 };

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    const distance = matrix[b.length][a.length];
    const maxLen = Math.max(a.length, b.length);
    const ratio = Math.max(0, (1 - distance / maxLen) * 100);
    return { distance, score: Math.round(ratio) };
  };

  const similarityResult = calculateSimilarity(entity1, entity2);

  const lowCount = MOCK_BIDDERS.filter((b) => b.risk_level === 'LOW').length;
  const medCount = MOCK_BIDDERS.filter((b) => b.risk_level === 'MEDIUM').length;
  const highCount = MOCK_BIDDERS.filter((b) => b.risk_level === 'HIGH').length;

  const filteredBidders = MOCK_BIDDERS.filter((b) => {
    const matchesRisk = riskFilter === 'ALL' ? true : b.risk_level === riskFilter;
    const matchesSearch =
      b.company_name.toLowerCase().includes(bidderSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(bidderSearch.toLowerCase()) ||
      b.gst_number.toLowerCase().includes(bidderSearch.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Verifying Officer Credentials &amp; Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[#334155]">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Card, ~65% Left / ~35% Right, Light Blue #EAF4FF)        */}
      {/* ========================================================================= */}
      <div className="relative rounded-[20px] border border-[#D6E4F5] bg-gradient-to-br from-[#EAF4FF] via-[#E3EFFD] to-[#EEF6FF] shadow-[0_4px_16px_rgba(15,47,99,0.06)] overflow-hidden min-h-[300px] lg:min-h-[315px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10 h-full">
          {/* HERO LEFT AREA (~65% of Hero Width: 8 of 12 cols) */}
          <div className="lg:col-span-8 p-6 sm:p-7 lg:pr-4 flex flex-col justify-between space-y-3.5 z-10">
            {/* Top SIH Badge */}
            <div className="inline-flex items-center self-start bg-[#DCEBFF] text-[#1D4ED8] text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] mr-1.5 animate-pulse" />
              <span>Smart India Hackathon (SIH) Prototype</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-[24px] sm:text-[28px] lg:text-[31px] font-extrabold text-[#0B2E59] tracking-tight leading-[1.1] max-w-[680px]">
              {t('officer.dash_heading', 'Automated Verification & Compliance Assistant for Government Procurement (GeM)')}
            </h1>

            {/* Hero Description */}
            <p className="text-[#365A7D] text-[11px] sm:text-[11.5px] leading-[1.5] max-w-[620px] font-normal">
              {t('officer.dash_desc', 'AI-powered procurement compliance verification platform that helps officers evaluate tender and bidder documents, apply deterministic compliance rules, detect cross-document inconsistencies, assess risk, and maintain an explainable audit trail.')}
            </p>

            {/* Hero Buttons */}
            <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
              {/* PRIMARY: Launch Officer Verification Portal → */}
              <Link
                href="/tenders"
                className="inline-flex items-center justify-center h-[38px] px-4.5 bg-[#FFAA00] hover:bg-[#F59E0B] text-[#111827] font-bold text-[12.5px] rounded-[10px] shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t('officer.launch_portal', 'Launch Officer Verification Portal')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#111827]" />
              </Link>

              {/* SECONDARY: Open Hero Verification Screen ↗ */}
              <Link
                href="/tenders/11111111-1111-1111-1111-111111111111/bidders/22222222-2222-2222-2222-222222222221/verification"
                className="inline-flex items-center justify-center h-[38px] px-4 bg-[#FFFFFF] hover:bg-slate-50 text-[#123B73] font-bold text-[12.5px] rounded-[10px] border border-[#D7E3F0] shadow-2xs transition-colors cursor-pointer"
              >
                <span>{t('officer.open_hero', 'Open Hero Verification Screen')}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-[#123B73]" />
              </Link>
            </div>
          </div>

          {/* HERO RIGHT SIDE (~35% of Hero Width: 4 of 12 cols) */}
          <div className="lg:col-span-4 relative flex flex-col justify-center p-5 sm:p-6 lg:pl-2 z-10 space-y-2.5">
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-[#CDE1F7] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#0F2F63]">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Deterministic Rule Gate</span>
                </span>
                <span className="bg-[#ECFDF5] text-[#15803D] px-1.5 py-0.2 rounded text-[8.5px] font-bold">Exact Math</span>
              </div>
              <p className="text-[10px] text-[#475569] leading-tight">
                Turnover, experience, and validity evaluated via strict deterministic code.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-[#CDE1F7] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#0F2F63]">
                <span className="flex items-center space-x-1.5">
                  <GitCompare className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Cross-Document Entity Check</span>
                </span>
                <span className="bg-[#FEF3C7] text-[#B45309] px-1.5 py-0.2 rounded text-[8.5px] font-bold">Levenshtein</span>
              </div>
              <p className="text-[10px] text-[#475569] leading-tight">
                Detects legal entity variations across GST, MAF, and audit certificates.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-[#CDE1F7] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#0F2F63]">
                <span className="flex items-center space-x-1.5">
                  <LockKeyhole className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Audit Trail &amp; Evidence</span>
                </span>
                <span className="bg-[#F3E8FF] text-[#7C3AED] px-1.5 py-0.2 rounded text-[8.5px] font-bold">Sec 65B</span>
              </div>
              <p className="text-[10px] text-[#475569] leading-tight">
                Tamper-evident log with PKI cryptographic officer sign-off.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WORKFLOW SECTION (Heading, Subtitle, SIH Architecture Badge)             */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[18px] sm:text-[19px] font-bold text-[#0F2F63] tracking-tight">
              Procurement Officer Workflow Navigation
            </h2>
            <p className="text-[10.5px] text-[#64748B]">
              End-to-end evaluation lifecycle from RFP drafting to officer adjudication &amp; audit trails
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
            SIH26100 Architecture
          </span>
        </div>

        {/* THREE LARGE WORKFLOW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* CARD 1: Existing Tenders */}
          <Link
            href="/tenders"
            className="p-4 sm:p-5 bg-[#FFFFFF] rounded-[14px] border border-[#D9E3EF] hover:border-[#1D4ED8] hover:shadow-md transition-all group flex flex-col justify-between h-[155px] sm:h-[160px] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] text-[#1D4ED8] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[9.5px] uppercase font-bold text-[#1D4ED8] tracking-wider">
                  RFP DIRECTORY
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-[#0F2F63] group-hover:text-[#1D4ED8] transition-colors leading-tight">
                Existing Tenders
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                Inspect active procurement RFPs, review eligibility criteria, and evaluate enrolled bidder packets.
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-bold text-[#1D4ED8]">
              <span>Browse Active RFPs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARD 2: Create Tender RFP */}
          <Link
            href="/tenders/new"
            className="p-4 sm:p-5 bg-[#FFFFFF] rounded-[14px] border border-[#D9E3EF] hover:border-[#16A34A] hover:shadow-md transition-all group flex flex-col justify-between h-[155px] sm:h-[160px] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-[9.5px] uppercase font-bold text-[#16A34A] tracking-wider">
                  RFP SPECIFICATION BUILDER
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-[#0F2F63] group-hover:text-[#16A34A] transition-colors leading-tight">
                Create Tender RFP
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                Draft tender specifications, configure deterministic threshold clauses, and enforce GFR Rule 151.
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-bold text-[#16A34A]">
              <span>Launch RFP Builder</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARD 3: Officer Profile & DSC */}
          <Link
            href="/profile"
            className="p-4 sm:p-5 bg-[#FFFFFF] rounded-[14px] border border-[#D9E3EF] hover:border-[#7C3AED] hover:shadow-md transition-all group flex flex-col justify-between h-[155px] sm:h-[160px] cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-bold">
                  <UserCircle className="w-4 h-4" />
                </div>
                <span className="text-[9.5px] uppercase font-bold text-[#7C3AED] tracking-wider">
                  OFFICER CREDENTIAL &amp; PKI
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-[#0F2F63] group-hover:text-[#7C3AED] transition-colors leading-tight">
                Officer Profile &amp; DSC
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                Inspect Class-3 PKI digital signature token standing, adjudication statistics, and signed audit trails.
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-bold text-[#7C3AED]">
              <span>View Profile &amp; Security</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FOUR SMALL FEATURE CARDS (Visually Compact 95–110px Height)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* CARD 1: Deterministic Engine */}
        <div
          onClick={() => setActiveModal('engine')}
          className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E3EF] hover:border-[#1D4ED8] p-3.5 shadow-2xs flex flex-col justify-between space-y-1.5 h-[100px] cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#EAF4FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-[#0F2F63] text-[12px]">Deterministic Engine</h4>
          </div>
          <p className="text-[#64748B] text-[10px] leading-snug line-clamp-2">
            Zero LLM hallucination in compliance math. Strict numerical, date, and threshold evaluations.
          </p>
        </div>

        {/* CARD 2: Registry Adapters */}
        <div
          onClick={() => setActiveModal('adapters')}
          className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E3EF] hover:border-[#16A34A] p-3.5 shadow-2xs flex flex-col justify-between space-y-1.5 h-[100px] cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-[#0F2F63] text-[12px]">Registry Adapters</h4>
          </div>
          <p className="text-[#64748B] text-[10px] leading-snug line-clamp-2">
            Pluggable adapter layer simulating GSTN, Udyam MSME, and CPPP blacklist checks with simulated latency.
          </p>
        </div>

        {/* CARD 3: Cross-Entity Check */}
        <div
          onClick={() => setActiveModal('crosscheck')}
          className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E3EF] hover:border-[#F59E0B] p-3.5 shadow-2xs flex flex-col justify-between space-y-1.5 h-[100px] cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <GitCompare className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-[#0F2F63] text-[12px]">Cross-Entity Check</h4>
          </div>
          <p className="text-[#64748B] text-[10px] leading-snug line-clamp-2">
            Levenshtein distance matching across GST, OEM Authorization, and Audit filings to flag variations.
          </p>
        </div>

        {/* CARD 4: Immutable Audit Log */}
        <Link
          href="/audit-logs"
          className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E3EF] hover:border-[#7C3AED] p-3.5 shadow-2xs flex flex-col justify-between space-y-1.5 h-[100px] cursor-pointer transition-all block"
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shrink-0">
              <LockKeyhole className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-[#0F2F63] text-[12px]">Immutable Audit Log</h4>
          </div>
          <p className="text-[#64748B] text-[10px] leading-snug line-clamp-2">
            Tamper-evident logs of automated runs and signed human officer adjudication decisions.
          </p>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTIVE TENDER SECTION (Heading, Subtitle, 1 Active RFP Badge, Card)     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#0F2F63] tracking-tight">
              {t('officer.active_tenders_heading', 'Active GeM Tenders Pending Adjudication')}
            </h2>
            <p className="text-[10.5px] text-[#64748B]">
              {t('officer.active_tenders_desc', 'Procurement packets queued for automated verification and officer sign-off')}
            </p>
          </div>
          <span className="bg-[#EAF4FF] text-[#1D4ED8] font-bold text-[10.5px] px-3 py-0.5 rounded-full border border-[#D8E6F5]">
            1 Active RFP
          </span>
        </div>

        {/* ACTIVE TENDER CARD */}
        <div className="bg-[#FFFFFF] rounded-[14px] border border-[#D9E3EF] p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Top Row: Badges, Title, Department & Review Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="bg-[#0F2F63] text-white font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-md">
                  GEM/2026/B/892104
                </span>
                <span className="bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Technical Opening Done
                </span>
              </div>

              {/* EXACT Tender Title */}
              <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0F2F63] leading-snug">
                Procurement of High-End Enterprise Cloud Servers &amp; Networking Hardware for National Data Centers
              </h3>

              {/* EXACT Department */}
              <p className="text-[11px] text-[#475569] flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <span>Department of Public Procurement &amp; IT Infrastructure</span>
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-[#64748B] block tracking-wider">
                  ESTIMATED BUDGET
                </span>
                <span className="text-[15px] font-black text-[#0F2F63]">
                  ₹4.50 Crores
                </span>
              </div>

              <Link
                href={`/tenders/${tenderId}/bidders`}
                className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-[#FFFFFF] text-[11px] font-bold rounded-[8px] shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{t('officer.review_bidders_btn', { count: MOCK_BIDDERS.length })}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* SEARCH & RISK FILTERS FOR 20 BIDDERS */}
          <div className="pt-3 border-t border-[#E7EEF6] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={t('officer.search_bidders_placeholder', 'Search by company name, GSTIN, or bidder ID...')}
                value={bidderSearch}
                onChange={(e) => setBidderSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-slate-50/60"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto text-[10.5px]">
              <button
                type="button"
                onClick={() => setRiskFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  riskFilter === 'ALL'
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('officer.filter_all', { count: MOCK_BIDDERS.length })}
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('LOW')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  riskFilter === 'LOW'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {t('officer.filter_low', { count: lowCount })}
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('MEDIUM')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  riskFilter === 'MEDIUM'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {t('officer.filter_med', { count: medCount })}
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('HIGH')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  riskFilter === 'HIGH'
                    ? 'bg-red-700 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {t('officer.filter_high', { count: highCount })}
              </button>
            </div>
          </div>

          {/* DYNAMIC 20 BIDDERS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs max-h-[460px] overflow-y-auto pr-1">
            {filteredBidders.map((b, idx) => {
              const codePadded = b.id.replace('bidder-', '').padStart(3, '0');
              const codePrefix = b.company_name.split(' ')[0];
              const code = `BIDDER-${codePrefix}-${codePadded}`;
              const isLow = b.risk_level === 'LOW';
              const isMed = b.risk_level === 'MEDIUM';

              return (
                <Link
                  key={b.id}
                  href={`/tenders/${tenderId}/bidders/${b.id}/verification`}
                  className={`p-2.5 bg-[#FFFFFF] rounded-[10px] border hover:shadow-2xs transition-all space-y-1.5 block cursor-pointer group ${
                    isLow
                      ? 'border-[#D9E3EF] hover:border-[#1D4ED8]'
                      : isMed
                      ? 'border-[#FDE68A] hover:border-[#D97706]'
                      : 'border-[#FECACA] hover:border-[#DC2626]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#64748B] font-bold">
                      {code}
                    </span>
                    <span
                      className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border ${
                        isLow
                          ? 'bg-[#ECFDF5] text-[#15803D] border-[#BBF7D0]'
                          : isMed
                          ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                          : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                      }`}
                    >
                      {isLow
                        ? t('status.low_risk', 'LOW RISK')
                        : isMed
                        ? t('status.medium_risk', 'MEDIUM RISK')
                        : t('status.high_risk', 'HIGH RISK')}
                    </span>
                  </div>
                  <div className="font-bold text-[#0F2F63] group-hover:text-[#1D4ED8] transition-colors truncate text-[11.5px]">
                    {b.company_name}
                  </div>
                  <div className="text-[10px] text-[#64748B] flex justify-between pt-0.5">
                    <span>
                      Score: <strong className="text-[#0F2F63]">{b.overall_score}/100</strong>
                    </span>
                    <span
                      className={`${
                        isLow
                          ? 'text-[#1D4ED8]'
                          : isMed
                          ? 'text-[#D97706]'
                          : 'text-[#DC2626]'
                      } font-bold`}
                    >
                      Inspect →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SIMULATED REGISTRY ADAPTERS HEALTH (Explicitly Tagged "Simulated")      */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#D9E3EF] p-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2 text-[#475569]">
            <Activity className="w-3.5 h-3.5 text-[#0F2F63] shrink-0" />
            <span className="font-bold text-[#0F2F63] text-[11px]">Simulated Registry Adapter Health:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#15803D] font-semibold border border-[#BBF7D0] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              <span>GSTN Adapter — Simulated (Active, 312ms)</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#EAF4FF] text-[#1D4ED8] font-semibold border border-[#D8E6F5] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
              <span>Udyam Adapter — Simulated (Active, 284ms)</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#7C3AED] font-semibold border border-[#E9D5FF] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              <span>CPPP Debarment Adapter — Simulated (Active, 195ms)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 1: Deterministic Engine Details                         */}
      {/* ========================================================================= */}
      {activeModal === 'engine' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#D9E3EF] space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#0F2F63]" />
                <h3 className="text-sm font-bold text-[#0F2F63]">
                  Deterministic Compliance Engine
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#475569]">
              <div className="p-2.5 bg-[#EAF4FF] border border-[#D8E6F5] rounded-xl space-y-1">
                <span className="font-bold text-[#1D4ED8] text-[11px]">
                  Zero LLM Hallucination Guarantee
                </span>
                <p className="text-[#334155] text-[10.5px]">
                  AI is used where interpretation is useful; deterministic rules are used where compliance calculations must be exact.
                </p>
                <p className="text-[#64748B] text-[10px]">
                  LLMs are restricted to OCR key-value extraction. Numerical thresholds (e.g. 4.70 &lt; 5.00 Cr → NOT COMPLIANT) and date validities are evaluated with 100% deterministic code.
                </p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />
                  <span><strong>NUMERIC_GTE:</strong> Strict mathematical checks (e.g. 4.7 &lt; 5 → NOT COMPLIANT) for turnover and experience.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />
                  <span><strong>DATE_BEFORE:</strong> Mathematical comparison of expiry dates against tender closing.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />
                  <span><strong>EXACT_MATCH:</strong> Zero-tolerance validation against debarment status.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 bg-[#0F2F63] hover:bg-[#102F5F] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 2: Simulated Registry Adapters                          */}
      {/* ========================================================================= */}
      {activeModal === 'adapters' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#D9E3EF] space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#16A34A]" />
                <h3 className="text-sm font-bold text-[#0F2F63]">
                  Government Registry Adapters (Simulated)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#475569]">
              <p className="text-[10.5px]">
                Pluggable adapter pattern simulating external government registry responses with network latencies:
              </p>

              <div className="divide-y divide-slate-100 border border-[#D9E3EF] rounded-xl overflow-hidden text-[11px]">
                <div className="p-2.5 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0F2F63] block">GSTN Common Portal Adapter</span>
                    <span className="text-[10px] text-[#64748B]">Validates GSTIN status and return filing frequency</span>
                  </div>
                  <span className="bg-[#ECFDF5] text-[#15803D] font-bold px-2 py-0.5 rounded-full text-[9px]">
                    Simulated (312ms)
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0F2F63] block">MSME Udyam Adapter</span>
                    <span className="text-[10px] text-[#64748B]">Verifies enterprise tier &amp; GFR 153 preferences</span>
                  </div>
                  <span className="bg-[#EAF4FF] text-[#1D4ED8] font-bold px-2 py-0.5 rounded-full text-[9px]">
                    Simulated (284ms)
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0F2F63] block">CPPP Debarment Adapter</span>
                    <span className="text-[10px] text-[#64748B]">Rule 151 national debarment registry check</span>
                  </div>
                  <span className="bg-[#F3E8FF] text-[#7C3AED] font-bold px-2 py-0.5 rounded-full text-[9px]">
                    Simulated (195ms)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 3: Cross-Entity Levenshtein Demo                         */}
      {/* ========================================================================= */}
      {activeModal === 'crosscheck' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#D9E3EF] space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-sm font-bold text-[#0F2F63]">
                  Levenshtein Cross-Entity Name Verification
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#475569]">
              <p className="text-[10.5px]">
                Validates legal entity consistency across GST, PAN, and OEM Authorization letters to catch shell company variations:
              </p>

              <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-[#D9E3EF] text-[11px]">
                <div>
                  <label className="font-bold text-[#334155] block mb-1">
                    GST Registration Legal Name:
                  </label>
                  <input
                    type="text"
                    value={entity1}
                    onChange={(e) => setEntity1(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-[#D9E3EF] rounded-md text-xs font-medium text-[#0F2F63]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#334155] block mb-1">
                    OEM Authorization Letter Entity Name:
                  </label>
                  <input
                    type="text"
                    value={entity2}
                    onChange={(e) => setEntity2(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white border border-[#D9E3EF] rounded-md text-xs font-medium text-[#0F2F63]"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-semibold">
                      Edit Distance: {similarityResult.distance}
                    </span>
                    <span className="text-xs font-bold text-[#0F2F63]">
                      Match: {similarityResult.score}%
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      similarityResult.score >= 85
                        ? 'bg-[#ECFDF5] text-[#15803D]'
                        : similarityResult.score >= 60
                        ? 'bg-[#FEF3C7] text-[#B45309]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}
                  >
                    {similarityResult.score >= 85
                      ? 'MATCH APPROVED'
                      : similarityResult.score >= 60
                      ? 'NAME VARIATION'
                      : 'FLAGGED MISMATCH'}
                  </span>
                </div>

                {similarityResult.distance > 0 && (
                  <div className="p-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[10.5px] text-[#DC2626] font-medium flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Possible entity-name inconsistency — manual verification recommended.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
