/**
 * Udyam MSME Verification Adapter
 * Connects to simulated Ministry of MSME Udyam Registration portal API.
 * Validates enterprise category (Micro/Small/Medium) and registration status.
 */

import { VerificationAdapter } from './base';
import { UdyamVerificationResult } from '../types';

export interface UdyamAdapterInput {
  udyam_number: string;
  company_name?: string;
}

const UDYAM_MOCK_DATABASE: Record<string, Partial<UdyamVerificationResult>> = {
  'UDYAM-AA-01-0000001': {
    udyam_number: 'UDYAM-AA-01-0000001',
    enterprise_name: 'ABCD Technologies',
    msme_category: 'Medium',
    major_activity: 'Services',
    registration_date: '2020-09-15',
    social_category: 'General',
    women_owned: false,
    is_verified: true,
  },
  'UDYAM-DL-01-0089123': {
    udyam_number: 'UDYAM-AA-01-0000001',
    enterprise_name: 'ABCD Technologies',
    msme_category: 'Medium',
    major_activity: 'Services',
    registration_date: '2020-09-15',
    social_category: 'General',
    women_owned: false,
    is_verified: true,
  },
  'UDYAM-BB-02-0000002': {
    udyam_number: 'UDYAM-BB-02-0000002',
    enterprise_name: 'BCDE Solutions',
    msme_category: 'Small',
    major_activity: 'Services',
    registration_date: '2021-03-22',
    social_category: 'General',
    women_owned: true,
    is_verified: true,
  },
  'UDYAM-MH-02-0045612': {
    udyam_number: 'UDYAM-BB-02-0000002',
    enterprise_name: 'BCDE Solutions',
    msme_category: 'Small',
    major_activity: 'Services',
    registration_date: '2021-03-22',
    social_category: 'General',
    women_owned: true,
    is_verified: true,
  },
  'UDYAM-CC-03-0000003': {
    udyam_number: 'UDYAM-CC-03-0000003',
    enterprise_name: 'CDEF Industries',
    msme_category: 'Medium',
    major_activity: 'Manufacturing',
    registration_date: '2019-11-05',
    social_category: 'General',
    women_owned: false,
    is_verified: false,
  },
  'UDYAM-TN-03-0099881': {
    udyam_number: 'UDYAM-CC-03-0000003',
    enterprise_name: 'CDEF Industries',
    msme_category: 'Medium',
    major_activity: 'Manufacturing',
    registration_date: '2019-11-05',
    social_category: 'General',
    women_owned: false,
    is_verified: false,
  },
};

export class UdyamAdapter extends VerificationAdapter<UdyamAdapterInput, UdyamVerificationResult> {
  readonly adapterName = 'MSME_UDYAM_REGISTRY_ADAPTER';
  readonly sourceEndpoint = 'https://udyamregistration.gov.in/api/v1/verifyEnterprise';

  protected async executeVerification(input: UdyamAdapterInput): Promise<UdyamVerificationResult> {
    const cleanUdyam = (input.udyam_number || '').trim().toUpperCase();

    if (UDYAM_MOCK_DATABASE[cleanUdyam]) {
      return UDYAM_MOCK_DATABASE[cleanUdyam] as UdyamVerificationResult;
    }

    const isValidPattern = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/.test(cleanUdyam);

    return {
      udyam_number: cleanUdyam || 'UDYAM-XX-00-0000000',
      enterprise_name: input.company_name || 'Registered MSME Entity',
      msme_category: 'Small',
      major_activity: 'Services',
      registration_date: '2021-01-01',
      social_category: 'General',
      women_owned: false,
      is_verified: isValidPattern,
    };
  }
}
