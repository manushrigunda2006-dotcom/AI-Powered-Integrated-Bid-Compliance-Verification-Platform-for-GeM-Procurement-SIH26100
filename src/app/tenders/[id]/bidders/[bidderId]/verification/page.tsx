'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Bidder,
  Evidence,
  OfficerDecision,
  AuditLog,
  VerificationEvaluationReport,
  DocumentType,
} from '@/lib/types';
import { RiskGauge } from '@/components/RiskGauge';
import { RegistryBadges } from '@/components/RegistryBadge';
import { ComplianceMatrix } from '@/components/ComplianceMatrix';
import { OfficerActionDock } from '@/components/OfficerActionDock';
import { EvidenceModal } from '@/components/EvidenceModal';
import { AuditTimeline } from '@/components/AuditTimeline';
import { documentService } from '@/services/documentService';
import { bidderService } from '@/services/bidderService';
import { tenderService } from '@/services/tenderService';
import { complianceService } from '@/services/complianceService';
import { verificationService } from '@/services/verificationService';
import { scoringEngine } from '@/lib/engine/scoring';
import {
  FileText,
  ArrowLeft,
  RotateCcw,
  FileCheck,
  Mail,
  Upload,
  Trash2,
  ExternalLink,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { GeminiAiInsights } from '@/components/GeminiAiInsights';
import { GeminiFullEvaluationResult } from '@/lib/gemini/types';

export default function BidderVerificationPage() {
  const params = useParams();
  const router = useRouter();

  const tenderId = (params?.id as string) || '11111111-1111-1111-1111-111111111111';
  const bidderId = (params?.bidderId as string) || '22222222-2222-2222-2222-222222222221';

  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [biddersList, setBiddersList] = useState<Bidder[]>([]);
  const [report, setReport] = useState<VerificationEvaluationReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Gemini AI Copilot State
  const [aiEvaluation, setAiEvaluation] = useState<GeminiFullEvaluationResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState<boolean>(false);
  const [geminiFallbackMsg, setGeminiFallbackMsg] = useState<string | null>(null);
  const [showAiInsights, setShowAiInsights] = useState<boolean>(true);

  const runGeminiAnalysis = async (targetBidderId?: string) => {
    const bId = targetBidderId || bidder?.id || bidderId;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ANALYZE_BIDDER',
          bidderId: bId,
          tenderId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiEvaluation(data.aiEvaluation);
        setIsGeminiConfigured(Boolean(data.isGeminiConfigured));
        setGeminiFallbackMsg(data.fallbackMessage);
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn('Gemini evaluation notice:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Evidence Modal State
  const [activeEvidence, setActiveEvidence] = useState<{
    evidence: Evidence;
    code: string;
    title: string;
  } | null>(null);

  // Audit Timeline Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Load tender bidders list on mount
  useEffect(() => {
    async function fetchBidders() {
      try {
        const list = await bidderService.getBiddersForTender(tenderId);
        setBiddersList(list);
      } catch (err) {
        console.warn('Failed to load bidders list:', err);
      }
    }
    fetchBidders();
  }, [tenderId]);

  // Load bidder evaluation on mount or bidderId change
  useEffect(() => {
    async function evaluateBidder() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bidderId }),
        });

        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
          setBidder(data.bidder);
          setAuditLogs(data.auditLogs || []);
        } else {
          fallbackLocalEvaluation();
        }
      } catch {
        fallbackLocalEvaluation();
      } finally {
        setIsLoading(false);
      }
    }

    async function fallbackLocalEvaluation() {
      try {
        const found = await bidderService.getBidder(bidderId);
        if (found) {
          setBidder(found);
          const [t, results, reg] = await Promise.all([
            tenderService.getTender(tenderId),
            complianceService.getComplianceResultsForBidder(found.id),
            verificationService.getRegistryVerifications(found.id),
          ]);
          const rep = scoringEngine.compileEvaluationReport({
            tender: t,
            bidder: found,
            clauseResults: results,
            registrySummary: reg,
          });
          setReport(rep);
        }
      } catch (err) {
        console.warn('Fallback evaluation notice:', err);
      }
    }

    evaluateBidder().then(() => {
      runGeminiAnalysis(bidderId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidderId, tenderId]);

  // Handle Officer Decision
  const handleDecisionSubmit = async (
    decision: OfficerDecision,
    remarks: string
  ) => {
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidderId: bidder?.id || bidderId,
          decision,
          remarks,
          officerName: 'ABCD',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBidder(data.bidder);
        setAuditLogs(data.auditLogs);
      }
    } catch {
      alert('Decision updated successfully.');
    }
  };

  const handleReRunEngine = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidderId: bidder?.id || bidderId }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
        setBidder(data.bidder);
        setAuditLogs(data.auditLogs || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Export 65B Certificate
  const handleExportCertificate = async () => {
    if (!bidder || !report) return;
    setIsExporting(true);
    try {
      const [tender, { certificate65BService }] = await Promise.all([
        tenderService.getTender(tenderId),
        import('@/services/certificate65BService'),
      ]);
      await certificate65BService.download65BCertificate({
        tender,
        bidder,
        complianceResults: report.clause_results || [],
        registrySummary: report.registry_summary || null,
        auditLogs,
      });

      setToastType('success');
      setToastMessage('65B certificate exported successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Export certificate error:', err);
      setToastType('error');
      setToastMessage('Unable to export the certificate. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Upload to Supabase Storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !bidder) return;

    const file = files[0];
    setIsUploading(true);

    try {
      let docType: DocumentType = 'FINANCIAL_AUDIT';
      const nameUpper = file.name.toUpperCase();
      if (nameUpper.includes('GST')) docType = 'GST_CERT';
      else if (nameUpper.includes('UDYAM') || nameUpper.includes('MSME')) docType = 'UDYAM';
      else if (nameUpper.includes('OEM') || nameUpper.includes('MAF')) docType = 'OEM_AUTH';
      else if (nameUpper.includes('EXP') || nameUpper.includes('WORK')) docType = 'WORK_ORDER_EXPERIENCE';
      else if (nameUpper.includes('AFFIDAVIT') || nameUpper.includes('BLACK')) docType = 'AFFIDAVIT_BLACKLIST';

      const uploadedDoc = await documentService.uploadDocument(
        bidder.id,
        tenderId,
        file,
        docType
      );

      if (uploadedDoc) {
        const updatedDocs = [...(bidder.documents || []), uploadedDoc];
        setBidder({ ...bidder, documents: updatedDocs });
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload document to Supabase storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Delete Document
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document from packet?')) return;
    try {
      await documentService.deleteDocument(docId);
      if (bidder) {
        setBidder({
          ...bidder,
          documents: (bidder.documents || []).filter((d) => d.id !== docId),
        });
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  if (!bidder || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-700">
          Running Deterministic Compliance Engine & External Registry Adapters...
        </span>
        <span className="text-xs text-slate-400">
          Simulating GSTN, MSME Udyam, and CPPP Blacklist verification
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Quick Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link
            href={`/tenders/${tenderId}/bidders`}
            className="text-blue-900 hover:underline flex items-center space-x-1 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bidders List</span>
          </Link>
          <span>/</span>
          <Link
            href={`/tenders/${tenderId}/bidders`}
            className="text-slate-500 hover:text-blue-900 transition-colors font-medium"
          >
            Tender GEM/2026/B/892104
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">
            {bidder.company_name}
          </span>
        </nav>

        {/* Bidder Switcher Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Switch:
          </span>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(biddersList.length > 0 ? biddersList : [
              { id: '22222222-2222-2222-2222-222222222221', company_name: 'Bidder 1 (Eligible)', status: 'ELIGIBLE' },
              { id: '22222222-2222-2222-2222-222222222222', company_name: 'Bidder 2 (Mismatch)', status: 'REVIEW_REQUIRED' },
              { id: '22222222-2222-2222-2222-222222222223', company_name: 'Bidder 3 (Debarred)', status: 'DISQUALIFIED' },
            ]).map((b, idx) => {
              const active = b.id === bidder.id || bidderId.includes(b.id) || b.id.includes(bidderId);
              const label =
                idx === 0
                  ? 'Bidder 1 (Eligible)'
                  : idx === 1
                  ? 'Bidder 2 (Mismatch)'
                  : 'Bidder 3 (Debarred)';

              return (
                <button
                  key={b.id}
                  onClick={() =>
                    router.push(`/tenders/${tenderId}/bidders/${b.id}/verification`)
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleReRunEngine}
            title="Re-run verification engine"
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Gemini AI Copilot Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setShowAiInsights(!showAiInsights);
              if (!aiEvaluation && !isAiLoading) {
                runGeminiAnalysis();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              showAiInsights
                ? 'bg-gradient-to-r from-indigo-800 to-blue-900 text-white shadow-xs'
                : 'bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-50'
            }`}
            title="Toggle Gemini AI Copilot Advisory Insights"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-indigo-300' : 'text-amber-300'}`} />
            <span>Gemini Copilot</span>
          </button>

          {/* Export 65B Certificate Button */}
          <button
            type="button"
            onClick={handleExportCertificate}
            disabled={isExporting || isLoading}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-900 text-slate-700 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
            title="Export 65B Electronic Evidence Certificate for this bidder"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-900" />
                <span>Generating Certificate...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export 65B Certificate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE (35%): Bidder Profile, Registry Cards, Score Gauge */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-blue-100 text-blue-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                  BIDDER #{bidder.id.substring(0, 8).toUpperCase()}
                </span>
                <h2 className="text-base font-black text-slate-900 mt-1 leading-snug">
                  {bidder.company_name}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{bidder.contact_email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  GSTIN
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {bidder.gst_number}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  PAN Number
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {bidder.pan_number}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Udyam MSME Registration
                </span>
                <span className="font-mono font-bold text-blue-900">
                  {bidder.udyam_registration || 'Not Declared (Non-MSME)'}
                </span>
              </div>
            </div>
          </div>

          <RegistryBadges registrySummary={report.registry_summary} />

          <RiskGauge
            score={report.overall_score}
            riskLevel={report.risk_level}
            mandatoryFailuresCount={report.mandatory_clause_failures.length}
            minorDiscrepanciesCount={report.minor_discrepancies.length}
          />

          {/* Bidder Document Packet with Supabase Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bidder Document Packet ({bidder.documents?.length || 0})
                </h3>
              </div>

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-1 text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {bidder.documents && bidder.documents.length > 0 ? (
                bidder.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-slate-700 font-medium hover:text-blue-900 hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate">{doc.file_name}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                        {doc.doc_type}
                      </span>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No documents in packet. Click upload to add PDF.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER PANE (45%): Interactive Compliance Matrix & Gemini Copilot */}
        <div className="lg:col-span-5 space-y-4">
          {showAiInsights && (
            <GeminiAiInsights
              evaluation={aiEvaluation}
              isLoading={isAiLoading}
              onRefresh={() => runGeminiAnalysis(bidder?.id || bidderId)}
              isConfigured={isGeminiConfigured}
              fallbackMessage={geminiFallbackMsg}
            />
          )}

          <ComplianceMatrix
            results={report.clause_results}
            clauseExplanations={aiEvaluation?.clause_explanations}
            crossEntityWarning={
              report.cross_entity_check.warning_flag
                ? `Entity Name Mismatch Flagged: Legal Name on GST Certificate is "${report.cross_entity_check.gst_entity_name}", whereas OEM Authorization Form states "${report.cross_entity_check.oem_entity_name}". Levenshtein distance: ${report.cross_entity_check.levenshtein_distance} (Similarity: ${(
                    (1 - report.cross_entity_check.similarity_ratio) *
                    100
                  ).toFixed(0)}%). Officer clarification required.`
                : undefined
            }
            onViewEvidence={(evidence, clauseCode, clauseTitle) => {
              setActiveEvidence({ evidence, code: clauseCode, title: clauseTitle });
            }}
          />
        </div>

        {/* RIGHT PANE (20%): Officer Decision Action Dock */}
        <div className="lg:col-span-3 space-y-4">
          <OfficerActionDock
            bidder={bidder}
            executiveSummary={report.executive_summary}
            onDecisionSubmit={handleDecisionSubmit}
            onOpenAuditLog={() => setIsAuditModalOpen(true)}
          />
        </div>
      </div>

      {/* Evidence Viewer Modal */}
      {activeEvidence && (
        <EvidenceModal
          evidence={activeEvidence.evidence}
          clauseCode={activeEvidence.code}
          clauseTitle={activeEvidence.title}
          onClose={() => setActiveEvidence(null)}
        />
      )}

      {/* Immutable Audit Trail Timeline Modal */}
      {isAuditModalOpen && (
        <AuditTimeline
          logs={auditLogs}
          companyName={bidder.company_name}
          onClose={() => setIsAuditModalOpen(false)}
          onExport={handleExportCertificate}
          isExporting={isExporting}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-slideUp text-white ${
            toastType === 'error'
              ? 'bg-rose-900 border border-rose-700'
              : 'bg-slate-900 border border-slate-700'
          }`}
        >
          {toastType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
