-- ====================================================================
-- MIGRATION 003: DEMO SEED DATA FOR GeM COMPLIANCE ENGINE
-- ====================================================================

-- 1. SEED OFFICER PROFILE
INSERT INTO public.profiles (id, full_name, email, role, designation, department)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ABCD',
    'abcd@gmail.com',
    'OFFICER',
    '',
    'Ministry of Commerce & Industry'
) ON CONFLICT (email) DO NOTHING;

-- 2. SEED TENDER
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

-- 3. SEED TENDER CLAUSES (R001 - R006)
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
    'Bidder must submit a verifiable Manufacturer Authorization Form from authorized OEM specifically tied to this GeM Tender. Legal entity name must match bidder documentation.',
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

-- 4. SEED BIDDERS
-- BIDDER 1: BCDE TECHNOLOGIES PRIVATE LIMITED
INSERT INTO public.bidders (
    id, tender_id, bidder_code, company_name, email, gstin, pan, udyam_number,
    status, compliance_score, risk_level, evaluation_gate, mandatory_breaches, clarification_flags
) VALUES (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'BIDDER-01',
    'BCDE Technologies Private Limited',
    'compliance@bcdetech.in',
    '07AAACB1234F1Z8',
    'AAACB1234F',
    'UDYAM-DL-01-0089123',
    'ELIGIBLE',
    100,
    'LOW',
    'FULL_PASS',
    0,
    0
) ON CONFLICT (id) DO NOTHING;

-- BIDDER 2: CDEF SOLUTIONS PRIVATE LIMITED
INSERT INTO public.bidders (
    id, tender_id, bidder_code, company_name, email, gstin, pan, udyam_number,
    status, compliance_score, risk_level, evaluation_gate, mandatory_breaches, clarification_flags
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'BIDDER-02',
    'CDEF Solutions Private Limited',
    'tenders@cdefsolutions.co.in',
    '27AABC5678K1ZQ',
    'AABCA5678K',
    'UDYAM-MH-02-0045612',
    'REVIEW_REQUIRED',
    85,
    'MEDIUM',
    'REVIEW_REQUIRED',
    0,
    1
) ON CONFLICT (id) DO NOTHING;

-- BIDDER 3: DEFG SYSTEMS LIMITED
INSERT INTO public.bidders (
    id, tender_id, bidder_code, company_name, email, gstin, pan, udyam_number,
    status, compliance_score, risk_level, evaluation_gate, mandatory_breaches, clarification_flags
) VALUES (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'BIDDER-03',
    'DEFG Systems Limited',
    'contact@defgsystems.org',
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

-- 5. SEED DOCUMENTS FOR BIDDER 1
INSERT INTO public.bidder_documents (id, bidder_id, document_name, document_type, storage_path, file_size, mime_type, sha256_hash, verification_status)
VALUES
('44444444-4444-4444-4444-444444441001', '22222222-2222-2222-2222-222222222221', 'CA_Audited_Financial_Statement_FY23_FY25.pdf', 'FINANCIAL_AUDIT', 'bidders/01/financial_audit.pdf', 2450000, 'application/pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'VERIFIED'),
('44444444-4444-4444-4444-444444441002', '22222222-2222-2222-2222-222222222221', 'NIC_Past_Experience_Completion_Cert.pdf', 'WORK_ORDER_EXPERIENCE', 'bidders/01/experience_cert.pdf', 1850000, 'application/pdf', 'f4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298fc1c149afb', 'VERIFIED'),
('44444444-4444-4444-4444-444444441003', '22222222-2222-2222-2222-222222222221', 'GST_Registration_Certificate_REG06.pdf', 'GST_CERT', 'bidders/01/gst_cert.pdf', 980000, 'application/pdf', 'a41e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb92427e', 'VERIFIED'),
('44444444-4444-4444-4444-444444441004', '22222222-2222-2222-2222-222222222221', 'Non_Debarment_Affidavit_Notarized.pdf', 'AFFIDAVIT_BLACKLIST', 'bidders/01/affidavit.pdf', 640000, 'application/pdf', '7852b855e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b', 'VERIFIED'),
('44444444-4444-4444-4444-444444441005', '22222222-2222-2222-2222-222222222221', 'OEM_MAF_Authorization.pdf', 'OEM_AUTH', 'bidders/01/oem_maf.pdf', 1200000, 'application/pdf', 'b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996f41e464927ae41e', 'VERIFIED'),
('44444444-4444-4444-4444-444444441006', '22222222-2222-2222-2222-222222222221', 'Udyam_Registration_Certificate_MSME.pdf', 'UDYAM_CERT', 'bidders/01/udyam.pdf', 720000, 'application/pdf', 'ca495991b7852b855e3b0c44298fc1c149afbf4c8996f41e464927ae41eb934', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- SEED DOCUMENTS FOR BIDDER 2
INSERT INTO public.bidder_documents (id, bidder_id, document_name, document_type, storage_path, file_size, mime_type, sha256_hash, verification_status)
VALUES
('44444444-4444-4444-4444-444444442001', '22222222-2222-2222-2222-222222222222', 'Audited_Balance_Sheet_3Y_Turnover.pdf', 'FINANCIAL_AUDIT', 'bidders/02/audit.pdf', 2100000, 'application/pdf', '991b7852b855e3b0c44298fc1c149afbf4c8996f41e464927ae41eb934ca495', 'VERIFIED'),
('44444444-4444-4444-4444-444444442002', '22222222-2222-2222-2222-222222222222', 'Work_Experience_Certificates.pdf', 'WORK_ORDER_EXPERIENCE', 'bidders/02/experience.pdf', 1500000, 'application/pdf', '7852b855e3b0c44298fc1c149afbf4c8996f41e464927ae41eb934ca495991b', 'VERIFIED'),
('44444444-4444-4444-4444-444444442003', '22222222-2222-2222-2222-222222222222', 'GST_Certificate_CDEF_Solutions.pdf', 'GST_CERT', 'bidders/02/gst_cert.pdf', 890000, 'application/pdf', 'e3b0c44298fc1c149afbf4c8996f41e464927ae41eb934ca495991b7852b855', 'VERIFIED'),
('44444444-4444-4444-4444-444444442004', '22222222-2222-2222-2222-222222222222', 'Affidavit_Non_Blacklisting.pdf', 'AFFIDAVIT_BLACKLIST', 'bidders/02/affidavit.pdf', 540000, 'application/pdf', 'c149afbf4c8996f41e464927ae41eb934ca495991b7852b855e3b0c44298f', 'VERIFIED'),
('44444444-4444-4444-4444-444444442005', '22222222-2222-2222-2222-222222222222', 'OEM_Manufacturer_Auth.pdf', 'OEM_AUTH', 'bidders/02/oem_maf.pdf', 1150000, 'application/pdf', 'f41e464927ae41eb934ca495991b7852b855e3b0c44298fc1c149afbf4c8996', 'REVIEW_REQUIRED'),
('44444444-4444-4444-4444-444444442006', '22222222-2222-2222-2222-222222222222', 'Udyam_MSME_Small_Enterprise.pdf', 'UDYAM_CERT', 'bidders/02/udyam.pdf', 680000, 'application/pdf', 'eb934ca495991b7852b855e3b0c44298fc1c149afbf4c8996f41e464927ae41', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- SEED DOCUMENTS FOR BIDDER 3
INSERT INTO public.bidder_documents (id, bidder_id, document_name, document_type, storage_path, file_size, mime_type, sha256_hash, verification_status)
VALUES
('44444444-4444-4444-4444-444444443001', '22222222-2222-2222-2222-222222222223', 'Unaudited_Balance_Sheet.pdf', 'FINANCIAL_AUDIT', 'bidders/03/audit.pdf', 1400000, 'application/pdf', '855e3b0c44298fc1c149afbf4c8996f41e464927ae41eb934ca495991b7852b', 'REJECTED'),
('44444444-4444-4444-4444-444444443002', '22222222-2222-2222-2222-222222222223', 'Client_List_Summary.pdf', 'WORK_ORDER_EXPERIENCE', 'bidders/03/exp.pdf', 920000, 'application/pdf', 'fc1c149afbf4c8996f41e464927ae41eb934ca495991b7852b855e3b0c44298', 'REJECTED'),
('44444444-4444-4444-4444-444444443003', '22222222-2222-2222-2222-222222222223', 'Old_GST_Registration_Notice.pdf', 'GST_CERT', 'bidders/03/gst.pdf', 610000, 'application/pdf', '41e464927ae41eb934ca495991b7852b855e3b0c44298fc1c149afbf4c8996f', 'CANCELLED'),
('44444444-4444-4444-4444-444444443004', '22222222-2222-2222-2222-222222222223', 'Self_Declaration_Affidavit.pdf', 'AFFIDAVIT_BLACKLIST', 'bidders/03/affidavit.pdf', 420000, 'application/pdf', 'ae41eb934ca495991b7852b855e3b0c44298fc1c149afbf4c8996f41e464927', 'DEBARRED')
ON CONFLICT (id) DO NOTHING;

-- 6. REGISTRY VERIFICATIONS
-- BIDDER 1
INSERT INTO public.registry_verifications (bidder_id, registry_type, registration_number, status, score, verified_name, verification_reference, response_data)
VALUES
('22222222-2222-2222-2222-222222222221', 'GST', '07AAACB1234F1Z8', 'ACTIVE', 98, 'BCDE Technologies Private Limited', 'GSTN-REF-998821', '{"taxpayer_type":"Regular", "filing_status":"Clean"}'::jsonb),
('22222222-2222-2222-2222-222222222221', 'MSME_UDYAM', 'UDYAM-DL-01-0089123', 'ACTIVE', 100, 'BCDE Technologies Private Limited', 'UDYAM-REF-10492', '{"enterprise_type":"Medium MSE", "ppp_eligible":true}'::jsonb),
('22222222-2222-2222-2222-222222222221', 'CPPP_BLACKLIST', 'AAACB1234F', 'CLEARED', 100, 'BCDE Technologies Private Limited', 'CPPP-REF-00192', '{"debarred":false, "violations":0}'::jsonb);

-- BIDDER 2
INSERT INTO public.registry_verifications (bidder_id, registry_type, registration_number, status, score, verified_name, verification_reference, response_data)
VALUES
('22222222-2222-2222-2222-222222222222', 'GST', '27AABC5678K1ZQ', 'ACTIVE', 84, 'CDEF Solutions Private Limited', 'GSTN-REF-449102', '{"taxpayer_type":"Regular", "filing_status":"Active"}'::jsonb),
('22222222-2222-2222-2222-222222222222', 'MSME_UDYAM', 'UDYAM-MH-02-0045612', 'ACTIVE', 100, 'CDEF Solutions Private Limited', 'UDYAM-REF-77182', '{"enterprise_type":"Small MSE", "ppp_eligible":true}'::jsonb),
('22222222-2222-2222-2222-222222222222', 'CPPP_BLACKLIST', 'AABCA5678K', 'CLEARED', 100, 'CDEF Solutions Private Limited', 'CPPP-REF-88201', '{"debarred":false, "violations":0}'::jsonb);

-- BIDDER 3
INSERT INTO public.registry_verifications (bidder_id, registry_type, registration_number, status, score, verified_name, verification_reference, response_data)
VALUES
('22222222-2222-2222-2222-222222222223', 'GST', '33AAACD9999L1ZM', 'CANCELLED', 34, 'DEFG Systems Limited', 'GSTN-REF-881920', '{"taxpayer_type":"Cancelled", "cancellation_date":"2023-01-01"}'::jsonb),
('22222222-2222-2222-2222-222222222223', 'MSME_UDYAM', 'UDYAM-TN-03-0099881', 'ACTIVE', 100, 'DEFG Systems Limited', 'UDYAM-REF-99201', '{"enterprise_type":"Medium MSE", "ppp_eligible":true}'::jsonb),
('22222222-2222-2222-2222-222222222223', 'CPPP_BLACKLIST', 'AAACD9999L', 'DEBARRED', 0, 'DEFG Systems Limited', 'CPPP-REF-BLACK-009', '{"debarred":true, "ministry":"Ministry of Defence", "order_no":"MOD/PROC/DEBAR/2023/1892"}'::jsonb);

-- 7. SEED COMPLIANCE RESULTS
-- BIDDER 1
INSERT INTO public.compliance_results (bidder_id, clause_id, status, threshold_value, extracted_value, extracted_unit, score, remarks, evidence_document_id, evidence_page)
VALUES
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333001', 'COMPLIANT', '₹3.00 Crores', '₹5.20 Crores', 'INR', 25, 'Turnover exceeds requirement by ₹2.20 Crores.', '44444444-4444-4444-4444-444444441001', 3),
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333002', 'COMPLIANT', '5 Years', '7 Years', 'Years', 20, 'Past operational experience verified via NIC completion certificate.', '44444444-4444-4444-4444-444444441002', 1),
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333003', 'COMPLIANT', 'ACTIVE', 'ACTIVE (Score: 98%)', 'Status', 20, 'Form GST REG-06 verified active on GSTN portal.', '44444444-4444-4444-4444-444444441003', 1),
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333004', 'COMPLIANT', 'CLEARED', 'CLEARED / 0 Violations', 'Status', 15, 'Verified zero debarments across CPPP national registry.', '44444444-4444-4444-4444-444444441004', 1),
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333005', 'COMPLIANT', 'VALID_OEM_MAF', 'Authorized Tier-1 OEM', 'Status', 15, 'Direct OEM Authorization verified.', '44444444-4444-4444-4444-444444441005', 1),
('22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333006', 'COMPLIANT', 'VERIFIED_MSME', 'Medium MSE Verified', 'Status', 5, 'Valid Udyam Registration validated.', '44444444-4444-4444-4444-444444441006', 1)
ON CONFLICT (bidder_id, clause_id) DO NOTHING;

-- BIDDER 2
INSERT INTO public.compliance_results (bidder_id, clause_id, status, threshold_value, extracted_value, extracted_unit, score, remarks, evidence_document_id, evidence_page)
VALUES
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333001', 'COMPLIANT', '₹3.00 Crores', '₹3.15 Crores', 'INR', 25, 'Turnover meets minimum threshold requirement.', '44444444-4444-4444-4444-444444442001', 2),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333002', 'COMPLIANT', '5 Years', '5 Years', 'Years', 20, 'Past operational experience meets requirement.', '44444444-4444-4444-4444-444444442002', 1),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333003', 'COMPLIANT', 'ACTIVE', 'ACTIVE (Score: 84%)', 'Status', 20, 'Form GST REG-06 verified active on GSTN portal.', '44444444-4444-4444-4444-444444442003', 1),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333004', 'COMPLIANT', 'CLEARED', 'CLEARED / 0 Violations', 'Status', 15, 'Verified zero debarments across CPPP national registry.', '44444444-4444-4444-4444-444444442004', 1),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333005', 'OFFICER_REVIEW', 'VALID_OEM_MAF', 'CDEF Solutions Technologies Pvt Ltd', 'Status', 0, 'Entity name variation detected between GST and OEM MAF (92% similarity). Clarification requested.', '44444444-4444-4444-4444-444444442005', 1),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333006', 'COMPLIANT', 'VERIFIED_MSME', 'Small MSE Verified', 'Status', 5, 'Valid Udyam Registration validated.', '44444444-4444-4444-4444-444444442006', 1)
ON CONFLICT (bidder_id, clause_id) DO NOTHING;

-- BIDDER 3
INSERT INTO public.compliance_results (bidder_id, clause_id, status, threshold_value, extracted_value, extracted_unit, score, remarks, evidence_document_id, evidence_page)
VALUES
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333001', 'NON_COMPLIANT', '₹3.00 Crores', '₹1.80 Crores', 'INR', 0, 'Mandatory financial failure: Turnover ₹1.80 Cr is below required ₹3.00 Cr.', '44444444-4444-4444-4444-444444443001', 2),
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333002', 'NON_COMPLIANT', '5 Years', '3 Years', 'Years', 0, 'Mandatory experience failure: 3 years is below minimum 5 years required.', '44444444-4444-4444-4444-444444443002', 1),
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333003', 'NON_COMPLIANT', 'ACTIVE', 'CANCELLED (Tax score 34%)', 'Status', 0, 'Mandatory statutory failure: GST registration is CANCELLED.', '44444444-4444-4444-4444-444444443003', 1),
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333004', 'NON_COMPLIANT', 'CLEARED', 'DEBARRED (MOD Order MOD/PROC/DEBAR/2023/1892)', 'Status', 0, 'Fatal statutory breach: Active debarment listed on CPPP national database.', '44444444-4444-4444-4444-444444443004', 1),
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333005', 'MISSING_DOCUMENT', 'VALID_OEM_MAF', 'MISSING', 'Status', 0, 'Mandatory OEM authorization certificate was NOT uploaded in document packet.', NULL, 1),
('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333006', 'OFFICER_REVIEW', 'VERIFIED_MSME', 'Unverified', 'Status', 2, 'MSME registration details could not be validated against CPPP debarment status.', NULL, 1)
ON CONFLICT (bidder_id, clause_id) DO NOTHING;

-- 8. ENTITY COMPARISONS FOR BIDDER 2
INSERT INTO public.entity_comparisons (bidder_id, source_document_id, source_name, target_document_id, target_name, normalized_distance, similarity_percentage, comparison_status, reason)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444442003',
    'CDEF Solutions Private Limited',
    '44444444-4444-4444-4444-444444442005',
    'CDEF Solutions Technologies Pvt Ltd',
    0.0800,
    92.00,
    'REVIEW_REQUIRED',
    'Legal entity name variation detected between GST Certificate and OEM Authorization Form. Officer clarification required.'
);

-- 9. CLARIFICATIONS FOR BIDDER 2
INSERT INTO public.clarifications (bidder_id, clause_id, reason, status, requested_by)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333005',
    'Legal entity name variation detected between GST Certificate (CDEF Solutions Private Limited) and OEM Authorization Form (CDEF Solutions Technologies Pvt Ltd). Officer clarification required.',
    'OPEN',
    '00000000-0000-0000-0000-000000000001'
);

-- 10. INITIAL AUDIT LOGS
INSERT INTO public.audit_logs (user_id, entity_type, entity_id, action, old_value, new_value, metadata)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'BIDDER',
    '22222222-2222-2222-2222-222222222221',
    'AUTOMATED_VERIFICATION_COMPLETED',
    NULL,
    '{"status":"ELIGIBLE", "score":100}'::jsonb,
    '{"officer_name":"ABCD", "remarks":"Automated verification completed: 100% clause compliance and green external registries."}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000001',
    'BIDDER',
    '22222222-2222-2222-2222-222222222222',
    'CLARIFICATION_REQUESTED',
    '{"status":"PENDING"}'::jsonb,
    '{"status":"REVIEW_REQUIRED"}'::jsonb,
    '{"officer_name":"ABCD", "remarks":"Issued formal GeM notice regarding spelling variance in OEM Authorization certificate."}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000001',
    'BIDDER',
    '22222222-2222-2222-2222-222222222223',
    'DISQUALIFIED',
    '{"status":"PENDING"}'::jsonb,
    '{"status":"DISQUALIFIED"}'::jsonb,
    '{"officer_name":"ABCD", "remarks":"Disqualified due to mandatory financial, experience, cancelled GST, missing OEM certificate, and CPPP debarment order MOD/PROC/DEBAR/2023/1892."}'::jsonb
);
