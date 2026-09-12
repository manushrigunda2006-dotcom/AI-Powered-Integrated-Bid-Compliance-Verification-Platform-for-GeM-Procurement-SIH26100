import { AppNotification, NotificationRole } from '@/lib/notifications/types';

const STORAGE_KEY = 'gem_notifications_v1';
const NOTIFICATION_EVENT = 'gem_notifications_updated';

// Helper for relative timestamps
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();
}

export const INITIAL_SEED_NOTIFICATIONS: AppNotification[] = [
  // 1. OFFICER NOTIFICATIONS (User: OFFICER-ABCD-001)
  {
    notificationId: 'notif-off-001',
    userId: 'OFFICER-ABCD-001',
    role: 'officer',
    type: 'bids_require_review',
    title: '3 bids require review',
    message: 'New bids are ready for evaluation.',
    titleKey: 'notifications.bidsRequireReview.title',
    messageKey: 'notifications.bidsRequireReview.message',
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    relatedEntityId: 'tender-gem-2026-cloud',
    createdAt: minutesAgo(12),
    read: false,
    priority: 'high',
    actionUrl: '/tenders/tender-gem-2026-cloud/bidders',
    actionKey: 'notifications.action.reviewBids',
  },
  {
    notificationId: 'notif-off-002',
    userId: 'OFFICER-ABCD-001',
    role: 'officer',
    type: 'tender_deadline',
    title: 'Tender deadline approaching',
    message: 'Tender GEM/2026/B/892104 closes in 2 days.',
    titleKey: 'notifications.tenderDeadline.title',
    messageKey: 'notifications.tenderDeadline.message',
    params: { tenderNumber: 'GEM/2026/B/892104', days: 2 },
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    createdAt: hoursAgo(2),
    read: false,
    priority: 'medium',
    actionUrl: '/tenders/tender-gem-2026-cloud',
    actionKey: 'notifications.action.openTender',
  },
  {
    notificationId: 'notif-off-003',
    userId: 'OFFICER-ABCD-001',
    role: 'officer',
    type: 'high_risk_bidder',
    title: 'High-risk bidder detected',
    message: 'Debarment or non-compliance flagged on Bidder BCDE Infotech.',
    titleKey: 'notifications.highRiskBidder.title',
    messageKey: 'notifications.highRiskBidder.message',
    params: { bidderName: 'BCDE Infotech' },
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    relatedEntityId: 'bidder-02',
    createdAt: hoursAgo(5),
    read: false,
    priority: 'high',
    actionUrl: '/tenders/tender-gem-2026-cloud/bidders/bidder-02',
    actionKey: 'notifications.action.inspectBidder',
  },
  {
    notificationId: 'notif-off-004',
    userId: 'OFFICER-ABCD-001',
    role: 'officer',
    type: 'new_submission',
    title: 'New bidder submission',
    message: 'ABCD Technologies submitted their bid packet for GEM/2026/B/892104.',
    titleKey: 'notifications.newSubmission.title',
    messageKey: 'notifications.newSubmission.message',
    params: { bidderName: 'ABCD Technologies', tenderNumber: 'GEM/2026/B/892104' },
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    relatedEntityId: 'bidder-01',
    createdAt: daysAgo(1),
    read: true,
    priority: 'low',
    actionUrl: '/tenders/tender-gem-2026-cloud/bidders',
    actionKey: 'notifications.action.reviewBids',
  },

  // 2. BIDDER NOTIFICATIONS (User: bidder-01 - ABCD Technologies)
  {
    notificationId: 'notif-bid-001',
    userId: 'bidder-01',
    role: 'bidder',
    type: 'required_doc_missing',
    title: 'Required document missing',
    message: 'GST Registration Certificate is required for this tender.',
    titleKey: 'notifications.requiredDocumentMissing.title',
    messageKey: 'notifications.requiredDocumentMissing.message',
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    relatedEntityId: 'doc-gst-001',
    createdAt: minutesAgo(25),
    read: false,
    priority: 'high',
    actionUrl: '/bidder/tenders/tender-gem-2026-cloud/submit',
    actionKey: 'notifications.action.uploadDoc',
  },
  {
    notificationId: 'notif-bid-002',
    userId: 'bidder-01',
    role: 'bidder',
    type: 'tender_deadline',
    title: 'Tender deadline approaching',
    message: 'Tender GEM/2026/B/892104 closes in 2 days.',
    titleKey: 'notifications.tenderDeadline.title',
    messageKey: 'notifications.tenderDeadline.message',
    params: { tenderNumber: 'GEM/2026/B/892104', days: 2 },
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    createdAt: hoursAgo(3),
    read: false,
    priority: 'medium',
    actionUrl: '/bidder/tenders/tender-gem-2026-cloud/submit',
    actionKey: 'notifications.action.openTender',
  },
  {
    notificationId: 'notif-bid-003',
    userId: 'bidder-01',
    role: 'bidder',
    type: 'verification_completed',
    title: 'Verification completed',
    message: 'Your document verification has been completed.',
    titleKey: 'notifications.verificationCompleted.title',
    messageKey: 'notifications.verificationCompleted.message',
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    createdAt: hoursAgo(7),
    read: false,
    priority: 'low',
    actionUrl: '/bidder/dashboard#submissions',
    actionKey: 'notifications.action.viewResult',
  },
  {
    notificationId: 'notif-bid-004',
    userId: 'bidder-01',
    role: 'bidder',
    type: 'doc_upload_success',
    title: 'Document upload successful',
    message: 'Your Audited Balance Sheet & P&L Statement was uploaded successfully.',
    titleKey: 'notifications.docUploadSuccess.title',
    messageKey: 'notifications.docUploadSuccess.message',
    params: { docName: 'Audited Balance Sheet & P&L Statement' },
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    createdAt: daysAgo(1),
    read: true,
    priority: 'low',
    actionUrl: '/bidder/tenders/tender-gem-2026-cloud/submit',
    actionKey: 'notifications.action.uploadDoc',
  },
  {
    notificationId: 'notif-bid-005',
    userId: 'bidder-01',
    role: 'bidder',
    type: 'clarification_requested',
    title: 'Clarification requested',
    message: 'Procurement officer requested additional information on OEM MAF certificate.',
    titleKey: 'notifications.clarificationRequested.title',
    messageKey: 'notifications.clarificationRequested.message',
    params: { topic: 'OEM MAF certificate' },
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    createdAt: daysAgo(2),
    read: true,
    priority: 'high',
    actionUrl: '/bidder/dashboard#clarification',
    actionKey: 'notifications.action.viewClarification',
  },

  // 3. BIDDER NOTIFICATIONS (User: bidder-02 - BCDE Infotech)
  {
    notificationId: 'notif-bid-02-001',
    userId: 'bidder-02',
    role: 'bidder',
    type: 'required_doc_missing',
    title: 'Required document missing',
    message: 'GST Registration Certificate is required for this tender.',
    titleKey: 'notifications.requiredDocumentMissing.title',
    messageKey: 'notifications.requiredDocumentMissing.message',
    tenderId: 'tender-gem-2026-cloud',
    tenderNumber: 'GEM/2026/B/892104',
    createdAt: hoursAgo(1),
    read: false,
    priority: 'high',
    actionUrl: '/bidder/tenders/tender-gem-2026-cloud/submit',
    actionKey: 'notifications.action.uploadDoc',
  },
];

class NotificationService {
  private getStorage(): AppNotification[] {
    if (typeof window === 'undefined') return INITIAL_SEED_NOTIFICATIONS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_NOTIFICATIONS));
        return INITIAL_SEED_NOTIFICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SEED_NOTIFICATIONS;
    }
  }

  private saveStorage(list: AppNotification[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event(NOTIFICATION_EVENT));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }

  /**
   * Get all notifications strictly filtered by userId and role.
   * Prevents cross-role and cross-user leaks.
   */
  getNotifications(userId: string, role: NotificationRole): AppNotification[] {
    const list = this.getStorage();
    return list
      .filter((n) => {
        if (n.role !== role) return false;
        // User match: exact match or role-wide broadcast
        return (
          n.userId === userId ||
          n.userId === (role === 'officer' ? 'OFFICER-ABCD-001' : 'bidder-01')
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Calculate unread notifications count for the authenticated user
   */
  getUnreadCount(userId: string, role: NotificationRole): number {
    const items = this.getNotifications(userId, role);
    return items.filter((n) => !n.read).length;
  }

  /**
   * Mark a specific notification as read
   */
  markAsRead(notificationId: string): void {
    const list = this.getStorage();
    let updated = false;
    const next = list.map((n) => {
      if (n.notificationId === notificationId) {
        updated = true;
        return { ...n, read: true };
      }
      return n;
    });

    if (updated) {
      this.saveStorage(next);
    }
  }

  /**
   * Mark all notifications as read for the user & role
   */
  markAllAsRead(userId: string, role: NotificationRole): void {
    const list = this.getStorage();
    const next = list.map((n) => {
      if (
        n.role === role &&
        (n.userId === userId || n.userId === (role === 'officer' ? 'OFFICER-ABCD-001' : 'bidder-01'))
      ) {
        return { ...n, read: true };
      }
      return n;
    });
    this.saveStorage(next);
  }

  /**
   * Add a new notification dynamically
   */
  addNotification(
    data: Omit<AppNotification, 'notificationId' | 'createdAt' | 'read'>
  ): AppNotification {
    const list = this.getStorage();
    const newNotif: AppNotification = {
      ...data,
      notificationId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.saveStorage([newNotif, ...list]);
    return newNotif;
  }

  /**
   * Subscribe to notification updates across components in the same window
   */
  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback();
    window.addEventListener(NOTIFICATION_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }
}

export const notificationService = new NotificationService();
