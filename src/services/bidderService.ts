import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_BIDDERS } from '../lib/mock-data/tender-seed';
import { Bidder, OfficerDecision, RiskLevel } from '../lib/types';
import { documentService } from './documentService';
import { complianceService } from './complianceService';
import { resolveTenderId, resolveBidderId } from '../lib/idMapper';

export const bidderService = {
  async getBiddersForTender(tenderId: string): Promise<Bidder[]> {
    const sortByComplianceScoreDesc = (list: Bidder[]): Bidder[] => {
      return [...list].sort((a, b) => {
        const scoreB = Number(b.complianceScore ?? b.compliance_score ?? b.overall_score ?? 0);
        const scoreA = Number(a.complianceScore ?? a.compliance_score ?? a.overall_score ?? 0);
        return scoreB - scoreA;
      });
    };

    if (!isSupabaseConfigured()) {
      return sortByComplianceScoreDesc(MOCK_BIDDERS);
    }

    try {
      const { data } = await (supabase.from('bidders') as any)
        .select('*');

      if (!data || data.length === 0) {
        return sortByComplianceScoreDesc(MOCK_BIDDERS);
      }

      // Merge any database updates into MOCK_BIDDERS ensuring exactly 20 bidders are always returned
      const dbMap = new Map<string, any>();
      for (const row of data) {
        if (row.bidder_code) dbMap.set(String(row.bidder_code).toUpperCase(), row);
        if (row.id) dbMap.set(String(row.id).toLowerCase(), row);
      }

      const merged = MOCK_BIDDERS.map((mock) => {
        const row =
          dbMap.get(mock.id.toLowerCase()) ||
          dbMap.get(mock.id.toUpperCase()) ||
          dbMap.get(`BIDDER-${mock.id.replace('bidder-', '')}`);
        if (row) {
          const score = row.compliance_score ?? mock.overall_score;
          return {
            ...mock,
            overall_score: score,
            compliance_score: score,
            complianceScore: score,
            officer_decision: (row.officer_decision as OfficerDecision) || mock.officer_decision,
            risk_level: (row.risk_level as RiskLevel) || mock.risk_level,
            decision_notes: row.decision_notes || mock.decision_notes,
            decision_timestamp: row.decision_timestamp || mock.decision_timestamp,
          };
        }
        return mock;
      });

      return sortByComplianceScoreDesc(merged);
    } catch {
      return sortByComplianceScoreDesc(MOCK_BIDDERS);
    }
  },

  async getBidder(bidderId: string): Promise<Bidder | null> {
    const findInMock = (id: string): Bidder => {
      const clean = id.toLowerCase().trim();
      let found = MOCK_BIDDERS.find((b) => b.id.toLowerCase() === clean);
      if (found) return found;

      const matchPadded = clean.match(/(\d{1,2})$/);
      if (matchPadded) {
        const num = parseInt(matchPadded[1], 10);
        if (num >= 1 && num <= 20) {
          const targetId = `bidder-${num < 10 ? `0${num}` : num}`;
          found = MOCK_BIDDERS.find((b) => b.id === targetId);
          if (found) return found;
        }
      }

      found = MOCK_BIDDERS.find(
        (b) => clean.includes(b.id.toLowerCase()) || b.id.toLowerCase().includes(clean) || b.company_name.toLowerCase().includes(clean)
      );
      return found || MOCK_BIDDERS[0];
    };

    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      return findInMock(bidderId);
    }

    try {
      let { data, error } = await (supabase.from('bidders') as any)
        .select('*')
        .eq('id', dbBidderId)
        .single();

      if (error || !data) {
        // Try searching by bidder_code
        const codeMatch = bidderId.toUpperCase().replace('BIDDER-', 'BIDDER-0');
        const { data: codeData } = await (supabase.from('bidders') as any)
          .select('*')
          .eq('bidder_code', codeMatch)
          .single();

        data = codeData;
      }

      if (!data) {
        return findInMock(bidderId);
      }

      const bidder = this.mapDbRowToBidder(data);
      const [docs, compliance] = await Promise.all([
        documentService.getDocumentsForBidder(bidder.id),
        complianceService.getComplianceResultsForBidder(bidder.id),
      ]);

      return {
        ...bidder,
        documents: docs,
        compliance_results: compliance,
      };
    } catch {
      return findInMock(bidderId);
    }
  },

  async updateBidderStatus(
    bidderId: string,
    status: string,
    decision: OfficerDecision,
    decisionNotes: string,
    score?: number,
    riskLevel?: RiskLevel
  ): Promise<boolean> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      const mockBidder = MOCK_BIDDERS.find((b) => b.id === bidderId || b.id.includes(bidderId));
      if (mockBidder) {
        mockBidder.officer_decision = decision;
        mockBidder.decision_notes = decisionNotes;
        mockBidder.decision_timestamp = new Date().toISOString();
        if (score !== undefined) mockBidder.overall_score = score;
        if (riskLevel !== undefined) mockBidder.risk_level = riskLevel;
      }
      return true;
    }

    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (score !== undefined) updateData.compliance_score = score;
      if (riskLevel !== undefined) updateData.risk_level = riskLevel;

      const { error } = await (supabase.from('bidders') as any)
        .update(updateData)
        .eq('id', dbBidderId);

      if (error) {
        console.error('Failed to update bidder status:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error updating bidder:', err);
      return false;
    }
  },

  mapDbRowToBidder(row: any): Bidder {
    let decision: OfficerDecision = 'PENDING';
    if (row.status === 'ELIGIBLE') decision = 'QUALIFIED';
    else if (row.status === 'DISQUALIFIED' || row.status === 'DEBARRED') decision = 'DISQUALIFIED';
    else if (row.status === 'REVIEW_REQUIRED' || row.status === 'MISMATCH') decision = 'CLARIFICATION_REQUESTED';

    return {
      id: row.id,
      tender_id: row.tender_id,
      company_name: row.company_name,
      gst_number: row.gstin,
      pan_number: row.pan,
      udyam_registration: row.udyam_number || '',
      cin_number: `U72900${row.gstin.substring(0, 2)}2018PTC${row.bidder_code.replace('BIDDER-', '30000')}`,
      contact_person: `${row.company_name.split(' ')[0]} Representative`,
      contact_email: row.email,
      submission_date: row.created_at,
      overall_score: row.compliance_score ?? 0,
      risk_level: (row.risk_level as RiskLevel) || 'LOW',
      officer_decision: decision,
      decision_notes: undefined,
      decision_timestamp: undefined,
    };
  },
};
