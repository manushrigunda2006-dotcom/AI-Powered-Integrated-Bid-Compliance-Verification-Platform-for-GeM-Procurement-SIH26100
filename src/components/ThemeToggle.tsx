'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = true }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { t } = useLanguage();

  const isDark = mounted && theme === 'dark';
  const currentLabel = isDark ? t('theme.dark', 'Dark') : t('theme.light', 'Light');
  const targetLabel = isDark ? t('theme.light', 'Light') : t('theme.dark', 'Dark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch theme. Currently ${currentLabel}. Click to switch to ${targetLabel}.`}
      aria-pressed={isDark}
      title={`${t('theme.toggle', 'Toggle Theme')}: ${currentLabel}`}
      suppressHydrationWarning
      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-blue-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 ${className}`}
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          {showLabel && <span className="font-bold text-[11px]" suppressHydrationWarning>{currentLabel}</span>}
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {showLabel && <span className="font-bold text-[11px]" suppressHydrationWarning>{currentLabel}</span>}
        </>
      )}
    </button>
  );
}
