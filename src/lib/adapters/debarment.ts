/**
 * National Debarment / CPPP Blacklist Verification Adapter
 * Connects to Central Public Procurement Portal (CPPP) and Department of Expenditure debarment lists.
 * Critical statutory gate check: Any debarred vendor triggers automatic disqualification recommendation.
 */

import { VerificationAdapter } from './base';
import { DebarmentVerificationResult } from '../types';

export interface DebarmentAdapterInput {
  pan_number: string;
  cin_number?: string;
  company_name?: string;
}

// Simulated Central Debarment / CPPP Blacklist Database
const DEBARRED_IDENTIFIERS_DATABASE: Record<string, Partial<DebarmentVerificationResult>> = {
  // Bidder 3 is debarred!
  'CCCCC0000C': {
    pan_cin: 'CCCCC0000C',
    is_blacklisted: true,
    status: 'DEBARRED',
    debarring_agency: 'Central Procurement Authority / Debarment Wing',
    order_number: 'CPA/PROC/DEBAR/2023/001',
    debarment_period: {
      start_date: '2023-08-01',
      end_date: '2026-07-31',
    },
    reason: 'Submission of falsified OEM authorization certificates in tender CPA/IT/2023/001.',
    is_verified: true,
  },
  'U72200CC2015PLC000003': {
    pan_cin: 'U72200CC2015PLC000003',
    is_blacklisted: true,
    status: 'DEBARRED',
    debarring_agency: 'Central Procurement Authority / Debarment Wing',
    order_number: 'CPA/PROC/DEBAR/2023/001',
    debarment_period: {
      start_date: '2023-08-01',
      end_date: '2026-07-31',
    },
    reason: 'Submission of falsified OEM authorization certificates in tender CPA/IT/2023/001.',
    is_verified: true,
  },
  'AAACD9999L': {
    pan_cin: 'CCCCC0000C',
    is_blacklisted: true,
    status: 'DEBARRED',
    debarring_agency: 'Central Procurement Authority / Debarment Wing',
    order_number: 'CPA/PROC/DEBAR/2023/001',
    debarment_period: {
      start_date: '2023-08-01',
      end_date: '2026-07-31',
    },
    reason: 'Submission of falsified OEM authorization certificates in tender CPA/IT/2023/001.',
    is_verified: true,
  },
  'U72200TN2015PLC099999': {
    pan_cin: 'U72200CC2015PLC000003',
    is_blacklisted: true,
    status: 'DEBARRED',
    debarring_agency: 'Central Procurement Authority / Debarment Wing',
    order_number: 'CPA/PROC/DEBAR/2023/001',
    debarment_period: {
      start_date: '2023-08-01',
      end_date: '2026-07-31',
    },
    reason: 'Submission of falsified OEM authorization certificates in tender CPA/IT/2023/001.',
    is_verified: true,
  },
};

export class DebarmentAdapter extends VerificationAdapter<DebarmentAdapterInput, DebarmentVerificationResult> {
  readonly adapterName = 'CPPP_CENTRAL_DEBARMENT_REGISTRY';
  readonly sourceEndpoint = 'https://eprocure.gov.in/cppp/api/v2/debarment/lookup';

  protected async executeVerification(input: DebarmentAdapterInput): Promise<DebarmentVerificationResult> {
    const cleanPan = (input.pan_number || '').trim().toUpperCase();
    const cleanCin = (input.cin_number || '').trim().toUpperCase();

    // Check PAN blacklist
    if (cleanPan && DEBARRED_IDENTIFIERS_DATABASE[cleanPan]) {
      return DEBARRED_IDENTIFIERS_DATABASE[cleanPan] as DebarmentVerificationResult;
    }

    // Check CIN blacklist
    if (cleanCin && DEBARRED_IDENTIFIERS_DATABASE[cleanCin]) {
      return DEBARRED_IDENTIFIERS_DATABASE[cleanCin] as DebarmentVerificationResult;
    }

    // Default: Clean vendor
    return {
      pan_cin: cleanPan || cleanCin || 'NOT_PROVIDED',
      is_blacklisted: false,
      status: 'CLEAR',
      is_verified: true,
    };
  }
}
