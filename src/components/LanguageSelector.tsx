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
      <div className={`flex items-center space-x-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs ${className}`}>
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/60'
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
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 bg-white text-slate-700 hover:text-blue-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        aria-label="Change Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-700" />
        <span className="font-bold text-[11px]">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-900'
                }`}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-900" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
