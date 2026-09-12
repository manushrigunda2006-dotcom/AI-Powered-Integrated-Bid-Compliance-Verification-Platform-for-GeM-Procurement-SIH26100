import { NotificationTranslations } from './types';
import { Language } from '../i18n/types';

export const notificationTranslations: NotificationTranslations = {
  // 1. Core Notification Types
  'notifications.bidsRequireReview.title': {
    en: '3 bids require review',
    hi: '3 बोलियों की समीक्षा आवश्यक है',
    kn: '3 ಬಿಡ್ಗಳ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
  },
  'notifications.bidsRequireReview.message': {
    en: 'New bids are ready for evaluation.',
    hi: 'नई बोलियाँ मूल्यांकन के लिए तैयार हैं।',
    kn: 'ಹೊಸ ಬಿಡ್ಗಳು ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಸಿದ್ಧವಾಗಿವೆ.',
  },

  'notifications.tenderDeadline.title': {
    en: 'Tender deadline approaching',
    hi: 'निविदा की अंतिम तिथि निकट है',
    kn: 'ಟೆಂಡರ್ ಗಡುವು ಸಮೀಪಿಸುತ್ತಿದೆ',
  },
  'notifications.tenderDeadline.message': {
    en: 'Tender {tenderNumber} closes in {days} days.',
    hi: 'निविदा {tenderNumber} {days} दिनों में बंद होगी।',
    kn: 'ಟೆಂಡರ್ {tenderNumber} ಇನ್ನೂ {days} ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತದೆ.',
  },

  'notifications.requiredDocumentMissing.title': {
    en: 'Required document missing',
    hi: 'आवश्यक दस्तावेज़ उपलब्ध नहीं है',
    kn: 'ಅಗತ್ಯ ದಾಖಲೆ ಕಾಣೆಯಾಗಿದೆ',
  },
  'notifications.requiredDocumentMissing.message': {
    en: 'GST Registration Certificate is required for this tender.',
    hi: 'इस निविदा के लिए GST पंजीकरण प्रमाणपत्र आवश्यक है।',
    kn: 'ಈ ಟೆಂಡರ್ಗೆ GST ನೋಂದಣಿ ಪ್ರಮಾಣಪತ್ರ ಅಗತ್ಯವಿದೆ.',
  },

  'notifications.verificationCompleted.title': {
    en: 'Verification completed',
    hi: 'सत्यापन पूरा हुआ',
    kn: 'ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
  },
  'notifications.verificationCompleted.message': {
    en: 'Your document verification has been completed.',
    hi: 'आपके दस्तावेज़ों का सत्यापन पूरा हो गया है।',
    kn: 'ನಿಮ್ಮ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ.',
  },

  'notifications.highRiskBidder.title': {
    en: 'High-risk bidder detected',
    hi: 'उच्च-जोखिम बोलीदाता पाया गया',
    kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಬಿಡ್ಡರ್ ಪತ್ತೆಯಾಗಿದೆ',
  },
  'notifications.highRiskBidder.message': {
    en: 'Debarment or non-compliance flagged on Bidder {bidderName}.',
    hi: 'बोलीदाता {bidderName} पर अपात्रता या गैर-अनुपालन चिह्नित किया गया।',
    kn: 'ಬಿಡ್ಡರ್ {bidderName} ನಲ್ಲಿ ಅನರ್ಹತೆ ಅಥವಾ ಅನುಸರಣೆ ರಹಿತತೆ ಗುರುತಿಸಲಾಗಿದೆ.',
  },

  'notifications.newSubmission.title': {
    en: 'New bidder submission',
    hi: 'नया बोलीदाता जमा',
    kn: 'ಹೊಸ ಬಿಡ್ಡರ್ ಸಲ್ಲಿಕೆ',
  },
  'notifications.newSubmission.message': {
    en: '{bidderName} submitted their bid packet for {tenderNumber}.',
    hi: '{bidderName} ने {tenderNumber} के लिए अपना बोली पैकेट जमा किया है।',
    kn: '{bidderName} {tenderNumber} ಗಾಗಿ ತಮ್ಮ ಬಿಡ್ ಪ್ಯಾಕೆಟ್ ಅನ್ನು ಸಲ್ಲಿಸಿದ್ದಾರೆ.',
  },

  'notifications.clarificationRequested.title': {
    en: 'Clarification requested',
    hi: 'स्पष्टीकरण का अनुरोध किया गया',
    kn: 'ಸ್ಪಷ್ಟೀಕರಣವನ್ನು ಕೋರಲಾಗಿದೆ',
  },
  'notifications.clarificationRequested.message': {
    en: 'Procurement officer requested additional information on {topic}.',
    hi: 'खरीद अधिकारी ने {topic} पर अतिरिक्त जानकारी का अनुरोध किया है।',
    kn: 'ಖರೀದಿ ಅಧಿಕಾರಿಯು {topic} ಕುರಿತು ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿಯನ್ನು ಕೋರಿದ್ದಾರೆ.',
  },

  'notifications.docUploadSuccess.title': {
    en: 'Document upload successful',
    hi: 'दस्तावेज़ सफलतापूर्वक अपलोड हुआ',
    kn: 'ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ',
  },
  'notifications.docUploadSuccess.message': {
    en: 'Your {docName} was uploaded successfully.',
    hi: 'आपका {docName} सफलतापूर्वक अपलोड किया गया।',
    kn: 'ನಿಮ್ಮ {docName} ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ.',
  },

  // 2. Notification Center UI Elements
  'notifications.center.title': {
    en: 'Notifications',
    hi: 'सूचनाएँ',
    kn: 'ಅಧಿಸೂಚನೆಗಳು',
  },
  'notifications.center.markAllRead': {
    en: 'Mark all as read',
    hi: 'सभी को पढ़ा हुआ चिह्नित करें',
    kn: 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ',
  },
  'notifications.center.markAsRead': {
    en: 'Mark as read',
    hi: 'पढ़ा हुआ चिह्नित करें',
    kn: 'ಓದಿದಂತೆ ಗುರುತಿಸಿ',
  },
  'notifications.center.filterAll': {
    en: 'All',
    hi: 'सभी',
    kn: 'ಎಲ್ಲಾ',
  },
  'notifications.center.filterUnread': {
    en: 'Unread',
    hi: 'अपठित',
    kn: 'ಓದದಿರುವುದು',
  },
  'notifications.center.emptyTitle': {
    en: 'No notifications',
    hi: 'कोई सूचना नहीं',
    kn: 'ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ',
  },
  'notifications.center.emptyDesc': {
    en: "You're all caught up! No pending alerts for your account.",
    hi: 'सब कुछ देखा जा चुका है! आपके खाते के लिए कोई लंबित अलर्ट नहीं है।',
    kn: 'ಎಲ್ಲವನ್ನೂ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಖಾತೆಗೆ ಯಾವುದೇ ಬಾಕಿ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.',
  },
  'notifications.center.loginPrompt': {
    en: 'Please select your portal role to view personalized notifications.',
    hi: 'व्यक्तिगत सूचनाएं देखने के लिए कृपया अपनी पोर्टल भूमिका चुनें।',
    kn: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಅಧಿಸೂಚನೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
  },

  // 3. Priority Labels
  'notifications.priority.high': {
    en: 'High',
    hi: 'उच्च',
    kn: 'ಹೆಚ್ಚು',
  },
  'notifications.priority.medium': {
    en: 'Medium',
    hi: 'मध्यम',
    kn: 'ಮಧ್ಯಮ',
  },
  'notifications.priority.low': {
    en: 'Low',
    hi: 'कम',
    kn: 'ಕಡಿಮೆ',
  },

  // 4. Action Button Labels
  'notifications.action.reviewBids': {
    en: 'Review Bids',
    hi: 'बोलियों की समीक्षा करें',
    kn: 'ಬಿಡ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
  },
  'notifications.action.openTender': {
    en: 'Open Tender',
    hi: 'निविदा खोलें',
    kn: 'ಟೆಂಡರ್ ತೆರೆಯಿರಿ',
  },
  'notifications.action.uploadDoc': {
    en: 'Upload Document',
    hi: 'दस्तावेज़ अपलोड करें',
    kn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
  },
  'notifications.action.viewResult': {
    en: 'View Result',
    hi: 'परिणाम देखें',
    kn: 'ಫಲಿತಾಂಶ ವೀಕ್ಷಿಸಿ',
  },
  'notifications.action.viewClarification': {
    en: 'View Clarification',
    hi: 'स्पष्टीकरण देखें',
    kn: 'ಸ್ಪಷ್ಟೀಕರಣವನ್ನು ವೀಕ್ಷಿಸಿ',
  },
  'notifications.action.inspectBidder': {
    en: 'Inspect Bidder',
    hi: 'बोलीदाता का निरीक्षण करें',
    kn: 'ಬಿಡ್ಡರ್ ಪರಿಶೀಲಿಸಿ',
  },

  // 5. Time Formatting
  'notifications.time.justNow': {
    en: 'Just now',
    hi: 'अभी',
    kn: 'ಈಗಷ್ಟೇ',
  },
  'notifications.time.minutesAgo': {
    en: '{count}m ago',
    hi: '{count} मिनट पहले',
    kn: '{count} ನಿಮಿಷಗಳ ಹಿಂದೆ',
  },
  'notifications.time.hoursAgo': {
    en: '{count}h ago',
    hi: '{count} घंटे पहले',
    kn: '{count} ಗಂಟೆಗಳ ಹಿಂದೆ',
  },
  'notifications.time.daysAgo': {
    en: '{count}d ago',
    hi: '{count} दिन पहले',
    kn: '{count} ದಿನಗಳ ಹಿಂದೆ',
  },
};

/**
 * Helper to resolve notification text in the current language
 */
export function translateNotification(
  key: string,
  lang: Language,
  params?: Record<string, string | number>,
  fallback?: string
): string {
  const item = notificationTranslations[key];
  let text = item ? (item[lang] || item.en) : (fallback || key);

  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}

/**
 * Format relative time in the requested language
 */
export function formatNotificationTime(isoDate: string, lang: Language): string {
  try {
    const now = Date.now();
    const created = new Date(isoDate).getTime();
    const diffSec = Math.max(0, Math.floor((now - created) / 1000));

    if (diffSec < 60) {
      return translateNotification('notifications.time.justNow', lang);
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return translateNotification('notifications.time.minutesAgo', lang, { count: diffMin });
    }
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return translateNotification('notifications.time.hoursAgo', lang, { count: diffHour });
    }
    const diffDays = Math.floor(diffHour / 24);
    return translateNotification('notifications.time.daysAgo', lang, { count: diffDays });
  } catch {
    return translateNotification('notifications.time.justNow', lang);
  }
}
