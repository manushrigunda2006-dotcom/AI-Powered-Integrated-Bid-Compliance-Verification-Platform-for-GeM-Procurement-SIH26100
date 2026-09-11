-- ====================================================================
-- MIGRATION 004: PERFORMANCE INDEXES & REQUIRED DOCUMENTS TABLE
-- Optimizes query execution plans for Audit Trails, Tenders, and Bidders
-- ====================================================================

-- 1. Ensure tender_required_documents table exists with foreign key constraints
CREATE TABLE IF NOT EXISTS public.tender_required_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    storage_path TEXT,
    file_size INT DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index on tender_required_documents for fast clause & requirement hydration
-- Optimizes: tenderRequiredDocumentService.getRequiredDocuments(tenderId)
CREATE INDEX IF NOT EXISTS idx_tender_req_docs_tender_id 
ON public.tender_required_documents(tender_id);

-- 3. Composite index on audit_logs(entity_id, created_at DESC)
-- Eliminates Sort operator in query plans when loading bidder-specific audit timelines
-- Optimizes: auditService.getAuditLogsForBidder(bidderId)
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_created 
ON public.audit_logs(entity_id, created_at DESC);

-- 4. Single-column index on audit_logs(created_at DESC)
-- Optimizes global chronological audit log trail retrieval with pagination limit
-- Optimizes: auditService.getAllAuditLogs()
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON public.audit_logs(created_at DESC);

-- 5. Index on tenders(created_at DESC)
-- Optimizes tender listing page query: supabase.from('tenders').select('*').order('created_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_tenders_created_at 
ON public.tenders(created_at DESC);

-- 6. Composite index on bidders(tender_id, created_at DESC)
-- Optimizes bidder list retrieval grouped by tender with deterministic ordering
-- Optimizes: bidderService.getBiddersForTender(tenderId)
CREATE INDEX IF NOT EXISTS idx_bidders_tender_created 
ON public.bidders(tender_id, created_at DESC);

-- 7. Index on bidder_documents(bidder_id, uploaded_at ASC)
-- Optimizes document packet hydration in chronological upload order
CREATE INDEX IF NOT EXISTS idx_bidder_docs_bidder_uploaded 
ON public.bidder_documents(bidder_id, uploaded_at ASC);
