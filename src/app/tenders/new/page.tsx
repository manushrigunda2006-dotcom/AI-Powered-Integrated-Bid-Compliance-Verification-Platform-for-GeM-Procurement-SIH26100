'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOfficerAuth } from '@/lib/authGuard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { tenderService } from '@/services/tenderService';
import { tenderRequiredDocumentService, AVAILABLE_DOCUMENT_TYPES } from '@/services/tenderRequiredDocumentService';
import { storageService, MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS } from '@/services/storageService';
import { DocumentType, Requirement, RequirementCategory, RuleType, TenderRequiredDocument } from '@/lib/types';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Scale,
  Sparkles,
  Trash2,
  Upload,
  FileCheck,
  AlertTriangle,
  X,
  Clock,
  Save,
  Info,
  Layers,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

export default function CreateTenderNewPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { session, isAuthenticated, isLoading: authLoading } = useOfficerAuth(true);

  // Form State: Basic Information
  const [tenderNumber, setTenderNumber] = useState(`GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`);
  const [title, setTitle] = useState('Procurement of Enterprise Cloud Infrastructure & Threat Defense Systems');
  const [department, setDepartment] = useState('Ministry of Electronics and Information Technology (MeitY)');
  const [customDept, setCustomDept] = useState('');
  const [budgetCr, setBudgetCr] = useState<number>(45.0);
  const [deadlineDays, setDeadlineDays] = useState<number>(30);
  const [description, setDescription] = useState(
    'Turnkey procurement RFP for enterprise-grade private cloud compute, software-defined networking, and high-security SIEM infrastructure across national data centers under GeM rules.'
  );

  // Form State: Mandatory Compliance Requirements Clauses
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: 'clause-01',
      tender_id: '',
      clause_code: 'FIN-01',
      clause_title: 'Minimum Average Annual Turnover',
      description: 'Chartered Accountant certified average annual turnover of at least ₹3.00 Crores across last 3 financial years with valid UDIN.',
      category: 'FINANCIAL',
      rule_type: 'NUMERIC_GTE',
      threshold_value: '30000000',
      threshold_display: '₹3.00 Crores',
      is_mandatory: true,
      weight: 25,
    },
    {
      id: 'clause-02',
      tender_id: '',
      clause_code: 'EXP-01',
      clause_title: 'Past Operational Experience',
      description: 'Minimum 5 years continuous operational experience delivering enterprise IT infrastructure for Central/State Govt or PSUs.',
      category: 'EXPERIENCE',
      rule_type: 'NUMERIC_GTE',
      threshold_value: '5',
      threshold_display: '5 Years Minimum',
      is_mandatory: true,
      weight: 20,
    },
    {
      id: 'clause-03',
      tender_id: '',
      clause_code: 'STAT-01',
      clause_title: 'Active GST Registration Status',
      description: 'Valid Form GST REG-06 registration in ACTIVE status on GSTN portal with zero default notices.',
      category: 'STATUTORY',
      rule_type: 'EXACT_MATCH',
      threshold_value: 'ACTIVE',
      threshold_display: 'Status: ACTIVE',
      is_mandatory: true,
      weight: 20,
    },
    {
      id: 'clause-04',
      tender_id: '',
      clause_code: 'STAT-02',
      clause_title: 'CPPP Non-Debarment / Anti-Blacklisting',
      description: 'Notarized non-blacklisting affidavit & clear check on Central Public Procurement Portal debarment ledger under GFR Rule 151.',
      category: 'STATUTORY',
      rule_type: 'EXACT_MATCH',
      threshold_value: 'CLEAR',
      threshold_display: 'Status: NOT_DEBARRED',
      is_mandatory: true,
      weight: 20,
    },
    {
      id: 'clause-05',
      tender_id: '',
      clause_code: 'OEM-01',
      clause_title: 'OEM Manufacturer Authorization Form (MAF)',
      description: 'Verifiable OEM MAF specifically issued to the bidder for this GeM procurement tender.',
      category: 'OEM',
      rule_type: 'EXISTS',
      threshold_value: 'VALID_MAF',
      threshold_display: 'OEM Authorized',
      is_mandatory: true,
      weight: 15,
    },
  ]);

  // Form State: Required Bidder Documents
  const [requiredDocs, setRequiredDocs] = useState<TenderRequiredDocument[]>([
    {
      id: 'seed-doc-01',
      tender_id: '',
      document_type: 'FINANCIAL_AUDIT',
      display_name: 'CA_Certified_Turnover.pdf',
      file_size: 1024 * 512,
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'seed-doc-02',
      tender_id: '',
      document_type: 'GST_CERT',
      display_name: 'GST_Registration_Certificate.pdf',
      file_size: 1024 * 256,
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'seed-doc-03',
      tender_id: '',
      document_type: 'WORK_ORDER_EXPERIENCE',
      display_name: 'Past_Performance_Work_Order.pdf',
      file_size: 1024 * 1024,
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'seed-doc-04',
      tender_id: '',
      document_type: 'AFFIDAVIT_BLACKLIST',
      display_name: 'Non_Blacklisting_Affidavit.pdf',
      file_size: 1024 * 180,
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'seed-doc-05',
      tender_id: '',
      document_type: 'OEM_AUTH',
      display_name: 'OEM_Authorization_MAF.pdf',
      file_size: 1024 * 320,
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
  ]);

  // UI / Modal States
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [docToDelete, setDocToDelete] = useState<TenderRequiredDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Gemini AI RFP Analyzer State
  const [isAiRfpOpen, setIsAiRfpOpen] = useState(false);
  const [rfpInputText, setRfpInputText] = useState('');
  const [isAiRfpAnalyzing, setIsAiRfpAnalyzing] = useState(false);

  const handleLoadSampleRfp = () => {
    setRfpInputText(
      'REQUEST FOR PROPOSAL (RFP) - GOVERNMENT E-MARKETPLACE (GeM)\\n' +
      'Procurement of Enterprise Cloud Infrastructure & Threat Defense Systems\\n' +
      'Procuring Ministry: Ministry of Electronics and Information Technology (MeitY)\\n' +
      'Estimated Budget: ₹8.50 Crores\\n' +
      'Submission Window: 45 Days\\n\\n' +
      'Scope of Procurement:\\n' +
      'Turnkey enterprise private cloud compute, SIEM cybersecurity infrastructure, and 100Gbps SDN networking for national data centers.\\n\\n' +
      'Mandatory Eligibility Clauses:\\n' +
      '1. Minimum Turnover: ₹5.00 Crores CA-certified average across last 3 FY with valid UDIN.\\n' +
      '2. Experience: Minimum 7 years enterprise IT infrastructure delivery for Govt/PSU.\\n' +
      '3. GST Registration: Active Form GST REG-06 verified on GSTN portal.\\n' +
      '4. Non-Debarment: Clear debarment standing on CPPP portal under GFR Rule 151.\\n' +
      '5. OEM MAF: Original Equipment Manufacturer Authorization Form from OEM partners.'
    );
  };

  const handleAnalyzeRfp = async () => {
    if (!rfpInputText.trim()) {
      showToast('Please paste RFP text to analyze.');
      return;
    }

    setIsAiRfpAnalyzing(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ANALYZE_RFP',
          rfpText: rfpInputText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const analysis = data.analysis;
        if (analysis) {
          if (analysis.title) setTitle(analysis.title);
          if (analysis.department) setDepartment(analysis.department);
          if (analysis.estimated_budget) setBudgetCr(analysis.estimated_budget / 10000000);
          if (analysis.deadline_days) setDeadlineDays(analysis.deadline_days);
          if (analysis.description) setDescription(analysis.description);
          if (analysis.requirements && analysis.requirements.length > 0) {
            setRequirements(analysis.requirements);
          }
          if (analysis.required_documents && analysis.required_documents.length > 0) {
            setRequiredDocs(analysis.required_documents);
          }
          showToast(
            data.isGeminiConfigured
              ? '✨ RFP analyzed with Gemini! Specifications populated.'
              : '✨ RFP analyzed! Pre-configured GeM standard clauses populated.'
          );
          setIsAiRfpOpen(false);
        }
      } else {
        showToast('Failed to analyze RFP text.');
      }
    } catch (err) {
      console.warn('RFP analysis notice:', err);
      showToast('Error analyzing RFP text.');
    } finally {
      setIsAiRfpAnalyzing(false);
    }
  };

  // Hidden File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = tenderService.getDraft();
    if (draft && draft.title) {
      setHasDraft(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLoadDraft = () => {
    const draft = tenderService.getDraft();
    if (draft) {
      if (draft.tender_number) setTenderNumber(draft.tender_number);
      if (draft.title) setTitle(draft.title);
      if (draft.department) setDepartment(draft.department);
      if (draft.description) setDescription(draft.description);
      if (draft.estimated_budget) setBudgetCr(draft.estimated_budget / 10000000);
      if (draft.requirements && draft.requirements.length > 0) setRequirements(draft.requirements);
      if (draft.required_documents && draft.required_documents.length > 0) setRequiredDocs(draft.required_documents);
      showToast('Draft restored from local session.');
    }
    setHasDraft(false);
  };

  const handleDiscardDraft = () => {
    tenderService.clearDraft();
    setHasDraft(false);
    showToast('Saved draft discarded.');
  };

  // Upload Document Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      // Automatically suggest document type from filename
      const suggestedType = tenderRequiredDocumentService.detectDocumentType(file.name);

      const newDoc: TenderRequiredDocument = {
        id: `req-doc-${Date.now()}`,
        tender_id: '',
        document_type: suggestedType,
        display_name: file.name,
        file_size: file.size,
        is_mandatory: true,
        created_at: new Date().toISOString(),
      };

      setRequiredDocs((prev) => [...prev, newDoc]);
      showToast(`Document "${file.name}" added as ${suggestedType}.`);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process document upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Change Document Type in UI
  const handleUpdateDocType = (docId: string, newType: DocumentType) => {
    setRequiredDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, document_type: newType } : d))
    );
  };

  // Toggle Mandatory for Document
  const handleToggleDocMandatory = (docId: string) => {
    setRequiredDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, is_mandatory: !d.is_mandatory } : d))
    );
  };

  // Confirm Delete Document
  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    setRequiredDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
    showToast(`Removed "${docToDelete.display_name}" from required documents.`);
    setDocToDelete(null);
  };

  // Add New Requirement Clause
  const handleAddClause = () => {
    const nextIndex = requirements.length + 1;
    const newReq: Requirement = {
      id: `clause-${Date.now()}`,
      tender_id: '',
      clause_code: `REQ-0${nextIndex}`,
      clause_title: `Custom Eligibility Clause ${nextIndex}`,
      description: 'Specify the strict compliance criteria to be evaluated by the deterministic engine.',
      category: 'TECHNICAL',
      rule_type: 'EXACT_MATCH',
      threshold_value: 'COMPLIANT',
      threshold_display: 'Must Comply',
      is_mandatory: true,
      weight: 10,
    };
    setRequirements((prev) => [...prev, newReq]);
  };

  // Remove Requirement Clause
  const handleRemoveClause = (clauseId: string) => {
    if (requirements.length <= 1) {
      showToast('A tender must contain at least 1 compliance requirement clause.');
      return;
    }
    setRequirements((prev) => prev.filter((r) => r.id !== clauseId));
  };

  // Update Requirement Clause Field
  const handleUpdateClause = (clauseId: string, field: keyof Requirement, value: any) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === clauseId ? { ...r, [field]: value } : r))
    );
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!tenderNumber.trim()) errors.tenderNumber = 'Tender number is required.';
    if (!title.trim()) errors.title = 'Please enter a tender title.';
    const finalDept = department === 'CUSTOM' ? customDept : department;
    if (!finalDept.trim()) errors.department = 'Department / Ministry is required.';
    if (!budgetCr || budgetCr <= 0) errors.budget = 'Please specify a valid estimated budget.';
    if (!deadlineDays || deadlineDays <= 0) errors.deadline = 'Please enter a valid submission window.';

    // Validate Clauses
    requirements.forEach((req, idx) => {
      if (!req.clause_code.trim()) errors[`clause_code_${idx}`] = 'Clause code is required.';
      if (!req.clause_title.trim()) errors[`clause_title_${idx}`] = 'Clause title is required.';
      if (!req.threshold_value.trim()) errors[`clause_threshold_${idx}`] = 'Threshold value is required.';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Draft
  const handleSaveDraft = async () => {
    const finalDept = department === 'CUSTOM' ? customDept : department;
    await tenderService.saveDraft({
      tender_number: tenderNumber,
      title,
      department: finalDept,
      description,
      estimated_budget: budgetCr * 10000000,
      budget_formatted: `₹${budgetCr.toFixed(2)} Crores`,
      deadline: new Date(Date.now() + deadlineDays * 86400000).toISOString(),
      requirements,
      required_documents: requiredDocs,
    });
    showToast('Tender draft saved successfully (TENDER_DRAFT_SAVED logged).');
  };

  // Final Create Tender Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the highlighted errors before creating the tender.');
      return;
    }

    setIsSubmitting(true);
    const finalDept = department === 'CUSTOM' ? customDept : department;

    try {
      const createdTender = await tenderService.createTender({
        tender_number: tenderNumber,
        title,
        department: finalDept,
        description,
        estimated_budget: budgetCr * 10000000,
        budget_formatted: `₹${budgetCr.toFixed(2)} Crores`,
        deadline: new Date(Date.now() + deadlineDays * 86400000).toISOString(),
        requirements,
        required_documents: requiredDocs,
      });

      setIsSuccess(true);
      showToast('Tender created successfully! Redirecting to Tender Details...');

      setTimeout(() => {
        router.push(`/tenders/${createdTender.id}`);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to create tender:', err);
      showToast(err?.message || 'Error occurred while creating tender.');
      setIsSubmitting(false);
    }
  };

  const deadlineFormatted = new Date(Date.now() + deadlineDays * 86400000).toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="text-blue-900 hover:underline font-bold">
          {t('Dashboard')}
        </Link>
        <span>/</span>
        <Link href="/tenders" className="text-blue-900 hover:underline font-bold">
          {t('Existing Tenders')}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{t('Create Tender')}</span>
      </nav>

      {/* Restore Draft Banner */}
      {hasDraft && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-amber-900">
            <Save className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">
              {t('An unsubmitted tender draft was found in your local officer session.')}
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadDraft}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              {t('Restore Draft')}
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
            >
              {t('Discard')}
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
              {t('GeM RFP Creator')}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('GFR Rule 151 Enforced')}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('Create Government Procurement Tender RFP')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('Define basic procurement specifications, configure mandatory deterministic compliance clauses, and specify the exact document packet every bidder must submit.')}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAiRfpOpen(!isAiRfpOpen)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('✨ Auto-Fill with Gemini')}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer border border-slate-300"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('Save Draft')}</span>
          </button>
          <Link
            href="/tenders"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('Cancel')}</span>
          </Link>
        </div>
      </div>

      {/* Gemini AI RFP Analyzer Drawer */}
      {isAiRfpOpen && (
        <div className="p-6 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 border border-indigo-200 rounded-3xl shadow-xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {t('Gemini AI RFP Specification Parser')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Paste raw tender document text or government RFP specifications to automatically generate compliance clauses and required documents.')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleLoadSampleRfp}
                className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {t('Load Sample GeM RFP')}
              </button>
              <button
                type="button"
                onClick={() => setIsAiRfpOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={rfpInputText}
            onChange={(e) => setRfpInputText(e.target.value)}
            placeholder={t('Paste raw tender / RFP notice text here (e.g. Scope of work, eligibility turnover, technical criteria, mandatory certificates)...')}
            className="w-full p-3.5 text-xs rounded-2xl border border-indigo-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 leading-relaxed font-mono"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500">
              {t('⚡ Powered by Google Gemini AI • GFR 2017 & GeM GTC Compliant • Non-Authoritative')}
            </span>
            <button
              type="button"
              onClick={handleAnalyzeRfp}
              disabled={isAiRfpAnalyzing}
              className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              {isAiRfpAnalyzing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-indigo-200" />
                  <span>{t('Analyzing RFP with Gemini...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('Extract & Populate Tender Specifications')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">{t('1. Basic Tender Information')}</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('Tender RFP Number *')}
                  </label>
                  <input
                    type="text"
                    value={tenderNumber}
                    onChange={(e) => setTenderNumber(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      formErrors.tenderNumber ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                    } text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600`}
                  />
                  {formErrors.tenderNumber && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.tenderNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('Procuring Ministry / Department *')}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Ministry of Electronics and Information Technology (MeitY)">
                      MeitY (Ministry of Electronics & IT)
                    </option>
                    <option value="Ministry of Commerce and Industry">
                      Ministry of Commerce and Industry (GeM SPV)
                    </option>
                    <option value="Ministry of Defence (MoD)">
                      Ministry of Defence (MoD)
                    </option>
                    <option value="Ministry of Road Transport and Highways (MoRTH)">
                      Ministry of Road Transport & Highways (MoRTH)
                    </option>
                    <option value="Ministry of Finance (Department of Expenditure)">
                      Ministry of Finance (Dept of Expenditure)
                    </option>
                    <option value="CUSTOM">{t('Custom Ministry / Organization...', 'Custom Ministry / Organization...')}</option>
                  </select>
                  {department === 'CUSTOM' && (
                    <input
                      type="text"
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      placeholder={t('Enter custom department or PSU name...')}
                      className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('Tender RFP Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('e.g. Procurement of Cloud Infrastructure Services')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    formErrors.title ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                  } text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600`}
                />
                {formErrors.title && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('Estimated RFP Budget (in ₹ Crores) *')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={budgetCr}
                      onChange={(e) => setBudgetCr(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="absolute right-3.5 top-2.5 font-bold text-slate-400">Cr</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('Submission Window (Days from today) *')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="7"
                      max="180"
                      required
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 30)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 absolute right-3 top-3">
                      {t('Closes')} {deadlineFormatted}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('RFP Description & Scope of Work')}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('Detailed scope of supply, technical deliverables, and SLA requirements...')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MANDATORY COMPLIANCE CLAUSES */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-blue-900" />
                <h2 className="text-base font-bold text-slate-900">{t('2. Mandatory Compliance Requirements')}</h2>
              </div>
              <button
                type="button"
                onClick={handleAddClause}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer border border-blue-200"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('Add Clause')}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Each clause is evaluated deterministically by the engine. Breaching a mandatory clause automatically flags the bidder for officer review or disqualification under GFR Rule 151.
            </p>

            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={req.clause_code}
                        onChange={(e) => handleUpdateClause(req.id, 'clause_code', e.target.value)}
                        placeholder="CODE"
                        className="w-20 px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg text-center"
                      />
                      <input
                        type="text"
                        value={req.clause_title}
                        onChange={(e) => handleUpdateClause(req.id, 'clause_title', e.target.value)}
                        placeholder="Clause Title"
                        className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-hidden px-1"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={req.is_mandatory}
                          onChange={(e) => handleUpdateClause(req.id, 'is_mandatory', e.target.checked)}
                          className="rounded text-blue-900 focus:ring-blue-600"
                        />
                        <span className="font-bold text-slate-700 text-[11px]">{t('tender.mandatory', 'Mandatory')}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveClause(req.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove Clause"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={1}
                    value={req.description}
                    onChange={(e) => handleUpdateClause(req.id, 'description', e.target.value)}
                    placeholder="Requirement description..."
                    className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Category
                      </label>
                      <select
                        value={req.category}
                        onChange={(e) => handleUpdateClause(req.id, 'category', e.target.value as RequirementCategory)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                      >
                        <option value="FINANCIAL">FINANCIAL</option>
                        <option value="EXPERIENCE">EXPERIENCE</option>
                        <option value="STATUTORY">STATUTORY</option>
                        <option value="TECHNICAL">TECHNICAL</option>
                        <option value="OEM">OEM</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Rule Type
                      </label>
                      <select
                        value={req.rule_type}
                        onChange={(e) => handleUpdateClause(req.id, 'rule_type', e.target.value as RuleType)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium font-mono"
                      >
                        <option value="NUMERIC_GTE">NUMERIC_GTE</option>
                        <option value="DATE_BEFORE">DATE_BEFORE</option>
                        <option value="EXACT_MATCH">EXACT_MATCH</option>
                        <option value="EXISTS">EXISTS</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Threshold
                      </label>
                      <input
                        type="text"
                        value={req.threshold_value}
                        onChange={(e) => {
                          handleUpdateClause(req.id, 'threshold_value', e.target.value);
                          handleUpdateClause(req.id, 'threshold_display', e.target.value);
                        }}
                        placeholder="Threshold"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Weight (pts)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={req.weight}
                        onChange={(e) => handleUpdateClause(req.id, 'weight', parseInt(e.target.value) || 10)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: REQUIRED BIDDER DOCUMENTS (FUNCTIONAL UPLOAD & MANAGEMENT) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-blue-900" />
                  <h2 className="text-base font-bold text-slate-900">{t('3. Required Bidder Documents')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('Select the documents that every bidder must submit for this tender.')}
                </p>
              </div>

              <div>
                {/* Real Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? t('Uploading Document...') : t('Upload Document')}</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Document List matching format requested */}
            <div className="space-y-2">
              {requiredDocs.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 space-y-1">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">{t('No required documents configured yet')}</p>
                  <p>{t('Click "Upload Document" above to configure reference templates.')}</p>
                </div>
              ) : (
                requiredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-900 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">
                          {doc.display_name}
                        </span>
                        {doc.is_mandatory && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                            {t('Mandatory')}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : 'Reference Spec'}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{t('Configured for Evaluation')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {/* Document Type Selector */}
                      <select
                        value={doc.document_type}
                        onChange={(e) => handleUpdateDocType(doc.id, e.target.value as DocumentType)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      >
                        {AVAILABLE_DOCUMENT_TYPES.map((dt) => (
                          <option key={dt.type} value={dt.type}>
                            {dt.label}
                          </option>
                        ))}
                      </select>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDocToDelete(doc)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer border border-rose-200"
                        title={t('Remove Document')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('Delete')}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>{t('Engine Verification Rule:')}</strong> {t('When a bidder submits their document packet, the compliance engine will automatically verify the presence and authenticity of each required document type listed above. Missing documents are marked')} <span className="font-mono font-bold text-rose-700">MISSING_DOC</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live RFP Preview & Action Dock */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('Live Tender Preview')}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t('Officer Ready')}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {tenderNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-2">
                  {title || 'Untitled Tender RFP'}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                  {department === 'CUSTOM' ? customDept || 'Custom Department' : department}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Estimated Budget:')}</span>
                  <span className="font-black text-slate-900">₹{budgetCr.toFixed(2)} Crores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Submission Deadline:')}</span>
                  <span className="font-bold text-slate-900">{deadlineFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Compliance Clauses:')}</span>
                  <span className="font-bold text-slate-900">{requirements.length} {t('Configured')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Required Bidder Documents:')}</span>
                  <span className="font-bold text-blue-900">{requiredDocs.length} {t('Mandatory Files')}</span>
                </div>
              </div>

              {/* Required Documents Pill Preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
                <span className="text-slate-500 font-bold block mb-1">{t('Required Types:')}</span>
                <div className="flex flex-wrap gap-1">
                  {requiredDocs.map((d) => (
                    <span
                      key={d.id}
                      className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px]"
                    >
                      {d.document_type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full py-3.5 px-4 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{t('Tender Created! Redirecting...')}</span>
                  </>
                ) : isSubmitting ? (
                  <span>{t('Publishing Tender to GeM...')}</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('Create Tender & Enforce Rules')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('Save Draft Session')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL: DELETE CONFIRMATION */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                {t('Remove this required document?')}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Are you sure you want to remove")} <strong className="text-slate-800">{docToDelete.display_name}</strong> ({docToDelete.document_type}) {t("from the tender's required document list?")}
              </p>
              {docToDelete.is_mandatory && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 text-left mt-2">
                  <span className="font-bold block">{t('Warning:')}</span>
                  {t('This document is marked as mandatory. Removing it means bidders will no longer be flagged as MISSING_DOC if they omit it.')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t('Remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
