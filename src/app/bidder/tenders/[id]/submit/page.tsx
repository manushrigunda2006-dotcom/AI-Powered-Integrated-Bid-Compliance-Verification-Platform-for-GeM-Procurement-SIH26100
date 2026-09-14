'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  FileCheck,
  Check,
  Clock,
  AlertCircle,
  FileSearch,
  X,
  Lock
} from 'lucide-react';
import { useBidderAuth } from '@/lib/authGuard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { tenderService } from '@/services/tenderService';
import { tenderRequiredDocumentService } from '@/services/tenderRequiredDocumentService';
import { storageService, ALLOWED_EXTENSIONS } from '@/services/storageService';
import {
  bidSubmissionService,
  UploadedBidderDoc,
  BidSubmission,
} from '@/services/bidSubmissionService';
import { Tender, TenderRequiredDocument, DocumentType } from '@/lib/types';
import { formatDate, formatIndianCurrency } from '@/lib/utils';

export default function BidderTenderSubmitPage() {
  const { session, isAuthenticated, isAuthorized, isLoading: authLoading } = useBidderAuth(true);
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();

  const tenderId = (params?.id as string) || 'tender-gem-2026-cloud';

  const [tender, setTender] = useState<Tender | null>(null);
  const [requiredDocs, setRequiredDocs] = useState<TenderRequiredDocument[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedBidderDoc[]>([]);
  const [submission, setSubmission] = useState<BidSubmission | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedBidderDoc | null>(null);

  // File input refs for each document type
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function loadData() {
      if (!session?.bidderId) return;
      setIsLoading(true);
      try {
        const [tenderData, reqDocs] = await Promise.all([
          tenderService.getTender(tenderId),
          tenderRequiredDocumentService.getRequiredDocuments(tenderId),
        ]);

        setTender(tenderData);
        setRequiredDocs(reqDocs);

        // Load existing uploads or finalized submission
        const existingSubmission = bidSubmissionService.getSubmission(session.bidderId, tenderId);
        setSubmission(existingSubmission);

        const currentUploads = bidSubmissionService.getUploadedDocuments(session.bidderId, tenderId);
        setUploadedDocs(currentUploads);

        // Log TENDER_VIEWED event
        if (tenderData) {
          bidSubmissionService.recordTenderViewed({
            bidderId: session.bidderId,
            bidderName: session.companyName,
            tenderId: tenderData.id,
            tenderNumber: tenderData.tender_number,
            tenderTitle: tenderData.title,
          });
        }
      } catch (err) {
        console.error('Error loading tender submission data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.bidderId) {
      loadData();
    }
  }, [session?.bidderId, session?.companyName, tenderId]);

  // Handle single document upload or replace
  const handleFileSelected = async (doc: TenderRequiredDocument, file: File) => {
    if (!session || !tender) return;

    // Reset previous error for this document
    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[doc.document_type];
      return next;
    });

    // Validate file
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setUploadErrors((prev) => ({
        ...prev,
        [doc.document_type]: validation.error || 'Invalid file format or size.',
      }));
      return;
    }

    setUploadingType(doc.document_type);

    try {
      const existingDoc = uploadedDocs.find((u) => u.documentType === doc.document_type);

      let resultDoc: UploadedBidderDoc;
      if (existingDoc) {
        resultDoc = await bidSubmissionService.replaceDocument({
          bidderId: session.bidderId,
          bidderName: session.companyName,
          tenderId: tender.id,
          tenderNumber: tender.tender_number,
          requiredDoc: doc,
          file,
          oldFileName: existingDoc.fileName,
        });
      } else {
        resultDoc = await bidSubmissionService.uploadDocument({
          bidderId: session.bidderId,
          bidderName: session.companyName,
          tenderId: tender.id,
          tenderNumber: tender.tender_number,
          requiredDoc: doc,
          file,
        });
      }

      setUploadedDocs((prev) => {
        const filtered = prev.filter((d) => d.documentType !== doc.document_type);
        return [...filtered, resultDoc];
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error uploading document';
      setUploadErrors((prev) => ({
        ...prev,
        [doc.document_type]: message,
      }));
    } finally {
      setUploadingType(null);
    }
  };

  // Handle document removal
  const handleRemoveDoc = async (docType: DocumentType, fileName: string) => {
    if (!session || !tender) return;

    try {
      await bidSubmissionService.removeDocument({
        bidderId: session.bidderId,
        bidderName: session.companyName,
        tenderId: tender.id,
        tenderNumber: tender.tender_number,
        documentType: docType,
        fileName,
      });

      setUploadedDocs((prev) => prev.filter((d) => d.documentType !== docType));
      setUploadErrors((prev) => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
    } catch (err) {
      console.error('Error removing document:', err);
    }
  };

  // Final submit bid action
  const handleConfirmSubmitBid = async () => {
    if (!session || !tender) return;
    setIsSubmitting(true);

    try {
      const newSubmission = await bidSubmissionService.submitBid({
        bidderSession: session,
        tender,
        uploadedDocs,
      });

      setSubmission(newSubmission);
      setIsConfirmDialogOpen(false);
    } catch (err) {
      console.error('Failed to submit bid:', err);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute progress
  const mandatoryDocs = requiredDocs.filter((d) => d.is_mandatory);
  const uploadedMandatoryDocs = mandatoryDocs.filter((m) =>
    uploadedDocs.some((u) => u.documentType === m.document_type)
  );

  const isAllMandatoryUploaded =
    mandatoryDocs.length > 0 &&
    mandatoryDocs.every((m) => uploadedDocs.some((u) => u.documentType === m.document_type));

  const progressPercentage =
    mandatoryDocs.length > 0
      ? Math.round((uploadedMandatoryDocs.length / mandatoryDocs.length) * 100)
      : 0;

  if (authLoading || !isAuthorized || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">{t('Verifying Bidder Credentials...', 'Verifying Bidder Credentials...')}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !tender) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">{t('tender.loading_tender', 'Loading Tender & Required Documents...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/bidder/tenders"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            title="Back to Available Tenders"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-900 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                {t('bidder.bid_submission_title', 'Bid Submission')}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{t('GFR 2017 Verified', 'GFR 2017 Verified')}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {t('bidder.upload_docs_title', 'Upload Required Bid Documents')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('Submit your compliance dossier for official evaluation by the Government Procurement Authority.', 'Submit your compliance dossier for official evaluation by the Government Procurement Authority.')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/bidder/dashboard"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-900 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {t('nav.bidder_dashboard', 'Bidder Dashboard')}
          </Link>
        </div>
      </div>

      {/* Tender Details Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                {tender.tender_number}
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                {t('status.active', 'Active RFP')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('Bidder:', 'Bidder:')} <strong className="text-slate-800">{session.companyName}</strong> (GSTIN: <span className="font-mono">{session.gstNumber}</span>)
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{tender.title}</h2>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{tender.department}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('tender.budget', 'Estimated Budget')}
              </span>
              <span className="text-sm font-black text-slate-900">
                {tender.budget_formatted || formatIndianCurrency(tender.estimated_budget)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('Closing Deadline', 'Closing Deadline')}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {formatDate(tender.deadline)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Banner (if already submitted) */}
      {submission && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  {t('bidder.bid_submitted_success', 'Bid Submitted Successfully')}
                </h3>
                <p className="text-xs text-emerald-800">
                  {t('Tender ID:', 'Tender ID:')} <strong className="font-mono">{tender.tender_number}</strong> • Submitted: {new Date(submission.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <span className="bg-emerald-200 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {submission.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t('Current Status', 'Current Status')}</span>
              <span className="font-bold text-emerald-900">{submission.complianceStatus}</span>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t('Dossier Packet', 'Dossier Packet')}</span>
              <span className="font-bold text-emerald-900">{submission.documents.length} {t('Files', 'Files')}</span>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t('Entity Cross-Check', 'Entity Cross-Check')}</span>
              <span className="font-bold text-emerald-900">
                {submission.crossEntityReport?.isMatch ? '✅ Coherent Entity Names' : '⚠️ Name Variance Flagged'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {t('bidder.submission_progress_label', 'Document Submission Progress')}
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {uploadedMandatoryDocs.length} / {mandatoryDocs.length} Mandatory Documents Uploaded
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isAllMandatoryUploaded
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isAllMandatoryUploaded
                ? t('Ready for Official Submission', 'Ready for Official Submission')
                : t('Pending Mandatory Files', 'Pending Mandatory Files')}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isAllMandatoryUploaded ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{progressPercentage}% Completed</span>
            <span>{mandatoryDocs.length - uploadedMandatoryDocs.length} Mandatory Files Remaining</span>
          </div>
        </div>

        {/* Quick Check Indicators */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('Uploaded:', 'Uploaded:')}
            </span>
            {uploadedDocs.length === 0 ? (
              <p className="text-slate-400 text-xs italic">{t('No documents uploaded yet', 'No documents uploaded yet')}</p>
            ) : (
              <div className="space-y-1">
                {uploadedDocs.map((u) => (
                  <div key={u.id} className="flex items-center space-x-1.5 text-emerald-700 font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{u.displayName} ({u.documentType})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('Pending Mandatory:', 'Pending Mandatory:')}
            </span>
            {mandatoryDocs.filter((m) => !uploadedDocs.some((u) => u.documentType === m.document_type)).length === 0 ? (
              <p className="text-emerald-600 text-xs font-bold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>{t('All mandatory documents have been provided', 'All mandatory documents have been provided')}</span>
              </p>
            ) : (
              <div className="space-y-1">
                {mandatoryDocs
                  .filter((m) => !uploadedDocs.some((u) => u.documentType === m.document_type))
                  .map((m) => (
                    <div key={m.id} className="flex items-center space-x-1.5 text-amber-700 font-medium text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">{m.display_name.replace('.pdf', '')} ({m.document_type})</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents Upload Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-900" />
            <h3 className="text-lg font-black text-slate-900">
              {t('bidder.required_documents_list', 'Required Document Submissions')}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Accepted Formats: {ALLOWED_EXTENSIONS.join(', ')} • Max Size: 10 MB
          </span>
        </div>

        <div className="space-y-3">
          {requiredDocs.map((reqDoc, index) => {
            const uploaded = uploadedDocs.find((u) => u.documentType === reqDoc.document_type);
            const isUploading = uploadingType === reqDoc.document_type;
            const errorMsg = uploadErrors[reqDoc.document_type];

            return (
              <div
                key={reqDoc.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  uploaded
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : reqDoc.is_mandatory
                    ? 'border-slate-200 hover:border-blue-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Document Meta */}
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        Doc {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                        {reqDoc.document_type}
                      </span>
                      {reqDoc.is_mandatory ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                          {t('tender.mandatory', 'Mandatory')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {t('tender.optional', 'Optional')}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {reqDoc.display_name.replace('.pdf', '').replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Specification file: <span className="font-mono font-medium">{reqDoc.display_name}</span>
                    </p>

                    {/* Error Notice */}
                    {errorMsg && (
                      <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-1.5 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Uploaded State */}
                  <div className="shrink-0 flex items-center space-x-2">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[reqDoc.document_type] = el;
                      }}
                      accept={ALLOWED_EXTENSIONS.join(',')}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelected(reqDoc, file);
                          e.target.value = '';
                        }
                      }}
                    />

                    {uploaded ? (
                      /* Uploaded State Box */
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="truncate max-w-[200px]">{uploaded.fileName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {(uploaded.fileSize / 1024).toFixed(1)} KB • Uploaded ✓
                          </p>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(uploaded)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Preview Document Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('common.preview', 'Preview')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[reqDoc.document_type]?.click()}
                            disabled={isUploading}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Replace Document with new file"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                            <span>{t('tender.replace', 'Replace')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(reqDoc.document_type, uploaded.fileName)}
                            className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Not Uploaded / Upload Action */
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[reqDoc.document_type]?.click()}
                        disabled={isUploading}
                        className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                        <span>{isUploading ? t('common.loading', 'Uploading...') : t('Upload Document', 'Upload Document')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Action Dock */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">
            {isAllMandatoryUploaded
              ? t('All Mandatory Documents Attached', 'All Mandatory Documents Attached')
              : t('Mandatory Documents Required', 'Mandatory Documents Required')}
          </h4>
          <p className="text-xs text-slate-500">
            {isAllMandatoryUploaded
              ? t('Click below to submit your bid. Deterministic compliance and cross-document verification will be executed.', 'Click below to submit your bid. Deterministic compliance and cross-document verification will be executed.')
              : t('Please upload all mandatory documents to enable official bid submission.', 'Please upload all mandatory documents to enable official bid submission.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmDialogOpen(true)}
          disabled={!isAllMandatoryUploaded || isSubmitting}
          className={`px-6 py-3 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 ${
            isAllMandatoryUploaded && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? t('Submitting...', 'Submitting...') : t('Submit Bid', 'Submit Bid')}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {t('Submit Bid for Compliance Verification?', 'Submit Bid for Compliance Verification?')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('All mandatory documents have been uploaded. Submit your bid for compliance verification?', 'All mandatory documents have been uploaded. Submit your bid for compliance verification?')}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>{t('Tender ID:', 'Tender ID:')}</span>
                <span className="font-mono font-bold text-slate-800">{tender.tender_number}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Total Documents:', 'Total Documents:')}</span>
                <span className="font-bold text-slate-800">{uploadedDocs.length} {t('Files', 'Files')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Bidder:', 'Bidder:')}</span>
                <span className="font-bold text-slate-800">{session.companyName}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitBid}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('Submitting...', 'Submitting...')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('Submit Bid', 'Submit Bid')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs">
                    {previewDoc.fileName}
                  </h3>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.2 rounded-md font-bold">
                    {previewDoc.documentType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('File Name:', 'File Name:')}</span>
                <span className="font-mono font-semibold text-slate-800">{previewDoc.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('File Size:', 'File Size:')}</span>
                <span className="font-semibold text-slate-800">{(previewDoc.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Uploaded At:', 'Uploaded At:')}</span>
                <span className="font-semibold text-slate-800">
                  {new Date(previewDoc.uploadedAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Extracted Legal Entity:', 'Extracted Legal Entity:')}</span>
                <span className="font-semibold text-slate-800">{previewDoc.extractedEntityName || session.companyName}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-blue-900 block">{t('Section 65B certified evidence trail', 'Digital Chain of Custody')}</span>
              <p className="text-[11px] leading-relaxed">
                {t('Section 65B certified evidence trail', 'Document verified under GFR 2017 & Indian Evidence Act Section 65B requirements. Cryptographic hash recorded upon upload.')}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                {t('common.close', 'Close Preview')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
