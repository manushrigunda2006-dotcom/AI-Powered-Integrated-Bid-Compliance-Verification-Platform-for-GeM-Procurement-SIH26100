export type NotificationRole = 'officer' | 'bidder';
export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationType =
  | 'bids_require_review'
  | 'tender_deadline'
  | 'required_doc_missing'
  | 'verification_completed'
  | 'high_risk_bidder'
  | 'new_submission'
  | 'clarification_requested'
  | 'doc_upload_success';

export interface AppNotification {
  notificationId: string;
  userId: string;
  role: NotificationRole;
  type: NotificationType;
  title: string;
  message: string;
  titleKey: string;
  messageKey: string;
  params?: Record<string, string | number>;
  tenderId?: string;
  tenderNumber?: string;
  relatedEntityId?: string;
  createdAt: string; // ISO 8601
  read: boolean;
  priority: NotificationPriority;
  actionUrl: string;
  actionKey?: string;
}

export interface NotificationTranslations {
  [key: string]: {
    en: string;
    hi: string;
    kn: string;
    ta: string;
    te: string;
    mr: string;
    tulu: string;
    kok: string;
    ml: string;
    gu: string;
    bn: string;
    or: string;
    as: string;
    pa: string;
    hry: string;
    mni: string;
    ks: string;
  };
}
