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

      const isBidder3 = dbBidderId.endsWith('223') || bidderId.includes('03') || bidderId.includes('nexus');

      return {
        gstn: {
          gstin: gstRecord?.registration_number || (isBidder3 ? '33AAACD9999L1ZM' : '07AAACB1234F1Z8'),
          legal_name: gstRecord?.verified_name || (isBidder3 ? 'Global Nexus Technologies Limited' : 'Bharat Datatech Solutions Private Limited'),
          trade_name: gstRecord?.verified_name || (isBidder3 ? 'Global Nexus Tech' : 'Bharat Datatech'),
          status: (gstRecord?.status as any) || (isBidder3 ? 'CANCELLED' : 'ACTIVE'),
          registration_date: '2017-08-14',
          taxpayer_type: 'Regular',
          filing_frequency: 'MONTHLY',
          tax_compliance_score: gstRecord?.score ?? (isBidder3 ? 34 : 98),
          matched_pan: gstRecord?.registration_number?.substring(2, 12) || 'AAACB1234F',
          state_jurisdiction: isBidder3 ? 'Tamil Nadu' : 'Delhi',
          is_verified: gstRecord?.status === 'ACTIVE',
        },
        udyam: {
          udyam_number: msmeRecord?.registration_number || 'UDYAM-DL-01-0089123',
          enterprise_name: msmeRecord?.verified_name || (isBidder3 ? 'Global Nexus Technologies Limited' : 'Bharat Datatech Solutions Private Limited'),
          msme_category: 'Medium',
          major_activity: 'Services',
          registration_date: '2020-07-15',
          social_category: 'General',
          women_owned: false,
          is_verified: msmeRecord?.status === 'ACTIVE',
        },
        debarment: {
          pan_cin: cpppRecord?.registration_number || (isBidder3 ? 'AAACD9999L' : 'AAACB1234F'),
          is_blacklisted: cpppRecord?.status === 'DEBARRED',
          status: cpppRecord?.status === 'DEBARRED' ? 'DEBARRED' : 'CLEAR',
          debarring_agency: isBidder3 ? 'Ministry of Defence, DGOF Procurement Cell' : undefined,
          order_number: isBidder3 ? 'MOD/PROC/DEBAR/2023/1892' : undefined,
          reason: isBidder3 ? 'Critical non-performance & integrity violation order MOD/PROC/DEBAR/2023/1892' : undefined,
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
    const isBidder3 = bidderId.endsWith('223') || bidderId.includes('03') || bidderId.includes('nexus');
    const isBidder2 = bidderId.endsWith('222') || bidderId.includes('02') || bidderId.includes('apex');

    if (isBidder3) {
      return {
        gstn: {
          gstin: '33AAACD9999L1ZM',
          legal_name: 'Global Nexus Technologies Limited',
          trade_name: 'Global Nexus Tech',
          status: 'CANCELLED',
          registration_date: '2015-05-10',
          taxpayer_type: 'Regular',
          filing_frequency: 'MONTHLY',
          tax_compliance_score: 34,
          matched_pan: 'AAACD9999L',
          state_jurisdiction: 'Tamil Nadu',
          is_verified: false,
        },
        udyam: {
          udyam_number: 'UDYAM-TN-03-0099881',
          enterprise_name: 'Global Nexus Technologies Limited',
          msme_category: 'Medium',
          major_activity: 'Services',
          registration_date: '2020-09-12',
          social_category: 'General',
          women_owned: false,
          is_verified: true,
        },
        debarment: {
          pan_cin: 'AAACD9999L',
          is_blacklisted: true,
          status: 'DEBARRED',
          debarring_agency: 'Ministry of Defence, DGOF Procurement Cell',
          order_number: 'MOD/PROC/DEBAR/2023/1892',
          reason: 'Critical non-performance & debarment order MOD/PROC/DEBAR/2023/1892',
          is_verified: true,
        },
        checked_at: new Date().toISOString(),
        overall_registry_status: 'FAILED',
      };
    }

    if (isBidder2) {
      return {
        gstn: {
          gstin: '27AABC5678K1ZQ',
          legal_name: 'Apex Infoways India Private Limited',
          trade_name: 'Apex Infoways',
          status: 'ACTIVE',
          registration_date: '2019-02-10',
          taxpayer_type: 'Regular',
          filing_frequency: 'MONTHLY',
          tax_compliance_score: 84,
          matched_pan: 'AABCA5678K',
          state_jurisdiction: 'Maharashtra',
          is_verified: true,
        },
        udyam: {
          udyam_number: 'UDYAM-MH-02-0045612',
          enterprise_name: 'Apex Infoways India Private Limited',
          msme_category: 'Small',
          major_activity: 'Services',
          registration_date: '2020-11-20',
          social_category: 'General',
          women_owned: false,
          is_verified: true,
        },
        debarment: {
          pan_cin: 'AABCA5678K',
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
        gstin: '07AAACB1234F1Z8',
        legal_name: 'Bharat Datatech Solutions Private Limited',
        trade_name: 'Bharat Datatech',
        status: 'ACTIVE',
        registration_date: '2017-08-14',
        taxpayer_type: 'Regular',
        filing_frequency: 'MONTHLY',
        tax_compliance_score: 98,
        matched_pan: 'AAACB1234F',
        state_jurisdiction: 'Delhi',
        is_verified: true,
      },
      udyam: {
        udyam_number: 'UDYAM-DL-01-0089123',
        enterprise_name: 'Bharat Datatech Solutions Private Limited',
        msme_category: 'Medium',
        major_activity: 'Services',
        registration_date: '2020-07-15',
        social_category: 'General',
        women_owned: false,
        is_verified: true,
      },
      debarment: {
        pan_cin: 'AAACB1234F',
        is_blacklisted: false,
        status: 'CLEAR',
        is_verified: true,
      },
      checked_at: new Date().toISOString(),
      overall_registry_status: 'PASSED',
    };
  },
};
