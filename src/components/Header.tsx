'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  ChevronDown,
  Building2,
  Mail,
  LogOut,
  User,
  FolderGit2,
  Lock,
  Clock,
  Briefcase,
  ShieldCheck,
  FileCheck2,
  LayoutDashboard,
  Info,
  Upload
} from 'lucide-react';
import { useAuth, logout } from '@/lib/authGuard';
import { GfrComplianceDialog } from './GfrComplianceDialog';
import { gfrComplianceService, GfrStatusDetails } from '@/services/gfrComplianceService';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const router = useRouter();
  const { session, role, isAuthenticated, isOfficer, isBidder } = useAuth();
  const { t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGfrDialogOpen, setIsGfrDialogOpen] = useState(false);
  const [gfrDetails, setGfrDetails] = useState<GfrStatusDetails | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    if (isOfficer) {
      gfrComplianceService.getGfrComplianceStatus().then((details) => {
        if (mounted) {
          setGfrDetails(details);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [isOfficer]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout(router, '/role-selection');
  };

  const homeHref = isBidder ? '/bidder/dashboard' : isOfficer ? '/officer/dashboard' : '/role-selection';

  return (
    <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[58px] sm:h-[62px]">
          {/* HEADER LEFT BRANDING */}
          <div className="flex items-center space-x-3">
            <Link href={homeHref} className="flex items-center space-x-2.5 group">
              <div className="flex flex-col justify-center leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-[14px] sm:text-[15px] text-[#102F5F] tracking-tight">
                    {t('app.title', 'Government e-Marketplace')}
                  </span>
                  {isBidder && (
                    <span className="bg-blue-100 text-blue-900 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                      {t('app.bidder_portal', 'Bidder Portal')}
                    </span>
                  )}
                  {isOfficer && (
                    <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                      {t('app.officer_portal', 'Officer Portal')}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-[#64748B] font-medium hidden sm:inline-block mt-0.5">
                  {t('app.subtitle', 'Automated Procurement Verification & Compliance Engine (SIH Edition)')}
                </span>
              </div>
            </Link>
          </div>

          {/* HEADER NAVIGATION - ROLE-SPECIFIC */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* 1. GOVERNMENT OFFICER NAVIGATION */}
            {isOfficer && (
              <nav className="hidden md:flex items-center space-x-3 text-[11px] font-medium">
                <Link
                  href="/officer/dashboard"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-[11px] font-semibold">{t('nav.officer_dashboard', 'Officer Dashboard')}</span>
                </Link>

                <Link
                  href="/tenders"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-[11px] font-semibold">{t('nav.existing_tenders', 'Existing Tenders')}</span>
                </Link>

                <Link
                  href="/tenders/new"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[11px] font-semibold">{t('nav.create_tender', 'Create Tender')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsGfrDialogOpen(true)}
                  aria-label="View GFR Rule 151 compliance status"
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0] text-[10px] font-bold cursor-pointer hover:bg-[#DCFCE7] transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                  <span>{gfrDetails?.badgeLabel || t('nav.gfr_compliant', 'GFR Rule 151 Compliant')}</span>
                </button>

                <Link
                  href="/audit-logs"
                  className="text-[#64748B] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100 text-[11px] font-semibold"
                  title="Cryptographic Audit Logs"
                >
                  <Lock className="w-3 h-3 text-[#64748B]" />
                  <span>{t('nav.audit_trail', 'Audit/History')}</span>
                </Link>

                <Link
                  href="/about"
                  className="text-[#64748B] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100 text-[11px] font-semibold"
                >
                  <Info className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{t('nav.about', 'About')}</span>
                </Link>
              </nav>
            )}

            {/* 2. BIDDER NAVIGATION */}
            {isBidder && (
              <nav className="hidden md:flex items-center space-x-2.5 text-[11px] font-medium">
                <Link
                  href="/bidder/dashboard"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-900" />
                  <span className="text-[11px] font-semibold">{t('nav.bidder_dashboard', 'Bidder Dashboard')}</span>
                </Link>

                <Link
                  href="/bidder/tenders"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-[11px] font-semibold">{t('nav.available_tenders', 'Available Tenders')}</span>
                </Link>

                <Link
                  href="/bidder/dashboard#submissions"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-semibold">{t('nav.my_submissions', 'My Submissions')}</span>
                </Link>

                <Link
                  href="/bidder/submit"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[11px] font-semibold">{t('nav.upload_docs', 'Upload Documents')}</span>
                </Link>

                <Link
                  href="/bidder/logs"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[11px] font-semibold">{t('nav.history', 'History')}</span>
                </Link>

                <Link
                  href="/bidder/profile"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-[11px] font-semibold">{t('nav.profile', 'Profile')}</span>
                </Link>

                <Link
                  href="/about"
                  className="text-[#64748B] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100 text-[11px] font-semibold"
                >
                  <Info className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{t('nav.about', 'About')}</span>
                </Link>
              </nav>
            )}

            {/* 3. UNAUTHENTICATED NAVIGATION */}
            {!isAuthenticated && (
              <nav className="flex items-center space-x-2 text-[11px] font-medium">
                <Link
                  href="/about"
                  className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold"
                >
                  <Info className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{t('nav.about', 'About')}</span>
                </Link>

                <Link
                  href="/role-selection"
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                >
                  {t('nav.role_selection', 'Select Portal Role')}
                </Link>
              </nav>
            )}

            {/* THEME TOGGLE (LIGHT / DARK) */}
            <ThemeToggle />

            {/* MULTILINGUAL LANGUAGE SELECTOR */}
            <LanguageSelector />

            {isAuthenticated && <div className="h-4 w-px bg-slate-200 hidden md:block" />}

            {/* PROFILE & LOGOUT DROPDOWN */}
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center space-x-2 py-1 text-left focus:outline-hidden cursor-pointer"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div
                    className={`w-[30px] h-[30px] rounded-full text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs ${
                      isOfficer ? 'bg-[#0F2F63]' : 'bg-blue-700'
                    }`}
                  >
                    {isOfficer ? 'AB' : 'AT'}
                  </div>
                  <div className="hidden sm:flex items-center text-left leading-tight">
                    <span className="text-[11px] font-bold text-[#102F5F] flex items-center space-x-1">
                      <span className="max-w-[120px] truncate">
                        {isOfficer ? (session as any).name || 'Officer ABCD' : (session as any).companyName || 'Bidder'}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-[#64748B] transition-transform ${
                          isProfileOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#D9E3EF] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-start space-x-2.5">
                      <div
                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${
                          isOfficer ? 'bg-[#0F2F63]' : 'bg-blue-700'
                        }`}
                      >
                        {isOfficer ? 'AB' : 'AT'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-[#102F5F] truncate">
                            {isOfficer ? (session as any).name || 'Officer ABCD' : (session as any).companyName || 'Bidder'}
                          </h4>
                          <span
                            className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full ${
                              isOfficer
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {isOfficer ? 'Officer' : 'Bidder'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] flex items-center space-x-1 mt-0.5 truncate">
                          {isOfficer ? (
                            <>
                              <Building2 className="w-3 h-3 text-[#94A3B8] shrink-0" />
                              <span className="truncate">Dept of Public Procurement</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate font-mono">{(session as any).gstNumber || 'GST Verified'}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Officer Dropdown Links */}
                    {isOfficer && (
                      <div className="p-1.5 space-y-0.5 text-xs">
                        <Link
                          href="/officer/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.officer_dashboard', 'Officer Dashboard')}</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.profile', 'View Officer Profile & DSC')}</span>
                        </Link>

                        <Link
                          href="/tenders"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.existing_tenders', 'Existing Tenders')}</span>
                        </Link>

                        <Link
                          href="/tenders/new"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>{t('nav.create_tender', 'Create Tender RFP')}</span>
                        </Link>

                        <Link
                          href="/audit-logs"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.audit_trail', 'Audit/History')}</span>
                        </Link>

                        <Link
                          href="/about"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.about', 'About')}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-semibold text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>{t('nav.logout', 'Log Out')}</span>
                        </button>
                      </div>
                    )}

                    {/* Bidder Dropdown Links */}
                    {isBidder && (
                      <div className="p-1.5 space-y-0.5 text-xs">
                        <Link
                          href="/bidder/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-900" />
                          <span>{t('nav.bidder_dashboard', 'Bidder Dashboard')}</span>
                        </Link>

                        <Link
                          href="/bidder/tenders"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.available_tenders', 'Available Tenders')}</span>
                        </Link>

                        <Link
                          href="/bidder/submit"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-blue-700" />
                          <span>{t('nav.upload_docs', 'Upload Documents')}</span>
                        </Link>

                        <Link
                          href="/bidder/dashboard#submissions"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('nav.my_submissions', 'My Submissions')}</span>
                        </Link>

                        <Link
                          href="/bidder/logs"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-700" />
                          <span>{t('nav.history', 'History')}</span>
                        </Link>

                        <Link
                          href="/bidder/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.company_profile', 'Profile')}</span>
                        </Link>

                        <Link
                          href="/about"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t('nav.about', 'About')}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-semibold text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>{t('nav.logout', 'Log Out')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GFR RULE 151 COMPLIANCE MODAL (Officer Only) */}
      {isOfficer && (
        <GfrComplianceDialog
          isOpen={isGfrDialogOpen}
          onClose={() => setIsGfrDialogOpen(false)}
          details={gfrDetails}
        />
      )}
    </header>
  );
}
