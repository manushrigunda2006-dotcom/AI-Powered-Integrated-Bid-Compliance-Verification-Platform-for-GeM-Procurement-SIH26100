import { DocumentType, TenderRequiredDocument, RiskLevel, OfficerDecision } from '../lib/types';
import { storageService } from './storageService';
import { auditService } from './auditService';
import { tenderRequiredDocumentService } from './tenderRequiredDocumentService';
import { tenderService } from './tenderService';
import { crossVerifyEntities, CrossEntityVerificationReport } from '../lib/normalizers/entity';
import { BidderSession } from '../lib/authGuard';
import { MOCK_BIDDERS } from '../lib/mock-data/tender-seed';

export interface UploadedBidderDoc {
  id: string;
  requiredDocId: string;
  documentType: DocumentType;
  displayName: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  fileUrl: string;
  status: 'UPLOADED';
  extractedEntityName: string;
}

export type SubmissionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'QUALIFIED'
  | 'CLARIFICATION_REQUESTED'
  | 'DISQUALIFIED';

export interface BidSubmission {
  id: string;
  bidderId: string;
  bidderName: string;
  gstNumber: string;
  panNumber: string;
  tenderId: string;
  tenderNumber: string;
  tenderTitle: string;
  department: string;
  estimatedBudget: string;
  deadline: string;
  submittedAt: string;
  status: SubmissionStatus;
  complianceStatus: string;
  documents: UploadedBidderDoc[];
  crossEntityReport?: CrossEntityVerificationReport;
}

const SUBMISSIONS_STORAGE_KEY = 'gem_bidder_submissions';
const DRAFTS_STORAGE_KEY = 'gem_bidder_draft_docs';

function getStoredSubmissions(): BidSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSubmissions(submissions: BidSubmission[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.warn('Notice saving bidder submissions to localStorage:', err);
  }
}

function getStoredDrafts(): Record<string, UploadedBidderDoc[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredDrafts(drafts: Record<string, UploadedBidderDoc[]>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('Notice saving bidder draft docs to localStorage:', err);
  }
}

export const bidSubmissionService = {
  /**
   * Get draft or uploaded documents for a bidder on a specific tender
   */
  getUploadedDocuments(bidderId: string, tenderId: string): UploadedBidderDoc[] {
    // 1. Check finalized submission first
    const submissions = getStoredSubmissions();
    const existing = submissions.find(
      (s) => s.bidderId === bidderId && s.tenderId === tenderId
    );
    if (existing && existing.documents && existing.documents.length > 0) {
      return existing.documents;
    }

    // 2. Check in-progress drafts
    const drafts = getStoredDrafts();
    const draftKey = `${bidderId}_${tenderId}`;
    if (drafts[draftKey]) {
      return drafts[draftKey];
    }

    // 3. Check if bidder has default mock documents for the primary tender
    if (tenderId === 'tender-gem-2026-cloud' || tenderId.includes('cloud')) {
      const mockBidder = MOCK_BIDDERS.find((b) => b.id === bidderId) || MOCK_BIDDERS[0];
      if (mockBidder?.documents && mockBidder.documents.length > 0) {
        return mockBidder.documents.map((d, index) => ({
          id: d.id || `doc-${index}`,
          requiredDocId: `req-doc-0${index + 1}`,
          documentType: d.doc_type,
          displayName: d.file_name.replace(/_/g, ' ').replace('.pdf', ''),
          fileName: d.file_name,
          fileSize: (d.page_count || 3) * 1024 * 160,
          uploadedAt: d.upload_date || mockBidder.submission_date,
          fileUrl: d.file_url,
          status: 'UPLOADED',
          extractedEntityName: (d.parsed_metadata?.extracted_entity_name as string) || mockBidder.company_name,
        }));
      }
    }

    return [];
  },

  /**
   * Upload a new document for a specific required document slot
   */
  async uploadDocument(params: {
    bidderId: string;
    bidderName: string;
    tenderId: string;
    tenderNumber: string;
    requiredDoc: TenderRequiredDocument;
    file: File;
  }): Promise<UploadedBidderDoc> {
    const { bidderId, bidderName, tenderId, tenderNumber, requiredDoc, file } = params;

    // Validate file
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file uploaded');
    }

    const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fileUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : `/docs/uploads/${file.name}`;

    const newDoc: UploadedBidderDoc = {
      id: docId,
      requiredDocId: requiredDoc.id,
      documentType: requiredDoc.document_type,
      displayName: requiredDoc.display_name.replace('.pdf', '').replace(/_/g, ' '),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      fileUrl,
      status: 'UPLOADED',
      extractedEntityName: bidderName,
    };

    // Save to drafts
    const drafts = getStoredDrafts();
    const draftKey = `${bidderId}_${tenderId}`;
    const existing = drafts[draftKey] || [];
    const filtered = existing.filter((d) => d.documentType !== requiredDoc.document_type);
    filtered.push(newDoc);
    drafts[draftKey] = filtered;
    saveStoredDrafts(drafts);

    // Record audit log
    try {
      await auditService.recordUserAction({
        action: 'DOCUMENT_UPLOADED',
        userName: bidderName,
        role: 'Bidder',
        tenderId,
        bidderId,
        actionDescription: `Uploaded ${requiredDoc.document_type} document: ${file.name} (${(file.size / 1024).toFixed(1)} KB) for Tender ${tenderNumber}.`,
        metadata: {
          document_id: docId,
          document_name: file.name,
          document_type: requiredDoc.document_type,
          file_size_bytes: file.size,
          tender_id: tenderId,
          tender_number: tenderNumber,
          bidder_id: bidderId,
        },
      });
    } catch (err) {
      console.warn('Notice recording document upload audit event:', err);
    }

    return newDoc;
  },

  /**
   * Replace an already uploaded document
   */
  async replaceDocument(params: {
    bidderId: string;
    bidderName: string;
    tenderId: string;
    tenderNumber: string;
    requiredDoc: TenderRequiredDocument;
    file: File;
    oldFileName?: string;
  }): Promise<UploadedBidderDoc> {
    const { bidderId, bidderName, tenderId, tenderNumber, requiredDoc, file, oldFileName } = params;

    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file uploaded');
    }

    const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fileUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : `/docs/uploads/${file.name}`;

    const newDoc: UploadedBidderDoc = {
      id: docId,
      requiredDocId: requiredDoc.id,
      documentType: requiredDoc.document_type,
      displayName: requiredDoc.display_name.replace('.pdf', '').replace(/_/g, ' '),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      fileUrl,
      status: 'UPLOADED',
      extractedEntityName: bidderName,
    };

    const drafts = getStoredDrafts();
    const draftKey = `${bidderId}_${tenderId}`;
    const existing = drafts[draftKey] || [];
    const filtered = existing.filter((d) => d.documentType !== requiredDoc.document_type);
    filtered.push(newDoc);
    drafts[draftKey] = filtered;
    saveStoredDrafts(drafts);

    try {
      await auditService.recordUserAction({
        action: 'DOCUMENT_REPLACED',
        userName: bidderName,
        role: 'Bidder',
        tenderId,
        bidderId,
        actionDescription: `Replaced ${requiredDoc.document_type} document: ${oldFileName || 'previous file'} with ${file.name} for Tender ${tenderNumber}.`,
        metadata: {
          document_id: docId,
          old_file_name: oldFileName,
          new_file_name: file.name,
          document_type: requiredDoc.document_type,
          file_size_bytes: file.size,
          tender_id: tenderId,
          tender_number: tenderNumber,
          bidder_id: bidderId,
        },
      });
    } catch (err) {
      console.warn('Notice recording document replacement audit event:', err);
    }

    return newDoc;
  },

  /**
   * Remove an uploaded document
   */
  async removeDocument(params: {
    bidderId: string;
    bidderName: string;
    tenderId: string;
    tenderNumber: string;
    documentType: DocumentType;
    fileName: string;
  }): Promise<boolean> {
    const { bidderId, bidderName, tenderId, tenderNumber, documentType, fileName } = params;

    const drafts = getStoredDrafts();
    const draftKey = `${bidderId}_${tenderId}`;
    const existing = drafts[draftKey] || [];
    drafts[draftKey] = existing.filter((d) => d.documentType !== documentType);
    saveStoredDrafts(drafts);

    try {
      await auditService.recordUserAction({
        action: 'DOCUMENT_REMOVED',
        userName: bidderName,
        role: 'Bidder',
        tenderId,
        bidderId,
        actionDescription: `Removed ${documentType} document: ${fileName} from Tender ${tenderNumber}.`,
        metadata: {
          file_name: fileName,
          document_type: documentType,
          tender_id: tenderId,
          tender_number: tenderNumber,
          bidder_id: bidderId,
        },
      });
    } catch (err) {
      console.warn('Notice recording document removal audit event:', err);
    }

    return true;
  },

  /**
   * Record when a bidder views a tender RFP
   */
  async recordTenderViewed(params: {
    bidderId: string;
    bidderName: string;
    tenderId: string;
    tenderNumber: string;
    tenderTitle: string;
  }): Promise<void> {
    try {
      await auditService.recordUserAction({
        action: 'TENDER_VIEWED',
        userName: params.bidderName,
        role: 'Bidder',
        tenderId: params.tenderId,
        bidderId: params.bidderId,
        actionDescription: `Bidder viewed RFP specifications for Tender ${params.tenderNumber} ("${params.tenderTitle}").`,
        metadata: {
          tender_id: params.tenderId,
          tender_number: params.tenderNumber,
          tender_title: params.tenderTitle,
          bidder_id: params.bidderId,
        },
      });
    } catch (err) {
      console.warn('Notice recording tender viewed event:', err);
    }
  },

  /**
   * Perform Cross-Document Entity Name Verification
   */
  performCrossEntityCheck(bidderName: string, docs: UploadedBidderDoc[]): CrossEntityVerificationReport {
    // Collect entity names from uploaded docs or filename cues
    const namesToCheck: string[] = [bidderName];
    docs.forEach((d) => {
      if (d.extractedEntityName) namesToCheck.push(d.extractedEntityName);
    });

    if (namesToCheck.length < 2) {
      return crossVerifyEntities(bidderName, bidderName, 'GST Registration', 'Tender Registration');
    }

    // Run Levenshtein check between bidderName and the other document entities
    return crossVerifyEntities(namesToCheck[0], namesToCheck[1], 'GST Certificate', 'OEM Authorization');
  },

  /**
   * Submit the bid for verification
   */
  async submitBid(params: {
    bidderSession: BidderSession;
    tender: {
      id: string;
      tender_number: string;
      title: string;
      department: string;
      budget_formatted?: string;
      deadline?: string;
      required_documents?: TenderRequiredDocument[];
    };
    uploadedDocs: UploadedBidderDoc[];
  }): Promise<BidSubmission> {
    const { bidderSession, tender, uploadedDocs } = params;

    const crossEntityReport = this.performCrossEntityCheck(bidderSession.companyName, uploadedDocs);

    const submissionId = `SUB-${tender.tender_number.replace(/\//g, '-')}-${bidderSession.bidderId.toUpperCase()}`;
    const now = new Date().toISOString();

    const submission: BidSubmission = {
      id: submissionId,
      bidderId: bidderSession.bidderId,
      bidderName: bidderSession.companyName,
      gstNumber: bidderSession.gstNumber,
      panNumber: bidderSession.panNumber,
      tenderId: tender.id,
      tenderNumber: tender.tender_number,
      tenderTitle: tender.title,
      department: tender.department,
      estimatedBudget: tender.budget_formatted || '₹45.00 Crores',
      deadline: tender.deadline || '2026-10-15T18:00:00Z',
      submittedAt: now,
      status: 'SUBMITTED',
      complianceStatus: 'Awaiting Compliance Verification',
      documents: uploadedDocs,
      crossEntityReport,
    };

    // Save to persistent storage
    const existing = getStoredSubmissions();
    const updated = [submission, ...existing.filter((s) => s.id !== submission.id)];
    saveStoredSubmissions(updated);

    // Clear drafts for this tender
    const drafts = getStoredDrafts();
    delete drafts[`${bidderSession.bidderId}_${tender.id}`];
    saveStoredDrafts(drafts);

    // Record audit event
    try {
      await auditService.recordUserAction({
        action: 'BID_SUBMITTED',
        userName: bidderSession.companyName,
        role: 'Bidder',
        tenderId: tender.id,
        bidderId: bidderSession.bidderId,
        actionDescription: `Bid submitted successfully for Tender ${tender.tender_number} ("${tender.title}"). Total ${uploadedDocs.length} documents uploaded. Status: Awaiting Compliance Verification.`,
        metadata: {
          submission_id: submissionId,
          tender_id: tender.id,
          tender_number: tender.tender_number,
          tender_title: tender.title,
          bidder_id: bidderSession.bidderId,
          bidder_name: bidderSession.companyName,
          gstin: bidderSession.gstNumber,
          submitted_at: now,
          documents_count: uploadedDocs.length,
          status: 'SUBMITTED',
          cross_entity_check: crossEntityReport.status,
        },
      });
    } catch (err) {
      console.warn('Notice recording bid submission audit event:', err);
    }

    return submission;
  },

  /**
   * Get submission for a bidder on a specific tender
   */
  getSubmission(bidderId: string, tenderId: string): BidSubmission | null {
    const submissions = getStoredSubmissions();
    const found = submissions.find((s) => s.bidderId === bidderId && s.tenderId === tenderId);
    if (found) return found;

    // Check if bidder is in mock data for primary tender
    if (tenderId === 'tender-gem-2026-cloud' || tenderId.includes('cloud')) {
      const mockBidder = MOCK_BIDDERS.find((b) => b.id === bidderId) || MOCK_BIDDERS[0];
      const isLowRisk = mockBidder.risk_level === 'LOW';
      return {
        id: `SUB-GEM-2026-B-892104-${mockBidder.id.toUpperCase()}`,
        bidderId: mockBidder.id,
        bidderName: mockBidder.company_name,
        gstNumber: mockBidder.gst_number,
        panNumber: mockBidder.pan_number,
        tenderId: 'tender-gem-2026-cloud',
        tenderNumber: 'GEM/2026/B/892104',
        tenderTitle: 'Procurement of High-End Enterprise Cloud Servers & Networking Hardware for National Data Centers',
        department: 'Department of Public Procurement & IT Infrastructure',
        estimatedBudget: '₹4.50 Crores',
        deadline: '2026-10-15T18:00:00Z',
        submittedAt: mockBidder.submission_date,
        status: isLowRisk ? 'QUALIFIED' : mockBidder.officer_decision === 'CLARIFICATION_REQUESTED' ? 'CLARIFICATION_REQUESTED' : 'SUBMITTED',
        complianceStatus: isLowRisk ? 'Qualified' : mockBidder.officer_decision === 'CLARIFICATION_REQUESTED' ? 'Clarification Required' : 'Awaiting Compliance Verification',
        documents: (mockBidder.documents || []).map((d, index) => ({
          id: d.id,
          requiredDocId: `req-doc-0${index + 1}`,
          documentType: d.doc_type,
          displayName: d.file_name.replace(/_/g, ' ').replace('.pdf', ''),
          fileName: d.file_name,
          fileSize: (d.page_count || 3) * 1024 * 160,
          uploadedAt: d.upload_date,
          fileUrl: d.file_url,
          status: 'UPLOADED',
          extractedEntityName: (d.parsed_metadata?.extracted_entity_name as string) || mockBidder.company_name,
        })),
      };
    }

    return null;
  },

  /**
   * Get all submissions made by a bidder
   */
  getSubmissionsForBidder(bidderId: string): BidSubmission[] {
    const submissions = getStoredSubmissions().filter((s) => s.bidderId === bidderId);
    
    // If not already in stored submissions, seed primary tender submission from mock
    const hasPrimary = submissions.some((s) => s.tenderId === 'tender-gem-2026-cloud');
    if (!hasPrimary) {
      const primary = this.getSubmission(bidderId, 'tender-gem-2026-cloud');
      if (primary) {
        submissions.unshift(primary);
      }
    }

    return submissions;
  },
};
