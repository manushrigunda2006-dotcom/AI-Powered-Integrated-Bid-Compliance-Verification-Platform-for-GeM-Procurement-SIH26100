import { Requirement, TenderRequiredDocument, RiskLevel, ComplianceStatus } from '../types';

export interface RfpAnalysisResult {
  tender_number: string;
  title: string;
  department: string;
  estimated_budget: number;
  budget_formatted: string;
  deadline_days: number;
  description: string;
  requirements: Requirement[];
  required_documents: TenderRequiredDocument[];
  key_observations: string[];
  is_ai_generated: boolean;
}

export interface BidderEvidenceAnalysisResult {
  bidder_name: string;
  extracted_entities: {
    gstin?: string;
    pan?: string;
    turnover_inr?: string;
    udyam?: string;
    experience_years?: number;
  };
  document_evaluations: Array<{
    doc_type: string;
    file_name: string;
    status: string;
    summary: string;
    red_flags: string[];
  }>;
  discrepancies: string[];
  is_ai_generated: boolean;
}

export interface ClauseExplanationItem {
  clause_code: string;
  clause_title: string;
  status: ComplianceStatus;
  statutory_ground: string;
  plain_english_explanation: string;
  gfr_or_gem_rule_ref: string;
}

export interface CrossEntityAnalysisResult {
  is_coherent: boolean;
  levenshtein_distance: number;
  similarity_ratio: number;
  legal_implications: string;
  explanation: string;
  recommended_action: string;
  is_ai_generated: boolean;
}

export interface RiskExplanationResult {
  risk_level: RiskLevel;
  overall_score: number;
  executive_summary: string;
  detected_concerns: string[];
  officer_recommendations: string[];
  gfr_compliance_notes: string[];
  is_ai_generated: boolean;
}

export interface GeminiFullEvaluationResult {
  is_ai_assisted: boolean;
  model_used: string;
  timestamp: string;
  risk_explanation: RiskExplanationResult;
  clause_explanations: Record<string, ClauseExplanationItem>;
  cross_entity_analysis: CrossEntityAnalysisResult;
  audit_disclaimer: string;
}
