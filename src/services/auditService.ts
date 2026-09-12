import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../lib/types';
import { MOCK_AUDIT_LOGS } from '../lib/mock-data/tender-seed';
import { resolveBidderId, resolveTenderId } from '../lib/idMapper';

export const auditService = {
  async getAllAuditLogs(limit = 100): Promise<AuditLog[]> {
    if (!isSupabaseConfigured()) {
      const all = Object.values(MOCK_AUDIT_LOGS).flat();
      return all
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    try {
      const { data, error } = await (supabase.from('audit_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        const all = Object.values(MOCK_AUDIT_LOGS).flat();
        return all
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      }

      return data.map((d: any) => ({
        id: d.id,
        tender_id: (d.metadata as any)?.tender_id || '11111111-1111-1111-1111-111111111111',
        bidder_id: d.entity_id,
        actor: d.action?.startsWith('OFFICER') ? 'OFFICER' : ((d.metadata as any)?.actor || 'SYSTEM'),
        action: d.action,
        timestamp: d.created_at,
        metadata: (d.metadata as any) || {},
      }));
    } catch {
      const all = Object.values(MOCK_AUDIT_LOGS).flat();
      return all
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }
  },

  /**
   * Role-based filtered logs retrieval at the data layer
   * - Officer: Sees officer audit/adjudication logs + relevant bidder verification runs. Never sees bidder-private logs.
   * - Bidder: Sees ONLY their own submission & verification logs. Never sees officer internal logs or other bidders.
   */
  async getLogsForRole(role: 'officer' | 'bidder', bidderId?: string, limit = 100): Promise<AuditLog[]> {
    if (role === 'bidder') {
      if (!bidderId) return [];

      const bidderLogs = await this.getAuditLogsForBidder(bidderId, limit);

      // Strict Bidder Isolation:
      // - Must only be for THIS bidder
      // - Must NOT contain other bidders
      // - Must NOT contain internal officer audit notes or officer-only admin logs
      return bidderLogs
        .filter((log) => {
          const belongsToBidder =
            log.bidder_id === bidderId ||
            log.bidder_id?.includes(bidderId) ||
            bidderId.includes(log.bidder_id || '');

          if (!belongsToBidder) return false;

          // Exclude internal officer-only events
          if (
            log.action === 'OFFICER_LOGIN_DSC_VERIFIED' ||
            log.action === 'OFFICER_SESSION_STARTED' ||
            log.action === 'OFFICER_TOKEN_AUDITED' ||
            log.metadata?.is_internal_officer_only === true
          ) {
            return false;
          }

          return true;
        })
        .map((log) => {
          // Sanitize internal officer metadata before returning to bidder
          if (log.actor === 'OFFICER') {
            const sanitizedMeta = { ...(log.metadata || {}) };
            delete sanitizedMeta.internal_notes;
            delete sanitizedMeta.internal_deliberations;
            delete sanitizedMeta.ip_address;
            return {
              ...log,
              metadata: sanitizedMeta,
            };
          }
          return log;
        });
    }

    // Officer Role:
    // Can see all officer adjudication, GFR 151 compliance evaluations, external registry checks, and verification runs
    const all = await this.getAllAuditLogs(limit);
    return all.filter((log) => {
      // Omit private bidder activity that is not part of official procurement submission
      if (log.metadata?.is_private_bidder_draft === true) {
        return false;
      }
      return true;
    });
  },

  async getAuditLogsForBidder(bidderId: string, limit = 50): Promise<AuditLog[]> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find(
        (key) => bidderId.includes(key.replace('bidder-', '')) || key === bidderId
      );
      const list = matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
      return list.slice(0, limit);
    }

    try {
      let { data, error } = await (supabase.from('audit_logs') as any)
        .select('*')
        .eq('entity_id', dbBidderId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        await this.seedInitialAuditLog(dbBidderId, bidderId);

        const { data: seededData } = await (supabase.from('audit_logs') as any)
          .select('*')
          .eq('entity_id', dbBidderId)
          .order('created_at', { ascending: false })
          .limit(limit);

        data = seededData || [];
      }

      if (!data || data.length === 0) {
        const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find(
          (key) => bidderId.includes(key.replace('bidder-', '')) || key === bidderId
        );
        return matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
      }

      return data.map((d: any) => ({
        id: d.id,
        tender_id: (d.metadata as any)?.tender_id || '11111111-1111-1111-1111-111111111111',
        bidder_id: d.entity_id,
        actor: d.action.startsWith('OFFICER') ? 'OFFICER' : 'SYSTEM',
        action: d.action,
        timestamp: d.created_at,
        metadata: (d.metadata as any) || {},
      }));
    } catch {
      const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find(
        (key) => bidderId.includes(key.replace('bidder-', '')) || key === bidderId
      );
      return matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
    }
  },

  async seedInitialAuditLog(dbBidderId: string, originalId: string): Promise<void> {
    const matchedKey =
      Object.keys(MOCK_AUDIT_LOGS).find(
        (key) => originalId.includes(key.replace('bidder-', '')) || key === originalId
      ) || 'bidder-01';
    const logs = MOCK_AUDIT_LOGS[matchedKey] || [];

    const rowsToInsert = logs.map((l) => ({
      entity_type: 'BIDDER',
      entity_id: dbBidderId,
      action: l.action,
      created_at: l.timestamp,
      metadata: {
        tender_id: '11111111-1111-1111-1111-111111111111',
        ...(l.metadata || {}),
      },
    }));

    try {
      if (rowsToInsert.length > 0) {
        await (supabase.from('audit_logs') as any).insert(rowsToInsert);
      }
    } catch (err) {
      console.warn('Notice seeding initial audit log:', err);
    }
  },

  async logAction(bidderId: string, action: string, metadata: Record<string, unknown>): Promise<void> {
    await this.recordAuditLog({
      actor: action.startsWith('OFFICER') ? 'OFFICER' : 'SYSTEM',
      bidderId,
      action,
      metadata,
    });
  },

  async recordAuditLog(entry: {
    actor: 'SYSTEM' | 'OFFICER';
    tenderId?: string;
    bidderId?: string;
    action: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const timestamp = new Date().toISOString();
    const logItem: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tender_id: entry.tenderId || '11111111-1111-1111-1111-111111111111',
      bidder_id: entry.bidderId || '',
      actor: entry.actor,
      action: entry.action,
      timestamp,
      metadata: entry.metadata || {},
    };

    if (entry.bidderId) {
      const existing = MOCK_AUDIT_LOGS[entry.bidderId] || [];
      existing.unshift(logItem);
      MOCK_AUDIT_LOGS[entry.bidderId] = existing;
    }

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('audit_logs') as any).insert({
          entity_type: entry.bidderId ? 'BIDDER' : 'TENDER',
          entity_id: entry.bidderId ? resolveBidderId(entry.bidderId) : resolveTenderId(entry.tenderId || ''),
          action: entry.action,
          metadata: {
            tender_id: entry.tenderId,
            actor: entry.actor,
            ...(entry.metadata || {}),
          },
        });
      } catch (err) {
        console.warn('Audit logging warning:', err);
      }
    }

    return logItem;
  },
};
