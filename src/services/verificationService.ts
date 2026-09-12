import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ExternalRegistrySummary } from '../lib/types';
import { resolveBidderId } from '../lib/idMapper';

export const verificationService = {
  async getRegistryVerifications(bidderId: string): Promise<ExternalRegistrySummary> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      return this.getSimulatedSummaryForBidder(bidderId);
    }

    try {
      let { data, error } = await (supabase.from('registry_verifications') as any)
        .select('*')
        .eq('bidder_id', dbBidderId);

      if (error || !data || data.length === 0) {
        // Automatically seed registry verification records into Supabase for this bidder
        const summary = this.getSimulatedSummaryForBidder(bidderId);
        await this.seedRegistryVerificationsInDb(dbBidderId, summary);

        // Fetch back inserted data
        const { data: seededData } = await (supabase.from('registry_verifications') as any)
          .select('*')
          .eq('bidder_id', dbBidderId);

        data = seededData || [];
      }

      if (!data || data.length === 0) {
        return this.getSimulatedSummaryForBidder(bidderId);
      }

      const gstRecord = data.find((r: any) => r.registry_type === 'GST');
      const msmeRecord = data.find((r: any) => r.registry_type === 'MSME_UDYAM');
      const cpppRecord = data.find((r: any) => r.registry_type === 'CPPP_BLACKLIST');

      const isBidder3 = dbBidderId.endsWith('223') || bidderId.includes('03') || bidderId.includes('cdef') || bidderId.includes('defg');

      return {
        gstn: {
          gstin: gstRecord?.registration_number || (isBidder3 ? '33CCCCC0000C1ZM' : '07AAAAA0000A1Z5'),
          legal_name: gstRecord?.verified_name || (isBidder3 ? 'CDEF Industries' : 'ABCD Technologies'),
          trade_name: gstRecord?.verified_name || (isBidder3 ? 'CDEF Industries' : 'ABCD Technologies'),
          status: (gstRecord?.status as any) || (isBidder3 ? 'CANCELLED' : 'ACTIVE'),
          registration_date: '2017-08-14',
          taxpayer_type: 'Regular',
          filing_frequency: 'MONTHLY',
          tax_compliance_score: gstRecord?.score ?? (isBidder3 ? 34 : 98),
          matched_pan: gstRecord?.registration_number?.substring(2, 12) || (isBidder3 ? 'CCCCC0000C' : 'AAAAA0000A'),
          state_jurisdiction: isBidder3 ? 'Tamil Nadu' : 'Delhi',
          is_verified: gstRecord?.status === 'ACTIVE',
        },
        udyam: {
          udyam_number: msmeRecord?.registration_number || (isBidder3 ? 'UDYAM-CC-03-0000003' : 'UDYAM-AA-01-0000001'),
          enterprise_name: msmeRecord?.verified_name || (isBidder3 ? 'CDEF Industries' : 'ABCD Technologies'),
          msme_category: 'Medium',
          major_activity: 'Services',
          registration_date: '2020-07-15',
          social_category: 'General',
          women_owned: false,
          is_verified: msmeRecord?.status === 'ACTIVE',
        },
        debarment: {
          pan_cin: cpppRecord?.registration_number || (isBidder3 ? 'CCCCC0000C' : 'AAAAA0000A'),
          is_blacklisted: cpppRecord?.status === 'DEBARRED',
          status: cpppRecord?.status === 'DEBARRED' ? 'DEBARRED' : 'CLEAR',
          debarring_agency: isBidder3 ? 'Central Procurement Authority / Debarment Wing' : undefined,
          order_number: isBidder3 ? 'CPA/PROC/DEBAR/2023/001' : undefined,
          reason: isBidder3 ? 'Critical non-performance & integrity violation order CPA/PROC/DEBAR/2023/001' : undefined,
          is_verified: true,
        },
        checked_at: gstRecord?.checked_at || new Date().toISOString(),
        overall_registry_status: isBidder3 ? 'FAILED' : 'PASSED',
      };
    } catch {
      return this.getSimulatedSummaryForBidder(bidderId);
    }
  },

  async seedRegistryVerificationsInDb(bidderId: string, summary: ExternalRegistrySummary): Promise<void> {
    try {
      await (supabase.from('registry_verifications') as any).insert([
        {
          bidder_id: bidderId,
          registry_type: 'GST',
          registration_number: summary.gstn.gstin,
          status: summary.gstn.status,
          score: summary.gstn.tax_compliance_score,
          verified_name: summary.gstn.legal_name,
          verification_reference: `GSTN-VERIFIED-${Date.now()}`,
          response_data: summary.gstn as any,
        },
        {
          bidder_id: bidderId,
          registry_type: 'MSME_UDYAM',
          registration_number: summary.udyam.udyam_number,
          status: summary.udyam.is_verified ? 'ACTIVE' : 'INACTIVE',
          score: 100,
          verified_name: summary.udyam.enterprise_name,
          verification_reference: `UDYAM-VERIFIED-${Date.now()}`,
          response_data: summary.udyam as any,
        },
        {
          bidder_id: bidderId,
          registry_type: 'CPPP_BLACKLIST',
          registration_number: summary.debarment.pan_cin,
          status: summary.debarment.is_blacklisted ? 'DEBARRED' : 'CLEARED',
          score: summary.debarment.is_blacklisted ? 0 : 100,
          verified_name: summary.debarment.reason || 'CPPP Clean Standing',
          verification_reference: `CPPP-VERIFIED-${Date.now()}`,
          response_data: summary.debarment as any,
        },
      ]);
    } catch (err) {
      console.warn('Notice seeding registry verifications:', err);
    }
  },

  getSimulatedSummaryForBidder(bidderId: string): ExternalRegistrySummary {
    const isBidder3 = bidderId.endsWith('223') || bidderId.includes('03') || bidderId.includes('cdef') || bidderId.includes('defg');
    const isBidder2 = bidderId.endsWith('222') || bidderId.includes('02') || bidderId.includes('bcde');

    if (isBidder3) {
      return {
        gstn: {
          gstin: '33CCCCC0000C1ZM',
          legal_name: 'CDEF Industries',
          trade_name: 'CDEF Industries',
          status: 'CANCELLED',
          registration_date: '2015-05-10',
          taxpayer_type: 'Regular',
          filing_frequency: 'MONTHLY',
          tax_compliance_score: 34,
          matched_pan: 'CCCCC0000C',
          state_jurisdiction: 'Tamil Nadu',
          is_verified: false,
        },
        udyam: {
          udyam_number: 'UDYAM-CC-03-0000003',
          enterprise_name: 'CDEF Industries',
          msme_category: 'Medium',
          major_activity: 'Services',
          registration_date: '2020-09-12',
          social_category: 'General',
          women_owned: false,
          is_verified: true,
        },
        debarment: {
          pan_cin: 'CCCCC0000C',
          is_blacklisted: true,
          status: 'DEBARRED',
          debarring_agency: 'Central Procurement Authority / Debarment Wing',
          order_number: 'CPA/PROC/DEBAR/2023/001',
          reason: 'Critical non-performance & debarment order CPA/PROC/DEBAR/2023/001',
          is_verified: true,
        },
        checked_at: new Date().toISOString(),
        overall_registry_status: 'FAILED',
      };
    }

    if (isBidder2) {
      return {
        gstn: {
          gstin: '27BBBBB0000B1ZQ',
          legal_name: 'BCDE Solutions',
          trade_name: 'BCDE Solutions',
          status: 'ACTIVE',
          registration_date: '2019-02-10',
          taxpayer_type: 'Regular',
          filing_frequency: 'MONTHLY',
          tax_compliance_score: 84,
          matched_pan: 'BBBBB0000B',
          state_jurisdiction: 'Maharashtra',
          is_verified: true,
        },
        udyam: {
          udyam_number: 'UDYAM-BB-02-0000002',
          enterprise_name: 'BCDE Solutions',
          msme_category: 'Small',
          major_activity: 'Services',
          registration_date: '2020-11-20',
          social_category: 'General',
          women_owned: false,
          is_verified: true,
        },
        debarment: {
          pan_cin: 'BBBBB0000B',
          is_blacklisted: false,
          status: 'CLEAR',
          is_verified: true,
        },
        checked_at: new Date().toISOString(),
        overall_registry_status: 'PASSED',
      };
    }

    return {
      gstn: {
        gstin: '07AAAAA0000A1Z5',
        legal_name: 'ABCD Technologies',
        trade_name: 'ABCD Technologies',
        status: 'ACTIVE',
        registration_date: '2017-08-14',
        taxpayer_type: 'Regular',
        filing_frequency: 'MONTHLY',
        tax_compliance_score: 98,
        matched_pan: 'AAAAA0000A',
        state_jurisdiction: 'Delhi',
        is_verified: true,
      },
      udyam: {
        udyam_number: 'UDYAM-AA-01-0000001',
        enterprise_name: 'ABCD Technologies',
        msme_category: 'Medium',
        major_activity: 'Services',
        registration_date: '2020-07-15',
        social_category: 'General',
        women_owned: false,
        is_verified: true,
      },
      debarment: {
        pan_cin: 'AAAAA0000A',
        is_blacklisted: false,
        status: 'CLEAR',
        is_verified: true,
      },
      checked_at: new Date().toISOString(),
      overall_registry_status: 'PASSED',
    };
  },
};
