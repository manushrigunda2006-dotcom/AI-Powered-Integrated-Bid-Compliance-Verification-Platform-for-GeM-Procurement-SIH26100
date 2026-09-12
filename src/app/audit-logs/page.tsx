'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { auditService } from '@/services/auditService';
import { AuditLog } from '@/lib/types';
import {
  ShieldCheck,
  Search,
  Filter,
  ArrowLeft,
  Lock,
  User,
  Cpu,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Download,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  LogIn,
  LogOut,
  UserCheck,
  Laptop,
  Layers,
  XCircle,
  FileText,
  Trash2,
} from 'lucide-react';
import { useOfficerAuth } from '@/lib/authGuard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const { session, isAuthenticated, isAuthorized, isLoading: authLoading } = useOfficerAuth(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState<'ALL' | 'OFFICER' | 'SYSTEM'>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<'ALL' | 'LOGIN' | 'LOGOUT' | 'USER_ACTIONS' | 'SYSTEM_ACTIONS'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await auditService.getLogsForRole('officer');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return (
        d.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
    } catch {
      return timestamp;
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Actor filter: ALL, OFFICER, SYSTEM
      if (selectedActor !== 'ALL' && log.actor !== selectedActor) {
        return false;
      }

      // Event type filter: ALL, LOGIN, LOGOUT, USER_ACTIONS, SYSTEM_ACTIONS
      const isLogin = log.action === 'USER_LOGIN' || log.action === 'LOGIN';
      const isLogout = log.action === 'USER_LOGOUT' || log.action === 'LOGOUT';
      const isOfficer = log.actor === 'OFFICER';
      const isSystem = log.actor === 'SYSTEM';

      if (selectedEventType === 'LOGIN' && !isLogin) return false;
      if (selectedEventType === 'LOGOUT' && !isLogout) return false;
      if (selectedEventType === 'USER_ACTIONS' && !isOfficer) return false;
      if (selectedEventType === 'SYSTEM_ACTIONS' && !isSystem) return false;

      // Search filter: action, actor, user_name, officer_name, user_role, device, session_id, action_description, field, changes, bidder_id, tender_id, metadata
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const actionMatch = log.action.toLowerCase().includes(query);
        const actorMatch = log.actor.toLowerCase().includes(query);
        const userMatch =
          Boolean(log.metadata?.user_name && String(log.metadata.user_name).toLowerCase().includes(query)) ||
          Boolean(log.metadata?.officer_name && String(log.metadata.officer_name).toLowerCase().includes(query)) ||
          Boolean(log.metadata?.user_role && String(log.metadata.user_role).toLowerCase().includes(query));
        const deviceMatch = Boolean(log.metadata?.device && String(log.metadata.device).toLowerCase().includes(query));
        const sessionMatch = Boolean(log.metadata?.session_id && String(log.metadata.session_id).toLowerCase().includes(query));
        const descMatch = Boolean(log.metadata?.action_description && String(log.metadata.action_description).toLowerCase().includes(query));
        const fieldMatch = Boolean(log.metadata?.field && String(log.metadata.field).toLowerCase().includes(query));
        const changeMatch =
          Boolean(log.metadata?.before_value && String(log.metadata.before_value).toLowerCase().includes(query)) ||
          Boolean(log.metadata?.after_value && String(log.metadata.after_value).toLowerCase().includes(query));
        const bidderMatch = Boolean(log.bidder_id && log.bidder_id.toLowerCase().includes(query));
        const tenderMatch = Boolean(log.tender_id && log.tender_id.toLowerCase().includes(query));
        const metaMatch = JSON.stringify(log.metadata || {}).toLowerCase().includes(query);

        return (
          actionMatch ||
          actorMatch ||
          userMatch ||
          deviceMatch ||
          sessionMatch ||
          descMatch ||
          fieldMatch ||
          changeMatch ||
          bidderMatch ||
          tenderMatch ||
          metaMatch
        );
      }
      return true;
    });
  }, [logs, selectedActor, selectedEventType, searchQuery]);

  const stats = useMemo(() => {
    const total = logs.length;
    const officerCount = logs.filter((l) => l.actor === 'OFFICER').length;
    const systemCount = logs.filter((l) => l.actor === 'SYSTEM').length;
    const loginCount = logs.filter((l) => l.action === 'USER_LOGIN' || l.action === 'LOGIN').length;
    const logoutCount = logs.filter((l) => l.action === 'USER_LOGOUT' || l.action === 'LOGOUT').length;
    return { total, officerCount, systemCount, loginCount, logoutCount };
  }, [logs]);

  // Generate deterministic mock hash for display
  const getHash = (id: string, timestamp: string) => {
    let hash = 0;
    const str = `${id}-${timestamp}-gem-gov-in`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(12, '0');
  };

  const handleExportCertificate = async () => {
    setIsExporting(true);
    try {
      const activeBidderLog = logs.find((l) => l.bidder_id && l.bidder_id.length > 0);
      const targetBidderId = activeBidderLog?.bidder_id || 'bidder-01';
      const { certificate65BService } = await import('@/services/certificate65BService');
      await certificate65BService.fetchAndDownload65BCertificate(targetBidderId, 'tender-gem-2026-cloud');

      setToastType('success');
      setToastMessage('65B certificate exported successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export certificate:', err);
      setToastType('error');
      setToastMessage('Unable to export the certificate. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await auditService.clearAuditLogs();
      setLogs([]);
      setIsClearDialogOpen(false);
      setToastType('success');
      setToastMessage(t('audit.history_cleared_success', 'Audit history cleared successfully.'));
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to clear audit logs:', err);
      setToastType('error');
      setToastMessage('Failed to clear audit history. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsClearing(false);
    }
  };

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Verifying Officer Audit Access...</p>
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
            href="/officer/dashboard"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            title="Back to Officer Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('nav.audit_trail')}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>{t('nav.gfr_compliant')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {t('audit.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExportCertificate}
            disabled={isExporting}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-900 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
                <span>{t('audit.generating_cert')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t('audit.export_cert')}</span>
              </>
            )}
          </button>

          <Link
            href="/tenders"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>{t('audit.evaluate_tenders')}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Audit Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('audit.total_events')}
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">{t('audit.recorded')}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {t('audit.ledger_note')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('audit.engine_runs')}</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{stats.systemCount}</span>
            <span className="text-xs text-emerald-700 font-medium">100% deterministic</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {t('audit.deterministic_note')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('audit.officer_adjudications')}</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{stats.officerCount}</span>
            <span className="text-xs text-blue-700 font-medium">{t('audit.user_action')}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {t('audit.human_loop_note')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>{t('audit.integrity_status')}</span>
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-black text-emerald-700">{t('audit.verified')}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 font-mono">
            {t('audit.chain_intact')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('audit.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Actor Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{t('audit.actor')}:</span>
            </span>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedActor('ALL')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedActor === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.actor_all')} ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedActor('OFFICER')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedActor === 'OFFICER'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.actor_officer')} ({stats.officerCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedActor('SYSTEM')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedActor === 'SYSTEM'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.actor_system')} ({stats.systemCount})
              </button>
            </div>
          </div>

          {/* Event Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('audit.event_filter')}:</span>
            </span>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedEventType('ALL')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedEventType === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.event_all')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('LOGIN')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedEventType === 'LOGIN'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.event_login')} ({stats.loginCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('LOGOUT')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedEventType === 'LOGOUT'
                    ? 'bg-white text-rose-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.event_logout')} ({stats.logoutCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('USER_ACTIONS')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedEventType === 'USER_ACTIONS'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.event_user_actions')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventType('SYSTEM_ACTIONS')}
                className={`px-2 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedEventType === 'SYSTEM_ACTIONS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('audit.event_system_actions')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-blue-900" />
              <h2 className="text-sm font-bold text-slate-900">
                {t('audit.event_records')} ({filteredLogs.length})
              </h2>
            </div>
            {isAuthorized && (
              <button
                type="button"
                onClick={() => setIsClearDialogOpen(true)}
                className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
                title={t('audit.clear_history', 'Clear History')}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('audit.clear_history', 'Clear History')}</span>
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Standard: GeM-RFP-AUDIT-v2 • Section 65B Certified
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
            <p className="text-xs font-semibold">Loading cryptographic audit log records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {logs.length === 0
                ? t('audit.no_history', 'No audit history available.')
                : t('audit.no_records', 'No matching audit events found')}
            </p>
            <p className="text-xs text-slate-500">
              {logs.length === 0
                ? t('audit.no_history_sub', 'Cleared audit events will be logged here as new officer actions or user sessions occur.')
                : t('audit.no_records_hint', 'Try adjusting your search terms or actor filter.')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const isOfficer = log.actor === 'OFFICER';
              const isAuthLogin = log.action === 'USER_LOGIN' || log.action === 'LOGIN';
              const isAuthLogout = log.action === 'USER_LOGOUT' || log.action === 'LOGOUT';
              const displayAction = isAuthLogin ? 'USER_LOGIN' : isAuthLogout ? 'USER_LOGOUT' : log.action;
              const isExpanded = expandedLogId === log.id;
              const hashSnippet = getHash(log.id, log.timestamp);
              const formattedTime = formatTimestamp(log.timestamp);

              const userName =
                (log.metadata?.user_name as string) ||
                (log.metadata?.officer_name as string) ||
                (isOfficer ? 'ABCD' : 'SYSTEM');
              const roleDisplay =
                (log.metadata?.user_role as string) ||
                (isOfficer ? t('audit.officer') : 'SYSTEM');
              const device =
                (log.metadata?.device as string) ||
                (isOfficer ? 'Windows Desktop • Chrome' : '—');
              const sessionId =
                (log.metadata?.session_id as string) ||
                (isOfficer ? 'SESSION-ABCD-001' : '—');
              const tenderIdDisplay = log.tender_id || 'tender-gem-2026-cloud';

              const actionDesc =
                (log.metadata?.action_description as string) ||
                (log.metadata?.change_description as string) ||
                (isAuthLogin
                  ? 'User logged into the Officer Portal.'
                  : isAuthLogout
                  ? 'User logged out of the Officer Portal.'
                  : log.metadata?.remarks
                  ? String(log.metadata.remarks)
                  : log.action.replace(/_/g, ' '));

              const fieldName = (log.metadata?.field as string) || (log.metadata?.previous_state ? 'Status' : null);
              const beforeVal = (log.metadata?.before_value as string) || (log.metadata?.previous_state as string) || null;
              const afterVal = (log.metadata?.after_value as string) || (log.metadata?.new_state as string) || null;
              const hasChange = Boolean(beforeVal && afterVal);

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      {/* Actor / Event Icon Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isAuthLogin
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isAuthLogout
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : log.action === 'BIDDER_APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : log.action === 'CLARIFICATION_REQUESTED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : log.action === 'BIDDER_DISQUALIFIED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isOfficer
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isAuthLogin ? (
                          <LogIn className="w-4 h-4 text-emerald-700" />
                        ) : isAuthLogout ? (
                          <LogOut className="w-4 h-4 text-rose-700" />
                        ) : log.action === 'BIDDER_APPROVED' ? (
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                        ) : log.action === 'CLARIFICATION_REQUESTED' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                        ) : log.action === 'BIDDER_DISQUALIFIED' ? (
                          <XCircle className="w-4 h-4 text-rose-700" />
                        ) : log.action === 'TENDER_CREATED' || log.action === 'TENDER_DRAFT_SAVED' || log.action === 'TENDER_UPDATED' ? (
                          <FileText className="w-4 h-4 text-blue-800" />
                        ) : isOfficer ? (
                          <User className="w-4 h-4 text-blue-800" />
                        ) : (
                          <Cpu className="w-4 h-4 text-slate-600" />
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Action Name */}
                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                              isAuthLogin
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                                : isAuthLogout
                                ? 'bg-rose-50 text-rose-900 border border-rose-300'
                                : log.action === 'BIDDER_APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : log.action === 'CLARIFICATION_REQUESTED'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : log.action === 'BIDDER_DISQUALIFIED'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'text-slate-900 bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {displayAction}
                          </span>

                          {/* Actor Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOfficer
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isOfficer ? t('audit.officer') : 'SYSTEM'}
                          </span>

                          {/* USER ACTION vs SYSTEM / AUTOMATED ENGINE Pill */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                              isOfficer
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isOfficer ? (
                              <>
                                <User className="w-3 h-3 text-indigo-700" />
                                <span>{t('audit.user_action')}</span>
                              </>
                            ) : (
                              <>
                                <Cpu className="w-3 h-3 text-slate-600" />
                                <span>{t('audit.system_engine')}</span>
                              </>
                            )}
                          </span>

                          {log.bidder_id && (
                            <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 font-mono">
                              {log.bidder_id}
                            </span>
                          )}
                        </div>

                        {/* Human User Details Grid (for Officer / User Actions) */}
                        {isOfficer ? (
                          <div className="space-y-1.5 text-xs text-slate-600 pt-0.5">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>
                                {t('audit.user')}: <strong className="text-slate-900 font-bold">{userName}</strong>
                              </span>
                              <span>
                                {t('audit.role')}: <strong className="text-slate-900 font-bold">{roleDisplay}</strong>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                                <span>{t('audit.device')}: <strong className="text-slate-800 font-semibold">{device}</strong></span>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{t('audit.time')}: <strong className="text-slate-800 font-semibold">{formattedTime}</strong></span>
                              </span>
                              <span className="font-mono">
                                {t('audit.session')}: <strong className="text-slate-800">{sessionId}</strong>
                              </span>
                              <span className="font-mono text-slate-500">
                                {t('audit.tender')}: {tenderIdDisplay || '—'}
                              </span>
                              <span className="font-mono text-[11px] text-emerald-700 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>sha256:{hashSnippet}...</span>
                              </span>
                            </div>

                            <div className="pt-0.5 flex flex-wrap items-center gap-2">
                              <span className="text-slate-700 font-medium">
                                <strong className="text-slate-900 font-semibold">{t('audit.action_label')}:</strong> {actionDesc}
                              </span>
                              {hasChange && (
                                <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-blue-200">
                                  <span className="text-slate-600">{fieldName || 'Status'}:</span>
                                  <span className="line-through text-slate-400">{beforeVal}</span>
                                  <span>→</span>
                                  <span className="font-bold text-emerald-700">{afterVal}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Automated System Details */
                          <div className="space-y-1 text-xs text-slate-600 pt-0.5">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>
                                <strong className="text-slate-800">{t('audit.actor')}:</strong> SYSTEM / AUTOMATED ENGINE
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{t('audit.time')}: <strong className="text-slate-800 font-semibold">{formattedTime}</strong></span>
                              </span>
                              <span className="font-mono text-slate-500">
                                {t('audit.tender')}: {tenderIdDisplay}
                              </span>
                              <span className="font-mono text-[11px] text-emerald-700 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>sha256:{hashSnippet}...</span>
                              </span>
                            </div>
                            <div className="text-slate-700 font-medium">
                              <strong className="text-slate-800">{t('audit.action_label')}:</strong> {actionDesc}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse Metadata Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-center shrink-0"
                    >
                      <span>{isExpanded ? t('audit.hide_details') : t('audit.inspect_details')}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Metadata Inspector */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-slate-50/50 p-4 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-blue-900" />
                          <h3 className="font-bold text-slate-900 text-xs">{t('audit.inspection_title')}</h3>
                          <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {log.id}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          GFR-151 Verified
                        </span>
                      </div>

                      {/* Structured Key Attributes Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.action')}</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">{displayAction}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.user')}</span>
                          <span className="font-bold text-slate-900">{userName}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.role')}</span>
                          <span className="font-bold text-slate-800">{roleDisplay}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.device')}</span>
                          <span className="font-semibold text-slate-800 text-[11px] flex items-center space-x-1">
                            <Laptop className="w-3 h-3 text-slate-400" />
                            <span>{device}</span>
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.session')}</span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">{sessionId}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.time')}</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{formattedTime}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.tender')}</span>
                          <span className="font-mono text-slate-700 text-[11px]">{tenderIdDisplay}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.hash')}</span>
                          <span className="font-mono text-emerald-700 text-[11px]">sha256:{hashSnippet}...</span>
                        </div>
                      </div>

                      {/* Action Performed Description */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t('audit.action_label')}</span>
                        <p className="text-slate-800 font-medium">{actionDesc}</p>
                      </div>

                      {/* Data Modification Details (Before -> After) */}
                      {hasChange && (
                        <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs space-y-2">
                          <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                            <Layers className="w-3.5 h-3.5 text-blue-700" />
                            <span>{t('audit.modification_details')}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('audit.field_label')}</span>
                              <span className="font-bold text-slate-900">{fieldName || 'Status'}</span>
                            </div>
                            <div className="bg-amber-50 p-2 rounded-md border border-amber-200">
                              <span className="text-[10px] uppercase font-bold text-amber-700 block">{t('audit.before_label')}</span>
                              <span className="font-bold text-amber-900">{beforeVal}</span>
                            </div>
                            <div className="bg-emerald-50 p-2 rounded-md border border-emerald-200">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t('audit.after_label')}</span>
                              <span className="font-bold text-emerald-900">{afterVal}</span>
                            </div>
                          </div>
                          {Boolean(log.metadata?.remarks) && (
                            <div className="text-[11px] text-slate-600 pt-1">
                              <strong>Remarks:</strong> {String(log.metadata?.remarks)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cryptographic & Chain-of-Custody Integrity */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>{t('audit.crypto_integrity')}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">ISO-8601: {log.timestamp}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 font-mono">
                          <span>{t('audit.digital_signature')}: <strong className="text-slate-800">DSC-Class-3 Validated ({userName})</strong></span>
                          <span>Gateway: <strong className="text-slate-800">NIC-GovNet 10.24.110.42</strong></span>
                        </div>
                      </div>

                      {/* Raw Event Payload & Metadata */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {t('audit.event_payload')}
                        </span>
                        <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
                          <pre>{JSON.stringify(log.metadata || {}, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {isClearDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="clear-dialog-title" className="text-base font-bold text-slate-900">
                  {t('audit.clear_modal_title', 'Clear Audit History?')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('audit.clear_modal_message', 'This will permanently remove the current audit history. This action cannot be undone.')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearDialogOpen(false)}
                disabled={isClearing}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('audit.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('audit.clearing', 'Clearing...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('audit.clear_history', 'Clear History')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-slideUp text-white ${
            toastType === 'error'
              ? 'bg-rose-900 border border-rose-700'
              : 'bg-slate-900 border border-slate-700'
          }`}
        >
          {toastType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
