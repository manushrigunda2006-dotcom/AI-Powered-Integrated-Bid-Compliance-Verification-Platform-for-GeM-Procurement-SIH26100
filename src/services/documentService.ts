import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DocumentPacket, DocumentType } from '../lib/types';
import { MOCK_BIDDERS } from '../lib/mock-data/tender-seed';
import { resolveBidderId, resolveTenderId } from '../lib/idMapper';

export const documentService = {
  async getDocumentsForBidder(bidderId: string): Promise<DocumentPacket[]> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      const mockBidder = MOCK_BIDDERS.find((b) => b.id === bidderId || b.id.includes(bidderId));
      return mockBidder?.documents || [];
    }

    try {
      let { data, error } = await (supabase.from('bidder_documents') as any)
        .select('*')
        .eq('bidder_id', dbBidderId)
        .order('uploaded_at', { ascending: true });

      if (error || !data || data.length === 0) {
        // Seed default document packet for bidder into Supabase
        await this.seedBidderDocumentsInDb(dbBidderId, bidderId);

        const { data: seededData } = await (supabase.from('bidder_documents') as any)
          .select('*')
          .eq('bidder_id', dbBidderId)
          .order('uploaded_at', { ascending: true });

        data = seededData || [];
      }

      if (!data || data.length === 0) {
        const mockBidder = MOCK_BIDDERS.find((b) => b.id === bidderId || b.id.includes(bidderId));
        return mockBidder?.documents || [];
      }

      return data.map((d: any) => ({
        id: d.id,
        bidder_id: d.bidder_id,
        file_name: d.document_name,
        doc_type: d.document_type as DocumentType,
        file_url: this.getStoragePublicUrl(d.storage_path),
        upload_date: d.uploaded_at,
        page_count: d.document_type === 'FINANCIAL_AUDIT' ? 24 : d.document_type === 'WORK_ORDER_EXPERIENCE' ? 8 : 2,
        parsed_metadata: {
          extracted_entity_name: d.document_name.split('.')[0],
          sha256_hash: d.sha256_hash,
          verification_status: d.verification_status,
          ocr_quality_score: 0.98,
        },
      }));
    } catch {
      const mockBidder = MOCK_BIDDERS.find((b) => b.id === bidderId || b.id.includes(bidderId));
      return mockBidder?.documents || [];
    }
  },

  async seedBidderDocumentsInDb(dbBidderId: string, originalId: string): Promise<void> {
    const mockBidder = MOCK_BIDDERS.find((b) => b.id === originalId || b.id.includes(originalId)) || MOCK_BIDDERS[0];
    const docs = mockBidder.documents || [];

    const rowsToInsert = docs.map((doc) => ({
      bidder_id: dbBidderId,
      document_name: doc.file_name,
      document_type: doc.doc_type,
      storage_path: `tender/11111111-1111-1111-1111-111111111111/bidder/${dbBidderId}/${doc.file_name}`,
      file_size: 1024 * 450,
      mime_type: 'application/pdf',
      sha256_hash: doc.parsed_metadata?.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verification_status: 'VERIFIED',
    }));

    try {
      if (rowsToInsert.length > 0) {
        await (supabase.from('bidder_documents') as any).insert(rowsToInsert);
      }
    } catch (err) {
      console.warn('Notice seeding bidder documents:', err);
    }
  },

  async uploadDocument(
    bidderId: string,
    tenderId: string,
    file: File,
    docType: DocumentType
  ): Promise<DocumentPacket | null> {
    const dbBidderId = resolveBidderId(bidderId);
    const dbTenderId = resolveTenderId(tenderId);

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = `tender/${dbTenderId}/bidder/${dbBidderId}/${fileName}`;

    let fileUrl = `/docs/uploads/${file.name}`;
    let sha256Hash = await this.computeSHA256(file);

    if (isSupabaseConfigured()) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('bidder-documents')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.warn('Storage upload warning, continuing with path metadata:', uploadError);
        } else {
          fileUrl = this.getStoragePublicUrl(storagePath);
        }

        const { data: dbRecord, error: dbError } = await (supabase.from('bidder_documents') as any)
          .insert({
            bidder_id: dbBidderId,
            document_name: file.name,
            document_type: docType,
            storage_path: storagePath,
            file_size: file.size,
            mime_type: file.type || 'application/pdf',
            sha256_hash: sha256Hash,
            verification_status: 'VERIFIED',
          })
          .select('*')
          .single();

        if (dbError || !dbRecord) {
          console.error('Database insertion error for uploaded document:', dbError);
          return this.createFallbackDocumentPacket(dbBidderId, file.name, docType, fileUrl, sha256Hash);
        }

        return {
          id: dbRecord.id,
          bidder_id: dbRecord.bidder_id,
          file_name: dbRecord.document_name,
          doc_type: dbRecord.document_type as DocumentType,
          file_url: fileUrl,
          upload_date: dbRecord.uploaded_at,
          page_count: 3,
          parsed_metadata: {
            extracted_entity_name: file.name,
            sha256_hash: sha256Hash,
            ocr_quality_score: 0.96,
          },
        };
      } catch (err) {
        console.error('Document upload error:', err);
      }
    }

    return this.createFallbackDocumentPacket(dbBidderId, file.name, docType, fileUrl, sha256Hash);
  },

  async deleteDocument(documentId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await (supabase.from('bidder_documents') as any)
        .delete()
        .eq('id', documentId);

      return !error;
    } catch {
      return false;
    }
  },

  getStoragePublicUrl(storagePath: string): string {
    if (!isSupabaseConfigured()) return `/docs/${storagePath}`;
    const { data } = supabase.storage.from('bidder-documents').getPublicUrl(storagePath);
    return data.publicUrl;
  },

  async computeSHA256(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
  },

  createFallbackDocumentPacket(
    bidderId: string,
    fileName: string,
    docType: DocumentType,
    fileUrl: string,
    hash: string
  ): DocumentPacket {
    return {
      id: `doc-${Date.now()}`,
      bidder_id: bidderId,
      file_name: fileName,
      doc_type: docType,
      file_url: fileUrl,
      upload_date: new Date().toISOString(),
      page_count: 2,
      parsed_metadata: {
        extracted_entity_name: fileName,
        sha256_hash: hash,
        ocr_quality_score: 0.95,
      },
    };
  },
};
