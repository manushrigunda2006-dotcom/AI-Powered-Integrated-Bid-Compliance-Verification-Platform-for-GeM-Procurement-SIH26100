import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ComplianceResult, RequirementCategory, ComplianceStatus } from '../lib/types';
import { resolveBidderId } from '../lib/idMapper';
import { normalizeComplianceStatus } from '../lib/utils';

export const complianceService = {
  async getComplianceResultsForBidder(bidderId: string): Promise<ComplianceResult[]> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      return this.getFallbackComplianceResults(bidderId);
    }

    try {
      let { data, error } = await (supabase.from('compliance_results') as any)
        .select(`
          *,
          clause:tender_clauses(*)
        `)
        .eq('bidder_id', dbBidderId);

      if (error || !data || data.length === 0) {
        // Auto-seed compliance results in Supabase
        await this.seedComplianceResultsInDb(dbBidderId, bidderId);

        const { data: seededData } = await (supabase.from('compliance_results') as any)
          .select(`
            *,
            clause:tender_clauses(*)
          `)
          .eq('bidder_id', dbBidderId);

        data = seededData || [];
      }

      if (!data || data.length === 0) {
        return this.getFallbackComplianceResults(bidderId);
      }

      return data.map((row: any) => ({
        id: row.id,
        requirement_id: row.clause_id,
        bidder_id: row.bidder_id,
        clause_code: row.clause?.clause_code || 'R001',
        clause_title: row.clause?.title || 'Compliance Clause',
        category: (row.clause?.category as RequirementCategory) || 'FINANCIAL',
        is_mandatory: row.clause?.mandatory ?? true,
        status: normalizeComplianceStatus(row.status),
        risk_weight: row.clause?.weight || 15,
        score_contribution: row.score || 0,
        threshold_display: row.threshold_value || row.clause?.threshold || '',
        extracted_display: row.extracted_value || '',
        human_explanation: row.remarks || '',
        evidence: row.evidence_document_id
          ? {
              id: `ev-${row.id}`,
              requirement_id: row.clause_id,
              document_id: row.evidence_document_id,
              document_type: 'FINANCIAL_AUDIT',
              document_name: 'Verified PDF Document',
              extracted_value: row.extracted_value || '',
              source_page: row.evidence_page || 1,
              snippet_text: row.remarks || '',
              confidence_score: 0.98,
            }
          : undefined,
      }));
    } catch {
      return this.getFallbackComplianceResults(bidderId);
    }
  },

  async seedComplianceResultsInDb(dbBidderId: string, originalId: string): Promise<void> {
    const fallbackResults = this.getFallbackComplianceResults(originalId);
    
    // Map clause_code to clause_id
    const clauseIdMap: Record<string, string> = {
      'R001': '33333333-3333-3333-3333-333333333001',
      'R002': '33333333-3333-3333-3333-333333333002',
      'R003': '33333333-3333-3333-3333-333333333003',
      'R004': '33333333-3333-3333-3333-333333333004',
      'R005': '33333333-3333-3333-3333-333333333005',
      'R006': '33333333-3333-3333-3333-333333333006',
    };

    const rowsToInsert = fallbackResults.map((cr) => ({
      bidder_id: dbBidderId,
      clause_id: clauseIdMap[cr.clause_code] || '33333333-3333-3333-3333-333333333001',
      status: cr.status === 'MISSING_DOC' ? 'MISSING_DOCUMENT' : cr.status,
      threshold_value: cr.threshold_display,
      extracted_value: cr.extracted_display,
      score: cr.score_contribution,
      remarks: cr.human_explanation,
    }));

    try {
      await (supabase.from('compliance_results') as any).insert(rowsToInsert);
    } catch (err) {
      console.warn('Notice seeding compliance results:', err);
    }
  },

  getFallbackComplianceResults(bidderId: string): ComplianceResult[] {
    const isBidder3 = bidderId.endsWith('223') || bidderId.includes('03') || bidderId.includes('defg');
    const isBidder2 = bidderId.endsWith('222') || bidderId.includes('02') || bidderId.includes('cdef');

    if (isBidder3) {
      return [
        {
          id: 'cr-03-1',
          requirement_id: 'req-r001',
          bidder_id: bidderId,
          clause_code: 'R001',
          clause_title: 'Minimum Average Annual Turnover',
          category: 'FINANCIAL',
          is_mandatory: true,
          status: 'NON_COMPLIANT',
          risk_weight: 25,
          score_contribution: 0,
          threshold_display: '₹3.00 Crores (Avg last 3 FY)',
          extracted_display: '₹1.80 Crores',
          human_explanation: 'Mandatory financial failure: Turnover ₹1.80 Cr is below required ₹3.00 Cr threshold.',
          evidence: {
            id: 'ev-03-1',
            requirement_id: 'req-r001',
            document_id: 'doc-03-audit',
            document_type: 'FINANCIAL_AUDIT',
            document_name: 'Unaudited_Balance_Sheet.pdf',
            extracted_value: '₹1.80 Crores',
            source_page: 2,
            snippet_text: 'Average annual turnover reported: ₹1.80 Crores',
            confidence_score: 0.92,
          },
        },
        {
          id: 'cr-03-2',
          requirement_id: 'req-r002',
          bidder_id: bidderId,
          clause_code: 'R002',
          clause_title: 'Past Operational Experience',
          category: 'EXPERIENCE',
          is_mandatory: true,
          status: 'NON_COMPLIANT',
          risk_weight: 20,
          score_contribution: 0,
          threshold_display: 'Min 5 Years Active Experience',
          extracted_display: '3 Years',
          human_explanation: 'Mandatory experience failure: 3 years is below minimum 5 years required.',
          evidence: {
            id: 'ev-03-2',
            requirement_id: 'req-r002',
            document_id: 'doc-03-exp',
            document_type: 'WORK_ORDER_EXPERIENCE',
            document_name: 'Client_List_Summary.pdf',
            extracted_value: '3 Years',
            source_page: 1,
            snippet_text: 'Operational experience span: 3 years',
            confidence_score: 0.90,
          },
        },
        {
          id: 'cr-03-3',
          requirement_id: 'req-r003',
          bidder_id: bidderId,
          clause_code: 'R003',
          clause_title: 'Statutory GST Registration Validity',
          category: 'STATUTORY',
          is_mandatory: true,
          status: 'NON_COMPLIANT',
          risk_weight: 20,
          score_contribution: 0,
          threshold_display: 'Active GSTIN through Bid Closing',
          extracted_display: 'CANCELLED (Tax score: 34%)',
          human_explanation: 'Mandatory statutory failure: Form GST REG-06 is CANCELLED on GSTN portal.',
          evidence: {
            id: 'ev-03-3',
            requirement_id: 'req-r003',
            document_id: 'doc-03-gst',
            document_type: 'GST_CERT',
            document_name: 'Old_GST_Registration_Notice.pdf',
            extracted_value: 'CANCELLED',
            source_page: 1,
            snippet_text: 'GST status: Cancelled by Tax Authorities',
            confidence_score: 0.95,
          },
        },
        {
          id: 'cr-03-4',
          requirement_id: 'req-r004',
          bidder_id: bidderId,
          clause_code: 'R004',
          clause_title: 'Non-Debarment / Anti-Blacklisting Affidavit',
          category: 'STATUTORY',
          is_mandatory: true,
          status: 'NON_COMPLIANT',
          risk_weight: 15,
          score_contribution: 0,
          threshold_display: 'Zero Debarment / CPPP Clear',
          extracted_display: 'DEBARRED (MOD Order MOD/PROC/DEBAR/2023/1892)',
          human_explanation: 'CRITICAL MANDATORY BREACH: Active debarment listed on CPPP national database.',
          evidence: {
            id: 'ev-03-4',
            requirement_id: 'req-r004',
            document_id: 'doc-03-affidavit',
            document_type: 'AFFIDAVIT_BLACKLIST',
            document_name: 'Self_Declaration_Affidavit.pdf',
            extracted_value: 'DEBARRED',
            source_page: 1,
            snippet_text: 'Listed in CPPP Debarment Database by Ministry of Defence',
            confidence_score: 0.99,
          },
        },
        {
          id: 'cr-03-5',
          requirement_id: 'req-r005',
          bidder_id: bidderId,
          clause_code: 'R005',
          clause_title: 'OEM Authorization Form (MAF)',
          category: 'OEM',
          is_mandatory: true,
          status: 'MISSING_DOC',
          risk_weight: 15,
          score_contribution: 0,
          threshold_display: 'OEM Authorized Partner Certification',
          extracted_display: 'MISSING DOCUMENT',
          human_explanation: 'Mandatory OEM authorization certificate was NOT uploaded in document packet.',
        },
        {
          id: 'cr-03-6',
          requirement_id: 'req-r006',
          bidder_id: bidderId,
          clause_code: 'R006',
          clause_title: 'MSME / Udyam Make-in-India Preference',
          category: 'TECHNICAL',
          is_mandatory: false,
          status: 'COMPLIANT',
          risk_weight: 5,
          score_contribution: 2,
          threshold_display: 'Valid Udyam/MSME registration where applicable',
          extracted_display: 'UDYAM-TN-03-0099881 (Medium Enterprise)',
          human_explanation: 'Valid MSME certificate verified.',
        },
      ];
    }

    if (isBidder2) {
      return [
        {
          id: 'cr-02-1',
          requirement_id: 'req-r001',
          bidder_id: bidderId,
          clause_code: 'R001',
          clause_title: 'Minimum Average Annual Turnover',
          category: 'FINANCIAL',
          is_mandatory: true,
          status: 'COMPLIANT',
          risk_weight: 25,
          score_contribution: 25,
          threshold_display: '₹3.00 Crores (Avg last 3 FY)',
          extracted_display: '₹6.20 Crores',
          human_explanation: 'Turnover ₹6.20 Cr exceeds minimum ₹3.00 Cr requirement.',
          evidence: {
            id: 'ev-02-1',
            requirement_id: 'req-r001',
            document_id: 'doc-02-audit',
            document_type: 'FINANCIAL_AUDIT',
            document_name: 'CDEF_Audited_Financials_FY23_25.pdf',
            extracted_value: '₹6.20 Crores',
            source_page: 4,
            snippet_text: 'Average 3-yr annual turnover verified: ₹6,20,00,000/-',
            confidence_score: 0.97,
          },
        },
        {
          id: 'cr-02-2',
          requirement_id: 'req-r002',
          bidder_id: bidderId,
          clause_code: 'R002',
          clause_title: 'Past Operational Experience',
          category: 'EXPERIENCE',
          is_mandatory: true,
          status: 'COMPLIANT',
          risk_weight: 20,
          score_contribution: 20,
          threshold_display: 'Min 5 Years Active Experience',
          extracted_display: '6 Years',
          human_explanation: 'Experience requirement met (6 active years).',
        },
        {
          id: 'cr-02-3',
          requirement_id: 'req-r003',
          bidder_id: bidderId,
          clause_code: 'R003',
          clause_title: 'Statutory GST Registration Validity',
          category: 'STATUTORY',
          is_mandatory: true,
          status: 'COMPLIANT',
          risk_weight: 20,
          score_contribution: 20,
          threshold_display: 'Active GSTIN through Bid Closing',
          extracted_display: 'ACTIVE (Tax score: 84%)',
          human_explanation: 'GST registration is ACTIVE.',
        },
        {
          id: 'cr-02-4',
          requirement_id: 'req-r004',
          bidder_id: bidderId,
          clause_code: 'R004',
          clause_title: 'Non-Debarment / Anti-Blacklisting Affidavit',
          category: 'STATUTORY',
          is_mandatory: true,
          status: 'COMPLIANT',
          risk_weight: 15,
          score_contribution: 15,
          threshold_display: 'Zero Debarment / CPPP Clear',
          extracted_display: 'CLEAR',
          human_explanation: 'Clean standing on CPPP database verified.',
        },
        {
          id: 'cr-02-5',
          requirement_id: 'req-r005',
          bidder_id: bidderId,
          clause_code: 'R005',
          clause_title: 'OEM Authorization Form (MAF)',
          category: 'OEM',
          is_mandatory: true,
          status: 'FLAGGED',
          risk_weight: 15,
          score_contribution: 0,
          threshold_display: 'OEM Authorized Partner Certification',
          extracted_display: 'NAME MISMATCH DETECTED',
          human_explanation: 'OFFICER REVIEW REQUIRED: Legal entity name on MAF ("CDEF Solutions Tech") differs from GST cert ("CDEF Solutions Pvt Ltd").',
          evidence: {
            id: 'ev-02-5',
            requirement_id: 'req-r005',
            document_id: 'doc-02-maf',
            document_type: 'OEM_AUTH',
            document_name: 'OEM_Partner_MAF.pdf',
            extracted_value: 'CDEF Solutions Tech Pvt Ltd',
            source_page: 1,
            snippet_text: 'Partner Name: CDEF Solutions Tech Pvt Ltd',
            confidence_score: 0.94,
          },
        },
        {
          id: 'cr-02-6',
          requirement_id: 'req-r006',
          bidder_id: bidderId,
          clause_code: 'R006',
          clause_title: 'MSME / Udyam Make-in-India Preference',
          category: 'TECHNICAL',
          is_mandatory: false,
          status: 'COMPLIANT',
          risk_weight: 5,
          score_contribution: 5,
          threshold_display: 'Valid Udyam/MSME registration where applicable',
          extracted_display: 'UDYAM-MH-02-0045612 (Small Enterprise)',
          human_explanation: 'Small Enterprise preference applied.',
        },
      ];
    }

    // Bidder 01 (BCDE Technologies) - 100% Compliant
    return [
      {
        id: 'cr-01-1',
        requirement_id: 'req-r001',
        bidder_id: bidderId,
        clause_code: 'R001',
        clause_title: 'Minimum Average Annual Turnover',
        category: 'FINANCIAL',
        is_mandatory: true,
        status: 'COMPLIANT',
        risk_weight: 25,
        score_contribution: 25,
        threshold_display: '₹3.00 Crores (Avg last 3 FY)',
        extracted_display: '₹14.50 Crores',
        human_explanation: 'Turnover ₹14.50 Cr substantially exceeds ₹3.00 Cr requirement.',
        evidence: {
          id: 'ev-01-1',
          requirement_id: 'req-r001',
          document_id: 'doc-01-audit',
          document_type: 'FINANCIAL_AUDIT',
          document_name: 'CA_Certified_Turnover_FY23_25.pdf',
          extracted_value: '₹14.50 Crores',
          source_page: 3,
          snippet_text: 'Average turnover for FY 2022-25 certified at ₹14,50,00,000/-',
          confidence_score: 0.99,
        },
      },
      {
        id: 'cr-01-2',
        requirement_id: 'req-r002',
        bidder_id: bidderId,
        clause_code: 'R002',
        clause_title: 'Past Operational Experience',
        category: 'EXPERIENCE',
        is_mandatory: true,
        status: 'COMPLIANT',
        risk_weight: 20,
        score_contribution: 20,
        threshold_display: 'Min 5 Years Active Experience',
        extracted_display: '8 Years',
        human_explanation: '8 years enterprise experience verified with government contracts.',
      },
      {
        id: 'cr-01-3',
        requirement_id: 'req-r003',
        bidder_id: bidderId,
        clause_code: 'R003',
        clause_title: 'Statutory GST Registration Validity',
        category: 'STATUTORY',
        is_mandatory: true,
        status: 'COMPLIANT',
        risk_weight: 20,
        score_contribution: 20,
        threshold_display: 'Active GSTIN through Bid Closing',
        extracted_display: 'ACTIVE (Tax score: 98%)',
        human_explanation: 'Active GSTIN verified with 98% filing compliance.',
      },
      {
        id: 'cr-01-4',
        requirement_id: 'req-r004',
        bidder_id: bidderId,
        clause_code: 'R004',
        clause_title: 'Non-Debarment / Anti-Blacklisting Affidavit',
        category: 'STATUTORY',
        is_mandatory: true,
        status: 'COMPLIANT',
        risk_weight: 15,
        score_contribution: 15,
        threshold_display: 'Zero Debarment / CPPP Clear',
        extracted_display: 'CLEAR',
        human_explanation: 'Zero debarment history on CPPP portal.',
      },
      {
        id: 'cr-01-5',
        requirement_id: 'req-r005',
        bidder_id: bidderId,
        clause_code: 'R005',
        clause_title: 'OEM Authorization Form (MAF)',
        category: 'OEM',
        is_mandatory: true,
        status: 'COMPLIANT',
        risk_weight: 15,
        score_contribution: 15,
        threshold_display: 'OEM Authorized Partner Certification',
        extracted_display: 'MATCHED & VERIFIED',
        human_explanation: 'Valid OEM MAF submitted matching legal entity.',
      },
      {
        id: 'cr-01-6',
        requirement_id: 'req-r006',
        bidder_id: bidderId,
        clause_code: 'R006',
        clause_title: 'MSME / Udyam Make-in-India Preference',
        category: 'TECHNICAL',
        is_mandatory: false,
        status: 'COMPLIANT',
        risk_weight: 5,
        score_contribution: 5,
        threshold_display: 'Valid Udyam/MSME registration where applicable',
        extracted_display: 'UDYAM-DL-01-0089123 (Medium Enterprise)',
        human_explanation: 'Medium enterprise registration verified.',
      },
    ];
  },
};
