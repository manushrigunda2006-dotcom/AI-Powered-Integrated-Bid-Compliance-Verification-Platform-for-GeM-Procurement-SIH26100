/**
 * Unified Compliance & Verification Service
 * Bridges mock data, external registry adapters, deterministic evaluator, and scoring engine.
 */

import {
  MOCK_TENDER,
  MOCK_BIDDERS,
  MOCK_AUDIT_LOGS,
} from '../mock-data/tender-seed';
import { Bidder, Tender, VerificationEvaluationReport, AuditLog, OfficerDecision } from '../types';
import { registryService } from '../adapters';
import { deterministicEvaluator } from './evaluator';
import { scoringEngine } from './scoring';

// In-memory state store for interactive session adjudication & audit trails
class VerificationStore {
  private tenders: Map<string, Tender> = new Map();
  private bidders: Map<string, Bidder> = new Map();
  private auditLogs: Map<string, AuditLog[]> = new Map();
  private reports: Map<string, VerificationEvaluationReport> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    this.tenders.set(MOCK_TENDER.id, MOCK_TENDER);
    for (const bidder of MOCK_BIDDERS) {
      this.bidders.set(bidder.id, bidder);
    }
    for (const [bidderId, logs] of Object.entries(MOCK_AUDIT_LOGS)) {
      this.auditLogs.set(bidderId, [...logs]);
    }
  }

  getTender(id: string): Tender | undefined {
    return this.tenders.get(id);
  }

  getBiddersForTender(tenderId: string): Bidder[] {
    return Array.from(this.bidders.values()).filter((b) => b.tender_id === tenderId);
  }

  getBidder(id: string): Bidder | undefined {
    return this.bidders.get(id);
  }

  getAuditLogs(bidderId: string): AuditLog[] {
    return this.auditLogs.get(bidderId) || [];
  }

  addAuditLog(log: AuditLog): void {
    const list = this.auditLogs.get(log.bidder_id) || [];
    list.unshift(log);
    this.auditLogs.set(log.bidder_id, list);
  }

  updateBidderDecision(
    bidderId: string,
    decision: OfficerDecision,
    remarks: string,
    officerName = 'ABCD'
  ): Bidder {
    const bidder = this.bidders.get(bidderId);
    if (!bidder) throw new Error(`Bidder not found: ${bidderId}`);

    const previousDecision = bidder.officer_decision;
    bidder.officer_decision = decision;
    bidder.decision_notes = remarks;
    bidder.decision_timestamp = new Date().toISOString();

    // Append to immutable audit log
    const auditEntry: AuditLog = {
      id: `audit-${Date.now()}`,
      tender_id: bidder.tender_id,
      bidder_id: bidder.id,
      actor: 'OFFICER',
      action: `OFFICER_DECISION_${decision}`,
      timestamp: new Date().toISOString(),
      metadata: {
        previous_state: previousDecision,
        new_state: decision,
        officer_name: officerName,
        remarks,
        final_score: bidder.overall_score,
        risk_level: bidder.risk_level,
      },
    };

    this.addAuditLog(auditEntry);
    this.bidders.set(bidderId, bidder);
    return bidder;
  }

  /**
   * Run full end-to-end verification pipeline on a bidder
   */
  async runFullVerification(bidderId: string): Promise<VerificationEvaluationReport> {
    const bidder = this.bidders.get(bidderId);
    if (!bidder) throw new Error(`Bidder not found: ${bidderId}`);

    const tender = this.tenders.get(bidder.tender_id);
    if (!tender) throw new Error(`Tender not found: ${bidder.tender_id}`);

    // Step 1: Query external registry adapters concurrently
    const { summary: registrySummary } = await registryService.verifyBidderRegistries({
      gstin: bidder.gst_number,
      pan: bidder.pan_number,
      udyam: bidder.udyam_registration,
      company_name: bidder.company_name,
      cin: bidder.cin_number,
    });

    // Step 2: Evaluate each requirement clause deterministically
    const clauseResults = (tender.requirements || []).map((req) => {
      return deterministicEvaluator.evaluateClause({
        tender_id: tender.id,
        tender_deadline: tender.deadline,
        tender_budget: tender.estimated_budget,
        requirement: req,
        bidder,
        documents: bidder.documents || [],
        registry_summary: registrySummary,
      });
    });

    // Step 3: Run Dynamic Scoring & Risk Engine
    const report = scoringEngine.compileEvaluationReport({
      tender,
      bidder,
      clauseResults,
      registrySummary,
    });

    // Update bidder cached score & risk level
    bidder.overall_score = report.overall_score;
    bidder.risk_level = report.risk_level;
    bidder.compliance_results = clauseResults;
    this.bidders.set(bidderId, bidder);
    this.reports.set(bidderId, report);

    return report;
  }
}

export const verificationStore = new VerificationStore();
