import { ItemReport } from '../types/database';

const DRAFT_STORAGE_KEY = 'gniot_lf_report_drafts';
const PENDING_SYNC_QUEUE_KEY = 'gniot_lf_pending_sync';

export interface ReportDraft {
  id: string;
  report_type: 'lost' | 'found';
  title: string;
  category: string;
  description: string;
  brand?: string;
  color?: string;
  event_date?: string;
  event_time?: string;
  campus_location: string;
  campus_zone?: string;
  contact_preference: string;
  private_verification_question?: string;
  private_verification_answer?: string;
  image_previews?: string[];
  saved_at: string;
}

export interface SyncPendingItem {
  id: string;
  type: 'create_report' | 'submit_claim';
  payload: unknown;
  queued_at: string;
  retry_count: number;
  last_error?: string;
}

// 1. DRAFT MANAGEMENT
export function saveReportDraft(draft: Omit<ReportDraft, 'saved_at'>): ReportDraft {
  const drafts = getSavedDrafts();
  const existingIdx = drafts.findIndex((d) => d.id === draft.id);

  const fullDraft: ReportDraft = {
    ...draft,
    saved_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    drafts[existingIdx] = fullDraft;
  } else {
    drafts.unshift(fullDraft);
  }

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('LocalStorage quota or storage error when saving draft:', err);
  }

  return fullDraft;
}

export function getSavedDrafts(): ReportDraft[] {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function removeReportDraft(id: string): void {
  const drafts = getSavedDrafts().filter((d) => d.id !== id);
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('Error removing draft:', err);
  }
}

// 2. OFFLINE SYNC QUEUE
export function enqueueSyncAction(action: Omit<SyncPendingItem, 'queued_at' | 'retry_count'>): void {
  const queue = getPendingSyncQueue();
  const existingIdx = queue.findIndex((q) => q.id === action.id);

  const newItem: SyncPendingItem = {
    ...action,
    queued_at: new Date().toISOString(),
    retry_count: 0,
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }

  try {
    localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to queue offline sync action:', err);
  }
}

export function getPendingSyncQueue(): SyncPendingItem[] {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function removePendingSyncItem(id: string): void {
  const queue = getPendingSyncQueue().filter((q) => q.id !== id);
  try {
    localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Error removing sync queue item:', err);
  }
}

export function clearPendingSyncQueue(): void {
  try {
    localStorage.removeItem(PENDING_SYNC_QUEUE_KEY);
  } catch (err) {
    console.warn('Error clearing sync queue:', err);
  }
}

// 3. RETRY WITH BOUNDED EXPONENTIAL BACKOFF
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 800
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt) + Math.random() * 200, 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
