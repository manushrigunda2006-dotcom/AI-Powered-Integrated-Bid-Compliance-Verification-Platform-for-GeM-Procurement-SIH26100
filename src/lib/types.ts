/**
 * GeM Automated Verification and Compliance Assistant
 * Core Domain Models & Production-Ready TypeScript Types
 */

// ==========================================
// 1. Core Domain Enums
// ==========================================

export type RequirementCategory =
  | 'FINANCIAL'
  | 'EXPERIENCE'
  | 'STATUTORY'
  | 'TECHNICAL'
  | 'OEM';

export type RuleType =
  | 'NUMERIC_GTE'      // Threshold >= value (e.g., turnover, years in business)
  | 'DATE_BEFORE'      // Document valid_until >= tender deadline or issue date <= cutoff
  | 'EXACT_MATCH'      // PAN, GST, Legal entity strict match
  | 'EXISTS';          // Document or certification presence required

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type OfficerDecision =
  | 'PENDING'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'CLARIFICATION_REQUESTED';

export type DocumentType =
  | 'GST_CERT'
  | 'UDYAM'
  | 'UDYAM_CERT'
  | 'OEM_AUTH'
  | 'FINANCIAL_AUDIT'
  | 'AFFIDAVIT_BLACKLIST'
  | 'WORK_ORDER_EXPERIENCE'
  | 'TECHNICAL_BID'
  | 'PAN_CERT'
  | 'BANK_GUARANTEE'
  | 'OTHER';

export type ComplianceStatus =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'INCONSISTENT'
  | 'MISSING_DOC'
  | 'FLAGGED';

export type AuditActor = 'SYSTEM' | 'OFFICER';

export interface TenderRequiredDocument {
  id: string;
  tender_id: string;
  document_type: DocumentType;
  display_name: string;
  storage_path?: string;
  file_size?: number;
  is_mandatory: boolean;
  created_at: string;
  file_url?: string;
}

// ==========================================
// 2. Core Entity Interfaces
// ==========================================

export interface Tender {
  id: string;
  tender_number: string;          // e.g. "GEM/2026/B/892104"
  title: string;
  department: string;             // e.g. "Department of Public Procurement & IT Infrastructure"
  estimated_budget: number;       // Normalized float in INR (e.g. 45000000)
  budget_formatted: string;       // e.g. "₹4.50 Crores"
  deadline: string;               // ISO 8601 string
  created_at: string;
  description?: string;
  requirements?: Requirement[];
  required_documents?: TenderRequiredDocument[];
}

export interface Requirement {
  id: string;
  tender_id: string;
  clause_code: string;            // e.g. "R001", "R002"
  clause_title: string;           // e.g. "Minimum Average Annual Turnover"
  description: string;
  category: RequirementCategory;
  rule_type: RuleType;
  threshold_value: string;        // String representation for multi-type support (e.g., "30000000", "3", "ACTIVE")
  threshold_display: string;      // Human-readable (e.g. "₹3.00 Crores in last 3 FY")
  is_mandatory: boolean;
  weight: number;                 // Weight for compliance scoring (1 - 25)
}

export interface Bidder {
  id: string;
  tender_id: string;
  company_name: string;
  gst_number: string;
  pan_number: string;
  udyam_registration: string;
  cin_number?: string;
  contact_person: string;
  contact_email: string;
  submission_date: string;
  overall_score: number;          // 0 to 100
  compliance_score?: number;     // Alias for overall_score
  risk_level: RiskLevel;
  officer_decision: OfficerDecision;
  decision_notes?: string;
  decision_timestamp?: string;
  documents?: DocumentPacket[];
  compliance_results?: ComplianceResult[];
}

export interface DocumentPacket {
  id: string;
  bidder_id: string;
  file_name: string;
  doc_type: DocumentType;
  file_url: string;
  upload_date: string;
  page_count: number;
  parsed_metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  extracted_entity_name?: string;
  extracted_pan?: string;
  extracted_gstin?: string;
  extracted_turnover?: number;
  extracted_turnover_raw?: string;
  extracted_years_experience?: number;
  extracted_udyam_category?: 'Micro' | 'Small' | 'Medium';
  valid_from?: string;
  valid_until?: string;
  oem_authorized_brands?: string[];
  issuing_authority?: string;
  is_tampered_flag?: boolean;
  ocr_quality_score?: number;     // 0.0 to 1.0
  [key: string]: unknown;
}

export interface Evidence {
  id: string;
  requirement_id: string;
  document_id: string;
  document_type: DocumentType;
  document_name: string;
  extracted_value: string;
  source_page: number;
  snippet_text: string;
  confidence_score: number;       // 0.0 to 1.0
  bounding_box?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface ComplianceResult {
  id: string;
  requirement_id: string;
  bidder_id: string;
  clause_code: string;
  clause_title: string;
  category: RequirementCategory;
  is_mandatory: boolean;
  status: ComplianceStatus;
  risk_weight: number;            // 0 (no risk) to 100 (critical risk)
  score_contribution: number;     // Points awarded out of max requirement weight
  threshold_display: string;
  extracted_display: string;
  human_explanation: string;
  evidence?: Evidence;
  mismatch_details?: {
    type: 'NAME_MISMATCH' | 'PAN_MISMATCH' | 'EXPIRED' | 'INSUFFICIENT' | 'REGISTRY_DISCREPANCY';
    expected: string;
    actual: string;
    similarity_score?: number;
  };
}

export interface AuditLog {
  id: string;
  tender_id: string;
  bidder_id: string;
  actor: AuditActor;
  action: string;                 // e.g., "AUTOMATED_COMPLIANCE_RUN", "OFFICER_QUALIFIED", "OFFICER_REMARKS_UPDATED"
  timestamp: string;              // ISO 8601
  metadata: {
    previous_state?: string;
    new_state?: string;
    officer_name?: string;
    remarks?: string;
    score?: number;
    risk_level?: RiskLevel;
    rule_violations?: string[];
    [key: string]: unknown;
  };
}

// ==========================================
// 3. External Registry Interfaces
// ==========================================

export interface GSTNVerificationResult {
  gstin: string;
  legal_name: string;
  trade_name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  registration_date: string;
  taxpayer_type: 'Regular' | 'Composition';
  filing_frequency: 'MONTHLY' | 'QUARTERLY';
  tax_compliance_score: number;    // e.g. 96 (%)
  matched_pan: string;
  state_jurisdiction: string;
  is_verified: boolean;
}

export interface UdyamVerificationResult {
  udyam_number: string;
  enterprise_name: string;
  msme_category: 'Micro' | 'Small' | 'Medium';
  major_activity: 'Services' | 'Manufacturing';
  registration_date: string;
  social_category: 'General' | 'OBC' | 'SC' | 'ST';
  women_owned: boolean;
  is_verified: boolean;
}

export interface DebarmentVerificationResult {
  pan_cin: string;
  is_blacklisted: boolean;
  status: 'CLEAR' | 'DEBARRED' | 'UNDER_INVESTIGATION';
  debarring_agency?: string;
  order_number?: string;
  debarment_period?: {
    start_date: string;
    end_date: string;
  };
  reason?: string;
  is_verified: boolean;
}

export interface ExternalRegistrySummary {
  gstn: GSTNVerificationResult;
  udyam: UdyamVerificationResult;
  debarment: DebarmentVerificationResult;
  checked_at: string;
  overall_registry_status: 'PASSED' | 'WARNING' | 'FAILED';
}

// ==========================================
// 4. Verification Engine Output Models
// ==========================================

export interface VerificationEvaluationReport {
  bidder_id: string;
  tender_id: string;
  evaluated_at: string;
  overall_score: number;
  risk_level: RiskLevel;
  qualification_recommendation: 'QUALIFIED' | 'DISQUALIFIED' | 'CLARIFICATION_REQUIRED';
  executive_summary: string;
  mandatory_clause_failures: string[];
  minor_discrepancies: string[];
  clause_results: ComplianceResult[];
  registry_summary: ExternalRegistrySummary;
  cross_entity_check: {
    is_entity_coherent: boolean;
    levenshtein_distance: number;
    similarity_ratio: number;
    gst_entity_name: string;
    oem_entity_name: string;
    bank_entity_name?: string;
    warning_flag?: string;
  };
}
