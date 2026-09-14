'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  ArrowLeft,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Lock,
  FileText,
  Upload,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { auditService } from '@/services/auditService';
import { bidSubmissionService, BidSubmission } from '@/services/bidSubmissionService';
import { AuditLog } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderLogsPage() {
  const { t } = useLanguage();
  const { session, isAuthenticated, isAuthorized, isLoading } = useBidderAuth(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [submissions, setSubmissions] = useState<BidSubmission[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBidderLogsAndSubmissions() {
      if (!session?.bidderId) return;
      try {
        setLoadingLogs(true);
        // Strict role-based filtering at data query layer: only bidder's own logs
        const data = await auditService.getLogsForRole('bidder', session.bidderId);
        setLogs(data);

        // Load submissions made by this bidder
        const subs = bidSubmissionService.getSubmissionsForBidder(session.bidderId);
        setSubmissions(subs);
      } catch (err) {
        console.error('Failed to load bidder logs & submissions:', err);
      } finally {
        setLoadingLogs(false);
      }
    }

    if (session?.bidderId) {
      loadBidderLogsAndSubmissions();
    }
  }, [session?.bidderId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery]);

  if (isLoading || !isAuthorized || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">{t('Verifying Bidder Credentials...', 'Verifying Bidder Authorization...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/bidder/dashboard"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            title="Back to Bidder Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('nav.my_logs', 'Bidder History & Submissions')}
              </h1>
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                {t('Bidder Isolation Enforced', 'Bidder Isolation Enforced')}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {t('Complete history of your tender submissions, uploaded documents, and cryptographic activity logs for', 'Complete history of your tender submissions, uploaded documents, and cryptographic activity logs for')} <strong className="text-slate-800">{session.companyName}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>GSTIN: <strong className="font-mono text-slate-800">{session.gstNumber}</strong></span>
        </div>
      </div>

      {/* 1. My Tender Submissions History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-blue-900" />
            <span>{t('My Tender Submissions', 'My Tender Submissions')}</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {submissions.length} {t('Active Submissions Recorded', 'Active Submissions Recorded')}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            {t('No tender submissions recorded yet. Browse Available Tenders to participate.', 'No tender submissions recorded yet. Browse Available Tenders to participate.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {submissions.map((sub) => {
              const isQualified = sub.status === 'QUALIFIED';
              const isClarification = sub.status === 'CLARIFICATION_REQUESTED';
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                          {sub.tenderNumber}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                            isQualified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isClarification
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {sub.complianceStatus || 'Submitted - Under Verification'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ID: {sub.id}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{sub.tenderTitle}</h3>
                      <p className="text-xs text-slate-500 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sub.department}</span>
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      <Link
                        href={`/bidder/tenders/${sub.tenderId}/submit`}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('View / Update Dossier', 'View / Update Dossier')}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('Submission Date/Time', 'Submission Date/Time')}
                      </span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('Submission Status', 'Submission Status')}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {sub.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('Compliance Status', 'Compliance Status')}
                      </span>
                      <span className="font-bold text-blue-900 text-xs">
                        {sub.complianceStatus}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('Dossier Files', 'Dossier Files')}
                      </span>
                      <span className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>{sub.documents?.length || 0} {t('Files', 'Files')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Search & Activity Logs Audit Trail */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-900" />
              <span>{t('Bidder Activity Audit Trail', 'Bidder Activity Audit Trail')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Verified records of document uploads, replacements, tender views, and clarification responses.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Showing {filteredLogs.length} of {logs.length} events
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search my logs by action or event..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Logs Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loadingLogs ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading your activity logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No activity logs recorded for this bidder yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isUpload = log.action.includes('DOCUMENT') || log.action.includes('UPLOAD');
                const isSubmit = log.action.includes('SUBMIT');

                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-900" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {log.action}
                            </span>
                            <span
                              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                                isSubmit
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isUpload
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {log.actor === 'OFFICER' ? 'OFFICIAL NOTICE' : 'BIDDER ACTION'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {new Date(log.timestamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'medium',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono">
                        Log ID: {log.id}
                      </div>
                    </div>

                    {/* Action description preview */}
                    {(log.metadata?.action_description || log.metadata?.change_description) && (
                      <p className="text-xs text-slate-600 pl-7 mt-1">
                        {String(log.metadata?.action_description || log.metadata?.change_description)}
                      </p>
                    )}

                    {/* Expanded Metadata JSON view */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 pl-7">
                        <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-3 rounded-xl overflow-x-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
