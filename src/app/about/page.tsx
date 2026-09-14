'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Database,
  GitCompare,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Activity,
  Layers,
  FileCheck2,
  Scale,
  Clock,
  Laptop,
  Hash,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/authGuard';

export default function AboutPage() {
  const { t } = useLanguage();
  const { isBidder, isOfficer } = useAuth();

  const backHref = isBidder ? '/bidder/dashboard' : isOfficer ? '/officer/dashboard' : '/role-selection';

  return (
    <div className="space-y-6 pb-14 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href={backHref}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title={t('about.back_to_portal', 'Back to Portal')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('about.page_title', 'About the System')}
              </h1>
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                <span>GeM RegTech</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {t('about.subtitle', 'Automated Procurement Verification & Compliance Engine')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href={backHref}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>{t('about.back_to_portal', 'Back to Portal')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* System Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900">
            <Scale className="w-4 h-4 text-blue-900" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {t('about.overview_title', 'Architecture & Design Overview')}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('about.subtitle', 'Automated Procurement Verification & Compliance Engine')}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          {t(
            'about.overview_desc',
            'This system is an explainable, human-in-the-loop procurement verification and compliance engine designed to assist procurement officers in evaluating tender and bidder information. It combines deterministic compliance rules, simulated registry verification, cross-document entity checking, and tamper-evident audit logging.'
          )}
        </p>

        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <span className="leading-snug">
            {t(
              'about.simulation_notice',
              'Note: External statutory registry integrations (GSTN, Udyam MSME, CPPP Debarment) are running in high-fidelity simulated/demo mode for demonstration and evaluation purposes.'
            )}
          </span>
        </div>
      </div>

      {/* 4 CORE SYSTEM FEATURES */}
      <div className="space-y-5">
        {/* FEATURE 1: Deterministic Engine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-blue-900" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('about.feature_engine_title', 'Deterministic Engine')}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('about.feature_engine_sub', 'Rule-based mathematical & threshold gate')}
                </span>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 self-start sm:self-auto">
              {t('about.feature_engine_badge', 'Zero LLM Hallucination')}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {t(
              'about.feature_engine_desc',
              'Uses strict deterministic rules for numerical, date, and threshold-based compliance evaluations, avoiding LLM-based decisions for compliance mathematics.'
            )}
          </p>

          {/* Principle Callout */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <span className="font-bold text-slate-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('about.engine_principle_title', 'Core Engineering Principle')}</span>
            </span>
            <p className="text-slate-600 leading-relaxed pl-5">
              {t(
                'about.engine_principle_desc',
                'AI may assist with document interpretation, but compliance calculations are handled by deterministic rules to ensure predictable results.'
              )}
            </p>
          </div>

          {/* Numerical Example Card */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-blue-950 block text-[11.5px]">
              {t('about.engine_example_title', 'Calculation Example')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11.5px]">
              <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">{t('Threshold', 'Threshold')}</span>
                <span className="font-bold text-slate-800">{t('about.engine_example_min', 'Minimum turnover: ₹5 crore')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">{t('Bidder Filing', 'Bidder Filing')}</span>
                <span className="font-bold text-slate-800">{t('about.engine_example_bidder', 'Bidder turnover: ₹4.7 crore')}</span>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-rose-700 block font-sans">{t('Evaluation Gate', 'Evaluation Gate')}</span>
                <span className="font-bold text-rose-900">{t('about.engine_example_result', 'Result: NOT COMPLIANT')}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1">
              {t(
                'about.engine_example_note',
                'Do not allow an AI/LLM component to override deterministic compliance results.'
              )}
            </p>
          </div>
        </div>

        {/* FEATURE 2: Registry Adapters + Section 5 HEALTH SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('about.feature_adapters_title', 'Registry Adapters')}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('about.feature_adapters_sub', 'Statutory verification connectors')}
                </span>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
              {t('about.feature_adapters_badge', 'SIMULATED / DEMO')}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {t(
              'about.feature_adapters_desc',
              'Pluggable simulated adapters representing external registry verification workflows.'
            )}
          </p>

          {/* Adapter Implementations List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              {t('about.adapter_examples_title', 'Simulated Adapter Implementations')}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{t('about.adapter_gstn_title', 'GSTN Adapter — Simulated')}</span>
                  <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">312ms</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t('about.adapter_gstn_desc', 'Validates GSTIN status, legal entity name, and return filing regularities with simulated network latency.')}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{t('about.adapter_udyam_title', 'Udyam Adapter — Simulated')}</span>
                  <span className="text-[9.5px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded-md">284ms</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t('about.adapter_udyam_desc', 'Verifies MSME enterprise classification and GFR Rule 153 procurement preferences.')}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{t('about.adapter_cppp_title', 'CPPP Debarment Adapter — Simulated')}</span>
                  <span className="text-[9.5px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.2 rounded-md">195ms</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t('about.adapter_cppp_desc', 'Checks national blacklist and debarment records under GFR Rule 151.')}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: SIMULATED REGISTRY ADAPTER HEALTH (Preserved Latencies)         */}
          {/* ========================================================================= */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  {t('about.registry_health_title', 'Simulated Registry Adapter Health')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('about.registry_health_sub', 'Status and execution latency indicators for simulated adapters')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* GSTN Adapter */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span className="font-bold text-[#15803D] text-[11.5px]">
                    GSTN Adapter — {t('about.status_simulated', 'Simulated')}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                  <span className="font-bold text-emerald-800">{t('about.status_active', 'Active')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-emerald-900">312ms</span>
                </div>
              </div>

              {/* Udyam Adapter */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EAF4FF] border border-[#D8E6F5] text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
                  <span className="font-bold text-[#1D4ED8] text-[11.5px]">
                    Udyam Adapter — {t('about.status_simulated', 'Simulated')}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                  <span className="font-bold text-blue-800">{t('about.status_active', 'Active')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-blue-900">284ms</span>
                </div>
              </div>

              {/* CPPP Debarment Adapter */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                  <span className="font-bold text-[#7C3AED] text-[11.5px]">
                    CPPP Debarment Adapter — {t('about.status_simulated', 'Simulated')}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                  <span className="font-bold text-purple-800">{t('about.status_active', 'Active')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-purple-900">195ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE 3: Cross-Entity Check */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <GitCompare className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('about.feature_crosscheck_title', 'Cross-Entity Check')}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('about.feature_crosscheck_sub', 'Cross-document fuzzy name matching')}
                </span>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 self-start sm:self-auto">
              {t('about.feature_crosscheck_badge', 'Levenshtein Distance')}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {t(
              'about.feature_crosscheck_desc',
              'Uses Levenshtein-distance based matching to identify possible variations in entity names across submitted documents and flag cases requiring manual verification.'
            )}
          </p>

          <p className="text-xs text-slate-600 leading-relaxed">
            {t(
              'about.crosscheck_explanation',
              'This feature checks whether different documents appear to refer to the same organization, flagging minor typos, abbreviations, or structural naming discrepancies.'
            )}
          </p>

          {/* Anonymized Levenshtein Example */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-amber-950 block text-[11.5px]">
              {t('about.crosscheck_example_title', 'Entity Name Consistency Example')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">{t('Document A', 'Document A')}</span>
                <span className="font-semibold text-slate-800">
                  {t('about.crosscheck_doc_a', 'Document A: ABCD Technologies Private Limited')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">{t('Document B', 'Document B')}</span>
                <span className="font-semibold text-slate-800">
                  {t('about.crosscheck_doc_b', 'Document B: ABCD Technology Pvt. Ltd.')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">{t('Document C', 'Document C')}</span>
                <span className="font-semibold text-slate-800">
                  {t('about.crosscheck_doc_c', 'Document C: A.B.C.D. Technologies Pvt Ltd')}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626] font-semibold flex items-center space-x-2 mt-1">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>
                {t(
                  'about.crosscheck_result',
                  'Possible entity-name inconsistency — manual verification recommended.'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* FEATURE 4: Immutable Audit Log */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center shrink-0">
                <LockKeyhole className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('about.feature_audit_title', 'Immutable Audit Log')}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t('about.feature_audit_sub', 'Section 65B certified evidence trail')}
                </span>
              </div>
            </div>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200 self-start sm:self-auto">
              {t('about.feature_audit_badge', 'Section 65B & GFR 151')}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {t(
              'about.feature_audit_desc',
              'Maintains tamper-evident records of automated verification runs and human officer actions.'
            )}
          </p>

          {/* Audit Trail Fields Specification */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              {t('about.audit_records_title', 'Audit Record Information Includes:')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_user', 'User: Identity of the authenticated user who performed the action (e.g., ABCD)')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_role', 'Role: User designation (Officer or Bidder)')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <Laptop className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_device', 'Device / Session: Client environment and cryptographic session token')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <Clock className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_datetime', 'Date & Time: Exact ISO timestamp formatted in Indian Standard Time (IST)')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_action', 'Action Performed: Comprehensive description of the procurement action executed')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <Hash className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_ref', 'Tender / Reference ID: Associated procurement packet and bidder reference')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <Layers className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_changes', 'Before / After Values: Field modification tracking (e.g., Status: Under Review → Qualified)')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                <span className="text-slate-700">
                  {t('about.audit_item_integrity', 'Integrity & Hash: SHA-256 cryptographic chain and digital signature verification')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/audit-logs"
              className="px-3.5 py-1.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{t('about.view_audit_logs', 'View Audit Trail')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
