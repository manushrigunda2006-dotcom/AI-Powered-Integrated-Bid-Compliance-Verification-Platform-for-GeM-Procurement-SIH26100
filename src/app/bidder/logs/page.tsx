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
  Lock
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { auditService } from '@/services/auditService';
import { AuditLog } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BidderLogsPage() {
  const { t } = useLanguage();
  const { session, isAuthenticated, isAuthorized, isLoading } = useBidderAuth(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBidderLogs() {
      if (!session?.bidderId) return;
      try {
        setLoadingLogs(true);
        // Strict role-based filtering at data query layer
        const data = await auditService.getLogsForRole('bidder', session.bidderId);
        setLogs(data);
      } catch (err) {
        console.error('Failed to load bidder logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    }

    if (session?.bidderId) {
      loadBidderLogs();
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
          <p className="text-xs font-bold text-slate-500">Verifying Bidder Authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
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
                {t('nav.my_logs')}
              </h1>
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                Bidder Isolation Enforced
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Audit trail of document submission, automated compliance evaluations, and official notices for <strong className="text-slate-800">{session.companyName}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>GSTIN: <strong className="font-mono text-slate-800">{session.gstNumber}</strong></span>
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
        <div className="text-xs text-slate-500 font-bold">
          Showing {filteredLogs.length} of {logs.length} events
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
                              log.actor === 'OFFICER'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {log.actor === 'OFFICER' ? 'OFFICIAL NOTICE' : 'SYSTEM RUN'}
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
  );
}
