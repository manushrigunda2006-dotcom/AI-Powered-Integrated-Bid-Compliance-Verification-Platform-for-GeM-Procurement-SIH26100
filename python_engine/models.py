"""
GeM Automated Verification and Compliance Assistant
Pydantic v2 Models for Deterministic Validation and Schema Enforcement
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class RequirementCategory(str, Enum):
    FINANCIAL = "FINANCIAL"
    EXPERIENCE = "EXPERIENCE"
    STATUTORY = "STATUTORY"
    TECHNICAL = "TECHNICAL"
    OEM = "OEM"


class RuleType(str, Enum):
    NUMERIC_GTE = "NUMERIC_GTE"
    DATE_BEFORE = "DATE_BEFORE"
    EXACT_MATCH = "EXACT_MATCH"
    EXISTS = "EXISTS"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class OfficerDecision(str, Enum):
    PENDING = "PENDING"
    QUALIFIED = "QUALIFIED"
    DISQUALIFIED = "DISQUALIFIED"
    CLARIFICATION_REQUESTED = "CLARIFICATION_REQUESTED"


class DocumentType(str, Enum):
    GST_CERT = "GST_CERT"
    UDYAM = "UDYAM"
    OEM_AUTH = "OEM_AUTH"
    FINANCIAL_AUDIT = "FINANCIAL_AUDIT"
    AFFIDAVIT_BLACKLIST = "AFFIDAVIT_BLACKLIST"
    WORK_ORDER_EXPERIENCE = "WORK_ORDER_EXPERIENCE"


class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    INCONSISTENT = "INCONSISTENT"
    MISSING_DOC = "MISSING_DOC"
    FLAGGED = "FLAGGED"


class RequirementModel(BaseModel):
    id: str
    tender_id: str
    clause_code: str = Field(..., pattern=r"^R\d{3}$")
    clause_title: str
    category: RequirementCategory
    rule_type: RuleType
    threshold_value: str
    is_mandatory: bool = True
    weight: int = Field(default=20, ge=1, le=100)


class DocumentPacketModel(BaseModel):
    id: str
    bidder_id: str
    file_name: str
    doc_type: DocumentType
    file_url: str
    page_count: int = Field(default=1, ge=1)
    parsed_metadata: Dict[str, Any] = Field(default_factory=dict)


class BidderModel(BaseModel):
    id: str
    tender_id: str
    company_name: str
    gst_number: str = Field(..., pattern=r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    udyam_registration: Optional[str] = None
    overall_score: float = Field(default=0.0, ge=0.0, le=100.0)
    risk_level: RiskLevel = RiskLevel.LOW
    officer_decision: OfficerDecision = OfficerDecision.PENDING
    documents: List[DocumentPacketModel] = Field(default_factory=list)


class EvidenceModel(BaseModel):
    id: str
    requirement_id: str
    document_id: str
    extracted_value: str
    source_page: int
    snippet_text: str
    confidence_score: float = Field(ge=0.0, le=1.0)


class ComplianceResultModel(BaseModel):
    id: str
    requirement_id: str
    bidder_id: str
    clause_code: str
    status: ComplianceStatus
    risk_weight: float = Field(ge=0.0, le=100.0)
    human_explanation: str
    evidence: Optional[EvidenceModel] = None


class AuditLogModel(BaseModel):
    id: str
    tender_id: str
    bidder_id: str
    actor: str = Field(..., pattern=r"^(SYSTEM|OFFICER)$")
    action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
