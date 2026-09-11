import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel, ComplianceStatus, OfficerDecision } from "./types";
export { formatIndianCurrency, parseIndianCurrency } from "./normalizers/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateString);
  }
}

export function getRiskLevelBadge(risk: RiskLevel): {
  label: string;
  className: string;
  icon: string;
  borderClass: string;
} {
  switch (risk) {
    case "LOW":
      return {
        label: "LOW RISK",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        borderClass: "border-emerald-500",
        icon: "🟢",
      };
    case "MEDIUM":
      return {
        label: "MEDIUM RISK",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        borderClass: "border-amber-500",
        icon: "🟡",
      };
    case "HIGH":
      return {
        label: "HIGH RISK",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        borderClass: "border-rose-500",
        icon: "🔴",
      };
    default:
      return {
        label: "UNKNOWN",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        borderClass: "border-slate-400",
        icon: "⚪",
      };
  }
}

export interface ComplianceStatusBadgeConfig {
  label: string;
  className: string;
  icon: string;
}

/**
 * Normalizes any database, API, or legacy compliance status string to the canonical ComplianceStatus union.
 */
export function normalizeComplianceStatus(status?: string | null): ComplianceStatus {
  if (!status) return 'FLAGGED';
  const clean = String(status).trim().toUpperCase();
  switch (clean) {
    case 'COMPLIANT':
    case 'PASSED':
    case 'PASS':
      return 'COMPLIANT';
    case 'NON_COMPLIANT':
    case 'NON-COMPLIANT':
    case 'FAILED':
    case 'FAIL':
      return 'NON_COMPLIANT';
    case 'INCONSISTENT':
    case 'MISMATCH':
    case 'ENTITY_MISMATCH':
      return 'INCONSISTENT';
    case 'MISSING_DOC':
    case 'MISSING_DOCUMENT':
    case 'MISSING':
      return 'MISSING_DOC';
    case 'FLAGGED':
    case 'OFFICER_REVIEW':
    case 'REVIEW_REQUIRED':
    case 'REVIEW':
    case 'UNVERIFIED':
    case 'NOT_APPLICABLE':
    default:
      return 'FLAGGED';
  }
}

export const COMPLIANCE_STATUS_CONFIG: Record<ComplianceStatus, ComplianceStatusBadgeConfig> = {
  COMPLIANT: {
    label: 'Compliant',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: 'CheckCircle2',
  },
  NON_COMPLIANT: {
    label: 'Non-Compliant',
    className: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: 'XCircle',
  },
  INCONSISTENT: {
    label: 'Entity Mismatch',
    className: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: 'AlertTriangle',
  },
  MISSING_DOC: {
    label: 'Missing Document',
    className: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: 'FileWarning',
  },
  FLAGGED: {
    label: 'Officer Review',
    className: 'bg-purple-50 text-purple-800 border-purple-300',
    icon: 'AlertTriangle',
  },
};

export const FALLBACK_COMPLIANCE_STATUS: ComplianceStatusBadgeConfig = {
  label: 'Review Required',
  className: 'bg-amber-50 text-amber-800 border-amber-300',
  icon: 'AlertTriangle',
};

export function getComplianceStatusBadge(
  status?: ComplianceStatus | string | null
): ComplianceStatusBadgeConfig {
  if (!status) return FALLBACK_COMPLIANCE_STATUS;
  const normalized = normalizeComplianceStatus(status);
  return COMPLIANCE_STATUS_CONFIG[normalized] || FALLBACK_COMPLIANCE_STATUS;
}

export function getDecisionBadge(decision: OfficerDecision): {
  label: string;
  className: string;
} {
  switch (decision) {
    case "QUALIFIED":
      return {
        label: "Qualified (Approved)",
        className: "bg-emerald-600 text-white font-medium",
      };
    case "DISQUALIFIED":
      return {
        label: "Disqualified",
        className: "bg-rose-600 text-white font-medium",
      };
    case "CLARIFICATION_REQUESTED":
      return {
        label: "Clarification Requested",
        className: "bg-amber-500 text-white font-medium",
      };
    case "PENDING":
    default:
      return {
        label: "Adjudication Pending",
        className: "bg-slate-200 text-slate-700 font-medium",
      };
  }
}
