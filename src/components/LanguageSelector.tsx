'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/i18n/types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'expanded';
  className?: string;
}

const LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'tulu', label: 'Tulu', nativeName: 'ತುಳು' },
  { code: 'kok', label: 'Konkani', nativeName: 'कोंकणी' },
];

export function LanguageSelector({ variant = 'compact', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'expanded') {
    return (
      <div className={`flex items-center space-x-1 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-xs ${className}`}>
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 dark:bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {lang.nativeName}
            </button>
          );
        })}
      </div>
    );
  }

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-900 dark:hover:text-blue-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        aria-label="Change Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
        <span className="font-bold text-[11px]">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
          <div className="px-2.5 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
            {t('lang.select', 'Language')}
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-900 dark:hover:text-blue-300'
                }`}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-900 dark:text-blue-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
