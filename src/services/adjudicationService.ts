import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { OfficerDecision } from '../lib/types';
import { bidderService } from './bidderService';
import { resolveBidderId } from '../lib/idMapper';
import { auditService } from './auditService';

export interface CommitAdjudicationParams {
  bidderId: string;
  action: 'APPROVE_QUALIFICATION' | 'REQUEST_CLARIFICATION' | 'REJECT_DISQUALIFY';
  remarks: string;
  officerName?: string;
  officerId?: string;
}

export const adjudicationService = {
  async commitAdjudication(params: CommitAdjudicationParams) {
    const { bidderId, action, remarks, officerName = 'ABCD', officerId } = params;
    const dbBidderId = resolveBidderId(bidderId);

    if (!remarks || remarks.trim().length === 0) {
      throw new Error('Officer remarks are required before committing a decision.');
    }

    let decisionState: OfficerDecision = 'PENDING';
    let newStatus = 'PENDING';

    if (action === 'APPROVE_QUALIFICATION') {
      decisionState = 'QUALIFIED';
      newStatus = 'ELIGIBLE';
    } else if (action === 'REQUEST_CLARIFICATION') {
      decisionState = 'CLARIFICATION_REQUESTED';
      newStatus = 'REVIEW_REQUIRED';
    } else if (action === 'REJECT_DISQUALIFY') {
      decisionState = 'DISQUALIFIED';
      newStatus = 'DISQUALIFIED';
    }

    const decisionHash = `SHA256-${Date.now().toString(16)}-${Math.random().toString(36).substring(2, 10)}`;
    const timestamp = new Date().toISOString();

    const eventAction =
      action === 'APPROVE_QUALIFICATION'
        ? 'BIDDER_APPROVED'
        : action === 'REQUEST_CLARIFICATION'
        ? 'CLARIFICATION_REQUESTED'
        : 'BIDDER_DISQUALIFIED';

    const afterVal =
      action === 'APPROVE_QUALIFICATION'
        ? 'Qualified'
        : action === 'REQUEST_CLARIFICATION'
        ? 'Clarification Requested'
        : 'Disqualified';

    const actionDesc =
      action === 'APPROVE_QUALIFICATION'
        ? `Bidder status changed from "Under Review" to "Qualified".`
        : action === 'REQUEST_CLARIFICATION'
        ? `Clarification requested from bidder. Status changed from "Under Review" to "Clarification Requested".`
        : `Bidder disqualified. Status changed from "Under Review" to "Disqualified".`;

    if (isSupabaseConfigured()) {
      try {
        const { data: bidder } = await (supabase.from('bidders') as any)
          .select('status, tender_id')
          .eq('id', dbBidderId)
          .single();

        const previousState = (bidder as any)?.status || 'PENDING';

        const { error: adjError } = await (supabase.from('adjudications') as any).insert({
          bidder_id: dbBidderId,
          officer_id: officerId || null,
          action,
          remarks,
          previous_state: previousState,
          new_state: newStatus,
          signed_at: timestamp,
        });

        if (adjError) {
          console.warn('Adjudication DB insert notice:', adjError);
        }

        await bidderService.updateBidderStatus(dbBidderId, newStatus, decisionState, remarks);

        await (supabase.from('audit_logs') as any).insert({
          user_id: officerId || null,
          entity_type: 'BIDDER',
          entity_id: dbBidderId,
          action: eventAction,
          old_value: { status: previousState },
          new_value: { status: newStatus },
          metadata: {
            officer_name: officerName,
            user_name: officerName,
            user_role: 'Officer',
            device: 'Windows Desktop • Chrome',
            session_id: 'SESSION-ABCD-001',
            action_description: actionDesc,
            field: 'Bidder Status',
            before_value: 'Under Review',
            after_value: afterVal,
            remarks,
            signed_at: timestamp,
            decision_hash: decisionHash,
            digital_signature: `Signed digitally by ${officerName}`,
          },
        });
      } catch (err) {
        console.error('Adjudication commit error:', err);
      }
    }

    // Local update
    await bidderService.updateBidderStatus(dbBidderId, newStatus, decisionState, remarks);

    // Record user action with Before -> After in audit trail
    try {
      await auditService.recordUserAction({
        action: eventAction,
        userName: officerName || 'ABCD',
        role: 'Officer',
        device: 'Windows Desktop • Chrome',
        sessionId: 'SESSION-ABCD-001',
        tenderId: 'tender-gem-2026-cloud',
        bidderId,
        actionDescription: actionDesc,
        field: 'Bidder Status',
        beforeValue: 'Under Review',
        afterValue: afterVal,
        metadata: {
          remarks,
          decision_state: decisionState,
          new_status: newStatus,
          decision_hash: decisionHash,
          digital_signature: `Signed digitally by ${officerName}`,
        },
      });
    } catch (err) {
      console.warn('Notice recording user action to audit log:', err);
    }

    return {
      success: true,
      decision_hash: decisionHash,
      signed_at: timestamp,
      new_status: newStatus,
      decision_state: decisionState,
    };
  },

  async getAdjudicationsForBidder(bidderId: string) {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('adjudications')
        .select('*')
        .eq('bidder_id', dbBidderId)
        .order('signed_at', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },
};
