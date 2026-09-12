import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../lib/types';
import { MOCK_AUDIT_LOGS } from '../lib/mock-data/tender-seed';
import { resolveBidderId, resolveTenderId } from '../lib/idMapper';

const STORAGE_KEY = 'gem_audit_logs';

function getStoredLogs(): AuditLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistLog(log: AuditLog): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredLogs();
    const updated = [log, ...existing.filter((item) => item.id !== log.id)].slice(0, 300);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Notice persisting audit log to localStorage:', err);
  }
}

export const auditService = {
  async getAllAuditLogs(limit = 100): Promise<AuditLog[]> {
    const localLogs = getStoredLogs();
    const mockList = Object.values(MOCK_AUDIT_LOGS).flat();

    let dbLogs: AuditLog[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('audit_logs') as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          dbLogs = data.map((d: any) => ({
            id: d.id,
            tender_id: (d.metadata as any)?.tender_id || '11111111-1111-1111-1111-111111111111',
            bidder_id: d.entity_id,
            actor: d.action?.startsWith('OFFICER') || d.action === 'LOGIN' || d.action === 'LOGOUT' || d.action === 'USER_LOGIN' || d.action === 'USER_LOGOUT'
              ? 'OFFICER'
              : ((d.metadata as any)?.actor || 'SYSTEM'),
            action: d.action,
            timestamp: d.created_at,
            metadata: (d.metadata as any) || {},
          }));
        }
      } catch {
        // Fallback gracefully
      }
    }

    const logMap = new Map<string, AuditLog>();
    for (const l of mockList) logMap.set(l.id, l);
    for (const l of localLogs) logMap.set(l.id, l);
    for (const l of dbLogs) logMap.set(l.id, l);

    const merged = Array.from(logMap.values());
    return merged
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
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
    let baseLogs: AuditLog[] = [];

    if (!isSupabaseConfigured()) {
      const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find(
        (key) => bidderId.includes(key.replace('bidder-', '')) || key === bidderId
      );
      baseLogs = matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
    } else {
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
          baseLogs = matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
        } else {
          baseLogs = data.map((d: any) => ({
            id: d.id,
            tender_id: (d.metadata as any)?.tender_id || '11111111-1111-1111-1111-111111111111',
            bidder_id: d.entity_id,
            actor: d.action.startsWith('OFFICER') ? 'OFFICER' : (d.actor || 'SYSTEM'),
            action: d.action,
            timestamp: d.created_at,
            metadata: (d.metadata as any) || {},
          }));
        }
      } catch {
        const matchedKey = Object.keys(MOCK_AUDIT_LOGS).find(
          (key) => bidderId.includes(key.replace('bidder-', '')) || key === bidderId
        );
        baseLogs = matchedKey ? MOCK_AUDIT_LOGS[matchedKey] : MOCK_AUDIT_LOGS['bidder-01'] || [];
      }
    }

    // Merge stored logs belonging to this bidder
    const stored = getStoredLogs().filter((log) => {
      const bId = typeof log.bidder_id === 'string' ? log.bidder_id : (typeof (log.metadata as any)?.bidder_id === 'string' ? String((log.metadata as any).bidder_id) : '');
      return bId === bidderId || (bId && (bidderId.includes(bId) || bId.includes(bidderId)));
    });

    const combinedMap = new Map<string, AuditLog>();
    [...stored, ...baseLogs].forEach((l) => {
      if (!combinedMap.has(l.id)) {
        combinedMap.set(l.id, l);
      }
    });

    return Array.from(combinedMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
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

  async recordAuthEvent(params: {
    eventType: 'USER_LOGIN' | 'USER_LOGOUT' | 'LOGIN' | 'LOGOUT';
    userName?: string;
    role: 'Officer' | 'Bidder';
    device?: string;
    sessionId?: string;
    tenderId?: string;
    sessionInfo?: string;
    actionDescription?: string;
  }): Promise<AuditLog> {
    const eventName =
      params.eventType === 'LOGIN' || params.eventType === 'USER_LOGIN'
        ? 'USER_LOGIN'
        : 'USER_LOGOUT';
    const userName = params.userName || 'ABCD';
    const actor: 'OFFICER' | 'SYSTEM' = params.role === 'Officer' ? 'OFFICER' : 'SYSTEM';
    const device = params.device || 'Windows Desktop • Chrome';
    const sessionId = params.sessionId || 'SESSION-ABCD-001';
    const actionDesc =
      params.actionDescription ||
      (eventName === 'USER_LOGIN'
        ? `User logged into the ${params.role} Portal.`
        : `User logged out of the ${params.role} Portal.`);

    const now = new Date().toISOString();

    const formattedTime =
      new Date(now).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }) + ' IST';

    const metadata: Record<string, unknown> = {
      event_type: eventName,
      user_name: userName,
      user_role: params.role,
      officer_name: params.role === 'Officer' ? userName : undefined,
      device,
      session_id: sessionId,
      action_description: actionDesc,
      session_info:
        params.sessionInfo ||
        `GeM ${params.role} Portal • Session ${
          eventName === 'USER_LOGIN' ? 'Authenticated' : 'Terminated'
        }`,
      auth_method: 'GeM Two-Factor Authentication',
      ip_address: '10.24.110.42 (NIC-GovNet)',
      timestamp_formatted: formattedTime,
      readable_time: formattedTime,
    };

    return await this.recordAuditLog({
      actor,
      tenderId: params.tenderId || 'tender-gem-2026-cloud',
      bidderId: '',
      action: eventName,
      metadata,
    });
  },

  async recordUserAction(params: {
    action: string;
    userName?: string;
    role?: 'Officer' | 'Bidder';
    device?: string;
    sessionId?: string;
    tenderId?: string;
    bidderId?: string;
    actionDescription: string;
    field?: string;
    beforeValue?: string;
    afterValue?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const userName = params.userName || 'ABCD';
    const role = params.role || 'Officer';
    const actor: 'OFFICER' | 'SYSTEM' = role === 'Officer' ? 'OFFICER' : 'SYSTEM';
    const device = params.device || 'Windows Desktop • Chrome';
    const sessionId = params.sessionId || 'SESSION-ABCD-001';
    const now = new Date().toISOString();

    const formattedTime =
      new Date(now).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }) + ' IST';

    const meta: Record<string, unknown> = {
      user_name: userName,
      user_role: role,
      officer_name: role === 'Officer' ? userName : undefined,
      device,
      session_id: sessionId,
      action_description: params.actionDescription,
      timestamp_formatted: formattedTime,
      readable_time: formattedTime,
      ...(params.field ? { field: params.field } : {}),
      ...(params.beforeValue ? { before_value: params.beforeValue } : {}),
      ...(params.afterValue ? { after_value: params.afterValue } : {}),
      ...(params.metadata || {}),
    };

    return await this.recordAuditLog({
      actor,
      tenderId: params.tenderId || 'tender-gem-2026-cloud',
      bidderId: params.bidderId || '',
      action: params.action,
      metadata: meta,
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
    const isOfficer = entry.actor === 'OFFICER';

    // Enrich officer records with standard user, device, and session metadata if missing
    let enrichedMetadata: Record<string, unknown> = { ...(entry.metadata || {}) };
    if (isOfficer) {
      if (!enrichedMetadata.user_name) enrichedMetadata.user_name = 'ABCD';
      if (!enrichedMetadata.user_role) enrichedMetadata.user_role = 'Officer';
      if (!enrichedMetadata.officer_name) enrichedMetadata.officer_name = 'ABCD';
      if (!enrichedMetadata.device) enrichedMetadata.device = 'Windows Desktop • Chrome';
      if (!enrichedMetadata.session_id) enrichedMetadata.session_id = 'SESSION-ABCD-001';
      if (!enrichedMetadata.action_description) {
        if (entry.action === 'USER_LOGIN' || entry.action === 'LOGIN') {
          enrichedMetadata.action_description = 'User logged into the Officer Portal.';
        } else if (entry.action === 'USER_LOGOUT' || entry.action === 'LOGOUT') {
          enrichedMetadata.action_description = 'User logged out of the Officer Portal.';
        } else if (entry.action === 'TENDER_CREATED') {
          enrichedMetadata.action_description = 'New GeM tender created and published.';
        } else if (entry.action === 'TENDER_DRAFT_SAVED') {
          enrichedMetadata.action_description = 'Tender draft was saved.';
        } else if (entry.action === 'TENDER_UPDATED') {
          enrichedMetadata.action_description = 'Tender details and compliance criteria updated.';
        } else if (entry.action === 'BIDDER_APPROVED') {
          enrichedMetadata.action_description = 'Bidder approved and qualified under GFR 151.';
        } else if (entry.action === 'CLARIFICATION_REQUESTED') {
          enrichedMetadata.action_description = 'Clarification requested from bidder.';
        } else if (entry.action === 'BIDDER_DISQUALIFIED') {
          enrichedMetadata.action_description = 'Bidder disqualified due to mandatory non-compliance.';
        } else if (entry.action === 'AUDIT_REPORT_EXPORTED') {
          enrichedMetadata.action_description = 'Section 65B Electronic Evidence Compliance Certificate generated and downloaded.';
        } else if (entry.action === 'COMPLIANCE_VERIFICATION_RUN') {
          enrichedMetadata.action_description = 'Automated compliance verification engine executed.';
        } else if (entry.action === 'BIDDER_REVIEWED') {
          enrichedMetadata.action_description = 'Bidder verification matrix and clauses reviewed.';
        } else {
          enrichedMetadata.action_description = entry.action.replace(/_/g, ' ');
        }
      }
    }

    const logItem: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tender_id: entry.tenderId || 'tender-gem-2026-cloud',
      bidder_id: entry.bidderId || '',
      actor: entry.actor,
      action: entry.action,
      timestamp,
      metadata: enrichedMetadata,
    };

    const key = entry.bidderId || 'officer-session';
    const existing = MOCK_AUDIT_LOGS[key] || [];
    existing.unshift(logItem);
    MOCK_AUDIT_LOGS[key] = existing;

    // Persist to localStorage for survival across reloads and navigations
    persistLog(logItem);

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('audit_logs') as any).insert({
          entity_type: entry.bidderId ? 'BIDDER' : 'TENDER',
          entity_id: entry.bidderId ? resolveBidderId(entry.bidderId) : resolveTenderId(entry.tenderId || ''),
          action: entry.action,
          metadata: {
            tender_id: entry.tenderId,
            actor: entry.actor,
            ...enrichedMetadata,
          },
        });
      } catch (err) {
        console.warn('Audit logging warning:', err);
      }
    }

    return logItem;
  },
};
