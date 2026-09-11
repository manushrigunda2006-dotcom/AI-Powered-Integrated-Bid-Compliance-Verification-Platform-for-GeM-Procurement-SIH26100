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

  async getAuditLogsForBidder(bidderId: string, limit = 50): Promise<AuditLog[]> {
    const dbBidderId = resolveBidderId(bidderId);

    if (!isSupabaseConfigured()) {
      const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find((key) => bidderId.includes(key.replace('bidder-', '')));
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
        // Seed initial automated audit log into Supabase
        await this.seedInitialAuditLog(dbBidderId, bidderId);

        const { data: seededData } = await (supabase.from('audit_logs') as any)
          .select('*')
          .eq('entity_id', dbBidderId)
          .order('created_at', { ascending: false })
          .limit(limit);

        data = seededData || [];
      }

      if (!data || data.length === 0) {
        const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find((key) => bidderId.includes(key.replace('bidder-', '')));
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
      const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find((key) => bidderId.includes(key.replace('bidder-', '')));
      return matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
    }
  },

  async seedInitialAuditLog(dbBidderId: string, originalId: string): Promise<void> {
    const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find((key) => originalId.includes(key.replace('bidder-', ''))) || 'bidder-01';
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

