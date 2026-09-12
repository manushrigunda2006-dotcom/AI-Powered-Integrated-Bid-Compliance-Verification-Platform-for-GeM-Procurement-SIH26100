'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageContextType } from './types';
import { translations } from './translations';
import { phraseDictionary } from './phraseDictionary';
import { notificationTranslations } from '../notifications/notificationDictionary';

interface ExtendedLanguageContextType extends LanguageContextType {
  t: (key: string, params?: Record<string, string | number> | string) => string;
}

const LanguageContext = createContext<ExtendedLanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

const STORAGE_KEY = 'gem_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'kn') {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may not be available in private browsing or SSR
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, params?: Record<string, string | number> | string): string => {
    const fallbackText = typeof params === 'string' ? params : undefined;
    const cleanKey = key ? key.trim() : '';

    let text: string | undefined;

    if (language === 'en') {
      text = notificationTranslations[key]?.en ||
             notificationTranslations[cleanKey]?.en ||
             translations.en[key] ||
             phraseDictionary.en[key] ||
             phraseDictionary.en[cleanKey] ||
             (fallbackText ? (notificationTranslations[fallbackText]?.en || translations.en[fallbackText] || phraseDictionary.en[fallbackText] || phraseDictionary.en[fallbackText.trim()] || fallbackText) : key);
    } else {
      const langDict = translations[language] || {};
      const phraseDict = phraseDictionary[language] || {};
      const notifItem = notificationTranslations[key] || notificationTranslations[cleanKey];

      if (notifItem && notifItem[language]) {
        text = notifItem[language];
      }

      // 1. Direct translation key lookup in language dictionary
      if (!text) {
        text = langDict[key];
      }

      // If text found in langDict is identical to English translation, check if phraseDict has a localized phrase
      if (text && translations.en[key] && text === translations.en[key] && phraseDict[text]) {
        text = phraseDict[text];
      }

      // 2. Direct lookup in phrase dictionary by key
      if (!text) {
        text = phraseDict[key] || phraseDict[cleanKey];
      }

      // 3. If key exists in English dictionary, look up that English phrase in phrase dictionary
      if (!text && translations.en[key]) {
        const enText = translations.en[key];
        text = phraseDict[enText] || phraseDict[enText.trim()];
      }

      // 4. If fallbackText was provided, try to resolve fallbackText
      if (!text && fallbackText) {
        const cleanFallback = fallbackText.trim();
        text = langDict[fallbackText] ||
               phraseDict[fallbackText] ||
               phraseDict[cleanFallback] ||
               (translations.en[fallbackText] ? phraseDict[translations.en[fallbackText]] : undefined) ||
               (translations[language] && translations[language][cleanFallback]);
      }

      // 5. Fallback to English if no translation was found
      if (!text) {
        text = translations.en[key] || phraseDictionary.en[key] || fallbackText || key;
      }
    }

    if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
