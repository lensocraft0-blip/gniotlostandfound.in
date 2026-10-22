export type CampusRole = 'student' | 'faculty' | 'staff' | 'admin';

export type ReportType = 'lost' | 'found';

export type ItemCategory =
  | 'Phones & Electronics'
  | 'Student ID Cards'
  | 'Wallets & Bags'
  | 'Keys & Smart Fobs'
  | 'Books & Stationery'
  | 'Clothing & Accessories'
  | 'Bottles & Lunch Boxes'
  | 'Calculators & Gear'
  | 'Other Belongings';

export type ItemStatus = 'open' | 'potential_match' | 'claimed' | 'resolved' | 'archived';

export type ContactPreference = 'in_app' | 'email' | 'helpdesk';

export type MatchStatus = 'pending' | 'reviewed' | 'confirmed_match' | 'dismissed';

export type ClaimStatus = 'pending' | 'under_review' | 'evidence_requested' | 'approved' | 'rejected';

export type NotificationType =
  | 'match_found'
  | 'claim_submitted'
  | 'evidence_requested'
  | 'claim_approved'
  | 'claim_rejected'
  | 'status_changed'
  | 'admin_notice';

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  campus_role: CampusRole;
  student_identifier?: string;
  department?: string;
  avatar_path?: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemReport {
  id: string;
  owner_id: string;
  owner_name?: string;
  report_type: ReportType;
  title: string;
  category: ItemCategory;
  description: string;
  brand?: string;
  color?: string;
  event_date?: string;
  event_time?: string;
  reported_at: string;
  campus_location: string;
  campus_zone?: string;
  image_paths: string[];
  status: ItemStatus;
  contact_preference: ContactPreference;
  private_verification_question?: string;
  private_verification_answer?: string; // Strictly confidential, never shown publicly
  created_at: string;
  updated_at: string;
  is_local_draft?: boolean;
  draft_saved_at?: string;
}

export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  lost_item?: ItemReport;
  found_item?: ItemReport;
  score: number; // 0 to 100
  matching_attributes: string[];
  conflicting_attributes: string[];
  missing_information: string[];
  explanation: string;
  factor_breakdown?: {
    category_score: number;
    keyword_score: number;
    color_score: number;
    brand_score: number;
    location_score: number;
    date_score: number;
    contradiction_penalty: number;
  };
  status: MatchStatus;
  created_at: string;
}

export interface ItemClaim {
  id: string;
  item_id: string;
  item?: ItemReport;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  private_verification_answers: string; // Protected verification submission
  evidence_paths: string[];
  status: ClaimStatus;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CampusNotification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_item_id?: string;
  read_at?: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  safe_metadata: Record<string, unknown>;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  query?: string;
  category?: string;
  location?: string;
  report_type?: ReportType;
  created_at: string;
}
