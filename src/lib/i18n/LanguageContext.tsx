'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageContextType } from './types';
import { translations } from './translations';

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
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key];

    if (!text) {
      if (typeof params === 'string') return params;
      return key;
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
