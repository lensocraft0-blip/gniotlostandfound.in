import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserProfile,
  ItemReport,
  ItemMatch,
  ItemClaim,
  CampusNotification,
  AuditLogEntry,
  ClaimStatus,
  ItemStatus,
} from '../types/database';
import { findSuggestedMatches } from '../lib/matching';

// Clean legacy demo items from browser storage on startup without touching real user drafts
try {
  localStorage.removeItem('gniot_sandbox_items');
  localStorage.removeItem('gniot_demo_user');
} catch {
  // Ignore browser sandbox exceptions
}

export const DataService = {
  // 1. ITEMS (Source of truth: Supabase PostgreSQL)
  async getItems(filters?: {
    report_type?: 'lost' | 'found';
    category?: string;
    campus_location?: string;
    search?: string;
    owner_id?: string;
    status?: string;
  }): Promise<ItemReport[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    try {
      let query = supabase.from('items').select('*').order('reported_at', { ascending: false });

      if (filters?.report_type) query = query.eq('report_type', filters.report_type);
      if (filters?.category && filters.category !== 'all') query = query.eq('category', filters.category);
      if (filters?.campus_location && filters.campus_location !== 'all') {
        query = query.eq('campus_location', filters.campus_location);
      }
      if (filters?.owner_id) query = query.eq('owner_id', filters.owner_id);
      if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters?.search) {
        const s = filters.search.trim();
        query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,brand.ilike.%${s}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase getItems error:', error.message);
        throw new Error(error.message);
      }

      return (data || []) as ItemReport[];
    } catch (err: unknown) {
      console.error('Failed fetching items from database:', err);
      throw err;
    }
  },

  async getItemById(id: string): Promise<ItemReport | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
    if (error) {
      console.error('Supabase getItemById error:', error.message);
      return null;
    }
    return data as ItemReport;
  },

  async createItem(item: Omit<ItemReport, 'id' | 'created_at' | 'updated_at'>): Promise<ItemReport> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to save records.');
    }

    // Check for duplicate recent reports by this user
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('owner_id', item.owner_id)
      .eq('title', item.title)
      .eq('category', item.category)
      .limit(1);

    if (existing && existing.length > 0) {
      console.warn('Duplicate report detected for user:', item.title);
    }

    const { data, error } = await supabase.from('items').insert([item]).select().single();
    if (error) {
      console.error('Supabase createItem error:', error.message);
      throw new Error(error.message);
    }

    // Log real audit entry
    await this.logAudit({
      action: 'ITEM_REPORTED',
      entity_type: 'item',
      entity_id: data.id,
      safe_metadata: { title: data.title, type: data.report_type, location: data.campus_location },
    });

    return data as ItemReport;
  },

  async updateItem(id: string, updates: Partial<ItemReport>): Promise<ItemReport | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateItem error:', error.message);
      throw new Error(error.message);
    }

    await this.logAudit({
      action: 'ITEM_UPDATED',
      entity_type: 'item',
      entity_id: id,
      safe_metadata: { status: updates.status },
    });

    return data as ItemReport;
  },

  async deleteItem(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteItem error:', error.message);
      throw new Error(error.message);
    }

    await this.logAudit({
      action: 'ITEM_DELETED',
      entity_type: 'item',
      entity_id: id,
      safe_metadata: {},
    });

    return true;
  },

  // 2. MATCHES (Calculated from real reports)
  async getSuggestedMatches(targetItem: ItemReport): Promise<ItemMatch[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    // Query opposing reports from real database
    const opposingType = targetItem.report_type === 'lost' ? 'found' : 'lost';
    const candidates = await this.getItems({
      report_type: opposingType,
      status: 'open',
    });

    return findSuggestedMatches(targetItem, candidates);
  },

  async getAllMatches(): Promise<ItemMatch[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const allItems = await this.getItems({ status: 'open' });
    const lostItems = allItems.filter((i) => i.report_type === 'lost');
    const foundItems = allItems.filter((i) => i.report_type === 'found');

    const allMatches: ItemMatch[] = [];
    for (const lost of lostItems) {
      const candidates = findSuggestedMatches(lost, foundItems);
      allMatches.push(...candidates);
    }

    return allMatches.sort((a, b) => b.score - a.score);
  },

  // 3. CLAIMS (Protected by Row Level Security)
  async getClaims(filters?: { claimant_id?: string; item_id?: string }): Promise<ItemClaim[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    let query = supabase.from('claims').select('*, items(*)').order('created_at', { ascending: false });
    if (filters?.claimant_id) query = query.eq('claimant_id', filters.claimant_id);
    if (filters?.item_id) query = query.eq('item_id', filters.item_id);

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getClaims error:', error.message);
      throw new Error(error.message);
    }

    return (data || []) as ItemClaim[];
  },

  async submitClaim(claim: {
    item_id: string;
    claimant_id: string;
    claimant_name: string;
    private_verification_answers: string;
    evidence_paths?: string[];
  }): Promise<ItemClaim> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const newClaim = {
      item_id: claim.item_id,
      claimant_id: claim.claimant_id,
      private_verification_answers: claim.private_verification_answers,
      evidence_paths: claim.evidence_paths || [],
      status: 'pending',
    };

    const { data, error } = await supabase.from('claims').insert([newClaim]).select().single();
    if (error) {
      console.error('Supabase submitClaim error:', error.message);
      throw new Error(error.message);
    }

    await this.logAudit({
      action: 'CLAIM_SUBMITTED',
      entity_type: 'claim',
      entity_id: data.id,
      safe_metadata: { item_id: claim.item_id },
    });

    return data as ItemClaim;
  },

  async reviewClaim(
    claimId: string,
    status: ClaimStatus,
    reviewerId: string,
    reviewerNotes: string
  ): Promise<ItemClaim | null> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('claims')
      .update({
        status,
        reviewer_id: reviewerId,
        reviewer_notes: reviewerNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      console.error('Supabase reviewClaim error:', error.message);
      throw new Error(error.message);
    }

    // If claim was approved, update target item status to 'claimed'
    if (status === 'approved' && data.item_id) {
      await supabase.from('items').update({ status: 'claimed' }).eq('id', data.item_id);
    }

    // Record decision in audit trail
    await this.logAudit({
      action: `CLAIM_${status.toUpperCase()}`,
      entity_type: 'claim',
      entity_id: claimId,
      safe_metadata: { status, reviewer_notes: reviewerNotes },
    });

    return data as ItemClaim;
  },

  // 4. NOTIFICATIONS
  async getNotifications(userId: string): Promise<CampusNotification[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getNotifications warning:', error.message);
      return [];
    }

    return (data || []) as CampusNotification[];
  },

  async markNotificationRead(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
  },

  // 5. AUDIT LOGS (Restricted to administrators)
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase getAuditLogs error:', error.message);
      throw new Error(error.message);
    }

    return (data || []) as AuditLogEntry[];
  },

  async logAudit(log: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from('audit_logs').insert([log]);
    } catch {
      // Safe fail
    }
  },
};
