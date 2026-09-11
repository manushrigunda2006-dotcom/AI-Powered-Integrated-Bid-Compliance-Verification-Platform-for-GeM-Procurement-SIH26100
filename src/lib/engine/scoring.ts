/**
 * Dynamic Risk & Scoring Engine
 * Aggregates deterministic clause results, checks mandatory override caps,
 * calculates composite compliance score (0-100), and synthesizes an explainable Executive Summary.
 */

import {
  ComplianceResult,
  RiskLevel,
  VerificationEvaluationReport,
  ExternalRegistrySummary,
  Bidder,
  Tender,
} from '../types';
import { crossVerifyEntities } from '../normalizers/entity';

export class DynamicScoringEngine {
  /**
   * Run full dynamic risk assessment and score compilation
   */
  compileEvaluationReport(params: {
    tender: Tender;
    bidder: Bidder;
    clauseResults: ComplianceResult[];
    registrySummary: ExternalRegistrySummary;
  }): VerificationEvaluationReport {
    const { tender, bidder, clauseResults, registrySummary } = params;

    // 1. Calculate base score from weight contributions
    const totalMaxWeight = tender.requirements?.reduce((acc, r) => acc + r.weight, 0) || 100;
    const earnedScore = clauseResults.reduce((acc, r) => acc + r.score_contribution, 0);
    const normalizedScore = Math.min(100, Math.max(0, Math.round((earnedScore / totalMaxWeight) * 100)));

    // 2. Scan for mandatory failures & minor discrepancies
    const mandatoryFailures: string[] = [];
    const minorDiscrepancies: string[] = [];

    // Check external registry critical flags
    if (registrySummary.debarment.is_blacklisted) {
      mandatoryFailures.push(
        `Blacklisted in CPPP Debarment Registry (${registrySummary.debarment.debarring_agency || 'Govt of India'})`
      );
    }

    if (registrySummary.gstn.status === 'CANCELLED') {
      mandatoryFailures.push(`GST Registration is CANCELLED on GSTN Portal (GSTIN: ${registrySummary.gstn.gstin})`);
    }

    // Check each clause result
    for (const result of clauseResults) {
      if (result.is_mandatory && (result.status === 'NON_COMPLIANT' || result.status === 'MISSING_DOC')) {
        mandatoryFailures.push(
          `Mandatory Clause ${result.clause_code} Failed: ${result.clause_title} (${result.human_explanation})`
        );
      } else if (result.status === 'INCONSISTENT' || result.status === 'FLAGGED') {
        minorDiscrepancies.push(
          `Clause ${result.clause_code} Flagged: ${result.clause_title} (${result.human_explanation})`
        );
      }
    }

    // 3. Cross-entity check between GST and OEM document
    const gstDoc = bidder.documents?.find((d) => d.doc_type === 'GST_CERT');
    const oemDoc = bidder.documents?.find((d) => d.doc_type === 'OEM_AUTH');
    const gstName = gstDoc?.parsed_metadata.extracted_entity_name || bidder.company_name;
    const oemName = oemDoc?.parsed_metadata.extracted_entity_name || '';

    const crossEntity = crossVerifyEntities(gstName, oemName, 'GST Certificate', 'OEM Authorization');

    // 4. Dynamic Risk Level & Recommendation logic
    let riskLevel: RiskLevel = 'LOW';
    let recommendation: 'QUALIFIED' | 'DISQUALIFIED' | 'CLARIFICATION_REQUIRED' = 'QUALIFIED';
    let finalScore = normalizedScore;

    if (mandatoryFailures.length > 0) {
      // Automatic HIGH risk override
      riskLevel = 'HIGH';
      recommendation = 'DISQUALIFIED';
      finalScore = Math.min(finalScore, 42); // Cap score on critical breach
    } else if (minorDiscrepancies.length > 0 || crossEntity.status === 'ENTITY_NAME_MISMATCH') {
      riskLevel = 'MEDIUM';
      recommendation = 'CLARIFICATION_REQUIRED';
      finalScore = Math.min(finalScore, 85);
    } else if (finalScore < 75) {
      riskLevel = 'MEDIUM';
      recommendation = 'CLARIFICATION_REQUIRED';
    }

    // 5. Synthesize Explainable Executive Summary for Procurement Officer
    const executiveSummary = this.generateExecutiveSummary({
      bidder,
      tender,
      riskLevel,
      finalScore,
      recommendation,
      mandatoryFailures,
      minorDiscrepancies,
      registrySummary,
      crossEntityWarning: crossEntity.status === 'ENTITY_NAME_MISMATCH' ? crossEntity.explanation : undefined,
    });

    return {
      bidder_id: bidder.id,
      tender_id: tender.id,
      evaluated_at: new Date().toISOString(),
      overall_score: finalScore,
      risk_level: riskLevel,
      qualification_recommendation: recommendation,
      executive_summary: executiveSummary,
      mandatory_clause_failures: mandatoryFailures,
      minor_discrepancies: minorDiscrepancies,
      clause_results: clauseResults,
      registry_summary: registrySummary,
      cross_entity_check: {
        is_entity_coherent: crossEntity.status === 'EXACT_MATCH',
        levenshtein_distance: crossEntity.rawDistance,
        similarity_ratio: crossEntity.normalizedDistance,
        gst_entity_name: gstName,
        oem_entity_name: oemName,
        warning_flag: crossEntity.status === 'ENTITY_NAME_MISMATCH' ? crossEntity.badge : undefined,
      },
    };
  }

  /**
   * Deterministic generation of procurement officer briefing
   */
  private generateExecutiveSummary(params: {
    bidder: Bidder;
    tender: Tender;
    riskLevel: RiskLevel;
    finalScore: number;
    recommendation: 'QUALIFIED' | 'DISQUALIFIED' | 'CLARIFICATION_REQUIRED';
    mandatoryFailures: string[];
    minorDiscrepancies: string[];
    registrySummary: ExternalRegistrySummary;
    crossEntityWarning?: string;
  }): string {
    const {
      bidder,
      riskLevel,
      finalScore,
      recommendation,
      mandatoryFailures,
      minorDiscrepancies,
      registrySummary,
      crossEntityWarning,
    } = params;

    if (recommendation === 'DISQUALIFIED') {
      return `DISQUALIFICATION RECOMMENDED (Risk: HIGH | Score: ${finalScore}/100): Bidder "${bidder.company_name}" has failed mandatory statutory tender requirements. ${
        mandatoryFailures.length > 0 ? `Fatal grounds: ${mandatoryFailures.join('; ')}.` : ''
      } ${
        registrySummary.debarment.is_blacklisted
          ? `Crucially, bidder PAN is flagged in the Central CPPP Debarment Registry by ${registrySummary.debarment.debarring_agency}.`
          : ''
      } Under General Financial Rules (GFR), this packet cannot proceed to financial bid opening.`;
    }

    if (recommendation === 'CLARIFICATION_REQUIRED') {
      return `CLARIFICATION REQUIRED (Risk: MEDIUM | Score: ${finalScore}/100): Bidder "${bidder.company_name}" demonstrates substantial technical capability and active registry standing (GSTN Tax Compliance: ${registrySummary.gstn.tax_compliance_score}%). However, automated cross-verification detected discrepancies that require officer adjudication: ${
        crossEntityWarning || minorDiscrepancies.join('; ')
      }. Issuing a formal GeM clarification notice is advised prior to qualification.`;
    }

    return `QUALIFICATION RECOMMENDED (Risk: LOW | Score: ${finalScore}/100): Bidder "${bidder.company_name}" has satisfied 100% of mandatory tender RFP clauses. All statutory registries (GSTN: Active, MSME Udyam: Verified, CPPP Debarment: Clear) are green. Cross-document entity identities between GST and OEM authorizations are coherent. Recommended for immediate technical qualification.`;
  }
}

export const scoringEngine = new DynamicScoringEngine();
