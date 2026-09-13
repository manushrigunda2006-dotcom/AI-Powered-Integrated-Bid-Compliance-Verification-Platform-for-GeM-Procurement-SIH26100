import { NotificationTranslations } from './types';
import { Language } from '../i18n/types';

export const notificationTranslations: NotificationTranslations = {
  // 1. Core Notification Types
  'notifications.bidsRequireReview.title': {
    en: '3 bids require review',
    hi: '3 बोलियों की समीक्षा आवश्यक है',
    kn: '3 ಬಿಡ್ಗಳ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    ta: '3 ஏலங்கள் மதிப்பாய்வு செய்யப்பட வேண்டும்',
    te: '3 బిడ్ల సమీక్ష అవసరం',
    mr: '3 बोलींचे पुनरावलोकन आवश्यक आहे',
    tulu: '3 ಬಿಡ್‌ಲೆ ಪರಿಶೀಲನೆ ಬೋಡಾಪುಂಡು',
    kok: '3 बोलींची तपासणी गरजेची आसा',
  },
  'notifications.bidsRequireReview.message': {
    en: 'New bids are ready for evaluation.',
    hi: 'नई बोलियाँ मूल्यांकन के लिए तैयार हैं।',
    kn: 'ಹೊಸ ಬಿಡ್ಗಳು ಮೌಲ್ಯಮಾಪನಕ್ಕೆ ಸಿದ್ಧವಾಗಿವೆ.',
    ta: 'புதிய ஏலங்கள் மதிப்பீட்டிற்கு தயாராக உள்ளன.',
    te: 'కొత్త బిడ్లు మూల్యాంకనానికి సిద్ధంగా ఉన్నాయి.',
    mr: 'नवीन बोली मूल्यांकनासाठी तयार आहेत.',
    tulu: 'ಪೊಸ ಬಿಡ್‌ಲು ಮೌಲ್ಯಮಾಪನೊಗು ತಯಾರಾತುಂಡು.',
    kok: 'नव्यो बोली मूल्यांकना खातीर तयार आसात.',
  },

  'notifications.tenderDeadline.title': {
    en: 'Tender deadline approaching',
    hi: 'निविदा की अंतिम तिथि निकट है',
    kn: 'ಟೆಂಡರ್ ಗಡುವು ಸಮೀಪಿಸುತ್ತಿದೆ',
    ta: 'டெண்டர் காலக்கெடு நெருங்குகிறது',
    te: 'టెಂಡర్ గడువు ముగుస్తోంది',
    mr: 'निविदा अंतिम मुदत जवळ येत आहे',
    tulu: 'ಟೆಂಡರ್ ಕಡೆತ ದಿನ ಮುಟ್ಟ ಬರ್ಪುಂಡು',
    kok: 'टेंडराची निमाणे मुदत लागीं पावली',
  },
  'notifications.tenderDeadline.message': {
    en: 'Tender {tenderNumber} closes in {days} days.',
    hi: 'निविदा {tenderNumber} {days} दिनों में बंद होगी।',
    kn: 'ಟೆಂಡರ್ {tenderNumber} ಇನ್ನೂ {days} ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತದೆ.',
    ta: 'டெண்டர் {tenderNumber} இன்னும் {days} நாட்களில் முடிவடைகிறது.',
    te: 'టెండర్ {tenderNumber} {days} రోజుల్లో ముగుస్తుంది.',
    mr: 'निविदा {tenderNumber} {days} दिवसांत बंद होईल.',
    tulu: 'ಟೆಂಡರ್ {tenderNumber} ಕುಡ {days} ದಿನೊಟು ಮುಗಿಯುಂಡು.',
    kok: 'टेंडर {tenderNumber} {days} दिसांनी बंद जातलें.',
  },

  'notifications.requiredDocumentMissing.title': {
    en: 'Required document missing',
    hi: 'आवश्यक दस्तावेज़ उपलब्ध नहीं है',
    kn: 'ಅಗತ್ಯ ದಾಖಲೆ ಕಾಣೆಯಾಗಿದೆ',
    ta: 'தேவையான ஆவணம் விடுபட்டுள்ளது',
    te: 'అవసరమైన పత్రం లేదు',
    mr: 'आवश्यक दस्तऐवज गहाळ आहे',
    tulu: 'ಬೋಡಾಪಿನ ದಾಖಲೆ ತಿಕ್ಕ್‌ಜಿ',
    kok: 'गरजेचे कागदपत्र उणें आसा',
  },
  'notifications.requiredDocumentMissing.message': {
    en: 'GST Registration Certificate is required for this tender.',
    hi: 'इस निविदा के लिए GST पंजीकरण प्रमाणपत्र आवश्यक है।',
    kn: 'ಈ ಟೆಂಡರ್ಗೆ GST ನೋಂದಣಿ ಪ್ರಮಾಣಪತ್ರ ಅಗತ್ಯವಿದೆ.',
    ta: 'இந்த டெண்டருக்கு GST பதிவு சான்றிதழ் தேவை.',
    te: 'ఈ టెಂಡర్ కోసం GST రిజిస్ట్రేషన్ సర్టిఫికేట్ అవసరం.',
    mr: 'या निविदेसाठी GST नोंदणी प्रमाणपत्र आवश्यक आहे.',
    tulu: 'ಈ ಟೆಂಡರ್‌ಗ್ GST ನೋಂದಣಿ ಸರ್ಟಿಫಿಕೇಟ್ ಬೋಡಾಪುಂಡು.',
    kok: 'ह्या टेंडरा खातीर GST नोंदणी प्रमाणपत्र गरजेचे आसा.',
  },

  'notifications.verificationCompleted.title': {
    en: 'Verification completed',
    hi: 'सत्यापन पूरा हुआ',
    kn: 'ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
    ta: 'சரிபார்ப்பு முடிந்தது',
    te: 'ధృవీకరణ పూర్తయింది',
    mr: 'पडताळणी पूर्ण झाली',
    tulu: 'ಪರಿಶೀಲನೆ ಮುಗಿದ್ಂಡ್',
    kok: 'तपासणी पुराय जाली',
  },
  'notifications.verificationCompleted.message': {
    en: 'Your document verification has been completed.',
    hi: 'आपके दस्तावेज़ों का सत्यापन पूरा हो गया है।',
    kn: 'ನಿಮ್ಮ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ.',
    ta: 'உங்கள் ஆவண சரிபார்ப்பு முடிந்தது.',
    te: 'మీ పత్రాల ధృవీకరణ పూర్తయింది.',
    mr: 'तुमची कागदपत्र पडताळणी पूर्ण झाली आहे.',
    tulu: 'ಈರೆನ ದಾಖಲೆಲೆ ಪರಿಶೀಲನೆ ಮುಗಿದ್ಂಡ್.',
    kok: 'तुमच्या कागदपत्रांची तपासणी पुराय जाली.',
  },

  'notifications.highRiskBidder.title': {
    en: 'High-risk bidder detected',
    hi: 'उच्च-जोखिम बोलीदाता पाया गया',
    kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಬಿಡ್ಡರ್ ಪತ್ತೆಯಾಗಿದೆ',
    ta: 'அதிக ஆபத்துள்ள ஏலதாரர் கண்டறியப்பட்டார்',
    te: 'అధిక ప్రమాదం ఉన్న బిడ్డర్ గుర్తించబడింది',
    mr: 'उच्च जोखीम असलेला बोलीदाता आढळला',
    tulu: 'ಮಲ್ಲ ಅಪಾಯದ ಬಿಡ್ಡರ್ ತೋಜಿದ್ ಬತ್ತ್ಂಡ್',
    kok: 'चड धोक्याचो बोलीदार सांपडला',
  },
  'notifications.highRiskBidder.message': {
    en: 'Debarment or non-compliance flagged on Bidder {bidderName}.',
    hi: 'बोलीदाता {bidderName} पर अपात्रता या गैर-अनुपालन चिह्नित किया गया।',
    kn: 'ಬಿಡ್ಡರ್ {bidderName} ನಲ್ಲಿ ಅನರ್ಹತೆ ಅಥವಾ ಅನುಸರಣೆ ರಹಿತತೆ ಗುರುತಿಸಲಾಗಿದೆ.',
    ta: 'ஏலதாரர் {bidderName} மீது தடை அல்லது இணக்கமின்மை கொடியிடப்பட்டது.',
    te: 'బిడ్డర్ {bidderName} పై డిబార్‌మెంట్ లేదా నాన్-కంప్లైయెన్స్ గుర్తించబడింది.',
    mr: 'बोलीदाता {bidderName} वर बंदी किंवा गैर-अनुपालन ध्वजांकित केले गेले.',
    tulu: 'ಬಿಡ್ಡರ್ {bidderName} ಮಿತ್ತ್ ಅನರ್ಹತೆ ಅತ್ತಂಡ ನಿಯಮ ಮೀರುನವು ತೋಜಿದ್ಂಡ್.',
    kok: 'बोलीदार {bidderName} चेर बंदी वा गैर-अनुपालन दाखयलां.',
  },

  'notifications.newSubmission.title': {
    en: 'New bidder submission',
    hi: 'नया बोलीदाता जमा',
    kn: 'ಹೊಸ ಬಿಡ್ಡರ್ ಸಲ್ಲಿಕೆ',
    ta: 'புதிய ஏலதாரர் சமர்ப்பிப்பு',
    te: 'కొత్త బిడ్డర్ సమర్పణ',
    mr: 'नवीन बोलीदाता सबमिशन',
    tulu: 'ಪೊಸ ಬಿಡ್ಡರ್ ಸಲ್ಲಿಕೆ',
    kok: 'नवो बोलीदार सादर',
  },
  'notifications.newSubmission.message': {
    en: '{bidderName} submitted their bid packet for {tenderNumber}.',
    hi: '{bidderName} ने {tenderNumber} के लिए अपना बोली पैकेट जमा किया है।',
    kn: '{bidderName} {tenderNumber} ಗಾಗಿ ತಮ್ಮ ಬಿಡ್ ಪ್ಯಾಕೆಟ್ ಅನ್ನು ಸಲ್ಲಿಸಿದ್ದಾರೆ.',
    ta: '{bidderName} {tenderNumber} க்கான தங்கள் ஏலப் பொதியை சமர்ப்பித்துள்ளார்.',
    te: '{bidderName} {tenderNumber} కోసం వారి బిడ్ ప్యాకెట్‌ను సమర్పించారు.',
    mr: '{bidderName} ने {tenderNumber} साठी आपले बोली पॅकेट सादर केले आहे.',
    tulu: '{bidderName} {tenderNumber} ಗಾದ್ ಅರೆನ ಬಿಡ್ ಪ್ಯಾಕೆಟ್ ಸಲ್ಲಿಸಾದೆರ್.',
    kok: '{bidderName} हाणें {tenderNumber} खातीर आपलें बोली पाकीट सादर केलां.',
  },

  'notifications.clarificationRequested.title': {
    en: 'Clarification requested',
    hi: 'स्पष्टीकरण का अनुरोध किया गया',
    kn: 'ಸ್ಪಷ್ಟೀಕರಣವನ್ನು ಕೋರಲಾಗಿದೆ',
    ta: 'விளக்கம் கோரப்பட்டது',
    te: 'వివరణ కోరబడింది',
    mr: 'स्पष्टीकरण मागितले',
    tulu: 'ವಿವರಣೆ ಕೇಂಡಿ ಕಾಲಮ್',
    kok: 'स्पश्टीकरण मागलां',
  },
  'notifications.clarificationRequested.message': {
    en: 'Procurement officer requested additional information on {topic}.',
    hi: 'खरीद अधिकारी ने {topic} पर अतिरिक्त जानकारी का अनुरोध किया है।',
    kn: 'ಖರೀದಿ ಅಧಿಕಾರಿಯು {topic} ಕುರಿತು ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿಯನ್ನು ಕೋರಿದ್ದಾರೆ.',
    ta: 'கொள்முதல் அதிகாரி {topic} குறித்த கூடுதல் தகவலைக் கோரியுள்ளார்.',
    te: 'ప్రొక్యూర్మెంట్ అధికారి {topic} పై అదనపు సమాచారాన్ని అభ్యర్థించారు.',
    mr: 'खरेदी अधिकाऱ्याने {topic} वर अतिरिक्त माहितीची विनंती केली आहे.',
    tulu: 'ಖರೀದಿ ಅಧಿಕಾರಿನಕುಲು {topic} ಬಗೆಟ್ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ಕೇಂಡೆರ್.',
    kok: 'खरेदी अधिकाऱ्यान {topic} चेर चड म्हायती मागल्या.',
  },

  'notifications.docUploadSuccess.title': {
    en: 'Document upload successful',
    hi: 'दस्तावेज़ सफलतापूर्वक अपलोड हुआ',
    kn: 'ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ',
    ta: 'ஆவணம் வெற்றிகரமாக பதிவேற்றப்பட்டது',
    te: 'పత్రం విజయవంతంగా అప్‌లోడ్ చేయబడింది',
    mr: 'दस्तऐवज यशस्वीरित्या अपलोड झाला',
    tulu: 'ದಾಖಲೆ ಯಶಸ್ವಿಯಾದ್ ಅಪ್‌ಲೋಡ್ ಆಂಡ್',
    kok: 'कागदपत्र येಶಸ್ವಿಯಾದ್ ಅಪ್ಲೋಡ್ ಜಾಲೆಂ',
  },
  'notifications.docUploadSuccess.message': {
    en: 'Your {docName} was uploaded successfully.',
    hi: 'आपका {docName} सफलतापूर्वक अपलोड किया गया।',
    kn: 'ನಿಮ್ಮ {docName} ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ.',
    ta: 'உங்கள் {docName} வெற்றிகரமாக பதிவேற்றப்பட்டது.',
    te: 'మీ {docName} విజయవంతంగా అప్‌లోడ్ చేయబడింది.',
    mr: 'तुमचे {docName} यशस्वीरित्या अपलोड झाले आहे.',
    tulu: 'ಈರೆನ {docName} ಯಶಸ್ವಿಯಾದ್ ಅಪ್‌ಲೋಡ್ ಆಂಡ್.',
    kok: 'तुमचें {docName} येಶಸ್ವಿಯಾದ್ ಅಪ್ಲೋಡ್ ಜಾಲೆಂ.',
  },

  // 2. Notification Center UI Elements
  'notifications.center.title': {
    en: 'Notifications',
    hi: 'सूचनाएँ',
    kn: 'ಅಧಿಸೂಚನೆಗಳು',
    ta: 'அறிவிப்புகள்',
    te: 'నోటిఫికేషన్లు',
    mr: 'सूचना',
    tulu: 'ಪ್ರಕಟಣೆಲು',
    kok: 'सुचोवण्यो',
  },
  'notifications.center.markAllRead': {
    en: 'Mark all as read',
    hi: 'सभी को पढ़ा हुआ चिह्नित करें',
    kn: 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ',
    ta: 'அனைத்தையும் படித்ததாகக் குறிக்கவும்',
    te: 'అన్నీ చదివినట్లు గుర్తించండి',
    mr: 'सर्व वाचलेले म्हणून चिन्हांकित करा',
    tulu: 'ಮಾತೆನ್‌ಲಾ ಓದಿನಲೆಕ್ಕ ಮಲ್ಪುಲೆ',
    kok: 'सगळ्यो वाचिल्ल्यो म्हणून खूण करात',
  },
  'notifications.center.markAsRead': {
    en: 'Mark as read',
    hi: 'पढ़ा हुआ चिह्नित करें',
    kn: 'ಓದಿದಂತೆ ಗುರುತಿಸಿ',
    ta: 'படித்ததாகக் குறிக்கவும்',
    te: 'చదివినట్లు గుర్తించండి',
    mr: 'वाचलेले म्हणून चिन्हांकित करा',
    tulu: 'ಓದಿನಲೆಕ್ಕ ಮಲ್ಪುಲೆ',
    kok: 'वाचिल्लें म्हणून खूण करात',
  },
  'notifications.center.filterAll': {
    en: 'All',
    hi: 'सभी',
    kn: 'ಎಲ್ಲಾ',
    ta: 'அனைத்தும்',
    te: 'అన్నీ',
    mr: 'सर्व',
    tulu: 'ಮಾತಾ',
    kok: 'सगळें',
  },
  'notifications.center.filterUnread': {
    en: 'Unread',
    hi: 'अपठित',
    kn: 'ಓದದಿರುವುದು',
    ta: 'படிக்காதவை',
    te: 'చదవనివి',
    mr: 'न वाचलेले',
    tulu: 'ಓದಂದಿನವು',
    kok: 'वाचूंक नाशिल्लें',
  },
  'notifications.center.emptyTitle': {
    en: 'No notifications',
    hi: 'कोई सूचना नहीं',
    kn: 'ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ',
    ta: 'அறிவிப்புகள் இல்லை',
    te: 'నోటిಫికేషన్లు లేవు',
    mr: 'कोणत्याही सूचना नाहीत',
    tulu: 'ಒವ್ವೇ ಪ್ರಕಟಣೆಲು ಇದ್ದಿ',
    kok: 'कसलीच सुचोवणी ना',
  },
  'notifications.center.emptyDesc': {
    en: "You're all caught up! No pending alerts for your account.",
    hi: 'सब कुछ देखा जा चुका है! आपके खाते के लिए कोई लंबित अलर्ट नहीं है।',
    kn: 'ಎಲ್ಲವನ್ನೂ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಖಾತೆಗೆ ಯಾವುದೇ ಬಾಕಿ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.',
    ta: 'அனைத்தும் புதுப்பிக்கப்பட்டது! உங்கள் கணக்கிற்கு நிலுவையில் உள்ள விழிப்பூட்டல்கள் இல்லை.',
    te: 'అంతా పూర్తయింది! మీ ఖాతా కోసం పెండింగ్‌లో ఉన్న హెచ్చరికలు లేవు.',
    mr: 'सर्व अद्यतनित आहे! आपल्या खात्यासाठी कोणतेही प्रलंबित अलर्ट नाहीत.',
    tulu: 'ಮಾತಾ ಪರಿಶೀಲನೆ ಆಂಡ್! ಈರೆನ ಖಾತೆಗ್ ಒವ್ವೇ ಎಚ್ಚರಿಕೆ ಬಾಕಿ ಇದ್ದಿ.',
    kok: 'सगळें अद्यतन आसा! तुमच्या खात्या खातीर कसलीच पेंडिंग शिटकावणी ना.',
  },
  'notifications.center.loginPrompt': {
    en: 'Please select your portal role to view personalized notifications.',
    hi: 'व्यक्तिगत सूचनाएं देखने के लिए कृपया अपनी पोर्टल भूमिका चुनें।',
    kn: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಅಧಿಸೂಚನೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    ta: 'தனிப்பயனாக்கப்பட்ட அறிவிப்புகளைப் பார்க்க உங்கள் போர்டல் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்.',
    te: 'వ్యక్తిగతీకరించిన నోటిఫికేషన్‌లను చూడటానికి దయచేసి మీ పోర్టల్ పాత్రను ఎంచుకోండి.',
    mr: 'वैयक्तिकृत सूचना पाहण्यासाठी कृपया आपली पोर्टल भूमिका निवडा.',
    tulu: 'ವೈಯಕ್ತಿಕ ಪ್ರಕಟಣೆಲೆನ್ ತೂಯೆರೆ ಈರೆನ ಪೋರ್ಟಲ್ ಪಾತ್ರೊನು ಆಯ್ಕೆ ಮಲ್ಪುಲೆ.',
    kok: 'खाजगी सुचोवण्यो पळोवंक उपकार करून तुमची पोर्टल भूमिका वेचात.',
  },

  // 3. Priority Labels
  'notifications.priority.high': {
    en: 'High',
    hi: 'उच्च',
    kn: 'ಹೆಚ್ಚು',
    ta: 'அதிகம்',
    te: 'అధికం',
    mr: 'उच्च',
    tulu: 'ಜಾಸ್ತಿ',
    kok: 'चड',
  },
  'notifications.priority.medium': {
    en: 'Medium',
    hi: 'मध्यम',
    kn: 'ಮಧ್ಯಮ',
    ta: 'நடுத்தர',
    te: 'మధ్యస్థం',
    mr: 'मध्यम',
    tulu: 'ಮಧ್ಯಮ',
    kok: 'मध्यम',
  },
  'notifications.priority.low': {
    en: 'Low',
    hi: 'कम',
    kn: 'ಕಡಿಮೆ',
    ta: 'குறைந்த',
    te: 'తక్కువ',
    mr: 'कमी',
    tulu: 'ಕಮ್ಮಿ',
    kok: 'उणो',
  },

  // 4. Action Button Labels
  'notifications.action.reviewBids': {
    en: 'Review Bids',
    hi: 'बोलियों की समीक्षा करें',
    kn: 'ಬಿಡ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    ta: 'ஏலங்களை மதிப்பாய்வு செய்க',
    te: 'బిడ్లను సమీక్షించండి',
    mr: 'बोलींचे पुनरावलोकन करा',
    tulu: 'ಬಿಡ್‌ಲೆನ್ ತೂಲೆ',
    kok: 'बोलींची तपासणी करात',
  },
  'notifications.action.openTender': {
    en: 'Open Tender',
    hi: 'निविदा खोलें',
    kn: 'ಟೆಂಡರ್ ತೆರೆಯಿರಿ',
    ta: 'டெண்டரைத் திறக்கவும்',
    te: 'టెండర్‌ను తెరవండి',
    mr: 'निविदा उघडा',
    tulu: 'ಟೆಂಡರ್ ದೆಪ್ಪುಲೆ',
    kok: 'टेंडर उगडाತ್',
  },
  'notifications.action.uploadDoc': {
    en: 'Upload Document',
    hi: 'दस्तावेज़ अपलोड करें',
    kn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    ta: 'ஆவணத்தைப் பதிவேற்றவும்',
    te: 'పత్రాన్ని అప్‌లోడ్ చేయండి',
    mr: 'दस्तऐवज अपलोड करा',
    tulu: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಲ್ಪುಲೆ',
    kok: 'कागदपत्र अपलोड करात',
  },
  'notifications.action.viewResult': {
    en: 'View Result',
    hi: 'परिणाम देखें',
    kn: 'ಫಲಿತಾಂಶ ವೀಕ್ಷಿಸಿ',
    ta: 'முடிவைக் காண்க',
    te: 'ఫలితాన్ని చూడండి',
    mr: 'निकाल पहा',
    tulu: 'ಫಲಿತಾಂಶ ತೂಲೆ',
    kok: 'निकाला पळयात',
  },
  'notifications.action.viewClarification': {
    en: 'View Clarification',
    hi: 'स्पष्टीकरण देखें',
    kn: 'ಸ್ಪಷ್ಟೀಕರಣವನ್ನು ವೀಕ್ಷಿಸಿ',
    ta: 'விளக்கத்தைக் காண்க',
    te: 'వివరణను చూడండి',
    mr: 'स्पष्टीकरण पहा',
    tulu: 'ವಿವರಣೆನ್ ತೂಲೆ',
    kok: 'स्पश्टीकरण पळयात',
  },
  'notifications.action.inspectBidder': {
    en: 'Inspect Bidder',
    hi: 'बोलीदाता का निरीक्षण करें',
    kn: 'ಬಿಡ್ಡರ್ ಪರಿಶೀಲಿಸಿ',
    ta: 'ஏலதாரரை ஆய்வு செய்க',
    te: 'బిడ్డర్‌ను పరిశీలించండి',
    mr: 'बोलीदाराची तपासणी करा',
    tulu: 'ಬಿಡ್ಡರ್ ಪರಿಶೀಲನೆ ಮಲ್ಪುಲೆ',
    kok: 'बोलीदाराची तपासणी करात',
  },

  // 5. Time Formatting
  'notifications.time.justNow': {
    en: 'Just now',
    hi: 'अभी',
    kn: 'ಈಗಷ್ಟೇ',
    ta: 'சற்றுமுன்',
    te: 'ఇప్పుడే',
    mr: 'आत्ताच',
    tulu: 'ಇತ್ತೆನೆ',
    kok: 'आत्ताಂಚ್',
  },
  'notifications.time.minutesAgo': {
    en: '{count}m ago',
    hi: '{count} मिनट पहले',
    kn: '{count} ನಿಮಿಷಗಳ ಹಿಂದೆ',
    ta: '{count} நிமிடம் முன்',
    te: '{count} నిమిషాల క్రితం',
    mr: '{count} मिनिटांपूर्वी',
    tulu: '{count} ನಿಮಿಷ ದುಂಬು',
    kok: '{count} मिण्टाಂ आदीಂ',
  },
  'notifications.time.hoursAgo': {
    en: '{count}h ago',
    hi: '{count} घंटे पहले',
    kn: '{count} ಗಂಟೆಗಳ ಹಿಂದೆ',
    ta: '{count} மணிநேரம் முன்',
    te: '{count} గంటల క్రితం',
    mr: '{count} तासांपूर्वी',
    tulu: '{count} ಗಂಟೆ ದುಂಬು',
    kok: '{count} ವರಾಂ आदीಂ',
  },
  'notifications.time.daysAgo': {
    en: '{count}d ago',
    hi: '{count} दिन पहले',
    kn: '{count} ದಿನಗಳ ಹಿಂದೆ',
    ta: '{count} நாட்கள் முன்',
    te: '{count} రోజుల క్రితం',
    mr: '{count} दिवसांपूर्वी',
    tulu: '{count} ದಿನ ದುಂಬು',
    kok: '{count} ದೀಸ್ आदीಂ',
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
