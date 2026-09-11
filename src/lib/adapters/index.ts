/**
 * External Registry Orchestrator
 * Runs GSTN, Udyam, and Debarment verifications concurrently with resilient aggregation.
 */

import { GSTNAdapter, GSTNAdapterInput } from './gstn';
import { UdyamAdapter, UdyamAdapterInput } from './udyam';
import { DebarmentAdapter, DebarmentAdapterInput } from './debarment';
import { ExternalRegistrySummary } from '../types';

export class RegistryVerificationService {
  private gstnAdapter = new GSTNAdapter();
  private udyamAdapter = new UdyamAdapter();
  private debarmentAdapter = new DebarmentAdapter();

  async verifyBidderRegistries(params: {
    gstin: string;
    pan: string;
    udyam: string;
    company_name: string;
    cin?: string;
  }): Promise<{
    summary: ExternalRegistrySummary;
    latencies: { gstn_ms: number; udyam_ms: number; debarment_ms: number; total_ms: number };
  }> {
    const startTime = Date.now();

    // Execute all 3 government registry queries concurrently
    const [gstnRes, udyamRes, debarmentRes] = await Promise.all([
      this.gstnAdapter.verify({
        gstin: params.gstin,
        expected_pan: params.pan,
        company_name: params.company_name,
      }),
      this.udyamAdapter.verify({
        udyam_number: params.udyam,
        company_name: params.company_name,
      }),
      this.debarmentAdapter.verify({
        pan_number: params.pan,
        cin_number: params.cin,
        company_name: params.company_name,
      }),
    ]);

    // Assess overall status
    let overallStatus: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
    if (debarmentRes.data?.is_blacklisted || gstnRes.data?.status === 'CANCELLED') {
      overallStatus = 'FAILED';
    } else if (gstnRes.data?.status !== 'ACTIVE' || !udyamRes.data?.is_verified) {
      overallStatus = 'WARNING';
    }

    const summary: ExternalRegistrySummary = {
      gstn: gstnRes.data!,
      udyam: udyamRes.data!,
      debarment: debarmentRes.data!,
      checked_at: new Date().toISOString(),
      overall_registry_status: overallStatus,
    };

    return {
      summary,
      latencies: {
        gstn_ms: gstnRes.execution_ms,
        udyam_ms: udyamRes.execution_ms,
        debarment_ms: debarmentRes.execution_ms,
        total_ms: Date.now() - startTime,
      },
    };
  }
}

export const registryService = new RegistryVerificationService();
