import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_TENDER, MOCK_TENDERS, MOCK_REQUIREMENTS } from '../lib/mock-data/tender-seed';
import { Tender, Requirement } from '../lib/types';
import { resolveTenderId } from '../lib/idMapper';
import { tenderRequiredDocumentService } from './tenderRequiredDocumentService';
import { auditService } from './auditService';

// In-memory list for dynamically created tenders during session
let inMemoryTenders: Tender[] = [...MOCK_TENDERS];
let tenderDraft: Partial<Tender> | null = null;

export const tenderService = {
  async getTender(id: string): Promise<Tender> {
    const dbTenderId = resolveTenderId(id);

    // Check in-memory store first
    const memoryFound = inMemoryTenders.find(
      (t) => t.id === id || t.id === dbTenderId || t.tender_number === id
    );
    // Load required documents
    const requiredDocs = await tenderRequiredDocumentService.getRequiredDocuments(id);

    if (memoryFound && !isSupabaseConfigured()) {
      return { ...memoryFound, required_documents: requiredDocs };
    }

    if (!isSupabaseConfigured()) {
      const base = memoryFound || MOCK_TENDER;
      return { ...base, required_documents: requiredDocs };
    }

    try {
      let { data: tender, error } = await (supabase.from('tenders') as any)
        .select('*')
        .eq('id', dbTenderId)
        .single();

      if (error || !tender) {
        // Fallback search by first active tender in DB
        const { data: firstTender } = await (supabase.from('tenders') as any)
          .select('*')
          .limit(1)
          .single();

        tender = firstTender;
      }

      if (!tender) {
        const base = memoryFound || MOCK_TENDER;
        return { ...base, required_documents: requiredDocs };
      }

      const clauses = await this.getTenderClauses(tender.id);

      return {
        id: tender.id,
        tender_number: tender.tender_number,
        title: tender.title,
        department: tender.department,
        estimated_budget: Number(tender.minimum_turnover) * 1.5,
        budget_formatted: `₹${(Number(tender.minimum_turnover) * 1.5 / 10000000).toFixed(2)} Crores`,
        deadline: tender.closing_date,
        created_at: tender.created_at,
        requirements: clauses,
        required_documents: requiredDocs,
      };
    } catch (err) {
      console.warn('Error querying tenders table:', err);
      const base = memoryFound || MOCK_TENDER;
      return { ...base, required_documents: requiredDocs };
    }
  },

  async getTenders(): Promise<Tender[]> {
    if (!isSupabaseConfigured()) {
      return inMemoryTenders;
    }

    try {
      const { data, error } = await (supabase.from('tenders') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return inMemoryTenders;
      }

      return data.map((t: any) => ({
        id: t.id,
        tender_number: t.tender_number,
        title: t.title,
        department: t.department,
        estimated_budget: Number(t.minimum_turnover) * 1.5,
        budget_formatted: `₹${(Number(t.minimum_turnover) * 1.5 / 10000000).toFixed(2)} Crores`,
        deadline: t.closing_date,
        created_at: t.created_at,
      }));
    } catch {
      return inMemoryTenders;
    }
  },

  async createTender(tender: Partial<Tender>): Promise<Tender> {
    const newId = tender.id || `tender-gem-${Date.now()}`;
    const newTenderNumber = tender.tender_number || `GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`;
    const budgetNum = typeof tender.estimated_budget === 'number' ? tender.estimated_budget : 50000000;
    const budgetFormatted = tender.budget_formatted || `₹${(budgetNum / 10000000).toFixed(2)} Crores`;

    const fullTender: Tender = {
      id: newId,
      tender_number: newTenderNumber,
      title: tender.title || 'Untitled GeM Tender RFP',
      department: tender.department || 'Department of Public Procurement & IT Infrastructure',
      description: tender.description || '',
      estimated_budget: budgetNum,
      budget_formatted: budgetFormatted,
      deadline: tender.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
      requirements: tender.requirements || MOCK_REQUIREMENTS,
      required_documents: tender.required_documents || [],
    };

    if (tender.required_documents && tender.required_documents.length > 0) {
      tenderRequiredDocumentService.setInitialDocumentsForTender(newId, tender.required_documents);
    }

    inMemoryTenders.unshift(fullTender);

    if (isSupabaseConfigured()) {
      try {
        await (supabase.from('tenders') as any).insert({
          id: fullTender.id,
          tender_number: fullTender.tender_number,
          title: fullTender.title,
          department: fullTender.department,
          description: fullTender.description,
          minimum_turnover: fullTender.estimated_budget / 1.5,
          closing_date: fullTender.deadline,
        });
      } catch (e) {
        console.warn('Failed to insert tender to Supabase:', e);
      }
    }

    // Record Audit Log: TENDER_CREATED
    await auditService.recordAuditLog({
      actor: 'OFFICER',
      tenderId: fullTender.id,
      action: 'TENDER_CREATED',
      metadata: {
        tender_number: fullTender.tender_number,
        title: fullTender.title,
        department: fullTender.department,
        budget: fullTender.estimated_budget,
        clauses_count: fullTender.requirements?.length || 0,
        required_docs_count: fullTender.required_documents?.length || 0,
      },
    });

    this.clearDraft();

    return fullTender;
  },

  async saveDraft(draft: Partial<Tender>): Promise<void> {
    tenderDraft = { ...draft, created_at: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gem_tender_draft', JSON.stringify(tenderDraft));
      } catch (e) {
        console.warn('LocalStorage saveDraft error:', e);
      }
    }

    await auditService.recordAuditLog({
      actor: 'OFFICER',
      tenderId: draft.id || 'draft',
      action: 'TENDER_DRAFT_SAVED',
      metadata: {
        title: draft.title,
        tender_number: draft.tender_number,
        department: draft.department,
        clauses_count: draft.requirements?.length || 0,
        required_docs_count: draft.required_documents?.length || 0,
      },
    });
  },

  getDraft(): Partial<Tender> | null {
    if (tenderDraft) return tenderDraft;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gem_tender_draft');
        if (stored) {
          tenderDraft = JSON.parse(stored);
          return tenderDraft;
        }
      } catch {
        return null;
      }
    }
    return null;
  },

  clearDraft(): void {
    tenderDraft = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('gem_tender_draft');
      } catch {
        // ignore
      }
    }
  },

  async getTenderClauses(tenderId: string): Promise<Requirement[]> {
    const dbTenderId = resolveTenderId(tenderId);

    if (!isSupabaseConfigured()) {
      return MOCK_REQUIREMENTS;
    }

    try {
      const { data, error } = await (supabase.from('tender_clauses') as any)
        .select('*')
        .eq('tender_id', dbTenderId)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_REQUIREMENTS;
      }

      return data.map((c: any) => ({
        id: c.id,
        tender_id: c.tender_id,
        clause_code: c.clause_code,
        clause_title: c.title,
        description: c.description,
        category: c.category as Requirement['category'],
        rule_type: 'NUMERIC_GTE',
        threshold_value: c.threshold,
        threshold_display: c.threshold,
        is_mandatory: c.mandatory,
        weight: c.weight,
      }));
    } catch {
      return MOCK_REQUIREMENTS;
    }
  },
};
