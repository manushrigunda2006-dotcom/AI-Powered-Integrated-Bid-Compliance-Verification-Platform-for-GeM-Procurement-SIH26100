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
  Lock
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { GfrComplianceDialog } from './GfrComplianceDialog';
import { gfrComplianceService, GfrStatusDetails } from '@/services/gfrComplianceService';

export function Header() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGfrDialogOpen, setIsGfrDialogOpen] = useState(false);
  const [gfrDetails, setGfrDetails] = useState<GfrStatusDetails | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    gfrComplianceService.getGfrComplianceStatus().then((details) => {
      if (mounted) {
        setGfrDetails(details);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

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

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Notice signing out from supabase:', err);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gem_officer_session');
    }
    router.push('/login');
  };

  return (
    <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[58px] sm:h-[62px]">
          {/* HEADER LEFT BRANDING */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex flex-col justify-center leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-[14px] sm:text-[15px] text-[#102F5F] tracking-tight">
                    Government e-Marketplace
                  </span>
                </div>
                <span className="text-[9px] text-[#64748B] font-medium hidden sm:inline-block mt-0.5">
                  Automated Procurement Verification &amp; Compliance Engine (SIH Edition)
                </span>
              </div>
            </Link>
          </div>

          {/* HEADER NAVIGATION & OFFICER AREA */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <nav className="hidden md:flex items-center space-x-3 text-[11px] font-medium">
              {/* FIRST: Existing Tenders */}
              <Link
                href="/tenders"
                className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
              >
                <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                <span className="text-[11px] font-semibold">Existing Tenders</span>
              </Link>

              {/* SECOND: Create Tender */}
              <Link
                href="/tenders/new"
                className="text-[#334155] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="text-[11px] font-semibold">Create Tender</span>
              </Link>

              {/* THIRD: GFR Rule 151 Compliant Badge (Clickable & Accessible) */}
              <button
                type="button"
                onClick={() => setIsGfrDialogOpen(true)}
                aria-label="View GFR Rule 151 compliance status"
                aria-haspopup="dialog"
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0] text-[10px] font-bold cursor-pointer hover:bg-[#DCFCE7] hover:border-[#86EFAC] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-1 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                <span>{gfrDetails?.badgeLabel || 'GFR Rule 151 Compliant'}</span>
              </button>

              {/* Audit Trail Link */}
              <Link
                href="/audit-logs"
                className="text-[#64748B] hover:text-[#102F5F] transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-100 text-[11px] font-semibold"
                title="Cryptographic Audit Logs"
              >
                <Lock className="w-3 h-3 text-[#64748B]" />
                <span>Audit Trail</span>
              </Link>
            </nav>

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            {/* HEADER OFFICER AREA */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center space-x-2 py-1 text-left focus:outline-hidden cursor-pointer"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                {/* Circular Avatar 30px, #0F2F63 with AB */}
                <div className="w-[30px] h-[30px] rounded-full bg-[#0F2F63] text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs">
                  AB
                </div>
                <div className="hidden sm:flex items-center text-left leading-tight">
                  <span className="text-[11px] font-bold text-[#102F5F] flex items-center space-x-1">
                    <span>ABCD</span>
                    <ChevronDown
                      className={`w-3 h-3 text-[#64748B] transition-transform ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </div>
              </button>

              {/* Officer Profile Dropdown Modal */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#D9E3EF] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0F2F63] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      AB
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <h4 className="text-xs font-bold text-[#102F5F] truncate">
                          ABCD
                        </h4>
                        <span className="bg-[#ECFDF5] text-[#15803D] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-[#64748B] flex items-center space-x-1 mt-0.5 truncate">
                        <Building2 className="w-3 h-3 text-[#94A3B8] shrink-0" />
                        <span className="truncate">Ministry of Commerce & Industry</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>View Officer Profile & DSC</span>
                    </Link>

                    <Link
                      href="/tenders"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Existing Tenders</span>
                    </Link>

                    <Link
                      href="/tenders/new"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Create Tender RFP</span>
                    </Link>

                    <Link
                      href="/audit-logs"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium text-[#334155] hover:text-[#102F5F] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Immutable Audit Trail</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-[11px] font-semibold text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GFR RULE 151 COMPLIANCE MODAL */}
      <GfrComplianceDialog
        isOpen={isGfrDialogOpen}
        onClose={() => setIsGfrDialogOpen(false)}
        details={gfrDetails}
      />
    </header>
  );
}
