import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ComplianceResult, RequirementCategory, ComplianceStatus } from '../lib/types';
import { resolveBidderId } from '../lib/idMapper';
import { normalizeComplianceStatus } from '../lib/utils';
import { MOCK_TENDER, MOCK_BIDDERS, MOCK_REQUIREMENTS } from '../lib/mock-data/tender-seed';
import { deterministicEvaluator } from '../lib/engine/evaluator';
import { verificationService } from './verificationService';

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
    const clean = (bidderId || '').toLowerCase().trim();
    let bidder = MOCK_BIDDERS.find((b) => b.id.toLowerCase() === clean);

    if (!bidder) {
      const matchPadded = clean.match(/(\d{1,2})$/);
      if (matchPadded) {
        const num = parseInt(matchPadded[1], 10);
        if (num >= 1 && num <= 20) {
          const targetId = `bidder-${num < 10 ? `0${num}` : num}`;
          bidder = MOCK_BIDDERS.find((b) => b.id === targetId);
        }
      }
    }

    if (!bidder) {
      bidder = MOCK_BIDDERS.find(
        (b) => clean.includes(b.id.toLowerCase()) || b.company_name.toLowerCase().includes(clean)
      ) || MOCK_BIDDERS[0];
    }

    const registrySummary = verificationService.getSimulatedSummaryForBidder(bidder.id);

    return MOCK_REQUIREMENTS.map((req) =>
      deterministicEvaluator.evaluateClause({
        tender_id: MOCK_TENDER.id,
        tender_deadline: MOCK_TENDER.deadline,
        tender_budget: MOCK_TENDER.estimated_budget,
        requirement: req,
        bidder,
        documents: bidder.documents || [],
        registry_summary: registrySummary,
      })
    );
  },
};
