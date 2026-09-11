import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolveBidderId } from '../lib/idMapper';

export interface ClarificationItem {
  id: string;
  bidder_id: string;
  clause_id: string | null;
  reason: string;
  status: 'OPEN' | 'RESPONDED' | 'RESOLVED' | 'REJECTED';
  requested_by: string | null;
  requested_at: string;
  response?: string | null;
  responded_at?: string | null;
}

export const clarificationService = {
  async getClarificationsForBidder(bidderId: string): Promise<ClarificationItem[]> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      if (bidderId.includes('02') || bidderId.includes('cdef')) {
        return [
          {
            id: 'clar-02',
            bidder_id: dbBidderId,
            clause_id: '33333333-3333-3333-3333-333333333005',
            reason:
              'Legal entity name variation detected between GST Certificate (CDEF Solutions Private Limited) and OEM Authorization Form (CDEF Solutions Technologies Pvt Ltd). Officer clarification required.',
            status: 'OPEN',
            requested_by: 'ABCD',
            requested_at: new Date().toISOString(),
          },
        ];
      }
      return [];
    }

    try {
      const { data, error } = await (supabase.from('clarifications') as any)
        .select('*')
        .eq('bidder_id', dbBidderId)
        .order('requested_at', { ascending: false });

      if (error || !data) return [];
      return data as ClarificationItem[];
    } catch {
      return [];
    }
  },

  async requestClarification(bidderId: string, clauseId: string | null, reason: string): Promise<boolean> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await (supabase.from('clarifications') as any).insert({
        bidder_id: dbBidderId,
        clause_id: clauseId,
        reason,
        status: 'OPEN',
      });

      return !error;
    } catch {
      return false;
    }
  },
};
