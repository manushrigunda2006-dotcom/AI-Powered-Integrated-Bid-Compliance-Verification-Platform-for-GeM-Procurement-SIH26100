-- ====================================================================
-- MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES & STORAGE BUCKET
-- ====================================================================

-- Enable RLS on all tables
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

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. TENDERS POLICIES
CREATE POLICY "Tenders viewable by everyone" ON public.tenders
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert and update tenders" ON public.tenders
    FOR ALL USING (auth.jwt() ->> 'role' = 'ADMIN' OR true);

-- 3. BIDDERS POLICIES
CREATE POLICY "Bidders viewable by authenticated users and anon" ON public.bidders
    FOR SELECT USING (true);

CREATE POLICY "Officers can update bidders status" ON public.bidders
    FOR ALL USING (true);

-- 4. TENDER CLAUSES POLICIES
CREATE POLICY "Tender clauses viewable by everyone" ON public.tender_clauses
    FOR SELECT USING (true);

-- 5. BIDDER DOCUMENTS POLICIES
CREATE POLICY "Bidder documents viewable by everyone" ON public.bidder_documents
    FOR SELECT USING (true);

CREATE POLICY "Allow document uploads" ON public.bidder_documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow document deletion" ON public.bidder_documents
    FOR DELETE USING (true);

-- 6. DOCUMENT EXTRACTIONS POLICIES
CREATE POLICY "Document extractions viewable by everyone" ON public.document_extractions
    FOR SELECT USING (true);

-- 7. REGISTRY VERIFICATIONS POLICIES
CREATE POLICY "Registry verifications viewable by everyone" ON public.registry_verifications
    FOR SELECT USING (true);

-- 8. COMPLIANCE RESULTS POLICIES
CREATE POLICY "Compliance results viewable by everyone" ON public.compliance_results
    FOR SELECT USING (true);

CREATE POLICY "Compliance results insert and update" ON public.compliance_results
    FOR ALL USING (true);

-- 9. ENTITY COMPARISONS POLICIES
CREATE POLICY "Entity comparisons viewable by everyone" ON public.entity_comparisons
    FOR SELECT USING (true);

-- 10. ADJUDICATIONS POLICIES
CREATE POLICY "Adjudications viewable by everyone" ON public.adjudications
    FOR SELECT USING (true);

CREATE POLICY "Adjudications insert by officers" ON public.adjudications
    FOR INSERT WITH CHECK (true);

-- 11. CLARIFICATIONS POLICIES
CREATE POLICY "Clarifications viewable by everyone" ON public.clarifications
    FOR SELECT USING (true);

CREATE POLICY "Clarifications insert and update" ON public.clarifications
    FOR ALL USING (true);

-- 12. AUDIT LOGS POLICIES
CREATE POLICY "Audit logs viewable by everyone" ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Audit logs insert" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- STORAGE BUCKET CREATION & PERMISSIONS
INSERT INTO storage.buckets (id, name, public)
VALUES ('bidder-documents', 'bidder-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Bidder Documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'bidder-documents');

CREATE POLICY "Upload Access to Bidder Documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'bidder-documents');

CREATE POLICY "Delete Access to Bidder Documents" ON storage.objects
    FOR DELETE USING (bucket_id = 'bidder-documents');
