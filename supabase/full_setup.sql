-- ====================================================================
-- FULL SUPABASE DATABASE SETUP FOR GeM COMPLIANCE ENGINE
-- Copy and paste this complete SQL script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lndqmogkynsdqpthwxqw/sql/new
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: INITIAL SCHEMA & TABLE CREATION
-- --------------------------------------------------------------------

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
    document_type TEXT NOT NULL CHECK (document_type IN ('GST_CERT', 'FINANCIAL_AUDIT', 'OEM_AUTH', 'WORK_ORDER_EXPERIENCE', 'AFFIDAVIT_BLACKLIST', 'UDYAM_CERT', 'UDYAM')),
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_bidders_tender_id ON public.bidders(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_clauses_tender_id ON public.tender_clauses(tender_id);
CREATE INDEX IF NOT EXISTS idx_bidder_documents_bidder_id ON public.bidder_documents(bidder_id);
CREATE INDEX IF NOT EXISTS idx_compliance_results_bidder_id ON public.compliance_results(bidder_id);
CREATE INDEX IF NOT EXISTS idx_registry_verifications_bidder_id ON public.registry_verifications(bidder_id);
CREATE INDEX IF NOT EXISTS idx_adjudications_bidder_id ON public.adjudications(bidder_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);

-- --------------------------------------------------------------------
-- STEP 2: ROW LEVEL SECURITY & POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bidders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bidder_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjudications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Tenders viewable by everyone" ON public.tenders FOR SELECT USING (true);
CREATE POLICY "Bidders viewable by everyone" ON public.bidders FOR SELECT USING (true);
CREATE POLICY "Bidders update by everyone" ON public.bidders FOR ALL USING (true);
CREATE POLICY "Tender clauses viewable by everyone" ON public.tender_clauses FOR SELECT USING (true);
CREATE POLICY "Bidder documents viewable by everyone" ON public.bidder_documents FOR SELECT USING (true);
CREATE POLICY "Allow document uploads" ON public.bidder_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow document deletion" ON public.bidder_documents FOR DELETE USING (true);
CREATE POLICY "Document extractions viewable by everyone" ON public.document_extractions FOR SELECT USING (true);
CREATE POLICY "Registry verifications viewable by everyone" ON public.registry_verifications FOR SELECT USING (true);
CREATE POLICY "Compliance results viewable by everyone" ON public.compliance_results FOR SELECT USING (true);
CREATE POLICY "Compliance results insert and update" ON public.compliance_results FOR ALL USING (true);
CREATE POLICY "Entity comparisons viewable by everyone" ON public.entity_comparisons FOR SELECT USING (true);
CREATE POLICY "Adjudications viewable by everyone" ON public.adjudications FOR SELECT USING (true);
CREATE POLICY "Adjudications insert by officers" ON public.adjudications FOR INSERT WITH CHECK (true);
CREATE POLICY "Clarifications viewable by everyone" ON public.clarifications FOR SELECT USING (true);
CREATE POLICY "Clarifications insert and update" ON public.clarifications FOR ALL USING (true);
CREATE POLICY "Audit logs viewable by everyone" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Audit logs insert" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- STORAGE BUCKET CREATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('bidder-documents', 'bidder-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Bidder Documents" ON storage.objects FOR SELECT USING (bucket_id = 'bidder-documents');
CREATE POLICY "Upload Access to Bidder Documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bidder-documents');
CREATE POLICY "Delete Access to Bidder Documents" ON storage.objects FOR DELETE USING (bucket_id = 'bucket_id = bidder-documents');

-- --------------------------------------------------------------------
-- STEP 3: DEMO DATA SEEDING
-- --------------------------------------------------------------------

INSERT INTO public.profiles (id, full_name, email, role, designation, department)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Shri V. Ramaswamy',
    'v.ramaswamy@gem.gov.in',
    'OFFICER',
    'Joint Director (GeM Procurement)',
    'Ministry of Commerce & Industry'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.tenders (
    id, tender_number, title, department, description, issue_date, closing_date,
    minimum_turnover, minimum_experience_years, required_gst_status, required_blacklist_status, required_msme_status, status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'GEM/2026/B/892104',
    'Procurement of High-End Enterprise Cloud Servers & Networking Hardware for National Data Centers',
    'Ministry of Electronics and Information Technology (MeitY), National Informatics Centre (NIC)',
    'Procurement of high-capacity server infrastructure and core switches for multi-region cloud deployment.',
    '2026-08-20T10:00:00Z',
    '2026-10-15T18:00:00Z',
    30000000.00,
    5,
    'ACTIVE',
    'CLEARED',
    'VERIFIED',
    'ACTIVE'
) ON CONFLICT (tender_number) DO NOTHING;

INSERT INTO public.tender_clauses (id, tender_id, clause_code, title, description, category, mandatory, threshold, weight, display_order)
VALUES
(
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111111',
    'R001',
    'Minimum Average Annual Turnover',
    'The minimum average annual turnover of the bidder during the last 3 financial years must be at least ₹3.00 Crores, certified by a Chartered Accountant with valid UDIN.',
    'FINANCIAL',
    true,
    '₹3.00 Crores average over last 3 financial years',
    25,
    1
),
(
    '33333333-3333-3333-3333-333333333002',
    '11111111-1111-1111-1111-111111111111',
    'R002',
    'Past Operational Experience',
    'Bidder must possess a minimum of 5 years continuous operational experience executing enterprise IT hardware / cloud infrastructure contracts for Govt/PSU/Scheduled Commercial entities.',
    'EXPERIENCE',
    true,
    'Minimum 5 Years Active Experience',
    20,
    2
),
(
    '33333333-3333-3333-3333-333333333003',
    '11111111-1111-1111-1111-111111111111',
    'R003',
    'Statutory GST Registration Validity',
    'Bidder must hold an Active Form GST REG-06 registration certificate valid on the date of bid submission with no record of cancellation or non-filing suspension.',
    'STATUTORY',
    true,
    'Active GSTIN through Bid Closing',
    20,
    3
),
(
    '33333333-3333-3333-3333-333333333004',
    '11111111-1111-1111-1111-111111111111',
    'R004',
    'Non-Debarment / Anti-Blacklisting Affidavit',
    'Bidder must furnish a notarized affidavit affirming non-debarment and verify clean standing on the Central Public Procurement Portal (CPPP) National Debarment Database.',
    'STATUTORY',
    true,
    'Zero Debarment / CPPP Clear',
    15,
    4
),
(
    '33333333-3333-3333-3333-333333333005',
    '11111111-1111-1111-1111-111111111111',
    'R005',
    'OEM Authorization Form (MAF)',
    'Bidder must submit a verifiable Manufacturer Authorization Form from OEM (Cisco/Dell/HPE) specifically tied to this GeM Tender. Legal entity name must match bidder documentation.',
    'OEM',
    true,
    'OEM Authorized Partner Certification',
    15,
    5
),
(
    '33333333-3333-3333-3333-333333333006',
    '11111111-1111-1111-1111-111111111111',
    'R006',
    'MSME / Udyam Make-in-India Preference',
    'Valid Udyam Registration Certificate for MSE purchase preference and tender fee / EMD exemption under Public Procurement Policy (PPP-MSE).',
    'TECHNICAL',
    false,
    'Valid Udyam/MSME registration where applicable',
    5,
    6
) ON CONFLICT (tender_id, clause_code) DO NOTHING;

INSERT INTO public.bidders (
    id, tender_id, bidder_code, company_name, email, gstin, pan, udyam_number,
    status, compliance_score, risk_level, evaluation_gate, mandatory_breaches, clarification_flags
) VALUES 
(
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'BIDDER-01',
    'Bharat Datatech Solutions Private Limited',
    'compliance@bharatdatatech.in',
    '07AAACB1234F1Z8',
    'AAACB1234F',
    'UDYAM-DL-01-0089123',
    'ELIGIBLE',
    100,
    'LOW',
    'FULL_PASS',
    0,
    0
),
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'BIDDER-02',
    'Apex Infoways India Private Limited',
    'tenders@apexinfoways.co.in',
    '27AABC5678K1ZQ',
    'AABCA5678K',
    'UDYAM-MH-02-0045612',
    'REVIEW_REQUIRED',
    85,
    'MEDIUM',
    'REVIEW_REQUIRED',
    0,
    1
),
(
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'BIDDER-03',
    'Global Nexus Technologies Limited',
    'karthik@nexusglobitech.org',
    '33AAACD9999L1ZM',
    'AAACD9999L',
    'UDYAM-TN-03-0099881',
    'DISQUALIFIED',
    2,
    'HIGH',
    'FATAL_NON_COMPLIANCE',
    7,
    1
) ON CONFLICT (id) DO NOTHING;
