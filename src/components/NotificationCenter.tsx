'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Clock,
  AlertTriangle,
  Info,
  ShieldAlert,
  FileText,
  Upload,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/authGuard';
import { notificationService } from '@/services/notificationService';
import { AppNotification } from '@/lib/notifications/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatNotificationTime } from '@/lib/notifications/notificationDictionary';

export function NotificationCenter() {
  const router = useRouter();
  const { session, role, isAuthenticated, isOfficer, isBidder } = useAuth();
  const { language, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive current userId
  const userId = isOfficer
    ? (session as any)?.officerId || 'OFFICER-ABCD-001'
    : (session as any)?.bidderId || 'bidder-01';

  const userRole = isOfficer ? 'officer' : 'bidder';

  // Load and subscribe to notifications
  useEffect(() => {
    function loadNotifs() {
      if (!isAuthenticated) {
        setNotifications([]);
        return;
      }
      const list = notificationService.getNotifications(userId, userRole);
      setNotifications(list);
    }

    loadNotifs();
    const unsubscribe = notificationService.subscribe(loadNotifs);
    return () => unsubscribe();
  }, [userId, userRole, isAuthenticated]);

  // Click outside & Escape key listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAllAsRead(userId, userRole);
  };

  const handleActionClick = (notification: AppNotification) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.notificationId);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900">
            {t('notifications.priority.high', 'High')}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            {t('notifications.priority.medium', 'Medium')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {t('notifications.priority.low', 'Low')}
          </span>
        );
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
    }
    switch (type) {
      case 'bids_require_review':
        return <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      case 'tender_deadline':
        return <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'required_doc_missing':
        return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'verification_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'doc_upload_success':
        return <Upload className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`${t('notifications.center.title', 'Notifications')} (${unreadCount})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`${t('notifications.center.title', 'Notifications')}: ${unreadCount} ${t('notifications.center.filterUnread', 'Unread')}`}
        className="relative flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-400 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
      >
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline font-bold text-[11px]">
          {t('notifications.center.title', 'Notifications')}
        </span>
        {unreadCount > 0 && (
          <span className="bg-red-600 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATIONS DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-900 dark:text-blue-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>{t('notifications.center.title', 'Notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {unreadCount} {t('notifications.center.filterUnread', 'Unread')}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>{t('notifications.center.markAllRead', 'Mark all as read')}</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('notifications.center.filterAll', 'All')} ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t('notifications.center.filterUnread', 'Unread')} ({unreadCount})
              </button>
            </div>

            <span className="text-[9.5px] font-mono font-medium text-slate-500 dark:text-slate-400">
              {isOfficer ? t('app.officer_portal', 'Officer Portal') : t('app.bidder_portal', 'Bidder Portal')}
            </span>
          </div>

          {/* Scrollable Notifications List */}
          <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-slate-800">
            {!isAuthenticated ? (
              <div className="py-8 px-4 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('notifications.center.emptyTitle', 'No notifications')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    {t('notifications.center.loginPrompt', 'Please select your portal role to view personalized notifications.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/role-selection');
                  }}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                >
                  {t('nav.role_selection', 'Select Portal Role')}
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('notifications.center.emptyTitle', 'No notifications')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t('notifications.center.emptyDesc', "You're all caught up! No pending alerts for your account.")}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const titleText = t(n.titleKey, n.title);
                const messageText = t(n.messageKey, n.params || n.message);
                const timeText = formatNotificationTime(n.createdAt, language);
                const actionLabel = n.actionKey
                  ? t(n.actionKey, 'View Details')
                  : t('notifications.action.viewResult', 'View Details');

                return (
                  <div
                    key={n.notificationId}
                    onClick={() => handleActionClick(n)}
                    className={`p-3.5 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-start space-x-3 ${
                      !n.read
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-l-3 border-l-blue-600 dark:border-l-blue-500'
                        : 'border-l-3 border-l-transparent'
                    }`}
                  >
                    {getNotificationIcon(n.type, n.priority)}

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Top Meta: Priority + Tender Code + Time */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <div className="flex items-center space-x-1.5 truncate">
                          {getPriorityBadge(n.priority)}
                          {n.tenderNumber && (
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-300 truncate">
                              {n.tenderNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 font-medium shrink-0">
                          {timeText}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs leading-snug tracking-tight ${
                          !n.read
                            ? 'font-bold text-slate-900 dark:text-white'
                            : 'font-semibold text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {titleText}
                      </h4>

                      {/* Message */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {messageText}
                      </p>

                      {/* Action Button & Mark as read */}
                      <div className="pt-1.5 flex items-center justify-between gap-2">
                        {n.actionUrl ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                            <span>{actionLabel}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        ) : <span />}

                        {!n.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(e, n.notificationId)}
                            title={t('notifications.center.markAsRead', 'Mark as read')}
                            className="text-[10px] font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 flex items-center space-x-0.5 p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {t('notifications.center.markAsRead', 'Mark as read')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
