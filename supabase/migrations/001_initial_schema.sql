-- ====================================================================
-- MIGRATION 001: INITIAL SCHEMA FOR GeM COMPLIANCE ENGINE
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / OFFICERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OFFICER', 'ADMIN')),
    designation TEXT,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TENDERS TABLE
CREATE TABLE IF NOT EXISTS public.tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    issue_date TIMESTAMPTZ NOT NULL,
    closing_date TIMESTAMPTZ NOT NULL,
    minimum_turnover NUMERIC(15,2) DEFAULT 30000000.00,
    minimum_experience_years INT DEFAULT 5,
    required_gst_status TEXT DEFAULT 'ACTIVE',
    required_blacklist_status TEXT DEFAULT 'CLEARED',
    required_msme_status TEXT DEFAULT 'VERIFIED',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'UNDER_EVALUATION', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BIDDERS TABLE
CREATE TABLE IF NOT EXISTS public.bidders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    bidder_code TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    gstin TEXT NOT NULL,
    pan TEXT NOT NULL,
    udyam_number TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('ELIGIBLE', 'MISMATCH', 'DEBARRED', 'REVIEW_REQUIRED', 'DISQUALIFIED', 'PENDING')),
    compliance_score INT DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),
    risk_level TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    evaluation_gate TEXT DEFAULT 'FULL_PASS' CHECK (evaluation_gate IN ('FULL_PASS', 'REVIEW_REQUIRED', 'FATAL_NON_COMPLIANCE')),
    mandatory_breaches INT DEFAULT 0,
    clarification_flags INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TENDER CLAUSES TABLE
CREATE TABLE IF NOT EXISTS public.tender_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    clause_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('FINANCIAL', 'EXPERIENCE', 'STATUTORY', 'OEM', 'TECHNICAL')),
    mandatory BOOLEAN NOT NULL DEFAULT true,
    threshold TEXT NOT NULL,
    weight INT NOT NULL DEFAULT 15,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tender_id, clause_code)
);

-- 5. BIDDER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.bidder_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES public.bidders(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('GST_CERT', 'FINANCIAL_AUDIT', 'OEM_AUTH', 'WORK_ORDER_EXPERIENCE', 'AFFIDAVIT_BLACKLIST', 'UDYAM_CERT')),
    storage_path TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT DEFAULT 'application/pdf',
    sha256_hash TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verification_status TEXT DEFAULT 'VERIFIED'
);

-- 6. DOCUMENT EXTRACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.bidder_documents(id) ON DELETE CASCADE,
    extracted_text TEXT,
    page_number INT DEFAULT 1,
    field_name TEXT NOT NULL,
    field_value TEXT NOT NULL,
    confidence_score NUMERIC(5,4) DEFAULT 0.9500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REGISTRY VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registry_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES public.bidders(id) ON DELETE CASCADE,
    registry_type TEXT NOT NULL CHECK (registry_type IN ('GST', 'MSME_UDYAM', 'CPPP_BLACKLIST')),
    registration_number TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'CLEARED', 'DEBARRED', 'PENDING', 'UNVERIFIED', 'ERROR')),
    score INT DEFAULT 100,
    verified_name TEXT,
    verification_reference TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    response_data JSONB DEFAULT '{}'::jsonb
);

-- 8. COMPLIANCE RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.compliance_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES public.bidders(id) ON DELETE CASCADE,
    clause_id UUID NOT NULL REFERENCES public.tender_clauses(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('COMPLIANT', 'NON_COMPLIANT', 'MISSING_DOCUMENT', 'OFFICER_REVIEW', 'UNVERIFIED', 'NOT_APPLICABLE')),
    threshold_value TEXT,
    extracted_value TEXT,
    extracted_unit TEXT,
    score INT DEFAULT 0,
    remarks TEXT,
    evidence_document_id UUID REFERENCES public.bidder_documents(id) ON DELETE SET NULL,
    evidence_page INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bidder_id, clause_id)
);

-- 9. ENTITY COMPARISONS TABLE
CREATE TABLE IF NOT EXISTS public.entity_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES public.bidders(id) ON DELETE CASCADE,
    source_document_id UUID REFERENCES public.bidder_documents(id) ON DELETE SET NULL,
    source_name TEXT NOT NULL,
    target_document_id UUID REFERENCES public.bidder_documents(id) ON DELETE SET NULL,
    target_name TEXT NOT NULL,
    normalized_distance NUMERIC(5,4) DEFAULT 0.0000,
    similarity_percentage NUMERIC(5,2) DEFAULT 100.00,
    comparison_status TEXT NOT NULL CHECK (comparison_status IN ('MATCH', 'REVIEW_REQUIRED', 'MISMATCH')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADJUDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.adjudications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES public.bidders(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('APPROVE_QUALIFICATION', 'REQUEST_CLARIFICATION', 'REJECT_DISQUALIFY')),
    remarks TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CLARIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.clarifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bidder_id UUID NOT NULL REFERENCES public.bidders(id) ON DELETE CASCADE,
    clause_id UUID REFERENCES public.tender_clauses(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESPONDED', 'RESOLVED', 'REJECTED')),
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    response TEXT,
    responded_at TIMESTAMPTZ
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_bidders_tender_id ON public.bidders(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_clauses_tender_id ON public.tender_clauses(tender_id);
CREATE INDEX IF NOT EXISTS idx_bidder_documents_bidder_id ON public.bidder_documents(bidder_id);
CREATE INDEX IF NOT EXISTS idx_compliance_results_bidder_id ON public.compliance_results(bidder_id);
CREATE INDEX IF NOT EXISTS idx_registry_verifications_bidder_id ON public.registry_verifications(bidder_id);
CREATE INDEX IF NOT EXISTS idx_adjudications_bidder_id ON public.adjudications(bidder_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
