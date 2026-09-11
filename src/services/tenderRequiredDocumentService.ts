import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DocumentType, TenderRequiredDocument } from '../lib/types';
import { storageService } from './storageService';
import { auditService } from './auditService';

export const DEFAULT_REQUIRED_DOCS: TenderRequiredDocument[] = [
  {
    id: 'req-doc-01',
    tender_id: 'tender-gem-2026-cloud',
    document_type: 'FINANCIAL_AUDIT',
    display_name: 'CA_Certified_Turnover.pdf',
    storage_path: 'tenders/tender-gem-2026-cloud/required-documents/req-doc-01/CA_Certified_Turnover.pdf',
    file_size: 1024 * 512,
    is_mandatory: true,
    created_at: '2026-08-20T10:00:00Z',
    file_url: '/docs/tenders/tender-gem-2026-cloud/CA_Certified_Turnover.pdf',
  },
  {
    id: 'req-doc-02',
    tender_id: 'tender-gem-2026-cloud',
    document_type: 'GST_CERT',
    display_name: 'GST_Registration_Certificate.pdf',
    storage_path: 'tenders/tender-gem-2026-cloud/required-documents/req-doc-02/GST_Registration_Certificate.pdf',
    file_size: 1024 * 256,
    is_mandatory: true,
    created_at: '2026-08-20T10:00:00Z',
    file_url: '/docs/tenders/tender-gem-2026-cloud/GST_Registration_Certificate.pdf',
  },
  {
    id: 'req-doc-03',
    tender_id: 'tender-gem-2026-cloud',
    document_type: 'WORK_ORDER_EXPERIENCE',
    display_name: 'Past_Performance_Work_Order.pdf',
    storage_path: 'tenders/tender-gem-2026-cloud/required-documents/req-doc-03/Past_Performance_Work_Order.pdf',
    file_size: 1024 * 1024,
    is_mandatory: true,
    created_at: '2026-08-20T10:00:00Z',
    file_url: '/docs/tenders/tender-gem-2026-cloud/Past_Performance_Work_Order.pdf',
  },
  {
    id: 'req-doc-04',
    tender_id: 'tender-gem-2026-cloud',
    document_type: 'AFFIDAVIT_BLACKLIST',
    display_name: 'Non_Blacklisting_Affidavit.pdf',
    storage_path: 'tenders/tender-gem-2026-cloud/required-documents/req-doc-04/Non_Blacklisting_Affidavit.pdf',
    file_size: 1024 * 180,
    is_mandatory: true,
    created_at: '2026-08-20T10:00:00Z',
    file_url: '/docs/tenders/tender-gem-2026-cloud/Non_Blacklisting_Affidavit.pdf',
  },
  {
    id: 'req-doc-05',
    tender_id: 'tender-gem-2026-cloud',
    document_type: 'OEM_AUTH',
    display_name: 'OEM_Authorization_MAF.pdf',
    storage_path: 'tenders/tender-gem-2026-cloud/required-documents/req-doc-05/OEM_Authorization_MAF.pdf',
    file_size: 1024 * 320,
    is_mandatory: true,
    created_at: '2026-08-20T10:00:00Z',
    file_url: '/docs/tenders/tender-gem-2026-cloud/OEM_Authorization_MAF.pdf',
  },
];

export const AVAILABLE_DOCUMENT_TYPES: { type: DocumentType; label: string; description: string }[] = [
  { type: 'FINANCIAL_AUDIT', label: 'FINANCIAL AUDIT', description: 'CA Certified Turnover / Audited Balance Sheet' },
  { type: 'GST_CERT', label: 'GST CERT', description: 'Active GST Registration (Form GST REG-06)' },
  { type: 'WORK_ORDER_EXPERIENCE', label: 'WORK ORDER EXPERIENCE', description: 'Past Performance / Completion Certificates' },
  { type: 'AFFIDAVIT_BLACKLIST', label: 'AFFIDAVIT BLACKLIST', description: 'Notarized Non-Debarment Affidavit' },
  { type: 'OEM_AUTH', label: 'OEM AUTH', description: 'Manufacturer Authorization Form (MAF)' },
  { type: 'UDYAM', label: 'UDYAM / MSME', description: 'Udyam Registration Certificate' },
  { type: 'TECHNICAL_BID', label: 'TECHNICAL BID', description: 'Technical Specifications & Solution Compliance' },
  { type: 'PAN_CERT', label: 'PAN CERT', description: 'Income Tax Permanent Account Number Card' },
  { type: 'BANK_GUARANTEE', label: 'BANK GUARANTEE', description: 'Earnest Money Deposit (EMD) / Performance BG' },
  { type: 'OTHER', label: 'OTHER', description: 'Other Statutory or Commercial Declarations' },
];

// In-memory store for session continuity across page transitions
const memoryRequiredDocs: Map<string, TenderRequiredDocument[]> = new Map();

// Initialize demo tender documents
memoryRequiredDocs.set('tender-gem-2026-cloud', [...DEFAULT_REQUIRED_DOCS]);
memoryRequiredDocs.set('11111111-1111-1111-1111-111111111111', [...DEFAULT_REQUIRED_DOCS]);

export const tenderRequiredDocumentService = {
  detectDocumentType(fileName: string): DocumentType {
    const lower = fileName.toLowerCase();
    if (lower.includes('turnover') || lower.includes('audit') || lower.includes('balance') || lower.includes('ca_')) {
      return 'FINANCIAL_AUDIT';
    }
    if (lower.includes('gst')) {
      return 'GST_CERT';
    }
    if (lower.includes('oem') || lower.includes('maf') || lower.includes('manufacturer')) {
      return 'OEM_AUTH';
    }
    if (lower.includes('blacklist') || lower.includes('affidavit') || lower.includes('debar')) {
      return 'AFFIDAVIT_BLACKLIST';
    }
    if (lower.includes('experience') || lower.includes('work_order') || lower.includes('performance') || lower.includes('completion')) {
      return 'WORK_ORDER_EXPERIENCE';
    }
    if (lower.includes('udyam') || lower.includes('msme')) {
      return 'UDYAM';
    }
    if (lower.includes('pan')) {
      return 'PAN_CERT';
    }
    if (lower.includes('bank') || lower.includes('guarantee') || lower.includes('bg') || lower.includes('emd')) {
      return 'BANK_GUARANTEE';
    }
    if (lower.includes('technical') || lower.includes('spec') || lower.includes('bid')) {
      return 'TECHNICAL_BID';
    }
    return 'OTHER';
  },

  async getRequiredDocuments(tenderId: string): Promise<TenderRequiredDocument[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('tender_required_documents') as any)
          .select('*')
          .eq('tender_id', tenderId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            tender_id: d.tender_id,
            document_type: d.document_type as DocumentType,
            display_name: d.display_name,
            storage_path: d.storage_path,
            file_size: d.file_size,
            is_mandatory: d.is_mandatory ?? true,
            created_at: d.created_at,
            file_url: `/docs/${d.storage_path || d.display_name}`,
          }));
        }
      } catch (err) {
        console.warn('Notice querying tender_required_documents table:', err);
      }
    }

    // In-memory or default fallback
    const stored = memoryRequiredDocs.get(tenderId);
    if (stored) return stored;

    if (tenderId.includes('cloud') || tenderId === '11111111-1111-1111-1111-111111111111') {
      return [...DEFAULT_REQUIRED_DOCS];
    }

    return [];
  },

  async addRequiredDocument(
    tenderId: string,
    doc: {
      displayName: string;
      documentType: DocumentType;
      file?: File;
      isMandatory?: boolean;
    }
  ): Promise<TenderRequiredDocument> {
    const docId = `req-doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let storagePath: string | undefined = undefined;
    let fileUrl: string | undefined = undefined;
    let fileSize = doc.file?.size || 1024 * 250;

    if (doc.file) {
      const uploadRes = await storageService.uploadRequiredDocument(tenderId, docId, doc.file);
      storagePath = uploadRes.storagePath;
      fileUrl = uploadRes.fileUrl;
      fileSize = doc.file.size;
    } else {
      storagePath = `tenders/${tenderId}/required-documents/${docId}/${doc.displayName}`;
      fileUrl = `/docs/tenders/${tenderId}/${doc.displayName}`;
    }

    const newDoc: TenderRequiredDocument = {
      id: docId,
      tender_id: tenderId,
      document_type: doc.documentType,
      display_name: doc.displayName,
      storage_path: storagePath,
      file_size: fileSize,
      is_mandatory: doc.isMandatory !== undefined ? doc.isMandatory : true,
      created_at: new Date().toISOString(),
      file_url: fileUrl,
    };

    // Save in memory
    const existing = memoryRequiredDocs.get(tenderId) || [];
    existing.push(newDoc);
    memoryRequiredDocs.set(tenderId, existing);

    // Save in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('tender_required_documents') as any).insert({
          id: newDoc.id,
          tender_id: newDoc.tender_id,
          document_type: newDoc.document_type,
          display_name: newDoc.display_name,
          storage_path: newDoc.storage_path,
          file_size: newDoc.file_size,
          is_mandatory: newDoc.is_mandatory,
          created_at: newDoc.created_at,
        });
      } catch (err) {
        console.warn('Failed to insert into tender_required_documents:', err);
      }
    }

    // Log Audit Event
    await auditService.recordAuditLog({
      actor: 'OFFICER',
      tenderId,
      action: 'REQUIRED_DOCUMENT_UPLOADED',
      metadata: {
        document_id: newDoc.id,
        document_type: newDoc.document_type,
        display_name: newDoc.display_name,
        file_size: newDoc.file_size,
        is_mandatory: newDoc.is_mandatory,
      },
    });

    return newDoc;
  },

  async deleteRequiredDocument(tenderId: string, documentId: string): Promise<boolean> {
    const existing = memoryRequiredDocs.get(tenderId) || [];
    const target = existing.find((d) => d.id === documentId);

    if (target?.storage_path) {
      await storageService.deleteRequiredDocument(target.storage_path);
    }

    // Update memory
    const updated = existing.filter((d) => d.id !== documentId);
    memoryRequiredDocs.set(tenderId, updated);

    // Delete from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('tender_required_documents') as any)
          .delete()
          .eq('id', documentId);
      } catch (err) {
        console.warn('Failed to delete from tender_required_documents:', err);
      }
    }

    // Log Audit Event
    await auditService.recordAuditLog({
      actor: 'OFFICER',
      tenderId,
      action: 'REQUIRED_DOCUMENT_DELETED',
      metadata: {
        document_id: documentId,
        display_name: target?.display_name,
        document_type: target?.document_type,
      },
    });

    return true;
  },

  setInitialDocumentsForTender(tenderId: string, docs: TenderRequiredDocument[]) {
    memoryRequiredDocs.set(tenderId, [...docs]);
  },
};
