'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-wrap justify-center sm:justify-start">
          <span className="font-bold text-slate-700">{t('footer.text', 'GeM Compliance Assistant • Smart India Hackathon (SIH) MVP')}</span>
          <span>•</span>
          <span>{t('footer.problem_statement', 'Problem Statement: GeM Verification Assistant')}</span>
        </div>
        <div className="text-slate-400 text-[11px] text-center sm:text-right">
          {t('footer.built_with', 'Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Deterministic RegTech Adapters')}
        </div>
      </div>
    </footer>
  );
}
