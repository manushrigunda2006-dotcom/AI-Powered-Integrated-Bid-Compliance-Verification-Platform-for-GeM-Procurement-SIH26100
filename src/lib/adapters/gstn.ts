/**
 * GSTN Verification Adapter
 * Connects to simulated Goods and Services Tax Network API.
 * Returns tax compliance score, active status, filing frequency, and legal entity details.
 */

import { VerificationAdapter } from './base';
import { GSTNVerificationResult } from '../types';

export interface GSTNAdapterInput {
  gstin: string;
  expected_pan?: string;
  company_name?: string;
}

// Simulated GSTN Mock Registry Database
const GSTN_MOCK_DATABASE: Record<string, Partial<GSTNVerificationResult>> = {
  // Bidder 1: Fully Compliant Tech Provider
  '07AAACB1234F1Z8': {
    gstin: '07AAACB1234F1Z8',
    legal_name: 'Bharat Datatech Solutions Private Limited',
    trade_name: 'Bharat Datatech',
    status: 'ACTIVE',
    registration_date: '2017-08-14',
    taxpayer_type: 'Regular',
    filing_frequency: 'MONTHLY',
    tax_compliance_score: 98,
    matched_pan: 'AAACB1234F',
    state_jurisdiction: 'Delhi Ward 42',
    is_verified: true,
  },
  // Bidder 2: Slight name variance & borderline compliance
  '27AABCA5678K1ZQ': {
    gstin: '27AABCA5678K1ZQ',
    legal_name: 'Apex Infoways India Private Limited',
    trade_name: 'Apex Infoways',
    status: 'ACTIVE',
    registration_date: '2019-02-10',
    taxpayer_type: 'Regular',
    filing_frequency: 'MONTHLY',
    tax_compliance_score: 84,
    matched_pan: 'AABCA5678K',
    state_jurisdiction: 'Maharashtra Range 3',
    is_verified: true,
  },
  // Bidder 3: Cancelled / Suspended GST
  '33AAACD9999L1ZM': {
    gstin: '33AAACD9999L1ZM',
    legal_name: 'Global Nexus Technologies Limited',
    trade_name: 'Nexus Tech',
    status: 'CANCELLED',
    registration_date: '2015-05-20',
    taxpayer_type: 'Regular',
    filing_frequency: 'QUARTERLY',
    tax_compliance_score: 34,
    matched_pan: 'AAACD9999L',
    state_jurisdiction: 'Tamil Nadu Zone 1',
    is_verified: false,
  },
};

export class GSTNAdapter extends VerificationAdapter<GSTNAdapterInput, GSTNVerificationResult> {
  readonly adapterName = 'GSTN_REGISTRY_ADAPTER_V2';
  readonly sourceEndpoint = 'https://api.gstn.gov.in/taxpayerapi/v1.2/search/taxpayer';

  protected async executeVerification(input: GSTNAdapterInput): Promise<GSTNVerificationResult> {
    const cleanGst = (input.gstin || '').trim().toUpperCase();

    // Check mock database or generate deterministic valid record
    if (GSTN_MOCK_DATABASE[cleanGst]) {
      return GSTN_MOCK_DATABASE[cleanGst] as GSTNVerificationResult;
    }

    // Dynamic mock for any other GSTIN format
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst);
    const extractedPan = isValidFormat ? cleanGst.substring(2, 12) : (input.expected_pan || 'AAXXX0000X');

    return {
      gstin: cleanGst,
      legal_name: input.company_name || 'Generic Registered Enterprise Pvt Ltd',
      trade_name: input.company_name || 'Generic Enterprise',
      status: isValidFormat ? 'ACTIVE' : 'INACTIVE',
      registration_date: '2018-04-01',
      taxpayer_type: 'Regular',
      filing_frequency: 'MONTHLY',
      tax_compliance_score: isValidFormat ? 92 : 45,
      matched_pan: extractedPan,
      state_jurisdiction: 'Central Tax Range 01',
      is_verified: isValidFormat,
    };
  }
}
